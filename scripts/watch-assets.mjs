/**
 * Vigila src/assets/{branding,modelos,errores,soluciones,proceso} y convierte a WebP
 * cualquier PNG/JPG nuevo o reemplazado, en el mismo lugar donde ya vive el original.
 * No hace falta ningún paso de "publicación" aparte: los componentes del sitio
 * (model-images.js, error-images.js, solucion-images.js, proceso-images.js) ya
 * descubren esos .webp automáticamente vía import.meta.glob en el siguiente
 * build/recarga de `astro dev`.
 *
 * Uso: npm run watch:assets
 */
import { watch, existsSync } from "node:fs";
import { extname, join } from "node:path";
import { TARGETS, SOURCE_EXTENSIONS, findImages, convertOne } from "./convert-to-webp.mjs";

const DEBOUNCE_MS = 400;
const pendientes = new Map();

async function convertirYReportar(filePath) {
  try {
    const resultado = await convertOne(filePath);
    if (!resultado.skipped) {
      console.log(`✓ convertido: ${filePath} -> ${resultado.outPath}`);
    }
  } catch (err) {
    console.error(`✗ error al convertir ${filePath}:`, err.message);
  }
}

function programarConversion(filePath) {
  if (pendientes.has(filePath)) clearTimeout(pendientes.get(filePath));
  const timeout = setTimeout(() => {
    pendientes.delete(filePath);
    if (existsSync(filePath)) convertirYReportar(filePath);
  }, DEBOUNCE_MS);
  pendientes.set(filePath, timeout);
}

async function conversionInicial() {
  const todas = (await Promise.all(TARGETS.map(findImages))).flat();
  console.log(`Revisión inicial: ${todas.length} imagen(es) PNG/JPG encontradas.`);
  for (const filePath of todas) {
    await convertirYReportar(filePath);
  }
}

function iniciarVigilancia() {
  for (const dir of TARGETS) {
    if (!existsSync(dir)) continue;
    watch(dir, { recursive: true }, (_eventType, filename) => {
      if (!filename) return;
      if (!SOURCE_EXTENSIONS.has(extname(filename).toLowerCase())) return;
      programarConversion(join(dir, filename));
    });
    console.log(`Vigilando: ${dir}`);
  }
}

async function main() {
  console.log("Agente de conversión WebP iniciado. Presiona Ctrl+C para detenerlo.\n");
  await conversionInicial();
  iniciarVigilancia();
  console.log("\nListo para recibir material nuevo.");
}

main();
