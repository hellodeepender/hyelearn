"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type {
  ExerciseType,
  MultipleChoiceExercise,
  FillBlankExercise,
  MatchingExercise,
  TrueFalseExercise,
} from "@/lib/types";
import MultipleChoice from "@/components/exercises/MultipleChoice";
import FillBlank from "@/components/exercises/FillBlank";
import Matching from "@/components/exercises/Matching";
import TrueFalse from "@/components/exercises/TrueFalse";
import ScoreSummary from "@/components/exercises/ScoreSummary";

// --- Config data ---

const SUBJECTS = [
  { id: "vocabulary", label: "Vocabulary", icon: "📖" },
  { id: "reading", label: "Reading Comprehension", icon: "📕" },
  { id: "grammar", label: "Grammar", icon: "✍️" },
  { id: "culture", label: "Culture & History", icon: "🏛️" },
] as const;

const TOPICS: Record<string, string[]> = {
  vocabulary: ["Animals", "Family", "Food & Drink", "Colors & Shapes", "School & Classroom", "Body Parts", "Greetings"],
  reading: ["Short Story", "Dialogue", "Historical Passage"],
  grammar: ["Verb Conjugation", "Noun Plurals", "Sentence Structure"],
  culture: ["Armenian Holidays", "Famous Armenians", "Geography of Armenia", "Alphabet History"],
};

const EXERCISE_TYPES: { id: ExerciseType; label: string; icon: string }[] = [
  { id: "multiple_choice", label: "Multiple Choice", icon: "🔘" },
  { id: "fill_blank", label: "Fill in the Blank", icon: "✏️" },
  { id: "matching", label: "Matching", icon: "🔗" },
  { id: "true_false", label: "True / False", icon: "⚖️" },
];

const LOADING_LETTERS = ["A", "B", "G", "D", "E", "Z", "E", "Y", "T", "Zh"];

type Phase = "config" | "loading" | "practicing" | "complete";

interface Props {
  userId: string;
  gradeLevel: number;
  userRole: string;
}

