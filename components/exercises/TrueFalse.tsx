"use client";

import { useState } from "react";
import type { TrueFalseExercise } from "@/lib/types";

interface Props {
  exercise: TrueFalseExercise;
  onAnswer: (correct: boolean, usedHint: boolean) => void;
}

export default function TrueFalse({ exercise, onAnswer }: Props) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const answered = selected !== null;

  function handleSelect(value: boolean) {
    if (answered) return;
    setSelected(value);
    onAnswer(value === exercise.correct_answer, hintShown);
  }

  function btnStyle(value: boolean) {
    if (!answered) return "border-brown-200 hover:border-brown-300 bg-warm-white";
    const isCorrectAnswer = value === exercise.correct_answer;
    const wasSelected = value === selected;
    if (isCorrectAnswer) return "border-green-500 bg-green-50 ring-2 ring-green-200";
    if (wasSelected && !isCorrectAnswer) return "border-red-500 bg-red-50 ring-2 ring-red-200";
    return "border-brown-100 bg-brown-50 opacity-50";
  }

  return (
    <div className="space-y-6">
      {/* Statement — Armenian only, English revealed after answering */}
      <div>
        <p className="text-2xl font-semibold text-brown-800 leading-relaxed">
          {exercise.statement_hy}
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
            {exercise.statement_en}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleSelect(true)}
          disabled={answered}
          className={`p-5 rounded-xl border-2 text-center transition-all ${btnStyle(true)}`}
        >
          <span className="block text-2xl mb-1">✓</span>
          <span className="font-semibold text-brown-800">True</span>
        </button>
        <button
          onClick={() => handleSelect(false)}
          disabled={answered}
          className={`p-5 rounded-xl border-2 text-center transition-all ${btnStyle(false)}`}
        >
          <span className="block text-2xl mb-1">✗</span>
          <span className="font-semibold text-brown-800">False</span>
        </button>
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
