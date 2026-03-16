import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HyeLearn — Learn Western Armenian Online | K-5 Curriculum",
  description: "The first interactive Western Armenian learning platform for K-5 students. Start free. Used by Armenian day schools and families worldwide.",
};

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

function Img({ src, alt, className, priority }: { src: string; alt: string; className?: string; priority?: boolean }) {
  // Try loading image, show placeholder if file doesn't exist yet
  return (
    <Image src={src} alt={alt} fill className={`object-cover ${className ?? ""}`} priority={priority} sizes="100vw"
      onError={undefined} />
  );
}

export default async function LandingPage() {
  await checkAuth();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "name": "HyeLearn",
        "url": "https://hyelearn.com",
        "description": "Interactive Western Armenian learning platform for K-5 students",
      },
      {
        "@type": "Course",
        "name": "Western Armenian for Kids (K-5)",
        "description": "Complete Western Armenian language curriculum from Kindergarten through Grade 5",
        "provider": { "@type": "Organization", "name": "HyeLearn", "url": "https://hyelearn.com" },
        "educationalLevel": "K-5",
        "inLanguage": ["en", "hy"],
        "isAccessibleForFree": true,
        "offers": [
          { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free tier" },
          { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Full Access Monthly" },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header className="fixed top-0 w-full bg-warm-white/80 backdrop-blur-sm border-b border-brown-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">{"\u0531"}</span>
            <span className="text-xl font-semibold text-brown-800">HyeLearn</span>
          </Link>
          <nav className="flex items-center gap-6">
            <a href="#features" className="hidden md:inline text-brown-600 hover:text-brown-800 text-sm">Features</a>
            <a href="#curriculum" className="hidden md:inline text-brown-600 hover:text-brown-800 text-sm">Curriculum</a>
            <a href="#pricing" className="hidden md:inline text-brown-600 hover:text-brown-800 text-sm">Pricing</a>
            <Link href="/login" className="text-brown-600 hover:text-brown-800 text-sm">Log In</Link>
            <Link href="/signup" className="bg-gold hover:bg-gold-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Start Free
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ============ HERO ============ */}
        <section className="relative pt-16 min-h-[600px] md:min-h-[700px] flex items-center">
          <div className="absolute inset-0 bg-brown-800">
            <Img src="/images/hero-ararat.jpg" alt="Mount Ararat landscape" priority className="opacity-40" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Teach Your Child Armenian
            </h1>
            <p className="text-lg md:text-xl text-cream/90 max-w-2xl mx-auto mb-10 leading-relaxed">
              The first interactive K-5 Western Armenian learning platform for families and schools
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/signup" className="bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg shadow-black/20">
                Start Free
              </Link>
              <a href="#schools" className="border-2 border-white/40 hover:border-white/60 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors">
                For Schools
              </a>
            </div>
            <p className="text-cream/60 text-sm">Free forever for Kindergarten. No credit card needed.</p>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="how-it-works" className="py-20 px-6 bg-warm-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-brown-800 text-center mb-4">Learning Armenian has never been easier</h2>
            <p className="text-brown-500 text-center mb-14 max-w-xl mx-auto">Three simple steps to get started.</p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "\uD83D\uDC64", title: "Sign up in seconds", desc: "Create a free account and your child starts learning immediately." },
                { icon: "\u2728", title: "Learn through play", desc: "Interactive lessons with audio, matching games, and instant feedback." },
                { icon: "\uD83C\uDFC6", title: "Watch them grow", desc: "Track progress, earn badges, and climb Mount Ararat together." },
              ].map((s) => (
                <div key={s.title} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-3xl mx-auto mb-4">{s.icon}</div>
                  <h3 className="font-semibold text-brown-800 text-lg mb-2">{s.title}</h3>
                  <p className="text-brown-500 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FEATURES SHOWCASE ============ */}
        <section id="features" className="py-20 px-6 bg-cream/40">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-brown-800 text-center mb-14">Built for Armenian families</h2>

            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-brown-100">
                <Img src="/images/screenshot-lesson.jpg" alt="Armenian lesson with audio pronunciation" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brown-800 mb-3">Audio-first learning</h3>
                <p className="text-brown-500 leading-relaxed">
                  Every letter and word comes with native Armenian pronunciation. Kids learn to speak, not just read.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div className="md:order-2 relative aspect-[4/3] rounded-2xl overflow-hidden bg-brown-100">
                <Img src="/images/screenshot-dashboard.jpg" alt="Student dashboard with badges and XP" />
              </div>
              <div className="md:order-1">
                <h3 className="text-2xl font-bold text-brown-800 mb-3">Armenian-themed rewards</h3>
                <p className="text-brown-500 leading-relaxed">
                  Earn the Pomegranate badge, climb Mount Ararat, and collect achievements rooted in Armenian culture.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-brown-100">
                <Img src="/images/kids-tablet.jpg" alt="Children learning Armenian on a tablet" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brown-800 mb-3">From screen to notebook</h3>
                <p className="text-brown-500 leading-relaxed">
                  HyeLearn doesn&apos;t just teach on screens &mdash; it inspires kids to pick up a pencil and practice. Digital lessons build the foundation, real writing makes it stick.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CURRICULUM PREVIEW ============ */}
        <section id="curriculum" className="py-20 px-6 bg-warm-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-brown-800 text-center mb-4">A complete K-5 Armenian curriculum</h2>
            <p className="text-brown-500 text-center mb-12 max-w-xl mx-auto">
              Structured learning from the Armenian alphabet to reading comprehension and cultural awareness.
            </p>
            <div className="space-y-3">
              {[
                { grade: "Kindergarten", icon: "\uD83C\uDF1F", desc: "Armenian alphabet, basic vocabulary, simple expressions", expanded: true },
                { grade: "Grade 1", icon: "\uD83D\uDCD6", desc: "Reading skills, expanded vocabulary, simple sentences" },
                { grade: "Grade 2", icon: "\uD83D\uDCD5", desc: "Reading comprehension, grammar basics, cultural awareness" },
                { grade: "Grade 3", icon: "\u270D\uFE0F", desc: "Intermediate vocabulary, verb conjugation, Armenian history" },
                { grade: "Grade 4", icon: "\uD83D\uDCDA", desc: "Advanced reading, complex grammar, Armenian literature" },
                { grade: "Grade 5", icon: "\uD83C\uDF93", desc: "Fluency building, essay writing, cultural projects" },
              ].map((g) => (
                <div key={g.grade} className="bg-warm-white border border-brown-100 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{g.icon}</span>
                    <span className="font-semibold text-brown-800">{g.grade}</span>
                  </div>
                  {g.expanded ? (
                    <p className="text-brown-500 text-sm mt-2 ml-9">{g.desc}</p>
                  ) : (
                    <p className="text-brown-400 text-sm mt-1 ml-9">{g.desc}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FOR SCHOOLS ============ */}
        <section id="schools" className="py-20 px-6 bg-brown-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-brown-800 text-center mb-4">Trusted by Armenian day schools</h2>
            <p className="text-brown-500 text-center mb-14 max-w-xl mx-auto">Give your teachers the tools to teach Armenian effectively.</p>
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              {[
                { icon: "\uD83D\uDCCA", title: "Teacher dashboards", desc: "Monitor student progress, manage classes, customize content." },
                { icon: "\uD83C\uDFEB", title: "Class management", desc: "Join codes, student rosters, automatic grade-level assignment." },
                { icon: "\uD83D\uDCB0", title: "Affordable pricing", desc: "Starting at $3/student/year. Contact us for a school package." },
              ].map((f) => (
                <div key={f.title} className="bg-warm-white border border-brown-100 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-brown-800 mb-2">{f.title}</h3>
                  <p className="text-brown-500 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/contact" className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Contact Us for School Pricing
              </Link>
              <p className="text-brown-400 text-sm mt-3">Or email schools@hyelearn.com</p>
            </div>
          </div>
        </section>

        {/* ============ WHY HYELEARN ============ */}
        <section className="py-20 px-6 bg-warm-white">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-brown-800 text-center mb-6">Why HyeLearn?</h2>
            <p className="text-brown-500 leading-relaxed text-center max-w-2xl mx-auto">
              Armenian families in the diaspora face a common challenge &mdash; keeping their children connected to their heritage language. Between school, homework, and activities, there&apos;s never enough time for Armenian. HyeLearn was built to solve this. A structured, interactive Western Armenian curriculum that works in just 5 minutes a day. Designed with Armenian language educators, every lesson builds on the last &mdash; from the alphabet through reading comprehension. No textbooks, no scheduling conflicts. Just open it up, learn together, and watch your child&apos;s Armenian grow.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-brown-800 text-center mb-10">What makes HyeLearn different?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: "\u0531", title: "Built for Western Armenian", desc: "Not Eastern Armenian, not a translation. Purpose-built curriculum using classical orthography \u2014 the standard taught in diaspora schools." },
                { icon: "\uD83C\uDFD4\uFE0F", title: "Armenian culture woven in", desc: "Earn badges named after Armenian landmarks. Climb Mount Ararat as you level up. Learn through culturally meaningful content." },
                { icon: "\u23F1\uFE0F", title: "Made for busy families", desc: "5 minutes a day is all it takes. Works on any device \u2014 phone, tablet, or laptop. No scheduling, no driving to lessons." },
              ].map((c) => (
                <div key={c.title} className="bg-cream/50 border border-brown-100 rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-3">{c.icon}</div>
                  <h3 className="font-semibold text-brown-800 mb-2">{c.title}</h3>
                  <p className="text-brown-500 text-sm leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PRICING ============ */}
        <section id="pricing" className="py-20 px-6 bg-cream/40">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brown-800 mb-3">Simple pricing</h2>
            <p className="text-brown-500">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-warm-white border border-brown-100 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-brown-800">Kindergarten Starter</h3>
              <p className="text-4xl font-bold text-brown-800 mt-4">$0</p>
              <p className="text-sm text-brown-400 mt-1">Forever free</p>
              <ul className="mt-6 space-y-3 text-sm text-brown-600">
                <li>{"\u2713"} Kindergarten lessons</li>
                <li>{"\u2713"} Basic curriculum access</li>
                <li>{"\u2713"} Progress tracking</li>
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
                <li>{"\u2713"} Complete K-5 curriculum</li>
                <li>{"\u2713"} Extra practice (5 sessions/day)</li>
                <li>{"\u2713"} Armenian-themed badges &amp; rewards</li>
                <li>{"\u2713"} Up to 3 children</li>
              </ul>
              <Link href="/signup" className="block mt-8 text-center bg-gold hover:bg-gold-dark text-white py-3 rounded-lg font-medium transition-colors">
                Get Full Access
              </Link>
            </div>
            <div className="bg-warm-white border border-brown-100 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-brown-800">For Schools</h3>
              <p className="text-4xl font-bold text-brown-800 mt-4">Contact us</p>
              <p className="text-sm text-brown-400 mt-1">Custom school pricing</p>
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

        {/* ============ FAQ ============ */}
        <section className="py-20 px-6 bg-warm-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-brown-800 text-center mb-10">Questions from parents</h2>
            <div className="space-y-4">
              {[
                { q: "Is this Western Armenian?", a: "Yes. All content uses Western Armenian with classical orthography \u2014 the same standard taught in Armenian day schools across the diaspora." },
                { q: "What ages is this for?", a: "Kindergarten through Grade 5. We\u2019re adding more levels regularly." },
                { q: "Do I need to speak Armenian to help my child?", a: "No! The platform guides your child through each lesson. English hints are available when needed." },
                { q: "Is it safe for kids?", a: "Absolutely. No ads, no social features, no external links. Your child only sees learning content. COPPA compliant." },
                { q: "How is the curriculum created?", a: "Our curriculum is designed for Western Armenian learners and structured to build progressively from the alphabet through reading comprehension. Content is reviewed by Armenian language educators for accuracy." },
                { q: "Can schools use this?", a: "Yes! We offer school plans with teacher dashboards and class management. Contact us at schools@hyelearn.com." },
                { q: "How long does each lesson take?", a: "About 5 minutes. Short enough to fit into any daily routine, long enough to make real progress." },
                { q: "How do I keep my child focused on HyeLearn?", a: "Use your device\u2019s built-in focus mode! On iPad or iPhone, turn on Guided Access (Settings \u2192 Accessibility \u2192 Guided Access). Once enabled, triple-click the side button while HyeLearn is open \u2014 your child won\u2019t be able to leave the app until you unlock it. On Android, use Screen Pinning (Settings \u2192 Security). These features are designed exactly for this and work better than anything we could build into a website." },
              ].map((f) => (
                <div key={f.q} className="bg-cream/30 border border-brown-100 rounded-xl p-5">
                  <h3 className="font-semibold text-brown-800 text-sm">{f.q}</h3>
                  <p className="text-sm text-brown-500 mt-1.5">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="relative py-24 px-6">
          <div className="absolute inset-0 bg-brown-800">
            <Img src="/images/alphabet-monument.jpg" alt="Armenian alphabet monument" className="opacity-30" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">Your child&apos;s Armenian journey starts today</h2>
            <p className="text-brown-300 mb-8 text-lg">Join families across the diaspora who are keeping the language alive.</p>
            <Link href="/signup" className="inline-block bg-gold hover:bg-gold-light text-brown-900 px-10 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg">
              Start Learning Free
            </Link>
            <p className="text-brown-400 text-sm mt-6">Questions? Contact us at support@hyelearn.com</p>
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
              <Link href="/pricing" className="hover:text-brown-300">Pricing</Link>
              <Link href="/contact" className="hover:text-brown-300">Contact</Link>
              <Link href="/privacy" className="hover:text-brown-300">Privacy</Link>
              <Link href="/terms" className="hover:text-brown-300">Terms</Link>
              <Link href="/cookies" className="hover:text-brown-300">Cookies</Link>
            </div>
          </div>
          <div className="border-t border-brown-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-brown-500 text-xs">Interactive Western Armenian learning for K-5 students</p>
            <p className="text-brown-500 text-xs">&copy; {new Date().getFullYear()} HyeLearn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
