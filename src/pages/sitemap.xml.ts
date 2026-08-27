import type { APIRoute } from "astro";
import { SUPPORTED_LOCALES, type StaticPageKey } from "../config/site";
import {
  buildCanonicalUrl,
  buildHreflangLinks,
  buildStaticPageCanonical,
  buildStaticPageHreflangLinks,
  type HreflangLink,
} from "../i18n/utils";
import modelos from "../data/modelos-muestra.json";

const STATIC_PAGE_KEYS: StaticPageKey[] = [
  "comoFunciona",
  "preguntasFrecuentes",
  "contacto",
  "terminosCondiciones",
  "consultaGarantia",
];
const MODEL_PATHS = modelos.map((modelo) => `/reset/${modelo.marcaSlug}/${modelo.modeloSlug}/`);
// Los listados de Prueba Social (a diferencia de ruleta/404) sí son indexables:
// contienen evidencia real (conversaciones, videos, reseñas) que ayuda a SEO y
// confianza. Las páginas de detalle individuales ([slug]) no se listan aquí
// porque su contenido viene de una API externa en tiempo real, no de un dataset
// estático como modelos-muestra.json — siguen siendo rastreables por enlace
// interno, solo no se declaran de antemano en el sitemap.
const PRUEBA_SOCIAL_PATHS = [
  "/prueba-social/",
  "/prueba-social/cliente-satisfecho/",
  "/prueba-social/reset-evidencia/",
  "/prueba-social/testimonios-truspilot/",
];

function alternatesXml(alternates: HreflangLink[]): string {
  return alternates
    .map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`)
    .join("\n");
}

function urlEntriesForPath(path: string): string {
  const xml = alternatesXml(buildHreflangLinks(path));
  return SUPPORTED_LOCALES.map((locale) => {
    const loc = buildCanonicalUrl(locale, path);
    return `  <url>\n    <loc>${loc}</loc>\n${xml}\n  </url>`;
  }).join("\n");
}

function urlEntriesForStaticPage(pageKey: StaticPageKey): string {
  const xml = alternatesXml(buildStaticPageHreflangLinks(pageKey));
  return SUPPORTED_LOCALES.map((locale) => {
    const loc = buildStaticPageCanonical(locale, pageKey);
    return `  <url>\n    <loc>${loc}</loc>\n${xml}\n  </url>`;
  }).join("\n");
}

export const GET: APIRoute = () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntriesForPath("/")}
${STATIC_PAGE_KEYS.map(urlEntriesForStaticPage).join("\n")}
${PRUEBA_SOCIAL_PATHS.map(urlEntriesForPath).join("\n")}
${MODEL_PATHS.map(urlEntriesForPath).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
