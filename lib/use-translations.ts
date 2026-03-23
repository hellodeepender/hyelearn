"use client";

import { useCurrentLocale } from "@/lib/locale-context";

type Namespace = "common" | "landing" | "dashboard";

import hyCommon from "@/locales/hy/common.json";
import elCommon from "@/locales/el/common.json";
import arCommon from "@/locales/ar/common.json";
import enCommon from "@/locales/en/common.json";
import hyLanding from "@/locales/hy/landing.json";
import elLanding from "@/locales/el/landing.json";
import arLanding from "@/locales/ar/landing.json";

const allTranslations: Record<string, Record<string, Record<string, string>>> = {
  hy: { common: hyCommon, landing: hyLanding },
  el: { common: elCommon, landing: elLanding },
  ar: { common: arCommon, landing: arLanding },
  en: { common: enCommon },
};

/**
 * Client component translation hook.
 *
 * Usage:
 *   const t = useTranslations("landing");
 *   <h1>{t("heroTitle")}</h1>
 */
export function useTranslations(namespace: Namespace = "common") {
  const locale = useCurrentLocale();
  const translations = allTranslations[locale]?.[namespace] || allTranslations.hy[namespace] || {};
  return (key: string) => translations[key] || key;
}
