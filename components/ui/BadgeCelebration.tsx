"use client";

import { useState } from "react";

interface CelebrationBadge {
  slug: string;
  name: string;
  emoji: string;
  description: string;
}

export default function BadgeCelebration({ badges }: { badges: CelebrationBadge[] }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || badges.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in">
      <div className="bg-warm-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center animate-in zoom-in-95">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-xl font-bold text-brown-800 mb-1">
          {badges.length === 1 ? "New Badge Earned!" : "New Badges Earned!"}
        </h2>
        <div className="flex flex-col gap-4 my-6">
          {badges.map((badge) => (
            <div key={badge.slug} className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center text-4xl shadow-sm mb-2">
                {badge.emoji}
              </div>
              <p className="font-semibold text-brown-800">{badge.name}</p>
              <p className="text-sm text-brown-500">{badge.description}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
