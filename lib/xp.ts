import type { SupabaseClient } from "@supabase/supabase-js";
import { BADGES } from "./badges";

// --- XP values ---
export const XP = {
  LESSON_COMPLETE: 10,
  REVIEW_COMPLETE: 10,
  QUIZ_PASS: 25,
  PERFECT_BONUS: 5,
  STREAK_DAY: 2,
} as const;

// --- Climb levels ---
export interface AraratLevel {
  level: number;
  name: string;
  emoji: string;
  minXP: number;
  maxXP: number;
}

// Armenian: Climb Ararat
export const LEVELS_HY: AraratLevel[] = [
  { level: 1, name: "Base Camp", emoji: "\u26FA", minXP: 0, maxXP: 49 },
  { level: 2, name: "Foothills", emoji: "\uD83C\uDF3F", minXP: 50, maxXP: 149 },
  { level: 3, name: "Mountain Path", emoji: "\uD83E\uDDF1", minXP: 150, maxXP: 299 },
  { level: 4, name: "Cloud Line", emoji: "\u2601\uFE0F", minXP: 300, maxXP: 499 },
  { level: 5, name: "Snow Line", emoji: "\u2744\uFE0F", minXP: 500, maxXP: 799 },
  { level: 6, name: "Summit Ridge", emoji: "\uD83C\uDFD4\uFE0F", minXP: 800, maxXP: 1199 },
  { level: 7, name: "Summit", emoji: "\uD83D\uDC51", minXP: 1200, maxXP: Infinity },
];

// Greek: Climb Olympus
export const LEVELS_EL: AraratLevel[] = [
  { level: 1, name: "\u039B\u03B9\u03C4\u03CC\u03C7\u03C9\u03C1\u03BF", emoji: "\u26FA", minXP: 0, maxXP: 49 },
  { level: 2, name: "Forest Trail", emoji: "\uD83C\uDF33", minXP: 50, maxXP: 149 },
  { level: 3, name: "Prionia Spring", emoji: "\uD83D\uDCA7", minXP: 150, maxXP: 299 },
  { level: 4, name: "Refuge A", emoji: "\uD83C\uDFE0", minXP: 300, maxXP: 499 },
  { level: 5, name: "Throne of Zeus", emoji: "\u26A1", minXP: 500, maxXP: 799 },
  { level: 6, name: "Mytikas Ridge", emoji: "\u26F0\uFE0F", minXP: 800, maxXP: 1199 },
  { level: 7, name: "Mytikas Summit", emoji: "\uD83D\uDC51", minXP: 1200, maxXP: Infinity },
];

// Backward compat
export const ARARAT_LEVELS = LEVELS_HY;

// Locale-aware accessors
const LEVELS_MAP: Record<string, AraratLevel[]> = { hy: LEVELS_HY, el: LEVELS_EL };

export function getClimbLevels(locale: string): AraratLevel[] {
  return LEVELS_MAP[locale] ?? LEVELS_HY;
}

export const CLIMB_NAMES: Record<string, string> = {
  hy: "Climb Ararat \uD83C\uDFD4\uFE0F",
  el: "Climb Olympus \u26F0\uFE0F",
};

export function getCurrentLevel(totalXP: number, locale?: string): AraratLevel {
  const levels = locale ? getClimbLevels(locale) : LEVELS_HY;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalXP >= levels[i].minXP) return levels[i];
  }
  return levels[0];
}

export function getProgressToNextLevel(totalXP: number, locale?: string) {
  const levels = locale ? getClimbLevels(locale) : LEVELS_HY;
  const current = getCurrentLevel(totalXP, locale);
  const nextIdx = levels.findIndex((l) => l.level === current.level) + 1;
  const next = nextIdx < levels.length ? levels[nextIdx] : null;
  if (!next) return { current, next: null, percentage: 100, xpInLevel: 0, xpNeeded: 0 };
  const xpInLevel = totalXP - current.minXP;
  const xpNeeded = next.minXP - current.minXP;
  return { current, next, percentage: Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)), xpInLevel, xpNeeded };
}

