"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

export default function PublicHeader() {
  const { locale } = useLocale();
  const brandName = locale === "en" ? "DiasporaLearn" : locale === "el" ? "Mathaino" : locale === "ar" ? "Ta3allam" : locale === "tl" ? "Tagalog" : "HyeLearn";
  const brandLetter = locale === "en" ? "D" : locale === "el" ? "\u039C" : locale === "ar" ? "\u062A" : locale === "tl" ? "T" : "\u0531";

  return (
    <header className="sticky top-0 z-40 bg-warm-white/90 backdrop-blur-md border-b border-brown-100">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 bg-gold text-white rounded-lg flex items-center justify-center font-bold text-lg">{brandLetter}</span>
          <span className="font-bold text-brown-800">{brandName}</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/learn" className="text-sm text-brown-500 hover:text-brown-700 transition-colors">
            Curriculum
          </Link>
          <Link href="/login" className="text-sm text-brown-500 hover:text-brown-700 transition-colors">
            Log In
          </Link>
          <Link href="/signup" className="text-sm px-4 py-1.5 bg-gold text-white rounded-lg font-medium hover:bg-gold/90 transition-colors">
            Sign Up Free
          </Link>
        </div>
      </div>
    </header>
  );
}
