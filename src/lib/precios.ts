import pagosData from "../data/pagos.json";
import modelosData from "../data/modelos-muestra.json";
import erroresData from "../data/errores.json";
import { resolveErroresParaModelo } from "../i18n/utils";
import { resolverUrlsLogosMediosPago } from "./medios-pago-logos";
import type { Locale } from "../config/site";

/**
 * Mapa ISO 3166-1 alfa-2 (lo que entrega el header `cf-ipcountry` de Cloudflare)
 * -> slug de país en pagos.json. Cualquier país no listado aquí cae en "otro"
 * (medios de pago internacionales: PayPal, Binance, Western Union).
 */
const ISO_A_SLUG: Record<string, string> = {
  CO: "colombia",
  CL: "chile",
  BR: "brasil",
  EC: "ecuador",
  SV: "el-salvador",
  PA: "panama",
  GT: "guatemala",
  HN: "honduras",
  MX: "mexico",
  NI: "nicaragua",
  PE: "peru",
  PY: "paraguay",
  VE: "venezuela",
  AR: "argentina",
};

/** Inverso de ISO_A_SLUG, para dibujar la bandera de cada país en el selector. */
const SLUG_A_ISO: Record<string, string> = Object.fromEntries(
  Object.entries(ISO_A_SLUG).map(([iso, slug]) => [slug, iso])
);

const SLUG_FALLBACK = "colombia";
const SLUG_OTRO = "otro";

/** Los 3 medios "internacionales" que se suman a todo país que no sea Colombia
 *  (que solo admite medios locales). Se toman de la propia entrada "otro" de
 *  pagos.json, sin fabricar datos nuevos — así si esa entrada cambia, esto
 *  se actualiza solo. Se excluye "Whop" a propósito: el mensaje de negocio
 *  pide específicamente PayPal, Binance y Western Union. */
const NOMBRES_INTERNACIONALES = ["paypal", "binance", "western union"];

/** Excepciones puntuales pedidas por el negocio: un medio internacional que
 *  NO debe ofrecerse en un país concreto aunque el resto de países sí lo
 *  vean (ej. Western Union no se ofrece en México). Coincidencia por
 *  substring, insensible a mayúsculas. */
const EXCLUIR_INTERNACIONAL_POR_PAIS: Record<string, string[]> = {
  mexico: ["western union"],
};

export function resolverPaisSlugDesdeCfCountry(cfCountry: string | null | undefined): string {
  const iso = (cfCountry || "").trim().toUpperCase();
  if (!iso || iso === "XX" || iso === "T1") return SLUG_FALLBACK;
  return ISO_A_SLUG[iso] ?? SLUG_OTRO;
}

/** Regional Indicator Symbols: convierte "CO" -> 🇨🇴. Países sin ISO conocido
 *  (la entrada "otro") usan un globo terráqueo como respaldo neutral. */
export function banderaEmoji(slug: string): string {
  const iso = SLUG_A_ISO[slug];
  if (!iso) return "🌎";
  return String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65)));
}

export interface MetodoPagoPublico {
  nombre: string;
  /** URLs de logo optimizadas (0, 1 o 2 — ver medios-pago-logos.ts). Vacío
   *  cuando no hay logo real disponible para ese medio: el front debe caer
   *  al nombre en texto, nunca inventar un logo. */
  logos: string[];
}

export interface PreciosPorPlan {
  esencial: number | null;
  profesional: number | null;
  elite: number | null;
}

export interface PreciosPorGrupo {
  impresora: PreciosPorPlan | null;
  plotter: PreciosPorPlan | null;
}

export interface OpcionMoneda {
  codigo: string;
  ambito: "local" | "internacional";
  /** true solo para la opción internacional (USD) de los países con moneda
   *  local + USD (ver SLUGS_LOCAL_MAS_USD) — es la única que lleva el
   *  descuento por tiempo limitado en el front. */
  descontable?: boolean;
  precios: PreciosPorGrupo;
}

export interface PaisPrecioPublico {
  slug: string;
  nombre: string;
  bandera: string;
  metodosPago: MetodoPagoPublico[];
  monedas: OpcionMoneda[];
  /** Cómo debe presentar el front las monedas de este país:
   *   - "unica": 1 sola moneda, badge fijo sin interacción.
   *   - "toggle": 2 monedas mutuamente excluyentes, botones para alternar
   *     (Venezuela USD/COP; Argentina USD/COP; "otro"/Cuba USD/EUR).
   *   - "apilado": 2 monedas que se muestran las DOS a la vez, una encima
   *     de otra — precio en moneda local (con agente en el país) arriba,
   *     precio en USD (medio internacional, con descuento) abajo. */
  presentacionMoneda: "unica" | "toggle" | "apilado";
}

