import { NextRequest, NextResponse } from "next/server";
import { getDomainConfig } from "@/config/domains";

export async function GET(request: NextRequest) {
  const hostname = request.headers.get("host") || "hyelearn.com";
  const config = getDomainConfig(hostname);

  const manifest = {
    name: config.brandName,
    short_name: config.brandName,
    description:
      config.locale === "el" ? "Learn Greek — interactive K-5 lessons for diaspora kids"
        : config.locale === "ar" ? "Learn Arabic — interactive K-5 lessons for diaspora kids"
        : config.locale === "tl" ? "Learn Tagalog — interactive K-5 lessons for diaspora kids"
        : config.locale === "hy" ? "Learn Armenian — interactive K-5 lessons for diaspora kids"
        : "Heritage language learning platforms for diaspora communities",
    start_url: "/",
    display: "standalone",
    background_color: config.theme.bg,
    theme_color: config.theme.primary,
    orientation: "portrait",
    categories: ["education", "kids"],
    icons: [
      { src: `/icons/icon-${config.locale}-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `/icons/icon-${config.locale}-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `/icons/icon-${config.locale}-192.png`, sizes: "192x192", type: "image/png", purpose: "maskable" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=86400" },
  });
}
