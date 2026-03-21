export interface Badge {
  slug: string;
  name: string;
  nameTarget: string;
  description: string;
  emoji: string;
  image: string;
  condition: string;
  category: "milestone" | "achievement" | "streak";
  culturalNote?: string;
}

// ── Armenian badges (Ararat-themed) ──────────────────────────
export const BADGES_HY: Badge[] = [
  { slug: "pomegranate", name: "Pomegranate", nameTarget: "\u0546\u0578\u0582\u057C", description: "Completed your first lesson", emoji: "\uD83C\uDF4E", image: "/badges/pomegranate.svg", condition: "first_lesson", category: "milestone", culturalNote: "The pomegranate is a symbol of fertility and good fortune in Armenian culture" },
  { slug: "khachkar", name: "Khachkar", nameTarget: "\u053D\u0561\u0579\u0584\u0561\u0580", description: "Completed the Armenian Alphabet", emoji: "\u271D\uFE0F", image: "/badges/khachkar.svg", condition: "alphabet_complete", category: "milestone", culturalNote: "Khachkars are carved stone crosses unique to Armenian art, dating back over 1,000 years" },
  { slug: "duduk", name: "Duduk", nameTarget: "\u0534\u0578\u0582\u0564\u0578\u0582\u056F", description: "Completed 10 lessons", emoji: "\uD83C\uDFB5", image: "/badges/duduk.svg", condition: "lessons_10", category: "milestone", culturalNote: "The duduk is an ancient Armenian woodwind instrument, a UNESCO masterpiece" },
  { slug: "ararat", name: "Mount Ararat", nameTarget: "\u0531\u0580\u0561\u0580\u0561\u057F", description: "Scored 100% on a quiz", emoji: "\uD83C\uDFD4\uFE0F", image: "/badges/ararat.svg", condition: "perfect_quiz", category: "achievement", culturalNote: "Mount Ararat is the national symbol of Armenia, visible from Yerevan" },
  { slug: "garni", name: "Garni Temple", nameTarget: "\u0533\u0561\u057C\u0576\u056B", description: "Completed all of Kindergarten", emoji: "\uD83C\uDFDB\uFE0F", image: "/badges/garni.svg", condition: "kindergarten_complete", category: "milestone", culturalNote: "Garni Temple is the only standing Greco-Roman temple in Armenia" },
  { slug: "tatev", name: "Tatev Monastery", nameTarget: "\u054F\u0561\u0569\u0587", description: "Completed an entire grade level", emoji: "\u26EA", image: "/badges/tatev.svg", condition: "grade_complete", category: "milestone", culturalNote: "Tatev Monastery was a medieval center of Armenian learning and art" },
  { slug: "streak_7", name: "Week Warrior", nameTarget: "", description: "7-day learning streak", emoji: "\uD83D\uDD25", image: "/badges/streak_7.svg", condition: "streak_7", category: "streak" },
  { slug: "streak_30", name: "Monthly Master", nameTarget: "", description: "30-day learning streak", emoji: "\uD83D\uDCAA", image: "/badges/streak_30.svg", condition: "streak_30", category: "streak" },
  { slug: "streak_100", name: "Century Champion", nameTarget: "", description: "100-day learning streak", emoji: "\uD83D\uDC51", image: "/badges/streak_100.svg", condition: "streak_100", category: "streak" },
];

