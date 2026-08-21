import { getSensorTintaParaMarca } from "../data/sensor-tinta";

const ubicacionModules = import.meta.glob("/src/assets/sensor-tinta-ubicacion/*.{png,jpg,jpeg}", { eager: true });
const limpioModules = import.meta.glob("/src/assets/sensor-tinta-limpio/*.{png,jpg,jpeg}", { eager: true });
const sucioModules = import.meta.glob("/src/assets/sensor-tinta-sucio/*.{png,jpg,jpeg}", { eager: true });

function construirMapa(modules) {
  const mapa = new Map();
  for (const [path, mod] of Object.entries(modules)) {
    const filename = path.split("/").pop();
    mapa.set(filename, mod.default);
  }
  return mapa;
}

const ubicacionMap = construirMapa(ubicacionModules);
const limpioMap = construirMapa(limpioModules);
const sucioMap = construirMapa(sucioModules);

function resolverArchivos(nombres, mapa) {
  return nombres.map((nombre) => mapa.get(nombre)).filter(Boolean);
}

export function getSensorUbicacionImages(marcaSlug) {
  const recursos = getSensorTintaParaMarca(marcaSlug);
  return recursos ? resolverArchivos(recursos.ubicacion, ubicacionMap) : [];
}

export function getSensorLimpioImages(marcaSlug) {
  const recursos = getSensorTintaParaMarca(marcaSlug);
  return recursos ? resolverArchivos(recursos.limpio, limpioMap) : [];
}

export function getSensorSucioImages(marcaSlug) {
  const recursos = getSensorTintaParaMarca(marcaSlug);
  return recursos ? resolverArchivos(recursos.sucio, sucioMap) : [];
}
