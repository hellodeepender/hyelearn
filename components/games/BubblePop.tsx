"use client";

import { useState, useMemo } from "react";
import { lf } from "@/lib/exercise-utils";
import { playSound } from "@/lib/sounds";
import Mascot from "@/components/ui/Mascot";

interface Props {
  exercises: unknown[];
  onComplete: (score: number, total: number) => void;
  locale: string;
  young: boolean;
}

const BUBBLE_COLORS = [
  "from-blue-200 to-blue-100",
  "from-green-200 to-green-100",
  "from-purple-200 to-purple-100",
  "from-pink-200 to-pink-100",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BubblePop({ exercises, onComplete, locale, young }: Props) {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [popped, setPopped] = useState<Set<string>>(new Set());
  const [shaking, setShaking] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [done, setDone] = useState(false);

  const total = exercises.length;
  const exercise = exercises[qIndex] as Record<string, unknown> | undefined;

  const options = useMemo(() => {
    if (!exercise?.options) return [];
    return shuffle((exercise.options as Record<string, unknown>[]).map((opt, i) => ({
      id: (opt.id as string) ?? String(i),
      text: (lf(opt, "text", locale) as string) || "",
      en: (opt.text_en as string) || "",
      correct: opt.correct as boolean,
      color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
    })));
  }, [exercise, locale, qIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const questionText = exercise ? (lf(exercise, "question", locale) as string) : "";
  const questionEn = exercise ? (exercise.question_en as string) : "";

  function handleBubbleTap(id: string, correct: boolean) {
    if (advancing || popped.has(id)) return;

    if (correct) {
      playSound("correct");
      setPopped(new Set(options.map((o) => o.id))); // pop all
      setScore((s) => s + 1);
      setAdvancing(true);
      setTimeout(() => advance(), 1200);
    } else {
      playSound("wrong");
      setShaking(id);
      setTimeout(() => {
        setShaking(null);
        setPopped((p) => new Set([...p, id]));
      }, 400);
    }
  }

  function advance() {
    if (qIndex + 1 >= total) {
      setDone(true);
      playSound("complete");
      setTimeout(() => onComplete(score + (advancing ? 0 : 0), total), 2000);
      // Score already incremented in handleBubbleTap
      return;
    }
    setQIndex((i) => i + 1);
    setPopped(new Set());
    setShaking(null);
    setAdvancing(false);
  }

  // Fix: pass actual final score on done
  const finalScore = score;

  if (done) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <Mascot pose="celebrating" size={120} className="mb-4" />
        <p className="text-2xl font-bold text-brown-800 mb-2">All done!</p>
        <p className="text-brown-500">{finalScore} out of {total} correct</p>
      </main>
    );
  }

  const bubbleSize = young ? "w-28 h-28 md:w-36 md:h-36" : "w-24 h-24 md:w-28 md:h-28";
  const textSize = young ? "text-base md:text-lg" : "text-sm md:text-base";

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => onComplete(score, total)} className="text-sm text-brown-400 hover:text-brown-600">Quit</button>
        <span className="text-sm text-brown-500">{qIndex + 1} / {total}</span>
      </div>

      {/* Question */}
      <div className="bg-warm-white border border-brown-100 rounded-2xl p-6 mb-8 text-center shadow-sm">
        {exercise?.emoji ? <span className={young ? "text-5xl" : "text-4xl"}>{String(exercise.emoji)}</span> : null}
        <p className={`font-semibold text-brown-800 mt-2 ${young ? "text-2xl" : "text-xl"}`}>
          {questionText}
        </p>
        <p className="text-sm text-brown-400 mt-1">{questionEn}</p>
      </div>

      {/* Bubbles */}
      <div className="flex flex-wrap justify-center gap-4 min-h-[200px]">
        {options.map((opt, i) => {
          const isPopped = popped.has(opt.id);
          const isShaking = shaking === opt.id;

          return (
            <button
              key={`${qIndex}-${opt.id}`}
              onClick={() => handleBubbleTap(opt.id, opt.correct)}
              disabled={isPopped || advancing}
              className={`${bubbleSize} rounded-full bg-gradient-to-br ${opt.color} border-2 border-white/50 shadow-lg flex items-center justify-center p-3 transition-all
                ${isPopped ? "animate-pop pointer-events-none" : ""}
                ${isShaking ? "animate-shake" : ""}
                ${!isPopped && !advancing ? "animate-float hover:scale-105" : ""}
              `}
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <span className={`font-medium text-brown-800 text-center leading-tight ${textSize}`}>
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
