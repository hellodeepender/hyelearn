"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("hyelearn_cookies_accepted")) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem("hyelearn_cookies_accepted", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-warm-white border-t border-brown-200 shadow-lg px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-brown-600">
          HyeLearn uses essential cookies for authentication. We don&apos;t use tracking or advertising cookies.{" "}
          <Link href="/cookies" className="text-gold hover:text-gold-dark font-medium">Learn more</Link>
        </p>
        <button onClick={dismiss} className="shrink-0 bg-gold hover:bg-gold-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Got it
        </button>
      </div>
    </div>
  );
}
