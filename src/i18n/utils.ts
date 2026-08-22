import {
  SITE_URL,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_PATH_PREFIX,
  HREFLANG_BY_LOCALE,
  X_DEFAULT_LOCALE,
  PAGE_SLUGS,
  type Locale,
  type StaticPageKey,
} from "../config/site";

import es from "./locales/es.json";
import en from "./locales/en.json";
import pt from "./locales/pt.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import de from "./locales/de.json";
import ru from "./locales/ru.json";
import ko from "./locales/ko.json";
import erroresData from "../data/errores.json";

const dictionaries: Record<Locale, Record<string, any>> = { es, en, pt, fr, it, de, ru, ko };

export function t(locale: Locale, key: string): any {
  const value = key.split(".").reduce<any>((acc, part) => acc?.[part], dictionaries[locale]);
  if (value !== undefined) return value;
  return key.split(".").reduce<any>((acc, part) => acc?.[part], dictionaries[DEFAULT_LOCALE]) ?? key;
}

/**
 * Detecta el locale a partir del prefijo real de la URL (ej. "/de/algo" -> "de"),
 * para que rutas que no matchean ninguna página (catch-all de 404) muestren el
 * layout en el idioma que el visitante realmente estaba navegando, no siempre
 * en español. Ordena por longitud de prefijo descendente para que un locale
 * nunca sea sombreado por otro cuyo prefijo sea substring del suyo.
 */
export function detectLocaleFromPath(pathname: string): Locale {
  const locales = [...SUPPORTED_LOCALES].sort(
    (a, b) => LOCALE_PATH_PREFIX[b].length - LOCALE_PATH_PREFIX[a].length
  );
  for (const locale of locales) {
    const prefix = LOCALE_PATH_PREFIX[locale];
    if (prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))) return locale;
  }
  return DEFAULT_LOCALE;
}

