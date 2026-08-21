/**
 * Duración real de un video de YouTube vía la API pública de datos (solo
 * lectura, API key simple — nunca OAuth). La clave se lee de una variable de
 * entorno/secreto de Cloudflare (`YOUTUBE_API_KEY`), nunca hardcodeada aquí.
 */
export async function obtenerDuracionYoutube(youtubeId: string, apiKey: string): Promise<string | null> {
  try {
    const respuesta = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(youtubeId)}&part=contentDetails&key=${apiKey}`
    );
    if (!respuesta.ok) return null;
    const datos = (await respuesta.json()) as {
      items?: Array<{ contentDetails?: { duration?: string } }>;
    };
    const iso = datos.items?.[0]?.contentDetails?.duration;
    return iso ? formatearDuracionIso8601(iso) : null;
  } catch {
    return null;
  }
}

/** Convierte "PT1M23S" (ISO 8601) a "1:23" o "45 segundos" si dura menos de un minuto. */
function formatearDuracionIso8601(iso: string): string {
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return iso;
  const horas = Number(match[1] ?? 0);
  const minutos = Number(match[2] ?? 0);
  const segundos = Number(match[3] ?? 0);
  const totalSegundos = horas * 3600 + minutos * 60 + segundos;

  if (totalSegundos < 60) return `${totalSegundos} segundos`;

  const mm = Math.floor(totalSegundos / 60);
  const ss = totalSegundos % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}
