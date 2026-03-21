"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useTranslations } from "@/lib/use-translations";
import { useLocale } from "@/lib/locale-context";

type Step = "code" | "account" | "done";

export default function JoinPage() {
  const tc = useTranslations("common");
  const localeCtx = useLocale();
  const { brandName } = localeCtx;
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [classInfo, setClassInfo] = useState<{ classId: string; className: string; teacherName: string; gradeName: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [childName, setChildName] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleValidateCode() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/validate-code", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
    const data = await res.json();
    if (!data.valid) { setError("Code not found. Check with your teacher."); setLoading(false); return; }
    setClassInfo({ classId: data.classId, className: data.className, teacherName: data.teacherName, gradeName: data.gradeName });
    setStep("account");
    setLoading(false);
  }

  async function handleJoin() {
    if (!classInfo) return;
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
        if (authErr) { setError(authErr.message); setLoading(false); return; }
      } else {
        const { data: signUpData, error: authErr } = await supabase.auth.signUp({
          email, password,
          options: { data: { role: "student", full_name: childName || "Student", locale: localeCtx.locale } },
        });
        if (authErr) { setError(authErr.message); setLoading(false); return; }

        // Explicitly create profile — don't rely solely on DB trigger
        if (signUpData?.user) {
          await supabase.from("profiles").upsert({
            id: signUpData.user.id,
            full_name: childName || "Student",
            role: "student",
            locale: localeCtx.locale,
          }, { onConflict: "id" }).then(({ error: profileErr }) => {
            if (profileErr) console.error("[join] Profile upsert error:", profileErr.message);
          });
        }
      }

      const res = await fetch("/api/join-class", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: classInfo.classId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not join class"); setLoading(false); return; }

      setStep("done");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-gold">{tc("brandLetter")}</span>
            <span className="text-2xl font-semibold text-brown-800">{brandName}</span>
          </Link>
        </div>

        {step === "code" && (
          <>
            <h1 className="text-2xl font-bold text-brown-800 text-center mb-2">Join Your Class</h1>
            <p className="text-brown-500 text-center mb-6">Enter the code your teacher gave you</p>
            <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 shadow-sm">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}
              <input
                type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-letter code" maxLength={8}
                className="w-full px-4 py-4 border border-brown-200 rounded-xl text-center text-2xl font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white mb-4"
              />
              <button onClick={handleValidateCode} disabled={loading || code.length < 4}
                className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors">
                {loading ? "Checking..." : "Join"}
              </button>
            </div>
            <p className="text-center text-brown-400 text-sm mt-6">
              Don&apos;t have a code? <Link href="/signup" className="text-gold hover:text-gold-dark font-medium">Start learning for free</Link>
            </p>
          </>
        )}

        {step === "account" && classInfo && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
              <p className="font-medium text-green-800">Joining {classInfo.className}</p>
              <p className="text-sm text-green-600">{classInfo.teacherName} &middot; {classInfo.gradeName}</p>
            </div>

            <div className="bg-warm-white border border-brown-100 rounded-2xl p-8 shadow-sm">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

              <div className="flex gap-2 mb-6">
                <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${!isLogin ? "bg-gold text-white" : "bg-brown-50 text-brown-600"}`}>
                  New Account
                </button>
                <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${isLogin ? "bg-gold text-white" : "bg-brown-50 text-brown-600"}`}>
                  Sign In
                </button>
              </div>

              <div className="space-y-3">
                {!isLogin && (
                  <input type="text" value={childName} onChange={(e) => setChildName(e.target.value)}
                    placeholder="Student's first name" className="w-full px-4 py-2.5 border border-brown-200 rounded-lg bg-warm-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
                )}
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Parent/guardian email" className="w-full px-4 py-2.5 border border-brown-200 rounded-lg bg-warm-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" className="w-full px-4 py-2.5 border border-brown-200 rounded-lg bg-warm-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
                <button onClick={handleJoin} disabled={loading || !email || !password}
                  className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors">
                  {loading ? "Joining..." : isLogin ? "Sign In & Join" : "Create Account & Join"}
                </button>
              </div>
            </div>
          </>
        )}

        {step === "done" && classInfo && (
          <div className="text-center">
            <div className="text-5xl mb-4">{"\u{1F389}"}</div>
            <h1 className="text-2xl font-bold text-brown-800 mb-2">Welcome to {classInfo.className}!</h1>
            <p className="text-brown-500 mb-8">{classInfo.teacherName} &middot; {classInfo.gradeName}</p>
            <button onClick={() => router.push("/student/curriculum")}
              className="bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Start Learning
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
