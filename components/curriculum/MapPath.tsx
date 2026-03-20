"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { getIconSet } from "./MapIcons";
import { trackEvent } from "@/components/ui/GoogleAnalytics";
import { getEnglishTitle } from "@/lib/grade-labels";

interface MapNode {
  id: string;
  title: string;
  slug: string;
  completedLessons: number;
  totalLessons: number;
  unlocked: boolean;
  href: string;
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

const GRADIENTS: Record<string, string> = {
  el: "linear-gradient(135deg, #4A8530 0%, #6DAA45 25%, #93C572 50%, #7BBCE6 75%, #5BA3D9 100%)",
  hy: "linear-gradient(135deg, #5A7A3A 0%, #8B9960 25%, #B8A070 50%, #C49558 75%, #D4A56A 100%)",
};

const THEME: Record<string, { accent: string; summitEmoji: string }> = {
  el: { accent: "#1A6AFF", summitEmoji: "\uD83C\uDFDB\uFE0F" },
  hy: { accent: "#C8A951", summitEmoji: "\uD83C\uDFD4\uFE0F" },
};

const W = 900;
const H = 500;

export default function MapPath({ nodes, locale, summitLabel, subtitle }: Props) {
  const router = useRouter();
  const icons = getIconSet(locale);
  const theme = THEME[locale] ?? THEME.hy;
  const N = nodes.length;
  const padding = 70;

  // Diagonal layout: bottom-left to top-right with S-curve wobble
  const positions = nodes.map((_, i) => {
    const t = N > 1 ? i / (N - 1) : 0;
    const x = padding + t * (W - padding * 2);
    const baseY = (H - padding) - t * (H - padding * 2);
    const wobble = Math.sin(t * Math.PI * 2) * 35;
    return { x, y: baseY + wobble };
  });

  // Build SVG path with smooth cubic bezier curves
  const pathD = positions.length > 1
    ? positions.reduce((d, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = positions[i - 1];
        const cpx1 = prev.x + (p.x - prev.x) * 0.5;
        const cpx2 = prev.x + (p.x - prev.x) * 0.5;
        return `${d} C ${cpx1} ${prev.y}, ${cpx2} ${p.y}, ${p.x} ${p.y}`;
      }, "")
    : "";

  const handleNodeClick = useCallback((node: MapNode) => {
    const status = getStatus(node);
    if (status === "locked") return;
    trackEvent("map_node_click", { node_title: node.title, node_status: status, locale });
    router.push(node.href);
  }, [locale, router]);

  return (
    <div className="rounded-2xl overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0" style={{ background: GRADIENTS[locale] ?? GRADIENTS.hy }} />
      {/* Subtle overlays for depth */}
      <div className="absolute inset-x-0 top-0 h-1/3" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-1/4" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.12) 0%, transparent 100%)" }} />

      {/* Decorative background elements */}
      <svg className="absolute inset-0 opacity-10" width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <circle cx="100" cy="80" r="60" fill="white" />
        <circle cx="750" cy="400" r="90" fill="white" />
        <circle cx="400" cy="100" r="40" fill="white" />
        <circle cx="600" cy="350" r="30" fill="white" />
      </svg>

      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: "relative", zIndex: 3, display: "block", fontFamily: "inherit" }}
      >
        {/* Filters */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Summit label at top-right */}
        <g transform={`translate(${W - 100}, 35)`}>
          <rect x="-65" y="-16" width="130" height="32" rx="16" fill="rgba(255,255,255,0.9)" filter="url(#shadow)" />
          <text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="700" fill="#333">{theme.summitEmoji} {summitLabel}</text>
        </g>

        {subtitle && (
          <text x={W - 100} y={58} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.8)">{subtitle}</text>
        )}

        {/* Path shadow */}
        {pathD && <path d={pathD} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />}
        {/* Path main */}
        {pathD && <path d={pathD} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />}
        {/* Path center dashes */}
        {pathD && <path d={pathD} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeDasharray="8 12" strokeLinecap="round" />}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const pos = positions[i];
          const status = getStatus(node);
          const Icon = icons[i % icons.length];
          const pct = node.totalLessons > 0 ? node.completedLessons / node.totalLessons : 0;
          const isLocked = status === "locked";
          const isCompleted = status === "completed";
          const isCurrent = status === "current" || status === "in_progress";
          const enTitle = getEnglishTitle(node.title, locale);

          return (
            <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => handleNodeClick(node)}
              style={{ cursor: isLocked ? "default" : "pointer" }}
            >
              {/* Progress ring for in_progress */}
              {status === "in_progress" && (
                <>
                  <circle cx="0" cy="0" r="40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                  <circle cx="0" cy="0" r="40" fill="none" stroke={theme.accent} strokeWidth="4"
                    strokeDasharray={`${pct * 251} ${251 - pct * 251}`}
                    strokeDashoffset="62.8" strokeLinecap="round"
                  />
                </>
              )}

              {/* Pulse animation for current/in_progress */}
              {isCurrent && (
                <circle cx="0" cy="0" r="34" fill="none" stroke={theme.accent} strokeWidth="2" opacity="0.5">
                  <animate attributeName="r" from="34" to="48" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Node card */}
              <rect x="-32" y="-32" width="64" height="64" rx="16"
                fill={isLocked ? "rgba(255,255,255,0.5)" : "white"}
                stroke={isCompleted ? "#2D8B4E" : isLocked ? "rgba(150,150,150,0.5)" : theme.accent}
                strokeWidth="3"
                filter={isLocked ? "" : "url(#shadow)"}
              />

              {/* Icon inside */}
              {isLocked ? (
                <g transform="translate(-10, -10)" color="#999">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </g>
              ) : isCompleted ? (
                <g transform="translate(-12, -12)" color="#2D8B4E">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </g>
              ) : (
                <g transform="translate(-14, -14)" color={theme.accent}>
                  <Icon size={28} />
                </g>
              )}

              {/* Star badge for completed */}
              {isCompleted && (
                <g transform="translate(22, -30)">
                  <circle r="11" fill="#FFD700" stroke="white" strokeWidth="2" filter="url(#shadow)" />
                  <text x="0" y="4" textAnchor="middle" fontSize="12">{"\u2B50"}</text>
                </g>
              )}

              {/* Label below */}
              <g transform="translate(0, 48)">
                <text x="0" y="0" textAnchor="middle" fontSize="11" fontWeight="700"
                  fill={isLocked ? "rgba(255,255,255,0.5)" : "white"}
                  style={{ textShadow: isLocked ? "none" : "0 1px 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.3)" }}>
                  {enTitle ?? node.title}
                </text>
                {enTitle && (
                  <text x="0" y="13" textAnchor="middle" fontSize="9"
                    fill={isLocked ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.6)"}
                    style={{ textShadow: isLocked ? "none" : "0 1px 3px rgba(0,0,0,0.5)" }}>
                    {node.title}
                  </text>
                )}
                <text x="0" y={enTitle ? "26" : "14"} textAnchor="middle" fontSize="10"
                  fill={isLocked ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.8)"}
                  style={{ textShadow: isLocked ? "none" : "0 1px 3px rgba(0,0,0,0.5)" }}>
                  {node.completedLessons}/{node.totalLessons} lessons
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
