"use client";

import Link from "next/link";
import { SUPPORTERS } from "@/lib/supporters";

export default function SupportersTicker() {
  const items = SUPPORTERS.map((s) => ({
    label: s.anonymous ? "Anonymous Supporter" : s.name,
    date: s.date.replace(", 2026", ""),
  }));

  // Duplicate for seamless loop
  const tickerContent = [...items, ...items];

  return (
    <div className="bg-[#A8232A] text-white overflow-hidden">
      <div className="max-w-6xl mx-auto flex items-center h-10">
        {/* Fixed label */}
        <Link href="/supporters" className="shrink-0 px-4 text-sm font-medium flex items-center gap-1.5 border-r border-white/20 h-full hover:bg-white/10 transition-colors">
          <span>{"\uD83D\uDE4F"}</span>
          <span className="hidden sm:inline">Recent Supporters</span>
        </Link>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden relative" style={{ maskImage: "linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)" }}>
          <div className="flex items-center gap-0 animate-ticker-scroll hover:[animation-play-state:paused] whitespace-nowrap">
            {tickerContent.map((item, i) => (
              <span key={i} className="inline-flex items-center text-sm px-4">
                <span className="text-[#D4A843]">{"\u2665"}</span>
                <span className="ml-1.5">{item.label} donated</span>
                <span className="text-white/50 mx-1">&middot;</span>
                <span className="text-white/70">{item.date}</span>
                <span className="text-[#D4A843] mx-4">{"\u2726"}</span>
              </span>
            ))}
          </div>
        </div>
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
