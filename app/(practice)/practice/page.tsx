import Link from "next/link";

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-warm-white border-b border-brown-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">Ա</span>
            <span className="text-xl font-semibold text-brown-800">HyeLearn</span>
          </Link>
          <Link href="/student" className="text-sm text-brown-500 hover:text-brown-700">
            Back to Dashboard
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-brown-800 mb-2">Practice</h1>
        <p className="text-brown-500 mb-8">
          Exercises will appear here once your teacher assigns them.
        </p>
        <div className="bg-warm-white border border-brown-200 border-dashed rounded-2xl p-12 text-center">
          <p className="text-brown-400 text-lg">No exercises available yet.</p>
          <p className="text-brown-300 text-sm mt-2">Check back soon!</p>
        </div>
      </main>
    </div>
  );
}
