"use client";

import { useEffect, useState } from "react";
import { getMascot } from "@/lib/mascots";
import { useCurrentLocale } from "@/lib/locale-context";

const CORRECT_PHRASES = ["Great job!", "Awesome!", "You got it!", "Well done!", "Amazing!", "Keep it up!"];
const WRONG_PHRASES = ["Almost!", "Try again!", "You'll get it!", "Keep going!", "So close!"];

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Props {
  show: boolean;
  correct: boolean;
}

export default function MascotReaction({ show, correct }: Props) {
  const locale = useCurrentLocale();
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [phrase] = useState(() => pick(correct ? CORRECT_PHRASES : WRONG_PHRASES));

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    setFading(false);

    const fadeTimer = setTimeout(() => setFading(true), 1200);
    const hideTimer = setTimeout(() => setVisible(false), 1500);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, [show]);

  if (!visible) return null;

  const pose = correct ? "happy" : "sad";
  const bubbleBg = correct ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700";

  return (
    <div
      className={`fixed bottom-5 right-5 z-40 flex items-end gap-2 ${fading ? "animate-fade-out-down" : "animate-slide-up"}`}
    >
      <div className={`px-3 py-1.5 rounded-xl border text-sm font-medium shadow-sm ${bubbleBg}`}>
        {phrase}
      </div>
      <img
        src={getMascot(locale, pose)}
        alt=""
        className="w-12 h-12 md:w-16 md:h-16 object-contain mix-blend-multiply"
      />
    </div>
  );
}
