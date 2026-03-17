import Link from "next/link";
import { getTranslations } from "@/lib/translations";
import { getServerLocale } from "@/lib/server-locale";

export default async function AboutPage() {
  const tc = await getTranslations("common");
  const { brandName, supportEmail } = await getServerLocale();

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

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-brown-800 mb-8">About {brandName}</h1>

        <div className="space-y-6 text-brown-500 leading-relaxed">
          <p>
            {brandName} is part of DiasporaLearn, a family of heritage language learning platforms built for diaspora communities. We believe every child deserves the chance to connect with their heritage language &mdash; even when life gets busy.
          </p>
          <p>
            Our platform delivers a structured K-5 curriculum in just 5 minutes a day, making it easy for families to build language skills together. Every lesson is designed with language educators and built around the culture that makes each language special.
          </p>

          <h2 className="text-xl font-bold text-brown-800 pt-4">Our Mission</h2>
          <p>
            To help every child in the diaspora learn, read, and love their heritage language.
          </p>

          <h2 className="text-xl font-bold text-brown-800 pt-4">Our Vision</h2>
          <p>
            A world where distance and busy lives don&apos;t mean losing your language.
          </p>

          <h2 className="text-xl font-bold text-brown-800 pt-4">Contact</h2>
          <p>
            Questions, feedback, or partnership inquiries: <a href={`mailto:${supportEmail}`} className="text-gold hover:text-gold-dark font-medium">{supportEmail}</a>
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-brown-100 text-center">
          <Link href="/signup" className="bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Start Learning Free
          </Link>
        </div>
      </main>

      <footer className="py-8 px-6 border-t border-brown-100">
        <div className="max-w-6xl mx-auto text-center text-xs text-brown-400">
          Made with love for diaspora communities &middot; &copy; {new Date().getFullYear()} {brandName}
        </div>
      </footer>
    </div>
  );
}
