"use client";

import { useState, useEffect, useCallback } from "react";
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
import Confetti from "@/components/ui/Confetti";
import { playSound } from "@/lib/sounds";
import { useLocale } from "@/lib/locale-context";

// --- Config data ---

const GRADES: { value: string; label: string }[] = [
  { value: "K", label: "Kindergarten" },
  { value: "1", label: "Grade 1" },
  { value: "2", label: "Grade 2" },
  { value: "3", label: "Grade 3" },
  { value: "4", label: "Grade 4" },
  { value: "5", label: "Grade 5" },
];

const SUBJECTS = [
  { id: "vocabulary", label: "Vocabulary", icon: "📖" },
  { id: "reading", label: "Reading Comprehension", icon: "📕" },
  { id: "grammar", label: "Grammar", icon: "✍️" },
  { id: "culture", label: "Culture & History", icon: "🏛️" },
] as const;

function buildTopics(language: string) {
  const young: Record<string, string[]> = {
    vocabulary: ["Animals", "Colors", "Numbers", "Fruits & Food", "Shapes", "My Body"],
    reading: ["Short Story", "Dialogue"],
    grammar: ["Simple Words", "Sentence Structure"],
    culture: [`${language} Holidays`, "Alphabet History"],
  };
  const youngG1: Record<string, string[]> = {
    vocabulary: ["Animals", "Colors", "Numbers", "Fruits & Food", "Shapes", "My Body", "Family", "School & Classroom", "Greetings", "Weather"],
    reading: ["Short Story", "Dialogue"],
    grammar: ["Simple Words", "Noun Plurals", "Sentence Structure"],
    culture: [`${language} Holidays`, `Famous ${language}s`, "Alphabet History"],
  };
  const standard: Record<string, string[]> = {
    vocabulary: ["Animals", "Family", "Food & Drink", "Colors & Shapes", "School & Classroom", "Body Parts", "Greetings"],
    reading: ["Short Story", "Dialogue", "Historical Passage"],
    grammar: ["Verb Conjugation", "Noun Plurals", "Sentence Structure"],
    culture: [`${language} Holidays`, `Famous ${language}s`, `Geography`, "Alphabet History"],
  };
  return { young, youngG1, standard };
}

const EXERCISE_TYPES: { id: ExerciseType; label: string; icon: string }[] = [
  { id: "multiple_choice", label: "Multiple Choice", icon: "🔘" },
  { id: "fill_blank", label: "Fill in the Blank", icon: "✏️" },
  { id: "matching", label: "Matching", icon: "🔗" },
  { id: "true_false", label: "True / False", icon: "⚖️" },
];

const LOADING_LETTERS_HY = ["\u0531", "\u0532", "\u0533", "\u0534", "\u0535", "\u0536", "\u0537", "\u0538", "\u0539", "\u053A"];
const LOADING_LETTERS_EL = ["\u0391", "\u0392", "\u0393", "\u0394", "\u0395", "\u0396", "\u0397", "\u0398", "\u0399", "\u039A"];
const LOADING_LETTERS_AR = ["\u0623", "\u0628", "\u062A", "\u062B", "\u062C", "\u062D", "\u062E", "\u062F", "\u0630", "\u0631"];

type Phase = "config" | "loading" | "practicing" | "complete";

interface Props {
  userId: string;
  gradeLevel: number;
  userRole: string;
  subscriptionTier: string;
}

function isYoung(grade: string): boolean {
  return grade === "K" || grade === "1";
}

function getTopics(grade: string, language: string): Record<string, string[]> {
  const t = buildTopics(language);
  if (grade === "K") return t.young;
  if (grade === "1") return t.youngG1;
  return t.standard;
}

