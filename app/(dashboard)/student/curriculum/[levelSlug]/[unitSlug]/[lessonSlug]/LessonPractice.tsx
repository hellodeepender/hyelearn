"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type {
  MultipleChoiceExercise,
  FillBlankExercise,
  MatchingExercise,
  TrueFalseExercise,
} from "@/lib/types";
import MultipleChoice from "@/components/exercises/MultipleChoice";
import FillBlank from "@/components/exercises/FillBlank";
import Matching from "@/components/exercises/Matching";
import TrueFalse from "@/components/exercises/TrueFalse";

interface ExerciseEntry {
  type: string;
  data: unknown;
}

interface Props {
  lessonId: string;
  lessonTitle: string;
  lessonType: string;
  passingScore: number;
  exercises: ExerciseEntry[];
  backUrl: string;
  gradeValue: string;
}

export default function LessonPractice({ lessonId, lessonTitle, lessonType, passingScore, exercises, backUrl, gradeValue }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showNext, setShowNext] = useState(false);
  const [phase, setPhase] = useState<"practicing" | "complete">(exercises.length > 0 ? "practicing" : "complete");
  const [result, setResult] = useState<{ passed: boolean; pct: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const young = gradeValue === "K" || gradeValue === "1";

  // Handle matching exercises as a batch
  const matchingExercises = exercises.filter((e) => e.type === "matching");
  const nonMatchingExercises = exercises.filter((e) => e.type !== "matching");
  const hasMatching = matchingExercises.length > 0;

  // If all exercises are matching, treat as one "question"
  const exerciseList = hasMatching && nonMatchingExercises.length === 0
    ? [{ type: "matching_batch", data: matchingExercises.map((e) => e.data) }]
    : exercises;

  function handleAnswer(correct: boolean, _usedHint: boolean) {
    setAnswers((prev) => [...prev, correct]);
    setShowNext(true);
  }

  const handleNext = useCallback(() => {
    setShowNext(false);
    if (currentIndex + 1 >= exerciseList.length) {
      setPhase("complete");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, exerciseList.length]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const score = answers.filter(Boolean).length;
    const total = answers.length;
    try {
      const res = await fetch("/api/curriculum/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId, score, total }),
      });
      const data = await res.json();
      setResult({ passed: data.passed, pct: data.pct });
    } catch {
      setResult({ passed: false, pct: 0 });
    }
    setSaving(false);
  }, [answers, lessonId]);

  // Empty state
  if (exercises.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-brown-800 mb-2">{lessonTitle}</h1>
        <p className="text-brown-500 mb-6">No exercises available yet. Your teacher is preparing content for this lesson.</p>
        <Link href={backUrl} className="text-gold hover:text-gold-dark font-medium">&larr; Back to unit</Link>
      </main>
    );
  }

  // Complete phase
  if (phase === "complete") {
    const score = answers.filter(Boolean).length;
    const total = answers.length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
      <main className="max-w-2xl mx-auto px-6 py-12 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-36 h-36 rounded-full border-4 border-gold bg-gold/10 mb-2">
          <div>
            <p className="text-4xl font-bold text-gold">{score}/{total}</p>
            <p className="text-sm text-brown-400">{pct}%</p>
          </div>
        </div>

        {result ? (
          <div>
            {result.passed ? (
              <p className="text-2xl font-bold text-green-700">Lesson passed!</p>
            ) : (
              <p className="text-2xl font-bold text-brown-800">
                {pct < passingScore ? `Need ${passingScore}% to pass. Try again!` : "Good effort!"}
              </p>
            )}
            <p className="text-sm text-green-600 mt-1">Progress saved</p>
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium"
          >
            {saving ? "Saving..." : "Save Results"}
          </button>
        )}

        <div className="text-sm text-brown-400">
          <span className="capitalize">{lessonType}</span> &middot; Passing: {passingScore}%
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          {result && !result.passed && (
            <button
              onClick={() => { setCurrentIndex(0); setAnswers([]); setShowNext(false); setPhase("practicing"); setResult(null); }}
              className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-medium"
            >
              Try Again
            </button>
          )}
          <Link href={backUrl} className="border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-6 py-3 rounded-lg font-medium text-center">
            Back to Unit
          </Link>
        </div>
      </main>
    );
  }

  // Practicing phase
  const entry = exerciseList[currentIndex];
  const totalQ = exerciseList.length;
  const progress = Math.round(((currentIndex + 1) / totalQ) * 100);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-brown-800">{lessonTitle}</h2>
        <Link href={backUrl} className="text-xs text-brown-400 hover:text-brown-600">Exit</Link>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-brown-400 mb-1">
          <span>Question {currentIndex + 1} of {totalQ}</span>
          <span>{progress}%</span>
        </div>
        <div className={`${young ? "h-3" : "h-2"} bg-brown-100 rounded-full overflow-hidden`}>
          <div className="h-full bg-gold rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={`bg-warm-white border border-brown-100 ${young ? "rounded-3xl p-8" : "rounded-2xl p-6"} shadow-sm`}>
        {entry.type === "multiple_choice" && (
          <MultipleChoice key={currentIndex} exercise={entry.data as MultipleChoiceExercise} onAnswer={handleAnswer} young={young} />
        )}
        {entry.type === "fill_blank" && (
          <FillBlank key={currentIndex} exercise={entry.data as FillBlankExercise} onAnswer={handleAnswer} young={young} />
        )}
        {entry.type === "true_false" && (
          <TrueFalse key={currentIndex} exercise={entry.data as TrueFalseExercise} onAnswer={handleAnswer} young={young} />
        )}
        {entry.type === "matching" && (
          <Matching exercises={[entry.data as MatchingExercise]} onAnswer={handleAnswer} young={young} />
        )}
        {entry.type === "matching_batch" && (
          <Matching exercises={entry.data as MatchingExercise[]} onAnswer={handleAnswer} young={young} />
        )}
      </div>

      {showNext && (
        <div className="mt-6 text-center">
          <button onClick={handleNext} className="bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-medium">
            {currentIndex + 1 >= totalQ ? "See Results" : "Next"}
          </button>
        </div>
      )}
    </main>
  );
}