/** Países con agente/banca local propia (moneda local real, no USD) a los
 *  que además se les ofrece un segundo precio en USD como medio
 *  internacional — apilado debajo del precio local, con descuento por
 *  tiempo limitado. Deliberadamente NO incluye Colombia (única moneda,
 *  pasarelas internacionales bloqueadas por regla de negocio), ni
 *  Ecuador/El Salvador/Panamá (su moneda local YA es USD, un "USD
 *  internacional" adicional sería redundante). */
const SLUGS_LOCAL_MAS_USD = ["paraguay", "peru", "nicaragua", "mexico", "honduras", "guatemala", "brasil", "chile"];

function normalizarPrecios(precios: { impresora?: PreciosPorPlan | null; plotter?: PreciosPorPlan | null }): PreciosPorGrupo {
  return {
    impresora: precios.impresora ?? null,
    plotter: precios.plotter ?? null,
  };
}

function convertirPrecios(precios: PreciosPorGrupo, tasa: number): PreciosPorGrupo {
  const convertirPlan = (p: PreciosPorPlan | null): PreciosPorPlan | null =>
    p == null
      ? null
      : {
          esencial: p.esencial == null ? null : Math.round(p.esencial * tasa),
          profesional: p.profesional == null ? null : Math.round(p.profesional * tasa),
          elite: p.elite == null ? null : Math.round(p.elite * tasa),
        };
  return { impresora: convertirPlan(precios.impresora), plotter: convertirPlan(precios.plotter) };
}

/** Códigos ISO de países donde por defecto conviene mostrar EUR en vez de USD
 *  a un visitante sin infraestructura bancaria local propia (España, Italia,
 *  Portugal y el resto de la UE/EEE + Reino Unido/Suiza). Es solo el valor
 *  por defecto del selector — el visitante siempre puede alternar a mano. */
const PAISES_EUROPA_ISO = new Set([
  "ES", "IT", "PT", "FR", "DE", "NL", "BE", "AT", "IE", "GR", "PL", "SE",
  "DK", "FI", "NO", "CH", "GB", "LU", "CZ", "HU", "RO", "BG", "HR", "SK",
  "SI", "EE", "LV", "LT", "CY", "MT", "IS", "AD", "MC", "LI", "SM", "VA",
]);

export function esVisitanteEuropeo(cfCountry: string | null | undefined): boolean {
  return PAISES_EUROPA_ISO.has((cfCountry || "").trim().toUpperCase());
}

interface CacheTasa {
  tasa: number;
  obtenidaEn: number;
}

let cacheTasaUsdEur: CacheTasa | null = null;
const TASA_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas — de sobra para no golpear la API en cada visita.
const TASA_FETCH_TIMEOUT_MS = 1200; // nunca debe hacer esperar el render de la página de forma perceptible.

/** Constante de respaldo SOLO para cuando la API de tasas no responde a
 *  tiempo o falla — nunca bloquea ni rompe la página. Actualízala a mano si
 *  se aleja mucho de la tasa real (referencia: ~0.92 EUR por USD). */
const TASA_USD_EUR_RESPALDO = 0.92;

/**
 * Tasa USD -> EUR en vivo (Frankfurter.app: tasas de referencia diarias del
 * Banco Central Europeo, API pública sin autenticación). Con caché de 6h en
 * memoria del proceso y una constante de respaldo si la API falla o tarda
 * más de TASA_FETCH_TIMEOUT_MS — la página de precios NUNCA depende de que
 * esta llamada tenga éxito.
 */
export async function obtenerTasaUsdEur(): Promise<number> {
  const ahora = Date.now();
  if (cacheTasaUsdEur && ahora - cacheTasaUsdEur.obtenidaEn < TASA_CACHE_TTL_MS) {
    return cacheTasaUsdEur.tasa;
  }
  try {
    const controlador = new AbortController();
    const timeoutId = setTimeout(() => controlador.abort(), TASA_FETCH_TIMEOUT_MS);
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR", { signal: controlador.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Frankfurter respondió ${res.status}`);
    const data: { rates?: Record<string, number> } = await res.json();
    const tasa = data.rates?.EUR;
    if (!tasa || !Number.isFinite(tasa) || tasa <= 0) throw new Error("tasa EUR inválida");
    cacheTasaUsdEur = { tasa, obtenidaEn: ahora };
    return tasa;
  } catch {
    return TASA_USD_EUR_RESPALDO;
  }
}

