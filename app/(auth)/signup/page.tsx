"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [role, setRole] = useState<"teacher" | "student">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gradeLevel, setGradeLevel] = useState(5);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const metadata = {
      role,
      full_name: fullName,
      ...(role === "student" ? { grade_level: gradeLevel } : {}),
    };

    console.log("[HyeLearn] Signup metadata:", metadata);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    console.log("[HyeLearn] Signup response user metadata:", data.user?.user_metadata);

    if (data.user) {
      // Try to read role from profiles table (set by trigger)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      console.log("[HyeLearn] Profile role from DB:", { role: profile?.role, profileError });

      // Use profile role if available, otherwise fall back to the role we just submitted
      const resolvedRole = profile?.role ?? role;
      router.push(resolvedRole === "teacher" || resolvedRole === "admin" ? "/teacher" : "/student");
    } else {
      // No user returned (e.g. email confirmation required) — redirect based on selected role
      router.push(role === "teacher" ? "/teacher" : "/student");
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-gold">Ա</span>
            <span className="text-2xl font-semibold text-brown-800">HyeLearn</span>
          </Link>
          <h1 className="text-2xl font-bold text-brown-800">Create your account</h1>
          <p className="text-brown-500 mt-1">Start using HyeLearn in your classroom</p>
        </div>
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Role selector cards */}
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    role === "teacher"
                      ? "border-gold bg-gold/5 shadow-sm"
                      : "border-brown-200 hover:border-brown-300"
                  }`}
                >
                  <div className="text-2xl mb-1">👩‍🏫</div>
                  <div className={`font-semibold text-sm ${role === "teacher" ? "text-gold-dark" : "text-brown-700"}`}>
                    Teacher
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    role === "student"
                      ? "border-gold bg-gold/5 shadow-sm"
                      : "border-brown-200 hover:border-brown-300"
                  }`}
                >
                  <div className="text-2xl mb-1">📚</div>
                  <div className={`font-semibold text-sm ${role === "student" ? "text-gold-dark" : "text-brown-700"}`}>
                    Student
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-brown-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brown-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white"
                placeholder="••••••••"
              />
            </div>

            {role === "student" && (
              <div>
                <label htmlFor="gradeLevel" className="block text-sm font-medium text-brown-700 mb-1">
                  Grade Level
                </label>
                <select
                  id="gradeLevel"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white text-brown-700"
                >
                  {Array.from({ length: 11 }, (_, i) => i + 2).map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>
        <p className="text-center text-brown-500 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-gold hover:text-gold-dark font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
