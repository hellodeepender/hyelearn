"use client";

import { useState, useRef } from "react";

export default function AudioPlayButton({ url, size = "md" }: { url?: string; size?: "sm" | "md" }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!url) return null;

  function handlePlay() {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setPlaying(true);
    audio.play();
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
  }

  const sizeClass = size === "sm"
    ? "w-7 h-7 text-brown-400 hover:text-brown-600"
    : "w-9 h-9 text-brown-400 hover:text-brown-600";

  return (
    <button
      onClick={handlePlay}
      aria-label={playing ? "Stop audio" : "Play audio"}
      className={`${sizeClass} rounded-full bg-brown-50 hover:bg-brown-100 flex items-center justify-center transition-colors shrink-0`}
    >
      {playing ? (
        <svg width={size === "sm" ? 12 : 16} height={size === "sm" ? 12 : 16} viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg width={size === "sm" ? 12 : 16} height={size === "sm" ? 12 : 16} viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}
