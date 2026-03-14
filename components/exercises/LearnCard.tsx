"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getWordAudioUrl } from "@/lib/audio";

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
  const [hasAudio, setHasAudio] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = getWordAudioUrl(primaryText);

  // Probe whether the audio file exists
  useEffect(() => {
    if (!primaryText) { setHasAudio(false); return; }

    const audio = new Audio(audioUrl);
    audio.preload = "none";

    const handleCanPlay = () => { setHasAudio(true); audioRef.current = audio; };
    const handleError = () => { setHasAudio(false); };

    audio.addEventListener("canplaythrough", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.load();

    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.pause();
    };
  }, [audioUrl, primaryText]);

  const handlePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || playing) return;

    setPlaying(true);
    audio.currentTime = 0;
    audio.play().catch(() => setPlaying(false));

    const onEnded = () => { setPlaying(false); audio.removeEventListener("ended", onEnded); };
    audio.addEventListener("ended", onEnded);
  }, [playing]);

  return (
    <div className="text-center space-y-4 py-4">
      <div className={young ? "text-8xl" : "text-6xl"}>{visual}</div>
      <p className={`font-bold text-brown-800 ${young ? "text-5xl" : "text-4xl"}`}>
        {primaryText}
      </p>

      {hasAudio && (
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
