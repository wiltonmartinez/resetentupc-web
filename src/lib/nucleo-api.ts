/**
 * Cliente de la API pública de solo lectura de Núcleo (`/api/public/*`), que
 * alimenta las páginas SSR de "Prueba Social". Las formas de abajo son el
 * contrato exacto de `fila_publica_reset_realizado()` y
 * `fila_publica_cliente_satisfecho()` en Núcleo — no inventar campos nuevos
 * aquí sin agregarlos primero del lado de Núcleo.
 */
import { NUCLEO_API_BASE_URL, type Locale } from "../config/site";
import { resolveErroresParaModelo, type ErrorResuelto } from "../i18n/utils";

export interface ResetRealizadoPublico {
  slug: string;
  titulo: string;
  descripcion: string;
  marca: string;
  modelo: string;
  error: string;
  pais: string;
  youtube_id: string;
  duracion_video: string;
  fecha_servicio: string;
  fecha_publicacion: string;
}

export interface ClienteSatisfechoPublico {
  slug: string;
  titulo: string;
  marca: string;
  modelo: string;
  error: string;
  pais: string;
  html_url: string;
  fecha_publicacion: string;
}

/**
 * Galería pura de evidencias de Trustpilot — sin slug, sin título, sin
 * página individual. `/api/public/testimonios/` devuelve TODO en un único
 * llamado (sin paginación). Un testimonio no requiere pedido: puede venir
 * con número de pedido, solo email, o sin ningún dato — marca/modelo/país/
 * fecha pueden venir vacíos. Cada testimonio trae al menos una de las dos
 * evidencias (url_imgur y/o url_trustpilot_review), nunca ambas vacías.
 */
export interface TestimonioPublico {
  url_imgur: string;
  url_trustpilot_review: string;
  marca: string;
  modelo: string;
  pais: string;
  fecha: string;
}

export interface ApiMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ApiListado<T> {
  data: T[];
  meta: ApiMeta;
}

const META_VACIA: ApiMeta = { page: 1, per_page: 0, total: 0, total_pages: 0 };

// Caché en memoria por proceso, keyed por ruta exacta. Las páginas de
// modelo son estáticas (getStaticPaths, ~250 modelos × 8 idiomas): sin este
// caché, cada página repetiría el MISMO fetch (mismo marca/modelo, o
// incluso la misma lista completa sin filtrar) una vez por idioma,
// multiplicando por miles las peticiones reales a Núcleo en un solo build.
// Se cachea la Promise (no el valor ya resuelto) para que llamadas
// concurrentes a la misma ruta —Astro puede renderizar páginas en
// paralelo— compartan el mismo fetch en vuelo en vez de disparar uno cada
// una. Vive solo mientras dura el proceso de build/dev — coherente con que
// estos datos ya se tratan como "frescos hasta el próximo deploy".
const cacheJson = new Map<string, Promise<unknown>>();

async function obtenerJson<T>(ruta: string): Promise<T | null> {
  // En `astro dev` el proceso vive horas/días mientras se itera contra
  // Núcleo en vivo — cachear por proceso aquí serviría datos viejos en
  // cada recarga hasta reiniciar el servidor. El riesgo real de fetches
  // duplicados (miles por build) solo existe en `astro build`, donde el
  // caché sigue activo.
  const cacheable = !import.meta.env.DEV;

  if (cacheable) {
    const cacheada = cacheJson.get(ruta);
    if (cacheada) return cacheada as Promise<T | null>;
  }

  const promesa = (async () => {
    try {
      const respuesta = await fetch(`${NUCLEO_API_BASE_URL}${ruta}`);
      if (!respuesta.ok) return null;
      return (await respuesta.json()) as T;
    } catch {
      // Núcleo caído o inalcanzable — la página que llama decide cómo
      // degradar (lista vacía, 404, etc.), nunca se rompe el build/SSR aquí.
      return null;
    }
  })();

  if (cacheable) cacheJson.set(ruta, promesa);
  return promesa as Promise<T | null>;
}

export async function listarResetRealizados(pagina = 1, porPagina = 12): Promise<ApiListado<ResetRealizadoPublico>> {
  const resultado = await obtenerJson<ApiListado<ResetRealizadoPublico>>(
    `/api/public/reset-realizados/?page=${pagina}&per_page=${porPagina}`
  );
  return resultado ?? { data: [], meta: META_VACIA };
}

export async function obtenerResetRealizadoPorSlug(slug: string): Promise<ResetRealizadoPublico | null> {
  return obtenerJson<ResetRealizadoPublico>(`/api/public/reset-realizados/?slug=${encodeURIComponent(slug)}`);
}

export async function listarClienteSatisfecho(pagina = 1, porPagina = 12): Promise<ApiListado<ClienteSatisfechoPublico>> {
  const resultado = await obtenerJson<ApiListado<ClienteSatisfechoPublico>>(
    `/api/public/cliente-satisfecho/?page=${pagina}&per_page=${porPagina}`
  );
  return resultado ?? { data: [], meta: META_VACIA };
}

export async function obtenerClienteSatisfechoPorSlug(slug: string): Promise<ClienteSatisfechoPublico | null> {
  return obtenerJson<ClienteSatisfechoPublico>(`/api/public/cliente-satisfecho/?slug=${encodeURIComponent(slug)}`);
}

