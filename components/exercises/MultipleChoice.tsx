"use client";

import { useState } from "react";
import type { MultipleChoiceExercise } from "@/lib/types";

interface Props {
  exercise: MultipleChoiceExercise;
  onAnswer: (correct: boolean, usedHint: boolean) => void;
  young?: boolean;
}

export default function MultipleChoice({ exercise, onAnswer, young }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const answered = selected !== null;

  function handleSelect(optionId: string) {
    if (answered) return;
    setSelected(optionId);
    const opt = exercise.options.find((o) => o.id === optionId);
    onAnswer(opt?.correct ?? false, hintShown);
  }

  return (
    <div className="space-y-6">
      {/* Emoji visual (young learners) */}
      {exercise.emoji && (
        <div className="text-center">
          <span className={young ? "text-7xl" : "text-5xl"}>{exercise.emoji}</span>
        </div>
      )}

      {/* Question */}
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

      {/* Options */}
      <div className="space-y-3">
        {exercise.options.map((opt) => {
          let style = young
            ? "border-brown-200 hover:border-brown-300 bg-amber-50/30"
            : "border-brown-200 hover:border-brown-300 bg-warm-white";
          if (answered) {
            if (opt.correct) {
              style = "border-green-500 bg-green-50 ring-2 ring-green-200";
            } else if (opt.id === selected && !opt.correct) {
              style = "border-red-500 bg-red-50 ring-2 ring-red-200";
            } else {
              style = "border-brown-100 bg-brown-50 opacity-50";
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={answered}
              className={`w-full text-left p-4 ${young ? "rounded-2xl min-h-[56px]" : "rounded-xl"} border-2 transition-all ${style}`}
            >
              <span className={`font-medium text-brown-800 ${young ? "text-xl" : "text-lg"}`}>{opt.text_hy}</span>
              {answered && (
                <span className="text-sm text-brown-400 ml-2 animate-fade-in block mt-1">({opt.text_en})</span>
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
