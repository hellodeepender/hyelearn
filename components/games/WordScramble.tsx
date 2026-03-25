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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WordScramble({ exercises, onComplete, locale, young }: Props) {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const total = exercises.length;
  const exercise = exercises[qIndex] as Record<string, unknown> | undefined;
  const answer = exercise ? (lf(exercise, "answer", locale) as string) : "";
  const answerEn = exercise ? (exercise.answer_en as string) ?? "" : "";
  const emoji = exercise ? (exercise.emoji as string) ?? "" : "";

  const letters = useMemo(() => {
    const chars = Array.from(answer);
    return shuffle(chars.map((ch, i) => ({ id: i, char: ch })));
  }, [answer, qIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const slots = Array.from(answer);
  const tileSize = young ? "w-14 h-14 text-xl" : "w-12 h-12 text-lg";

  function handleLetterTap(letterId: number) {
    if (result) return;
    if (placed.includes(letterId)) {
      setPlaced((p) => p.filter((id) => id !== letterId));
      return;
    }
    if (placed.length >= slots.length) return;

    const next = [...placed, letterId];
    setPlaced(next);

    if (next.length === slots.length) {
      const attempt = next.map((id) => letters.find((l) => l.id === id)!.char).join("");
      if (attempt === answer) {
        playSound("correct");
        setResult("correct");
        setScore((s) => s + 1);
        setTimeout(() => advance(), 1500);
      } else {
        playSound("wrong");
        setResult("wrong");
        setTimeout(() => {
          setPlaced([]);
          setResult(null);
        }, 1000);
      }
    }
  }

  function advance() {
    if (qIndex + 1 >= total) {
      setDone(true);
      playSound("complete");
      setTimeout(() => onComplete(score, total), 2000);
      return;
    }
    setQIndex((i) => i + 1);
    setPlaced([]);
    setResult(null);
  }

  if (done) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <Mascot pose="celebrating" size={120} className="mb-4" />
        <p className="text-2xl font-bold text-brown-800 mb-2">All done!</p>
        <p className="text-brown-500">{score} out of {total} correct</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => onComplete(score, total)} className="text-sm text-brown-400 hover:text-brown-600">Quit</button>
        <span className="text-sm text-brown-500">{qIndex + 1} / {total}</span>
      </div>

      {/* Clue */}
      <div className="text-center mb-8">
        {emoji && <span className={young ? "text-6xl" : "text-5xl"}>{emoji}</span>}
        <p className={`font-semibold text-brown-800 mt-2 ${young ? "text-2xl" : "text-xl"}`}>
          {answerEn}
        </p>
        <p className="text-sm text-brown-400 mt-1">Unscramble the letters</p>
      </div>

      {/* Answer slots */}
      <div className={`flex justify-center gap-2 mb-8 ${result === "wrong" ? "animate-shake" : ""}`}>
        {slots.map((_, i) => {
          const letterId = placed[i];
          const letter = letterId !== undefined ? letters.find((l) => l.id === letterId) : null;
          const isCorrect = result === "correct";

          return (
            <button
              key={i}
              onClick={() => letterId !== undefined && handleLetterTap(letterId)}
              className={`${tileSize} rounded-xl border-2 flex items-center justify-center font-bold transition-all ${
                isCorrect
                  ? "bg-green-100 border-green-500 text-green-700"
                  : letter
                  ? "bg-warm-white border-brown-300 text-brown-800 hover:border-brown-400"
                  : "bg-brown-50 border-dashed border-brown-200"
              }`}
            >
              {letter?.char ?? ""}
            </button>
          );
        })}
      </div>

      {/* Letter tiles */}
      <div className="flex flex-wrap justify-center gap-2">
        {letters.map((letter) => {
          const isPlaced = placed.includes(letter.id);
          return (
            <button
              key={letter.id}
              onClick={() => handleLetterTap(letter.id)}
              disabled={result === "correct"}
              className={`${tileSize} rounded-xl border-2 flex items-center justify-center font-bold transition-all ${
                isPlaced
                  ? "bg-brown-50 border-brown-100 text-brown-200"
                  : "bg-warm-white border-brown-200 text-brown-800 hover:border-brown-300 hover:shadow-sm"
              }`}
            >
              {letter.char}
            </button>
          );
        })}
      </div>
    </main>
  );
}
