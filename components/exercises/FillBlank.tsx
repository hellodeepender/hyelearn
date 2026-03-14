"use client";

import { useState, useMemo } from "react";
import type { FillBlankExercise } from "@/lib/types";

interface Props {
  exercise: FillBlankExercise;
  onAnswer: (correct: boolean, usedHint: boolean) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FillBlank({ exercise, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const answered = selected !== null;

  const wordBank = useMemo(() => {
    const options = [
      { hy: exercise.answer_hy, en: exercise.answer_en, isCorrect: true },
      ...exercise.distractors_hy.map((hy, i) => ({
        hy,
        en: exercise.distractors_en[i] ?? "",
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
      {/* Sentence — Armenian only, English revealed after answering */}
      <div>
        <p className="text-2xl font-semibold text-brown-800 leading-relaxed">
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

      {/* Word bank — Armenian only before answer, English subtitles after */}
      <div className="grid grid-cols-2 gap-3">
        {wordBank.map((word, i) => {
          let style = "border-brown-200 hover:border-brown-300 bg-warm-white";
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
              className={`p-4 rounded-xl border-2 text-center transition-all ${style}`}
            >
              <span className="block text-lg font-medium text-brown-800">{word.hy}</span>
              {answered && (
                <span className="block text-xs text-brown-400 mt-0.5 animate-fade-in">{word.en}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation — after answering */}
      {answered && (
        <div className="bg-cream-dark/50 border border-brown-200 rounded-xl p-4 space-y-1 animate-fade-in">
          <p className="text-brown-700 font-medium">{exercise.explanation_hy}</p>
          <p className="text-sm text-brown-400">{exercise.explanation_en}</p>
        </div>
      )}
    </div>
  );
}
