/**
 * Fuente única de las evidencias de la página Prueba Social. Agregar
 * contenido nuevo es solo añadir un objeto a uno de los dos arrays de abajo
 * — la página y los componentes de galería no se tocan.
 */

export interface ConversacionEvidencia {
  /** Nombre del archivo dentro de src/assets/prueba-social/conversaciones/ */
  archivo: string;
  alt: string;
  modelo?: string;
  servicio?: string;
}

export interface VideoEvidencia {
  youtubeId: string;
  titulo: string;
  descripcion?: string;
}

// PLACEHOLDER — reemplazar por capturas reales de conversaciones (con datos
// personales ya ocultos) antes de publicar. Cada `archivo` debe existir en
// src/assets/prueba-social/conversaciones/.
export const CONVERSACIONES: ConversacionEvidencia[] = [
  {
    archivo: "placeholder-1.webp",
    alt: "PLACEHOLDER — reemplazar por una captura real de conversación",
    modelo: "Epson L3250",
    servicio: "Reset remoto",
  },
  {
    archivo: "placeholder-2.webp",
    alt: "PLACEHOLDER — reemplazar por una captura real de conversación",
    modelo: "Canon G2110",
    servicio: "Reset asistido",
  },
  {
    archivo: "placeholder-3.webp",
    alt: "PLACEHOLDER — reemplazar por una captura real de conversación",
  },
];

// PLACEHOLDER — reemplazar por videos reales publicados en el canal de
// YouTube antes de publicar. El video de ejemplo usado aquí es un corto de
// dominio abierto (Blender Foundation), no un reset real.
export const VIDEOS: VideoEvidencia[] = [
  {
    youtubeId: "aqz-KE-bpKQ",
    titulo: "PLACEHOLDER — reemplazar por un video real de reset",
  },
];
