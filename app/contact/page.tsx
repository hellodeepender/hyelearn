"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "@/lib/use-translations";
import { useLocale } from "@/lib/locale-context";
import SiteFooter from "@/components/ui/SiteFooter";

const SUBJECTS = [
  "General Inquiry",
  "School Partnership",
  "Technical Support",
  "Billing Question",
  "Content Feedback",
];

export default function ContactPage() {
  const tc = useTranslations("common");
  const { brandName, supportEmail } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Something went wrong. Please email us directly at ${supportEmail}`);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <header className="bg-warm-white border-b border-brown-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">{tc("brandLetter")}</span>
            <span className="text-xl font-semibold text-brown-800">{tc("brand")}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-brown-600 hover:text-brown-800">{tc("logIn")}</Link>
            <Link href="/signup" className="bg-gold hover:bg-gold-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">{tc("startFree")}</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-brown-800 mb-2">Contact Us</h1>
        <p className="text-brown-500 mb-10">Have questions about {brandName}? We&apos;d love to hear from you.</p>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">{"\u2713"}</div>
                <h2 className="text-xl font-bold text-green-800 mb-2">Message sent!</h2>
                <p className="text-green-600">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-warm-white border border-brown-100 rounded-2xl p-6 shadow-sm space-y-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-brown-700 mb-1">Name</label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
                    className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-warm-white" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brown-700 mb-1">Email</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-warm-white" placeholder="you@example.com" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-brown-700 mb-1">Subject</label>
                  <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-warm-white">
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-brown-700 mb-1">Message</label>
                  <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5}
                    className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-warm-white resize-none" placeholder="How can we help?" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors">
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-brown-800 mb-2">Email</h3>
              <a href={`mailto:${supportEmail}`} className="text-gold hover:text-gold-dark font-medium">{supportEmail}</a>
            </div>
            <div>
              <h3 className="font-semibold text-brown-800 mb-2">Schools</h3>
              <p className="text-sm text-brown-500">For school partnerships and bulk pricing, select &ldquo;School Partnership&rdquo; in the form or email us directly.</p>
            </div>
            <div className="pt-4 border-t border-brown-100">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gold">{tc("brandLetter")}</span>
                <span className="font-semibold text-brown-800">{brandName}</span>
              </div>
              <p className="text-xs text-brown-400 mt-1">{tc("language")} language learning for kids</p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
