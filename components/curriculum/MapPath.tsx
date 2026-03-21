"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/components/ui/GoogleAnalytics";

interface MapNode {
  id: string;
  title: string;
  slug: string;
  completedLessons: number;
  totalLessons: number;
  unlocked: boolean;
  href: string;
  englishTitle?: string;
}

interface Props {
  nodes: MapNode[];
  locale: string;
  summitLabel: string;
  subtitle?: string;
}

type NodeStatus = "completed" | "in_progress" | "current" | "locked";

function getStatus(n: MapNode): NodeStatus {
  if (!n.unlocked) return "locked";
  if (n.completedLessons >= n.totalLessons && n.totalLessons > 0) return "completed";
  if (n.completedLessons > 0) return "in_progress";
  return "current";
}

// Icon paths by locale
const HY_ICONS = [
  "/images/quest-map/hy-icon-pomegranate.png",
  "/images/quest-map/hy-icon-khachkar.png",
  "/images/quest-map/hy-icon-church.png",
  "/images/quest-map/hy-icon-ararat.png",
  "/images/quest-map/hy-icon-letter.png",
  "/images/quest-map/hy-icon-duduk.png",
  "/images/quest-map/hy-icon-grape.png",
  "/images/quest-map/hy-icon-dove.png",
  "/images/quest-map/hy-icon-book.png",
  "/images/quest-map/hy-icon-star.png",
];

const EL_ICONS = [
  "/images/quest-map/el-icon-olive.png",
  "/images/quest-map/el-icon-column.png",
  "/images/quest-map/el-icon-church.png",
  "/images/quest-map/el-icon-olympus.png",
  "/images/quest-map/el-icon-letter.png",
  "/images/quest-map/el-icon-lyre.png",
  "/images/quest-map/el-icon-amphora.png",
  "/images/quest-map/el-icon-owl.png",
  "/images/quest-map/el-icon-scroll.png",
  "/images/quest-map/el-icon-laurel.png",
];

function getIconForNode(index: number, locale: string): string {
  const icons = locale === "el" ? EL_ICONS : HY_ICONS;
  return icons[index % icons.length];
}

const THEME: Record<string, { accent: string; pathColor: string; summitEmoji: string }> = {
  el: { accent: "#1A6AFF", pathColor: "#5B8DB8", summitEmoji: "\uD83C\uDFDB\uFE0F" },
  hy: { accent: "#C8A951", pathColor: "#C4956A", summitEmoji: "\uD83C\uDFD4\uFE0F" },
};

const W = 900;
const H = 500;

