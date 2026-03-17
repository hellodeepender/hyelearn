"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useTranslations } from "@/lib/use-translations";

export default function ResetPasswordPage() {
  const tc = useTranslations("common");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
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
          <h1 className="text-2xl font-bold text-brown-800">Set new password</h1>
        </div>
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 shadow-sm">
          {done ? (
            <div className="text-center">
              <p className="text-green-600 font-medium">Password updated!</p>
              <p className="text-sm text-brown-500 mt-1">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-brown-700 mb-1">New Password</label>
                <input
                  id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={6}
                  className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white"
                  placeholder="New password (min 6 characters)"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors">
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
