export const SITE_URL = "https://resetentupc.com";

export const WHATSAPP_NUMBER = "573016928346";

/**
 * Endpoint de envío de correo del formulario de contacto (AtajosWhatsApp/send-email.php,
 * en otro servidor). CONTACT_FORM_SECRET debe ser IDÉNTICO a $SECRET en ese archivo PHP.
 *
 * Este secreto viaja en el JavaScript del navegador — cualquiera puede leerlo desde las
 * herramientas de desarrollador. NO es una medida de seguridad real por sí sola; el PHP
 * ya no depende únicamente de él (ver "resetenlinea-site-contacto" en send-email.php:
 * limita destinatarios a una lista fija, limita 3 envíos por IP cada 24h, honeypot y
 * verificación de tiempo mínimo de llenado). Aun así, cambia este valor (y el del PHP)
 * por una clave propia — nunca dejes el valor de plantilla.
 */
export const CONTACT_FORM_EMAIL_ENDPOINT = "https://atajos.resetalmohadillas.com/send-email.php";
export const CONTACT_FORM_SECRET = "CAMBIA-ESTA-CLAVE-2026";

/**
 * URL ANTERIOR de descarga (módulo externo de USB Redirector). Ya NO se usa: los botones "Descargar Instalador"
 * usan INSTALADOR_DOWNLOAD_URL (más abajo). Se conserva solo como referencia.
 */
export const USB_REDIRECTOR_DOWNLOAD_URL_ANTERIOR =
  "https://www.incentivespro.com/downloads/usb-redirector-customer-module.exe";

export const TECHNICIAN_ID = "1017 4278 1017";

export const TRUSTPILOT_REVIEW_URL = "https://es.trustpilot.com/review/resetokey.com";
export const TRUSTPILOT_BUSINESSUNIT_ID = "632f593c4989634d7385bfd6";

export const RULETA_URL = "https://ruleta.resetalmohadillas.com";

/**
 * API pública de solo lectura de Núcleo (`/api/public/*`) que alimenta
 * "Prueba Social" (reset-realizados y cliente-satisfecho) — sin sesión ni
 * datos privados, CORS ya habilitado para este origen en el propio Núcleo.
 */
export const NUCLEO_API_BASE_URL = "https://nucleo.resetalmohadillas.com";

/**
 * Backend propio (local.resetalmohadillas.com). En desarrollo (`astro dev`) apunta al servidor local
 * (PUBLIC_API_URL del .env, o http://localhost:8080); en la build de producción es SIEMPRE el dominio
 * real, para que nunca quede "localhost" en el sitio publicado.
 */
export const LOCAL_API_BASE_URL: string = import.meta.env.DEV
  ? import.meta.env.PUBLIC_API_URL || "http://localhost:8080"
  : "https://local.resetalmohadillas.com";

/**
 * Vendedores EN HORARIO ahora mismo (`?pais_iso=XX`): alimenta el botón flotante (ContactHub),
 * WhatsAppCTA, "Nuestro equipo" (ContactoPage) y el selector global de cualquier enlace wa.me
 * (lib/selector-vendedores.ts). Respuesta: { data: [{ nombre, whatsapp (solo dígitos), foto, roles,
 * pais_iso ("ZZ" = Global), en_linea_restante }] }.
 */
export const VENDEDORES_API_URL = `${LOCAL_API_BASE_URL}/vendedores`;

/**
 * Precio de la instalación convertido a cada moneda (`GET /precios`). Se edita en el panel del backend
 * (Precios / Monedas): precio base en USD (impresoras 15, plotters 79), tasa y redondeo de cada moneda.
 * Respuesta: { base_usd: { impresora, plotter }, monedas: [{ codigo, nombre, simbolo, posicion, decimales,
 * precios: { impresora, plotter } }] }.
 */
export const PRECIOS_API_URL = `${LOCAL_API_BASE_URL}/precios`;

/**
 * Descarga del instalador (Instalador-ResetEntuPC-v<versión>.exe), servido por el backend: siempre la versión más
 * alta de su carpeta `instalador/`, con límite de descargas por IP. `${INSTALADOR_DOWNLOAD_URL}/info` devuelve
 * versión, tamaño y SHA-256. Tanto los botones "Descargar Instalador" como las URLs antiguas (/modulo-seguro…)
 * apuntan aquí. El backend debe estar desplegado ANTES que el frontend, o el botón dará 404.
 */
export const INSTALADOR_DOWNLOAD_URL = `${LOCAL_API_BASE_URL}/instalador`;

