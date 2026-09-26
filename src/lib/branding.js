// Logo animado (LOGO.gif) con prioridad; si no existe, cae al logo estático.
const animated = import.meta.glob("/src/assets/branding/LOGO.gif", { eager: true });
const modules = import.meta.glob("/src/assets/branding/logo.{svg,png}", { eager: true });

const [firstAnimated] = Object.values(animated);
const [firstMatch] = Object.values(modules);

export function getLogo() {
  return (firstAnimated ?? firstMatch)?.default ?? null;
}
