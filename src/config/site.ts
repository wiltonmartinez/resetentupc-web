export const SITE_URL = "https://resetenlinea.com";

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

export const USB_REDIRECTOR_DOWNLOAD_URL =
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
 * Google Analytics 4 Measurement ID (ej. "G-XXXXXXXXXX"). Vacío = GA4 no se
 * carga en absoluto (BaseLayout omite el script por completo) — nunca se
 * envía telemetría a una propiedad inventada. Pon aquí el ID real cuando
 * lo tengas.
 */
export const GA_MEASUREMENT_ID = "";

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
