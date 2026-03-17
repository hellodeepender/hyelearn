import Link from "next/link";
import { getTranslations } from "@/lib/translations";
import { getServerLocale } from "@/lib/server-locale";

export default async function TermsPage() {
  const tc = await getTranslations("common");
  const { brandName, supportEmail, locale } = await getServerLocale();
  const languageDesc = locale === "hy" ? "Western Armenian" : tc("language");

  return (
    <div className="min-h-screen bg-warm-white">
      <header className="bg-warm-white border-b border-brown-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">{tc("brandLetter")}</span>
            <span className="text-xl font-semibold text-brown-800">{tc("brand")}</span>
          </Link>
          <Link href="/" className="text-sm text-brown-500 hover:text-brown-700">Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-brown-800 mb-2">Terms of Service</h1>
        <p className="text-sm text-brown-400 mb-8">Last updated: March 2026</p>

        <div className="space-y-8 text-brown-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-brown-800">1. Acceptance of Terms</h2>
            <p>By accessing or using {brandName}, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brown-800">2. Description of Service</h2>
            <p>{brandName} is a {languageDesc} language learning platform designed for children in Kindergarten through Grade 5. It provides structured lessons, interactive exercises, and progress tracking.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brown-800">3. Account Registration</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>You must be 18 years or older to create an account.</li>
              <li>Parents and guardians create accounts on behalf of their children.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>One account per person. Do not share account credentials.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brown-800">4. Subscriptions and Payments</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>Free tier:</strong> Limited access to the first lesson of each unit.</li>
              <li><strong>Family plan:</strong> $9.99/month or $79.99/year for full curriculum access.</li>
              <li><strong>School plan:</strong> Custom pricing via agreement.</li>
              <li>Payments are processed securely by Stripe. {brandName} never sees or stores your credit card information.</li>
              <li><strong>Cancellation:</strong> You can cancel anytime via the Stripe customer portal. Access continues until the end of your billing period.</li>
              <li><strong>Refunds:</strong> Contact {supportEmail} within 7 days of a charge for refund consideration.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brown-800">5. Acceptable Use</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>Use the platform for its intended educational purpose.</li>
              <li>Do not share your account credentials with others.</li>
              <li>Do not attempt to access other users&apos; data.</li>
              <li>Do not reverse engineer, scrape, or disrupt the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brown-800">6. Intellectual Property</h2>
            <p>All content including exercises, curriculum structure, illustrations, and user interface design is owned by {brandName}. The {languageDesc} alphabet and language are not copyrightable, but our specific presentation, exercises, and curriculum are. Teachers retain ownership of custom content they create using the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brown-800">7. Limitation of Liability</h2>
            <p>The service is provided &ldquo;as is&rdquo; without warranties of any kind. {brandName} is not liable for learning outcomes. Our maximum liability is limited to fees you have paid in the last 12 months.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brown-800">8. Termination</h2>
            <p>We may terminate accounts that violate these terms. You can delete your account at any time by contacting {supportEmail}.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brown-800">9. Governing Law</h2>
            <p>These terms are governed by the laws of the State of California, United States.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brown-800">10. Contact</h2>
            <p>{brandName} &mdash; <a href={`mailto:${supportEmail}`} className="text-gold">{supportEmail}</a></p>
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
          &copy; {new Date().getFullYear()} {brandName}
        </div>
      </footer>
    </div>
  );
}
