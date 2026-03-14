import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story — HyeLearn",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <header className="bg-warm-white border-b border-brown-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">{"\u0531"}</span>
            <span className="text-xl font-semibold text-brown-800">HyeLearn</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-brown-600 hover:text-brown-800">Log In</Link>
            <Link href="/signup" className="bg-gold hover:bg-gold-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Start Free</Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-brown-800 mb-8">Our Story</h1>

        <div className="space-y-6 text-brown-500 leading-relaxed">
          <p>
            HyeLearn was born from a mother&apos;s worry. Nora Nazerian, living in Northridge, California, watched her daughter Victoria slowly forget the Armenian words she once knew. Between school, homework, and activities, there was never time for Armenian lessons.
          </p>
          <p>
            Like many Armenian parents in the diaspora, Nora felt the weight of a language slipping away &mdash; a connection to grandparents, to culture, to identity. She searched for resources but found nothing that fit into the reality of a busy family&apos;s life.
          </p>
          <p>
            So she built it herself. Working with Armenian language educators, Nora created a structured curriculum that any child could follow in just 5 minutes a day. What started as lessons for her daughter became HyeLearn &mdash; a platform now used by Armenian families everywhere.
          </p>

          <blockquote className="text-xl italic text-brown-600 border-l-4 border-gold pl-6 my-8">
            &ldquo;Every Armenian parent knows this struggle. You want your child to speak Armenian, but life gets in the way. HyeLearn makes it possible with just 5 minutes a day.&rdquo;
          </blockquote>

          <h2 className="text-xl font-bold text-brown-800 pt-4">Our Mission</h2>
          <p>
            To help every Armenian child in the diaspora learn, read, and love their heritage language.
          </p>

          <h2 className="text-xl font-bold text-brown-800 pt-4">Our Vision</h2>
          <p>
            A world where distance and busy lives don&apos;t mean losing your language.
          </p>

          <h2 className="text-xl font-bold text-brown-800 pt-4">Contact</h2>
          <p>
            Questions, feedback, or partnership inquiries: <a href="mailto:hello@hyelearn.com" className="text-gold hover:text-gold-dark font-medium">hello@hyelearn.com</a>
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
          Made with love for the Armenian diaspora &middot; &copy; {new Date().getFullYear()} HyeLearn
        </div>
      </footer>
    </div>
  );
}
