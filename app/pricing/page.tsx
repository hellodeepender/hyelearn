"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "@/lib/use-translations";
import { useLocale } from "@/lib/locale-context";
import SupportersTicker from "@/components/ui/SupportersTicker";
import SiteFooter from "@/components/ui/SiteFooter";

// Keep Payment Links as fallback for monthly recurring (Checkout Sessions don't support recurring easily without a Price ID)
const MONTHLY_LINKS = {
  monthly_3: "https://buy.stripe.com/4gM14mbEF8MR1GldBMbfO06",
  monthly_5: "https://buy.stripe.com/14AeVccIJ5AF1Gl0P0bfO02",
  monthly_10: "https://buy.stripe.com/00w00i8staUZacR2X8bfO00",
};

export default function SupportPage() {
  const tc = useTranslations("common");
  const { brandName, supportEmail, locale } = useLocale();
  const isParentSite = locale === "en";
  const languageDesc = isParentSite ? "Armenian and Greek" : locale === "hy" ? "Western Armenian" : tc("language");
  const headerBrand = isParentSite ? "DiasporaLearn" : tc("brand");
  const headerLetter = isParentSite ? "D" : tc("brandLetter");
  const searchParams = useSearchParams();
  const donated = searchParams.get("donated") === "true";

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [showName, setShowName] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const amount = selectedAmount ?? (customAmount ? Number(customAmount) : 0);

  async function handleDonate() {
    if (amount < 1) return;
    setLoading(true);
    try {
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, donorName: donorName.trim() || "Anonymous", showName, message: message.trim() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <SupportersTicker />
      <header className="bg-warm-white border-b border-brown-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">{headerLetter}</span>
            <span className="text-xl font-semibold text-brown-800">{headerBrand}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-brown-600 hover:text-brown-800">{tc("logIn")}</Link>
            <Link href="/signup" className="text-sm bg-gold hover:bg-gold-dark text-white px-4 py-1.5 rounded-lg font-medium transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Thank-you banner */}
        {donated && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6 text-center">
            <p className="font-semibold text-lg">Thank you for your generous support! {"\uD83D\uDE4F"}</p>
            <p className="text-sm text-green-600 mt-1">Your donation helps keep heritage language learning accessible for every child.</p>
            {showName && <p className="text-xs text-green-500 mt-1">Your name will appear on our Wall of Gratitude shortly.</p>}
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="text-5xl mb-4">{"\u2764\uFE0F"}</div>
          <h1 className="text-4xl font-bold text-brown-800 mb-3">Built for Every Family</h1>
          <p className="text-brown-500 text-lg max-w-2xl mx-auto">
            We believe every diaspora child deserves access to their heritage language. Our complete K-5 {languageDesc} curriculum is free &mdash; no limits, no paywalls.
          </p>
          <Link href="/signup" className="inline-block mt-6 bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Start Learning
          </Link>
        </div>

        {/* What you get */}
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 mb-16">
          <h2 className="text-xl font-bold text-brown-800 mb-4 text-center">Everything included</h2>
          <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {["Complete K-5 curriculum", "All exercises and practice", "Progress tracking & badges", "Cultural rewards system", "Audio pronunciation", "Works on any device"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-brown-600">
                <span className="text-green-600">{"\u2713"}</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Support our mission */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-brown-800 mb-3">Support Our Mission</h2>
          <p className="text-brown-500 max-w-xl mx-auto">
            Your support helps us create more lessons, add new languages, and keep the platform accessible for families worldwide.
          </p>
        </div>

        {/* One-time donation with form */}
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 mb-6">
          <h3 className="text-lg font-semibold text-brown-800 mb-4">One-time donation</h3>

          {/* Amount selection */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[5, 10, 25, 50].map((amt) => (
              <button key={amt}
                onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                className={`py-3 rounded-lg font-medium text-center transition-colors ${selectedAmount === amt ? "bg-gold text-white" : "border-2 border-brown-200 text-brown-700 hover:border-gold hover:text-gold"}`}>
                ${amt}
              </button>
            ))}
          </div>
          <input type="number" min="1" placeholder="Custom amount ($)"
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
            className="w-full px-4 py-3 border border-brown-200 rounded-lg bg-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 mb-6" />

          {/* Donor info (shown when amount selected) */}
          {amount >= 1 && (
            <div className="border-t border-brown-100 pt-6 space-y-4">
              <input type="text" placeholder="Your name (optional)"
                value={donorName} onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-4 py-2.5 border border-brown-200 rounded-lg bg-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)}
                  className="w-4 h-4 rounded border-brown-300 text-gold focus:ring-gold" />
                <span className="text-sm text-brown-600">Display my name on the Wall of Gratitude</span>
              </label>
              <input type="text" placeholder="Add a message (optional)" maxLength={200}
                value={message} onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 border border-brown-200 rounded-lg bg-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" />
              <button onClick={handleDonate} disabled={loading || amount < 1}
                className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors">
                {loading ? "Redirecting to Stripe..." : `Donate $${amount} \u2192`}
              </button>
              <p className="text-xs text-brown-400 text-center">Payments processed securely by Stripe. You&apos;ll receive an email receipt.</p>
            </div>
          )}
        </div>

        {/* Monthly (still uses Payment Links) */}
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 mb-16">
          <h3 className="text-lg font-semibold text-brown-800 mb-4">Monthly support</h3>
          <div className="space-y-3">
            {([
              { amount: "$3/month", desc: "Help cover hosting costs", href: MONTHLY_LINKS.monthly_3 },
              { amount: "$5/month", desc: "Fund new lesson development", href: MONTHLY_LINKS.monthly_5 },
              { amount: "$10/month", desc: "Help us add new languages", href: MONTHLY_LINKS.monthly_10 },
            ]).map((tier) => (
              <a key={tier.amount} href={tier.href} target="_blank" rel="noopener noreferrer"
                className="block border-2 border-brown-200 hover:border-gold rounded-lg p-4 transition-colors">
                <span className="font-semibold text-brown-800">{tier.amount}</span>
                <span className="text-sm text-brown-500 ml-2">{tier.desc}</span>
              </a>
            ))}
          </div>
        </div>

        {/* For Schools */}
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-brown-800 mb-2">For Schools</h2>
          <p className="text-brown-500 mb-4">
            Need classroom features? Teacher dashboards, class management, and progress reports for your {languageDesc} program.
          </p>
          <ul className="space-y-2 text-sm text-brown-600 mb-6">
            <li>{"\u2713"} Unlimited students</li>
            <li>{"\u2713"} Teacher dashboards</li>
            <li>{"\u2713"} Class management & join codes</li>
            <li>{"\u2713"} Student progress reports</li>
            <li>{"\u2713"} Admin analytics</li>
          </ul>
          <Link href="/contact?subject=school"
            className="inline-block bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Contact Us for School Pricing
          </Link>
        </div>

        {/* For Organizations */}
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 mb-16">
          <h2 className="text-xl font-bold text-brown-800 mb-2">For Organizations & Grants</h2>
          <p className="text-brown-500 mb-4">
            We partner with diaspora organizations, churches, and cultural foundations to expand heritage language education.
          </p>
          <a href={`mailto:${supportEmail}?subject=Partnership inquiry for ${brandName}`}
            className="inline-block border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-6 py-3 rounded-lg font-medium transition-colors">
            Get in Touch
          </a>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-brown-800 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: `Is this ${languageDesc}?`, a: `Yes. All content uses ${languageDesc} \u2014 the same standard taught in ${tc("language")} day schools across the diaspora.` },
              { q: "What ages is this for?", a: "Kindergarten through Grade 5, with more levels coming soon." },
              { q: "Does it really cost nothing?", a: "Yes! The entire K-5 curriculum has no cost for families. No trial period, no hidden limits. We rely on donations and school partnerships to keep it running." },
              { q: "Is it safe for kids?", a: "Absolutely. No ads, no social features, no external links. Your child only sees learning content." },
            ].map((faq) => (
              <div key={faq.q} className="bg-warm-white border border-brown-100 rounded-xl p-5">
                <h3 className="font-semibold text-brown-800">{faq.q}</h3>
                <p className="text-sm text-brown-500 mt-2">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
