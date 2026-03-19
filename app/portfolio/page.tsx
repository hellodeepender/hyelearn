import Link from "next/link";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DiasporaLearn — Heritage Language Learning Platforms",
  description: "Interactive K-5 learning platforms for diaspora communities. Armenian, Greek, and more.",
};

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

const products = [
  {
    name: "HyeLearn",
    letter: "\u0531",
    letterColor: "#C8A951",
    language: "Western Armenian",
    url: "https://hyelearn.com",
    description: "The first interactive K-5 Western Armenian curriculum. Built for Armenian day schools and diaspora families. Alphabet, vocabulary, grammar, and cultural content — all with native audio pronunciation.",
    grades: "K–5",
    status: "Live",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    name: "Mathaino",
    letter: "\u039C",
    letterColor: "#2271B3",
    language: "Modern Greek",
    url: "https://mathaino.net",
    description: "Interactive Greek language learning for K-5 students. Greek alphabet, vocabulary, reading comprehension, and cultural awareness — designed for Greek schools and families in the diaspora.",
    grades: "K–5",
    status: "Live",
    statusColor: "bg-green-100 text-green-700",
  },
];

const upcoming = ["Assyrian", "Farsi", "Hebrew", "Hindi", "Korean", "Tagalog"];

export default function PortfolioPage() {
  return (
    <div className={`${serif.variable} ${sans.variable} min-h-screen bg-[#FAFAFA]`} style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
      {/* Header */}
      <header className="border-b border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <span style={{ fontFamily: "var(--font-dm-serif)" }} className="text-xl">
            <span className="text-[#2271B3]">D</span><span className="text-[#333]">iasporaLearn</span>
          </span>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 style={{ fontFamily: "var(--font-dm-serif)" }} className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight mb-6">
              Heritage languages deserve modern tools
            </h1>
            <p className="text-lg text-[#555] max-w-2xl mx-auto leading-relaxed mb-10">
              We build interactive learning platforms for diaspora communities. Structured K-5 curriculum, native audio, culturally meaningful content — all in just 5 minutes a day.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["K–5 curriculum", "Interactive lessons", "Built for diaspora families"].map((badge) => (
                <span key={badge} className="px-4 py-1.5 bg-white border border-[#E5E5E5] rounded-full text-sm text-[#555]">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 style={{ fontFamily: "var(--font-dm-serif)" }} className="text-2xl text-[#1a1a1a] text-center mb-12">
              Our platforms
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {products.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-[#E5E5E5] rounded-2xl p-8 hover:shadow-lg hover:border-[#ccc] transition-all group"
                >
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
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 px-6 bg-white border-y border-[#E5E5E5]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 style={{ fontFamily: "var(--font-dm-serif)" }} className="text-2xl text-[#1a1a1a] mb-6">
              One platform, many languages
            </h2>
            <p className="text-[#555] leading-relaxed mb-8">
              DiasporaLearn is built on a shared, scalable architecture. The same exercise engine, rewards system, and teacher tools power every language — with culturally adapted content, native audio, and locale-specific theming for each community.
            </p>
            <p className="text-sm text-[#999] mb-6">Coming soon</p>
            <div className="flex flex-wrap justify-center gap-2">
              {upcoming.map((lang) => (
                <span key={lang} className="px-4 py-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-sm text-[#777]">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
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
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#999]">
          <span style={{ fontFamily: "var(--font-dm-serif)" }}>
            <span className="text-[#2271B3]">D</span>iasporaLearn
          </span>
          <a href="mailto:hello@diasporalearn.org" className="hover:text-[#555]">hello@diasporalearn.org</a>
          <p>&copy; {new Date().getFullYear()} DiasporaLearn</p>
        </div>
      </footer>
    </div>
  );
}
