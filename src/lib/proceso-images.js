const modules = import.meta.glob("/src/assets/proceso/*.png", { eager: true });

const imageMap = new Map();
for (const [path, mod] of Object.entries(modules)) {
  const filename = path.split("/").pop();
  const slug = filename.replace(/\.png$/i, "").toLowerCase();
  imageMap.set(slug, mod.default);
}

export function getProcesoImage(nombre) {
  return imageMap.get(nombre.toLowerCase()) ?? null;
}
