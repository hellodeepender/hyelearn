"use client";

import { useCallback, useRef, useState } from "react";
import { getWordAudioUrl } from "@/lib/audio";
import { transliterate } from "@/lib/transliterate";

interface Props {
  visual: string;
  primaryText: string;
  secondaryText: string;
  young?: boolean;
}

function SpeakerIcon({ playing }: { playing: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-8 h-8 ${playing ? "animate-pulse" : ""}`}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

export default function LearnCard({ visual, primaryText, secondaryText, young }: Props) {
  const [playing, setPlaying] = useState(false);
  const [hidden, setHidden] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentWordRef = useRef(primaryText);

  if (currentWordRef.current !== primaryText) {
    currentWordRef.current = primaryText;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlaying(false);
    setHidden(false);
  }

  const handlePlay = useCallback(() => {
    if (playing || !primaryText) return;
    const audio = new Audio(getWordAudioUrl(primaryText));
    audioRef.current = audio;
    setPlaying(true);
    audio.addEventListener("ended", () => setPlaying(false));
    audio.addEventListener("error", () => { setPlaying(false); setHidden(true); });
    audio.play().catch(() => { setPlaying(false); setHidden(true); });
  }, [playing, primaryText]);

  if (!primaryText) return null;

  const latin = transliterate(primaryText);
  const hasArmenian = /[\u0530-\u058F]/.test(primaryText);

  return (
    <div className="text-center space-y-3 py-4">
      <div className={young ? "text-8xl" : "text-6xl"}>{visual}</div>
      <p className={`font-bold text-brown-800 ${young ? "text-5xl" : "text-4xl"}`}>
        {primaryText}
      </p>
      {hasArmenian && latin !== primaryText && (
        <p className="text-sm text-gray-400 font-light tracking-wide">{latin}</p>
      )}
      {!hidden && (
        <button
          onClick={handlePlay}
          aria-label="Listen to pronunciation"
          className="inline-flex items-center justify-center text-gold hover:text-gold-dark transition-colors"
        >
          <SpeakerIcon playing={playing} />
        </button>
      )}
      <p className={`text-brown-500 ${young ? "text-xl" : "text-lg"}`}>
        {secondaryText}
      </p>
    </div>
  );
}
