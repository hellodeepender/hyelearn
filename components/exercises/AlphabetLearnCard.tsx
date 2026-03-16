"use client";

import { transliterate } from "@/lib/transliterate";
import AudioButton from "./AudioButton";

interface Props {
  letter: string;
  letterName: string;
  transliterationText?: string;
  sound: string;
  exampleWord: string;
  exampleTranslation: string;
  emoji: string;
}

export default function AlphabetLearnCard({
  letter, letterName, transliterationText, sound, exampleWord, emoji,
}: Props) {
  const translit = transliterationText || transliterate(letterName);

  return (
    <div className="text-center space-y-3 py-4">
      {/* Example emoji */}
      <div className="text-5xl">{emoji}</div>

      {/* Letter (large) */}
      <p className="text-6xl md:text-8xl font-bold text-brown-800 leading-tight">{letter}</p>

      {/* Letter name */}
      <p className="text-lg text-brown-600">{letterName}</p>

      {/* Transliteration */}
      <p className="text-sm text-gray-400 font-light tracking-wide">{translit}</p>

      {/* Sound */}
      <p className="text-base text-brown-500">Sounds like &ldquo;{sound}&rdquo;</p>

      {/* Audio button — auto-plays on appear */}
      <AudioButton word={letterName} autoPlay />

      {/* Example word */}
      <p className="text-sm text-brown-400">
        as in {exampleWord} ({transliterate(exampleWord)}) {emoji}
      </p>
    </div>
  );
}
