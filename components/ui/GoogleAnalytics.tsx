"use client";

import Script from "next/script";
import { useLocale } from "@/lib/locale-context";

const GA_MAP: Record<string, string> = {
  hy: "G-8TGT94E6P2",
  el: "G-8TGT94E6P2",
  en: "G-8TGT94E6P2",
};

export default function GoogleAnalytics() {
  const { locale } = useLocale();
  const gaId = GA_MAP[locale] || GA_MAP.hy;
  if (!gaId) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}

export function trackEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, params);
  }
}
