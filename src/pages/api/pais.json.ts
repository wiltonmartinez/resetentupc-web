import type { APIRoute } from "astro";

/**
 * Devuelve el código de país ISO (ej. "CO") del visitante, leído del borde
 * de Cloudflare (`request.cf.country`) — no requiere permiso del
 * navegador, a diferencia de la API de Geolocation, que este sitio ya
 * deshabilita a propósito vía `Permissions-Policy: geolocation=()` (ver
 * src/middleware.ts). On-demand (no getStaticPaths): el país solo se
 * conoce en el momento de la petición real, no en build time.
 */
export const prerender = false;

export const GET: APIRoute = (context) => {
  const cf = (context.request as unknown as { cf?: { country?: string } }).cf;
  const codigoPais = cf?.country ?? null;

  return new Response(JSON.stringify({ codigo_pais: codigoPais }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
};
