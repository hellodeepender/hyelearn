"use client";

// Greek cultural icons
export function Amphora({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3h8M9 3v2c0 2-3 4-3 8 0 3 1.5 5 3 6h6c1.5-1 3-3 3-6 0-4-3-6-3-8V3" />
      <path d="M7 13c-2-1-3 0-3 2s1 3 3 3M17 13c2-1 3 0 3 2s-1 3-3 3" />
      <line x1="9" y1="19" x2="15" y2="19" />
    </svg>
  );
}

export function SpartanHelmet({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8 2 5 5 5 9v4c0 2 1 4 3 5l1 1h6l1-1c2-1 3-3 3-5V9c0-4-3-7-7-7z" />
      <path d="M5 12h14" />
      <path d="M9 19v2M15 19v2" />
      <path d="M12 2v10" />
    </svg>
  );
}

export function LaurelWreath({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 20c1-3 2-6 4-8 1-1 2-3 3-6" />
      <path d="M19 20c-1-3-2-6-4-8-1-1-2-3-3-6" />
      <path d="M3 16c2 0 3-1 4-3M7 12c1 1 3 0 4-2M9 7c1 1 2 0 3-1" />
      <path d="M21 16c-2 0-3-1-4-3M17 12c-1 1-3 0-4-2M15 7c-1 1-2 0-3-1" />
      <circle cx="12" cy="21" r="1" />
    </svg>
  );
}

export function OlympicTorch({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c-2 3-3 4-3 6s1 3 3 3 3-1 3-3-1-3-3-6z" />
      <line x1="12" y1="11" x2="12" y2="22" />
      <path d="M9 14h6M10 22h4" />
      <line x1="10" y1="17" x2="14" y2="17" />
    </svg>
  );
}

export function GreekColumns({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="3" rx="1" />
      <rect x="3" y="19" width="18" height="2" rx="1" />
      <line x1="6" y1="6" x2="6" y2="19" />
      <line x1="12" y1="6" x2="12" y2="19" />
      <line x1="18" y1="6" x2="18" y2="19" />
    </svg>
  );
}

export function Lyre({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22c0-6-3-8-3-14C5 4 8 2 12 2s7 2 7 6c0 6-3 8-3 14" />
      <line x1="8" y1="22" x2="16" y2="22" />
      <line x1="10" y1="8" x2="10" y2="18" />
      <line x1="12" y1="6" x2="12" y2="18" />
      <line x1="14" y1="8" x2="14" y2="18" />
    </svg>
  );
}

// Armenian cultural icons
export function Pomegranate({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 5V2M10 3h4" />
      <circle cx="10" cy="12" r="1.5" />
      <circle cx="14" cy="12" r="1.5" />
      <circle cx="12" cy="15.5" r="1.5" />
    </svg>
  );
}

export function Khachkar({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="7" y1="10" x2="17" y2="10" />
      <path d="M9 7l3-2 3 2M9 13l3 2 3-2" />
    </svg>
  );
}

export function Duduk({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2l2 4v14c0 1 1 2 2 2h4c1 0 2-1 2-2V6l2-4" />
      <line x1="10" y1="10" x2="10" y2="10.01" />
      <line x1="10" y1="14" x2="10" y2="14.01" />
      <line x1="14" y1="12" x2="14" y2="12.01" />
    </svg>
  );
}

export function MountArarat({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20L8 8l4 6 4-12 4 18H2z" />
      <path d="M14 4l1.5 4.5" />
      <path d="M12 6l-1 3" />
    </svg>
  );
}

export function GarniTemple({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10" />
      <path d="M2 10l10-7 10 7" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function Lavash({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="9" ry="6" />
      <path d="M7 10c1 1 3 1 5 0s4-1 5 0" />
      <path d="M8 14c2-1 4-1 6 0" />
    </svg>
  );
}

// Icon sets by locale
const GREEK_ICONS = [Amphora, SpartanHelmet, LaurelWreath, OlympicTorch, GreekColumns, Lyre];
const ARMENIAN_ICONS = [Pomegranate, Khachkar, Duduk, MountArarat, GarniTemple, Lavash];

export function getIconSet(locale: string) {
  return locale === "el" ? GREEK_ICONS : ARMENIAN_ICONS;
}
