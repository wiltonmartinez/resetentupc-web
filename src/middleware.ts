import type { MiddlewareHandler } from "astro";
import modelos from "./data/modelos-muestra.json";
import { NUCLEO_API_BASE_URL, PAGE_SLUGS, RETIRED_LOCALES, USB_REDIRECTOR_DOWNLOAD_URL, type StaticPageKey } from "./config/site";

// slug retirado -> slug en español, por cada página estática con slug propio
// por idioma (precios, como-funciona, etc.) — las páginas dinámicas (home,
// prueba-social, reset/{marca}/{modelo}, ruleta) no necesitan este mapa:
// alcanza con quitarles el prefijo de idioma, ya que usan el mismo slug en
// todos los idiomas. Se construye desde RETIRED_LOCALES (no hardcodeado)
// para no desincronizarse si esa lista cambia.
const SLUG_ES_POR_IDIOMA_RETIRADO = new Map<string, Map<string, string>>(
  RETIRED_LOCALES.map((idioma) => [idioma, new Map<string, string>()])
);
for (const key of Object.keys(PAGE_SLUGS) as StaticPageKey[]) {
  const entry = PAGE_SLUGS[key];
  for (const idioma of RETIRED_LOCALES) {
    SLUG_ES_POR_IDIOMA_RETIRADO.get(idioma)!.set(entry[idioma], entry.es);
  }
}

function resolverRedireccionIdiomaRetirado(pathname: string): string | null {
  for (const idioma of RETIRED_LOCALES) {
    const prefijo = `/${idioma}`;
    if (pathname !== prefijo && !pathname.startsWith(`${prefijo}/`)) continue;

    const resto = pathname.slice(prefijo.length).replace(/^\/+|\/+$/g, "");
    if (!resto) return "/";

    const segmentos = resto.split("/");
    const slugEs = SLUG_ES_POR_IDIOMA_RETIRADO.get(idioma)?.get(segmentos[0]);
    if (slugEs) {
      const cola = segmentos.slice(1).join("/");
      return `/${slugEs}${cola ? "/" + cola : ""}/`;
    }
    // Rutas dinámicas (prueba-social, reset/{marca}/{modelo}, ruleta): mismo
    // slug en todos los idiomas, solo se le quita el prefijo.
    return `/${resto}/`;
  }
  return null;
}

/**
 * Redirige URLs viejas de WordPress a las páginas equivalentes del sitio nuevo.
 * Reglas basadas en patrones (no una lista fija) para que cualquier URL vieja
 * con la misma forma redirija correctamente, sin depender de una lista cerrada.
 * Cada destino se valida contra el catálogo real antes de redirigir: nunca
 * se redirige a una página que no existe.
 */

const pairs = new Set(modelos.map((m) => `${m.marcaSlug}/${m.modeloSlug}`));
const byModelo = new Map<string, string[]>();
for (const m of modelos) {
  const arr = byModelo.get(m.modeloSlug) ?? [];
  arr.push(m.marcaSlug);
  byModelo.set(m.modeloSlug, arr);
}
const marcasConocidas = [...new Set(modelos.map((m) => m.marcaSlug))].sort((a, b) => b.length - a.length);

function tryMatch(marcaRaw: string, modeloRaw: string): [string, string] | null {
  const marca = marcaRaw.toLowerCase();
  const modelo = modeloRaw.toLowerCase();
  if (pairs.has(`${marca}/${modelo}`)) return [marca, modelo];
  if (modelo.startsWith("sc-") && pairs.has(`${marca}/${modelo.slice(3)}`)) return [marca, modelo.slice(3)];
  const candidatos = byModelo.get(modelo);
  if (candidatos) {
    if (candidatos.includes(marca)) return [marca, modelo];
    if (candidatos.length === 1) return [candidatos[0], modelo];
  }
  return null;
}

function candidatosModelo(modeloParte: string): string[] {
  const tokens = modeloParte.split("-").filter(Boolean);
  const out: string[] = [];
  for (let n = 1; n <= Math.min(4, tokens.length); n++) out.push(tokens.slice(0, n).join("-"));
  const last = tokens[tokens.length - 1];
  if (tokens.length >= 2 && /^\d{1,2}$/.test(last)) out.push(tokens.slice(0, -1).join("-"));
  for (let start = 1; start < Math.min(3, tokens.length); start++) {
    out.push(tokens.slice(start, start + 2).join("-"));
    out.push(tokens[start]);
  }
  return out;
}

