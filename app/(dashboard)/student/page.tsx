import Link from "next/link";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-warm-white border-b border-brown-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">Ա</span>
            <span className="text-xl font-semibold text-brown-800">HyeLearn</span>
          </Link>
          <span className="text-sm text-brown-500">Student Dashboard</span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-brown-800 mb-2">Welcome, Student</h1>
        <p className="text-brown-500 mb-8">Continue your Armenian learning journey.</p>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-warm-white border border-brown-100 rounded-xl p-6">
            <h3 className="font-semibold text-brown-800 mb-1">Exercises Completed</h3>
            <p className="text-3xl font-bold text-gold">—</p>
          </div>
          <div className="bg-warm-white border border-brown-100 rounded-xl p-6">
            <h3 className="font-semibold text-brown-800 mb-1">Current Level</h3>
            <p className="text-3xl font-bold text-gold">—</p>
          </div>
        </div>
        <Link
          href="/practice"
          className="inline-block bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Start Practicing
        </Link>
      </main>
    </div>
  );
}
