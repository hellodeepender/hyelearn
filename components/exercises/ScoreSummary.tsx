"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  score: number;
  total: number;
  onNewSet: () => void;
  onSave: () => Promise<void>;
}

export default function ScoreSummary({ score, total, onNewSet, onSave }: Props) {
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const didSave = useRef(false);
  const pct = Math.round((score / total) * 100);

  let message: string;
  if (pct === 100) {
    message = "Perfect score!";
  } else if (pct >= 90) {
    message = "Excellent work!";
  } else if (pct >= 70) {
    message = "Good job!";
  } else {
    message = "Keep practicing!";
  }

  // Auto-save on mount
  useEffect(() => {
    if (didSave.current) return;
    didSave.current = true;
    onSave()
      .then(() => setSaved(true))
      .catch(() => setSaveError(true));
  }, [onSave]);

  return (
    <div className="text-center space-y-8">
      <div>
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-gold bg-gold/10 mb-4">
          <div>
            <p className="text-3xl font-bold text-gold">{score}/{total}</p>
            <p className="text-sm text-brown-400">{pct}%</p>
          </div>
        </div>
        <p className="text-2xl font-bold text-brown-800">{message}</p>
        {saved && <p className="text-sm text-green-600 mt-1">Progress saved</p>}
        {saveError && <p className="text-sm text-red-500 mt-1">Could not save progress</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onNewSet}
          className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          New Set
        </button>
      </div>
    </div>
  );
}
