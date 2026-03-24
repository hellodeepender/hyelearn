"use client";

import { useState, useMemo } from "react";
import type { MatchingExercise } from "@/lib/types";
import { lf } from "@/lib/exercise-utils";
import { transliterate } from "@/lib/transliterate";
import { playSound } from "@/lib/sounds";

interface Props {
  exercises: MatchingExercise[];
  onAnswer: (correct: boolean, usedHint: boolean) => void;
  young?: boolean;
  locale?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Matching({ exercises, onAnswer, young, locale = "hy" }: Props) {
  const leftItems = useMemo(() => shuffle(exercises.map((e, i) => ({ ...e, index: i }))), [exercises]);
  const rightItems = useMemo(() => shuffle(exercises.map((e, i) => ({ ...e, index: i }))), [exercises]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Map<number, number>>(new Map());
  const [results, setResults] = useState<Map<number, boolean> | null>(null);
  const done = results !== null;

  function handleLeftClick(index: number) {
    if (done) return;
    const originalIndex = leftItems[index].index;
    if (selectedLeft === index) { setSelectedLeft(null); return; }
    if (matches.has(originalIndex)) {
      setMatches((prev) => { const next = new Map(prev); next.delete(originalIndex); return next; });
    }
    setSelectedLeft(index);
  }

  function handleRightClick(rightIndex: number) {
    if (done || selectedLeft === null) return;
    const leftOriginalIndex = leftItems[selectedLeft].index;
    const rightOriginalIndex = rightItems[rightIndex].index;
    const next = new Map(matches);
    for (const [leftIdx, rightIdx] of next) {
      if (rightIdx === rightOriginalIndex && leftIdx !== leftOriginalIndex) { next.delete(leftIdx); break; }
    }
    next.set(leftOriginalIndex, rightOriginalIndex);
    setMatches(next);
    setSelectedLeft(null);
  }

  function handleCheck() {
    const res = new Map<number, boolean>();
    let allCorrect = true;
    matches.forEach((rightIdx, leftIdx) => {
      const isCorrect = leftIdx === rightIdx;
      res.set(leftIdx, isCorrect);
      if (!isCorrect) allCorrect = false;
    });
    setResults(res);
    playSound(allCorrect ? "complete" : "wrong");
    onAnswer(allCorrect, false);
  }

  function getLeftStatus(originalIndex: number) {
    if (results) return results.get(originalIndex) ? "correct" : "wrong";
    if (matches.has(originalIndex)) return "matched";
    return "default";
  }

  function getRightStatus(originalIndex: number) {
    if (results) {
      for (const [left, right] of matches) {
        if (right === originalIndex) return results.get(left) ? "correct" : "wrong";
      }
      return "unmatched";
    }
    for (const [, right] of matches) {
      if (right === originalIndex) return "matched";
    }
    return "default";
  }

  const statusStyles = {
    default: young ? "border-brown-200 bg-amber-50/30 hover:border-brown-300" : "border-brown-200 bg-warm-white hover:border-brown-300",
    selected: "border-gold bg-gold/10 ring-2 ring-gold/30",
    matched: "border-gold bg-gold/10 text-brown-600",
    correct: "border-green-500 bg-green-50 ring-2 ring-green-200",
    wrong: "border-red-500 bg-red-50 ring-2 ring-red-200",
    unmatched: "border-brown-100 bg-brown-50 opacity-50",
  };

  const radius = young ? "rounded-2xl" : "rounded-xl";

  return (
    <div className="space-y-4">
      <p className="text-sm text-brown-400 text-center">
        Tap a word on the left, then tap its match on the right
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {leftItems.map((item, i) => {
            const status = selectedLeft === i ? "selected" : getLeftStatus(item.index);
            const text = lf(item, "left", locale) as string;
            return (
              <button
                key={`left-${item.index}`}
                onClick={() => handleLeftClick(i)}
                disabled={done}
                className={`w-full p-3 ${radius} border-2 text-left transition-all ${statusStyles[status]}`}
              >
                {young && item.emoji_left && <span className="text-xl mr-2">{item.emoji_left}</span>}
                <span className={`font-medium text-brown-800 ${young ? "text-xl" : "text-lg"}`}>{text}</span>
                {young && text && (
                  <span className="block text-xs text-brown-400 font-light tracking-wide">{transliterate(text, locale)}</span>
                )}
                {done && item.left_en && (
                  <span className="block text-xs text-brown-400 animate-fade-in">{item.left_en}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {rightItems.map((item, i) => {
            const status = getRightStatus(item.index);
            const text = lf(item, "right", locale) as string;
            return (
              <button
                key={`right-${item.index}`}
                onClick={() => handleRightClick(i)}
                disabled={done || selectedLeft === null}
                className={`w-full p-3 ${radius} border-2 text-left transition-all ${statusStyles[status]}`}
              >
                {young && item.emoji_right && <span className="text-xl mr-2">{item.emoji_right}</span>}
                <span className={`font-medium text-brown-800 ${young ? "text-xl" : "text-lg"}`}>{text}</span>
                {young && text && (
                  <span className="block text-xs text-brown-400 font-light tracking-wide">{transliterate(text, locale)}</span>
                )}
                {done && item.right_en && (
                  <span className="block text-xs text-brown-400 animate-fade-in">{item.right_en}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {!done && matches.size === exercises.length && (
        <div className="text-center">
          <button onClick={handleCheck}
            className="bg-gold hover:bg-gold-dark text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Check answers
          </button>
        </div>
      )}

      {done && (
        <div className={`bg-cream-dark/50 border border-brown-200 ${radius} p-4 text-center animate-fade-in`}>
          <p className="text-brown-700 font-medium">
            {Array.from(results!.values()).every(Boolean)
              ? "All matched correctly!"
              : "Some matches were incorrect. Review the highlights above."}
          </p>
        </div>
      )}
    </div>
  );
}
