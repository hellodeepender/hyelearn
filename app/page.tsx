import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

async function checkAuth() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role === "teacher" || profile?.role === "admin") redirect("/teacher");
    if (profile?.role === "student") redirect("/student");
  } catch {
    // Not logged in — show landing page
  }
}

function PricingCards() {
  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
          Start Free
        </Link>
      </div>

      <div className="bg-warm-white border-2 border-gold rounded-2xl p-8 relative shadow-lg">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </span>
        <h3 className="text-lg font-semibold text-brown-800">Family</h3>
        <p className="text-4xl font-bold text-brown-800 mt-4">$9.99<span className="text-lg font-normal text-brown-400">/mo</span></p>
        <p className="text-sm text-brown-400 mt-1">or $79.99/year (save 33%)</p>
        <ul className="mt-6 space-y-3 text-sm text-brown-600">
          <li>{"\u2713"} Full curriculum access</li>
          <li>{"\u2713"} Unlimited AI practice</li>
          <li>{"\u2713"} Certificates</li>
          <li>{"\u2713"} Up to 3 students</li>
        </ul>
        <Link href="/signup" className="block mt-8 text-center bg-gold hover:bg-gold-dark text-white py-3 rounded-lg font-medium transition-colors">
          Get Full Access
        </Link>
      </div>

      <div className="bg-warm-white border border-brown-100 rounded-2xl p-8">
        <h3 className="text-lg font-semibold text-brown-800">School</h3>
        <p className="text-4xl font-bold text-brown-800 mt-4">Custom</p>
        <p className="text-sm text-brown-400 mt-1">Contact for pricing</p>
        <ul className="mt-6 space-y-3 text-sm text-brown-600">
          <li>{"\u2713"} Everything in Family</li>
          <li>{"\u2713"} Unlimited students</li>
          <li>{"\u2713"} Teacher dashboards</li>
          <li>{"\u2713"} Class management</li>
        </ul>
        <a href="mailto:hello@hyelearn.com" className="block mt-8 text-center border-2 border-brown-200 hover:border-brown-300 text-brown-700 py-3 rounded-lg font-medium transition-colors">
          Contact Us
        </a>
      </div>
    </div>
  );
}

export default async function LandingPage() {
  await checkAuth();

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-warm-white/80 backdrop-blur-sm border-b border-brown-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">{"\u0531"}</span>
            <span className="text-xl font-semibold text-brown-800">HyeLearn</span>
          </Link>
          <nav className="flex items-center gap-6">
            <a href="#pricing" className="hidden md:inline text-brown-600 hover:text-brown-800 text-sm transition-colors">Pricing</a>
            <Link href="/login" className="text-brown-600 hover:text-brown-800 text-sm transition-colors">Log In</Link>
            <Link href="/signup" className="bg-gold hover:bg-gold-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Start Free
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-warm-white to-cream">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-brown-800 leading-tight mb-6">
              AI-powered bilingual
              <br />
              <span className="text-gold">Armenian learning</span>
            </h1>
            <p className="text-lg text-brown-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Structured Western Armenian curriculum for kids. Start free, no credit card needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-lg text-lg font-semibold transition-colors shadow-lg shadow-gold/20">
                Start Learning Free
              </Link>
              <a href="#pricing" className="border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-8 py-3.5 rounded-lg text-lg font-medium transition-colors">
                View Pricing
              </a>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6 bg-warm-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-brown-800 text-center mb-16">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { n: "1", icon: "📝", title: "Sign up free", desc: "Create an account in seconds. No credit card required." },
                { n: "2", icon: "📖", title: "Start learning", desc: "Your child practices Armenian with guided, teacher-reviewed lessons." },
                { n: "3", icon: "🚀", title: "Upgrade when ready", desc: "Unlock the full curriculum for $9.99/mo when you want more." },
              ].map((s) => (
                <div key={s.n} className="bg-cream/50 border border-brown-100 rounded-2xl p-8 text-center">
                  <div className="text-4xl mb-3">{s.icon}</div>
                  <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold/10 text-gold font-bold text-sm mb-3">{s.n}</div>
                  <h3 className="text-lg font-semibold text-brown-800 mb-2">{s.title}</h3>
                  <p className="text-brown-500 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 px-6 bg-cream/40">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brown-800 mb-3">Simple pricing</h2>
            <p className="text-brown-500">Start free, upgrade when you are ready</p>
          </div>
          <PricingCards />
        </section>

        {/* FAQ */}
        <section className="py-24 px-6 bg-warm-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-brown-800 text-center mb-10">FAQ</h2>
            <div className="space-y-4">
              {[
                { q: "Is this Western Armenian?", a: "Yes, all content uses Western Armenian with classical orthography, the standard used in diaspora Armenian schools." },
                { q: "What ages is this for?", a: "Kindergarten through Grade 5, with more levels coming soon." },
                { q: "How does the AI work?", a: "Our AI generates additional practice exercises tailored to your child's level. The core curriculum is teacher-reviewed and curated." },
                { q: "Is it safe for kids?", a: "Yes. There are no ads, no social features, and no external links. Kids only see learning content." },
                { q: "Can I use this for homeschooling?", a: "Absolutely. The Family plan gives your child a complete structured Armenian curriculum." },
              ].map((f) => (
                <div key={f.q} className="bg-cream/50 border border-brown-100 rounded-xl p-5">
                  <h3 className="font-semibold text-brown-800 text-sm">{f.q}</h3>
                  <p className="text-sm text-brown-500 mt-1.5">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-gradient-to-b from-brown-800 to-brown-900">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-cream mb-4">Start your child&apos;s Armenian journey</h2>
            <p className="text-brown-300 mb-8">Free to start. No credit card needed.</p>
            <Link href="/signup" className="inline-block bg-gold hover:bg-gold-light text-brown-900 px-8 py-3.5 rounded-lg text-lg font-semibold transition-colors">
              Create Free Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 bg-brown-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">{"\u0531"}</span>
            <span className="text-lg font-semibold text-cream">HyeLearn</span>
          </div>
          <div className="flex gap-6 text-sm text-brown-400">
            <a href="#pricing" className="hover:text-brown-300">Pricing</a>
            <a href="mailto:hello@hyelearn.com" className="hover:text-brown-300">Contact</a>
          </div>
          <p className="text-brown-500 text-sm">Built for the Armenian diaspora &middot; &copy; {new Date().getFullYear()} HyeLearn</p>
        </div>
      </footer>
    </div>
  );
}
