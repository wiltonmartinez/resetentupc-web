import { SITE_URL } from "../config/site";

/**
 * JSON-LD Review compartido entre Cliente Satisfecho y Reset Evidencia.
 * No inventamos nombre real de cliente (privacidad — los datos personales ya
 * vienen ocultos desde Núcleo) ni reviewRating (no hay calificación numérica
 * real en los datos públicos — agregar una falsa violaría las políticas de
 * reseñas de Google). Solo se declara lo que realmente se puede verificar.
 */
interface ReviewSchemaInput {
  marca: string;
  modelo: string;
  pais: string;
  fechaPublicacion?: string;
  reviewBody?: string;
  url: string;
}

/** Núcleo entrega fechas tipo SQL ("2026-08-21 05:14:21") — se toma solo la
 * parte de fecha (YYYY-MM-DD), que ya es ISO 8601 válido; la hora sin huso
 * horario conocido sería ambigua/incorrecta en JSON-LD. */
function soloFechaIso(fecha?: string): string | undefined {
  if (!fecha) return undefined;
  return fecha.split(" ")[0];
}

export function buildReviewSchema({ marca, modelo, pais, fechaPublicacion, reviewBody, url }: ReviewSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Service",
      name: `Reset autónomo de impresoras ${marca} ${modelo}`.trim(),
      brand: { "@type": "Organization", name: "ResetEntuPC.com", url: SITE_URL },
      areaServed: pais || undefined,
    },
    author: { "@type": "Person", name: "Cliente verificado" },
    datePublished: soloFechaIso(fechaPublicacion),
    reviewBody: reviewBody || undefined,
    url,
  };
}
