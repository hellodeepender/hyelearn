import Link from "next/link";
import Image from "next/image";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import PortfolioHeader from "@/components/ui/PortfolioHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DiasporaLearn — Heritage Language Learning for Diaspora Children",
  description: "DiasporaLearn offers K-5 Armenian and Greek curriculum for diaspora families. Interactive lessons, audio pronunciation, Sunday school content, and culturally grounded learning. Learn at hyelearn.com and mathaino.net.",
  alternates: { canonical: "https://diasporalearn.org/" },
};

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

const products = [
  {
    name: "HyeLearn",
    letter: "\u0531",
    letterColor: "#C4384B",
    language: "Western Armenian",
    url: "https://hyelearn.com",
    description: "The first interactive K-5 Western Armenian curriculum. Built for Armenian day schools and diaspora families. Alphabet, vocabulary, grammar, and cultural content — all with native audio pronunciation.",
    grades: "K\u20135",
    status: "Live",
    statusColor: "bg-green-100 text-green-700",
    screenshot: "/images/portfolio/screenshot-hyelearn.png",
  },
  {
    name: "Mathaino",
    letter: "\u039C",
    letterColor: "#2271B3",
    language: "Modern Greek",
    url: "https://mathaino.net",
    description: "Interactive Greek language learning for K-5 students. Greek alphabet, vocabulary, reading comprehension, and cultural awareness — designed for Greek schools and families in the diaspora.",
    grades: "K\u20135",
    status: "Live",
    statusColor: "bg-green-100 text-green-700",
    screenshot: "/images/portfolio/screenshot-mathaino.png",
  },
  {
    name: "Ta3allam",
    letter: "\u0639",
    letterColor: "#2E7D32",
    language: "Arabic",
    url: "https://ta3allam.org",
    description: "Interactive Arabic language learning for K-5 students. Arabic alphabet, vocabulary, reading comprehension, and cultural awareness \u2014 designed for Arabic-speaking diaspora families.",
    grades: "K\u20135",
    status: "Live",
    statusColor: "bg-green-100 text-green-700",
    screenshot: "/images/portfolio/screenshot-ta3allam.png",
  },
];

const stats = [
  { value: "3", label: "Languages" },
  { value: "365+", label: "Lessons" },
  { value: "72", label: "Sunday School Lessons" },
  { value: "474", label: "Audio Files" },
  { value: "$0", label: "Cost" },
];

