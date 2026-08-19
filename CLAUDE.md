# ResetEnLinea-Site

Sitio público de ResetEnLinea, construido con Astro. La especificación completa del proyecto está en [RESETENLINEA-ASTRO-PROYECTO.md](RESETENLINEA-ASTRO-PROYECTO.md) — léela antes de proponer cambios estructurales.

## Reglas críticas

- Antes de crear, modificar, sobrescribir, eliminar, mover o renombrar archivos, informar qué se hará y esperar autorización explícita. Leer, analizar, inspeccionar y proponer no requiere autorización previa.
- `ResetEnLinea-SEO-Audit` (si se referencia en el futuro) es una fuente de solo lectura. Nunca escribir ni modificar nada allí; los datos necesarios se copian a `src/data/`.
- `ResetHUB` (WooCommerce/WordPress) es arquitectura obsoleta y está fuera de alcance. No reutilizar nada de ahí.
- El número de WhatsApp vive únicamente en `src/config/site.ts` (`WHATSAPP_NUMBER`). Nunca escribirlo manualmente en páginas o componentes.
- El español (`es`, código SEO `es-419`) es el idioma predeterminado y no lleva prefijo de URL. Los demás idiomas (`en`, `pt`, `fr`, `it`) sí llevan prefijo (`/en/`, `/pt/`, `/fr/`, `/it/`).
- La estructura de páginas de modelo es `/reset/{marca}/{modelo}/` (y su equivalente con prefijo de idioma). La familia de producto es dato/navegación, no parte obligatoria de la URL.
- El mensaje inicial de WhatsApp nunca debe incluir automáticamente la modalidad de servicio (remoto/local); esa decisión se toma después, en la conversación.
- Cada CTA de WhatsApp lleva un `source_id` propio para trazabilidad futura.

## Estado actual

Bloque 1 (piloto): 4 modelos, 5 idiomas, 40 rutas. Ver la sección 21 de la especificación para el alcance exacto y la sección 22 para lo que deliberadamente no se implementa todavía.
