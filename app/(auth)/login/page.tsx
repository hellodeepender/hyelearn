import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-gold">Ա</span>
            <span className="text-2xl font-semibold text-brown-800">HyeLearn</span>
          </Link>
          <h1 className="text-2xl font-bold text-brown-800">Welcome back</h1>
          <p className="text-brown-500 mt-1">Sign in to your account</p>
        </div>
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 shadow-sm">
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brown-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white"
                placeholder="you@school.edu"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brown-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gold hover:bg-gold-dark text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
        <p className="text-center text-brown-500 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-gold hover:text-gold-dark font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
