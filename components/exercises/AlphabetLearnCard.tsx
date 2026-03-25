"use client";

import { transliterate } from "@/lib/transliterate";
import { useCurrentLocale } from "@/lib/locale-context";
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
  const locale = useCurrentLocale();
  const translit = transliterationText || transliterate(letterName, locale);

  return (
    <div className="text-center space-y-3 py-4">
      <div className="text-5xl">{emoji}</div>
      <p className="text-6xl md:text-8xl font-bold text-brown-800 leading-tight">{letter}</p>
      <p className="text-lg text-brown-600">{letterName}</p>
      <p className="text-sm text-gray-400 font-light tracking-wide">{translit}</p>
      <p className="text-base text-brown-500">Sounds like &ldquo;{sound}&rdquo;</p>
      <AudioButton word={exampleWord || letter} autoPlay />
      {exampleWord && (
        <p className="text-sm text-brown-400">
          as in {exampleWord} ({transliterate(exampleWord, locale)}) {emoji}
        </p>
      )}
    </div>
  );
}
