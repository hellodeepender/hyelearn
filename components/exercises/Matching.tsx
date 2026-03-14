"use client";

import { useState, useMemo } from "react";
import type { MatchingExercise } from "@/lib/types";

interface Props {
  exercises: MatchingExercise[];
  onAnswer: (correct: boolean) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Matching({ exercises, onAnswer }: Props) {
  const leftItems = useMemo(() => shuffle(exercises.map((e, i) => ({ ...e, index: i }))), [exercises]);
  const rightItems = useMemo(() => shuffle(exercises.map((e, i) => ({ ...e, index: i }))), [exercises]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Map<number, number>>(new Map());
  const [results, setResults] = useState<Map<number, boolean> | null>(null);
  const done = results !== null;

  function handleLeftClick(index: number) {
    if (done) return;
    setSelectedLeft(selectedLeft === index ? null : index);
  }

  function handleRightClick(rightIndex: number) {
    if (done || selectedLeft === null) return;
    const leftOriginalIndex = leftItems[selectedLeft].index;
    const rightOriginalIndex = rightItems[rightIndex].index;

    const next = new Map(matches);
    // Remove any existing match for this left item
    next.set(leftOriginalIndex, rightOriginalIndex);
    setMatches(next);
    setSelectedLeft(null);

    // Auto-check when all pairs are matched
    if (next.size === exercises.length) {
      const res = new Map<number, boolean>();
      let allCorrect = true;
      next.forEach((rightIdx, leftIdx) => {
        const isCorrect = leftIdx === rightIdx;
        res.set(leftIdx, isCorrect);
        if (!isCorrect) allCorrect = false;
      });
      setResults(res);
      onAnswer(allCorrect);
    }
  }

  function getLeftStatus(originalIndex: number) {
    if (results) return results.get(originalIndex) ? "correct" : "wrong";
    if (matches.has(originalIndex)) return "matched";
    return "default";
  }

  function getRightStatus(originalIndex: number) {
    if (results) {
      // Check if any left matched to this right
      for (const [left, right] of matches) {
        if (right === originalIndex) return results.get(left) ? "correct" : "wrong";
      }
      return "unmatched";
    }
    // Check if matched
    for (const [, right] of matches) {
      if (right === originalIndex) return "matched";
    }
    return "default";
  }

  const statusStyles = {
    default: "border-brown-200 bg-warm-white hover:border-brown-300",
    selected: "border-gold bg-gold/10 ring-2 ring-gold/30",
    matched: "border-brown-300 bg-brown-50 text-brown-500",
    correct: "border-green-500 bg-green-50 ring-2 ring-green-200",
    wrong: "border-red-500 bg-red-50 ring-2 ring-red-200",
    unmatched: "border-brown-100 bg-brown-50 opacity-50",
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-brown-400 text-center">
        Tap a word on the left, then tap its match on the right
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-2">
          {leftItems.map((item, i) => {
            const status = selectedLeft === i ? "selected" : getLeftStatus(item.index);
            return (
              <button
                key={item.id}
                onClick={() => handleLeftClick(i)}
                disabled={done}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${statusStyles[status]}`}
              >
                <span className="block text-lg font-medium text-brown-800">{item.left_hy}</span>
                <span className="block text-xs text-brown-400">{item.left_en}</span>
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          {rightItems.map((item, i) => {
            const status = getRightStatus(item.index);
            return (
              <button
                key={item.id}
                onClick={() => handleRightClick(i)}
                disabled={done || selectedLeft === null}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${statusStyles[status]}`}
              >
                <span className="block text-lg font-medium text-brown-800">{item.right_hy}</span>
                <span className="block text-xs text-brown-400">{item.right_en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {done && (
        <div className="bg-cream-dark/50 border border-brown-200 rounded-xl p-4 text-center">
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
