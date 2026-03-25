"use client";

import Confetti from "@/components/ui/Confetti";
import Mascot from "@/components/ui/Mascot";
import { playSound } from "@/lib/sounds";
import { useEffect } from "react";
import Link from "next/link";

interface Props {
  locale: string;
  score: { correct: number; wrong: number };
  onPlayAgain: () => void;
  onBack: () => void;
}

export default function GameComplete({ locale, score, onPlayAgain, onBack }: Props) {
  const stars = score.wrong === 0 ? 3 : score.wrong <= 2 ? 2 : 1;

  useEffect(() => {
    playSound("complete");
  }, []);

  return (
    <div className="text-center space-y-6 py-8">
      <Confetti show={true} />
      <Mascot pose="celebrating" size={120} locale={locale} />
      <div className="flex justify-center gap-2 text-4xl">
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            className={`transition-all duration-500 ${
              s <= stars ? "opacity-100 scale-100" : "opacity-20 scale-75"
            }`}
          >
            &#11088;
          </span>
        ))}
      </div>
      <div>
        <p className="text-2xl font-bold text-brown-800">Great job!</p>
        <p className="text-brown-500 mt-1">
          {score.correct} objects matched
          {score.wrong > 0
            ? ` with ${score.wrong} mistake${score.wrong > 1 ? "s" : ""}`
            : " perfectly"}
          !
        </p>
      </div>
      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={onPlayAgain}
          className="bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Play Again
        </button>
        <button
          onClick={onBack}
          className="text-sm text-brown-400 hover:text-brown-600"
        >
          Back
        </button>
        <Link
          href="/student"
          className="text-sm text-brown-400 hover:text-brown-600"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
