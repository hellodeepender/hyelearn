"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  headerStats?: string;
  backHref?: string;
  backLabel?: string;
}

type NodeStatus = "completed" | "in_progress" | "current" | "locked";

function getStatus(n: MapNode): NodeStatus {
  if (!n.unlocked) return "locked";
  if (n.completedLessons >= n.totalLessons && n.totalLessons > 0) return "completed";
  if (n.completedLessons > 0) return "in_progress";
  return "current";
}

const GRADIENTS: Record<string, string> = {
  el: "linear-gradient(180deg, #5BA3D9 0%, #7BBCE6 20%, #93C572 45%, #6DAA45 60%, #5D9B3A 75%, #4A8530 100%)",
  hy: "linear-gradient(180deg, #D4A56A 0%, #C49558 15%, #B8A070 30%, #8B9960 50%, #6B8A48 70%, #5A7A3A 100%)",
};

const THEME: Record<string, { primary: string; accent: string; summitEmoji: string }> = {
  el: { primary: "#1A6AFF", accent: "#1A6AFF", summitEmoji: "\uD83C\uDFDB\uFE0F" },
  hy: { primary: "#C8A951", accent: "#C8A951", summitEmoji: "\uD83C\uDFD4\uFE0F" },
};

const W = 380;

export default function MapPath({ nodes, locale, summitLabel, subtitle, headerStats, backHref, backLabel }: Props) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<MapNode | null>(null);
  const icons = getIconSet(locale);
  const theme = THEME[locale] ?? THEME.hy;
  const N = nodes.length;
  const H = Math.max(920, N * 85 + 200);
  const startY = H - 80;
  const endY = 100;
  const centerX = W / 2;
  const amplitude = W * 0.24;

  // Generate node positions
  const positions = nodes.map((_, i) => {
    const t = N > 1 ? i / (N - 1) : 0;
    const y = startY - t * (startY - endY);
    const x = centerX + Math.sin(t * Math.PI * 2.6 + 0.7) * amplitude;
    return { x, y };
  });

  // Build SVG path
  const pathD = positions.length > 1
    ? positions.reduce((d, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = positions[i - 1];
        const midY = (prev.y + p.y) / 2;
        return `${d} C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
      }, "")
    : "";

  // Midpoints for dots
  const midpoints = positions.slice(0, -1).map((p, i) => ({
    x: (p.x + positions[i + 1].x) / 2,
    y: (p.y + positions[i + 1].y) / 2,
  }));

  // Auto-scroll to current node
  useEffect(() => {
    if (!scrollRef.current) return;
    const currentIdx = nodes.findIndex((n) => {
      const s = getStatus(n);
      return s === "current" || s === "in_progress";
    });
    if (currentIdx >= 0) {
      const pos = positions[currentIdx];
      const containerH = scrollRef.current.clientHeight;
      scrollRef.current.scrollTop = (pos.y / H) * scrollRef.current.scrollHeight - containerH / 2;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNodeClick = useCallback((node: MapNode) => {
    const status = getStatus(node);
    if (status === "locked") return;
    trackEvent("map_node_click", { node_title: node.title, node_status: status, locale });
    setSelected(node);
  }, [locale]);

  const handleGo = useCallback(() => {
    if (selected) router.push(selected.href);
  }, [selected, router]);

  return (
    <div className="relative max-w-[420px] mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3">
        {backHref ? (
          <button onClick={() => router.push(backHref)} className="flex items-center gap-1 text-sm text-brown-500 hover:text-brown-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            {backLabel ?? "Back"}
          </button>
        ) : <div />}
        {headerStats && <span className="text-xs text-brown-400 font-medium">{headerStats}</span>}
      </div>

      {/* Map scroll container */}
      <div
        ref={scrollRef}
        className="overflow-y-auto overflow-x-hidden rounded-2xl"
        style={{ height: "calc(100vh - 180px)" }}
      >
        <div
          className="relative"
          style={{
            width: W,
            height: H,
            margin: "0 auto",
            backgroundImage: `url(/images/bg-map-${locale}.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Gradient fallback (shows behind if image missing) */}
          <div className="absolute inset-0" style={{ background: GRADIENTS[locale] ?? GRADIENTS.hy, zIndex: 0 }} />
          {/* Image overlay if present */}
          <div className="absolute inset-0" style={{ backgroundImage: `url(/images/bg-map-${locale}.jpg)`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 1 }} />
          {/* Top overlay */}
          <div className="absolute inset-x-0 top-0 h-1/3" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 100%)", zIndex: 2 }} />
          {/* Bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/4" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 100%)", zIndex: 2 }} />

          {/* SVG layer */}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0" style={{ zIndex: 3, fontFamily: "inherit" }}>
            {/* Summit label */}
            <g transform={`translate(${W / 2}, 42)`}>
              <rect x="-70" y="-14" width="140" height="28" rx="14" fill="rgba(255,255,255,0.85)" />
              <text x="0" y="5" textAnchor="middle" fontSize="12" fontWeight="700" fill="#333">{theme.summitEmoji} {summitLabel}</text>
            </g>

            {subtitle && (
              <text x={W / 2} y={70} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.7)">{subtitle}</text>
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
                    <circle cx="0" cy="0" r="36" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                  )}
                  {status === "in_progress" && (
                    <circle cx="0" cy="0" r="36" fill="none" stroke={theme.accent} strokeWidth="4"
                      strokeDasharray={`${pct * 226} ${226 - pct * 226}`}
                      strokeDashoffset="56.5" strokeLinecap="round"
                    />
                  )}

                  {/* Node card */}
                  <rect x="-30" y="-30" width="60" height="60" rx="14"
                    fill={status === "locked" ? "rgba(255,255,255,0.55)" : "white"}
                    stroke={status === "completed" ? "#2D8B4E" : status === "locked" ? "#999" : theme.accent}
                    strokeWidth="3"
                  />

                  {/* Icon inside */}
                  {status === "locked" ? (
                    <g transform="translate(-8, -8)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
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
                    <g transform="translate(-12, -12)" color={theme.accent}>
                      <Icon size={24} />
                    </g>
                  )}

                  {/* Star badge for completed */}
                  {status === "completed" && (
                    <g transform="translate(18, -26)">
                      <circle r="10" fill="#FFD700" stroke="white" strokeWidth="2" />
                      <text x="0" y="4" textAnchor="middle" fontSize="11">{"\u2B50"}</text>
                    </g>
                  )}

                  {/* Label below */}
                  {status !== "locked" && (
                    <g transform="translate(0, 48)">
                      <text x="0" y="0" textAnchor="middle" fontSize="11" fontWeight="700" fill="white"
                        style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.3)" }}>
                        {node.title}
                      </text>
                      <text x="0" y="14" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.8)"
                        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                        {node.completedLessons}/{node.totalLessons} lessons
                      </text>
                    </g>
                  )}

                  {/* Pulse for current */}
                  {status === "current" && (
                    <circle cx="0" cy="0" r="30" fill="none" stroke={theme.accent} strokeWidth="2" opacity="0.5">
                      <animate attributeName="r" from="30" to="42" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Bottom detail sheet */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSelected(null)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl p-6 max-w-[420px] mx-auto"
            style={{ animation: "slideUp 0.25s ease-out" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">{selected.title}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              {selected.completedLessons}/{selected.totalLessons} lessons completed
            </p>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all" style={{
                width: `${selected.totalLessons > 0 ? (selected.completedLessons / selected.totalLessons) * 100 : 0}%`,
                backgroundColor: theme.accent,
              }} />
            </div>
            <button onClick={handleGo}
              className="w-full py-3 rounded-xl text-white font-semibold text-base transition-colors"
              style={{ backgroundColor: theme.accent }}>
              {getStatus(selected) === "completed" ? "Review" : "Continue"}
            </button>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
