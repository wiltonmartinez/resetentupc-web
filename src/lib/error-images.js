// Glob amplio (no solo .png) porque Núcleo puede entregar `foto_url` con
// cualquiera de estas extensiones (ver getErrorImageByFilename) — no
// rompe el uso existente por error_id, que sigue siendo casi todo .png.
const modules = import.meta.glob("/src/assets/errores/*.{jpeg,jpg,png,gif}", { eager: true });

const imageMap = new Map();
for (const [path, mod] of Object.entries(modules)) {
  const filename = path.split("/").pop();
  const slug = filename.replace(/\.(jpe?g|png|gif)$/i, "").toLowerCase();
  imageMap.set(filename.toLowerCase(), mod.default);
  imageMap.set(slug, mod.default);
}

/** Busca por error_id o slug de modelo (sin extensión) — uso ya establecido. */
export function getErrorImage(errorId) {
  return imageMap.get(errorId.toLowerCase()) ?? null;
}

/**
 * Busca por el nombre de archivo tal como lo entrega Núcleo en `foto_url`
 * (ej. "almohadillas.jpg") — acepta el nombre con o sin extensión, y
 * cualquiera de las extensiones soportadas arriba.
 */
export function getErrorImageByFilename(filename) {
  if (!filename) return null;
  const clave = filename.trim().toLowerCase();
  return imageMap.get(clave) ?? imageMap.get(clave.replace(/\.(jpe?g|png|gif)$/i, "")) ?? null;
}

/**
 * Último respaldo antes del placeholder genérico: una foto de la "familia"
 * del modelo (ej. "et-2700" -> familia "et"), para cuando ni Núcleo
 * (foto_url), ni el error_id, ni el modelo exacto tienen imagen propia
 * todavía. Busca un archivo `{familia}-generico.*` en src/assets/errores/
 * — NO se fabrica ninguna imagen aquí: si ese archivo no existe todavía
 * para la familia, esta función simplemente devuelve null (el caller cae
 * al placeholder limpio). Cuando se agregue una foto genérica real para
 * una familia, basta con soltar el archivo con ese nombre — no hay que
 * tocar este código.
 */
export function getErrorImageFamiliaFallback(modeloSlug) {
  if (!modeloSlug) return null;
  const familia = modeloSlug.trim().toLowerCase().match(/^[a-z]+/)?.[0];
  if (!familia) return null;
  return imageMap.get(`${familia}-generico`) ?? null;
}
