import { headers } from "next/headers";
import { getDomainConfig, DomainConfig } from "@/config/domains";

/**
 * Get domain config in any server component or server action.
 * Reads the host header directly — no middleware dependency.
 */
export async function getServerLocale(): Promise<DomainConfig> {
  const headersList = await headers();
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
