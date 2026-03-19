"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { getIconSet } from "./MapIcons";
import { trackEvent } from "@/components/ui/GoogleAnalytics";

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
  el: "linear-gradient(135deg, #5BA3D9 0%, #7BBCE6 20%, #93C572 45%, #6DAA45 60%, #5D9B3A 75%, #4A8530 100%)",
  hy: "linear-gradient(135deg, #D4A56A 0%, #C49558 15%, #B8A070 30%, #8B9960 50%, #6B8A48 70%, #5A7A3A 100%)",
};

const THEME: Record<string, { accent: string; summitEmoji: string }> = {
  el: { accent: "#1A6AFF", summitEmoji: "\uD83C\uDFDB\uFE0F" },
  hy: { accent: "#C8A951", summitEmoji: "\uD83C\uDFD4\uFE0F" },
};

const W = 800;

export default function MapPath({ nodes, locale, summitLabel, subtitle }: Props) {
  const router = useRouter();
  const icons = getIconSet(locale);
  const theme = THEME[locale] ?? THEME.hy;
  const N = nodes.length;
  const H = Math.max(450, N * 80 + 100);
  const padding = 60;

  // Diagonal: bottom-right to top-left with S-curve wobble
  const positions = nodes.map((_, i) => {
    const t = N > 1 ? i / (N - 1) : 0;
    const x = (W - padding) - t * (W - padding * 2);
    const y = (H - padding) - t * (H - padding * 2);
    const wobble = Math.sin(t * Math.PI * 2) * 40;
    return { x: x + wobble, y };
  });

  // Build SVG path
  const pathD = positions.length > 1
    ? positions.reduce((d, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = positions[i - 1];
        const midX = (prev.x + p.x) / 2;
        const midY = (prev.y + p.y) / 2;
        return `${d} Q ${prev.x} ${midY}, ${midX} ${midY} Q ${p.x} ${midY}, ${p.x} ${p.y}`;
      }, "")
    : "";

  // Midpoint dots
  const midpoints = positions.slice(0, -1).map((p, i) => ({
    x: (p.x + positions[i + 1].x) / 2,
    y: (p.y + positions[i + 1].y) / 2,
  }));

  const handleNodeClick = useCallback((node: MapNode) => {
    const status = getStatus(node);
    if (status === "locked") return;
    trackEvent("map_node_click", { node_title: node.title, node_status: status, locale });
    router.push(node.href);
  }, [locale, router]);

  // Summit label position — near last node (top-left area)
  const lastPos = positions[positions.length - 1] ?? { x: padding, y: padding };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ position: "relative" }}>
      {/* Gradient background */}
      <div className="absolute inset-0" style={{ background: GRADIENTS[locale] ?? GRADIENTS.hy }} />
      {/* Top overlay */}
      <div className="absolute inset-x-0 top-0 h-1/3" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 100%)" }} />
      {/* Bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1/4" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.15) 0%, transparent 100%)" }} />

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ position: "relative", zIndex: 3, display: "block", fontFamily: "inherit" }}>
        {/* Summit label near top-left */}
        <g transform={`translate(${Math.max(80, lastPos.x)}, ${Math.max(30, lastPos.y - 55)})`}>
          <rect x="-70" y="-14" width="140" height="28" rx="14" fill="rgba(255,255,255,0.85)" />
          <text x="0" y="5" textAnchor="middle" fontSize="12" fontWeight="700" fill="#333">{theme.summitEmoji} {summitLabel}</text>
        </g>

        {subtitle && (
          <text x={Math.max(80, lastPos.x)} y={Math.max(30, lastPos.y - 30)} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.7)">{subtitle}</text>
        )}

        {/* Path shadow */}
        {pathD && <path d={pathD} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />}
        {/* Path main */}
        {pathD && <path d={pathD} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />}
        {/* Path dashes */}
        {pathD && <path d={pathD} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeDasharray="6 10" strokeLinecap="round" />}

        {/* Midpoint dots */}
        {midpoints.map((p, i) => (
          <circle key={`mid-${i}`} cx={p.x} cy={p.y} r="4" fill="rgba(255,255,255,0.5)" />
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const pos = positions[i];
          const status = getStatus(node);
          const Icon = icons[i % icons.length];
          const pct = node.totalLessons > 0 ? node.completedLessons / node.totalLessons : 0;

          return (
            <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => handleNodeClick(node)}
              style={{ cursor: status === "locked" ? "default" : "pointer" }}
            >
              {/* Progress ring for in_progress */}
              {status === "in_progress" && (
                <circle cx="0" cy="0" r="40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
              )}
              {status === "in_progress" && (
                <circle cx="0" cy="0" r="40" fill="none" stroke={theme.accent} strokeWidth="4"
                  strokeDasharray={`${pct * 251} ${251 - pct * 251}`}
                  strokeDashoffset="62.8" strokeLinecap="round"
                />
              )}

              {/* Node card */}
              <rect x="-32" y="-32" width="64" height="64" rx="16"
                fill={status === "locked" ? "rgba(255,255,255,0.55)" : "white"}
                stroke={status === "completed" ? "#2D8B4E" : status === "locked" ? "#999" : theme.accent}
                strokeWidth="3"
              />

              {/* Icon inside */}
              {status === "locked" ? (
                <g transform="translate(-10, -10)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </g>
              ) : status === "completed" ? (
                <g transform="translate(-10, -10)" color="#2D8B4E">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </g>
              ) : (
                <g transform="translate(-14, -14)" color={theme.accent}>
                  <Icon size={28} />
                </g>
              )}

              {/* Star badge for completed */}
              {status === "completed" && (
                <g transform="translate(20, -28)">
                  <circle r="10" fill="#FFD700" stroke="white" strokeWidth="2" />
                  <text x="0" y="4" textAnchor="middle" fontSize="11">{"\u2B50"}</text>
                </g>
              )}

              {/* Label — shown for all nodes */}
              <g transform="translate(0, 50)">
                <text x="0" y="0" textAnchor="middle" fontSize="11" fontWeight="700"
                  fill={status === "locked" ? "rgba(255,255,255,0.5)" : "white"}
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.3)" }}>
                  {node.title}
                </text>
                <text x="0" y="14" textAnchor="middle" fontSize="10"
                  fill={status === "locked" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.8)"}
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                  {node.completedLessons}/{node.totalLessons} lessons
                </text>
              </g>

              {/* Pulse for current */}
              {status === "current" && (
                <circle cx="0" cy="0" r="32" fill="none" stroke={theme.accent} strokeWidth="2" opacity="0.5">
                  <animate attributeName="r" from="32" to="46" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