function extraerTrasPrefijo(slug: string, prefijos: string[]): [string, string] | null {
  for (const prefijo of prefijos) {
    if (!slug.startsWith(prefijo)) continue;
    let resto = slug.slice(prefijo.length).replace(/^-+/, "");
    for (const marca of marcasConocidas) {
      if (resto === marca) return [marca, ""];
      if (resto.startsWith(marca + "-")) return [marca, resto.slice(marca.length + 1)];
    }
  }
  return null;
}

function resolverDesdeSlug(slug: string, prefijos: string[]): string | null {
  const r = extraerTrasPrefijo(slug, prefijos);
  if (!r) return null;
  const [marcaGuess, modeloParte] = r;
  for (const cand of candidatosModelo(modeloParte)) {
    const m = tryMatch(marcaGuess, cand);
    if (m) return `/reset/${m[0]}/${m[1]}/`;
  }
  if (!modeloParte || /^\d{1,2}$/.test(modeloParte)) return "/";
  return null;
}

const STATIC_MAP: Record<string, string> = {
  contacto: "/contacto/",
  tecnico: "/como-funciona/",
  "asistente-tecnico": "/como-funciona/",
  usb: "/como-funciona/",
  modulo: "/como-funciona/",
  // Redireccion permanente SEO: enlaza directo al instalador, no a una
  // pagina interna. context.redirect() acepta URLs absolutas externas.
  "modulo-seguro": USB_REDIRECTOR_DOWNLOAD_URL,
  nosotros: "/",
  modalidad: "/",
  cupon: "/",
  "registro-de-resets": "/",
  "registro-de-casos-reales-de-exito": "/",
  "restablecer-la-contrasena": "/",
  "private-area": "/",
  licencias: "/",
  "licencias-antivirus": "/",
  licencia: "/",
  productos: "/",
  sabiduria: "/",
  trustpilot2: "/",
  "mundial-2026": "/",
  post: "/",
  referencias: "/",
};

// Rutas de WordPress/WooCommerce sin ningun equivalente real en el sitio
// nuevo (taxonomias de blog, area de cuenta de WooCommerce) — antes "tag" y
// "category" redirigian 301 a home, lo que Google puede leer como un patron
// de "soft 404" (cientos de URLs muertas consolidando señal en el home en
// vez de desaparecer). Se responde 410 Gone directo, sin pasar por Astro:
// la señal mas clara posible de "esto ya no existe y no va a volver".
const PRIMER_SEGMENTO_MUERTO = new Set(["tag", "category", "area-de-servicio"]);

function esRutaMuerta(pathname: string): boolean {
  const p = pathname.replace(/^\/+|\/+$/g, "");
  const primerSegmento = p.split("/", 1)[0];
  return PRIMER_SEGMENTO_MUERTO.has(primerSegmento);
}

