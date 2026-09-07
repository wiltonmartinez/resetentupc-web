/**
 * Mapa EXACTO (no por palabra clave) del texto de `metodo.nombre` en
 * pagos.json -> logo(s) reales en public/mediosPago/. Es un mapa cerrado a
 * propósito: el set de nombres en pagos.json es conocido y fijo, así que
 * emparejar por el string exacto es más seguro que un match difuso por
 * substring (nada de falsos positivos).
 *
 * Nombres compuestos ("Nequi / Bre-B") listan los 2 logos reales.
 *
 * Rutas ESTÁTICAS (public/), no `astro:assets`/`getImage()` a propósito:
 * Cloudflare Workers no soporta Sharp en runtime ("Cloudflare does not
 * support sharp at runtime"), y /precios/ es una página SSR (necesita leer
 * cf-ipcountry en cada request) — no puede beneficiarse del
 * imageService:"compile" que solo optimiza páginas prerenderizadas en
 * build. Llamar a getImage() en el runtime de un Worker producía logos
 * rotos de forma intermitente (los primeros del mapa "parecían" funcionar,
 * los últimos fallaban — ver commit que introdujo este archivo vs. el que
 * lo reemplazó). Estos PNG ya vienen del proveedor con tamaño razonable
 * (~250x250), así que servirlos tal cual — sin passthrough de Sharp — no
 * pierde nada visible a los ~5rem que se muestran en pantalla.
 */
const MAPA_LOGOS: Record<string, string[]> = {
  "Bancolombia (Ahorros)": ["/mediosPago/bancolombia.png"],
  "Nequi / Bre-B": ["/mediosPago/nequi.png", "/mediosPago/bre-b.png"],
  "Daviplata / Bre-B": ["/mediosPago/daviplata.png", "/mediosPago/bre-b.png"],
  BancoEstado: ["/mediosPago/bancoEstado.png"],
  PIX: ["/mediosPago/pix.png"],
  "Banco Pichincha": ["/mediosPago/bancoPichincha.png"],
  "Banco Agrícola (Cta. corriente)": ["/mediosPago/bancoAgricola.png"],
  "Banco Agrícola (Cta. ahorro)": ["/mediosPago/bancoAgricola.png"],
  "Banco General": ["/mediosPago/bancoGeneral.png"],
  "Caja de Ahorros": ["/mediosPago/cajadearhorros.png"],
  Banistmo: ["/mediosPago/banistmo.png"],
  "YAPPY / NEQUI": ["/mediosPago/nequi.png"],
  BANRURAL: ["/mediosPago/banrrural.png"],
  "Banco Occidente": ["/mediosPago/bancoOccidente.png"],
  "Banco Banpaís": ["/mediosPago/banpais.png"],
  "Banco BAC": ["/mediosPago/bac.png"],
  Santander: ["/mediosPago/santander.png"],
  "BBVA (Bancomer)": ["/mediosPago/bancomer.png"],
  Banamex: ["/mediosPago/banamex.png"],
  "Spin by OXXO": ["/mediosPago/oxxo.png"],
  "Mercado Pago": ["/mediosPago/mercadoPago.png"],
  BANPRO: ["/mediosPago/banpro.png"],
  "Yape / Plin": ["/mediosPago/yape.png", "/mediosPago/plim.png"],
  "Banco BCP": ["/mediosPago/bcp.png"],
  "Tu Financiera": ["/mediosPago/tuFinanciera.png"],
  PayPal: ["/mediosPago/paypal.png"],
  "Binance Pay": ["/mediosPago/binance.png"],
  "Western Union": ["/mediosPago/westernUnion.png"],
  "Whop (Tarjeta débito/crédito)": ["/mediosPago/tarjetaDebitoCredito.png"],
};

/**
 * Resuelve el mapa de arriba. Firma async por compatibilidad con el único
 * llamador (paisesPrecioPublico en lib/precios.ts) — no hace ningún trabajo
 * asíncrono real, solo devuelve las rutas estáticas ya conocidas en build.
 */
export async function resolverUrlsLogosMediosPago(): Promise<Record<string, string[]>> {
  return MAPA_LOGOS;
}
