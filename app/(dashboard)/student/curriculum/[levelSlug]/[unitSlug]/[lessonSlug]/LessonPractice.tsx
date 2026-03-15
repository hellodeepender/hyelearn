"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
import AlphabetLearnCard from "@/components/exercises/AlphabetLearnCard";

interface ExerciseEntry { type: string; data: unknown }
interface Step { kind: "learn" | "exercise"; entry: ExerciseEntry }

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

/** Build a single stream: all learn cards first, then exercises.
 *  For long lessons (>8 steps), insert refresher cards every 5+ exercises. */
function buildSteps(exercises: ExerciseEntry[]): Step[] {
  const learns = exercises.filter((e) => e.type === "learn_card");
  const practice = exercises.filter((e) => e.type !== "learn_card");

  if (learns.length === 0) return practice.map((e) => ({ kind: "exercise", entry: e }));
  if (practice.length === 0) return learns.map((e) => ({ kind: "learn", entry: e }));

  const steps: Step[] = [];

  // Show ALL learn cards first
  for (const l of learns) {
    steps.push({ kind: "learn", entry: l });
  }

  // For short lessons (8 or fewer total), no refreshers — just append exercises
  const totalRaw = learns.length + practice.length;
  if (totalRaw <= 8) {
    for (const p of practice) {
      steps.push({ kind: "exercise", entry: p });
    }
  } else {
    // Long lessons: insert refresher after every 5 consecutive exercises
    let exerciseRun = 0;
    let refresherIdx = 0;
    for (const p of practice) {
      if (exerciseRun >= 5 && refresherIdx < learns.length) {
        steps.push({ kind: "learn", entry: learns[refresherIdx++] });
        exerciseRun = 0;
      }
      steps.push({ kind: "exercise", entry: p });
      exerciseRun++;
    }
  }

  return steps;
}

export default function LessonPractice({ lessonId, lessonTitle, passingScore, exercises, backUrl, nextLessonUrl, gradeValue }: Props) {
  const young = gradeValue === "K" || gradeValue === "1";
  const learnCount = exercises.filter((e) => e.type === "learn_card").length;

  const steps = useMemo(() => buildSteps(exercises), [exercises]);
  const totalSteps = steps.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showNext, setShowNext] = useState(false);
  const [done, setDone] = useState(totalSteps === 0);
  const [result, setResult] = useState<{ passed: boolean; pct: number } | null>(null);
  const [saveError, setSaveError] = useState(false);
  const didSave = useRef(false);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current); };
  }, []);

  function advance() {
    setShowNext(false);
    if (autoAdvanceTimer.current) { clearTimeout(autoAdvanceTimer.current); autoAdvanceTimer.current = null; }
    if (currentStep + 1 >= totalSteps) {
      setDone(true);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleAnswer(correct: boolean) {
    setAnswers((prev) => [...prev, correct]);
    if (correct) {
      autoAdvanceTimer.current = setTimeout(advance, 1500);
    } else {
      setShowNext(true);
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
    if (done && !didSave.current && answers.length > 0) {
      didSave.current = true;
      saveProgress();
    }
  }, [done, answers, saveProgress]);

  function handleRetry() {
    setCurrentStep(0);
    setAnswers([]);
    setShowNext(false);
    setDone(false);
    didSave.current = false;
    setResult(null);
    setSaveError(false);
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

  // --- Complete ---
  if (done) {
    const score = answers.filter(Boolean).length;
    const total = answers.length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = result ? result.passed : pct >= passingScore;
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;

    return (
      <main className="max-w-2xl mx-auto px-6 py-12 text-center space-y-6">
        {passed ? (
          <>
            <div className="flex justify-center gap-2 text-4xl">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`transition-all duration-500 ${s <= stars ? "opacity-100 scale-100" : "opacity-20 scale-75"}`}>
                  {"\u2B50"}
                </span>
              ))}
            </div>
            <div>
              <p className={`font-bold text-green-700 ${young ? "text-3xl" : "text-2xl"}`}>Lesson Complete!</p>
              <p className="text-brown-500 mt-1">You scored {pct}%</p>
              {learnCount > 0 && (
                <p className="text-sm text-brown-400 mt-2">You learned {learnCount} new item{learnCount !== 1 ? "s" : ""}!</p>
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

  // --- Single continuous flow ---
  const step = steps[currentStep];
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);
  const isLearn = step.kind === "learn";
  const card = isLearn ? step.entry.data as {
    visual?: string; primary_text?: string; secondary_text?: string;
    letter?: string; letter_name?: string; transliteration?: string;
    sound?: string; example_word?: string; example_translation?: string; emoji?: string;
  } : null;

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-brown-700">{lessonTitle}</span>
        <Link href={backUrl} className="text-xs text-brown-400 hover:text-brown-600">Exit</Link>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-brown-400 mb-1">
          <span>{currentStep + 1} of {totalSteps}</span>
          <span>{progress}%</span>
        </div>
        <div className={`${young ? "h-3" : "h-2"} bg-brown-100 rounded-full overflow-hidden`}>
          <div className="h-full bg-gold rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Step content */}
      {isLearn && card ? (
        <>
          <div className={`bg-blue-50/50 border border-blue-100 ${young ? "rounded-3xl p-10" : "rounded-2xl p-8"} shadow-sm`}>
            {card.letter ? (
              <AlphabetLearnCard
                letter={card.letter ?? ""}
                letterName={card.letter_name ?? ""}
                transliterationText={card.transliteration}
                sound={card.sound ?? ""}
                exampleWord={card.example_word ?? ""}
                exampleTranslation={card.example_translation ?? ""}
                emoji={card.emoji ?? card.visual ?? ""}
              />
            ) : (
              <LearnCard
                visual={card.visual ?? ""}
                primaryText={card.primary_text ?? ""}
                secondaryText={card.secondary_text ?? ""}
                young={young}
              />
            )}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={advance}
              className={`bg-gold hover:bg-gold-dark text-white font-medium ${young ? "px-10 py-4 text-lg rounded-2xl" : "px-8 py-3 rounded-lg"} transition-colors`}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={`bg-warm-white border border-brown-100 ${young ? "rounded-3xl p-8" : "rounded-2xl p-6"} shadow-sm`}>
            {step.entry.type === "multiple_choice" && (
              <MultipleChoice key={currentStep} exercise={step.entry.data as MultipleChoiceExercise} onAnswer={(c) => handleAnswer(c)} young={young} />
            )}
            {step.entry.type === "fill_blank" && (
              <FillBlank key={currentStep} exercise={step.entry.data as FillBlankExercise} onAnswer={(c) => handleAnswer(c)} young={young} />
            )}
            {step.entry.type === "true_false" && (
              <TrueFalse key={currentStep} exercise={step.entry.data as TrueFalseExercise} onAnswer={(c) => handleAnswer(c)} young={young} />
            )}
            {step.entry.type === "matching" && (
              <Matching exercises={[step.entry.data as MatchingExercise]} onAnswer={(c) => handleAnswer(c)} young={young} />
            )}
          </div>
          {showNext && (
            <div className="mt-6 text-center">
              <button onClick={advance} className={`bg-gold hover:bg-gold-dark text-white font-medium ${young ? "px-10 py-4 text-lg rounded-2xl" : "px-8 py-3 rounded-lg"}`}>
                {currentStep + 1 >= totalSteps ? "See Results" : "Next"}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