function resolverRedireccion(pathname: string): string | null {
  const p = pathname.replace(/^\/+|\/+$/g, "");
  const segs = p.split("/").filter(Boolean);
  if (segs.length === 0) return null;

  // /reset/{marca}/{modelo}/ ya correcto -> sin cambios
  if (segs[0] === "reset" && segs.length === 3) {
    const [, marcaRaw, modeloRaw] = segs;
    const m = tryMatch(marcaRaw, modeloRaw);
    if (m) {
      // tryMatch puede "corregir" la marca (ej. un modelo reclasificado de
      // una marca a otra) vía el fallback de candidato único — si el par
      // resuelto no es exactamente el de la URL, hay que redirigir, no
      // dar por buena la URL vieja.
      const corregido = `/reset/${m[0]}/${m[1]}/`;
      if (corregido === `/reset/${marcaRaw.toLowerCase()}/${modeloRaw.toLowerCase()}/`) return null;
      return corregido;
    }
    // ej. /reset/epson-sc-plotter/sc-f570/ -> marca compuesta + modelo con prefijo "sc-"
    if (modeloRaw.startsWith("sc-")) {
      const m2 = tryMatch("epson-sc", modeloRaw.slice(3));
      if (m2) return `/reset/${m2[0]}/${m2[1]}/`;
    }
    for (const marca of marcasConocidas) {
      if (marcaRaw.startsWith(marca)) {
        const m3 = tryMatch(marca, modeloRaw);
        if (m3) return `/reset/${m3[0]}/${m3[1]}/`;
      }
    }
    return "/"; // familia/listado sin modelo real -> home (no existe pagina de marca aun)
  }

  // /reset/{marca}/{familia}/{modelo}/ -> dropear familia
  if (segs[0] === "reset" && segs.length === 4) {
    const [, marcaRaw, familia, modeloRaw] = segs;
    let m = tryMatch(marcaRaw, modeloRaw);
    if (m) return `/reset/${m[0]}/${m[1]}/`;
    const combo = `${marcaRaw}-${familia}`;
    for (const marca of marcasConocidas) {
      if (combo.startsWith(marca)) {
        m = tryMatch(marca, modeloRaw);
        if (m) return `/reset/${m[0]}/${m[1]}/`;
      }
    }
    if (modeloRaw.startsWith("sc-")) {
      m = tryMatch("epson-sc", modeloRaw.slice(3));
      if (m) return `/reset/${m[0]}/${m[1]}/`;
    }
    return "/";
  }

  // /reset/reset-{...}-{marca}-{modelo}/ (antes del caso general de 2 segmentos)
  if (segs[0] === "reset" && segs.length === 2 && segs[1].startsWith("reset-")) {
    const target = resolverDesdeSlug(segs[1], ["reset-almohadillas-", "reset-5b00-", "reset-"]);
    return target ?? "/";
  }

  // /reset/{marca-compuesta}/ (2 segs) -> listado de familia, sin pagina real -> home
  if (segs[0] === "reset" && segs.length === 2) return "/";

  // /reset-en-linea/...
  if (segs[0] === "reset-en-linea") {
    if (segs.length === 1) return "/";
    const slug = segs[1];
    if (slug === "page") return "/";
    const target = resolverDesdeSlug(slug, ["servicio-reset-online-", "servicio-reset-", "reset-almohadillas-", "reset-"]);
    if (target) return target;
    if (marcasConocidas.includes(slug)) return "/";
    return "/";
  }

  // /reset-online-{marca}-{modelo}/
  if (segs.length === 1 && segs[0].startsWith("reset-online-")) {
    const target = resolverDesdeSlug(segs[0], ["reset-online-"]);
    return target ?? "/";
  }

  // /reset-almohadillas-{marca}-{modelo}/
  if (segs.length === 1 && segs[0].startsWith("reset-almohadillas-")) {
    const target = resolverDesdeSlug(segs[0], ["reset-almohadillas-"]);
    return target ?? "/";
  }

  // /reset-impresora/{resets|testimonios|revisiones}/{slug}/
  if (segs[0] === "reset-impresora" && segs.length >= 3) {
    const target = resolverDesdeSlug(segs[2], [
      "servicio-reset-online-",
      "servicio-reset-",
      "revision-para-reset-",
      "reset-",
    ]);
    return target ?? "/";
  }

  // /resets/... /revisiones/... /casos/... /testimonios/...
  if (["resets", "revisiones", "casos", "testimonios"].includes(segs[0]) && segs.length >= 2) {
    const target = resolverDesdeSlug(segs[1], [
      "revision-para-reset-",
      "caso-real-reset-",
      "proceso-reset-online-por-servidor-asistido-impresoras-",
      "reset-",
    ]);
    return target ?? "/";
  }

  if (segs[0].startsWith("solucion-")) return "/";

  if (segs[0] === "faq") return "/preguntas-frecuentes/";

  if (segs[0] === "wp-content") return null; // archivos, sin redireccion

  if (segs[0] in STATIC_MAP) return STATIC_MAP[segs[0]];

  return null;
}

