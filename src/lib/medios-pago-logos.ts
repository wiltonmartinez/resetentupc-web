import { getImage } from "astro:assets";
import bac from "../assets/mediosPago/bac.png";
import banamex from "../assets/mediosPago/banamex.png";
import bancoAgricola from "../assets/mediosPago/bancoAgricola.png";
import bancoEstado from "../assets/mediosPago/bancoEstado.png";
import bancoGeneral from "../assets/mediosPago/bancoGeneral.png";
import bancoOccidente from "../assets/mediosPago/bancoOccidente.png";
import bancoPichincha from "../assets/mediosPago/bancoPichincha.png";
import bancolombia from "../assets/mediosPago/bancolombia.png";
import banistmo from "../assets/mediosPago/banistmo.png";
import banpais from "../assets/mediosPago/banpais.png";
import banpro from "../assets/mediosPago/banpro.png";
import banrrural from "../assets/mediosPago/banrrural.png";
import bcp from "../assets/mediosPago/bcp.png";
import binance from "../assets/mediosPago/binance.png";
import breB from "../assets/mediosPago/bre-b.png";
import daviplata from "../assets/mediosPago/daviplata.png";
import mercadoPago from "../assets/mediosPago/mercadoPago.png";
import nequi from "../assets/mediosPago/nequi.png";
import paypal from "../assets/mediosPago/paypal.png";
import pix from "../assets/mediosPago/pix.png";
import plin from "../assets/mediosPago/plim.png";
import santander from "../assets/mediosPago/santander.png";
import tarjetaDebitoCredito from "../assets/mediosPago/tarjetaDebitoCredito.png";
import tuFinanciera from "../assets/mediosPago/tuFinanciera.png";
import westernUnion from "../assets/mediosPago/westernUnion.png";
import yape from "../assets/mediosPago/yape.png";

/**
 * Mapa EXACTO (no por palabra clave) del texto de `metodo.nombre` en
 * pagos.json -> logo(s) reales en src/assets/mediosPago/. Es un mapa
 * cerrado a propósito: el set de nombres en pagos.json es conocido y fijo
 * (29 valores únicos), así que emparejar por el string exacto es más
 * seguro que un match difuso por substring (nada de falsos positivos).
 *
 * Nombres compuestos ("Nequi / Bre-B") listan los 2 logos reales. Nombres
 * sin logo disponible (ej. "Caja de Ahorros", "BBVA (Bancomer)", "Spin by
 * OXXO" — no hay archivo para esos en la carpeta) mapean a array vacío:
 * el llamador debe caer al texto plano en vez de mostrar un chip vacío o
 * inventar un logo que no existe.
 */
const MAPA_LOGOS: Record<string, ImageMetadata[]> = {
  "Bancolombia (Ahorros)": [bancolombia],
  "Nequi / Bre-B": [nequi, breB],
  "Daviplata / Bre-B": [daviplata, breB],
  BancoEstado: [bancoEstado],
  PIX: [pix],
  "Banco Pichincha": [bancoPichincha],
  "Banco Agrícola (Cta. corriente)": [bancoAgricola],
  "Banco Agrícola (Cta. ahorro)": [bancoAgricola],
  "Banco General": [bancoGeneral],
  "Caja de Ahorros": [],
  Banistmo: [banistmo],
  "YAPPY / NEQUI": [nequi],
  BANRURAL: [banrrural],
  "Banco Occidente": [bancoOccidente],
  "Banco Banpaís": [banpais],
  "Banco BAC": [bac],
  Santander: [santander],
  "BBVA (Bancomer)": [],
  Banamex: [banamex],
  "Spin by OXXO": [],
  "Mercado Pago": [mercadoPago],
  BANPRO: [banpro],
  "Yape / Plin": [yape, plin],
  "Banco BCP": [bcp],
  "Tu Financiera": [tuFinanciera],
  PayPal: [paypal],
  "Binance Pay": [binance],
  "Western Union": [westernUnion],
  "Whop (Tarjeta débito/crédito)": [tarjetaDebitoCredito],
};

let cacheUrls: Record<string, string[]> | null = null;

/**
 * Resuelve el mapa de arriba a URLs finales optimizadas (vía getImage, el
 * mismo mecanismo que ya usa ContactHub.astro para la imagen de
 * notificación) — se cachea en memoria del proceso porque el resultado es
 * el mismo en cada request/build, evitando repetir el trabajo de Sharp.
 */
export async function resolverUrlsLogosMediosPago(): Promise<Record<string, string[]>> {
  if (cacheUrls) return cacheUrls;
  const resultado: Record<string, string[]> = {};
  for (const [nombre, logos] of Object.entries(MAPA_LOGOS)) {
    if (logos.length === 0) {
      resultado[nombre] = [];
      continue;
    }
    // width: 240 (no 96) para que se vea nítido al tamaño más grande que
    // ahora usa el CSS (.precios-metodo-logo, 5rem/80px de alto) incluso
    // en pantallas de alta densidad.
    const imagenes = await Promise.all(logos.map((logo) => getImage({ src: logo, width: 240 })));
    resultado[nombre] = imagenes.map((img) => img.src);
  }
  cacheUrls = resultado;
  return resultado;
}
