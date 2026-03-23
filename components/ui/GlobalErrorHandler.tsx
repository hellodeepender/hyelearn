"use client";

import { useEffect } from "react";
import { useLocale } from "@/lib/locale-context";

function report(data: Record<string, unknown>) {
  fetch("/api/error-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).catch(() => {});
}

export default function GlobalErrorHandler() {
  const { locale } = useLocale();

  useEffect(() => {
    function onError(event: ErrorEvent) {
      report({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        locale,
        userAgent: navigator.userAgent,
      });
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      const err = event.reason;
      report({
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        url: window.location.href,
        locale,
        userAgent: navigator.userAgent,
      });
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [locale]);

  return null;
}
