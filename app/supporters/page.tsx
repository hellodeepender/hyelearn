import Link from "next/link";
import { SUPPORTERS, getInitials } from "@/lib/supporters";

export default function SupportersPage() {
  const stats = [
    { value: String(SUPPORTERS.length), label: "Supporters" },
    { value: "3", label: "Countries" },
    { value: "100%", label: "Free Platform" },
    { value: "270+", label: "Lessons Funded" },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-warm-white border-b border-brown-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">D</span>
            <span className="text-xl font-semibold text-brown-800">DiasporaLearn</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-brown-600 hover:text-brown-800">Donate</Link>
            <Link href="/login" className="text-sm text-brown-400 hover:text-brown-600">Log in</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="text-5xl mb-4">{"\uD83D\uDE4F"}</div>
          <h1 className="text-4xl font-bold text-brown-800 mb-3">Wall of Gratitude</h1>
          <p className="text-brown-500 text-lg max-w-2xl mx-auto">
            Every donation keeps heritage language learning free for diaspora children everywhere.
          </p>
        </div>

        {/* Impact stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="bg-warm-white border border-brown-100 rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-gold">{s.value}</p>
              <p className="text-xs text-brown-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Donor grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {SUPPORTERS.map((supporter, i) => {
            const isAnon = supporter.anonymous;
            const initials = isAnon ? "?" : getInitials(supporter.name);
            const displayName = isAnon ? "Anonymous Supporter" : supporter.name;

            return (
              <div key={i} className="bg-warm-white border border-brown-100 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg, #A8232A, #D4A843)" }}>
                    {initials}
                  </div>
                  <div>
                    <p className="font-medium text-brown-800">{displayName}</p>
                    <p className="text-xs text-brown-400">{supporter.date}</p>
                  </div>
                </div>
                {supporter.message && (
                  <p className="text-sm text-brown-500 italic border-l-2 border-gold/40 pl-3 mt-3">
                    &ldquo;{supporter.message}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center text-white" style={{ background: "linear-gradient(135deg, #A8232A, #C4384B)" }}>
          <h2 className="text-2xl font-bold mb-2">Join Our Supporters</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Your donation keeps heritage language education free for families worldwide.
          </p>
          <Link href="/pricing" className="inline-block bg-[#D4A843] hover:bg-[#B8922E] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Donate Now
          </Link>
          <p className="text-white/50 text-xs mt-4">
            {"\u2665"} Your name will appear on this page (optional — you can donate anonymously)
          </p>
        </div>
      </main>

      <footer className="py-8 px-6 border-t border-brown-100 mt-10">
        <div className="max-w-5xl mx-auto text-center text-xs text-brown-400">
          <Link href="/" className="hover:text-brown-600">DiasporaLearn</Link>
          <span className="mx-2">&middot;</span>
          <Link href="/pricing" className="hover:text-brown-600">Support</Link>
          <span className="mx-2">&middot;</span>
          <Link href="/supporters" className="hover:text-brown-600">Our Supporters</Link>
        </div>
      </footer>
    </div>
  );
}
