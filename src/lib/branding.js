const modules = import.meta.glob("/src/assets/branding/logo.{svg,png}", { eager: true });

const [firstMatch] = Object.values(modules);

export function getLogo() {
  return firstMatch?.default ?? null;
}