export function buildLocalizedPath(locale: Locale, path: string): string {
  const prefix = LOCALE_PATH_PREFIX[locale];
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${prefix}${normalizedPath}`;
}

export function buildCanonicalUrl(locale: Locale, path: string): string {
  return `${SITE_URL}${buildLocalizedPath(locale, path)}`;
}

export interface HreflangLink {
  hreflang: string;
  href: string;
}

export function buildHreflangLinks(path: string): HreflangLink[] {
  const links = SUPPORTED_LOCALES.map((locale) => ({
    hreflang: HREFLANG_BY_LOCALE[locale],
    href: buildCanonicalUrl(locale, path),
  }));
  links.push({
    hreflang: "x-default",
    href: buildCanonicalUrl(X_DEFAULT_LOCALE, path),
  });
  return links;
}

/**
 * A diferencia de buildLocalizedPath (que reutiliza el mismo slug en español para
 * todos los idiomas, solo cambiando el prefijo), esta función traduce también el
 * slug de la URL para las páginas estáticas registradas en PAGE_SLUGS.
 */
export function buildStaticPagePath(locale: Locale, pageKey: StaticPageKey): string {
  const prefix = LOCALE_PATH_PREFIX[locale];
  const slug = PAGE_SLUGS[pageKey][locale];
  return `${prefix}/${slug}/`;
}

export function buildStaticPageCanonical(locale: Locale, pageKey: StaticPageKey): string {
  return `${SITE_URL}${buildStaticPagePath(locale, pageKey)}`;
}

export function buildStaticPageHreflangLinks(pageKey: StaticPageKey): HreflangLink[] {
  const links = SUPPORTED_LOCALES.map((locale) => ({
    hreflang: HREFLANG_BY_LOCALE[locale],
    href: buildStaticPageCanonical(locale, pageKey),
  }));
  links.push({
    hreflang: "x-default",
    href: buildStaticPageCanonical(X_DEFAULT_LOCALE, pageKey),
  });
  return links;
}

export interface WhatsAppMessageParams {
  locale: Locale;
  marca?: string;
  modelo?: string;
  error?: string;
  urlOrigen: string;
}

export function buildWhatsAppMessage({ locale, marca, modelo, error, urlOrigen }: WhatsAppMessageParams): string {
  const template: string =
    marca && modelo
      ? error
        ? t(locale, "whatsapp.greetingWithError")
        : t(locale, "whatsapp.greetingWithoutError")
      : t(locale, "whatsapp.greetingGeneric");
  return template
    .replaceAll("{marca}", marca ?? "")
    .replaceAll("{modelo}", modelo ?? "")
    .replaceAll("{error}", error ?? "")
    .replaceAll("{url}", urlOrigen);
}

export function buildWhatsAppLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export interface ModeloRef {
  marcaSlug: string;
  modeloSlug: string;
  fuente: string;
}

export type TipoError = "bloqueo" | "notificacion" | "combinacion";

export interface ErrorConcepto {
  error_id: string;
  marcaSlug: string;
  error_name: Partial<Record<Locale, string>>;
  error_description: Partial<Record<Locale, string>>;
  symptoms: string[];
  estado_servicio: "compatible" | "no_compatible" | "requiere_revision";
  modelos_confirmados: ModeloRef[];
  tipo?: TipoError;
}

export interface ErrorCodigo {
  error_id: string;
  codigo: string;
  modelos_confirmados: ModeloRef[];
}

const erroresConceptos = erroresData.errores as ErrorConcepto[];
const erroresCodigos = erroresData.codigos as ErrorCodigo[];

function modeloEnLista(lista: ModeloRef[], marcaSlug: string, modeloSlug: string): boolean {
  return lista.some((m) => m.marcaSlug === marcaSlug && m.modeloSlug === modeloSlug);
}

export function findErrorCodigoForModelo(errorId: string, marcaSlug: string, modeloSlug: string): ErrorCodigo | undefined {
  return erroresCodigos.find(
    (codigo) => codigo.error_id === errorId && modeloEnLista(codigo.modelos_confirmados, marcaSlug, modeloSlug)
  );
}

function textoConFallback(dict: Partial<Record<Locale, string>>, locale: Locale): string {
  return dict[locale] ?? dict[DEFAULT_LOCALE] ?? "";
}

export interface ErrorResuelto {
  error_id: string;
  nombre: string;
  descripcion: string;
  codigo?: string;
  estado_servicio: ErrorConcepto["estado_servicio"];
  tipo?: TipoError;
}

/**
 * Devuelve TODOS los conceptos de error confirmados para un modelo (no solo el primero).
 * Deduplica por error_id y ordena de forma determinística (alfabética por error_id),
 * independiente del orden en que aparezcan las entradas en errores.json.
 * Genérica: no conoce ningún modelo o código específico, funciona para cualquier
 * modelo con 0, 1 o N errores confirmados.
 */
export function findErroresConfirmadosForModelo(marcaSlug: string, modeloSlug: string): ErrorConcepto[] {
  const vistos = new Set<string>();
  const resultado: ErrorConcepto[] = [];
  for (const concepto of erroresConceptos) {
    if (vistos.has(concepto.error_id)) continue;
    if (!modeloEnLista(concepto.modelos_confirmados, marcaSlug, modeloSlug)) continue;
    vistos.add(concepto.error_id);
    resultado.push(concepto);
  }
  return resultado.sort((a, b) => a.error_id.localeCompare(b.error_id));
}

/**
 * Deduce el tipo de un error a partir de su descripción oficial, SOLO cuando el
 * concepto no trae un campo `tipo` explícito. Es un respaldo, no la fuente de verdad:
 * funciona por coincidencia en textos que literalmente empiezan con esas palabras
 * ("Bloqueo"/"Notificación"/"...de Bloqueo..."), pero no todos los fabricantes
 * redactan así (ej. Canon: "Código 5b00 de Absorbedor de tinta está lleno" no
 * contiene ninguna de esas palabras, aunque sea un bloqueo real). Por eso el tipo
 * confirmado directamente por el usuario siempre tiene prioridad sobre esta inferencia.
 */
function inferirTipoDesdeTexto(descripcion: string): TipoError | undefined {
  const texto = descripcion.trim().toLowerCase();
  if (texto.includes("bloqueo")) return texto.startsWith("bloqueo") ? "bloqueo" : "combinacion";
  if (texto.startsWith("notificaci")) return "notificacion";
  return undefined;
}

/**
 * Orden de presentación orientado al estado más relevante de la impresora: los
 * errores que bloquean la impresión van primero (bloqueo puro, luego combinación
 * que incluye un bloqueo), porque son más urgentes que una notificación que no
 * impide seguir imprimiendo. Lo que no se puede clasificar cae al final de su grupo.
 *
 * Genérica: usa el campo `tipo` confirmado del concepto cuando existe (dato real,
 * no inventado); si no existe, cae al análisis de texto como respaldo. No depende
 * de ningún código o modelo concreto.
 */
function categoriaRank(tipo: TipoError | undefined): number {
  if (tipo === "bloqueo") return 0;
  if (tipo === "combinacion") return 1;
  if (tipo === "notificacion") return 2;
  return 3;
}

function estadoServicioRank(estado: ErrorConcepto["estado_servicio"]): number {
  if (estado === "compatible") return 0;
  if (estado === "requiere_revision") return 1;
  return 2; // no_compatible
}

export function resolveErroresParaModelo(marcaSlug: string, modeloSlug: string, locale: Locale): ErrorResuelto[] {
  const resueltos = findErroresConfirmadosForModelo(marcaSlug, modeloSlug).map((concepto) => {
    const codigo = findErrorCodigoForModelo(concepto.error_id, marcaSlug, modeloSlug);
    const descripcion = textoConFallback(concepto.error_description, locale);
    return {
      error_id: concepto.error_id,
      nombre: textoConFallback(concepto.error_name, locale),
      descripcion,
      codigo: codigo?.codigo,
      estado_servicio: concepto.estado_servicio,
      tipo: concepto.tipo ?? inferirTipoDesdeTexto(descripcion),
    };
  });

  // Orden determinístico: compatible antes que requiere_revision/no_compatible;
  // dentro de cada grupo, por tipo (bloqueo < combinación < notificación);
  // como último desempate, error_id (estable, nunca depende del orden accidental del JSON).
  return resueltos.sort((a, b) => {
    const estadoDiff = estadoServicioRank(a.estado_servicio) - estadoServicioRank(b.estado_servicio);
    if (estadoDiff !== 0) return estadoDiff;
    const catDiff = categoriaRank(a.tipo) - categoriaRank(b.tipo);
    if (catDiff !== 0) return catDiff;
    return a.error_id.localeCompare(b.error_id);
  });
}
