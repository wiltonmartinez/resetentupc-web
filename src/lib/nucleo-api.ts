/**
 * Cliente de la API pública de solo lectura de Núcleo (`/api/public/*`), que
 * alimenta las páginas SSR de "Prueba Social". Las formas de abajo son el
 * contrato exacto de `fila_publica_reset_realizado()` y
 * `fila_publica_cliente_satisfecho()` en Núcleo — no inventar campos nuevos
 * aquí sin agregarlos primero del lado de Núcleo.
 */
import { NUCLEO_API_BASE_URL } from "../config/site";

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

async function obtenerJson<T>(ruta: string): Promise<T | null> {
  try {
    const respuesta = await fetch(`${NUCLEO_API_BASE_URL}${ruta}`);
    if (!respuesta.ok) return null;
    return (await respuesta.json()) as T;
  } catch {
    // Núcleo caído o inalcanzable — la página que llama decide cómo
    // degradar (lista vacía, 404, etc.), nunca se rompe el build/SSR aquí.
    return null;
  }
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

/** Título de respaldo cuando `titulo` viene vacío (campo no se llena desde el admin todavía). */
export function tituloConRespaldo(item: { titulo: string; marca: string; modelo: string; error: string; pais: string }): string {
  if (item.titulo.trim() !== "") return item.titulo;
  return [item.marca, item.modelo, item.error, item.pais].filter(Boolean).join(" ");
}
