"use client";

import { transliterate } from "@/lib/transliterate";
import AudioButton from "./AudioButton";

interface Props {
  visual: string;
  primaryText: string;
  secondaryText: string;
  young?: boolean;
}

export default function LearnCard({ visual, primaryText, secondaryText, young }: Props) {
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
      <AudioButton word={primaryText} autoPlay />
      <p className={`text-brown-500 ${young ? "text-xl" : "text-lg"}`}>
        {secondaryText}
      </p>
    </div>
  );
}
