"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Level { id: string; slug: string; title: string; grade_value: string; sort_order: number }
interface Unit { id: string; slug: string; title: string; level_id: string; sort_order: number }
interface Lesson { id: string; slug: string; title: string; unit_id: string; lesson_type: string; sort_order: number }

interface Props {
  levels: Level[];
  units: Unit[];
  lessons: Lesson[];
  userId: string;
}

const EXERCISE_TYPES = ["multiple_choice", "fill_blank", "matching", "true_false"];

export default function SeedClient({ levels, units, lessons, userId }: Props) {
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [exerciseType, setExerciseType] = useState("multiple_choice");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [error, setError] = useState("");

  const filteredUnits = units.filter((u) => u.level_id === selectedLevel);
  const filteredLessons = lessons.filter((l) => l.unit_id === selectedUnit);

  const selectedLevelData = levels.find((l) => l.id === selectedLevel);
  const selectedLessonData = lessons.find((l) => l.id === selectedLesson);

  async function handleGenerate() {
    if (!selectedLesson || !selectedLevelData || !selectedLessonData) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Call existing generate API
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: selectedLevelData.grade_value,
          subject: "vocabulary",
          topic: selectedLessonData.title,
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

      // Save as draft curated exercises
      const supabase = createClient();
      const inserts = exercises.map((ex, i) => ({
        lesson_id: selectedLesson,
        exercise_type: exerciseType,
        exercise_data: ex,
        sort_order: i + 1,
        status: "draft",
        created_by: userId,
      }));

      const { error: insertError } = await supabase.from("curated_exercises").insert(inserts);
      if (insertError) throw new Error(insertError.message);

      setResult({ count: exercises.length });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brown-800">Seed Exercises</h1>
          <p className="text-brown-500 text-sm mt-1">Generate AI exercises for curriculum lessons</p>
        </div>
        <div className="flex gap-2">
          <Link href="/teacher/review" className="text-sm text-gold hover:text-gold-dark font-medium">
            Review queue &rarr;
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">{error}</div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-6">
          Generated {result.count} exercises as drafts. <Link href="/teacher/review" className="font-medium underline">Review them now</Link>.
        </div>
      )}

      {/* Level */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-brown-700 mb-2">Level</label>
        <select
          value={selectedLevel}
          onChange={(e) => { setSelectedLevel(e.target.value); setSelectedUnit(""); setSelectedLesson(""); }}
          className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
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
            onChange={(e) => { setSelectedUnit(e.target.value); setSelectedLesson(""); }}
            className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            <option value="">Select a unit...</option>
            {filteredUnits.map((u) => <option key={u.id} value={u.id}>{u.title}</option>)}
          </select>
        </div>
      )}

      {/* Lesson */}
      {selectedUnit && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-brown-700 mb-2">Lesson</label>
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            className="w-full px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            <option value="">Select a lesson...</option>
            {filteredLessons.map((l) => (
              <option key={l.id} value={l.id}>{l.title} ({l.lesson_type})</option>
            ))}
          </select>
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
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!selectedLesson || loading}
        className="w-full bg-gold hover:bg-gold-dark disabled:opacity-40 text-white py-3 rounded-lg font-semibold transition-colors"
      >
        {loading ? "Generating with AI..." : "Generate Exercises"}
      </button>
    </main>
  );
}