/**
 * Cabeceras de seguridad aplicadas a toda respuesta HTML. El sitio depende de
 * varios scripts inline por componente (Astro no los firma con nonce por
 * defecto), así que script-src/style-src necesitan 'unsafe-inline' — no es
 * una CSP estricta, pero sí limita qué ORÍGENES externos pueden cargar
 * recursos, lo cual ya mitiga inyección de script/imagen/iframe de terceros
 * no listados aquí. Lista de orígenes basada en los widgets/CDNs reales que
 * usa el sitio (Trustpilot, YouTube-nocookie, la ruleta y Núcleo en
 * subdominios de resetalmohadillas.com, jsDelivr para intl-tel-input).
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://*.trustpilot.com https://static.cloudflareinsights.com https://*.crisp.chat https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://*.crisp.chat",
  "img-src 'self' data: https:",
  "font-src 'self' data: https://cdn.jsdelivr.net https://*.crisp.chat",
  "connect-src 'self' https://nucleo.resetalmohadillas.com https://atajos.resetalmohadillas.com https://*.trustpilot.com https://cloudflareinsights.com https://*.crisp.chat https://*.relay.crisp.chat wss://*.crisp.chat wss://*.relay.crisp.chat https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
  "frame-src https://ruleta.resetalmohadillas.com https://nucleo.resetalmohadillas.com https://www.youtube-nocookie.com https://*.trustpilot.com https://*.crisp.chat",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://atajos.resetalmohadillas.com",
  "frame-ancestors 'self'",
].join("; ");

/**
 * Control de acceso por riesgo (país / IP puntual / datacenter conocido) —
 * las reglas viven en Núcleo (tabla editable desde /seguridad-bloqueos/,
 * NUNCA hardcodeadas acá), este middleware solo las lee y las aplica en el
 * borde de Cloudflare, antes de renderizar cualquier página. País y
 * organización del ASN vienen gratis en request.cf en cualquier plan de
 * Cloudflare (sin llamada externa por visita) — ver api/pais.json.ts para
 * el mismo patrón de lectura de request.cf. La detección de VPN/proxy
 * comercial NO se hace acá (necesitaría una consulta geoip por visita, muy
 * cara para el volumen de páginas vistas): esa capa vive solo del lado de
 * Núcleo, en el envío de datos de pago (enviar-cotizacion), que es de bajo
 * volumen y ya está limitado a 5 intentos/hora/IP.
 */
interface ReglasBloqueo {
  paises: Set<string>;
  ips: Set<string>;
  datacenterPalabrasClave: string[];
  bloqueoDatacenterActivo: boolean;
}

const REGLAS_BLOQUEO_TTL_MS = 5 * 60 * 1000; // 5 minutos
let reglasBloqueoCache: { reglas: ReglasBloqueo; obtenidoEn: number } | null = null;

async function obtenerReglasBloqueo(): Promise<ReglasBloqueo | null> {
  if (reglasBloqueoCache && Date.now() - reglasBloqueoCache.obtenidoEn < REGLAS_BLOQUEO_TTL_MS) {
    return reglasBloqueoCache.reglas;
  }

  try {
    const opciones = {
      // Cachea también a nivel del borde de Cloudflare (no solo en esta
      // instancia del Worker) — así ni siquiera hace falta que el mismo
      // isolate siga vivo entre una visita y la siguiente.
      cf: { cacheTtl: 300, cacheEverything: true },
    } as unknown as RequestInit;
    const res = await fetch(`${NUCLEO_API_BASE_URL}/api/public/reglas-bloqueo/`, opciones);
    if (!res.ok) return reglasBloqueoCache?.reglas ?? null;

    const datos = (await res.json()) as {
      paises?: string[];
      ips?: string[];
      datacenter_palabras_clave?: string[];
      bloqueo_datacenter_activo?: boolean;
    };
    const reglas: ReglasBloqueo = {
      paises: new Set((datos.paises ?? []).map((p) => p.toUpperCase())),
      ips: new Set(datos.ips ?? []),
      datacenterPalabrasClave: datos.datacenter_palabras_clave ?? [],
      bloqueoDatacenterActivo: datos.bloqueo_datacenter_activo ?? false,
    };
    reglasBloqueoCache = { reglas, obtenidoEn: Date.now() };
    return reglas;
  } catch {
    // Núcleo inalcanzable: falla ABIERTO (no bloquea a nadie) — que el
    // sitio público nunca dependa de la disponibilidad de Núcleo para
    // poder cargar. Si hay una cache vieja, mejor usarla que nada.
    return reglasBloqueoCache?.reglas ?? null;
  }
}

