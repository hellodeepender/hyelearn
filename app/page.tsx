import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

async function checkAuth() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role === "teacher" || profile?.role === "admin") redirect("/teacher");
    if (profile?.role === "student") redirect("/student");
  } catch {
    // Not logged in or error — show landing page
  }
}

function LandingHeader() {
  return (
    <header className="fixed top-0 w-full bg-warm-white/80 backdrop-blur-sm border-b border-brown-100 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gold">Ա</span>
          <span className="text-xl font-semibold text-brown-800">HyeLearn</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-brown-600 hover:text-brown-800 transition-colors">
            How It Works
          </a>
          <a href="#features" className="text-brown-600 hover:text-brown-800 transition-colors">
            Features
          </a>
          <Link
            href="/login"
            className="text-brown-600 hover:text-brown-800 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-gold hover:bg-gold-dark text-white px-5 py-2 rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-warm-white to-cream">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block mb-6 px-4 py-1.5 bg-gold/10 text-earth rounded-full text-sm font-medium">
          For Armenian Day Schools
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-brown-800 leading-tight mb-6">
          AI-powered bilingual Armenian
          <br />
          <span className="text-gold">practice for schools</span>
        </h1>
        <p className="text-lg md:text-xl text-brown-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          HyeLearn generates personalized Western Armenian exercises that adapt to each
          student&apos;s level — helping teachers save time and students learn faster.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-lg text-lg font-semibold transition-colors shadow-lg shadow-gold/20"
          >
            Start Teaching with HyeLearn
          </Link>
          <a
            href="#how-it-works"
            className="border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-8 py-3.5 rounded-lg text-lg font-medium transition-colors"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: "1",
    title: "Teachers Configure",
    description:
      "Set topics, difficulty levels, and exercise types. Choose from vocabulary, grammar, reading comprehension, and more.",
    icon: "📋",
  },
  {
    number: "2",
    title: "AI Generates",
    description:
      "Claude creates tailored bilingual exercises in Western Armenian and English, matched to your curriculum and student levels.",
    icon: "🤖",
  },
  {
    number: "3",
    title: "Students Practice",
    description:
      "Students complete interactive exercises at their own pace. Difficulty adapts automatically based on their progress.",
    icon: "✏️",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-warm-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brown-800 mb-4">
            How It Works
          </h2>
          <p className="text-brown-500 text-lg max-w-xl mx-auto">
            Three simple steps to bring AI-powered Armenian learning to your classroom.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-cream/50 border border-brown-100 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold/10 text-gold font-bold text-sm mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-brown-800 mb-3">
                {step.title}
              </h3>
              <p className="text-brown-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    title: "Western Armenian + English",
    description:
      "Bilingual exercises that reinforce both languages. Students see Armenian alongside English translations and context.",
    icon: "🇦🇲",
  },
  {
    title: "AI-Generated Exercises",
    description:
      "Powered by Claude, exercises are dynamically created to match your curriculum — never repetitive, always fresh.",
    icon: "⚡",
  },
  {
    title: "Adaptive Difficulty",
    description:
      "Exercises automatically adjust to each student's proficiency level. Struggling students get more support; advanced students get challenged.",
    icon: "📊",
  },
  {
    title: "Teacher Dashboards",
    description:
      "Track class progress, identify struggling students, and configure exercises — all from one intuitive dashboard.",
    icon: "👩‍🏫",
  },
  {
    title: "Progress Tracking",
    description:
      "Detailed analytics show mastery by topic, time spent, and improvement over time for each student.",
    icon: "📈",
  },
  {
    title: "Curriculum Aligned",
    description:
      "Built specifically for Armenian day school curricula, covering vocabulary, grammar, reading, and writing.",
    icon: "📚",
  },
];

function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-cream/40">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brown-800 mb-4">
            Everything You Need
          </h2>
          <p className="text-brown-500 text-lg max-w-xl mx-auto">
            Purpose-built for Armenian language education with powerful AI at the core.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-warm-white border border-brown-100 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-brown-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-brown-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-brown-800 to-brown-900">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">
          Ready to transform Armenian learning?
        </h2>
        <p className="text-brown-300 text-lg mb-10 max-w-xl mx-auto">
          Join Armenian day schools using AI to make language learning more effective and engaging.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-gold hover:bg-gold-light text-brown-900 px-8 py-3.5 rounded-lg text-lg font-semibold transition-colors"
        >
          Get Started Free
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 bg-brown-900 border-t border-brown-700">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gold">Ա</span>
          <span className="text-lg font-semibold text-cream">HyeLearn</span>
        </div>
        <p className="text-brown-400 text-sm">
          Built for Armenian day schools &middot; Powered by AI
        </p>
        <p className="text-brown-500 text-sm">
          &copy; {new Date().getFullYear()} HyeLearn
        </p>
      </div>
    </footer>
  );
}

export default async function LandingPage() {
  await checkAuth();

  return (
    <div className="min-h-screen bg-warm-white">
      <LandingHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
