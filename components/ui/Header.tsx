"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useTranslations } from "@/lib/use-translations";

interface HeaderProps {
  userName: string;
  userRole: string;
}

export default function Header({ userName: initialName, userRole: initialRole }: HeaderProps) {
  const t = useTranslations("common");
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const [displayName, setDisplayName] = useState(initialName);
  const [displayRole, setDisplayRole] = useState(initialRole);

  // Background refresh — server already provides correct values via props,
  // so we show those immediately and silently update if the client fetch returns newer data
  useEffect(() => {
    const supabase = supabaseRef.current;

    async function refreshProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Try user_metadata first (always available, no DB query needed)
        const metaName = (user.user_metadata?.full_name ?? user.user_metadata?.name) as string | undefined;
        const metaRole = user.user_metadata?.role as string | undefined;

        // Then try profiles table for the freshest data
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.full_name) {
          setDisplayName(profile.full_name);
          setDisplayRole(profile.role);
        } else if (metaName) {
          setDisplayName(metaName);
          if (metaRole) setDisplayRole(metaRole);
        }
      } catch (err) {
        console.error("[Header] Profile refresh error:", err);
      }
    }

    refreshProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogout() {
    await supabaseRef.current.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="bg-warm-white border-b border-brown-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href={displayRole === "teacher" || displayRole === "admin" ? "/teacher" : "/student"}
          className="flex items-center gap-2"
        >
          <span className="text-2xl font-bold text-gold">{t("brandLetter")}</span>
          <span className="text-xl font-semibold text-brown-800">{t("brand")}</span>
        </Link>
        <div className="flex items-center gap-3">
          <p className="text-sm text-brown-600">
            <span className="font-medium text-brown-800">{displayName}</span>
            <span className="text-brown-300 mx-1.5 hidden sm:inline">&middot;</span>
            <span className="capitalize hidden sm:inline">{displayRole}</span>
          </p>
          <button
            onClick={handleLogout}
            className="text-sm text-brown-500 hover:text-brown-700 border border-brown-200 hover:border-brown-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            {t("logOut")}
          </button>
        </div>
      </div>
    </header>
  );
}
