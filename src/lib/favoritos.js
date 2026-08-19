/**
 * Favoritos del catálogo, persistidos en localStorage (sin cuenta de usuario).
 * Módulo de solo-navegador: no debe importarse desde código que corre en build/SSR.
 */
const STORAGE_KEY = "resetenlinea:favoritos";

function leer() {
  try {
    const crudo = localStorage.getItem(STORAGE_KEY);
    const lista = crudo ? JSON.parse(crudo) : [];
    return new Set(Array.isArray(lista) ? lista : []);
  } catch {
    return new Set();
  }
}

function guardar(favoritos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favoritos)));
  } catch {
    // localStorage no disponible (modo privado, storage deshabilitado, etc.)
  }
}

export function obtenerFavoritos() {
  return leer();
}

export function esFavorito(id) {
  return leer().has(id);
}

/** Alterna el estado de favorito de `id` y devuelve el nuevo estado (true = ahora es favorito). */
export function alternarFavorito(id) {
  const favoritos = leer();
  const eraFavorito = favoritos.has(id);
  if (eraFavorito) favoritos.delete(id);
  else favoritos.add(id);
  guardar(favoritos);
  return !eraFavorito;
}
