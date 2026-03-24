"use client";

import { useState } from "react";
import type { TrueFalseExercise } from "@/lib/types";
import { lf } from "@/lib/exercise-utils";
import { transliterate } from "@/lib/transliterate";
import AudioButton from "./AudioButton";

interface Props {
  exercise: TrueFalseExercise;
  onAnswer: (correct: boolean, usedHint: boolean) => void;
  young?: boolean;
  locale?: string;
}

export default function TrueFalse({ exercise, onAnswer, young, locale = "hy" }: Props) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const answered = selected !== null;
  const statementText = lf(exercise, "statement", locale) as string;

  function handleSelect(value: boolean) {
    if (answered) return;
    setSelected(value);
    onAnswer(value === exercise.correct_answer, hintShown);
  }

  function btnStyle(value: boolean) {
    const base = young ? "bg-amber-50/30" : "bg-warm-white";
    if (!answered) return `border-brown-200 hover:border-brown-300 ${base}`;
    const isCorrectAnswer = value === exercise.correct_answer;
    const wasSelected = value === selected;
    if (isCorrectAnswer) return "border-green-500 bg-green-50 ring-2 ring-green-200";
    if (wasSelected && !isCorrectAnswer) return "border-red-500 bg-red-50 ring-2 ring-red-200";
    return "border-brown-100 bg-brown-50 opacity-50";
  }

  const radius = young ? "rounded-2xl" : "rounded-xl";

  return (
    <div className="space-y-6">
      {exercise.emoji && (
        <div className="text-center">
          <span className={young ? "text-7xl" : "text-5xl"}>{exercise.emoji}</span>
        </div>
      )}

      <div>
        <p className={`font-semibold text-brown-800 leading-relaxed ${young ? "text-3xl" : "text-2xl"}`}>
          {statementText}
        </p>
        {young && statementText && (
          <p className="text-sm text-brown-400 font-light tracking-wide mt-1">
            {transliterate(statementText, locale)}
          </p>
        )}
        {young ? (
          <>
            <p className="text-sm text-brown-400 mt-1">{exercise.statement_en}</p>
            {statementText && <AudioButton word={statementText} autoPlay />}
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleSelect(true)}
          disabled={answered}
          className={`${young ? "p-6 min-h-[72px]" : "p-5"} ${radius} border-2 text-center transition-all ${btnStyle(true)}`}
        >
          <span className={`block mb-1 ${young ? "text-4xl" : "text-2xl"}`}>{young ? "\uD83D\uDC4D" : "\u2713"}</span>
          <span className={`font-semibold text-brown-800 ${young ? "text-lg" : ""}`}>True</span>
        </button>
        <button
          onClick={() => handleSelect(false)}
          disabled={answered}
          className={`${young ? "p-6 min-h-[72px]" : "p-5"} ${radius} border-2 text-center transition-all ${btnStyle(false)}`}
        >
          <span className={`block mb-1 ${young ? "text-4xl" : "text-2xl"}`}>{young ? "\uD83D\uDC4E" : "\u2717"}</span>
          <span className={`font-semibold text-brown-800 ${young ? "text-lg" : ""}`}>False</span>
        </button>
      </div>

      {answered && (
        <div className={`bg-cream-dark/50 border border-brown-200 ${radius} p-4 space-y-1 animate-fade-in`}>
          <p className="text-brown-700 font-medium">{lf(exercise, "explanation", locale)}</p>
          <p className="text-sm text-brown-400">{exercise.explanation_en}</p>
        </div>
      )}
    </div>
  );
}
