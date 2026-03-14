"use client";

import { useState, useMemo } from "react";
import type { FillBlankExercise } from "@/lib/types";

interface Props {
  exercise: FillBlankExercise;
  onAnswer: (correct: boolean, usedHint: boolean) => void;
  young?: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FillBlank({ exercise, onAnswer, young }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const answered = selected !== null;

  const wordBank = useMemo(() => {
    const options = [
      { hy: exercise.answer_hy, en: exercise.answer_en, emoji: exercise.answer_emoji, isCorrect: true },
      ...exercise.distractors_hy.map((hy, i) => ({
        hy,
        en: exercise.distractors_en[i] ?? "",
        emoji: exercise.distractors_emoji?.[i],
        isCorrect: false,
      })),
    ];
    return shuffle(options);
  }, [exercise]);

  function handleSelect(index: number) {
    if (answered) return;
    setSelected(index);
    onAnswer(wordBank[index].isCorrect, hintShown);
  }

  const parts = exercise.sentence_hy.split("___");

  return (
    <div className="space-y-6">
      {/* Emoji visual (young learners) */}
      {exercise.emoji && (
        <div className="text-center">
          <span className={young ? "text-7xl" : "text-5xl"}>{exercise.emoji}</span>
        </div>
      )}

      {/* Sentence */}
      <div>
        <p className={`font-semibold text-brown-800 leading-relaxed ${young ? "text-3xl" : "text-2xl"}`}>
          {parts[0]}
          <span className={`inline-block min-w-[80px] border-b-2 mx-1 text-center ${
            answered
              ? wordBank[selected!].isCorrect
                ? "border-green-500 text-green-700"
                : "border-red-500 text-red-700"
              : "border-gold text-brown-300"
          }`}>
            {answered ? wordBank[selected!].hy : "\u00A0\u00A0\u00A0?\u00A0\u00A0\u00A0"}
          </span>
          {parts[1] ?? ""}
        </p>
        {!answered && !hintShown && (
          <button
            onClick={() => setHintShown(true)}
            className="text-xs text-brown-300 hover:text-brown-400 mt-2 transition-colors"
          >
            Need help? Show English
          </button>
        )}
        {(hintShown || answered) && (
          <p className="text-sm text-brown-400 mt-1 animate-fade-in">
            {exercise.sentence_en}
          </p>
        )}
      </div>

      {/* Word bank */}
      <div className="grid grid-cols-2 gap-3">
        {wordBank.map((word, i) => {
          let style = young
            ? "border-brown-200 hover:border-brown-300 bg-amber-50/30"
            : "border-brown-200 hover:border-brown-300 bg-warm-white";
          if (answered) {
            if (word.isCorrect) {
              style = "border-green-500 bg-green-50 ring-2 ring-green-200";
            } else if (i === selected) {
              style = "border-red-500 bg-red-50 ring-2 ring-red-200";
            } else {
              style = "border-brown-100 bg-brown-50 opacity-50";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={`p-4 ${young ? "rounded-2xl min-h-[56px]" : "rounded-xl"} border-2 text-center transition-all ${style}`}
            >
              <span className={`block font-medium text-brown-800 ${young ? "text-xl" : "text-lg"}`}>{word.hy}</span>
              {answered && (
                <span className="block text-xs text-brown-400 mt-0.5 animate-fade-in">{word.en}</span>
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`bg-cream-dark/50 border border-brown-200 ${young ? "rounded-2xl" : "rounded-xl"} p-4 space-y-1 animate-fade-in`}>
          <p className="text-brown-700 font-medium">{exercise.explanation_hy}</p>
          <p className="text-sm text-brown-400">{exercise.explanation_en}</p>
        </div>
      )}
    </div>
  );
}
