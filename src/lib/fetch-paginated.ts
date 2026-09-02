interface PaginatedResponse {
  data: any[];
  meta?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Trae todas las páginas de un endpoint paginado de Núcleo (formato
 * { data: [...], meta: { page, per_page, total, total_pages } }).
 * Usa per_page=50 (máximo permitido por la API) y sigue pidiendo
 * páginas mientras total_pages lo indique, para no depender de que
 * el volumen de datos actual quepa en una sola página.
 */
export async function fetchAllPages(baseUrl: string, timeout = 10000): Promise<any[]> {
  const separator = baseUrl.includes("?") ? "&" : "?";
  const results: any[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await fetch(`${baseUrl}${separator}per_page=50&page=${page}`, { timeout });
    if (!response.ok) break;

    const json: PaginatedResponse = await response.json();
    if (Array.isArray(json?.data)) {
      results.push(...json.data);
    }

    totalPages = json?.meta?.total_pages ?? 1;
    page += 1;
  } while (page <= totalPages);

  return results;
}
