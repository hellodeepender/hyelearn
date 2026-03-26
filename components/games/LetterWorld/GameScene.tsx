"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GameScene as GameSceneType, GameObject } from "@/lib/game-scenes";
import { getObjectSVG } from "./ObjectIllustrations";
import { getRoomBackground } from "./RoomBackgrounds";
import { playSound } from "@/lib/sounds";
import { getWordAudioUrl } from "@/lib/audio";
import Mascot from "@/components/ui/Mascot";

interface Props {
  scene: GameSceneType;
  locale: string;
  onComplete: (correct: number, wrong: number) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GameScene({ scene, locale, onComplete }: Props) {
  const [selectedObject, setSelectedObject] = useState<GameObject | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongLetter, setWrongLetter] = useState<string | null>(null);
  const [correctLetter, setCorrectLetter] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [shuffledLetters] = useState(() => shuffle(scene.objects.map((o) => o.letter)));
  const [speechText, setSpeechText] = useState<string>("Tap an object to begin!");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const remaining = scene.objects.length - matchedIds.size;

  useEffect(() => {
    if (remaining === 0 && matchedIds.size > 0) {
      const timer = setTimeout(() => {
        onComplete(score.correct, score.wrong);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [remaining, matchedIds.size, score, onComplete]);

  const handleObjectTap = useCallback((obj: GameObject) => {
    if (matchedIds.has(obj.id)) return;
    setSelectedObject(obj);
    setWrongLetter(null);
    setCorrectLetter(null);
    setSpeechText(`This is "${obj.wordEn}" \u2014 ${obj.word}. Find the letter ${obj.letter}!`);
    playSound("tap");

    // Play word audio
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(getWordAudioUrl(obj.word, locale));
      audio.volume = 0.6;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } catch {
      // audio not critical
    }
  }, [matchedIds, locale]);

  const handleLetterTap = useCallback((letter: string) => {
    if (!selectedObject) {
      setSpeechText("Tap an object first, then pick its letter!");
      return;
    }
    if (matchedIds.has(selectedObject.id)) return;

    if (letter === selectedObject.letter) {
      playSound("correct");
      setCorrectLetter(letter);
      setWrongLetter(null);
      setMatchedIds((prev) => new Set([...prev, selectedObject.id]));
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      const newRemaining = scene.objects.length - matchedIds.size - 1;
      if (newRemaining === 0) {
        setSpeechText("Amazing! You matched them all!");
      } else {
        setSpeechText(`Great job! "${selectedObject.wordEn}" starts with ${letter}!`);
      }
      setTimeout(() => {
        setSelectedObject(null);
        setCorrectLetter(null);
      }, 800);
    } else {
      playSound("wrong");
      setWrongLetter(letter);
      setScore((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
      setSpeechText(`Not quite \u2014 try again! Find the letter ${selectedObject.letter}.`);
      setTimeout(() => setWrongLetter(null), 500);
    }
  }, [selectedObject, matchedIds, scene.objects.length]);

  const progress = matchedIds.size / scene.objects.length;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brown-800">{scene.titleEn}</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-brown-500">
            {matchedIds.size}/{scene.objects.length}
          </span>
          <div className="w-24 h-2 bg-brown-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mascot speech bubble */}
      <div className="flex items-start gap-3 bg-warm-white border border-brown-100 rounded-2xl p-3">
        <Mascot
          pose={correctLetter ? "celebrating" : selectedObject ? "thinking" : "happy"}
          size={56}
          locale={locale}
        />
        <p className="text-sm text-brown-700 pt-2 flex-1">{speechText}</p>
      </div>

      {/* Room SVG */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-brown-200 shadow-md bg-[#FFF8F0]">
        <svg viewBox="0 0 800 600" className="w-full h-auto" role="img" aria-label="Game room">
          {getRoomBackground(scene.id)}
        </svg>

        {/* Object hotspots overlaid on the room */}
        {scene.objects.map((obj) => {
          const isMatched = matchedIds.has(obj.id);
          const isSelected = selectedObject?.id === obj.id;

          return (
            <button
              key={obj.id}
              onClick={() => !isMatched && handleObjectTap(obj)}
              disabled={isMatched}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isMatched
                  ? "opacity-40 scale-90 pointer-events-none"
                  : isSelected
                    ? "scale-110 z-10"
                    : "hover:scale-105 cursor-pointer"
              }`}
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
              }}
              aria-label={`${obj.wordEn} - ${obj.word}`}
            >
              <div className={`relative ${isSelected ? "animate-pulse" : ""}`}>
                <svg
                  width="64"
                  height="64"
                  viewBox="-30 -30 60 60"
                  className={`drop-shadow-md ${isMatched ? "grayscale" : ""}`}
                >
                  {getObjectSVG(obj.illustration)}
                </svg>
                {isSelected && !isMatched && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-brown-800 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                    {obj.word}
                  </div>
                )}
                {isMatched && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">&#10003;</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Letter bar */}
      <div className="bg-warm-white border border-brown-100 rounded-2xl p-4">
        <p className="text-xs text-brown-400 mb-2 text-center">
          {selectedObject ? `Find the letter for "${selectedObject.wordEn}"` : "Select an object above first"}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {shuffledLetters.map((letter) => {
            const isUsed = matchedIds.size > 0 && scene.objects.some(
              (o) => o.letter === letter && matchedIds.has(o.id)
            );
            const isWrong = wrongLetter === letter;
            const isCorrect = correctLetter === letter;

            return (
              <button
                key={letter}
                onClick={() => handleLetterTap(letter)}
                disabled={isUsed || !selectedObject}
                className={`w-12 h-12 rounded-xl text-xl font-bold transition-all duration-200 ${
                  isUsed
                    ? "bg-brown-100 text-brown-300 cursor-not-allowed opacity-40"
                    : isCorrect
                      ? "bg-green-400 text-white scale-110 ring-2 ring-green-300"
                      : isWrong
                        ? "bg-red-400 text-white animate-shake"
                        : selectedObject
                          ? "bg-gold/20 text-brown-800 hover:bg-gold/40 hover:scale-105 active:scale-95 cursor-pointer"
                          : "bg-brown-50 text-brown-400 cursor-not-allowed"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
