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

export const DEFAULT_LOCALE = "es";

export const SUPPORTED_LOCALES = ["es", "en", "pt", "fr", "it"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_PATH_PREFIX: Record<Locale, string> = {
  es: "",
  en: "/en",
  pt: "/pt",
  fr: "/fr",
  it: "/it",
};

export const HREFLANG_BY_LOCALE: Record<Locale, string> = {
  es: "es-419",
  en: "en",
  pt: "pt",
  fr: "fr",
  it: "it",
};

export const X_DEFAULT_LOCALE: Locale = "es";

export const LOCALE_LABELS: Record<Locale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  fr: "Français",
  it: "Italiano",
};

export const PAGE_SLUGS = {
  comoFunciona: {
    es: "como-funciona",
    en: "how-it-works",
    pt: "como-funciona",
    fr: "comment-ca-marche",
    it: "come-funziona",
  },
  preguntasFrecuentes: {
    es: "preguntas-frecuentes",
    en: "faq",
    pt: "perguntas-frequentes",
    fr: "questions-frequentes",
    it: "domande-frequenti",
  },
  contacto: {
    es: "contacto",
    en: "contact",
    pt: "contato",
    fr: "contact",
    it: "contatto",
  },
} as const satisfies Record<string, Record<Locale, string>>;

export type StaticPageKey = keyof typeof PAGE_SLUGS;
