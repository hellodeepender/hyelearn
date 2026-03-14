"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Props {
  score: number;
  total: number;
  subject: string;
  topic: string;
  grade: number;
  onNewSet: () => void;
  onSave: () => Promise<void>;
  dashboardUrl: string;
}

export default function ScoreSummary({
  score,
  total,
  subject,
  topic,
  grade,
  onNewSet,
  onSave,
  dashboardUrl,
}: Props) {
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const didSave = useRef(false);
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  let message: string;
  if (pct === 100) {
    message = "Perfect score!";
  } else if (pct >= 90) {
    message = "Excellent work!";
  } else if (pct >= 70) {
    message = "Good job!";
  } else if (pct >= 50) {
    message = "Good effort!";
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
      {/* Score circle */}
      <div>
        <div className="inline-flex items-center justify-center w-36 h-36 rounded-full border-4 border-gold bg-gold/10 mb-4">
          <div>
            <p className="text-4xl font-bold text-gold">{score}/{total}</p>
            <p className="text-sm text-brown-400">{pct}%</p>
          </div>
        </div>
        <p className="text-2xl font-bold text-brown-800">{message}</p>
        {saved && <p className="text-sm text-green-600 mt-2">Progress saved</p>}
        {saveError && <p className="text-sm text-red-500 mt-2">Could not save progress</p>}
      </div>

      {/* Session details */}
      <div className="inline-flex gap-3 text-sm text-brown-400">
        <span className="capitalize">{subject}</span>
        <span>&middot;</span>
        <span>{topic}</span>
        <span>&middot;</span>
        <span>Grade {grade}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onNewSet}
          className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Practice Again
        </button>
        <Link
          href={dashboardUrl}
          className="border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-6 py-3 rounded-lg font-medium transition-colors text-center"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
