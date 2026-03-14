"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import LearnCard from "@/components/exercises/LearnCard";

interface ExerciseEntry { type: string; data: unknown }

interface Props {
  lessonId: string;
  lessonTitle: string;
  lessonType: string;
  passingScore: number;
  exercises: ExerciseEntry[];
  backUrl: string;
  nextLessonUrl?: string;
  gradeValue: string;
}

type Phase = "learn" | "transition" | "practice" | "complete";

export default function LessonPractice({ lessonId, lessonTitle, passingScore, exercises, backUrl, nextLessonUrl, gradeValue }: Props) {
  const young = gradeValue === "K" || gradeValue === "1";

  // Split exercises into learn cards and practice questions
  const learnCards = exercises.filter((e) => e.type === "learn_card");
  const practiceExercises = exercises.filter((e) => e.type !== "learn_card");

  const [phase, setPhase] = useState<Phase>(learnCards.length > 0 ? "learn" : practiceExercises.length > 0 ? "practice" : "complete");
  const [learnIndex, setLearnIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showNext, setShowNext] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; pct: number } | null>(null);
  const [saveError, setSaveError] = useState(false);
  const didSave = useRef(false);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current); };
  }, []);

  // --- Learn phase handlers ---
  function handleLearnNext() {
    if (learnIndex + 1 >= learnCards.length) {
      if (practiceExercises.length > 0) {
        setPhase("transition");
      } else {
        setPhase("complete");
      }
    } else {
      setLearnIndex((i) => i + 1);
    }
  }

  function handleStartPractice() {
    setPhase("practice");
  }

  // --- Practice phase handlers ---
  function handleAnswer(correct: boolean) {
    setAnswers((prev) => [...prev, correct]);

    if (correct) {
      // Auto-advance after 1.5s on correct answer
      autoAdvanceTimer.current = setTimeout(() => {
        advancePractice();
      }, 1500);
    } else {
      setShowNext(true);
    }
  }

  function advancePractice() {
    setShowNext(false);
    if (autoAdvanceTimer.current) { clearTimeout(autoAdvanceTimer.current); autoAdvanceTimer.current = null; }

    if (practiceIndex + 1 >= practiceExercises.length) {
      setPhase("complete");
    } else {
      setPracticeIndex((i) => i + 1);
    }
  }

  // --- Save progress ---
  const saveProgress = useCallback(async () => {
    const score = answers.filter(Boolean).length;
    const total = answers.length;
    const localPct = total > 0 ? Math.round((score / total) * 100) : 0;
    const localPassed = localPct >= passingScore;

    try {
      const res = await fetch("/api/curriculum/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId, score, total }),
      });
      if (!res.ok) {
        setSaveError(true);
        setResult({ passed: localPassed, pct: localPct });
        return;
      }
      const data = await res.json();
      setResult({ passed: data.passed ?? localPassed, pct: data.pct ?? localPct });
    } catch {
      setSaveError(true);
      setResult({ passed: localPassed, pct: localPct });
    }
  }, [answers, lessonId, passingScore]);

  useEffect(() => {
    if (phase === "complete" && !didSave.current && answers.length > 0) {
      didSave.current = true;
      saveProgress();
    }
  }, [phase, answers, saveProgress]);

  function handleRetry() {
    setPracticeIndex(0);
    setAnswers([]);
    setShowNext(false);
    didSave.current = false;
    setResult(null);
    setSaveError(false);
    setPhase(learnCards.length > 0 ? "learn" : "practice");
    setLearnIndex(0);
  }

  // --- Empty state ---
  if (exercises.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-brown-800 mb-2">{lessonTitle}</h1>
        <p className="text-brown-500 mb-6">No exercises available yet. Your teacher is preparing content.</p>
        <Link href={backUrl} className="text-gold hover:text-gold-dark font-medium">&larr; Back to unit</Link>
      </main>
    );
  }

  // --- Learn phase ---
  if (phase === "learn") {
    const card = learnCards[learnIndex]?.data as { visual?: string; primary_text?: string; secondary_text?: string } | undefined;
    if (!card) { setPhase("practice"); return null; }

    return (
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">Learn</span>
            <span className="text-sm text-brown-400">{lessonTitle}</span>
          </div>
          <Link href={backUrl} className="text-xs text-brown-400 hover:text-brown-600">Exit</Link>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-8">
          {learnCards.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-all ${
              i < learnIndex ? "bg-blue-400" : i === learnIndex ? "bg-blue-500" : "bg-brown-100"
            }`} />
          ))}
        </div>

        <div className={`bg-blue-50/50 border border-blue-100 ${young ? "rounded-3xl p-10" : "rounded-2xl p-8"} shadow-sm`}>
          <LearnCard
            visual={card.visual ?? ""}
            primaryText={card.primary_text ?? ""}
            secondaryText={card.secondary_text ?? ""}
            young={young}
          />
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleLearnNext}
            className={`bg-blue-500 hover:bg-blue-600 text-white ${young ? "px-10 py-4 text-lg rounded-2xl" : "px-8 py-3 rounded-lg"} font-medium transition-colors`}
          >
            {learnIndex + 1 >= learnCards.length ? "Start Practice" : "Next"}
          </button>
        </div>
      </main>
    );
  }

  // --- Transition ---
  if (phase === "transition") {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className={young ? "text-6xl mb-6" : "text-5xl mb-4"}>{"\u{1F4AA}"}</div>
        <h2 className={`font-bold text-brown-800 mb-3 ${young ? "text-3xl" : "text-2xl"}`}>
          Now let&apos;s practice!
        </h2>
        <p className="text-brown-500 mb-8">
          Let&apos;s see what you remember from the lesson.
        </p>
        <button
          onClick={handleStartPractice}
          className={`bg-gold hover:bg-gold-dark text-white ${young ? "px-10 py-4 text-lg rounded-2xl" : "px-8 py-3 rounded-lg"} font-semibold transition-colors`}
        >
          Let&apos;s Go!
        </button>
      </main>
    );
  }

  // --- Complete phase ---
  if (phase === "complete") {
    const score = answers.filter(Boolean).length;
    const total = answers.length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = result ? result.passed : pct >= passingScore;
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;

    return (
      <main className="max-w-2xl mx-auto px-6 py-12 text-center space-y-6">
        {passed ? (
          <>
            {/* Stars */}
            <div className="flex justify-center gap-2 text-4xl">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`transition-all duration-500 ${s <= stars ? "opacity-100 scale-100" : "opacity-20 scale-75"}`}
                  style={{ animationDelay: `${s * 0.2}s` }}>
                  {"\u2B50"}
                </span>
              ))}
            </div>

            <div>
              <p className={`font-bold text-green-700 ${young ? "text-3xl" : "text-2xl"}`}>Lesson Complete!</p>
              <p className="text-brown-500 mt-1">You scored {pct}%</p>
              {learnCards.length > 0 && (
                <p className="text-sm text-brown-400 mt-2">
                  You learned {learnCards.length} new item{learnCards.length !== 1 ? "s" : ""}!
                </p>
              )}
              {!saveError && <p className="text-xs text-green-600 mt-2">Progress saved</p>}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              {nextLessonUrl && (
                <Link href={nextLessonUrl} className={`bg-green-600 hover:bg-green-700 text-white font-medium text-center ${young ? "py-4 text-lg rounded-2xl" : "py-3 rounded-lg"}`}>
                  Continue to next lesson
                </Link>
              )}
              <button onClick={handleRetry} className="border-2 border-brown-200 hover:border-brown-300 text-brown-700 py-3 rounded-lg font-medium">
                {stars < 3 ? "Try for 3 stars" : "Practice again"}
              </button>
              <Link href={backUrl} className="text-sm text-brown-400 hover:text-brown-600 mt-1">Back to Unit</Link>
            </div>
          </>
        ) : (
          <>
            <div className={young ? "text-6xl" : "text-5xl"}>{"\u{1F4AA}"}</div>
            <div>
              <p className={`font-bold text-brown-800 ${young ? "text-3xl" : "text-2xl"}`}>You&apos;re getting there!</p>
              <p className="text-brown-500 mt-1">You scored {pct}%. Try one more time!</p>
              {!saveError && <p className="text-xs text-green-600 mt-2">Progress saved</p>}
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <button onClick={handleRetry} className={`bg-gold hover:bg-gold-dark text-white font-semibold ${young ? "py-4 text-lg rounded-2xl" : "py-3 rounded-lg"}`}>
                Practice Again
              </button>
              <Link href={backUrl} className="text-sm text-brown-400 hover:text-brown-600">Back to Unit</Link>
            </div>
          </>
        )}
      </main>
    );
  }

  // --- Practice phase ---
  const entry = practiceExercises[practiceIndex];
  const totalQ = practiceExercises.length;
  const progress = Math.round(((practiceIndex + 1) / totalQ) * 100);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-gold/10 text-gold-dark">Practice</span>
          <span className="text-sm text-brown-400">{lessonTitle}</span>
        </div>
        <Link href={backUrl} className="text-xs text-brown-400 hover:text-brown-600">Exit</Link>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mb-8">
        {practiceExercises.map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-all ${
            i < practiceIndex ? (answers[i] ? "bg-green-400" : "bg-red-300")
            : i === practiceIndex ? "bg-gold"
            : "bg-brown-100"
          }`} />
        ))}
      </div>

      <div className={`bg-warm-white border border-brown-100 ${young ? "rounded-3xl p-8" : "rounded-2xl p-6"} shadow-sm`}>
        {entry.type === "multiple_choice" && (
          <MultipleChoice key={practiceIndex} exercise={entry.data as MultipleChoiceExercise} onAnswer={(c) => handleAnswer(c)} young={young} />
        )}
        {entry.type === "fill_blank" && (
          <FillBlank key={practiceIndex} exercise={entry.data as FillBlankExercise} onAnswer={(c) => handleAnswer(c)} young={young} />
        )}
        {entry.type === "true_false" && (
          <TrueFalse key={practiceIndex} exercise={entry.data as TrueFalseExercise} onAnswer={(c) => handleAnswer(c)} young={young} />
        )}
        {entry.type === "matching" && (
          <Matching exercises={[entry.data as MatchingExercise]} onAnswer={(c) => handleAnswer(c)} young={young} />
        )}
      </div>

      {showNext && (
        <div className="mt-6 text-center">
          <button onClick={advancePractice} className={`bg-gold hover:bg-gold-dark text-white font-medium ${young ? "px-10 py-4 text-lg rounded-2xl" : "px-8 py-3 rounded-lg"}`}>
            {practiceIndex + 1 >= totalQ ? "See Results" : "Next"}
          </button>
        </div>
      )}
    </main>
  );
}
