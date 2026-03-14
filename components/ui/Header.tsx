"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface HeaderProps {
  userName: string;
  userRole: string;
}

export default function Header({ userName: initialName, userRole: initialRole }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState(initialName);
  const [displayRole, setDisplayRole] = useState(initialRole);

  // If server didn't resolve the name (RLS issue), fetch client-side
  useEffect(() => {
    if (initialName && initialName !== "Student" && initialName !== "Teacher") return;

    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setDisplayName(profile.full_name);
        setDisplayRole(profile.role);
      } else if (user.user_metadata?.full_name) {
        setDisplayName(user.user_metadata.full_name as string);
        setDisplayRole((user.user_metadata.role as string) ?? initialRole);
      }
    }

    fetchProfile();
  }, [initialName, initialRole, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="bg-warm-white border-b border-brown-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gold">Ա</span>
          <span className="text-xl font-semibold text-brown-800">HyeLearn</span>
        </Link>
        <div className="flex items-center gap-4">
          <p className="text-sm text-brown-600 hidden sm:block">
            <span className="font-medium text-brown-800">{displayName}</span>
            <span className="text-brown-300 mx-1.5">&middot;</span>
            <span className="capitalize">{displayRole}</span>
          </p>
          <button
            onClick={handleLogout}
            className="text-sm text-brown-500 hover:text-brown-700 border border-brown-200 hover:border-brown-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
