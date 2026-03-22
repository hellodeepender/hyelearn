"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/locale-context";

interface TickerItem { name: string; date: string }

export default function SupportersTicker() {
  const { locale } = useLocale();
  const isGreek = locale === "el";
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    fetch("/api/supporters")
      .then((r) => r.json())
      .then((data: { name: string; date: string }[]) => {
        setItems(data.map((d) => ({ name: d.name, date: d.date.replace(/, \d{4}$/, "") })));
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  const bgColor = isGreek ? "linear-gradient(135deg, #1a365d, #153e75)" : "#A8232A";
  const accentColor = isGreek ? "#63B3ED" : "#D4A843";

  // Duplicate enough times for seamless scroll
  const reps = Math.max(4, Math.ceil(20 / items.length));
  const tickerContent = Array.from({ length: reps }, () => items).flat();

  return (
    <div>
      <div className="text-white overflow-hidden" style={{ background: bgColor }}>
        <div className="flex items-center h-10">
          <a href="https://diasporalearn.org/supporters" target="_blank" rel="noopener noreferrer"
            className="shrink-0 px-4 text-sm font-medium flex items-center gap-1.5 border-r border-white/20 h-full hover:bg-white/10 transition-colors z-10">
            <span>{"\uD83D\uDE4F"}</span>
            <span className="hidden sm:inline">Recent Supporters</span>
          </a>

          <div className="flex-1 overflow-hidden relative" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 30px, black calc(100% - 30px), transparent)", maskImage: "linear-gradient(to right, transparent, black 30px, black calc(100% - 30px), transparent)" }}>
            <div className="inline-flex whitespace-nowrap hover:[animation-play-state:paused]" style={{ animation: "ticker-scroll 35s linear infinite" }}>
              {tickerContent.map((item, i) => (
                <span key={i} className="inline-flex items-center text-sm px-3">
                  <span style={{ color: accentColor }}>{"\u2665"}</span>
                  <span className="ml-1.5">{item.name} donated</span>
                  <span className="text-white/50 mx-1">&middot;</span>
                  <span className="text-white/70">{item.date}</span>
                  <span style={{ color: accentColor }} className="mx-3">{"\u2726"}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="text-center py-1" style={{ background: isGreek ? "#0f2847" : "#8a1e24" }}>
        <a href="https://diasporalearn.org/supporters" target="_blank" rel="noopener noreferrer"
          className="text-xs text-white/60 hover:text-white/90 transition-colors">
          See all supporters &rarr;
        </a>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
