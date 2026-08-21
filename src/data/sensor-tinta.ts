/**
 * Recursos de "sensor de tinta" (ubicación + limpio/sucio) por MARCA, no por
 * modelo — son diagramas del manual de servicio y fotos reales del sensor
 * físico, comunes a toda la familia Epson-SC (large-format), no específicos
 * de un modelo puntual. Agregar otra marca a futuro es agregar otra entrada
 * acá, sin tocar componentes ni lógica de presentación.
 *
 * Los nombres de archivo son exactamente los que existen hoy en
 * src/assets/sensor-tinta-{ubicacion,limpio,sucio}/ — no inventar ninguno.
 */
export interface SensorTintaRecursos {
  ubicacion: string[];
  limpio: string[];
  sucio: string[];
}

export const SENSOR_TINTA_POR_MARCA: Record<string, SensorTintaRecursos> = {
  "epson-sc": {
    ubicacion: [
      "ubicacion-sensor.jpeg",
      "1nP1K2QrXM.png",
      "FemA9abPEL.png",
      "JYYGp3z9yU.png",
      "VU9q32SKQf.png",
      "iJsVhZX99F.png",
      "WhatsApp Image 2022-04-28 at 1.28.49 PM.jpeg",
    ],
    limpio: ["01.jpeg", "02.jpg", "03.png", "04.jpeg", "05.jpeg", "06.jpeg", "07.jpeg"],
    sucio: ["01.jpg", "02.png", "03.png", "04.jpeg", "05.jpeg", "06.png"],
  },
};

export function getSensorTintaParaMarca(marcaSlug: string): SensorTintaRecursos | null {
  return SENSOR_TINTA_POR_MARCA[marcaSlug] ?? null;
}
