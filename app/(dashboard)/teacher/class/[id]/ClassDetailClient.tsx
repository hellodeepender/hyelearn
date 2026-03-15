"use client";

import { useState } from "react";
import Link from "next/link";

interface RosterEntry {
  id: string; name: string; joinedAt: string; lessonsDone: number; lastActive: string | null;
}

interface Props {
  classId: string; className: string; gradeLabel: string; joinCode: string; roster: RosterEntry[];
}

export default function ClassDetailClient({ className, gradeLabel, joinCode, roster }: Props) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyMessage() {
    const msg = `Join our Armenian class on HyeLearn! Go to hyelearn.com/join and enter code: ${joinCode}`;
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/teacher" className="text-sm text-brown-400 hover:text-brown-600 mb-4 inline-block">&larr; Dashboard</Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brown-800">{className}</h1>
          <p className="text-brown-500">{gradeLabel} &middot; {roster.length} student{roster.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="text-right">
          <button onClick={copyCode} className="font-mono text-2xl bg-brown-50 border border-brown-200 px-5 py-2 rounded-xl text-brown-800 hover:bg-brown-100 transition-colors">
            {joinCode}
          </button>
          <p className="text-xs text-brown-400 mt-1">{copied ? "Copied!" : "Click to copy code"}</p>
        </div>
      </div>

      {/* Share message */}
      <div className="bg-warm-white border border-brown-100 rounded-xl p-4 mb-8">
        <p className="text-sm text-brown-700 mb-2">Share with parents:</p>
        <div className="flex items-center gap-2">
          <p className="text-sm text-brown-500 flex-1 italic">
            &ldquo;Join our Armenian class on HyeLearn! Go to hyelearn.com/join and enter code: {joinCode}&rdquo;
          </p>
          <button onClick={copyMessage} className="text-xs text-gold hover:text-gold-dark font-medium shrink-0">Copy</button>
        </div>
      </div>

      {/* Roster */}
      <h2 className="text-lg font-semibold text-brown-800 mb-4">Students</h2>
      {roster.length === 0 ? (
        <div className="bg-warm-white border border-brown-200 border-dashed rounded-xl p-8 text-center">
          <p className="text-brown-400">No students have joined yet.</p>
          <p className="text-brown-300 text-sm mt-1">Share the join code above to get started.</p>
        </div>
      ) : (
        <div className="bg-warm-white border border-brown-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-brown-50/50 border-b border-brown-100 text-xs font-medium text-brown-500 uppercase">
            <span>Name</span>
            <span>Joined</span>
            <span>Lessons Done</span>
            <span>Last Active</span>
          </div>
          {roster.map((s) => (
            <div key={s.id} className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-brown-50 items-center">
              <span className="text-sm font-medium text-brown-800">{s.name}</span>
              <span className="text-sm text-brown-500">{new Date(s.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              <span className="text-sm text-brown-600">{s.lessonsDone}</span>
              <span className="text-sm text-brown-400">
                {s.lastActive ? new Date(s.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Not started"}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
