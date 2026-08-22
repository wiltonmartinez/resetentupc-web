/**
 * Envío de eventos a Google Analytics 4 (gtag). Si GA4 no está configurado
 * (ver GA_MEASUREMENT_ID en config/site.ts) window.gtag nunca existe, así
 * que esto simplemente no hace nada — nunca falla ni bloquea al usuario.
 */
export function trackEvent(name, params = {}) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
