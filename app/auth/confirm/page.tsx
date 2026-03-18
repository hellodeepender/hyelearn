"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const LOCALE_DOMAINS: Record<string, string> = {
  el: "https://mathaino.net",
  hy: "https://hyelearn.com",
};

export default function AuthConfirmPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function handleAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const locale = session.user.user_metadata?.locale || "hy";
        const domain = LOCALE_DOMAINS[locale] || "https://hyelearn.com";
        const currentOrigin = window.location.origin;

        if (currentOrigin.includes(domain)) {
          router.push("/login?confirmed=true");
        } else {
          window.location.href = `${domain}/login?confirmed=true`;
        }
        return;
      }

      // No session — try to extract from hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        const { data: { session: newSession } } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (newSession?.user) {
          const locale = newSession.user.user_metadata?.locale || "hy";
          const domain = LOCALE_DOMAINS[locale] || "https://hyelearn.com";
          window.location.href = `${domain}/login?confirmed=true`;
          return;
        }
      }

      window.location.href = "https://hyelearn.com/login";
    }

    handleAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="text-brown-500">Confirming your email...</p>
    </div>
  );
}
