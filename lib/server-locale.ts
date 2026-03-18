import { headers } from "next/headers";
import { getDomainConfig, DomainConfig, DOMAIN_MAP } from "@/config/domains";

/**
 * Get domain config in any server component or server action.
 * Prefers the x-locale header set by middleware (reliable on Vercel),
 * falls back to host-based detection.
 */
export async function getServerLocale(): Promise<DomainConfig> {
  const headersList = await headers();

  // Prefer middleware-set locale (always correct, even behind Vercel edge)
  const xLocale = headersList.get("x-locale");
  if (xLocale) {
    // Find the config matching this locale
    const config = Object.values(DOMAIN_MAP).find((c) => c.locale === xLocale);
    if (config) return config;
  }

  // Fallback: read host directly
  const host = headersList.get("host") || "hyelearn.com";
  return getDomainConfig(host);
}

/**
 * Get just the locale string — for database queries.
 */
export async function getLocale() {
  const config = await getServerLocale();
  return config.locale;
}