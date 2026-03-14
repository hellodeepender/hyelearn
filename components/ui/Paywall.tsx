"use client";

import Link from "next/link";
import { useState } from "react";

interface Props {
  message?: string;
  type?: "curriculum" | "ai";
}

export default function Paywall({ message, type = "curriculum" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpgrade() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: "monthly" }),
      });

      const data = await res.json();

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      // Show the actual error from the API
      console.error("[Paywall] Checkout failed:", data);
      setError(data.error ?? "Payment setup failed. Please try again.");
    } catch (err) {
      console.error("[Paywall] Network error:", err);
      setError("Network error. Please check your connection and try again.");
    }

    setLoading(false);
  }

  const defaultMessage = type === "ai"
    ? "You've used all 3 free AI practice sessions. Upgrade for unlimited practice."
    : "You've completed the free lesson! Upgrade to continue learning.";

  return (
    <div className="max-w-lg mx-auto text-center py-12 px-6">
      <div className="text-5xl mb-4">{"\u{1F393}"}</div>
      <h2 className="text-2xl font-bold text-brown-800 mb-2">
        Keep your learning streak going!
      </h2>
      <p className="text-brown-500 mb-6">
        {message ?? defaultMessage}
      </p>

      <div className="bg-warm-white border border-brown-100 rounded-2xl p-6 mb-6 text-left">
        <p className="text-sm font-semibold text-brown-700 mb-3">Family Plan includes:</p>
        <ul className="space-y-2 text-sm text-brown-600">
          <li>{"\u2713"} Full curriculum — all levels and lessons</li>
          <li>{"\u2713"} Unlimited AI practice sessions</li>
          <li>{"\u2713"} Progress tracking and certificates</li>
          <li>{"\u2713"} Up to 3 student profiles</li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-white px-6 py-3.5 rounded-lg font-semibold transition-colors text-lg"
        >
          {loading ? "Connecting to Stripe..." : "Upgrade to Family — $9.99/mo"}
        </button>
        <Link
          href="/pricing"
          className="text-sm text-brown-400 hover:text-brown-600 transition-colors"
        >
          View all plans and yearly pricing
        </Link>
        <Link
          href="/student/curriculum"
          className="text-sm text-brown-400 hover:text-brown-600 transition-colors"
        >
          Back to Curriculum
        </Link>
      </div>
    </div>
  );
}