export async function listarTestimonios(): Promise<TestimonioPublico[]> {
  const resultado = await obtenerJson<{ data: TestimonioPublico[] }>(`/api/public/testimonios/`);
  return resultado?.data ?? [];
}

/**
 * Ya en producción (confirmado por el equipo de Núcleo). `modelo` es
 * opcional: pasarlo junto con `marca` no excluye los errores genéricos de
 * la marca — Núcleo ya los incluye igual (probado en vivo contra
 * epson-sc). Si Núcleo no tiene errores cargados todavía para una marca
 * (hoy el caso de "epson" y "canon") devuelve `data: []`, y quien llama a
 * esta función debe caer de vuelta a `resolveErroresParaModelo`
 * (errores.json local) — nunca debe romper la página ni bloquear el
 * selector de errores. Solo trae errores con estado_servicio "compatible"
 * (Núcleo nunca expone "no_compatible" por esta vía).
 */
export interface ErrorPublico {
  error_id: string;
  codigo: string;
  descripcion: string;
  categoria: "bloqueo" | "combinacion" | "notificacion" | "otros";
  estado_servicio: "compatible" | "requiere_revision" | "no_compatible";
  /** Todavía no la entrega Núcleo — opcional para no romper el tipo cuando se agregue. */
  modo?: string;
  /**
   * Nombre de archivo (ej. "almohadillas.jpg"), no URL — se resuelve contra
   * los assets locales en src/assets/errores/ vía getErrorImageByFilename
   * (error-images.js). Opcional: si Núcleo no la entrega, se cae al
   * mapeo existente por error_id/modeloSlug.
   */
  foto_url?: string;
}

export async function listarErroresPorModelo(marcaSlug: string, modeloSlug?: string): Promise<ErrorPublico[]> {
  const query = new URLSearchParams({ marca: marcaSlug });
  if (modeloSlug) query.set("modelo", modeloSlug);
  const resultado = await obtenerJson<{ data: ErrorPublico[] }>(`/api/public/errores/?${query.toString()}`);
  return resultado?.data ?? [];
}

function mapearErrorPublico(e: ErrorPublico): ErrorResuelto {
  return {
    error_id: e.error_id,
    nombre: e.codigo,
    descripcion: e.descripcion,
    codigo: e.codigo,
    estado_servicio: e.estado_servicio,
    tipo: e.categoria === "otros" ? undefined : e.categoria,
    modo: e.modo,
    foto_url: e.foto_url,
  };
}

/**
 * Única fuente de verdad de "¿de dónde salen los errores de este modelo?"
 * (Núcleo primero, errores.json local como respaldo) — usada tanto por
 * ModeloPage.astro (para decidir si hay algo que mostrar) como por
 * ProcedimientoImpresora.astro (para renderizar el detalle). Antes cada
 * uno hacía esta resolución por su cuenta con criterios distintos:
 * ModeloPage.astro solo miraba errores.json local, así que un modelo con
 * datos únicamente en Núcleo (sin entrada local) nunca llegaba a mostrar
 * el orquestador — quedaba atrapado en el estado "sin errores confirmados"
 * aunque Núcleo sí tuviera la data.
 */
export async function resolverErroresConNucleo(
  marcaSlug: string,
  modeloSlug: string,
  locale: Locale
): Promise<{ errores: ErrorResuelto[]; fuente: "nucleo" | "local" }> {
  const erroresNucleo = await listarErroresPorModelo(marcaSlug, modeloSlug);
  if (erroresNucleo.length > 0) {
    return { errores: erroresNucleo.map(mapearErrorPublico), fuente: "nucleo" };
  }
  return { errores: resolveErroresParaModelo(marcaSlug, modeloSlug, locale), fuente: "local" };
}

/**
 * PROPUESTO — este endpoint todavía no existe en Núcleo (ver INSTRUCCIONES
 * PARA EL BACKEND entregadas al usuario). Devuelve UNA evidencia ya elegida
 * por Núcleo (aplica su propia regla de modelo hermano + azar si hay
 * varias) para embeber directo en un <iframe> — mientras no exista,
 * `obtenerJson` devuelve null y quien la llama cae de vuelta a
 * `listarClienteSatisfecho()` filtrado por marca en el propio frontend.
 */
export interface EvidenciaClienteSatisfechoPublica {
  html_url: string;
  titulo: string;
}

export async function obtenerEvidenciaClienteSatisfecho(
  marcaSlug: string,
  modeloSlug: string
): Promise<EvidenciaClienteSatisfechoPublica | null> {
  return obtenerJson<EvidenciaClienteSatisfechoPublica>(
    `/api/public/cliente-satisfecho/evidencia/?marca=${encodeURIComponent(marcaSlug)}&modelo=${encodeURIComponent(modeloSlug)}`
  );
}

/** Título de respaldo cuando `titulo` viene vacío (campo no se llena desde el admin todavía). */
export function tituloConRespaldo(item: { titulo: string; marca: string; modelo: string; error: string; pais: string }): string {
  if (item.titulo.trim() !== "") return item.titulo;
  return [item.marca, item.modelo, item.error, item.pais].filter(Boolean).join(" ");
}