// ── Greek badges (Olympus-themed) ────────────────────────────
export const BADGES_EL: Badge[] = [
  { slug: "olive_branch", name: "Olive Branch", nameTarget: "\u039A\u03BB\u03B1\u03B4\u03AF \u0395\u03BB\u03B9\u03AC\u03C2", description: "Completed your first lesson", emoji: "\uD83E\uDED2", image: "/badges/olive_branch.svg", condition: "first_lesson", category: "milestone", culturalNote: "In ancient Greece, olive wreaths crowned Olympic champions" },
  { slug: "alpha_omega", name: "Alpha to Omega", nameTarget: "\u0391\u03C0\u03CC \u0391 \u03C9\u03C2 \u03A9", description: "Completed the Greek Alphabet", emoji: "\uD83C\uDFFA", image: "/badges/alpha_omega.svg", condition: "alphabet_complete", category: "milestone", culturalNote: "Alpha (\u0391) and Omega (\u03A9) are the first and last letters of the Greek alphabet" },
  { slug: "lyre", name: "Lyre of Apollo", nameTarget: "\u039B\u03CD\u03C1\u03B1", description: "Completed 10 lessons", emoji: "\uD83C\uDFB6", image: "/badges/lyre.svg", condition: "lessons_10", category: "milestone", culturalNote: "Apollo's lyre was said to produce the most beautiful music in all of Greece" },
  { slug: "olympus", name: "Mount Olympus", nameTarget: "\u038C\u03BB\u03C5\u03BC\u03C0\u03BF\u03C2", description: "Scored 100% on a quiz", emoji: "\u26F0\uFE0F", image: "/badges/olympus.svg", condition: "perfect_quiz", category: "achievement", culturalNote: "Mount Olympus was home to the twelve gods of ancient Greece" },
  { slug: "parthenon", name: "Parthenon", nameTarget: "\u03A0\u03B1\u03C1\u03B8\u03B5\u03BD\u03CE\u03BD\u03B1\u03C2", description: "Completed all of Kindergarten", emoji: "\uD83C\uDFDB\uFE0F", image: "/badges/parthenon.svg", condition: "kindergarten_complete", category: "milestone", culturalNote: "The Parthenon temple in Athens was built nearly 2,500 years ago" },
  { slug: "delphi", name: "Oracle of Delphi", nameTarget: "\u0394\u03B5\u03BB\u03C6\u03BF\u03AF", description: "Completed an entire grade level", emoji: "\uD83D\uDD2E", image: "/badges/delphi.svg", condition: "grade_complete", category: "milestone", culturalNote: "The Oracle at Delphi was the most important shrine in ancient Greece" },
  { slug: "streak_7", name: "Week Warrior", nameTarget: "\u0395\u03B2\u03B4\u03BF\u03BC\u03B1\u03B4\u03B9\u03B1\u03AF\u03BF\u03C2 \u03A0\u03BF\u03BB\u03B5\u03BC\u03B9\u03C3\u03C4\u03AE\u03C2", description: "7-day learning streak", emoji: "\uD83D\uDD25", image: "/badges/streak_7.svg", condition: "streak_7", category: "streak" },
  { slug: "streak_30", name: "Monthly Master", nameTarget: "\u039C\u03B7\u03BD\u03B9\u03B1\u03AF\u03BF\u03C2 \u039C\u03AC\u03C3\u03C4\u03BF\u03C1\u03B1\u03C2", description: "30-day learning streak", emoji: "\uD83D\uDCAA", image: "/badges/streak_30.svg", condition: "streak_30", category: "streak" },
  { slug: "streak_100", name: "Century Champion", nameTarget: "\u03A0\u03C1\u03C9\u03C4\u03B1\u03B8\u03BB\u03B7\u03C4\u03AE\u03C2", description: "100-day learning streak", emoji: "\uD83D\uDC51", image: "/badges/streak_100.svg", condition: "streak_100", category: "streak" },
];

// ── Backward compat ──────────────────────────────────────────
export const BADGES = BADGES_HY;

// ── Locale-aware accessors ───────────────────────────────────
const BADGE_MAP: Record<string, Badge[]> = { hy: BADGES_HY, el: BADGES_EL };

export function getBadges(locale: string): Badge[] {
  return BADGE_MAP[locale] ?? BADGES_HY;
}

export function getBadgeBySlug(slug: string, locale?: string): Badge | undefined {
  const badges = locale ? getBadges(locale) : BADGES_HY;
  const bySlug = badges.find((b) => b.slug === slug);
  if (bySlug) return bySlug;
  const source = locale === "el" ? BADGES_HY : BADGES_EL;
  const sourceBadge = source.find((b) => b.slug === slug);
  if (sourceBadge) {
    return badges.find((b) => b.condition === sourceBadge.condition);
  }
  return undefined;
}
