// Importa el catalogo candidato de marcas/modelos desde las fuentes reales del sitio anterior.
// Solo LEE fuentes externas (RESETENLINEA/seo/) y solo ESCRIBE dentro de scripts/output/.
// Nunca toca src/data/marcas.json, src/data/modelos-muestra.json ni el catalogo activo.
// Requiere Python 3 disponible en PATH (usado solo para leer el .zip de Search Console, sin dependencias npm nuevas).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "output");

const SEO_DIR = "C:/Users/Trabajo/Documents/RESETENLINEA/seo";
const TABLA_CSV = path.join(SEO_DIR, "Tabla.csv");
const PERFORMANCE_ZIP = path.join(SEO_DIR, "https___resetenlinea.com_-Performance-on-Search-2026-08-12.zip");
const PAGINAS_ENTRY = "Páginas.csv";

function readZipEntryAsUtf8(zipPath, entryName) {
  const pyScript = `
import zipfile, sys
with zipfile.ZipFile(r"${zipPath}") as z:
    sys.stdout.buffer.write(z.read(${JSON.stringify(entryName)}))
`;
  const buf = execFileSync("python", ["-c", pyScript], { maxBuffer: 20 * 1024 * 1024 });
  return buf.toString("utf-8");
}

function extractUrlsFromCsv(csvText) {
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  const urls = new Set();
  for (const line of lines.slice(1)) {
    const url = line.split(",")[0].trim();
    if (url.startsWith("https://resetenlinea.com/")) urls.add(url);
  }
  return urls;
}

// --- 1. Leer fuentes (solo lectura) ---
const tablaCsv = readFileSync(TABLA_CSV, "utf-8");
const paginasCsv = readZipEntryAsUtf8(PERFORMANCE_ZIP, PAGINAS_ENTRY);

const urls = new Set([...extractUrlsFromCsv(tablaCsv), ...extractUrlsFromCsv(paginasCsv)]);

// --- 2. Clasificar URLs de catalogo ---
const CATALOG_RE = /^https:\/\/resetenlinea\.com\/reset\/([^/]+)\/(?:([^/]+)\/)?(?:([^/]+)\/)?$/;

const depth1 = [];
const depth2 = [];
const depth3 = [];

for (const url of urls) {
  const m = CATALOG_RE.exec(url);
  if (!m) continue; // no es una URL de catalogo (testimonios, FAQ, paginas estaticas, etc.)
  const [, marca, seg2, seg3] = m;
  if (seg3) depth3.push({ marca, familia: seg2, modelo: seg3, url });
  else if (seg2) depth2.push({ marca, seg2, url });
  else depth1.push({ marca, url });
}

// --- 3. Casos especiales conocidos (revisados manualmente, no inferidos automaticamente) ---

// depth1: solo 3 son paginas raiz de marca reales; el resto son URLs mal formadas.
// De esas, 13 duplican modelos ya confirmados en su familia real; 3 revelan info nueva/ambigua.
const STRAY_ROOT_AMBIGUOUS = new Set([
  "https://resetenlinea.com/reset/reset-5b00-canon-mg3510/", // conflicto de codigo con 5b02-canon-mg/mg3510
  "https://resetenlinea.com/reset/reset-5b00-canon-ts3300/", // modelo nuevo, familia 5b00-canon-ts solo confirma ts6120
  "https://resetenlinea.com/reset/reset-almohadillas-epson-sc-t5470/", // posible variante/typo de t5475
]);

// otras-epson: 3 entradas son basura de datos, no codigos de modelo reales
const OTRAS_EPSON_BASURA = new Set(["1100-2", "me", "office"]);

// Modelos que deben quedar excluidos del catalogo confirmado y documentados solo como ambiguos
const AMBIGUOS_DENTRO_DE_DEPTH3 = new Set([
  "canon|5b02-canon-mg|mg3510",
  "epson|almohadillas-cx-m-t-p-sp|bx620fwd",
]);

function marcaPropuesta(marcaOrigen) {
  if (marcaOrigen === "epson-sc-plotter") return "epson-sc";
  return marcaOrigen;
}

const confirmados = [];
const incompletos = [];
const ambiguos = [];
const descartados = [];

for (const { marca, familia, modelo, url } of depth3) {
  if (familia === "almohadillas-et__trashed") {
    descartados.push({ modeloSlug: modelo, url, razon: "Artefacto de WordPress (elemento en papelera, __trashed)" });
    continue;
  }
  const key = `${marca}|${familia}|${modelo}`;
  if (AMBIGUOS_DENTRO_DE_DEPTH3.has(key)) continue; // se documentan aparte, manualmente, abajo
  if (familia === "otras-epson") {
    if (OTRAS_EPSON_BASURA.has(modelo)) {
      descartados.push({ modeloSlug: modelo, url, razon: "No es un codigo de modelo real (basura de datos)" });
      continue;
    }
    incompletos.push({
      marcaSlugOrigen: marca,
      marcaSlugPropuesto: marcaPropuesta(marca),
      familiaOrigen: familia,
      modeloSlug: modelo,
      fuente: url,
      motivo: "Sin familia de error asociada en las fuentes disponibles",
    });
    continue;
  }
  confirmados.push({
    marcaSlugOrigen: marca,
    marcaSlugPropuesto: marcaPropuesta(marca),
    familiaOrigen: familia,
    modeloSlug: modelo,
    fuente: url,
  });
}

