"use client";

import { useState } from "react";
import Link from "next/link";

export default function AccountClient({ hasStripe, planSlug }: { hasStripe: boolean; planSlug: string }) {
  const [loading, setLoading] = useState(false);

  async function handleManageBilling() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {planSlug === "free" && (
        <div className="bg-gold/10 border border-gold/20 rounded-xl p-5">
          <p className="text-brown-700 font-medium mb-2">Upgrade to unlock everything</p>
          <p className="text-sm text-brown-500 mb-4">Get full curriculum access, unlimited AI practice, and certificates.</p>
          <Link href="/pricing" className="bg-gold hover:bg-gold-dark text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors">
            View Plans
          </Link>
        </div>
      )}

      {hasStripe && (
        <button
          onClick={handleManageBilling}
          disabled={loading}
          className="w-full border-2 border-brown-200 hover:border-brown-300 text-brown-700 py-3 rounded-lg font-medium text-sm transition-colors"
        >
          {loading ? "Loading..." : "Manage Billing"}
        </button>
      )}

      <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
        <h3 className="text-sm font-medium text-brown-500 mb-2">Have a promo code?</h3>
        <PromoRedeemer />
      </div>
    </div>
  );
}

function PromoRedeemer() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleRedeem() {
    if (!code.trim()) return;
    setStatus("loading");
    const res = await fetch("/api/promo/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      setMessage(`Code accepted! You have ${data.days} days of full access.`);
    } else {
      setStatus("error");
      setMessage(data.error);
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus("idle"); }}
        placeholder="Enter code"
        className="flex-1 px-3 py-2 border border-brown-200 rounded-lg text-sm bg-warm-white focus:outline-none focus:ring-2 focus:ring-gold/50 uppercase"
      />
      <button
        onClick={handleRedeem}
        disabled={status === "loading" || !code.trim()}
        className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        {status === "loading" ? "..." : "Redeem"}
      </button>
      {status === "success" && <p className="text-green-600 text-xs mt-1 col-span-2">{message}</p>}
      {status === "error" && <p className="text-red-500 text-xs mt-1 col-span-2">{message}</p>}
    </div>
  );
}
