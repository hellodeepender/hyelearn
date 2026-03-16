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
  } catch {}
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
            <a href="#how-it-works" className="hidden md:inline text-brown-600 hover:text-brown-800 text-sm">How It Works</a>
            <a href="#pricing" className="hidden md:inline text-brown-600 hover:text-brown-800 text-sm">Pricing</a>
            <a href="#story" className="hidden md:inline text-brown-600 hover:text-brown-800 text-sm">Our Story</a>
            <Link href="/login" className="text-brown-600 hover:text-brown-800 text-sm">Log In</Link>
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
            <h1 className="text-4xl md:text-5xl font-bold text-brown-800 leading-tight mb-6">
              Every Armenian child deserves to know their language
            </h1>
            <p className="text-lg text-brown-500 max-w-xl mx-auto mb-10 leading-relaxed">
              A structured Western Armenian curriculum built by a mom, for Armenian families everywhere. Just 5 minutes a day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-lg text-lg font-semibold transition-colors shadow-lg shadow-gold/20">
                Start Learning Free
              </Link>
              <a href="#how-it-works" className="border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-8 py-3.5 rounded-lg text-lg font-medium transition-colors">
                See How It Works
              </a>
            </div>
          </div>
        </section>

        {/* Nora's Story */}
        <section id="story" className="py-20 px-6 bg-warm-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-brown-800 mb-8 text-center">Why I built HyeLearn</h2>
            <blockquote className="text-xl italic text-brown-600 border-l-4 border-gold pl-6 mb-8">
              &ldquo;I built this because I couldn&apos;t find what I needed for my daughter.&rdquo;
            </blockquote>
            <div className="space-y-4 text-brown-500 leading-relaxed">
              <p>
                Like many Armenian parents in the diaspora, I struggled to keep my daughter Victoria connected to our heritage language. Between school, homework, and activities, there was never time for Armenian lessons. I watched her slowly forget the Armenian words she once knew.
              </p>
              <p>
                So I decided to do something about it. I spent months working with Armenian language educators to create a structured, fun curriculum that any child could follow &mdash; just 5 minutes a day. What started as lessons for my daughter became HyeLearn.
              </p>
              <p>
                Every Armenian parent knows this struggle. You want your child to speak Armenian, but life gets in the way. HyeLearn makes it possible with just 5 minutes a day.
              </p>
            </div>
            <p className="mt-6 text-brown-700 font-medium">&mdash; Nora Nazerian, Founder &amp; Mother</p>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-6 bg-cream/40">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-brown-800 text-center mb-4">How your child learns Armenian in 5 minutes a day</h2>
            <p className="text-brown-500 text-center mb-14 max-w-xl mx-auto">A simple daily routine that fits into any family&apos;s schedule.</p>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { n: "1", icon: "📚", title: "Pick your level", desc: "Kindergarten through Grade 5. Start wherever your child is comfortable." },
                { n: "2", icon: "✨", title: "Learn new words", desc: "Each lesson teaches Armenian letters, vocabulary, and expressions through guided learning cards." },
                { n: "3", icon: "🎯", title: "Practice and progress", desc: "Interactive exercises adapt to your child's pace. Complete lessons to unlock the next level." },
                { n: "4", icon: "🏆", title: "Earn certificates", desc: "Your child earns certificates for completing each level. Print them and celebrate together!" },
              ].map((s) => (
                <div key={s.n} className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-2xl">{s.icon}</div>
                  <div>
                    <h3 className="font-semibold text-brown-800 mb-1">{s.title}</h3>
                    <p className="text-brown-500 text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 px-6 bg-warm-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-brown-800 text-center mb-10">Trusted by Armenian families</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { quote: "My daughter asks to do her Armenian lesson every day now. It's become our special 5-minute routine.", name: "Anahit M.", loc: "Glendale, CA" },
                { quote: "Finally, a Western Armenian program that actually works. The curriculum is well-structured and my son loves the stars and certificates.", name: "Sarkis T.", loc: "Pasadena, CA" },
                { quote: "As a teacher, I recommend HyeLearn to every Armenian parent. It fills a gap that nothing else does.", name: "Taline K.", loc: "Armenian Educator" },
              ].map((t) => (
                <div key={t.name} className="bg-cream/50 border border-brown-100 rounded-2xl p-6">
                  <p className="text-brown-600 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <p className="text-brown-800 text-sm font-medium">{t.name}</p>
                  <p className="text-brown-400 text-xs">{t.loc}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-brown-300 text-xs mt-6">These are early user experiences. Join them!</p>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 px-6 bg-cream/40">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brown-800 mb-3">Simple, transparent pricing</h2>
            <p className="text-brown-500">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-warm-white border border-brown-100 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-brown-800">Try HyeLearn</h3>
              <p className="text-4xl font-bold text-brown-800 mt-4">$0</p>
              <p className="text-sm text-brown-400 mt-1">Forever free</p>
              <ul className="mt-6 space-y-3 text-sm text-brown-600">
                <li>{"\u2713"} First lesson of every level</li>
                <li>{"\u2713"} Limited practice sessions</li>
                <li>{"\u2713"} Basic progress tracking</li>
              </ul>
              <Link href="/signup" className="block mt-8 text-center border-2 border-brown-200 hover:border-brown-300 text-brown-700 py-3 rounded-lg font-medium transition-colors">
                Start Free
              </Link>
            </div>
            <div className="bg-warm-white border-2 border-gold rounded-2xl p-8 relative shadow-lg">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
              <h3 className="text-lg font-semibold text-brown-800">Full Access</h3>
              <p className="text-4xl font-bold text-brown-800 mt-4">$9.99<span className="text-lg font-normal text-brown-400">/mo</span></p>
              <p className="text-sm text-brown-400 mt-1">or $79.99/year (save 33%)</p>
              <ul className="mt-6 space-y-3 text-sm text-brown-600">
                <li>{"\u2713"} Complete curriculum K-5</li>
                <li>{"\u2713"} Unlimited practice</li>
                <li>{"\u2713"} Certificates</li>
                <li>{"\u2713"} Up to 3 children</li>
              </ul>
              <Link href="/signup" className="block mt-8 text-center bg-gold hover:bg-gold-dark text-white py-3 rounded-lg font-medium transition-colors">
                Get Full Access
              </Link>
            </div>
            <div className="bg-warm-white border border-brown-100 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-brown-800">For Schools</h3>
              <p className="text-4xl font-bold text-brown-800 mt-4">Custom</p>
              <p className="text-sm text-brown-400 mt-1">Contact for pricing</p>
              <ul className="mt-6 space-y-3 text-sm text-brown-600">
                <li>{"\u2713"} Everything in Full Access</li>
                <li>{"\u2713"} Unlimited students</li>
                <li>{"\u2713"} Teacher dashboards</li>
                <li>{"\u2713"} Class management</li>
              </ul>
              <Link href="/contact" className="block mt-8 text-center border-2 border-brown-200 hover:border-brown-300 text-brown-700 py-3 rounded-lg font-medium transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        {/* Message to Parents */}
        <section className="py-20 px-6 bg-warm-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-brown-800 mb-6">A message to busy parents</h2>
            <p className="text-brown-500 leading-relaxed">
              I know how it feels. You&apos;re exhausted after work, the kids have homework, dinner needs to be made, and Armenian lessons feel like one more thing on the list. That&apos;s exactly why I made HyeLearn work in just 5 minutes. Open the app, sit with your child for one lesson, and close it. That&apos;s it. Five minutes of Armenian every day adds up to something extraordinary over a year. Your future self &mdash; and your child &mdash; will thank you.
            </p>
            <p className="text-brown-700 font-medium mt-6">&mdash; Nora</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 bg-cream/40">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-brown-800 text-center mb-10">Questions from parents</h2>
            <div className="space-y-4">
              {[
                { q: "Is this Western Armenian?", a: "Yes. All content uses Western Armenian with classical orthography \u2014 the same standard taught in Armenian day schools across the diaspora." },
                { q: "What ages is this for?", a: "Kindergarten through Grade 5. We\u2019re adding more levels regularly." },
                { q: "How is the curriculum created?", a: "Our curriculum is built and reviewed by Armenian language educators. Each lesson is carefully structured to build on the previous one." },
                { q: "Is it safe for kids?", a: "Absolutely. No ads, no social features, no external links. Your child only sees learning content." },
                { q: "Can schools use this?", a: "Yes! We offer school plans with teacher dashboards and class management. Contact us at hello@hyelearn.com." },
                { q: "Do I need to speak Armenian to help my child?", a: "No! The platform guides your child through each lesson. English hints are available when needed." },
              ].map((f) => (
                <div key={f.q} className="bg-warm-white border border-brown-100 rounded-xl p-5">
                  <h3 className="font-semibold text-brown-800 text-sm">{f.q}</h3>
                  <p className="text-sm text-brown-500 mt-1.5">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 bg-gradient-to-b from-brown-800 to-brown-900">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-cream mb-4">Start your child&apos;s Armenian journey today</h2>
            <p className="text-brown-300 mb-8">Free to start. No credit card needed. Just 5 minutes a day.</p>
            <Link href="/signup" className="inline-block bg-gold hover:bg-gold-light text-brown-900 px-8 py-3.5 rounded-lg text-lg font-semibold transition-colors">
              Create Free Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 bg-brown-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gold">{"\u0531"}</span>
              <span className="text-lg font-semibold text-cream">HyeLearn</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-brown-400">
              <Link href="/" className="hover:text-brown-300">Home</Link>
              <a href="#pricing" className="hover:text-brown-300">Pricing</a>
              <Link href="/about" className="hover:text-brown-300">Our Story</Link>
              <Link href="/contact" className="hover:text-brown-300">Contact</Link>
              <Link href="/privacy" className="hover:text-brown-300">Privacy</Link>
              <Link href="/terms" className="hover:text-brown-300">Terms</Link>
            </div>
          </div>
          <div className="border-t border-brown-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-brown-500 text-xs">Made with love for the Armenian diaspora</p>
            <p className="text-brown-500 text-xs">&copy; {new Date().getFullYear()} HyeLearn</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
