/**
 * Selector de vendedores para CUALQUIER enlace de WhatsApp del sitio.
 *
 * Al hacer clic en un enlace `https://wa.me/<número>?text=…` (botones de
 * precio, "Ver Formas de Pago", notificaciones de compra, Prueba Social…) en
 * vez de ir directo al número fijo se abre esta ventana con los vendedores EN
 * HORARIO ahora mismo para el país del visitante (o "Global") — el mismo
 * endpoint /vendedores/ de Núcleo que ya usan el botón flotante
 * (ContactHub.astro) y WhatsAppCTA.astro. El mensaje del enlace original
 * (marca/modelo/plan/precio…) se conserva y solo cambia el destinatario.
 *
 * Es un único listener delegado en `document`: los enlaces que se crean
 * después con JavaScript (las tarjetas de precio) funcionan sin tocarlos.
 * Quedan fuera los enlaces que YA apuntan a un vendedor concreto (los del menú
 * del botón flotante, de WhatsAppCTA y de "Nuestro equipo"): ver
 * esEnlaceDeVendedor(). Si Núcleo no responde o no hay nadie en horario, la
 * ventana ofrece "Escribir por WhatsApp" con el número del enlace original —
 * nunca se pierde el contacto.
 */
import { NUCLEO_API_BASE_URL } from "../config/site";
import banderaCL from "../assets/flag/CHILE.png";
import banderaCO from "../assets/flag/COLOMBIA.png";
import banderaEC from "../assets/flag/ECUADOR.png";
import banderaGT from "../assets/flag/GUATEMALA.png";
import banderaMX from "../assets/flag/MEXICO.png";
import banderaPE from "../assets/flag/PERU.png";
import banderaGlobal from "../assets/flag/GLOBAL.png";
import "./selector-vendedores.css";

interface VendedorPublico {
  nombre: string;
  whatsapp: string;
  foto?: string;
  roles?: string[];
  pais_iso?: string;
  en_linea_restante?: string;
}

const BANDERAS_POR_ISO: Record<string, ImageMetadata> = {
  CL: banderaCL,
  CO: banderaCO,
  EC: banderaEC,
  GT: banderaGT,
  MX: banderaMX,
  PE: banderaPE,
  ZZ: banderaGlobal,
};

// Solo enlaces a un NÚMERO ("wa.me/57300…"): los de compartir ("wa.me/?text=")
// no llevan número y no son un contacto con el negocio.
const ENLACE_WHATSAPP = /^https:\/\/wa\.me\/\d+/;

// Enlaces que ya son de un vendedor puntual (o el menú mismo): no se
// interceptan, o se abriría un selector encima de otro.
const SELECTOR_ENLACE_DE_VENDEDOR =
  "[data-selector-vendedores-omitir], [data-whatsapp-menu-link], .contact-hub-menu, .whatsapp-cta-menu, .selector-vendedores";

function textos() {
  const el = document.querySelector<HTMLElement>("[data-selector-vendedores-textos]");
  return {
    titulo: el?.dataset.titulo || "¿Con quién quieres hablar?",
    cerrar: el?.dataset.cerrar || "Cerrar",
    cargando: el?.dataset.cargando || "Buscando asesores disponibles…",
    vacio: el?.dataset.vacio || "En este momento no hay nadie disponible.",
    general: el?.dataset.general || "Escribir por WhatsApp",
  };
}

