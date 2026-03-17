import { getLocale } from "@/lib/server-locale";

type Namespace = "common" | "landing" | "dashboard";

const translationCache: Record<string, Record<string, string>> = {};

function loadTranslations(locale: string, namespace: Namespace): Record<string, string> {
  const key = `${locale}/${namespace}`;
  if (translationCache[key]) return translationCache[key];

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const translations = require(`@/locales/${locale}/${namespace}.json`);
    translationCache[key] = translations;
    return translations;
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fallback = require(`@/locales/hy/${namespace}.json`);
    translationCache[key] = fallback;
    return fallback;
  }
}

/**
 * Server component translation helper.
 *
 * Usage:
 *   const t = await getTranslations("landing");
 *   <h1>{t("heroTitle")}</h1>
 */
export async function getTranslations(namespace: Namespace = "common") {
  const locale = await getLocale();
  const translations = loadTranslations(locale, namespace);
  return (key: string) => translations[key] || key;
}
