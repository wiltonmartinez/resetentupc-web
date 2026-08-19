/**
 * Fuente de popularidad de los modelos del catálogo.
 *
 * Hoy la popularidad es un valor estático editable en `src/data/modelos-muestra.json`
 * (campo `popularidad`, mayor = más popular). Cuando exista un backend que registre
 * búsquedas/consultas reales (excluyendo bots), este es el único punto que debe
 * cambiar — reemplazar `obtenerPopularidad` por esa fuente real (o combinarla con
 * este valor estático como piso) — sin tocar HomePage.astro ni la lógica de
 * filtros/orden del catálogo, que solo consumen el número que esta función devuelve.
 */
export function obtenerPopularidad(modelo) {
  return typeof modelo.popularidad === "number" ? modelo.popularidad : 0;
}
