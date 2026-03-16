"use client";

import Link from "next/link";
import { useState } from "react";

export default function PaymentSuccessPage() {
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    setPortalLoading(false);
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-4">{"\u{1F389}"}</div>
        <h1 className="text-2xl font-bold text-brown-800 mb-2">Welcome to HyeLearn Full Access!</h1>
        <p className="text-brown-500 mb-8">
          Your subscription is active. Your child now has access to the complete K-5 Armenian curriculum.
        </p>
        <Link href="/student" className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors mb-4">
          Start Learning
        </Link>
        <p className="text-sm text-brown-400">
          <button onClick={handleManageSubscription} disabled={portalLoading}
            className="text-gold hover:text-gold-dark font-medium disabled:opacity-50">
            {portalLoading ? "Loading..." : "Manage your subscription"}
          </button>
        </p>
      </div>
    </div>
  );
}
