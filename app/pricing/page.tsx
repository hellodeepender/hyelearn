"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "@/lib/use-translations";
import { useLocale } from "@/lib/locale-context";
import SupportersTicker from "@/components/ui/SupportersTicker";

const STRIPE_LINKS = {
  once_5: "https://buy.stripe.com/aFa8wOfUVd37gBf69kbfO04",
  once_10: "https://buy.stripe.com/cNi9ASeQR3sxckZ55gbfO07",
  once_25: "https://buy.stripe.com/4gMcN4389bZ3fxbdBMbfO05",
  once_50: "https://buy.stripe.com/eVq28q2451kp0ChcxIbfO03",
  monthly_3: "https://buy.stripe.com/4gM14mbEF8MR1GldBMbfO06",
  monthly_5: "https://buy.stripe.com/14AeVccIJ5AF1Gl0P0bfO02",
  monthly_10: "https://buy.stripe.com/00w00i8staUZacR2X8bfO00",
  custom: "https://buy.stripe.com/dRmfZg1019QV4Sx2X8bfO01",
};

export default function SupportPage() {
  const tc = useTranslations("common");
  const { brandName, supportEmail, locale } = useLocale();
  const languageDesc = locale === "hy" ? "Western Armenian" : tc("language");
  const searchParams = useSearchParams();
  const donated = searchParams.get("donated") === "true";

  return (
    <div className="min-h-screen bg-cream">
      <SupportersTicker />
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

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Thank-you banner */}
        {donated && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6 text-center">
            <p className="font-semibold text-lg">Thank you for your generous support! {"\uD83D\uDC99"}</p>
            <p className="text-sm text-green-600 mt-1">You&apos;re helping keep heritage language education free for families worldwide.</p>
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="text-5xl mb-4">{"\u2764\uFE0F"}</div>
          <h1 className="text-4xl font-bold text-brown-800 mb-3">Free for Everyone</h1>
          <p className="text-brown-500 text-lg max-w-2xl mx-auto">
            We believe every diaspora child deserves access to their heritage language. Our complete K-5 {languageDesc} curriculum is free &mdash; no limits, no paywalls.
          </p>
          <Link href="/signup" className="inline-block mt-6 bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Start Learning Free
          </Link>
        </div>

        {/* What you get */}
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 mb-16">
          <h2 className="text-xl font-bold text-brown-800 mb-4 text-center">Everything included, always free</h2>
          <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {[
              "Complete K-5 curriculum",
              "All exercises and practice",
              "Progress tracking & badges",
              "Cultural rewards system",
              "Audio pronunciation",
              "Works on any device",
            ].map((f) => (
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
            Your support helps us create more lessons, add new languages, and keep the platform free for families worldwide.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-4">
          {/* One-time */}
          <div className="bg-warm-white border border-brown-100 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-brown-800 mb-4">One-time donation</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: "$5", href: STRIPE_LINKS.once_5 },
                { label: "$10", href: STRIPE_LINKS.once_10 },
                { label: "$25", href: STRIPE_LINKS.once_25 },
                { label: "$50", href: STRIPE_LINKS.once_50 },
              ]).map((btn) => (
                <a key={btn.label} href={btn.href} target="_blank" rel="noopener noreferrer"
                  className="border-2 border-brown-200 hover:border-gold text-brown-700 hover:text-gold py-3 rounded-lg font-medium text-center transition-colors">
                  {btn.label}
                </a>
              ))}
            </div>
            <a href={STRIPE_LINKS.custom} target="_blank" rel="noopener noreferrer"
              className="block mt-3 border-2 border-brown-200 hover:border-gold text-brown-700 hover:text-gold py-3 rounded-lg font-medium text-center transition-colors">
              Custom Amount
            </a>
          </div>

          {/* Monthly */}
          <div className="bg-warm-white border border-brown-100 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-brown-800 mb-4">Monthly support</h3>
            <div className="space-y-3">
              {([
                { amount: "$3/month", desc: "Help cover hosting costs", href: STRIPE_LINKS.monthly_3 },
                { amount: "$5/month", desc: "Fund new lesson development", href: STRIPE_LINKS.monthly_5 },
                { amount: "$10/month", desc: "Help us add new languages", href: STRIPE_LINKS.monthly_10 },
              ]).map((tier) => (
                <a key={tier.amount} href={tier.href} target="_blank" rel="noopener noreferrer"
                  className="block border-2 border-brown-200 hover:border-gold rounded-lg p-4 transition-colors">
                  <span className="font-semibold text-brown-800">{tier.amount}</span>
                  <span className="text-sm text-brown-500 ml-2">{tier.desc}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-brown-400 text-center mb-16">Payments are processed securely by Stripe. You&apos;ll receive an email receipt.</p>

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
          <a href={`mailto:${supportEmail}?subject=School inquiry for ${brandName}`}
            className="inline-block bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Contact Us for School Pricing
          </a>
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
              { q: "Is it really completely free?", a: "Yes! The entire K-5 curriculum is free for all families. No trial period, no hidden limits. We rely on donations and school partnerships to keep it running." },
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
            <Link href="/pricing" className="hover:text-brown-600">Support</Link>
            <a href={`mailto:${supportEmail}`} className="hover:text-brown-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
