/**
 * Filtro básico anti-saboteo para los campos de texto libre del formulario de contacto
 * (nombre, nota, "otra red"). No es un moderador de contenido completo — es una capa
 * heurística que bloquea los casos más obvios (insultos comunes, código/enlaces
 * sospechosos, texto claramente basura) antes de enviar nada. Usado igual del lado
 * cliente (bloqueo inmediato) y como referencia para el mismo chequeo en el servidor.
 */

// Lista deliberadamente corta y de palabras comunes (es/en/pt/fr/it) — evita falsos
// positivos agresivos; no sustituye un moderador de contenido real.
const PALABRAS_PROHIBIDAS = [
  "idiota",
  "imbecil",
  "imbécil",
  "estupido",
  "estúpido",
  "pendejo",
  "gilipollas",
  "mierda",
  "puta",
  "puto",
  "cabron",
  "cabrón",
  "maricon",
  "maricón",
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "merde",
  "putain",
  "connard",
  "porra",
  "caralho",
  "vaffanculo",
  "stronzo",
];

const PATRONES_CODIGO_MALICIOSO = [
  /<\s*script/i,
  /<\s*iframe/i,
  /javascript\s*:/i,
  /on\w+\s*=\s*["']/i, // onerror=, onload=, onclick=...
  /union\s+select/i,
  /;\s*drop\s+table/i,
  /\$\{.*\}/,
  /\{\{.*\}\}/,
  /https?:\/\/\S+\.\S+\/\S{20,}/i, // enlaces largos sospechosos de phishing
];

function contienePalabraProhibida(texto) {
  const normalizado = texto.toLowerCase();
  return PALABRAS_PROHIBIDAS.some((palabra) => new RegExp(`\\b${palabra}\\b`, "i").test(normalizado));
}

function contieneCodigoSospechoso(texto) {
  return PATRONES_CODIGO_MALICIOSO.some((patron) => patron.test(texto));
}

function contieneRepeticionExcesiva(texto) {
  return /(.)\1{7,}/.test(texto); // el mismo carácter 8+ veces seguidas
}

function contieneCaracteresRaros(texto) {
  const limpio = texto.trim();
  if (limpio.length < 4) return false;
  const simbolosRaros = (limpio.match(/[^\p{L}\p{N}\s.,;:!?'"()¿¡@\-]/gu) || []).length;
  return simbolosRaros / limpio.length > 0.35;
}

/**
 * Revisa un objeto de campos de texto libre { nombreDeCampo: valor }.
 * Devuelve { ok: true } o { ok: false, razon: "insultos" | "codigo" | "basura" }.
 */
export function revisarContenido(campos) {
  for (const valor of Object.values(campos)) {
    if (!valor || typeof valor !== "string") continue;
    if (contieneCodigoSospechoso(valor)) return { ok: false, razon: "codigo" };
    if (contienePalabraProhibida(valor)) return { ok: false, razon: "insultos" };
    if (contieneRepeticionExcesiva(valor) || contieneCaracteresRaros(valor)) return { ok: false, razon: "basura" };
  }
  return { ok: true };
}