// --- Award XP (idempotent per source_id) ---
export async function awardXP(
  db: SupabaseClient,
  studentId: string,
  amount: number,
  source: string,
  sourceId?: string,
): Promise<number> {
  // Skip if already awarded for this source
  if (sourceId) {
    const { data: existing } = await db
      .from("student_xp")
      .select("id")
      .eq("student_id", studentId)
      .eq("source", source)
      .eq("source_id", sourceId)
      .limit(1);
    if (existing && existing.length > 0) return -1; // already awarded
  }

  await db.from("student_xp").insert({
    student_id: studentId,
    xp_amount: amount,
    source,
    source_id: sourceId ?? null,
  });

  // Increment denormalized total
  const { data: profile } = await db
    .from("profiles")
    .select("total_xp")
    .eq("id", studentId)
    .single();
  const newTotal = (profile?.total_xp ?? 0) + amount;
  await db.from("profiles").update({ total_xp: newTotal }).eq("id", studentId);
  return newTotal;
}

// --- Process rewards after lesson completion ---
export async function processLessonRewards(
  db: SupabaseClient,
  studentId: string,
  lessonId: string,
  lessonType: string,
  passed: boolean,
  pct: number,
  streak: number,
): Promise<{ xpEarned: number; newBadges: string[]; newTotal: number; leveledUp: boolean }> {
  let xpEarned = 0;
  const oldProfile = await db.from("profiles").select("total_xp").eq("id", studentId).single();
  const oldTotal = oldProfile?.data?.total_xp ?? 0;
  const oldLevel = getCurrentLevel(oldTotal);

  // Base XP
  if (lessonType === "quiz" && passed) {
    const r = await awardXP(db, studentId, XP.QUIZ_PASS, "quiz_pass", lessonId);
    if (r !== -1) xpEarned += XP.QUIZ_PASS;
  } else if (lessonType === "review") {
    const r = await awardXP(db, studentId, XP.REVIEW_COMPLETE, "review_complete", lessonId);
    if (r !== -1) xpEarned += XP.REVIEW_COMPLETE;
  } else if (passed) {
    const r = await awardXP(db, studentId, XP.LESSON_COMPLETE, "lesson_complete", lessonId);
    if (r !== -1) xpEarned += XP.LESSON_COMPLETE;
  }

  // Perfect score bonus
  if (pct === 100) {
    const r = await awardXP(db, studentId, XP.PERFECT_BONUS, "perfect_score", lessonId);
    if (r !== -1) xpEarned += XP.PERFECT_BONUS;
  }

  // Streak XP (once per day)
  if (streak > 0) {
    const today = new Date().toISOString().split("T")[0];
    const { data: todayXP } = await db
      .from("student_xp")
      .select("id")
      .eq("student_id", studentId)
      .eq("source", "streak_day")
      .gte("created_at", today)
      .limit(1);
    if (!todayXP || todayXP.length === 0) {
      await awardXP(db, studentId, XP.STREAK_DAY, "streak_day");
      xpEarned += XP.STREAK_DAY;
    }
  }

  // Check badges
  const newBadges = await checkAndAwardBadges(db, studentId, streak);

  const newProfile = await db.from("profiles").select("total_xp").eq("id", studentId).single();
  const newTotal = newProfile?.data?.total_xp ?? oldTotal + xpEarned;
  const newLevel = getCurrentLevel(newTotal);
  const leveledUp = newLevel.level > oldLevel.level;

  return { xpEarned, newBadges, newTotal, leveledUp };
}

