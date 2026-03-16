"use client";

import { useState } from "react";
import Link from "next/link";

interface Detail {
  level: string; unit: string; lesson: string; status: string; items: number;
}

export default function BulkGeneratePage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ total: number; completed: number; failed: number; details: Detail[] } | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setRunning(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/bulk-generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setRunning(false);
  }

  return (
    <div className="min-h-screen bg-cream">
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/teacher" className="text-sm text-brown-400 hover:text-brown-600 mb-4 inline-block">&larr; Dashboard</Link>

        <h1 className="text-2xl font-bold text-brown-800 mb-2">Bulk Generate Content</h1>
        <p className="text-brown-500 text-sm mb-6">
          Auto-fill and generate exercises for all empty lessons across all grades. AI-generated content should be reviewed by an Armenian speaker.
        </p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

        {!result && (
          <div className="bg-warm-white border border-brown-100 rounded-xl p-6 mb-6">
            <p className="text-sm text-brown-600 mb-4">
              This will call the Claude API for each empty lesson. It may take several minutes for many lessons.
              Each lesson gets 3 unique vocabulary words or alphabet letters, plus auto-generated exercises.
            </p>
            <button onClick={handleGenerate} disabled={running}
              className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              {running ? "Generating... (this may take a few minutes)" : "Generate All Empty Lessons"}
            </button>
          </div>
        )}

        {running && (
          <div className="bg-warm-white border border-brown-100 rounded-xl p-6 text-center">
            <div className="flex justify-center gap-2 mb-4">
              {["A", "B", "G", "D", "E"].map((l, i) => (
                <span key={i} className="text-xl font-bold text-gold animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>{l}</span>
              ))}
            </div>
            <p className="text-brown-600 font-medium">Generating content with AI...</p>
            <p className="text-sm text-brown-400 mt-1">Please keep this page open</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="font-medium text-green-800">
                Generated content for {result.completed} lesson{result.completed !== 1 ? "s" : ""}.
                {result.failed > 0 && ` ${result.failed} failed.`}
              </p>
              <Link href="/teacher/content" className="text-sm text-green-600 hover:text-green-800 font-medium mt-1 inline-block">
                Go to Content Editor to review &rarr;
              </Link>
            </div>

            <div className="bg-warm-white border border-brown-100 rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 gap-3 px-4 py-2 bg-brown-50/50 border-b border-brown-100 text-xs font-medium text-brown-500 uppercase">
                <span>Level</span>
                <span>Unit</span>
                <span>Lesson</span>
                <span>Status</span>
              </div>
              {result.details.map((d, i) => (
                <div key={i} className="grid grid-cols-4 gap-3 px-4 py-2 border-b border-brown-50 text-sm">
                  <span className="text-brown-600">{d.level}</span>
                  <span className="text-brown-600">{d.unit}</span>
                  <span className="text-brown-600">{d.lesson}</span>
                  <span className={d.status === "success" ? "text-green-600" : "text-red-500"}>{d.status === "success" ? `${d.items} items` : d.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
