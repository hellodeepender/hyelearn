"use client";

import { useCallback, useRef, useState } from "react";
import { getWordAudioUrl } from "@/lib/audio";
import { transliterate } from "@/lib/transliterate";

interface Props {
  letter: string;
  letterName: string;
  transliterationText?: string;
  sound: string;
  exampleWord: string;
  exampleTranslation: string;
  emoji: string;
}

function SpeakerIcon({ playing }: { playing: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={`w-7 h-7 ${playing ? "animate-pulse" : ""}`}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

export default function AlphabetLearnCard({
  letter, letterName, transliterationText, sound, exampleWord, exampleTranslation, emoji,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [audioHidden, setAudioHidden] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentRef = useRef(letterName);

  if (currentRef.current !== letterName) {
    currentRef.current = letterName;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlaying(false);
    setAudioHidden(false);
  }

  const handlePlay = useCallback(() => {
    if (playing || !letterName) return;
    const audio = new Audio(getWordAudioUrl(letterName));
    audioRef.current = audio;
    setPlaying(true);
    audio.addEventListener("ended", () => setPlaying(false));
    audio.addEventListener("error", () => { setPlaying(false); setAudioHidden(true); });
    audio.play().catch(() => { setPlaying(false); setAudioHidden(true); });
  }, [playing, letterName]);

  const translit = transliterationText || transliterate(letterName);

  return (
    <div className="text-center space-y-3 py-4">
      {/* Example emoji (small) */}
      <div className="text-5xl">{emoji}</div>

      {/* Letter (large) */}
      <p className="text-8xl font-bold text-brown-800 leading-tight">{letter}</p>

      {/* Letter name */}
      <p className="text-lg text-brown-600">{letterName}</p>

      {/* Transliteration */}
      <p className="text-sm text-gray-400 font-light tracking-wide">{translit}</p>

      {/* Sound */}
      <p className="text-base text-brown-500">Sounds like &ldquo;{sound}&rdquo;</p>

      {/* Audio button */}
      {!audioHidden && (
        <button onClick={handlePlay} aria-label="Listen to pronunciation"
          className="inline-flex items-center justify-center text-gold hover:text-gold-dark transition-colors">
          <SpeakerIcon playing={playing} />
        </button>
      )}

      {/* Example word */}
      <p className="text-sm text-brown-400">
        as in {exampleWord} ({transliterate(exampleWord)}) {emoji}
      </p>
    </div>
  );
}