export default function PortfolioPage() {
  return (
    <div className={`${serif.variable} ${sans.variable} min-h-screen bg-[#FAFAFA]`} style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
      <PortfolioHeader />

      <main>
        {/* 1. Hero */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 style={{ fontFamily: "var(--font-dm-serif)" }} className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight mb-6">
              DiasporaLearn: Helping kids stay connected to their roots
            </h1>
            <p className="text-lg text-[#555] max-w-2xl mx-auto leading-relaxed mb-10">
              Interactive learning platforms for heritage languages. K-5 curriculum, Sunday school lessons, and native audio — built for diaspora families.
            </p>
            <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-lg">
              <Image src="/images/portfolio/hero-illustration.jpg" alt="DiasporaLearn — heritage language learning for kids" width={1200} height={500} className="w-full h-auto max-h-[350px] object-cover" priority />
            </div>
          </div>
        </section>

        {/* 2. Stats bar */}
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto bg-[#FBF0E8] border border-[#E8D5C4] rounded-2xl py-6 px-4">
            <div className="grid grid-cols-5">
              {stats.map((s, i) => (
                <div key={s.label} className={`text-center px-2 ${i < stats.length - 1 ? "border-r border-[#E0D5C8]" : ""}`}>
                  <p style={{ fontFamily: "var(--font-dm-serif)" }} className="text-2xl md:text-3xl font-bold text-[#C4384B]">{s.value}</p>
                  <p className="text-[10px] md:text-xs text-[#888] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Sunday School */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-10">
              <h2 style={{ fontFamily: "var(--font-dm-serif)" }} className="text-2xl text-[#1a1a1a] text-center mb-2">
                {"\u271D"} Sunday School
              </h2>
              <p className="text-center text-[#777] mb-8">Weekly lessons for Armenian, Greek, and Arabic church Sunday schools</p>

              <p className="text-[#555] leading-relaxed mb-4">
                Teachers lead lessons from their phone. Kids get printable word search worksheets. No account needed — just open and teach.
              </p>
              <p className="text-[#555] leading-relaxed mb-8">
                Each lesson includes an opening prayer, a teacher-led story, heritage language vocabulary with audio pronunciation, a hands-on activity, and a closing prayer. 72 lessons cover the full liturgical year from Holy Cross through Pascha and beyond.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {["72 lessons", "Full liturgical year", "Audio pronunciation", "Printable worksheets", "No account needed"].map((badge) => (
                  <span key={badge} className="px-3 py-1.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-full text-xs text-[#555] font-medium">
                    {badge}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="https://hyelearn.com/sunday-school" target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#C4384B] text-white rounded-lg font-medium text-center hover:bg-[#A02E3E] transition-colors">
                  Armenian Sunday School &rarr;
                </a>
                <a href="https://mathaino.net/sunday-school" target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#2271B3] text-white rounded-lg font-medium text-center hover:bg-[#1A5A8F] transition-colors">
                  Greek Sunday School &rarr;
                </a>
                <a href="https://ta3allam.org/sunday-school" target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#2E7D32] text-white rounded-lg font-medium text-center hover:bg-[#1B5E20] transition-colors">
                  Arabic Sunday School &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Our Platforms */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 style={{ fontFamily: "var(--font-dm-serif)" }} className="text-2xl text-[#1a1a1a] text-center mb-12">
              Our platforms
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {products.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#ccc] transition-all group"
                >
                  <Image src={p.screenshot} alt={`${p.name} screenshot`} width={600} height={300} className="w-full h-auto" />
                  <div className="p-8">
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-bold text-white"
                      style={{ backgroundColor: p.letterColor }}
                    >
                      {p.letter}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#1a1a1a] group-hover:text-[#2271B3] transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-sm text-[#999]">{p.language}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#555] leading-relaxed mb-4">
                    {p.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium px-2.5 py-1 bg-[#F0F0F0] text-[#555] rounded">
                      Grades {p.grades}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded ${p.statusColor}`}>
                      {p.status}
                    </span>
                  </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 5. One Platform, Many Languages */}
        <section className="py-20 px-6 bg-white border-y border-[#E5E5E5]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 style={{ fontFamily: "var(--font-dm-serif)" }} className="text-2xl text-[#1a1a1a] mb-6">
              One platform, many languages
            </h2>
            <p className="text-[#555] leading-relaxed">
              Built to scale — one codebase powers every language. The same exercise engine, rewards system, and teacher tools work across all communities, with culturally adapted content, native audio, and locale-specific theming. Contact us to add your community&apos;s heritage language to DiasporaLearn.
            </p>
          </div>
        </section>

        {/* 6. Want to Bring Your Language? */}
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 style={{ fontFamily: "var(--font-dm-serif)" }} className="text-2xl text-[#1a1a1a] mb-4">
              Want to bring your language to DiasporaLearn?
            </h2>
            <p className="text-[#555] mb-8">
              We partner with language educators and diaspora organizations to build new platforms. If your community needs a modern learning tool, let&apos;s talk.
            </p>
            <a
              href="mailto:hello@diasporalearn.org"
              className="inline-block bg-[#2271B3] hover:bg-[#1A5A8F] text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Get in touch
            </a>
          </div>
        </section>

        {/* 7. Support Our Mission */}
        <section id="support" className="py-20 px-6 bg-white border-t border-[#E5E5E5]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 style={{ fontFamily: "var(--font-dm-serif)" }} className="text-2xl text-[#1a1a1a] mb-4">
              Support our mission
            </h2>
            <p className="text-[#555] leading-relaxed mb-4">
              Our curriculum has no cost for families. Your donation helps us create more lessons, add new languages, and keep heritage language education accessible worldwide.
            </p>
            <p className="text-sm text-[#999] mb-8">
              Payments processed securely by Stripe.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {([
                { label: "$5", href: "https://buy.stripe.com/aFa8wOfUVd37gBf69kbfO04" },
                { label: "$10", href: "https://buy.stripe.com/cNi9ASeQR3sxckZ55gbfO07" },
                { label: "$25", href: "https://buy.stripe.com/4gMcN4389bZ3fxbdBMbfO05" },
                { label: "$50", href: "https://buy.stripe.com/eVq28q2451kp0ChcxIbfO03" },
                { label: "Custom", href: "https://buy.stripe.com/dRmfZg1019QV4Sx2X8bfO01" },
              ]).map((btn) => (
                <a key={btn.label} href={btn.href} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-white border border-[#E5E5E5] rounded-lg text-[#333] font-medium hover:border-[#2271B3] hover:text-[#2271B3] transition-colors">
                  {btn.label}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {([
                { label: "$3/month", href: "https://buy.stripe.com/4gM14mbEF8MR1GldBMbfO06" },
                { label: "$5/month", href: "https://buy.stripe.com/14AeVccIJ5AF1Gl0P0bfO02" },
                { label: "$10/month", href: "https://buy.stripe.com/00w00i8staUZacR2X8bfO00" },
              ]).map((btn) => (
                <a key={btn.label} href={btn.href} target="_blank" rel="noopener noreferrer"
                  className="px-5 py-2 bg-[#2271B3] text-white rounded-lg text-sm font-medium hover:bg-[#1A5A8F] transition-colors">
                  {btn.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#999] mb-4">
            <span style={{ fontFamily: "var(--font-dm-serif)" }}>
              <span className="text-[#2271B3]">D</span>iasporaLearn
            </span>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://hyelearn.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#555]">HyeLearn (Armenian)</a>
              <a href="https://mathaino.net" target="_blank" rel="noopener noreferrer" className="hover:text-[#555]">Mathaino (Greek)</a>
              <a href="https://ta3allam.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#555]">Ta3allam (Arabic)</a>
              <a href="/supporters" className="hover:text-[#555]">Our Supporters</a>
              <a href="/blog" className="hover:text-[#555]">Blog</a>
              <a href="/privacy" className="hover:text-[#555]">Privacy</a>
              <a href="/terms" className="hover:text-[#555]">Terms</a>
              <a href="mailto:hello@diasporalearn.org" className="hover:text-[#555]">hello@diasporalearn.org</a>
            </div>
          </div>
          <div className="border-t border-[#E5E5E5] pt-4 flex items-center justify-center gap-4 text-xs text-[#bbb]">
            <p>&copy; {new Date().getFullYear()} DiasporaLearn. Heritage language education for diaspora communities worldwide.</p>
            <a href="https://www.linkedin.com/company/diasporalearn/" target="_blank" rel="noopener noreferrer" className="text-[#bbb] hover:text-[#555] transition-colors" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
