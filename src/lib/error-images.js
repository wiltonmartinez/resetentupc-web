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
