import type { MiddlewareHandler } from "astro";
import modelos from "./data/modelos-muestra.json";

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
  tag: "/",
  category: "/",
  referencias: "/",
};

function resolverRedireccion(pathname: string): string | null {
  const p = pathname.replace(/^\/+|\/+$/g, "");
  const segs = p.split("/").filter(Boolean);
  if (segs.length === 0) return null;

  // /reset/{marca}/{modelo}/ ya correcto -> sin cambios
  if (segs[0] === "reset" && segs.length === 3) {
    const [, marcaRaw, modeloRaw] = segs;
    const m = tryMatch(marcaRaw, modeloRaw);
    if (m) return null;
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
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://*.trustpilot.com",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "img-src 'self' data: https:",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "connect-src 'self' https://nucleo.resetalmohadillas.com https://atajos.resetalmohadillas.com https://*.trustpilot.com",
  "frame-src https://ruleta.resetalmohadillas.com https://nucleo.resetalmohadillas.com https://www.youtube-nocookie.com https://*.trustpilot.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://atajos.resetalmohadillas.com",
  "frame-ancestors 'self'",
].join("; ");

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

  const destino = resolverRedireccion(pathname);
  if (destino && destino !== pathname) {
    return context.redirect(destino, 301);
  }

  const response = await next();
  aplicarCabecerasSeguridad(response.headers);
  return response;
};
