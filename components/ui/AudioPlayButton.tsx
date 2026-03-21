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

  const isSm = size === "sm";
  const iconSize = isSm ? 20 : 24;

  return (
    <button
      onClick={handlePlay}
      aria-label={playing ? "Stop audio" : "Play audio"}
      className={`${isSm ? "w-9 h-9 min-w-[36px] min-h-[36px]" : "w-11 h-11 min-w-[44px] min-h-[44px]"} rounded-full border-2 ${
        playing
          ? "bg-gold/10 border-gold/30 text-gold"
          : "bg-brown-50 border-brown-200 text-brown-500 hover:bg-brown-100 hover:border-brown-300 hover:text-brown-700"
      } flex items-center justify-center transition-colors shrink-0`}
    >
      {playing ? (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}
