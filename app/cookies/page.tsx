import Link from "next/link";
import { getTranslations } from "@/lib/translations";
import { getServerLocale } from "@/lib/server-locale";
import SiteFooter from "@/components/ui/SiteFooter";

export default async function CookiePolicyPage() {
  const tc = await getTranslations("common");
  const { brandName, supportEmail } = await getServerLocale();

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
        <h1 className="text-3xl font-bold text-brown-800 mb-2">Cookie Policy</h1>
        <p className="text-sm text-brown-400 mb-8">Last updated: March 2026</p>

        <div className="space-y-8 text-brown-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-brown-800">What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and keep you logged in.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brown-800">Cookies We Use</h2>
            <p><strong>Essential authentication cookie:</strong> We use a single cookie from our authentication provider (Supabase) to keep you logged in. This cookie is required for the service to function. Without it, you would need to sign in on every page visit.</p>
            <p className="mt-3 font-medium text-brown-800">That&apos;s it. We do not use any marketing, analytics, advertising, or third-party tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brown-800">Managing Cookies</h2>
            <p>You can manage cookies through your browser settings. Note that disabling cookies will prevent you from staying logged in to {brandName}.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brown-800">Contact</h2>
            <p>Questions about our cookie practices? Contact us at <a href={`mailto:${supportEmail}`} className="text-gold">{supportEmail}</a>.</p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
