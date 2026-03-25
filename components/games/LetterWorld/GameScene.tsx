"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GameScene as GameSceneType, GameObject } from "@/lib/game-scenes";
import { getObjectSVG } from "./ObjectIllustrations";
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
          {/* Wall */}
          <rect x="0" y="0" width="800" height="400" fill="#FFF8F0" />

          {/* Wall texture - subtle horizontal lines */}
          <line x1="0" y1="100" x2="800" y2="100" stroke="#F5EDE0" strokeWidth="0.5" />
          <line x1="0" y1="200" x2="800" y2="200" stroke="#F5EDE0" strokeWidth="0.5" />
          <line x1="0" y1="300" x2="800" y2="300" stroke="#F5EDE0" strokeWidth="0.5" />

          {/* Floor */}
          <rect x="0" y="400" width="800" height="200" fill="#E8D5B8" />
          {/* Floor boards */}
          <line x1="0" y1="440" x2="800" y2="440" stroke="#D4C4A8" strokeWidth="1" />
          <line x1="0" y1="480" x2="800" y2="480" stroke="#D4C4A8" strokeWidth="1" />
          <line x1="0" y1="520" x2="800" y2="520" stroke="#D4C4A8" strokeWidth="1" />
          <line x1="0" y1="560" x2="800" y2="560" stroke="#D4C4A8" strokeWidth="1" />
          {/* Floor board vertical joints */}
          <line x1="160" y1="400" x2="160" y2="440" stroke="#D4C4A8" strokeWidth="0.5" />
          <line x1="400" y1="400" x2="400" y2="440" stroke="#D4C4A8" strokeWidth="0.5" />
          <line x1="640" y1="400" x2="640" y2="440" stroke="#D4C4A8" strokeWidth="0.5" />
          <line x1="80" y1="440" x2="80" y2="480" stroke="#D4C4A8" strokeWidth="0.5" />
          <line x1="320" y1="440" x2="320" y2="480" stroke="#D4C4A8" strokeWidth="0.5" />
          <line x1="560" y1="440" x2="560" y2="480" stroke="#D4C4A8" strokeWidth="0.5" />
          <line x1="240" y1="480" x2="240" y2="520" stroke="#D4C4A8" strokeWidth="0.5" />
          <line x1="480" y1="480" x2="480" y2="520" stroke="#D4C4A8" strokeWidth="0.5" />
          <line x1="720" y1="480" x2="720" y2="520" stroke="#D4C4A8" strokeWidth="0.5" />

          {/* Baseboard */}
          <rect x="0" y="395" width="800" height="10" fill="#C4A882" />

          {/* Window */}
          <rect x="300" y="60" width="200" height="160" rx="4" fill="#ADE0F5" stroke="#A08060" strokeWidth="5" />
          {/* Window crossbar vertical */}
          <line x1="400" y1="60" x2="400" y2="220" stroke="#A08060" strokeWidth="4" />
          {/* Window crossbar horizontal */}
          <line x1="300" y1="140" x2="500" y2="140" stroke="#A08060" strokeWidth="4" />
          {/* Window sky gradient */}
          <rect x="303" y="63" width="95" height="74" fill="#B8E6FA" rx="2" />
          <rect x="403" y="63" width="95" height="74" fill="#B8E6FA" rx="2" />
          <rect x="303" y="143" width="95" height="74" fill="#C8EDFC" rx="2" />
          <rect x="403" y="143" width="95" height="74" fill="#C8EDFC" rx="2" />
          {/* Cloud through window */}
          <ellipse cx="360" cy="100" rx="18" ry="8" fill="white" opacity="0.7" />
          <ellipse cx="350" cy="96" rx="12" ry="7" fill="white" opacity="0.7" />
          {/* Window sill */}
          <rect x="290" y="218" width="220" height="12" rx="2" fill="#A08060" />

          {/* Left curtain */}
          <path d="M298,55 Q285,140 292,230 L298,230 Q305,140 298,55Z" fill="#D4738C" opacity="0.7" />
          <path d="M298,55 Q290,90 294,130 L298,130 Q302,90 298,55Z" fill="#E08BA2" opacity="0.5" />
          {/* Right curtain */}
          <path d="M502,55 Q515,140 508,230 L502,230 Q495,140 502,55Z" fill="#D4738C" opacity="0.7" />
          <path d="M502,55 Q510,90 506,130 L502,130 Q498,90 502,55Z" fill="#E08BA2" opacity="0.5" />
          {/* Curtain rod */}
          <line x1="280" y1="55" x2="520" y2="55" stroke="#8B6F47" strokeWidth="4" strokeLinecap="round" />
          <circle cx="280" cy="55" r="5" fill="#8B6F47" />
          <circle cx="520" cy="55" r="5" fill="#8B6F47" />

          {/* Bookshelf - left wall */}
          <rect x="40" y="120" width="120" height="180" fill="#A08060" stroke="#8B6F47" strokeWidth="2" />
          {/* Shelves */}
          <rect x="40" y="120" width="120" height="4" fill="#8B6F47" />
          <rect x="40" y="176" width="120" height="4" fill="#8B6F47" />
          <rect x="40" y="236" width="120" height="4" fill="#8B6F47" />
          <rect x="40" y="296" width="120" height="4" fill="#8B6F47" />
          {/* Books on top shelf */}
          <rect x="50" y="126" width="10" height="48" fill="#E24B4A" rx="1" />
          <rect x="62" y="130" width="8" height="44" fill="#378ADD" rx="1" />
          <rect x="72" y="128" width="11" height="46" fill="#4CAF50" rx="1" />
          <rect x="85" y="126" width="9" height="48" fill="#FFD93D" rx="1" />
          <rect x="96" y="132" width="10" height="42" fill="#9C27B0" rx="1" />
          <rect x="108" y="127" width="12" height="47" fill="#FF9800" rx="1" />
          <rect x="122" y="130" width="9" height="44" fill="#607D8B" rx="1" />
          {/* Books on middle shelf */}
          <rect x="48" y="182" width="12" height="52" fill="#FF5722" rx="1" />
          <rect x="62" y="186" width="9" height="48" fill="#3F51B5" rx="1" />
          <rect x="73" y="184" width="10" height="50" fill="#009688" rx="1" />
          <rect x="86" y="182" width="11" height="52" fill="#795548" rx="1" />
          <rect x="100" y="188" width="8" height="46" fill="#E91E63" rx="1" />
          <rect x="112" y="183" width="14" height="51" fill="#CDDC39" rx="1" />
          {/* Books on bottom shelf */}
          <rect x="50" y="242" width="14" height="52" fill="#673AB7" rx="1" />
          <rect x="66" y="246" width="10" height="48" fill="#00BCD4" rx="1" />
          <rect x="78" y="244" width="12" height="50" fill="#8BC34A" rx="1" />
          <rect x="94" y="242" width="9" height="52" fill="#FF9800" rx="1" />
          <rect x="106" y="248" width="11" height="46" fill="#F44336" rx="1" />

          {/* Rug */}
          <ellipse cx="400" cy="490" rx="200" ry="60" fill="#C4564A" opacity="0.6" />
          <ellipse cx="400" cy="490" rx="170" ry="48" fill="#D4738C" opacity="0.4" />
          <ellipse cx="400" cy="490" rx="140" ry="36" fill="#E89CA8" opacity="0.3" />
          {/* Rug border pattern */}
          <ellipse cx="400" cy="490" rx="195" ry="56" fill="none" stroke="#A0403A" strokeWidth="1.5" strokeDasharray="8,4" opacity="0.4" />

          {/* Picture frame 1 - left of window */}
          <rect x="180" y="100" width="70" height="55" rx="3" fill="#8B6F47" />
          <rect x="185" y="105" width="60" height="45" rx="2" fill="#FFF8E1" />
          {/* Simple mountain scene inside frame */}
          <polygon points="195,148 215,118 235,148" fill="#4CAF50" opacity="0.5" />
          <polygon points="210,148 230,125 245,148" fill="#388E3C" opacity="0.5" />
          <circle cx="235" cy="115" r="5" fill="#FFD93D" opacity="0.6" />

          {/* Picture frame 2 - right of window */}
          <rect x="550" y="90" width="60" height="75" rx="3" fill="#8B6F47" />
          <rect x="555" y="95" width="50" height="65" rx="2" fill="#FFF8E1" />
          {/* Simple flower inside frame */}
          <line x1="580" y1="155" x2="580" y2="125" stroke="#4CAF50" strokeWidth="2" />
          <circle cx="580" cy="120" r="8" fill="#E24B4A" opacity="0.5" />
          <circle cx="580" cy="120" r="4" fill="#FFD93D" opacity="0.6" />

          {/* Door - right wall */}
          <rect x="660" y="140" width="100" height="258" rx="3" fill="#B08050" stroke="#8B6F47" strokeWidth="3" />
          {/* Door panels */}
          <rect x="672" y="155" width="76" height="80" rx="2" fill="#A07040" />
          <rect x="672" y="250" width="76" height="100" rx="2" fill="#A07040" />
          {/* Door handle */}
          <circle cx="730" cy="280" r="5" fill="#D4A843" stroke="#C49A30" strokeWidth="1" />

          {/* Potted plant on window sill */}
          <rect x="380" y="200" width="24" height="18" rx="3" fill="#C4564A" />
          <ellipse cx="392" cy="200" rx="10" ry="3" fill="#4CAF50" />
          <path d="M388,198 Q385,180 392,170 Q399,180 396,198" fill="#4CAF50" />
          <path d="M385,200 Q378,188 382,178" fill="none" stroke="#388E3C" strokeWidth="2" strokeLinecap="round" />
          <path d="M399,200 Q406,188 402,178" fill="none" stroke="#388E3C" strokeWidth="2" strokeLinecap="round" />
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
