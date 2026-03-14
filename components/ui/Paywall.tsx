import Link from "next/link";

export default function Paywall() {
  return (
    <div className="max-w-lg mx-auto text-center py-16 px-6">
      <div className="text-5xl mb-4">{"\u{1F512}"}</div>
      <h2 className="text-2xl font-bold text-brown-800 mb-2">Upgrade to continue</h2>
      <p className="text-brown-500 mb-8">
        You&apos;ve completed the free lessons! Upgrade to the Family plan to unlock the full curriculum and unlimited AI practice.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/pricing"
          className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          View Plans
        </Link>
        <Link
          href="/student/curriculum"
          className="border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Back to Curriculum
        </Link>
      </div>
    </div>
  );
}
