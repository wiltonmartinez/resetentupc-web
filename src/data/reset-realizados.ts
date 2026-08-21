/**
 * Fuente de las evidencias de "Resets Realizados": videos reales grabados
 * con ShareX y publicados en YouTube (16:9, nunca Shorts). Cuando la API de
 * Núcleo esté lista, este archivo se reemplaza por el fetch — la forma de
 * los datos ya coincide con el contrato acordado.
 */

export interface ResetRealizadoEvidencia {
  /** Slug estable, se usa tal cual como URL pública. */
  slug: string;
  titulo: string;
  youtubeId: string;
  marca: string;
  modelo: string;
  /** Mismo campo "error" que el resto del sitio (ej. "Almohadillas", "5B00"). */
  error: string;
  pais: string;
  duracionSegundos: number;
  descripcion?: string;
  fecha?: string;
}

// PLACEHOLDER — reemplazar por videos reales publicados en el canal de
// YouTube antes de publicar. El video de ejemplo usado aquí es un corto de
// dominio abierto (Blender Foundation), no un reset real.
export const RESETS_REALIZADOS: ResetRealizadoEvidencia[] = [
  {
    slug: "epson-l220-almohadillas-colombia-18segundos",
    titulo: "PLACEHOLDER — reemplazar por un video real de reset",
    youtubeId: "aqz-KE-bpKQ",
    marca: "Epson",
    modelo: "L220",
    error: "Almohadillas",
    pais: "Colombia",
    duracionSegundos: 18,
    fecha: "2026-08-15",
  },
];
