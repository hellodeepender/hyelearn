"use client";

import { useState } from "react";

interface Props {
  score: number;
  total: number;
  onNewSet: () => void;
  onSave: () => Promise<void>;
}

export default function ScoreSummary({ score, total, onNewSet, onSave }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const pct = Math.round((score / total) * 100);

  let message: string;
  let messageEn: string;
  if (pct >= 90) {
    message = "Շատ լdelays!";
    messageEn = "Excellent work!";
  } else if (pct >= 70) {
    message = "Լdelays!";
    messageEn = "Good job!";
  } else {
    message = "Շdelays!";
    messageEn = "Keep practicing!";
  }

  async function handleSave() {
    setSaving(true);
    await onSave();
    setSaving(false);
    setSaved(true);
  }

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
        <p className="text-brown-500">{messageEn}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {!saved ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {saving ? "Saving..." : "Save Results"}
          </button>
        ) : (
          <span className="text-green-600 font-medium py-3">Results saved!</span>
        )}
        <button
          onClick={onNewSet}
          className="border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          New Set
        </button>
      </div>
    </div>
  );
}