export default function PracticeClient({ userId, gradeLevel, userRole }: Props) {
  const { locale, englishName } = useLocale();
  const [grade, setGrade] = useState(String(gradeLevel));
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [exerciseType, setExerciseType] = useState<ExerciseType>("multiple_choice");

  const [phase, setPhase] = useState<Phase>("config");
  const [exercises, setExercises] = useState<unknown[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [hints, setHints] = useState<boolean[]>([]);
  const [error, setError] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/practice-remaining")
      .then(r => r.json())
      .then(d => setRemaining(d.remaining))
      .catch(() => {});
  }, []);

  const young = isYoung(grade);
  const topics = getTopics(grade, englishName);
  const loadingLetters = locale === "el" ? LOADING_LETTERS_EL : locale === "ar" ? LOADING_LETTERS_AR : LOADING_LETTERS_HY;

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
          count: exerciseType === "matching" ? (young ? 4 : 5) : (young ? 3 : 4),
          locale,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 403) {
          setRateLimited(true);
          setPhase("config");
          return;
        }
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
        grade_level: grade === "K" ? 0 : Number(grade),
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

  // --- Rate limited ---
  if (rateLimited) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-10 text-center">
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-8">
          <div className="text-5xl mb-4">{"\u23F0"}</div>
          <h2 className="text-xl font-bold text-brown-800 mb-2">Daily practice limit reached</h2>
          <p className="text-brown-500 text-sm mb-6 max-w-md mx-auto">
            You&apos;ve used all your practice sessions for today. Come back tomorrow for more!
            In the meantime, you can review lessons in the curriculum.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/student/curriculum" className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Go to Curriculum
            </Link>
            <Link href={dashboardUrl} className="text-sm text-brown-400 hover:text-brown-600">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // --- Config phase ---
  if (phase === "config") {
    const canGenerate = subject && topic;
    return (
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-brown-800">Practice</h1>
            <p className="text-brown-500 text-sm mt-1">
              Choose a topic and exercise type to practice.
              {remaining !== null && (
                <span className="text-brown-400 ml-1">({remaining} session{remaining !== 1 ? "s" : ""} left today)</span>
              )}
            </p>
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
            {GRADES.map((g) => (
              <button
                key={g.value}
                onClick={() => { setGrade(g.value); setSubject(""); setTopic(""); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  grade === g.value
                    ? "bg-gold text-white shadow-sm"
                    : "bg-warm-white border border-brown-200 text-brown-700 hover:border-brown-300"
                }`}
              >
                {g.label}
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
        {subject && topics[subject] && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-brown-700 mb-2">Topic</label>
            <div className="flex flex-wrap gap-2">
              {topics[subject].map((t) => (
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
          Generate Practice
        </button>
      </main>
    );
  }

  // --- Loading phase ---
  if (phase === "loading") {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="flex justify-center gap-3 mb-6">
          {loadingLetters.map((letter, i) => (
            <span
              key={i}
              className="text-2xl font-bold text-gold animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {letter}
            </span>
          ))}
        </div>
        <p className="text-lg text-brown-600 font-medium">Creating your practice exercises...</p>
        <p className="text-sm text-brown-400 mt-1">This may take a few seconds</p>
      </main>
    );
  }

  // --- Complete phase ---
  if (phase === "complete") {
    const score = answers.filter(Boolean).length;
    const total = answers.length;
    const hintsUsed = hints.filter(Boolean).length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = pct >= 70;

    if (passed) playSound("complete");

    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <Confetti show={passed} />
        <ScoreSummary
          score={score}
          total={total}
          hintsUsed={hintsUsed}
          subject={subject}
          topic={topic}
          grade={grade === "K" ? 0 : Number(grade)}
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
        <div className={`${young ? "h-3" : "h-2"} bg-brown-100 rounded-full overflow-hidden`}>
          <div
            className="h-full bg-gold rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Exercise card */}
      <div className={`bg-warm-white border border-brown-100 ${young ? "rounded-3xl p-8" : "rounded-2xl p-6"} shadow-sm`}>
        {exerciseType === "multiple_choice" && (
          <MultipleChoice
            key={currentIndex}
            exercise={exercises[currentIndex] as MultipleChoiceExercise}
            onAnswer={handleAnswer}
            young={young}
            locale={locale}
          />
        )}
        {exerciseType === "fill_blank" && (
          <FillBlank
            key={currentIndex}
            exercise={exercises[currentIndex] as FillBlankExercise}
            onAnswer={handleAnswer}
            young={young}
            locale={locale}
          />
        )}
        {exerciseType === "matching" && (
          <Matching
            exercises={exercises as MatchingExercise[]}
            onAnswer={handleAnswer}
            young={young}
            locale={locale}
          />
        )}
        {exerciseType === "true_false" && (
          <TrueFalse
            key={currentIndex}
            exercise={exercises[currentIndex] as TrueFalseExercise}
            onAnswer={handleAnswer}
            young={young}
            locale={locale}
          />
        )}
      </div>

      {/* Next button */}
      {showNext && (
        <div className="mt-6 text-center">
          <button
            onClick={handleNext}
            className={`bg-gold hover:bg-gold-dark text-white px-8 ${young ? "py-4 text-lg rounded-2xl" : "py-3 rounded-lg"} font-medium transition-colors`}
          >
            {exerciseType === "matching" || currentIndex + 1 >= exerciseCount ? "See Results" : "Next"}
          </button>
        </div>
      )}
    </main>
  );
}