/**
 * Versión pública (sin `detalle`: nunca números de cuenta, claves ni nombres
 * de titulares) de cada país de pagos.json, con las reglas de negocio ya
 * aplicadas:
 *  - Medios de pago: Colombia solo locales; el resto, sus propios medios +
 *    los internacionales (deduplicados por nombre, con excepciones puntuales
 *    por país — ver EXCLUIR_INTERNACIONAL_POR_PAIS).
 *  - Moneda: un país "unica" (Colombia, Ecuador, El Salvador, Panamá) muestra
 *    SOLO su moneda. Venezuela y Argentina (sin cuenta propia en su moneda)
 *    ofrecen USD + COP en modo "toggle" (vía las cuentas de Colombia).
 *    "otro" (incluye Cuba, y cualquier país sin mapeo ISO propio) ofrece
 *    USD + EUR en modo "toggle", con tasa EUR en vivo. Los 8 países de
 *    SLUGS_LOCAL_MAS_USD ofrecen su moneda local + USD en modo "apilado"
 *    (las dos visibles a la vez, la de USD con descuento — ver PreciosPage).
 */
export async function paisesPrecioPublico(): Promise<PaisPrecioPublico[]> {
  const urlsLogos = await resolverUrlsLogosMediosPago();
  const conLogo = (nombre: string): MetodoPagoPublico => ({ nombre, logos: urlsLogos[nombre] ?? [] });

  const internacionales = (pagosData.paises.find((p) => p.slug === SLUG_OTRO)?.metodosPago ?? []).filter((m) =>
    NOMBRES_INTERNACIONALES.some((n) => m.nombre.toLowerCase().includes(n))
  );
  const otro = pagosData.paises.find((p) => p.slug === SLUG_OTRO)!;
  const colombia = pagosData.paises.find((p) => p.slug === SLUG_FALLBACK)!;
  const tasaUsdEur = await obtenerTasaUsdEur();
  const precioUsdInternacional = normalizarPrecios(otro.precios);

  return pagosData.paises.map((pais) => {
    const propios = pais.metodosPago.map((m) => conLogo(m.nombre));
    const exclusiones = EXCLUIR_INTERNACIONAL_POR_PAIS[pais.slug] ?? [];
    const internacionalesParaEstePais = internacionales
      .filter((i) => !exclusiones.some((ex) => i.nombre.toLowerCase().includes(ex)))
      .map((i) => conLogo(i.nombre));
    const metodosPago =
      pais.slug === SLUG_FALLBACK
        ? propios
        : [...propios, ...internacionalesParaEstePais.filter((i) => !propios.some((p) => p.nombre === i.nombre))];

    let monedas: OpcionMoneda[];
    let presentacionMoneda: PaisPrecioPublico["presentacionMoneda"];

    if (pais.slug === "venezuela" || pais.slug === "argentina") {
      monedas = [
        { codigo: "USD", ambito: "internacional", precios: precioUsdInternacional },
        { codigo: "COP", ambito: "internacional", precios: normalizarPrecios(colombia.precios) },
      ];
      presentacionMoneda = "toggle";
    } else if (pais.slug === SLUG_OTRO) {
      monedas = [
        { codigo: "USD", ambito: "internacional", precios: precioUsdInternacional },
        { codigo: "EUR", ambito: "internacional", precios: convertirPrecios(precioUsdInternacional, tasaUsdEur) },
      ];
      presentacionMoneda = "toggle";
    } else if (SLUGS_LOCAL_MAS_USD.includes(pais.slug)) {
      monedas = [
        { codigo: pais.moneda, ambito: "local", precios: normalizarPrecios(pais.precios) },
        { codigo: "USD", ambito: "internacional", descontable: true, precios: precioUsdInternacional },
      ];
      presentacionMoneda = "apilado";
    } else {
      monedas = [{ codigo: pais.moneda, ambito: "local", precios: normalizarPrecios(pais.precios) }];
      presentacionMoneda = "unica";
    }

    return {
      slug: pais.slug,
      nombre: pais.nombre,
      bandera: banderaEmoji(pais.slug),
      metodosPago,
      monedas,
      presentacionMoneda,
    };
  });
}

