"use client";

import { useState } from "react";
import { GAME_SCENES, type GameScene as GameSceneType } from "@/lib/game-scenes";
import GameScene from "./GameScene";
import GameComplete from "./GameComplete";
import Mascot from "@/components/ui/Mascot";

interface Props {
  locale: string;
}

export default function LetterWorldGame({ locale }: Props) {
  const scenes = GAME_SCENES[locale];
  const [phase, setPhase] = useState<"intro" | "picking" | "playing" | "complete">("intro");
  const [selectedScene, setSelectedScene] = useState<GameSceneType | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  if (!scenes || scenes.length === 0) {
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
        <h1 className="text-3xl font-bold text-brown-800">Letter World</h1>
        <p className="text-brown-500 text-lg max-w-md mx-auto">
          Tap objects in a scene, then match them to their starting letter!
        </p>
        <button
          onClick={() => setPhase("picking")}
          className="bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all active:scale-95"
        >
          Let&apos;s Play!
        </button>
      </div>
    );
  }

  if (phase === "picking") {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-2">
          <Mascot pose="happy" size={80} locale={locale} />
          <h2 className="text-2xl font-bold text-brown-800">Pick a Scene</h2>
          <p className="text-brown-500">Choose where you want to explore!</p>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => {
                setSelectedScene(scene);
                setScore({ correct: 0, wrong: 0 });
                setPhase("playing");
              }}
              className="flex flex-col items-center gap-2 p-5 bg-warm-white border-2 border-brown-100 rounded-2xl hover:border-gold hover:shadow-md transition-all active:scale-95"
            >
              <span className="text-4xl">{scene.previewEmoji}</span>
              <span className="text-base font-semibold text-brown-800">
                {scene.titleEn}
              </span>
              <span className="text-xs text-brown-400">
                {scene.objects.length} objects
              </span>
            </button>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={() => setPhase("intro")}
            className="text-sm text-brown-400 hover:text-brown-600"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (phase === "complete" && selectedScene) {
    return (
      <GameComplete
        locale={locale}
        score={score}
        onPlayAgain={() => {
          setScore({ correct: 0, wrong: 0 });
          setPhase("playing");
        }}
        onPickScene={() => {
          setSelectedScene(null);
          setScore({ correct: 0, wrong: 0 });
          setPhase("picking");
        }}
        onBack={() => setPhase("intro")}
      />
    );
  }

  if (!selectedScene) {
    setPhase("picking");
    return null;
  }

  return (
    <GameScene
      scene={selectedScene}
      locale={locale}
      onComplete={(correct, wrong) => {
        setScore({ correct, wrong });
        setPhase("complete");
      }}
    />
  );
}
