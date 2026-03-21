"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useTranslations } from "@/lib/use-translations";

export default function LoginPage() {
  const tc = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed") === "true";
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsConfirmation(false);
    setLoading(true);

    const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      if (authError.message.toLowerCase().includes("email not confirmed")) {
        setNeedsConfirmation(true);
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    const user = signInData.user;
    if (!user) {
      setError("Login failed. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (profile?.role === "teacher" || profile?.role === "admin") {
      router.push("/teacher");
    } else {
      router.push("/student");
    }
  }

  async function handleResend() {
    setResending(true);
    await supabase.auth.resend({ type: "signup", email });
    setResending(false);
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-gold">{tc("brandLetter")}</span>
            <span className="text-2xl font-semibold text-brown-800">{tc("brand")}</span>
          </Link>
          <h1 className="text-2xl font-bold text-brown-800">Welcome back</h1>
          <p className="text-brown-500 mt-1">Sign in to your account</p>
        </div>
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {confirmed && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">Email confirmed! Please sign in.</div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
            )}
            {needsConfirmation && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3 space-y-2">
                <p>Please confirm your email first. We sent a link to <span className="font-medium">{email}</span>. Check your inbox and spam folder.</p>
                <button type="button" onClick={handleResend} disabled={resending}
                  className="text-xs text-amber-700 underline hover:text-amber-900 disabled:opacity-50">
                  {resending ? "Sending..." : "Resend confirmation email"}
                </button>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brown-700 mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white"
                placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brown-700 mb-1">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white"
                placeholder="Your password" />
              <Link href="/forgot-password" className="text-xs text-gold hover:text-gold-dark mt-1.5 inline-block">
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-brown-500 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-gold hover:text-gold-dark font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