export default function MapPath({ nodes, locale, summitLabel, subtitle }: Props) {
  const router = useRouter();
  const theme = THEME[locale] ?? THEME.hy;
  const N = nodes.length;
  const padding = 80;

  // Diagonal: bottom-left to top-right with S-curve wobble
  const positions = nodes.map((_, i) => {
    const t = N > 1 ? i / (N - 1) : 0;
    const x = padding + t * (W - padding * 2);
    const baseY = (H - padding) - t * (H - padding * 2);
    const wobble = Math.sin(t * Math.PI * 2) * 30;
    return { x, y: baseY + wobble };
  });

  // Smooth cubic bezier path
  const pathD = positions.length > 1
    ? positions.reduce((d, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = positions[i - 1];
        const cpx = prev.x + (p.x - prev.x) * 0.5;
        return `${d} C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
      }, "")
    : "";

  const handleNodeClick = useCallback((node: MapNode) => {
    const status = getStatus(node);
    if (status === "locked") return;
    trackEvent("map_node_click", { node_title: node.title, node_status: status, locale });
    router.push(node.href);
  }, [locale, router]);

  // Auto-scroll to current node
  useEffect(() => {
    const el = document.getElementById("current-lesson-node");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const bgImage = locale === "el" ? "/images/quest-map/quest-bg-greek.png" : "/images/quest-map/quest-bg-armenian.png";

  return (
    <div className="rounded-2xl overflow-hidden relative">
      <style>{`
        @keyframes quest-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(212,175,55,0.4); }
          50% { transform: translate(-50%, -50%) scale(1.08); box-shadow: 0 0 20px 8px rgba(212,175,55,0.15); }
        }
        .quest-node { transition: transform 0.15s ease; }
        .quest-node:hover { transform: translate(-50%, -50%) scale(1.1) !important; }
        .quest-node:active { transform: translate(-50%, -50%) scale(0.95) !important; }
        .quest-node-current { animation: quest-pulse 2s ease-in-out infinite; }
        .quest-node-locked { transform: translate(-50%, -50%) scale(1); }
        .quest-node-locked:hover { transform: translate(-50%, -50%) scale(1) !important; }
      `}</style>

      {/* Background: gradient base */}
      <div className="absolute inset-0" style={{
        background: locale === "el"
          ? "linear-gradient(135deg, #3d7a2e 0%, #5a9e42 30%, #7ab868 55%, #8ec5d8 78%, #5ba3d9 100%)"
          : "linear-gradient(135deg, #4a6b2a 0%, #7a8c48 25%, #b8a070 50%, #c49558 75%, #d4a56a 100%)",
      }} />

      {/* Background: illustrated overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        opacity: 0.25,
      }} />

      {/* Depth overlays */}
      <div className="absolute inset-x-0 top-0 h-1/3" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, transparent 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-1/4" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.08) 0%, transparent 100%)" }} />

      {/* SVG: path + summit label only */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="relative z-[2] block" style={{ fontFamily: "inherit" }}>
        <defs>
          <filter id="path-shadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.25" /></filter>
          <filter id="node-shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" /></filter>
        </defs>

        {/* Summit label */}
        <g transform={`translate(${W - 110}, 35)`}>
          <rect x="-65" y="-16" width="130" height="32" rx="16" fill="rgba(255,255,255,0.92)" filter="url(#node-shadow)" />
          <text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="700" fill="#333">{theme.summitEmoji} {summitLabel}</text>
        </g>
        {subtitle && <text x={W - 110} y={58} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.8)">{subtitle}</text>}

        {/* Path: shadow → main → dashes */}
        {pathD && <path d={pathD} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />}
        {pathD && <path d={pathD} fill="none" stroke={theme.pathColor} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" filter="url(#path-shadow)" opacity="0.8" />}
        {pathD && <path d={pathD} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeDasharray="8 12" strokeLinecap="round" />}

        {/* Progress rings (SVG for clean arcs) */}
        {nodes.map((node, i) => {
          const pos = positions[i];
          const status = getStatus(node);
          const pct = node.totalLessons > 0 ? node.completedLessons / node.totalLessons : 0;
          if (status !== "in_progress") return null;
          return (
            <g key={`ring-${node.id}`} transform={`translate(${pos.x}, ${pos.y})`}>
              <circle cx="0" cy="0" r="36" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3.5" />
              <circle cx="0" cy="0" r="36" fill="none" stroke={theme.accent} strokeWidth="3.5"
                strokeDasharray={`${pct * 226} ${226 - pct * 226}`}
                strokeDashoffset="56.5" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>

      {/* HTML nodes overlaid on the SVG */}
      <div className="absolute inset-0 z-[3]">
        {nodes.map((node, i) => {
          const pos = positions[i];
          const status = getStatus(node);
          const isLocked = status === "locked";
          const isCompleted = status === "completed";
          const isCurrent = status === "current" || status === "in_progress";
          const iconSrc = getIconForNode(i, locale);

          // Convert viewBox coords to percentages
          const leftPct = (pos.x / W) * 100;
          const topPct = (pos.y / H) * 100;

          // Sizes
          const iconSize = isLocked ? 40 : isCurrent ? 56 : 48;
          const ringSize = iconSize + 12;

          return (
            <div key={node.id} className="absolute" style={{ left: `${leftPct}%`, top: `${topPct}%` }}>
              {/* Node icon */}
              <div
                id={isCurrent ? "current-lesson-node" : undefined}
                onClick={() => handleNodeClick(node)}
                className={`quest-node absolute rounded-full flex items-center justify-center ${
                  isLocked ? "quest-node-locked cursor-default" : isCurrent ? "quest-node-current cursor-pointer" : "cursor-pointer"
                }`}
                style={{
                  width: ringSize,
                  height: ringSize,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  background: isLocked ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.95)",
                  border: isCompleted ? "3px solid #2D8B4E" : isLocked ? "1.5px solid rgba(180,180,180,0.4)" : `3px solid ${theme.accent}`,
                  boxShadow: isLocked ? "none" : "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={iconSrc}
                  alt={node.title}
                  width={iconSize}
                  height={iconSize}
                  className={`rounded-full ${isLocked ? "grayscale opacity-40" : ""}`}
                  style={{ width: iconSize, height: iconSize }}
                  loading="lazy"
                />

                {/* Completed checkmark badge */}
                {isCompleted && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Completed star */}
                {isCompleted && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white text-xs shadow-sm">
                    {"\u2B50"}
                  </div>
                )}
              </div>

              {/* Label below node */}
              <div className="absolute text-center" style={{
                left: "50%",
                top: `${ringSize / 2 + 8}px`,
                transform: "translateX(-50%)",
                width: 120,
              }}>
                <p className={`font-bold leading-tight ${isLocked ? "text-[10px]" : "text-[11px]"}`}
                  style={{
                    color: isLocked ? "rgba(255,255,255,0.45)" : "white",
                    textShadow: isLocked ? "none" : "0 1px 4px rgba(0,0,0,0.6)",
                  }}>
                  {node.title}
                </p>
                {node.englishTitle && (
                  <p className="text-[9px] mt-0.5" style={{
                    color: isLocked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
                    textShadow: isLocked ? "none" : "0 1px 3px rgba(0,0,0,0.5)",
                  }}>
                    {node.englishTitle}
                  </p>
                )}
                <p className={`mt-0.5 ${isLocked ? "text-[9px]" : "text-[10px]"}`} style={{
                  color: isLocked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)",
                  textShadow: isLocked ? "none" : "0 1px 3px rgba(0,0,0,0.5)",
                }}>
                  {node.completedLessons}/{node.totalLessons} lessons
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
