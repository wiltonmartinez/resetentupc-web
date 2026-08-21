/**
 * Fuente de las evidencias de "Cliente Satisfecho" (antes "chat-real"). A
 * diferencia de las conversaciones antiguas (imágenes), esto es HTML real
 * renderizado de la conversación (9:16), ya censurado por Núcleo. Cuando la
 * API esté lista, este archivo se reemplaza por el fetch — la forma de
 * los datos ya coincide con el contrato acordado.
 */

export interface ClienteSatisfechoEvidencia {
  marca: string;
  modelo: string;
  /** Mismo campo "error" que el resto del sitio (ej. "Almohadillas", "5B00"). */
  error: string;
  pais: string;
  medioPago: string;
  fecha?: string;
  /** Resumen corto para el índice — nunca el HTML completo. */
  previewTexto: string;
  /** HTML renderizado y ya censurado de la conversación, contenedor 9:16. */
  html: string;
}

/** Título público = "{marca} {modelo} {error} {país} {medioPago}". */
export function tituloClienteSatisfecho(evidencia: ClienteSatisfechoEvidencia): string {
  return [evidencia.marca, evidencia.modelo, evidencia.error, evidencia.pais, evidencia.medioPago].join(" ");
}

/**
 * Slug público = marca-modelo-errorCorto-pais-medioPago, concatenado con
 * guiones. Se calcula SIEMPRE a partir de estos mismos 5 campos (nunca se
 * escribe a mano) para que sea consistente y para que valores de varias
 * palabras (ej. "Bancolombia Ahorros") se normalicen igual en cualquier
 * entrada — sin acentos, en minúsculas, espacios y símbolos como guion.
 */
function normalizarParteSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita las marcas diacriticas (a con tilde -> a, etc.)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugClienteSatisfecho(evidencia: ClienteSatisfechoEvidencia): string {
  return [evidencia.marca, evidencia.modelo, evidencia.error, evidencia.pais, evidencia.medioPago]
    .map(normalizarParteSlug)
    .join("-");
}

// PLACEHOLDER — reemplazar por evidencia real (HTML exportado y ya censurado
// por Núcleo) antes de publicar.
export const CLIENTES_SATISFECHOS: ClienteSatisfechoEvidencia[] = [
  {
    marca: "Epson",
    modelo: "L220",
    error: "Almohadillas",
    pais: "Colombia",
    medioPago: "Nequi",
    fecha: "2026-08-10",
    previewTexto: "PLACEHOLDER — reemplazar por el primer mensaje real de la conversación censurada.",
    html: `<!doctype html><html><head><meta charset="utf-8" /><style>
      body{margin:0;font-family:system-ui,sans-serif;background:#e5ddd5;padding:0.75rem;box-sizing:border-box;}
      .msg{max-width:85%;padding:0.5rem 0.75rem;border-radius:0.6rem;margin-bottom:0.5rem;font-size:0.85rem;line-height:1.35;}
      .cliente{background:#fff;}
      .agente{background:#dcf8c6;margin-left:auto;}
    </style></head><body>
      <div class="msg cliente">PLACEHOLDER — mensaje del cliente</div>
      <div class="msg agente">PLACEHOLDER — respuesta del agente</div>
      <div class="msg cliente">PLACEHOLDER — confirmación del cliente</div>
    </body></html>`,
  },
  {
    marca: "Canon",
    modelo: "G2110",
    error: "5B00",
    pais: "Ecuador",
    medioPago: "Transferencia",
    fecha: "2026-08-05",
    previewTexto: "PLACEHOLDER — reemplazar por el primer mensaje real de la conversación censurada.",
    html: `<!doctype html><html><head><meta charset="utf-8" /><style>
      body{margin:0;font-family:system-ui,sans-serif;background:#e5ddd5;padding:0.75rem;box-sizing:border-box;}
      .msg{max-width:85%;padding:0.5rem 0.75rem;border-radius:0.6rem;margin-bottom:0.5rem;font-size:0.85rem;line-height:1.35;}
      .cliente{background:#fff;}
      .agente{background:#dcf8c6;margin-left:auto;}
    </style></head><body>
      <div class="msg cliente">PLACEHOLDER — mensaje del cliente</div>
      <div class="msg agente">PLACEHOLDER — respuesta del agente</div>
    </body></html>`,
  },
  {
    marca: "Epson",
    modelo: "L3250",
    error: "Almohadillas",
    pais: "Colombia",
    medioPago: "Bancolombia Ahorros",
    fecha: "2026-08-18",
    previewTexto: "PLACEHOLDER — reemplazar por el primer mensaje real de la conversación censurada.",
    html: `<!doctype html><html><head><meta charset="utf-8" /><style>
      body{margin:0;font-family:system-ui,sans-serif;background:#e5ddd5;padding:0.75rem;box-sizing:border-box;}
      .msg{max-width:85%;padding:0.5rem 0.75rem;border-radius:0.6rem;margin-bottom:0.5rem;font-size:0.85rem;line-height:1.35;}
      .cliente{background:#fff;}
      .agente{background:#dcf8c6;margin-left:auto;}
    </style></head><body>
      <div class="msg cliente">PLACEHOLDER — mensaje del cliente</div>
      <div class="msg agente">PLACEHOLDER — respuesta del agente</div>
    </body></html>`,
  },
];
