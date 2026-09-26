/**
 * Selección GLOBAL del visitante (marca / modelo / error) — una sola fuente de
 * verdad para TODO el sitio: si llega desde una página de modelo (ej. Epson
 * L1250) o la elige en /precios/, /cómo-funciona/ o el popup del botón
 * flotante, esa misma selección debe verse igual en el buscador de precios,
 * los botones de WhatsApp (incluido el flotante) y los mensajes que abren.
 *
 * Se guarda en localStorage con la clave de siempre (las páginas que aún la
 * leen por su cuenta siguen funcionando) y, además, AVISA del cambio con un
 * evento en la misma pestaña (y con el evento "storage" entre pestañas), para
 * que los módulos ya cargados se actualicen sin recargar la página ni depender
 * del orden en que corren los scripts.
 *
 * Formato: { marca: slug ("epson"|"canon"|"epson-sc"), modelo: nombre visible,
 * error: nombre visible } — nombres (no slugs) para modelo/error porque cada
 * página tiene su propio catálogo y hace su propio match por texto.
 */
export interface SeleccionGlobal {
  marca: string;
  modelo: string;
  error: string;
}

export const SELECCION_LS_KEY = "resetenlinea_seleccion_global_v1";
export const EVENTO_SELECCION = "seleccion-global-cambio";

export const LABEL_POR_MARCA: Record<string, string> = { epson: "Epson", canon: "Canon", "epson-sc": "Epson-SC" };

export function leerSeleccionGlobal(): SeleccionGlobal | null {
  try {
    const datos = JSON.parse(localStorage.getItem(SELECCION_LS_KEY) || "null");
    return datos && datos.marca ? { marca: datos.marca, modelo: datos.modelo ?? "", error: datos.error ?? "" } : null;
  } catch {
    return null;
  }
}

/** Guarda la selección y avisa a los demás módulos (solo si cambió de verdad). */
export function guardarSeleccionCompartida(datos: SeleccionGlobal): void {
  const nuevo = JSON.stringify({ marca: datos.marca, modelo: datos.modelo, error: datos.error });
  let anterior: string | null = null;
  try {
    anterior = localStorage.getItem(SELECCION_LS_KEY);
    if (anterior !== nuevo) localStorage.setItem(SELECCION_LS_KEY, nuevo);
  } catch {
    /* localStorage no disponible: la selección no persiste entre páginas, pero sí se avisa en ésta. */
  }
  if (anterior !== nuevo) window.dispatchEvent(new CustomEvent(EVENTO_SELECCION, { detail: datos }));
}

/** Llama a `alCambiar` cuando la selección cambia en esta página o en otra pestaña. */
export function alCambiarSeleccionGlobal(alCambiar: (seleccion: SeleccionGlobal | null) => void): void {
  window.addEventListener(EVENTO_SELECCION, () => alCambiar(leerSeleccionGlobal()));
  window.addEventListener("storage", (evento) => {
    if (evento.key === SELECCION_LS_KEY) alCambiar(leerSeleccionGlobal());
  });
}

/**
 * Mensaje de WhatsApp con la selección (misma regla que el botón flotante):
 * con marca conocida usa la plantilla "sin error" (marca + modelo), si no la
 * genérica. `{url}` es la página desde la que se escribe.
 */
export function construirMensajeWhatsApp(
  seleccion: SeleccionGlobal | null,
  plantillas: { sinError: string; generico: string },
  urlOrigen: string
): string {
  const marcaLabel = seleccion ? (LABEL_POR_MARCA[seleccion.marca] ?? "") : "";
  const plantilla = marcaLabel ? plantillas.sinError : plantillas.generico;
  return plantilla
    .replaceAll("{marca}", marcaLabel)
    .replaceAll("{modelo}", seleccion?.modelo ?? "")
    .replaceAll("{error}", seleccion?.error ?? "")
    .replaceAll("{url}", urlOrigen)
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([,.;:])/g, "$1");
}
