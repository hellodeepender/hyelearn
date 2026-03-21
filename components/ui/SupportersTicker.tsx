"use client";

import Link from "next/link";
import { SUPPORTERS } from "@/lib/supporters";
import { useLocale } from "@/lib/locale-context";

export default function SupportersTicker() {
  const { locale } = useLocale();
  const isGreek = locale === "el";

  const bgColor = isGreek ? "linear-gradient(135deg, #1a365d, #153e75)" : "#A8232A";
  const accentColor = isGreek ? "#63B3ED" : "#D4A843";

  const items = SUPPORTERS.map((s) => ({
    label: s.anonymous ? "Anonymous Supporter" : s.name,
    date: s.date.replace(", 2026", ""),
  }));

  const tickerContent = [...items, ...items];

  return (
    <div>
      <div className="text-white overflow-hidden" style={{ background: bgColor }}>
        <div className="max-w-6xl mx-auto flex items-center h-10">
          <Link href="https://diasporalearn.org/supporters" target="_blank" rel="noopener noreferrer"
            className="shrink-0 px-4 text-sm font-medium flex items-center gap-1.5 border-r border-white/20 h-full hover:bg-white/10 transition-colors">
            <span>{"\uD83D\uDE4F"}</span>
            <span className="hidden sm:inline">Recent Supporters</span>
          </Link>

          <div className="flex-1 overflow-hidden relative" style={{ maskImage: "linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)" }}>
            <div className="flex items-center gap-0 animate-ticker-scroll hover:[animation-play-state:paused] whitespace-nowrap">
              {tickerContent.map((item, i) => (
                <span key={i} className="inline-flex items-center text-sm px-4">
                  <span style={{ color: accentColor }}>{"\u2665"}</span>
                  <span className="ml-1.5">{item.label} donated</span>
                  <span className="text-white/50 mx-1">&middot;</span>
                  <span className="text-white/70">{item.date}</span>
                  <span style={{ color: accentColor }} className="mx-4">{"\u2726"}</span>
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
        .animate-ticker-scroll {
          animation: ticker-scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