// --- Check and award badges ---
export async function checkAndAwardBadges(
  db: SupabaseClient,
  studentId: string,
  streak: number,
): Promise<string[]> {
  // Get existing badges
  const { data: existing } = await db
    .from("student_badges")
    .select("badge_slug")
    .eq("student_id", studentId);
  const earned = new Set((existing ?? []).map((b) => b.badge_slug));

  // Get progress stats
  const { data: progress } = await db
    .from("student_progress")
    .select("lesson_id, passed, score, total, curriculum_lessons!inner(lesson_type, unit_id, curriculum_units!inner(level_id, curriculum_levels!inner(slug)))")
    .eq("student_id", studentId);

  const passedLessons = (progress ?? []).filter((p) => p.passed);
  const newBadges: string[] = [];

  async function tryAward(slug: string) {
    if (earned.has(slug)) return;
    await db.from("student_badges").insert({ student_id: studentId, badge_slug: slug }).select().maybeSingle();
    newBadges.push(slug);
  }

  for (const badge of BADGES) {
    if (earned.has(badge.slug)) continue;

    switch (badge.condition) {
      case "first_lesson":
        if (passedLessons.length >= 1) await tryAward(badge.slug);
        break;
      case "lessons_10":
        if (passedLessons.length >= 10) await tryAward(badge.slug);
        break;
      case "alphabet_complete": {
        const alphabetLessons = passedLessons.filter((p) => {
          const unit = p.curriculum_lessons as unknown as { unit_id: string; curriculum_units: { level_id: string; curriculum_levels: { slug: string } } };
          return unit.curriculum_units.curriculum_levels.slug === "kindergarten";
        });
        // Check if they passed at least 3 alphabet lessons (one unit of alphabet)
        const alphabetTypes = passedLessons.filter((p) => {
          const l = p.curriculum_lessons as unknown as { lesson_type: string };
          return l.lesson_type === "alphabet" || l.lesson_type === "lesson";
        });
        if (alphabetLessons.length >= 3 && alphabetTypes.length >= 3) await tryAward(badge.slug);
        break;
      }
      case "perfect_quiz": {
        const perfectQuiz = (progress ?? []).some((p) => {
          const l = p.curriculum_lessons as unknown as { lesson_type: string };
          return l.lesson_type === "quiz" && p.total > 0 && p.score === p.total;
        });
        if (perfectQuiz) await tryAward(badge.slug);
        break;
      }
      case "kindergarten_complete": {
        // All lessons in kindergarten level are passed
        const { data: kLessons } = await db
          .from("curriculum_lessons")
          .select("id, curriculum_units!inner(curriculum_levels!inner(slug))")
          .eq("is_active", true);
        const kIds = (kLessons ?? [])
          .filter((l) => (l.curriculum_units as unknown as { curriculum_levels: { slug: string } }).curriculum_levels.slug === "kindergarten")
          .map((l) => l.id);
        const passedIds = new Set(passedLessons.map((p) => p.lesson_id));
        if (kIds.length > 0 && kIds.every((id) => passedIds.has(id))) await tryAward(badge.slug);
        break;
      }
      case "grade_complete": {
        // All lessons in any single grade level are passed
        const { data: allLessons } = await db
          .from("curriculum_lessons")
          .select("id, curriculum_units!inner(level_id)")
          .eq("is_active", true);
        const passedIds = new Set(passedLessons.map((p) => p.lesson_id));
        const byLevel = new Map<string, string[]>();
        for (const l of allLessons ?? []) {
          const levelId = (l.curriculum_units as unknown as { level_id: string }).level_id;
          if (!byLevel.has(levelId)) byLevel.set(levelId, []);
          byLevel.get(levelId)!.push(l.id);
        }
        for (const [, ids] of byLevel) {
          if (ids.length > 0 && ids.every((id) => passedIds.has(id))) {
            await tryAward(badge.slug);
            break;
          }
        }
        break;
      }
      case "streak_7":
        if (streak >= 7) await tryAward(badge.slug);
        break;
      case "streak_30":
        if (streak >= 30) await tryAward(badge.slug);
        break;
      case "streak_100":
        if (streak >= 100) await tryAward(badge.slug);
        break;
    }
  }

  return newBadges;
}
