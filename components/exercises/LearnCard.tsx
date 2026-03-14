"use client";

interface Props {
  visual: string;
  primaryText: string;
  secondaryText: string;
  young?: boolean;
}

export default function LearnCard({ visual, primaryText, secondaryText, young }: Props) {
  return (
    <div className="text-center space-y-4 py-4">
      <div className={young ? "text-8xl" : "text-6xl"}>{visual}</div>
      <p className={`font-bold text-brown-800 ${young ? "text-5xl" : "text-4xl"}`}>
        {primaryText}
      </p>
      <p className={`text-brown-500 ${young ? "text-xl" : "text-lg"}`}>
        {secondaryText}
      </p>
    </div>
  );
}