/**
 * Botón "Descargar Instalador" (Home, Cómo funciona y páginas de modelo) y la redirección de /modulo-seguro. En `false` no se
 * muestra ningún enlace de descarga y /modulo-seguro lleva a /como-funciona/. Se ocultó por seguridad; nada se borró: poner
 * `true` y republicar lo vuelve a mostrar. OJO: esto solo quita los enlaces del sitio; el archivo sigue disponible en
 * ${LOCAL_API_BASE_URL}/instalador mientras el backend lo sirva.
 */
export const INSTALADOR_DESCARGA_VISIBLE = false;

/**
 * Google Analytics 4 Measurement ID (ej. "G-XXXXXXXXXX"). Vacío = GA4 no se
 * carga en absoluto (BaseLayout omite el script por completo) — nunca se
 * envía telemetría a una propiedad inventada. Pon aquí el ID real cuando
 * lo tengas.
 */
export const GA_MEASUREMENT_ID = "";

/**
 * Interruptor de "Prueba Social" (ocultar, no eliminar). En `false`: sin enlace ni submenú en el menú,
 * sus URLs (/prueba-social/… y /{idioma}/prueba-social/…) redirigen 302 a la portada del idioma
 * (middleware.ts) y salen del sitemap. Nada se borra: poner `true` lo restaura. Si se vuelve a `true`,
 * quitar también las entradas "prueba-social" de `run_worker_first` en wrangler.jsonc.
 */
export const PRUEBA_SOCIAL_VISIBLE = false;

/**
 * Interruptor de la página "Consultar Garantía" (ocultar, no eliminar). En `false`: sin enlace en el menú,
 * sus URLs por idioma (PAGE_SLUGS.consultaGarantia: /consulta-garantia/, /en/warranty-check/, …) redirigen
 * 302 a la portada del idioma (middleware.ts) y salen del sitemap. El widget de consulta que se incrusta
 * en /terminos-y-condiciones/ y en las páginas de procedimiento NO se toca. Si se vuelve a `true`, quitar
 * también las entradas de estas URLs en `run_worker_first` de wrangler.jsonc.
 */
export const CONSULTA_GARANTIA_VISIBLE = false;

/**
 * Interruptor de la consulta de garantía INCRUSTADA (buscador por correo/WhatsApp/# pedido + "Certificado de
 * Garantía de Ejemplo") dentro de otras páginas: el Paso 4 de /como-funciona/, el de cada página de modelo
 * (/reset/{marca}/{modelo}/) y el texto antiguo de los Términos. En `false` no se renderiza en ninguna. Es
 * independiente de CONSULTA_GARANTIA_VISIBLE (la página propia y su enlace del menú). Nada se borró: el
 * componente ConsultaGarantiaPage.astro y CertificadoEjemplo.astro siguen en el proyecto.
 */
export const CONSULTA_GARANTIA_INCRUSTADA_VISIBLE = false;

/**
 * Video en bucle "Visual diagnostic process" (src/assets/prueba-social/diagnostico/banner-video.mp4)
 * que abre el bloque de pasos en el Home y en /como-funciona/. En `false` no se
 * renderiza. Nada se borró: el archivo y la página de Diagnóstico Gratis siguen en el proyecto.
 */
export const PASO1_VIDEO_DIAGNOSTICO_VISIBLE = false;

/**
 * Interruptor del contenido de /terminos-y-condiciones/. En `false` (actual) la página muestra las 5
 * cláusulas de la instalación (instalación vs. reparación, un único PC, función del software, proceso
 * autónomo, antivirus) + Datos del prestador + Legislación aplicable. En `true` vuelve el texto anterior
 * completo ("Reset Asistido" remoto: objeto, naturaleza, proceso, reembolsos, exclusiones, errores, garantía,
 * certificado, evidencia y privacidad). Nada se borró: los textos anteriores siguen en src/i18n/locales/.
 */
export const TERMINOS_ANTERIORES_VISIBLES = false;

/**
 * Interruptor del bloque "Negocio Formalizado y Verificado" con el visor del PDF del RUT (en /contacto/ y
 * en /terminos-y-condiciones/). En `false` el bloque no se renderiza; nada se borra (el archivo
 * src/assets/legal/RUT.pdf, el componente y los textos siguen ahí). Poner `true` lo restaura.
 */
export const RUT_VISIBLE = false;

export const DEFAULT_LOCALE = "es";

