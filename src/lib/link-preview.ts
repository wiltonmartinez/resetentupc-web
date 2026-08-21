/**
 * Vista previa tipo "link preview" (misma técnica que WhatsApp/Slack al
 * pegar un link): lee las metaetiquetas Open Graph de la página real, sin
 * intentar embeberla (Trustpilot bloquea el framing con una pantalla de
 * verificación anti-bot). El resultado se cachea 300s en el edge de
 * Cloudflare vía `cf.cacheTtl` — og:image no cambia, así que no hace falta
 * golpear Trustpilot en cada visita.
 */
const CACHE_TTL_SEGUNDOS = 300;

export interface LinkPreview {
  title: string | null;
  description: string | null;
  image: string | null;
}

function extraerMetaTag(html: string, propiedad: string): string | null {
  const patrones = [
    new RegExp(`<meta[^>]+property=["']${propiedad}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${propiedad}["']`, "i"),
  ];
  for (const patron of patrones) {
    const match = html.match(patron);
    if (match) return decodeEntidadesHtml(match[1]);
  }
  return null;
}

function decodeEntidadesHtml(texto: string): string {
  return texto
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export async function obtenerLinkPreview(url: string): Promise<LinkPreview | null> {
  try {
    const respuesta = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ResetEnLineaLinkPreview/1.0)" },
      // Opción específica del runtime de Cloudflare Workers: cachea esta
      // sub-petición en el edge, no solo en el navegador del visitante.
      cf: { cacheTtl: CACHE_TTL_SEGUNDOS, cacheEverything: true },
    } as RequestInit);
    if (!respuesta.ok) return null;
    const html = await respuesta.text();
    return {
      title: extraerMetaTag(html, "og:title"),
      description: extraerMetaTag(html, "og:description"),
      image: extraerMetaTag(html, "og:image"),
    };
  } catch {
    return null;
  }
}
