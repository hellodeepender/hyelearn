"use client";

import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-warm-white border-b border-brown-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">{"\u0531"}</span>
            <span className="text-xl font-semibold text-brown-800">HyeLearn</span>
          </Link>
          <Link href="/login" className="text-sm text-brown-600 hover:text-brown-800">Log In</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brown-800 mb-3">Simple, transparent pricing</h1>
          <p className="text-brown-500 text-lg mb-8">Start free, upgrade when you are ready</p>

          {/* Toggle */}
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

        <div className="grid md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-warm-white border border-brown-100 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-brown-800">Free</h3>
            <p className="text-4xl font-bold text-brown-800 mt-4">$0</p>
            <p className="text-sm text-brown-400 mt-1">Forever free</p>
            <ul className="mt-6 space-y-3 text-sm text-brown-600">
              <li>{"\u2713"} First lesson of every level</li>
              <li>{"\u2713"} 3 AI practice sessions</li>
              <li>{"\u2713"} Basic progress tracking</li>
            </ul>
            <Link href="/signup" className="block mt-8 text-center border-2 border-brown-200 hover:border-brown-300 text-brown-700 py-3 rounded-lg font-medium transition-colors">
              Get Started
            </Link>
          </div>

          {/* Family — highlighted */}
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
              <li>{"\u2713"} Unlimited AI practice</li>
              <li>{"\u2713"} Progress tracking & certificates</li>
              <li>{"\u2713"} Up to 3 student profiles</li>
              <li>{"\u2713"} Priority support</li>
            </ul>
            <Link href="/signup" className="block mt-8 text-center bg-gold hover:bg-gold-dark text-white py-3 rounded-lg font-medium transition-colors">
              Start 7-day free trial
            </Link>
          </div>

          {/* School */}
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
            <a href="mailto:hello@hyelearn.com" className="block mt-8 text-center border-2 border-brown-200 hover:border-brown-300 text-brown-700 py-3 rounded-lg font-medium transition-colors">
              Contact Us
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-brown-800 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "Is this Western Armenian?", a: "Yes! HyeLearn uses Western Armenian with classical orthography, specifically designed for Armenian day school curricula in the diaspora." },
              { q: "What ages is this for?", a: "HyeLearn covers Kindergarten through Grade 8. Our curriculum is age-appropriate with emoji-based visual learning for younger students." },
              { q: "How does the AI work?", a: "We use Claude AI to generate exercises tailored to each grade level. All content is reviewed and approved by Armenian language teachers before students see it." },
              { q: "Is it safe for kids?", a: "Absolutely. Students never interact with AI directly. All exercises are pre-generated and teacher-reviewed. No personal data is shared with AI services." },
            ].map((faq) => (
              <div key={faq.q} className="bg-warm-white border border-brown-100 rounded-xl p-5">
                <h3 className="font-semibold text-brown-800">{faq.q}</h3>
                <p className="text-sm text-brown-500 mt-2">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-brown-100 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-brown-400">
          <p>&copy; {new Date().getFullYear()} HyeLearn</p>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-brown-600">Pricing</Link>
            <a href="mailto:hello@hyelearn.com" className="hover:text-brown-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