interface ModeloCatalogo {
  marcaSlug: string;
  modeloSlug: string;
  nombreMarca: string;
  nombreModelo: string;
  nivel: number;
  popularidad: number;
}

const MODELOS = modelosData as ModeloCatalogo[];

/** Las únicas 3 marcas/líneas oficiales del catálogo (ver ContactForm.astro,
 *  misma fuente de verdad). El orden aquí es el orden de los botones del
 *  Paso 1. */
const ORDEN_MARCAS = ["epson", "canon", "epson-sc"] as const;

/** Epson-SC es la única línea de formato grande (plotter); el resto cobra
 *  tarifa de "impresora". Mismo criterio que ya usa ContactForm.astro
 *  (tipoEquipoActual). */
const GRUPO_POR_MARCA: Record<string, "impresora" | "plotter"> = {
  epson: "impresora",
  canon: "impresora",
  "epson-sc": "plotter",
};

export interface ModeloCascada {
  slug: string;
  nombre: string;
}

export interface FamiliaCascada {
  slug: string;
  nombre: string;
  modelos: ModeloCascada[];
}

export interface MarcaCascada {
  slug: string;
  nombre: string;
  grupo: "impresora" | "plotter";
  /** Solo Epson tiene tantos modelos como para justificar un paso extra de
   *  familia/serie (ver derivarFamiliaSlug). Canon y Epson-SC van directo a
   *  modelo. */
  familias: FamiliaCascada[] | null;
  modelos: ModeloCascada[] | null;
}

/** Deriva la familia/serie de un modelo Epson a partir de su propio nombre
 *  (ej. "ET-2810" -> "ET", "L3210" -> "L", "XP-241" -> "XP"). No es una
 *  taxonomía inventada: son los mismos prefijos de fábrica que ya aparecen
 *  en nombreModelo para las 185 impresoras Epson del catálogo. */
function derivarFamiliaSlug(nombreModelo: string): string {
  const match = nombreModelo.match(/^[A-Za-z]+/);
  return (match ? match[0] : "otros").toLowerCase();
}

export function catalogoCascada(): MarcaCascada[] {
  return ORDEN_MARCAS.map((marcaSlug) => {
    const modelosMarca = MODELOS.filter((m) => m.marcaSlug === marcaSlug).sort((a, b) => b.popularidad - a.popularidad);
    const nombreMarca = modelosMarca[0]?.nombreMarca ?? marcaSlug;

    if (marcaSlug !== "epson") {
      return {
        slug: marcaSlug,
        nombre: nombreMarca,
        grupo: GRUPO_POR_MARCA[marcaSlug],
        familias: null,
        modelos: modelosMarca.map((m) => ({ slug: m.modeloSlug, nombre: m.nombreModelo })),
      };
    }

    const familiasPorSlug = new Map<string, FamiliaCascada>();
    for (const m of modelosMarca) {
      const familiaSlug = derivarFamiliaSlug(m.nombreModelo);
      if (!familiasPorSlug.has(familiaSlug)) {
        familiasPorSlug.set(familiaSlug, { slug: familiaSlug, nombre: `Serie ${familiaSlug.toUpperCase()}`, modelos: [] });
      }
      familiasPorSlug.get(familiaSlug)!.modelos.push({ slug: m.modeloSlug, nombre: m.nombreModelo });
    }

    return {
      slug: marcaSlug,
      nombre: nombreMarca,
      grupo: GRUPO_POR_MARCA[marcaSlug],
      familias: [...familiasPorSlug.values()].sort((a, b) => a.slug.localeCompare(b.slug)),
      modelos: null,
    };
  });
}

export function grupoParaMarca(marcaSlug: string): "impresora" | "plotter" {
  return GRUPO_POR_MARCA[marcaSlug] ?? "impresora";
}

export interface ErrorCascada {
  id: string;
  nombre: string;
  estado: string;
}

/** Solo para el Paso 3 de /precios/: nombre más reconocible para el cliente
 *  que el nombre "oficial" del concepto en errores.json (que sigue igual en
 *  el resto del sitio — páginas de modelo, ContactForm — para no romper
 *  contenido ya indexado). "E-11" es el código en pantalla y "Tampón" el
 *  término usado en España para lo mismo que "Almohadillas" en Latam. */
