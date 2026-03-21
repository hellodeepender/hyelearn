import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { getInitials } from "@/lib/supporters";

export default async function SupportersPage() {
  // Use service role to bypass RLS — this is public data (show_name=true only)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: donations, error } = await supabase
    .from("donations")
    .select("donor_name, created_at, message")
    .eq("show_name", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[supporters] Query error:", error.message, error.details);
  }

  const supporters = (donations ?? []).map((d) => ({
    name: d.donor_name,
    date: new Date(d.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    message: d.message,
  }));

  const stats = [
    { value: String(supporters.length || 0), label: "Supporters" },
    { value: "2", label: "Countries" },
    { value: "2", label: "Languages" },
    { value: "269", label: "Lessons Available" },
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
        <div className="text-center mb-16">
          <p className="text-xs font-medium text-brown-400 uppercase tracking-wide mb-3">Our Community</p>
          <h1 className="text-4xl font-bold text-brown-800 mb-3">Wall of Gratitude</h1>
          <p className="text-brown-500 text-lg max-w-2xl mx-auto">
            Every donation keeps heritage language learning accessible for diaspora children everywhere. Thank you for making this possible.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="bg-warm-white border border-brown-100 rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-gold">{s.value}</p>
              <p className="text-xs text-brown-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {supporters.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {supporters.map((supporter, i) => (
              <div key={i} className="bg-warm-white border border-brown-100 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg, #A8232A, #D4A843)" }}>
                    {getInitials(supporter.name)}
                  </div>
                  <div>
                    <p className="font-medium text-brown-800">{supporter.name}</p>
                    <p className="text-xs text-brown-400">{supporter.date}</p>
                  </div>
                </div>
                {supporter.message && (
                  <p className="text-sm text-brown-500 italic border-l-2 border-gold/40 pl-3 mt-3">
                    &ldquo;{supporter.message}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-warm-white border border-brown-100 rounded-xl p-8 text-center mb-16">
            <p className="text-brown-500">Be the first to support DiasporaLearn!</p>
          </div>
        )}

        <div className="rounded-2xl p-8 text-center text-white" style={{ background: "linear-gradient(135deg, #A8232A, #C4384B)" }}>
          <h2 className="text-2xl font-bold mb-2">Join Our Supporters</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Your donation keeps heritage language education accessible for families worldwide.
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
