"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useTranslations } from "@/lib/use-translations";

export default function ForgotPasswordPage() {
  const tc = useTranslations("common");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-gold">{tc("brandLetter")}</span>
            <span className="text-2xl font-semibold text-brown-800">{tc("brand")}</span>
          </Link>
          <h1 className="text-2xl font-bold text-brown-800">Reset your password</h1>
        </div>
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-2">Check your email</p>
              <p className="text-sm text-brown-500">We sent a password reset link to {email}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brown-700 mb-1">Email</label>
                <input
                  id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white"
                  placeholder="you@school.edu"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-brown-500 text-sm mt-6">
          <Link href="/login" className="text-gold hover:text-gold-dark font-medium">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
