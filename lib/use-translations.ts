"use client";

import { useCurrentLocale } from "@/lib/locale-context";

type Namespace = "common" | "landing" | "dashboard";

import hyCommon from "@/locales/hy/common.json";
import elCommon from "@/locales/el/common.json";
import hyLanding from "@/locales/hy/landing.json";
import elLanding from "@/locales/el/landing.json";

const allTranslations: Record<string, Record<string, Record<string, string>>> = {
  hy: { common: hyCommon, landing: hyLanding },
  el: { common: elCommon, landing: elLanding },
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