export const SUPPORTED_LOCALES = ["es", "en", "pt", "fr", "it", "de", "ru", "ko", "pl", "nl"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_PATH_PREFIX: Record<Locale, string> = {
  es: "",
  en: "/en",
  pt: "/pt",
  fr: "/fr",
  it: "/it",
  de: "/de",
  ru: "/ru",
  ko: "/ko",
  pl: "/pl",
  nl: "/nl",
};

export const HREFLANG_BY_LOCALE: Record<Locale, string> = {
  es: "es-419",
  en: "en",
  pt: "pt",
  fr: "fr",
  it: "it",
  de: "de",
  ru: "ru",
  ko: "ko",
  pl: "pl",
  nl: "nl",
};

export const X_DEFAULT_LOCALE: Locale = "es";

/**
 * Idiomas retirados de circulación: el código (páginas, diccionarios) sigue
 * existiendo para no perder el trabajo ya hecho, pero un visitante real
 * nunca ve su contenido — src/middleware.ts redirige 301 cualquier URL
 * /ru/... o /ko/... al equivalente en español, y LanguageBanner.astro no
 * los ofrece como sugerencia. Ya iban noindex,nofollow y nunca estuvieron
 * en LOCALES_VISIBLES (el menú de idiomas de LanguageSelector.astro).
 * Reactivar un idioma es quitarlo de esta lista.
 */
export const RETIRED_LOCALES: Locale[] = ["ru", "ko"];

export const LOCALE_LABELS: Record<Locale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  fr: "Français",
  it: "Italiano",
  de: "Deutsch",
  ru: "Русский",
  ko: "한국어",
  pl: "Polski",
  nl: "Nederlands",
};

// Banderas para el selector de idioma en la UI. es/en/pt son los tres
// idiomas que se ofrecen activamente en el selector (ver LanguageSelector.astro,
// LOCALES_VISIBLES) — el resto queda acá por si se necesita mostrar la bandera
// del idioma actual aunque no esté en esa lista corta (ej. alguien llega
// directo a una página en fr/it/de/ru/ko/pl/nl por un enlace viejo). pl/nl
// son contenido en borrador (traducción automática, ver pl.json/nl.json) y
// noindex,nofollow por defecto — ver LOCALES_INDEXABLES en BaseLayout.astro.
export const LOCALE_FLAGS: Record<Locale, string> = {
  es: "🇪🇸",
  en: "🇺🇸",
  pt: "🇧🇷",
  fr: "🇫🇷",
  it: "🇮🇹",
  de: "🇩🇪",
  ru: "🇷🇺",
  ko: "🇰🇷",
  pl: "🇵🇱",
  nl: "🇳🇱",
};

export const PAGE_SLUGS = {
  comoFunciona: {
    es: "como-funciona",
    en: "how-it-works",
    pt: "como-funciona",
    fr: "comment-ca-marche",
    it: "come-funziona",
    de: "wie-es-funktioniert",
    ru: "kak-eto-rabotaet",
    ko: "iyong-bangbeop",
    pl: "jak-to-dziala",
    nl: "hoe-het-werkt",
  },
  preguntasFrecuentes: {
    es: "preguntas-frecuentes",
    en: "faq",
    pt: "perguntas-frequentes",
    fr: "questions-frequentes",
    it: "domande-frequenti",
    de: "haeufige-fragen",
    ru: "chasto-zadavaemye-voprosy",
    ko: "jaju-mudneun-jilmun",
    pl: "czeste-pytania",
    nl: "veelgestelde-vragen",
  },
  contacto: {
    es: "contacto",
    en: "contact",
    pt: "contato",
    fr: "contact",
    it: "contatto",
    de: "kontakt",
    ru: "kontakty",
    ko: "munuihagi",
    pl: "kontakt",
    nl: "contact",
  },
  terminosCondiciones: {
    es: "terminos-y-condiciones",
    en: "terms-and-conditions",
    pt: "termos-e-condicoes",
    fr: "conditions-generales",
    it: "termini-e-condizioni",
    de: "allgemeine-geschaeftsbedingungen",
    ru: "usloviya-ispolzovaniya",
    ko: "iyong-yakgwan",
    pl: "regulamin",
    nl: "algemene-voorwaarden",
  },
  consultaGarantia: {
    es: "consulta-garantia",
    en: "warranty-check",
    pt: "consulta-garantia",
    fr: "verifier-garantie",
    it: "verifica-garanzia",
    de: "garantie-abfrage",
    ru: "proverka-garantii",
    ko: "bojeung-hwagin",
    pl: "sprawdz-gwarancje",
    nl: "garantie-controleren",
  },
  precios: {
    es: "precios",
    en: "pricing",
    pt: "precos",
    fr: "tarifs",
    it: "prezzi",
    de: "preise",
    ru: "tseny",
    ko: "gagyeog",
    pl: "cennik",
    nl: "prijzen",
  },
} as const satisfies Record<string, Record<Locale, string>>;

export type StaticPageKey = keyof typeof PAGE_SLUGS;
