"use client";

import { useState } from "react";
import Link from "next/link";

interface RosterEntry {
  id: string; name: string; joinedAt: string;
  lessonsDone: number; totalLessons: number;
  avgScore: number | null; lastActive: string | null;
  activityStatus: string;
}

interface Stats {
  totalStudents: number; classAvgScore: number;
  totalLessonsDone: number; activeThisWeek: number;
}

interface Props {
  classId: string; className: string; gradeLabel: string;
  joinCode: string; roster: RosterEntry[]; stats: Stats;
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "Not started";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STATUS_DOT: Record<string, string> = {
  active: "bg-green-500",
  recent: "bg-amber-400",
  inactive: "bg-brown-200",
};

export default function ClassDetailClient({ classId, className, gradeLabel, joinCode, roster, stats }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleRemove(studentId: string, studentName: string) {
    if (!confirm(`Remove ${studentName} from ${className}? They will lose access to school content.`)) return;
    await fetch("/api/join-class", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, studentId }),
    });
    window.location.reload();
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/teacher" className="text-sm text-brown-400 hover:text-brown-600 mb-4 inline-block">&larr; Dashboard</Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brown-800">{className}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium bg-gold/10 text-gold-dark px-2 py-0.5 rounded">{gradeLabel}</span>
            <span className="text-brown-400 text-sm">{roster.length} student{roster.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="text-right">
          <button onClick={() => copy(joinCode, "code")} className="font-mono text-2xl bg-brown-50 border border-brown-200 px-5 py-2 rounded-xl text-brown-800 hover:bg-brown-100 transition-colors">
            {joinCode}
          </button>
          <p className="text-xs text-brown-400 mt-1">{copied === "code" ? "Copied!" : "Click to copy"}</p>
        </div>
      </div>

      {/* Share */}
      <div className="bg-warm-white border border-brown-100 rounded-xl p-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-brown-700 mb-0.5">Share with parents:</p>
            <p className="text-xs text-brown-400 italic">
              &ldquo;Join our Armenian class on HyeLearn! Go to hyelearn.com/join and enter code: {joinCode}&rdquo;
            </p>
          </div>
          <button onClick={() => copy(`Join our Armenian class on HyeLearn! Go to hyelearn.com/join and enter code: ${joinCode}`, "msg")}
            className="text-xs text-gold hover:text-gold-dark font-medium shrink-0 ml-4">
            {copied === "msg" ? "Copied!" : "Copy Message"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-warm-white border border-brown-100 rounded-xl p-4">
          <p className="text-xs font-medium text-brown-500 mb-1">Students</p>
          <p className="text-2xl font-bold text-gold">{stats.totalStudents}</p>
        </div>
        <div className="bg-warm-white border border-brown-100 rounded-xl p-4">
          <p className="text-xs font-medium text-brown-500 mb-1">Avg Score</p>
          <p className="text-2xl font-bold text-gold">{stats.classAvgScore > 0 ? `${stats.classAvgScore}%` : "--"}</p>
        </div>
        <div className="bg-warm-white border border-brown-100 rounded-xl p-4">
          <p className="text-xs font-medium text-brown-500 mb-1">Lessons Done</p>
          <p className="text-2xl font-bold text-gold">{stats.totalLessonsDone}</p>
        </div>
        <div className="bg-warm-white border border-brown-100 rounded-xl p-4">
          <p className="text-xs font-medium text-brown-500 mb-1">Active This Week</p>
          <p className="text-2xl font-bold text-gold">{stats.activeThisWeek}</p>
        </div>
      </div>

      {/* Roster */}
      <h2 className="text-lg font-semibold text-brown-800 mb-4">Student Roster</h2>
      {roster.length === 0 ? (
        <div className="bg-warm-white border border-brown-200 border-dashed rounded-xl p-8 text-center">
          <p className="text-brown-400">No students have joined yet.</p>
          <p className="text-brown-300 text-sm mt-1">Share the join code above to get started.</p>
        </div>
      ) : (
        <div className="bg-warm-white border border-brown-100 rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-6 gap-3 px-5 py-3 bg-brown-50/50 border-b border-brown-100 text-xs font-medium text-brown-500 uppercase">
            <span className="col-span-2">Student</span>
            <span>Progress</span>
            <span>Avg Score</span>
            <span>Last Active</span>
            <span></span>
          </div>
          {roster.map((s) => (
            <div key={s.id} className="md:grid md:grid-cols-6 gap-3 px-5 py-4 border-b border-brown-50 items-center">
              {/* Name + status */}
              <div className="col-span-2 flex items-center gap-2.5 mb-2 md:mb-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[s.activityStatus] ?? STATUS_DOT.inactive}`} />
                <div>
                  <p className="text-sm font-medium text-brown-800">{s.name}</p>
                  <p className="text-xs text-brown-400">Joined {new Date(s.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-1 md:mb-0">
                <p className="text-sm text-brown-700">{s.lessonsDone}/{s.totalLessons}</p>
                <div className="w-full h-1.5 bg-brown-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: `${s.totalLessons > 0 ? (s.lessonsDone / s.totalLessons) * 100 : 0}%` }} />
                </div>
              </div>

              {/* Avg Score */}
              <p className={`text-sm font-medium mb-1 md:mb-0 ${s.avgScore !== null && s.avgScore >= 70 ? "text-green-600" : "text-brown-500"}`}>
                {s.avgScore !== null ? `${s.avgScore}%` : "--"}
              </p>

              {/* Last Active */}
              <p className="text-sm text-brown-400 mb-1 md:mb-0">{relativeTime(s.lastActive)}</p>

              {/* Remove */}
              <div className="text-right">
                <button onClick={() => handleRemove(s.id, s.name)}
                  className="text-xs text-brown-300 hover:text-red-500 transition-colors">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
