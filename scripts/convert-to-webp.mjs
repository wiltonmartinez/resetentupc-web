import { readdir, mkdir } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join, extname, basename, relative } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

export const TARGETS = [
  "src/assets/branding",
  "src/assets/modelos",
  "src/assets/errores",
  "src/assets/soluciones",
  "src/assets/proceso",
  "src/assets/prueba-social",
];

export const SOURCE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
const WEBP_QUALITY = 82;

export async function findImages(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findImages(full)));
    } else if (SOURCE_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

/** Convierte `filePath` a .webp junto al original. Omite la conversión si ya existe
 * un .webp al menos tan reciente como el origen (evita recargas innecesarias en el watcher). */
export async function convertOne(filePath) {
  const dir = filePath.slice(0, filePath.length - basename(filePath).length);
  const nameWithoutExt = basename(filePath, extname(filePath));
  const outPath = join(dir, `${nameWithoutExt}.webp`);

  if (existsSync(outPath) && statSync(outPath).mtimeMs >= statSync(filePath).mtimeMs) {
    return { filePath, outPath, skipped: true };
  }

  await mkdir(dir, { recursive: true });
  await sharp(filePath).webp({ quality: WEBP_QUALITY }).toFile(outPath);
  return { filePath, outPath, skipped: false };
}

async function main() {
  const allFiles = (await Promise.all(TARGETS.map(findImages))).flat();

  if (allFiles.length === 0) {
    console.log("No se encontraron imágenes PNG/JPG en:", TARGETS.join(", "));
    return;
  }

  let converted = 0;
  let skipped = 0;

  for (const filePath of allFiles) {
    const result = await convertOne(filePath);
    const label = relative(process.cwd(), result.outPath);
    if (result.skipped) {
      console.log(`- ya existe, se omite: ${label}`);
      skipped++;
    } else {
      console.log(`✓ convertido: ${relative(process.cwd(), filePath)} -> ${label}`);
      converted++;
    }
  }

  console.log(`\nListo. Convertidas: ${converted}. Omitidas (ya existían): ${skipped}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("Error al convertir imágenes:", err);
    process.exitCode = 1;
  });
}