const SINONIMOS_ERROR_CASCADA: Record<string, string> = {
  "epson-almohadillas": "Almohadillas / E-11 / Tampón",
};

interface ErrorConceptoJson {
  error_id: string;
  marcaSlug: string;
  error_name: Partial<Record<Locale, string>>;
  estado_servicio: string;
}

const ERRORES_CONCEPTOS = (erroresData as { errores: ErrorConceptoJson[] }).errores;

/** Busca un concepto de error por su id directo (no por modelo) — para las
 *  marcas cuyo Paso 3 no depende del modelo exacto (ver mapaErroresPublico). */
function errorConceptoComoCascada(errorId: string, locale: Locale): ErrorCascada | null {
  const concepto = ERRORES_CONCEPTOS.find((e) => e.error_id === errorId);
  if (!concepto) return null;
  const nombre = concepto.error_name[locale] ?? concepto.error_name.es ?? errorId;
  return {
    id: concepto.error_id,
    nombre: SINONIMOS_ERROR_CASCADA[concepto.error_id] ?? nombre,
    estado: concepto.estado_servicio,
  };
}

/** Excepción confirmada directamente por el dueño del sitio (2026-09-07):
 *  MG3510/MG3610 no usan el 5B00/1700 general de la línea Canon G/MB/GM/TS,
 *  sino 5B02 — ver el concepto "canon-5b02" en errores.json. */
const MODELOS_CANON_5B02 = new Set(["mg3510", "mg3610"]);

/**
 * Mapa compacto {marcaSlug: {modeloSlug: errores[]}} para el Paso 3 del
 * selector en cascada, embebido tal cual en el cliente.
 *
 * Epson y Canon NO usan la cobertura real por modelo de errores.json: esa
 * cobertura está incompleta (~55 de 185 modelos Epson y ~26 de 44 Canon no
 * quedaron enlazados a ningún concepto todavía) y, confirmado directamente
 * por el dueño del sitio, no hace falta — Epson solo tiene un concepto de
 * error real en todo el catálogo (Almohadillas) y Canon prácticamente solo
 * dos (5B00/1700, con la excepción puntual de MG3510/MG3610 -> 5B02). Por
 * eso para estas 2 marcas el Paso 3 siempre ofrece el mismo set fijo, sin
 * importar el modelo exacto elegido, en vez de depender del enlace
 * modelo-por-modelo. Epson-SC sí tiene cobertura amplia y variada por
 * familia de código, así que ese sigue usando resolveErroresParaModelo
 * (misma fuente que las páginas de modelo) tal como antes.
 */
export function mapaErroresPublico(locale: Locale): Record<string, Record<string, ErrorCascada[]>> {
  const mapa: Record<string, Record<string, ErrorCascada[]>> = {};

  const errorEpson = errorConceptoComoCascada("epson-almohadillas", locale);
  const errorCanon5b00 = errorConceptoComoCascada("canon-5b00", locale);
  const errorCanon1700 = errorConceptoComoCascada("canon-1700", locale);
  const errorCanon5b02 = errorConceptoComoCascada("canon-5b02", locale);
  const setCanonGeneral = [errorCanon5b00, errorCanon1700].filter((e): e is ErrorCascada => e !== null);

  for (const m of MODELOS) {
    if (!mapa[m.marcaSlug]) mapa[m.marcaSlug] = {};

    if (m.marcaSlug === "epson") {
      mapa[m.marcaSlug][m.modeloSlug] = errorEpson ? [errorEpson] : [];
      continue;
    }

    if (m.marcaSlug === "canon") {
      mapa[m.marcaSlug][m.modeloSlug] = MODELOS_CANON_5B02.has(m.modeloSlug)
        ? errorCanon5b02
          ? [errorCanon5b02]
          : []
        : setCanonGeneral;
      continue;
    }

    const resueltos = resolveErroresParaModelo(m.marcaSlug, m.modeloSlug, locale);
    mapa[m.marcaSlug][m.modeloSlug] = resueltos.map((e) => ({
      id: e.error_id,
      nombre: SINONIMOS_ERROR_CASCADA[e.error_id] ?? e.nombre,
      estado: e.estado_servicio,
    }));
  }
  return mapa;
}
