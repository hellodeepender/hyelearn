"use client";

import { useState } from "react";
import { GAME_SCENES } from "@/lib/game-scenes";
import GameScene from "./GameScene";
import GameComplete from "./GameComplete";
import Mascot from "@/components/ui/Mascot";

interface Props {
  locale: string;
}

export default function LetterWorldGame({ locale }: Props) {
  const scene = GAME_SCENES[locale];
  const [phase, setPhase] = useState<"intro" | "playing" | "complete">("intro");
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  if (!scene) {
    return (
      <p className="text-center text-brown-500 py-12">
        No game available for this language yet.
      </p>
    );
  }

  if (phase === "intro") {
    return (
      <div className="text-center space-y-6 py-8">
        <Mascot pose="happy" size={120} locale={locale} />
        <h1 className="text-3xl font-bold text-brown-800">{scene.titleEn}</h1>
        <p className="text-brown-500 text-lg max-w-md mx-auto">
          Tap objects in the room, then match them to their starting letter!
        </p>
        <button
          onClick={() => setPhase("playing")}
          className="bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all active:scale-95"
        >
          Let&apos;s Play!
        </button>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <GameComplete
        locale={locale}
        score={score}
        onPlayAgain={() => {
          setScore({ correct: 0, wrong: 0 });
          setPhase("playing");
        }}
        onBack={() => setPhase("intro")}
      />
    );
  }

  return (
    <GameScene
      scene={scene}
      locale={locale}
      onComplete={(correct, wrong) => {
        setScore({ correct, wrong });
        setPhase("complete");
      }}
    />
  );
}