export default function PracticeClient({ userId, gradeLevel, userRole }: Props) {
  // Config state
  const [grade, setGrade] = useState(gradeLevel);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [exerciseType, setExerciseType] = useState<ExerciseType>("multiple_choice");

  // Exercise state
  const [phase, setPhase] = useState<Phase>("config");
  const [exercises, setExercises] = useState<unknown[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [hints, setHints] = useState<boolean[]>([]);
  const [error, setError] = useState("");
  const [showNext, setShowNext] = useState(false);

  async function handleGenerate() {
    setError("");
    setPhase("loading");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade,
          subject,
          topic,
          exerciseType,
          count: exerciseType === "matching" ? 5 : 4,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Generation failed");
      }

      const data = await res.json();
      setExercises(data.exercises);
      setCurrentIndex(0);
      setAnswers([]);
      setHints([]);
      setShowNext(false);
      setPhase("practicing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("config");
    }
  }

  function handleAnswer(correct: boolean, usedHint: boolean) {
    setAnswers((prev) => [...prev, correct]);
    setHints((prev) => [...prev, usedHint]);
    setShowNext(true);
  }

  function handleNext() {
    setShowNext(false);
    if (exerciseType === "matching" || currentIndex + 1 >= exercises.length) {
      setPhase("complete");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  const handleSave = useCallback(async () => {
    const score = answers.filter(Boolean).length;
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        topic,
        exercise_type: exerciseType,
        grade_level: grade,
        score,
        total: answers.length,
        exercises_data: exercises,
      }),
    });
  }, [answers, subject, topic, exerciseType, grade, exercises]);

  function handleNewSet() {
    setPhase("config");
    setExercises([]);
    setCurrentIndex(0);
    setAnswers([]);
    setHints([]);
    setShowNext(false);
  }

  const dashboardUrl = userRole === "teacher" || userRole === "admin" ? "/teacher" : "/student";

  // --- Config phase ---
  if (phase === "config") {
    const canGenerate = subject && topic;
    return (
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-brown-800">Practice</h1>
            <p className="text-brown-500 text-sm mt-1">Configure your exercise set, then generate with AI.</p>
          </div>
          <Link
            href={dashboardUrl}
            className="text-sm text-brown-500 hover:text-brown-700 border border-brown-200 hover:border-brown-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            Back
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        {/* Grade */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-brown-700 mb-2">Grade Level</label>
          <div className="flex flex-wrap gap-2">
            {[2, 3, 4, 5, 6, 7, 8].map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  grade === g
                    ? "bg-gold text-white shadow-sm"
                    : "bg-warm-white border border-brown-200 text-brown-700 hover:border-brown-300"
                }`}
              >
                Grade {g}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-brown-700 mb-2">Subject</label>
          <div className="grid grid-cols-2 gap-3">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSubject(s.id); setTopic(""); }}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  subject === s.id
                    ? "border-gold bg-gold/5 shadow-sm"
                    : "border-brown-200 hover:border-brown-300 bg-warm-white"
                }`}
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`font-medium text-sm ${subject === s.id ? "text-gold-dark" : "text-brown-700"}`}>
                  {s.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        {subject && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-brown-700 mb-2">Topic</label>
            <div className="flex flex-wrap gap-2">
              {TOPICS[subject]?.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    topic === t
                      ? "bg-gold text-white shadow-sm"
                      : "bg-warm-white border border-brown-200 text-brown-700 hover:border-brown-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Type */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-brown-700 mb-2">Exercise Type</label>
          <div className="grid grid-cols-2 gap-3">
            {EXERCISE_TYPES.map((et) => (
              <button
                key={et.id}
                onClick={() => setExerciseType(et.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  exerciseType === et.id
                    ? "border-gold bg-gold/5 shadow-sm"
                    : "border-brown-200 hover:border-brown-300 bg-warm-white"
                }`}
              >
                <span className="text-xl mr-1">{et.icon}</span>
                <span className={`font-medium text-sm ${exerciseType === et.id ? "text-gold-dark" : "text-brown-700"}`}>
                  {et.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full bg-gold hover:bg-gold-dark disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-lg text-lg font-semibold transition-colors shadow-lg shadow-gold/20"
        >
          Generate with AI
        </button>
      </main>
    );
  }

  // --- Loading phase ---
  if (phase === "loading") {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="flex justify-center gap-3 mb-6">
          {LOADING_LETTERS.map((letter, i) => (
            <span
              key={i}
              className="text-2xl font-bold text-gold animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {letter}
            </span>
          ))}
        </div>
        <p className="text-lg text-brown-600 font-medium">Generating exercises with AI...</p>
        <p className="text-sm text-brown-400 mt-1">This may take a few seconds</p>
      </main>
    );
  }

  // --- Complete phase ---
  if (phase === "complete") {
    const score = answers.filter(Boolean).length;
    const total = answers.length;
    const hintsUsed = hints.filter(Boolean).length;

    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <ScoreSummary
          score={score}
          total={total}
          hintsUsed={hintsUsed}
          subject={subject}
          topic={topic}
          grade={grade}
          onSave={handleSave}
          onNewSet={handleNewSet}
          dashboardUrl={dashboardUrl}
        />
      </main>
    );
  }

  // --- Practicing phase ---
  const exerciseCount = exercises.length;
  const progress = exerciseType === "matching"
    ? 100
    : Math.round(((currentIndex + 1) / exerciseCount) * 100);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-brown-400 mb-1">
          <span>{exerciseType === "matching" ? "Match all pairs" : `Question ${currentIndex + 1} of ${exerciseCount}`}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-brown-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Exercise card */}
      <div className="bg-warm-white border border-brown-100 rounded-2xl p-6 shadow-sm">
        {exerciseType === "multiple_choice" && (
          <MultipleChoice
            key={currentIndex}
            exercise={exercises[currentIndex] as MultipleChoiceExercise}
            onAnswer={handleAnswer}
          />
        )}
        {exerciseType === "fill_blank" && (
          <FillBlank
            key={currentIndex}
            exercise={exercises[currentIndex] as FillBlankExercise}
            onAnswer={handleAnswer}
          />
        )}
        {exerciseType === "matching" && (
          <Matching
            exercises={exercises as MatchingExercise[]}
            onAnswer={handleAnswer}
          />
        )}
        {exerciseType === "true_false" && (
          <TrueFalse
            key={currentIndex}
            exercise={exercises[currentIndex] as TrueFalseExercise}
            onAnswer={handleAnswer}
          />
        )}
      </div>

      {/* Next button */}
      {showNext && (
        <div className="mt-6 text-center">
          <button
            onClick={handleNext}
            className="bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            {exerciseType === "matching" || currentIndex + 1 >= exerciseCount ? "See Results" : "Next"}
          </button>
        </div>
      )}
    </main>
  );
}
