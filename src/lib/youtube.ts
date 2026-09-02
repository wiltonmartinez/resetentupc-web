/**
 * Extrae el ID de video de cualquier URL estándar de YouTube
 * (watch?v=, youtu.be/, /embed/, /shorts/) o, si ya es un ID puro
 * de 11 caracteres, lo devuelve tal cual.
 */
export function extractYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#/]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Construye la URL de embebido para un ID de YouTube. Usa el dominio
 * youtube-nocookie.com (modo privacy-enhanced) porque es el único
 * origen de YouTube autorizado en el frame-src del CSP del sitio
 * (ver src/middleware.ts y public/_headers) — un <iframe> apuntando
 * a www.youtube.com/embed/ es bloqueado por el propio navegador antes
 * de llegar a X-Frame-Options de YouTube.
 */
export function buildYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
