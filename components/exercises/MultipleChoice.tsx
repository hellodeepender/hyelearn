"use client";

import { useState } from "react";
import type { MultipleChoiceExercise } from "@/lib/types";

interface Props {
  exercise: MultipleChoiceExercise;
  onAnswer: (correct: boolean) => void;
}

export default function MultipleChoice({ exercise, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;

  function handleSelect(optionId: string) {
    if (answered) return;
    setSelected(optionId);
    const opt = exercise.options.find((o) => o.id === optionId);
    onAnswer(opt?.correct ?? false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-2xl font-semibold text-brown-800 leading-relaxed">
          {exercise.question_hy}
        </p>
        <p className="text-sm text-brown-400 mt-1">{exercise.question_en}</p>
      </div>

      <div className="space-y-3">
        {exercise.options.map((opt) => {
          let style = "border-brown-200 hover:border-brown-300 bg-warm-white";
          if (answered) {
            if (opt.correct) {
              style = "border-green-500 bg-green-50 ring-2 ring-green-200";
            } else if (opt.id === selected && !opt.correct) {
              style = "border-red-500 bg-red-50 ring-2 ring-red-200";
            } else {
              style = "border-brown-100 bg-brown-50 opacity-50";
            }
          } else if (opt.id === selected) {
            style = "border-gold bg-gold/5";
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={answered}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${style}`}
            >
              <span className="font-medium text-lg text-brown-800">{opt.text_hy}</span>
              <span className="text-sm text-brown-400 ml-2">({opt.text_en})</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="bg-cream-dark/50 border border-brown-200 rounded-xl p-4 space-y-1">
          <p className="text-brown-700 font-medium">{exercise.explanation_hy}</p>
          <p className="text-sm text-brown-400">{exercise.explanation_en}</p>
        </div>
      )}
    </div>
  );
}
