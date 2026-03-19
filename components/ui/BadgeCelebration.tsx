"use client";

import { useState, useEffect } from "react";

interface BadgeInfo {
  slug: string;
  name: string;
  emoji: string;
  description: string;
}

export default function BadgeCelebration({ badges }: { badges: BadgeInfo[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(badges.length > 0);

  useEffect(() => {
    setVisible(badges.length > 0);
    setCurrentIndex(0);
  }, [badges]);

  if (!visible || badges.length === 0) return null;

  const badge = badges[currentIndex];
  const isLast = currentIndex >= badges.length - 1;

  function handleNext() {
    if (isLast) {
      setVisible(false);
    } else {
      setCurrentIndex(i => i + 1);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-warm-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl border border-brown-100"
        style={{ animation: "popIn 0.4s ease" }}>
        <style>{`
          @keyframes popIn { from { transform: scale(0.8); opacity: 0 } to { transform: scale(1); opacity: 1 } }
          @keyframes badgeBounce { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
          @keyframes sparkle { 0%, 100% { opacity: 0.3; transform: scale(0.8) } 50% { opacity: 1; transform: scale(1.2) } }
        `}</style>

        <div className="flex justify-center gap-3 mb-2">
          {["\u2728", "\uD83C\uDF89", "\u2728"].map((e, i) => (
            <span key={i} className="text-2xl" style={{ animation: `sparkle 1.5s ease infinite ${i * 0.3}s` }}>{e}</span>
          ))}
        </div>

        <div className="text-6xl mb-3" style={{ animation: "badgeBounce 0.6s ease" }}>
          {badge.emoji}
        </div>

        <h2 className="text-xl font-bold text-brown-800 mb-1">Badge Unlocked!</h2>
        <p className="text-lg font-semibold text-gold mb-1">{badge.name}</p>
        <p className="text-sm text-brown-500 mb-6">{badge.description}</p>

        {badges.length > 1 && (
          <p className="text-xs text-brown-400 mb-3">{currentIndex + 1} of {badges.length}</p>
        )}

        <button onClick={handleNext}
          className="w-full bg-gold hover:bg-gold-dark text-white py-3 rounded-xl font-semibold text-base transition-colors">
          {isLast ? "Awesome!" : "Next Badge \u2192"}
        </button>
      </div>
    </div>
  );
}
