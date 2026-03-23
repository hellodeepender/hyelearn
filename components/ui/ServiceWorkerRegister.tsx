"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Skip SW in Capacitor webview — causes caching issues and potential crashes
    const isNative = (window as unknown as { Capacitor?: { isNativePlatform: () => boolean } }).Capacitor?.isNativePlatform();
    if (isNative) return;

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        console.log("SW registered:", reg.scope);
      }).catch((err) => {
        console.log("SW registration failed:", err);
      });
    }
  }, []);

  return null;
}