// Tracking propio de clics (mismo endpoint que ContactHub.astro/WhatsAppCTA):
// "fire and forget", nunca debe demorar ni romper la experiencia.
function registrarClicWhatsApp(boton: string, vendedor: string): void {
  fetch("/api/pais.json", { cache: "no-store" })
    .then((res) => res.json())
    .then((datosPais: { codigo_pais?: string | null }) =>
      fetch(`${NUCLEO_API_BASE_URL}/api/public/clics-whatsapp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boton,
          pagina: location.pathname,
          pais_iso: (datosPais.codigo_pais || "").toUpperCase(),
          vendedor,
        }),
      })
    )
    .catch(() => {});
}

let vendedoresPromesa: Promise<VendedorPublico[]> | null = null;

function cargarVendedores(): Promise<VendedorPublico[]> {
  vendedoresPromesa ??= fetch("/api/pais.json", { cache: "no-store" })
    .then((res) => res.json())
    .then((datosPais: { codigo_pais?: string | null }) => {
      const paisIso = (datosPais.codigo_pais || "").toUpperCase();
      if (!/^[A-Z]{2}$/.test(paisIso)) return [];
      return fetch(`${NUCLEO_API_BASE_URL}/api/public/vendedores/?pais_iso=${paisIso}`)
        .then((res) => res.json())
        .then((datos: { data?: VendedorPublico[] }) => (Array.isArray(datos?.data) ? datos.data : []));
    })
    .catch(() => [] as VendedorPublico[])
    .then((lista) => {
      // Una lista vacía (nadie en horario / error) no se recuerda: el próximo
      // clic vuelve a preguntar.
      if (lista.length === 0) vendedoresPromesa = null;
      return lista;
    });
  return vendedoresPromesa;
}

function crearItem(vendedor: VendedorPublico, mensaje: string, boton: string, cerrar: () => void): HTMLAnchorElement {
  const link = document.createElement("a");
  link.className = "selector-vendedores-item";
  link.href = `https://wa.me/${vendedor.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer nofollow";
  link.addEventListener("click", () => {
    registrarClicWhatsApp(boton, vendedor.nombre);
    cerrar();
  });

  const avatar = document.createElement("span");
  avatar.className = "selector-vendedores-avatar";
  if (vendedor.foto) {
    const img = document.createElement("img");
    img.src = vendedor.foto;
    img.alt = "";
    avatar.appendChild(img);
  } else {
    avatar.textContent = vendedor.nombre.charAt(0);
  }

  const info = document.createElement("span");
  info.className = "selector-vendedores-info";

  const nombre = document.createElement("span");
  nombre.className = "selector-vendedores-nombre";
  nombre.textContent = vendedor.nombre;
  info.appendChild(nombre);

  if (vendedor.roles && vendedor.roles.length) {
    const rol = document.createElement("span");
    rol.className = "selector-vendedores-rol";
    rol.textContent = vendedor.roles.join(", ");
    info.appendChild(rol);
  }

  // El endpoint solo devuelve vendedores EN HORARIO ahora mismo.
  const online = document.createElement("span");
  online.className = "selector-vendedores-online";
  online.textContent = vendedor.en_linea_restante ? `ONLINE · ${vendedor.en_linea_restante}` : "ONLINE";
  info.appendChild(online);

  const numero = document.createElement("span");
  numero.className = "selector-vendedores-numero";
  const banderaUrl = vendedor.pais_iso ? (BANDERAS_POR_ISO[vendedor.pais_iso.toUpperCase()]?.src ?? null) : null;
  if (banderaUrl) {
    const bandera = document.createElement("img");
    bandera.src = banderaUrl;
    bandera.alt = "";
    numero.appendChild(bandera);
  }
  numero.appendChild(document.createTextNode(`+${vendedor.whatsapp}`));
  info.appendChild(numero);

  link.append(avatar, info);
  return link;
}

let dialogo: HTMLDialogElement | null = null;
let listaEl: HTMLElement | null = null;
let estadoEl: HTMLElement | null = null;
let tituloEl: HTMLElement | null = null;
let cerrarEl: HTMLButtonElement | null = null;

function obtenerDialogo(): HTMLDialogElement {
  if (dialogo) return dialogo;

  dialogo = document.createElement("dialog");
  dialogo.className = "selector-vendedores";
  dialogo.setAttribute("aria-labelledby", "selector-vendedores-titulo");

  const caja = document.createElement("div");
  caja.className = "selector-vendedores-caja";

  cerrarEl = document.createElement("button");
  cerrarEl.type = "button";
  cerrarEl.className = "selector-vendedores-cerrar";
  cerrarEl.textContent = "×";
  cerrarEl.addEventListener("click", () => dialogo?.close());

  tituloEl = document.createElement("h2");
  tituloEl.id = "selector-vendedores-titulo";

  estadoEl = document.createElement("p");
  estadoEl.className = "selector-vendedores-estado";

  listaEl = document.createElement("div");
  listaEl.className = "selector-vendedores-lista";

  caja.append(cerrarEl, tituloEl, estadoEl, listaEl);
  dialogo.appendChild(caja);
  // Clic en el fondo oscuro (fuera de la caja) cierra.
  dialogo.addEventListener("click", (evento) => {
    if (evento.target === dialogo) dialogo?.close();
  });
  document.body.appendChild(dialogo);
  return dialogo;
}

async function abrirSelector(hrefOriginal: string, boton: string): Promise<void> {
  const dlg = obtenerDialogo();
  const tx = textos();
  if (!listaEl || !estadoEl || !tituloEl || !cerrarEl) return;

  let mensaje = "";
  try {
    mensaje = new URL(hrefOriginal).searchParams.get("text") ?? "";
  } catch {
    /* href raro: se abre igual, con el mensaje vacío */
  }

  tituloEl.textContent = tx.titulo;
  cerrarEl.setAttribute("aria-label", tx.cerrar);
  listaEl.replaceChildren();
  estadoEl.textContent = tx.cargando;
  estadoEl.hidden = false;
  if (!dlg.open) dlg.showModal();

  const vendedores = await cargarVendedores();
  if (!dlg.open) return; // lo cerraron mientras cargaba

  listaEl.replaceChildren();
  if (vendedores.length === 0) {
    // Nadie en horario o Núcleo caído: no se deja al visitante sin salida —
    // se ofrece el número del enlace original.
    estadoEl.textContent = tx.vacio;
    const general = document.createElement("a");
    general.className = "selector-vendedores-general";
    general.href = hrefOriginal;
    general.target = "_blank";
    general.rel = "noopener noreferrer nofollow";
    general.textContent = tx.general;
    general.addEventListener("click", () => {
      registrarClicWhatsApp(boton, "");
      dlg.close();
    });
    listaEl.appendChild(general);
    return;
  }

  estadoEl.hidden = true;
  vendedores.forEach((vendedor) => listaEl!.appendChild(crearItem(vendedor, mensaje, boton, () => dlg.close())));
}

function esEnlaceDeVendedor(enlace: HTMLAnchorElement): boolean {
  return enlace.closest(SELECTOR_ENLACE_DE_VENDEDOR) !== null;
}

function iniciar(): void {
  const marca = "__selectorVendedoresIniciado";
  const w = window as unknown as Record<string, boolean>;
  if (w[marca]) return;
  w[marca] = true;

  document.addEventListener("click", (evento) => {
    if (evento.defaultPrevented || evento.button !== 0) return;
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return; // nueva pestaña: enlace normal
    const enlace = (evento.target as Element | null)?.closest?.("a");
    if (!enlace || !ENLACE_WHATSAPP.test(enlace.href) || esEnlaceDeVendedor(enlace)) return;

    evento.preventDefault();
    void abrirSelector(enlace.href, enlace.dataset.sourceId || "whatsapp_enlace");
  });

  // Precarga en reposo: el primer clic ya encuentra la lista lista.
  window.setTimeout(() => void cargarVendedores(), 2500);
}

iniciar();