for (const { marca, seg2, url } of depth2) {
  if (marca === "epson-sc-plotter") {
    confirmados.push({
      marcaSlugOrigen: marca,
      marcaSlugPropuesto: marcaPropuesta(marca),
      familiaOrigen: null,
      modeloSlug: seg2,
      fuente: url,
    });
  } else {
    // pagina de categoria/familia (ej. canon/5b00-canon-g/) o duplicado sin familia (epson/et-2814/)
    descartados.push({ modeloSlug: seg2, url, razon: "Pagina de categoria/familia o duplicado sin segmento de familia" });
  }
}

// depth1: 3 son paginas raiz de marca (no modelos); el resto son URLs mal formadas
// que duplican modelos ya confirmados en su familia real, salvo las 3 en STRAY_ROOT_AMBIGUOUS.
const MARCA_ROOT_URLS = new Set([
  "https://resetenlinea.com/reset/canon/",
  "https://resetenlinea.com/reset/epson/",
  "https://resetenlinea.com/reset/epson-sc-plotter/",
]);

for (const { url } of depth1) {
  if (MARCA_ROOT_URLS.has(url)) {
    descartados.push({ url, razon: "Pagina raiz de marca, no es un modelo" });
    continue;
  }
  if (STRAY_ROOT_AMBIGUOUS.has(url)) continue; // ya documentado en catalogo-ambiguo.json
  descartados.push({ url, razon: "URL mal formada que duplica un modelo ya confirmado en su familia real" });
}

// Casos ambiguos documentados manualmente con todo el contexto
ambiguos.push(
  {
    modeloSlug: "mg3510",
    conflicto:
      "Aparece en la familia estructurada 5b02-canon-mg (codigo 5B02) y tambien en una URL suelta que implica 5b00. No se puede determinar cual codigo es correcto sin confirmacion.",
    fuentes: [
      "https://resetenlinea.com/reset/canon/5b02-canon-mg/mg3510/",
      "https://resetenlinea.com/reset/reset-5b00-canon-mg3510/",
    ],
  },
  {
    modeloSlug: "t5470 / t5475",
    conflicto:
      "Una URL suelta menciona 't5470'; la familia estructurada de Epson-SC-plotter solo lista 't5475'. Podria ser un error de tipeo del sitio anterior o dos modelos reales distintos.",
    fuentes: [
      "https://resetenlinea.com/reset/reset-almohadillas-epson-sc-t5470/",
      "https://resetenlinea.com/reset/epson-sc-plotter/sc-t5475/",
    ],
  },
  {
    modeloSlug: "ts3300",
    conflicto:
      "Aparece solo en una URL suelta bajo la familia 5b00-canon-ts, pero esa familia estructurada solo confirma 'ts6120'. Modelo nuevo sin jerarquia confirmada.",
    fuentes: ["https://resetenlinea.com/reset/reset-5b00-canon-ts3300/"],
  },
  {
    modeloSlug: "bx620fwd",
    conflicto:
      "Unica entrada de la familia 'almohadillas-cx-m-t-p-sp', un nombre de familia inusual que mezcla siglas — probablemente un artefacto de taxonomia del sitio anterior, no una familia real confirmada.",
    fuentes: ["https://resetenlinea.com/reset/epson/almohadillas-cx-m-t-p-sp/bx620fwd/"],
  }
);

// --- 4. Escribir salidas (solo dentro de scripts/output/) ---
mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(path.join(OUTPUT_DIR, "catalogo-candidato.json"), JSON.stringify(confirmados, null, 2) + "\n");
writeFileSync(path.join(OUTPUT_DIR, "catalogo-incompleto.json"), JSON.stringify(incompletos, null, 2) + "\n");
writeFileSync(path.join(OUTPUT_DIR, "catalogo-ambiguo.json"), JSON.stringify(ambiguos, null, 2) + "\n");
writeFileSync(path.join(OUTPUT_DIR, "descartados.json"), JSON.stringify(descartados, null, 2) + "\n");

console.log("URLs unicas combinadas:", urls.size);
console.log("Catalogo confirmado:", confirmados.length);
console.log("Catalogo incompleto (otras-epson):", incompletos.length);
console.log("Casos ambiguos:", ambiguos.length);
console.log("Descartados (trashed/duplicados/basura):", descartados.length);
