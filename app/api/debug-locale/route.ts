import { headers } from "next/headers";
import { getDomainConfig } from "@/config/domains";

export const dynamic = "force-dynamic";

export async function GET() {
  const headersList = await headers();
  const host = headersList.get("host");
  const xForwardedHost = headersList.get("x-forwarded-host");
  const config = getDomainConfig(host || "unknown");

  return Response.json({
    host,
    xForwardedHost,
    resolvedLocale: config.locale,
    resolvedBrand: config.brandName,
  });
}
