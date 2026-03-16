"use client";

import { useState, useMemo } from "react";
import type { MultipleChoiceExercise, MCOption } from "@/lib/types";

interface Props {
  exercise: MultipleChoiceExercise;
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

export default function MultipleChoice({ exercise, onAnswer, young }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const answered = selected !== null;
  const showCorrect = (exercise as unknown as Record<string, unknown>).showCorrectAnswer !== false;

  const shuffledOptions = useMemo<MCOption[]>(() => shuffle(exercise.options), [exercise]);

  function handleSelect(optionId: string) {
    if (answered) return;
    setSelected(optionId);
    const opt = shuffledOptions.find((o) => o.id === optionId);
    onAnswer(opt?.correct ?? false, hintShown);
  }

  return (
    <div className="space-y-6">
      {exercise.emoji && (
        <div className="text-center">
          <span className={young ? "text-7xl" : "text-5xl"}>{exercise.emoji}</span>
        </div>
      )}

      <div>
        <p className={`font-semibold text-brown-800 leading-relaxed ${young ? "text-3xl" : "text-2xl"}`}>
          {exercise.question_hy}
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
            {exercise.question_en}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {shuffledOptions.map((opt) => {
          let style: string;

          if (answered) {
            if (opt.correct && showCorrect) {
              style = "border-green-500 bg-green-50 ring-2 ring-green-200";
            } else if (opt.id === selected && !opt.correct) {
              style = "border-red-400 bg-red-50 ring-2 ring-red-200";
            } else {
              style = "border-brown-100 bg-brown-50/50 opacity-50";
            }
          } else {
            style = "border-brown-200 bg-warm-white hover:bg-brown-50 hover:shadow-sm";
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={answered}
              className={`w-full text-left py-4 px-6 rounded-xl border-2 min-h-[56px] transition-all duration-150 ${style}`}
            >
              <div className="flex items-center gap-3">
                {answered && opt.correct && showCorrect && <span className="text-green-600 text-lg shrink-0">{"\u2713"}</span>}
                {answered && opt.id === selected && !opt.correct && <span className="text-red-500 text-lg shrink-0">{"\u2717"}</span>}
                <span className={`font-medium text-brown-800 ${young ? "text-2xl" : "text-xl"}`}>{opt.text_hy}</span>
              </div>
              {answered && showCorrect && opt.text_en && (
                <span className="text-sm text-brown-400 ml-8 animate-fade-in block mt-1">({opt.text_en})</span>
              )}
            </button>
          );
        })}
      </div>

      {answered && showCorrect && (
        <div className="bg-cream-dark/50 border border-brown-200 rounded-xl p-4 space-y-1 animate-fade-in">
          <p className="text-brown-700 font-medium">{exercise.explanation_hy}</p>
          <p className="text-sm text-brown-400">{exercise.explanation_en}</p>
        </div>
      )}
    </div>
  );
}
