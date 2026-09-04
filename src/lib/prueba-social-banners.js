const modules = import.meta.glob("/src/assets/prueba-social/*/banner.{png,webp,jpg,jpeg}", { eager: true });

// Si coexisten banner.jpeg y su banner.webp convertido (ver scripts/convert-to-webp.mjs),
// se prioriza siempre el .webp en vez de depender del orden de iteración del glob.
const EXTENSION_PRIORITY = ["webp", "png", "jpg", "jpeg"];

const bannersByFolder = new Map();
for (const [path, mod] of Object.entries(modules)) {
  const folder = path.split("/").at(-2);
  const extension = path.split(".").pop();
  const existing = bannersByFolder.get(folder);
  if (!existing || EXTENSION_PRIORITY.indexOf(extension) < EXTENSION_PRIORITY.indexOf(existing.extension)) {
    bannersByFolder.set(folder, { image: mod.default, extension });
  }
}

export function getPruebaSocialBanner(folder) {
  return bannersByFolder.get(folder)?.image ?? null;
}

const videoModules = import.meta.glob("/src/assets/prueba-social/*/banner-video.{mp4,webm}", { eager: true });

const videosByFolder = new Map();
for (const [path, mod] of Object.entries(videoModules)) {
  const folder = path.split("/").at(-2);
  videosByFolder.set(folder, mod.default);
}

export function getPruebaSocialBannerVideo(folder) {
  return videosByFolder.get(folder) ?? null;
}
