"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

const LOCALE_DOMAINS: Record<string, string> = {
  el: "https://mathaino.net",
  hy: "https://hyelearn.com",
};

export default function AuthHashHandler() {
  useEffect(() => {
    if (!window.location.hash.includes("access_token")) return;

    const supabase = createClient();

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const locale = session.user.user_metadata?.locale || "hy";
        const domain = LOCALE_DOMAINS[locale] || "https://hyelearn.com";
        window.location.href = `${domain}/login?confirmed=true`;
      }
    });
  }, []);

  return null;
}
