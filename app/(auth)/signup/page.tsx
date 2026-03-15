"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "student", full_name: fullName },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If user exists but email not confirmed, or new user needing confirmation
    if (data.user && !data.session) {
      setConfirmationSent(true);
      setLoading(false);
      return;
    }

    // If session exists (email confirmation disabled), redirect
    if (data.session) {
      router.push("/student");
      return;
    }

    setConfirmationSent(true);
    setLoading(false);
  }

  async function handleResend() {
    setResending(true);
    await supabase.auth.resend({ type: "signup", email });
    setResending(false);
  }

  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">{"\u2709\uFE0F"}</div>
          <h1 className="text-2xl font-bold text-brown-800 mb-2">Check your email!</h1>
          <p className="text-brown-500 mb-2">
            We sent a confirmation link to <span className="font-medium text-brown-700">{email}</span>.
          </p>
          <p className="text-brown-500 mb-6">Click the link to activate your account.</p>
          <p className="text-sm text-brown-400 mb-6">
            Didn&apos;t receive it? Check your spam folder or wait a minute and try again.
          </p>
          <button onClick={handleResend} disabled={resending}
            className="border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 mb-4">
            {resending ? "Sending..." : "Resend confirmation email"}
          </button>
          <p className="text-sm text-brown-400">
            <Link href="/login" className="text-gold hover:text-gold-dark font-medium">Back to login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-gold">{"\u0531"}</span>
            <span className="text-2xl font-semibold text-brown-800">HyeLearn</span>
          </Link>
          <h1 className="text-2xl font-bold text-brown-800">Create your free account</h1>
          <p className="text-brown-500 mt-1">Start learning Armenian today</p>
        </div>
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
            )}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-brown-700 mb-1">Full Name</label>
              <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white"
                placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brown-700 mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white"
                placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brown-700 mb-1">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white"
                placeholder="Min 6 characters" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors">
              {loading ? "Creating account..." : "Create Free Account"}
            </button>
          </form>
        </div>
        <div className="text-center mt-6 space-y-2">
          <p className="text-brown-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:text-gold-dark font-medium">Sign in</Link>
          </p>
          <p className="text-brown-400 text-xs">
            Are you a teacher or school?{" "}
            <a href="mailto:hello@hyelearn.com" className="text-brown-500 hover:text-brown-700 underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
}
