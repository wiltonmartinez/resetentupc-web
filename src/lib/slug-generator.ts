export function cleanString(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateClienteSatisfechoSlug(
  accion: string,
  marca: string,
  modelo: string,
  pais: string,
  medioPago: string
): string {
  const parts = [accion, marca, modelo, pais, medioPago].filter(Boolean).map(cleanString);
  return parts.join("-");
}

export function generateResetEvidenciaSlug(
  accion: string,
  marca: string,
  modelo: string,
  errorCorto: string,
  pais: string,
  tiempo: string
): string {
  const parts = [accion, marca, modelo, errorCorto, pais, tiempo].filter(Boolean).map(cleanString);
  return parts.join("-");
}

export function generateDiagnosticoSlug(
  marca: string,
  modelo: string,
  diagnostico: string
): string {
  const cleanDiag = cleanString(diagnostico);
  return `diagnostico-${cleanString(marca)}-${cleanString(modelo)}-${cleanDiag}`;
}

export function parseClienteSatisfechoSlug(slug: string): {
  accion: string;
  marca: string;
  modelo: string;
  pais: string;
  medioPago: string;
} | null {
  const parts = slug.split("-");
  if (parts.length < 5) return null;
  return {
    accion: parts[0],
    marca: parts[1],
    modelo: parts[2],
    pais: parts[3],
    medioPago: parts[4],
  };
}

export function parseResetEvidenciaSlug(slug: string): {
  accion: string;
  marca: string;
  modelo: string;
  errorCorto: string;
  pais: string;
  tiempo: string;
} | null {
  const parts = slug.split("-");
  if (parts.length < 6) return null;
  return {
    accion: parts[0],
    marca: parts[1],
    modelo: parts[2],
    errorCorto: parts[3],
    pais: parts[4],
    tiempo: parts[5],
  };
}

export function parseDiagnosticoSlug(slug: string): {
  marca: string;
  modelo: string;
  diagnostico: string;
} | null {
  if (!slug.startsWith("diagnostico-")) return null;
  const withoutPrefix = slug.replace("diagnostico-", "");
  const parts = withoutPrefix.split("-");
  if (parts.length < 3) return null;

  const marca = parts[0];
  const modelo = parts[1];
  const diagnostico = parts.slice(2).join("-");

  return { marca, modelo, diagnostico };
}
