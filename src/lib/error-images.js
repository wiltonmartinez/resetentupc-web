const modules = import.meta.glob("/src/assets/errores/*.png", { eager: true });

const imageMap = new Map();
for (const [path, mod] of Object.entries(modules)) {
  const filename = path.split("/").pop();
  const slug = filename.replace(/\.png$/i, "").toLowerCase();
  imageMap.set(slug, mod.default);
}

export function getErrorImage(errorId) {
  return imageMap.get(errorId.toLowerCase()) ?? null;
}
