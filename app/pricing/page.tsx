"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "@/lib/use-translations";
import { useLocale } from "@/lib/locale-context";

export default function PricingPage() {
  const tc = useTranslations("common");
  const { brandName, supportEmail, locale } = useLocale();
  const [yearly, setYearly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const languageDesc = locale === "hy" ? "Western Armenian" : tc("language");

  async function handleSubscribe() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: yearly ? "yearly" : "monthly" }),
      });

      const data = await res.json();

      if (res.status === 401) {
        window.location.href = "/signup";
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-warm-white border-b border-brown-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">{tc("brandLetter")}</span>
            <span className="text-xl font-semibold text-brown-800">{tc("brand")}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-brown-600 hover:text-brown-800">{tc("logIn")}</Link>
            <Link href="/signup" className="text-sm bg-gold hover:bg-gold-dark text-white px-4 py-1.5 rounded-lg font-medium transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brown-800 mb-3">Simple, transparent pricing</h1>
          <p className="text-brown-500 text-lg mb-8">Start free, upgrade when you are ready</p>

          <div className="inline-flex bg-warm-white border border-brown-200 rounded-lg p-1">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!yearly ? "bg-gold text-white" : "text-brown-600"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${yearly ? "bg-gold text-white" : "text-brown-600"}`}
            >
              Yearly <span className="text-xs ml-1 opacity-80">Save 33%</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-warm-white border border-brown-100 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-brown-800">Free</h3>
            <p className="text-4xl font-bold text-brown-800 mt-4">$0</p>
            <p className="text-sm text-brown-400 mt-1">Forever free</p>
            <ul className="mt-6 space-y-3 text-sm text-brown-600">
              <li>{"\u2713"} First lesson of every level</li>
              <li>{"\u2713"} Limited practice sessions</li>
              <li>{"\u2713"} Basic progress tracking</li>
            </ul>
            <Link href="/signup" className="block mt-8 text-center border-2 border-brown-200 hover:border-brown-300 text-brown-700 py-3 rounded-lg font-medium transition-colors">
              Get Started
            </Link>
          </div>

          <div className="bg-warm-white border-2 border-gold rounded-2xl p-8 relative shadow-lg">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs font-semibold px-3 py-1 rounded-full">
              Most Popular
            </span>
            <h3 className="text-lg font-semibold text-brown-800">Family</h3>
            <p className="text-4xl font-bold text-brown-800 mt-4">
              ${yearly ? "6.67" : "9.99"}
              <span className="text-lg font-normal text-brown-400">/mo</span>
            </p>
            <p className="text-sm text-brown-400 mt-1">
              {yearly ? "$79.99 billed yearly" : "$9.99 billed monthly"}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-brown-600">
              <li>{"\u2713"} Full curriculum access</li>
              <li>{"\u2713"} Unlimited practice</li>
              <li>{"\u2713"} Progress tracking & certificates</li>
              <li>{"\u2713"} Up to 3 student profiles</li>
              <li>{"\u2713"} Priority support</li>
            </ul>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="block w-full mt-8 text-center bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? "Loading..." : "Get Full Access"}
            </button>
          </div>

          <div className="bg-warm-white border border-brown-100 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-brown-800">School</h3>
            <p className="text-4xl font-bold text-brown-800 mt-4">Custom</p>
            <p className="text-sm text-brown-400 mt-1">Contact for pricing</p>
            <ul className="mt-6 space-y-3 text-sm text-brown-600">
              <li>{"\u2713"} Everything in Family</li>
              <li>{"\u2713"} Unlimited students</li>
              <li>{"\u2713"} Teacher dashboards</li>
              <li>{"\u2713"} Student progress reports</li>
              <li>{"\u2713"} Bulk account management</li>
              <li>{"\u2713"} Admin analytics</li>
            </ul>
            <a href={`mailto:${supportEmail}`} className="block mt-8 text-center border-2 border-brown-200 hover:border-brown-300 text-brown-700 py-3 rounded-lg font-medium transition-colors">
              Contact Us
            </a>
          </div>
        </div>

        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-brown-800 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: `Is this ${languageDesc}?`, a: `Yes. All content uses ${languageDesc} \u2014 the same standard taught in ${tc("language")} day schools across the diaspora.` },
              { q: "What ages is this for?", a: "Kindergarten through Grade 5, with more levels coming soon." },
              { q: "How is the curriculum created?", a: `Our curriculum is built and reviewed by ${tc("language")} language educators. Each lesson is carefully structured to build on the previous one.` },
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

      <footer className="py-8 px-6 border-t border-brown-100 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-brown-400">
          <p>&copy; {new Date().getFullYear()} {brandName}</p>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-brown-600">Pricing</Link>
            <a href={`mailto:${supportEmail}`} className="hover:text-brown-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
