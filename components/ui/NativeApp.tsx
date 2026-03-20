"use client";

import { useEffect } from "react";

export default function NativeApp() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isNative = (window as unknown as { Capacitor?: { isNativePlatform: () => boolean } }).Capacitor?.isNativePlatform();
    if (!isNative) return;

    async function setupNative() {
      try {
        const { StatusBar } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: "LIGHT" as unknown as import("@capacitor/status-bar").Style });

        const { App } = await import("@capacitor/app");
        App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
      } catch {
        // Not in native context
      }
    }

    setupNative();
  }, []);

  return null;
}
