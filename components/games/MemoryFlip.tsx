"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { lf } from "@/lib/exercise-utils";
import { playSound } from "@/lib/sounds";
import Mascot from "@/components/ui/Mascot";

interface Card {
  id: number;
  pairId: number;
  text: string;
  side: "left" | "right";
}

interface Props {
  exercises: unknown[];
  onComplete: (score: number, total: number) => void;
  locale: string;
  young: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryFlip({ exercises, onComplete, locale, young }: Props) {
  const cards = useMemo<Card[]>(() => {
    const pairs: Card[] = [];
    exercises.forEach((ex, i) => {
      const left = lf(ex, "left", locale) as string;
      const right = lf(ex, "right", locale) as string;
      if (!left || !right) return;
      pairs.push({ id: i * 2, pairId: i, text: left, side: "left" });
      pairs.push({ id: i * 2 + 1, pairId: i, text: right, side: "right" });
    });
    return shuffle(pairs);
  }, [exercises, locale]);

  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<number[]>([]);
  const [flips, setFlips] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const lockRef = useRef(false);

  const totalPairs = Math.floor(cards.length / 2);

  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [startTime, done]);

  function handleTap(id: number) {
    if (lockRef.current || flipped.has(id) || matched.has(id)) return;

    const next = [...selected, id];
    setFlipped((p) => new Set([...p, id]));
    setFlips((f) => f + 1);

    if (next.length === 2) {
      lockRef.current = true;
      const [a, b] = next;
      const cardA = cards.find((c) => c.id === a)!;
      const cardB = cards.find((c) => c.id === b)!;

      if (cardA.pairId === cardB.pairId && cardA.side !== cardB.side) {
        playSound("correct");
        const newMatched = new Set([...matched, a, b]);
        setMatched(newMatched);
        setSelected([]);
        lockRef.current = false;

        if (newMatched.size === cards.length) {
          setDone(true);
          playSound("complete");
          setTimeout(() => onComplete(totalPairs, totalPairs), 2000);
        }
      } else {
        playSound("wrong");
        setTimeout(() => {
          setFlipped((p) => {
            const s = new Set(p);
            s.delete(a);
            s.delete(b);
            return s;
          });
          setSelected([]);
          lockRef.current = false;
        }, 1000);
      }
    } else {
      setSelected(next);
    }
  }

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const cardSize = young ? "w-[100px] h-[120px] md:w-[110px] md:h-[140px]" : "w-[80px] h-[100px] md:w-[100px] md:h-[130px]";
  const textSize = young ? "text-lg" : "text-base";

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => onComplete(0, 0)} className="text-sm text-brown-400 hover:text-brown-600">Quit</button>
        <div className="flex items-center gap-4 text-sm text-brown-500">
          <span>{mins}:{secs.toString().padStart(2, "0")}</span>
          <span>{flips} flips</span>
          <span>{matched.size / 2}/{totalPairs} pairs</span>
        </div>
      </div>

      {done ? (
        <div className="text-center py-12">
          <Mascot pose="celebrating" size={120} className="mb-4" />
          <p className="text-2xl font-bold text-brown-800 mb-2">All matched!</p>
          <p className="text-brown-500">{flips} flips in {mins}:{secs.toString().padStart(2, "0")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 md:gap-3 justify-items-center">
          {cards.map((card) => {
            const isFlipped = flipped.has(card.id) || matched.has(card.id);
            const isMatched = matched.has(card.id);

            return (
              <button
                key={card.id}
                onClick={() => handleTap(card.id)}
                className={`perspective-500 ${cardSize} rounded-xl transition-all duration-200 ${
                  isMatched ? "ring-2 ring-green-400 opacity-80" : ""
                }`}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 ${isFlipped ? "rotate-y-180" : ""}`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Back */}
                  <div
                    className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-md"
                  >
                    <span className="text-2xl text-white/80">?</span>
                  </div>
                  {/* Front */}
                  <div
                    className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl bg-white border-2 border-brown-200 flex items-center justify-center p-2 shadow-md"
                  >
                    <span className={`font-medium text-brown-800 text-center leading-tight ${textSize}`}>
                      {card.text}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}
