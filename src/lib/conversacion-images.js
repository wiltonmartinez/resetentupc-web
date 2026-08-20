const modules = import.meta.glob("/src/assets/prueba-social/conversaciones/*.{png,webp,jpg,jpeg}", { eager: true });

const imageMap = new Map();
for (const [path, mod] of Object.entries(modules)) {
  const filename = path.split("/").pop();
  imageMap.set(filename.toLowerCase(), mod.default);
}

export function getConversacionImage(archivo) {
  return imageMap.get(archivo.toLowerCase()) ?? null;
}
