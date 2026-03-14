"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Level { id: string; slug: string; title: string; grade_value: string; sort_order: number }
interface Unit { id: string; slug: string; title: string; level_id: string; sort_order: number }
interface Lesson { id: string; slug: string; title: string; unit_id: string; lesson_type: string; sort_order: number }
type LessonStats = Record<string, { draft: number; approved: number; total: number }>;

interface Props {
  levels: Level[];
  units: Unit[];
  lessons: Lesson[];
  lessonStats: LessonStats;
  userId: string;
}

const EXERCISE_TYPES = ["multiple_choice", "fill_blank", "matching", "true_false"];

export default function SeedClient({ levels, units, lessons, lessonStats: initialStats, userId }: Props) {
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [exerciseType, setExerciseType] = useState("multiple_choice");
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; action: string } | null>(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<LessonStats>(initialStats);

  const filteredUnits = units.filter((u) => u.level_id === selectedLevel);
  const filteredLessons = lessons.filter((l) => l.unit_id === selectedUnit);
  const selectedLevelData = levels.find((l) => l.id === selectedLevel);
  const selectedLessonData = lessons.find((l) => l.id === selectedLesson);
  const lessonStat = selectedLesson ? stats[selectedLesson] : undefined;
  const hasExisting = (lessonStat?.total ?? 0) > 0;

  function getUnitExerciseCount(unitId: string): number {
    return lessons
      .filter((l) => l.unit_id === unitId)
      .reduce((sum, l) => sum + (stats[l.id]?.total ?? 0), 0);
  }

  function getLessonStatusLabel(lessonId: string): { text: string; color: string } {
    const s = stats[lessonId];
    if (!s || s.total === 0) return { text: "empty", color: "text-brown-400" };
    if (s.approved > 0 && s.draft === 0) return { text: `${s.approved} approved`, color: "text-green-600" };
    if (s.draft > 0) return { text: `${s.draft} pending`, color: "text-amber-600" };
    return { text: `${s.total} exercises`, color: "text-brown-500" };
  }

  async function generateForLesson(lessonId: string, replace: boolean): Promise<number> {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson || !selectedLevelData) return 0;

    const supabase = createClient();

    // Delete existing drafts if replacing
    if (replace) {
      await supabase.from("curated_exercises").delete().eq("lesson_id", lessonId).eq("status", "draft");
    }

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grade: selectedLevelData.grade_value,
        subject: "vocabulary",
        topic: lesson.title,
        exerciseType,
        count: exerciseType === "matching" ? 5 : 4,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Generation failed");
    }

    const data = await res.json();
    const exercises = data.exercises as unknown[];

    // Get current max sort_order for this lesson
    const { data: existing } = await supabase
      .from("curated_exercises")
      .select("sort_order")
      .eq("lesson_id", lessonId)
      .order("sort_order", { ascending: false })
      .limit(1);
    const startOrder = (existing?.[0]?.sort_order ?? 0) + 1;

    const inserts = exercises.map((ex, i) => ({
      lesson_id: lessonId,
      exercise_type: exerciseType,
      exercise_data: ex,
      sort_order: replace ? i + 1 : startOrder + i,
      status: "draft",
      created_by: userId,
    }));

    const { error: insertError } = await supabase.from("curated_exercises").insert(inserts);
    if (insertError) throw new Error(insertError.message);

    // Update local stats
    setStats((prev) => {
      const old = prev[lessonId] ?? { draft: 0, approved: 0, total: 0 };
      const draftChange = replace ? exercises.length : exercises.length;
      const totalChange = replace ? exercises.length - (old.draft) : exercises.length;
      return {
        ...prev,
        [lessonId]: {
          draft: replace ? exercises.length : old.draft + exercises.length,
          approved: old.approved,
          total: replace ? old.approved + exercises.length : old.total + exercises.length,
        },
      };
    });

    return exercises.length;
  }

  async function handleGenerate(replace: boolean = false) {
    if (!selectedLesson) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const count = await generateForLesson(selectedLesson, replace);
      setResult({ count, action: replace ? "replaced" : "added" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  }

  async function handleBulkSeed() {
    if (!selectedUnit || !selectedLevelData) return;
    setBulkLoading(true);
    setError("");
    setResult(null);

    const emptyLessons = filteredLessons.filter((l) => (stats[l.id]?.total ?? 0) === 0);
    if (emptyLessons.length === 0) {
      setError("All lessons in this unit already have exercises.");
      setBulkLoading(false);
      return;
    }

    try {
      let totalGenerated = 0;
      for (const lesson of emptyLessons) {
        // Temporarily select each lesson for generateForLesson
        const count = await generateForLesson(lesson.id, false);
        totalGenerated += count;
      }
      setResult({ count: totalGenerated, action: `seeded across ${emptyLessons.length} lessons` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk seeding failed");
    }
    setBulkLoading(false);
  }

  const emptyLessonCount = selectedUnit
    ? filteredLessons.filter((l) => (stats[l.id]?.total ?? 0) === 0).length
    : 0;

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brown-800">Seed Exercises</h1>
          <p className="text-brown-500 text-sm mt-1">Generate AI exercises for curriculum lessons</p>
        </div>
        <Link href="/teacher/review" className="text-sm text-gold hover:text-gold-dark font-medium">
          Review queue &rarr;
        </Link>
      </div>

      <div className="bg-brown-50 border border-brown-100 rounded-lg p-3 mb-6 text-xs text-brown-500">
        Tip: To update exercises with improved emoji or content, select a lesson and use &quot;Replace drafts&quot; to regenerate.
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">{error}</div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-4 mb-6">
          <p className="font-medium">{result.count} exercises generated and saved as drafts.</p>
          <p className="mt-1">
            <Link href="/teacher/review" className="font-medium underline">Go to Review Queue</Link> to approve them.
          </p>
        </div>
      )}

      {/* Level */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-brown-700 mb-2">Level</label>
        <select
          value={selectedLevel}
          onChange={(e) => { setSelectedLevel(e.target.value); setSelectedUnit(""); setSelectedLesson(""); setResult(null); }}
          className="w-full px-3 py-2.5 border border-brown-200 rounded-lg bg-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="">Select a level...</option>
          {levels.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
      </div>

      {/* Unit */}
      {selectedLevel && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-brown-700 mb-2">Unit</label>
          <select
            value={selectedUnit}
            onChange={(e) => { setSelectedUnit(e.target.value); setSelectedLesson(""); setResult(null); }}
            className="w-full px-3 py-2.5 border border-brown-200 rounded-lg bg-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            <option value="">Select a unit...</option>
            {filteredUnits.map((u) => {
              const count = getUnitExerciseCount(u.id);
              return (
                <option key={u.id} value={u.id}>
                  {u.title} ({count} exercise{count !== 1 ? "s" : ""})
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Bulk seed button */}
      {selectedUnit && emptyLessonCount > 0 && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 mb-2">
            {emptyLessonCount} lesson{emptyLessonCount !== 1 ? "s" : ""} in this unit {emptyLessonCount !== 1 ? "have" : "has"} no exercises yet.
          </p>
          <button
            onClick={handleBulkSeed}
            disabled={bulkLoading || loading}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {bulkLoading ? "Seeding all empty lessons..." : `Seed all ${emptyLessonCount} empty lesson${emptyLessonCount !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* Lesson */}
      {selectedUnit && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-brown-700 mb-2">Lesson</label>
          <div className="space-y-1.5">
            {filteredLessons.map((l) => {
              const status = getLessonStatusLabel(l.id);
              const isSelected = selectedLesson === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => { setSelectedLesson(l.id); setResult(null); }}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                    isSelected
                      ? "border-gold bg-gold/5"
                      : "border-brown-100 bg-warm-white hover:border-brown-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-brown-800">
                      {l.title}
                      <span className="text-brown-400 ml-1">({l.lesson_type})</span>
                    </span>
                    <span className={`text-xs font-medium ${status.color}`}>{status.text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Duplicate warning */}
      {selectedLesson && hasExisting && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 mb-3">
            This lesson already has {lessonStat!.total} exercise{lessonStat!.total !== 1 ? "s" : ""}
            {lessonStat!.draft > 0 ? ` (${lessonStat!.draft} pending review)` : ""}.
            Generating will add more, not replace them.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleGenerate(false)}
              disabled={loading}
              className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {loading ? "Generating..." : "Add more exercises"}
            </button>
            <button
              onClick={() => handleGenerate(true)}
              disabled={loading}
              className="border border-amber-300 text-amber-700 hover:bg-amber-100 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Replace drafts
            </button>
          </div>
        </div>
      )}

      {/* Exercise type */}
      {selectedLesson && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-brown-700 mb-2">Exercise Type</label>
          <div className="flex flex-wrap gap-2">
            {EXERCISE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setExerciseType(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  exerciseType === t
                    ? "bg-gold text-white shadow-sm"
                    : "bg-warm-white border border-brown-200 text-brown-700 hover:border-brown-300"
                }`}
              >
                {t.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generate button (only if no existing exercises — otherwise the warning has the buttons) */}
      {selectedLesson && !hasExisting && (
        <button
          onClick={() => handleGenerate(false)}
          disabled={loading}
          className="w-full bg-gold hover:bg-gold-dark disabled:opacity-40 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          {loading ? "Generating with AI..." : "Generate Exercises"}
        </button>
      )}
    </main>
  );
}
