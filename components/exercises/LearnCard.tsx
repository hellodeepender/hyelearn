"use client";

import { transliterate } from "@/lib/transliterate";
import { useCurrentLocale } from "@/lib/locale-context";
import AudioButton from "./AudioButton";

interface Props {
  visual: string;
  primaryText: string;
  secondaryText: string;
  young?: boolean;
}

export default function LearnCard({ visual, primaryText, secondaryText, young }: Props) {
  const locale = useCurrentLocale();
  if (!primaryText) return null;

  const latin = transliterate(primaryText, locale);
  const hasNonLatin = /[\u0370-\u03FF\u0530-\u058F\u0600-\u06FF]/.test(primaryText);

  return (
    <div className="text-center space-y-3 py-4">
      <div className={young ? "text-6xl md:text-8xl" : "text-5xl md:text-6xl"}>{visual}</div>
      <p className={`font-bold text-brown-800 ${young ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl"}`}>
        {primaryText}
      </p>
      {hasNonLatin && latin !== primaryText && (
        <p className="text-sm text-gray-400 font-light tracking-wide">{latin}</p>
      )}
      <AudioButton word={primaryText} autoPlay />
      <p className={`text-brown-500 ${young ? "text-xl" : "text-lg"}`}>
        {secondaryText}
      </p>
    </div>
  );
}