/**
 * Manda el bloqueo al mismo log que ve /seguridad-bloqueos/ — "fire and
 * forget" pero SÍ esperado (await) porque esto solo corre en el camino de
 * una petición ya bloqueada (nunca en el camino normal de una visita real),
 * así que la latencia extra no le pega a ningún visitante legítimo.
 */
async function registrarBloqueoRemoto(ip: string, paisIso: string, motivo: string, pagina: string): Promise<void> {
  try {
    await fetch(`${NUCLEO_API_BASE_URL}/api/public/registrar-bloqueo/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, pais_iso: paisIso, motivo, pagina }),
    });
  } catch {
    // No hay nada más que hacer si ni el log se puede mandar — el visitante
    // ya recibió el 403 igual.
  }
}

function respuestaAccesoRestringido(): Response {
  const headers = new Headers({ "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" });
  aplicarCabecerasSeguridad(headers);
  return new Response(
    "<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\"><title>Acceso restringido</title>" +
      '<meta name="viewport" content="width=device-width, initial-scale=1"></head>' +
      '<body style="font-family:system-ui,sans-serif;max-width:560px;margin:15vh auto;padding:0 20px;text-align:center;color:#222;">' +
      "<h1>Acceso restringido</h1>" +
      "<p>Por motivos de seguridad, no podemos ofrecer el servicio desde tu región o conexión actual.</p>" +
      "</body></html>",
    { status: 403, headers }
  );
}

function aplicarCabecerasSeguridad(headers: Headers): void {
  headers.set("Content-Security-Policy", CSP);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "geolocation=(), camera=(), microphone=(), payment=()");
  headers.set("X-Frame-Options", "SAMEORIGIN");
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith("/_") || pathname.startsWith("/wp-content")) return next();

  const cf = (context.request as unknown as { cf?: { country?: string; asOrganization?: string } }).cf;
  const paisVisitante = (cf?.country ?? "").toUpperCase();
  const asOrganization = cf?.asOrganization ?? "";
  const ipVisitante = context.request.headers.get("cf-connecting-ip") ?? "";

  const reglasBloqueo = await obtenerReglasBloqueo();
  if (reglasBloqueo) {
    let motivoBloqueo: "ip_bloqueada" | "pais_restringido" | "datacenter_ip" | null = null;

    if (ipVisitante && reglasBloqueo.ips.has(ipVisitante)) {
      motivoBloqueo = "ip_bloqueada";
    } else if (paisVisitante && reglasBloqueo.paises.has(paisVisitante)) {
      motivoBloqueo = "pais_restringido";
    } else if (
      reglasBloqueo.bloqueoDatacenterActivo &&
      asOrganization &&
      reglasBloqueo.datacenterPalabrasClave.some((palabra) => asOrganization.toLowerCase().includes(palabra.toLowerCase()))
    ) {
      motivoBloqueo = "datacenter_ip";
    }

    if (motivoBloqueo) {
      await registrarBloqueoRemoto(ipVisitante, paisVisitante, motivoBloqueo, pathname);
      return respuestaAccesoRestringido();
    }
  }

  const destinoIdiomaRetirado = resolverRedireccionIdiomaRetirado(pathname);
  if (destinoIdiomaRetirado) {
    return context.redirect(destinoIdiomaRetirado, 301);
  }

  if (esRutaMuerta(pathname)) {
    const headers = new Headers({ "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" });
    aplicarCabecerasSeguridad(headers);
    return new Response(
      "<!doctype html><title>410 Gone</title><p>Esta página ya no existe y no fue reemplazada.</p>",
      { status: 410, headers }
    );
  }

  const destino = resolverRedireccion(pathname);
  if (destino && destino !== pathname) {
    return context.redirect(destino, 301);
  }

  const response = await next();
  aplicarCabecerasSeguridad(response.headers);
  return response;
};
