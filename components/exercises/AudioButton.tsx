"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getWordAudioUrl } from "@/lib/audio";

interface Props {
  word: string;
  autoPlay?: boolean;
}

// Track whether user has interacted (Safari requires gesture before autoplay)
let userHasInteracted = false;
if (typeof window !== "undefined") {
  const markInteracted = () => { userHasInteracted = true; };
  window.addEventListener("pointerdown", markInteracted, { once: true, capture: true });
  window.addEventListener("keydown", markInteracted, { once: true, capture: true });
}

export default function AudioButton({ word, autoPlay }: Props) {
  const [playing, setPlaying] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordRef = useRef(word);

  // Reset on word change
  if (wordRef.current !== word) {
    wordRef.current = word;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlaying(false);
    setHidden(false);
    setHasAutoPlayed(false);
  }

  const play = useCallback(() => {
    if (playing || !word) return;
    const audio = new Audio(getWordAudioUrl(word));
    audioRef.current = audio;
    setPlaying(true);
    audio.addEventListener("ended", () => setPlaying(false));
    audio.addEventListener("error", () => { setPlaying(false); setHidden(true); });
    // Safari blocks autoplay without user gesture — catch and show button instead
    audio.play().catch(() => { setPlaying(false); });
  }, [playing, word]);

  // Auto-play after 500ms — only if user has previously interacted (Safari requirement)
  useEffect(() => {
    if (!autoPlay || hasAutoPlayed || !word || !userHasInteracted) return;
    const timer = setTimeout(() => {
      setHasAutoPlayed(true);
      play();
    }, 500);
    return () => clearTimeout(timer);
  }, [autoPlay, hasAutoPlayed, word, play]);

  if (hidden || !word) return null;

  return (
    <div className="flex justify-center py-2">
      <button
        onClick={play}
        aria-label="Listen to pronunciation"
        className={`
          inline-flex items-center gap-2.5 px-6 py-3 min-w-[140px] min-h-[56px]
          rounded-full border-2 font-medium text-base
          transition-all duration-150 active:scale-95
          ${playing
            ? "border-gold bg-gold text-white animate-pulse"
            : "border-gold/40 bg-gold/5 text-gold hover:bg-gold hover:text-white hover:border-gold"
          }
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          className="w-6 h-6 shrink-0">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
        <span>{playing ? "Playing..." : "Listen"}</span>
      </button>
    </div>
  );
}
