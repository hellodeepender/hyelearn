import { headers } from "next/headers";
import { getDomainConfig, DomainConfig, DOMAIN_MAP } from "@/config/domains";

/**
 * Get domain config in any server component or server action.
 *
 * Usage:
 *   const { locale, brandName } = await getServerLocale();
 */
export async function getServerLocale(): Promise<DomainConfig> {
  const headersList = await headers();

  // Prefer the pre-resolved header from middleware
  const domain = headersList.get("x-domain");
  if (domain && DOMAIN_MAP[domain]) {
    return DOMAIN_MAP[domain];
  }

  // Fallback: parse host header
  const host = headersList.get("host") || "hyelearn.com";
  return getDomainConfig(host);
}

/**
 * Get just the locale string — for database queries.
 *
 * Usage:
 *   const locale = await getLocale();
 *   const lessons = await supabase.from('lessons').select().eq('locale', locale);
 */
export async function getLocale() {
  const config = await getServerLocale();
  return config.locale;
}
