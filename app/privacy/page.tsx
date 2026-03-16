import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — HyeLearn" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <header className="bg-warm-white border-b border-brown-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">{"\u0531"}</span>
            <span className="text-xl font-semibold text-brown-800">HyeLearn</span>
          </Link>
          <Link href="/" className="text-sm text-brown-500 hover:text-brown-700">Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-brown-800 mb-2">Privacy Policy</h1>
        <p className="text-sm text-brown-400 mb-8">Last updated: March 2026</p>

        <nav className="bg-cream/50 border border-brown-100 rounded-xl p-4 mb-10">
          <p className="text-xs font-medium text-brown-500 uppercase mb-2">Contents</p>
          <ol className="space-y-1 text-sm text-gold">
            {["Introduction", "Information We Collect", "How We Use Information", "Children's Privacy (COPPA)", "Data Sharing", "Data Retention", "Data Security", "Your Rights", "Changes", "Contact"].map((s, i) => (
              <li key={i}><a href={`#section-${i + 1}`} className="hover:text-gold-dark">{i + 1}. {s}</a></li>
            ))}
          </ol>
        </nav>

        <div className="prose-brown space-y-8 text-brown-600 text-sm leading-relaxed">
          <section id="section-1">
            <h2 className="text-lg font-semibold text-brown-800">1. Introduction</h2>
            <p>HyeLearn is an Armenian language learning platform designed for children in Kindergarten through Grade 5. We are committed to protecting the privacy of all our users, especially children. This policy explains what information we collect, how we use it, and how we protect it.</p>
          </section>

          <section id="section-2">
            <h2 className="text-lg font-semibold text-brown-800">2. Information We Collect</h2>
            <p><strong>From parents and guardians:</strong> Email address, name, and password (stored securely hashed by our authentication provider).</p>
            <p><strong>From children:</strong> First name only, lesson progress, and exercise scores.</p>
            <p><strong>We do NOT collect:</strong> Date of birth, photographs, precise location, device identifiers, social media accounts, or any information beyond what is necessary to provide the educational service.</p>
          </section>

          <section id="section-3">
            <h2 className="text-lg font-semibold text-brown-800">3. How We Use Information</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>To provide the Armenian language learning service</li>
              <li>To track learning progress for parents and teachers</li>
              <li>To process subscription payments (via Stripe)</li>
              <li>To send transactional emails (account confirmations, password resets)</li>
            </ul>
            <p className="mt-3 font-medium text-brown-800">We NEVER use children&apos;s data for advertising, marketing, profiling, or sale to third parties.</p>
          </section>

          <section id="section-4" className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-brown-800">4. Children&apos;s Privacy (COPPA Compliance)</h2>
            <p>HyeLearn is designed for children under 13 and complies with the Children&apos;s Online Privacy Protection Act (COPPA).</p>
            <ul className="list-disc ml-5 space-y-1 mt-2">
              <li>We require verifiable parental consent: a parent or guardian must create the account.</li>
              <li>Children cannot create accounts independently.</li>
              <li>We collect minimal data from children: first name and learning progress only.</li>
              <li>No children&apos;s personal information is shared with third parties for marketing or advertising.</li>
              <li>Parents can review, request deletion of, or refuse further collection of their child&apos;s data by contacting <a href="mailto:support@hyelearn.com" className="text-gold">support@hyelearn.com</a>.</li>
              <li>Schools using HyeLearn may act as the parent&apos;s agent for COPPA consent in the educational context.</li>
            </ul>
          </section>

          <section id="section-5">
            <h2 className="text-lg font-semibold text-brown-800">5. Data Sharing</h2>
            <p>We use the following third-party services to operate HyeLearn:</p>
            <ul className="list-disc ml-5 space-y-1 mt-2">
              <li><strong>Supabase</strong> — Database hosting and authentication (US region)</li>
              <li><strong>Vercel</strong> — Web hosting (US)</li>
              <li><strong>Stripe</strong> — Payment processing (PCI compliant). Only receives parent payment data, never children&apos;s data.</li>
              <li><strong>Narakeet</strong> — Text-to-speech audio. Only Armenian text is sent; no user data.</li>
              <li><strong>Resend</strong> — Transactional email. Only parent email for confirmations.</li>
            </ul>
            <p className="mt-3">No children&apos;s personal information is shared with any third party for marketing, advertising, or any purpose other than operating the service.</p>
          </section>

          <section id="section-6">
            <h2 className="text-lg font-semibold text-brown-800">6. Data Retention</h2>
            <p>Account data is retained while the account is active. Upon deletion request, all data is removed within 30 days. Payment records are retained as required by applicable law.</p>
          </section>

          <section id="section-7">
            <h2 className="text-lg font-semibold text-brown-800">7. Data Security</h2>
            <p>We protect your data with encryption in transit (HTTPS) and at rest. Passwords are hashed and never stored in plaintext. We use role-based access controls to limit data access.</p>
          </section>

          <section id="section-8">
            <h2 className="text-lg font-semibold text-brown-800">8. Your Rights</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>Parents can access, correct, or delete their child&apos;s data at any time.</li>
              <li>You have the right to opt out of non-essential communications.</li>
              <li>To exercise these rights, contact <a href="mailto:support@hyelearn.com" className="text-gold">support@hyelearn.com</a>.</li>
            </ul>
          </section>

          <section id="section-9">
            <h2 className="text-lg font-semibold text-brown-800">9. Changes to This Policy</h2>
            <p>If we make material changes, we will notify you by email. Continued use after changes constitutes acceptance.</p>
          </section>

          <section id="section-10">
            <h2 className="text-lg font-semibold text-brown-800">10. Contact</h2>
            <p>HyeLearn &mdash; <a href="mailto:support@hyelearn.com" className="text-gold">support@hyelearn.com</a></p>
          </section>
        </div>
      </main>

      <footer className="py-8 px-6 border-t border-brown-100 mt-12">
        <div className="max-w-4xl mx-auto text-center text-xs text-brown-400">
          <div className="flex justify-center gap-6 mb-3">
            <Link href="/privacy" className="hover:text-brown-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brown-600">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-brown-600">Cookie Policy</Link>
          </div>
          &copy; {new Date().getFullYear()} HyeLearn
        </div>
      </footer>
    </div>
  );
}
