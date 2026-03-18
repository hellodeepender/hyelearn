/**
 * DiasporaLearn — Deterministic Alphabet Seeder
 * scripts/seed-alphabet-deterministic.ts
 *
 * Seeds alphabet lessons strictly sequentially so each API call
 * sees previously inserted letters in its exclusion query.
 *
 * Usage:
 *   npx tsx scripts/seed-alphabet-deterministic.ts
 *   npx tsx scripts/seed-alphabet-deterministic.ts --locale=el
 *   npx tsx scripts/seed-alphabet-deterministic.ts --locale=hy
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - SEED_API_KEY in .env.local
 *   - BASE_URL in .env.local (default: https://hyelearn.com)
 *   - Running server at BASE_URL
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// ── Args ─────────────────────────────────────────────────────
const args = process.argv.slice(2);
const localeArg = args.find((a) => a.startsWith("--locale="))?.split("=")[1];

// ── Config ───────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SEED_KEY = process.env.SEED_API_KEY!;
const BASE_URL = process.env.BASE_URL || "https://hyelearn.com";
const CONTENT_DELAY_MS = 3000;
const EXERCISE_DELAY_MS = 500;

if (!SUPABASE_URL || !SERVICE_KEY || !SEED_KEY) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_API_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Types ────────────────────────────────────────────────────
interface LessonRow {
  id: string;
  slug: string;
  title: string;
  template_type: string;
  sort_order: number;
  unit_id: string;
  curriculum_units: {
    id: string;
    slug: string;
    title: string;
    sort_order: number;
    level_id: string;
    curriculum_levels: {
      id: string;
      slug: string;
      title: string;
      sort_order: number;
      locale: string;
    };
  };
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔤 Deterministic Alphabet Seeder`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Locale:   ${localeArg ?? "all"}\n`);

  // Fetch all alphabet + review/quiz lessons in alphabet units
  const { data: allLessons, error } = await db
    .from("curriculum_lessons")
    .select(`
      id, slug, title, template_type, sort_order, unit_id,
      curriculum_units!inner(
        id, slug, title, sort_order, level_id,
        curriculum_levels!inner(id, slug, title, sort_order, locale)
      )
    `)
    .eq("is_active", true)
    .order("sort_order");

  if (error || !allLessons) {
    console.error("Failed to fetch lessons:", error?.message);
    process.exit(1);
  }

  const lessons = (allLessons as unknown as LessonRow[])
    .sort((a, b) => {
      const aL = a.curriculum_units.curriculum_levels;
      const bL = b.curriculum_units.curriculum_levels;
      if (aL.locale !== bL.locale) return aL.locale.localeCompare(bL.locale);
      if (aL.sort_order !== bL.sort_order) return aL.sort_order - bL.sort_order;
      if (a.curriculum_units.sort_order !== b.curriculum_units.sort_order)
        return a.curriculum_units.sort_order - b.curriculum_units.sort_order;
      return a.sort_order - b.sort_order;
    });

  // Filter to locale
  const filtered = localeArg
    ? lessons.filter((l) => l.curriculum_units.curriculum_levels.locale === localeArg)
    : lessons;

  // Find alphabet units (units that contain at least one alphabet lesson)
  const alphabetUnitIds = new Set(
    filtered.filter((l) => l.template_type === "alphabet").map((l) => l.unit_id)
  );

  // Get alphabet lessons and review/quiz lessons in those units
  const alphabetLessons = filtered.filter(
    (l) => l.template_type === "alphabet" && alphabetUnitIds.has(l.unit_id)
  );
  const aggregateLessons = filtered.filter(
    (l) => (l.template_type === "review" || l.template_type === "quiz") && alphabetUnitIds.has(l.unit_id)
  );

  console.log(`📊 Found ${alphabetLessons.length} alphabet lessons + ${aggregateLessons.length} review/quiz in alphabet units\n`);

  if (alphabetLessons.length === 0) {
    console.log("No alphabet lessons found. Exiting.");
    return;
  }

  // ── Phase 0: Clean slate ───────────────────────────────────
  console.log("═══ Phase 0: Cleaning existing alphabet content ═══\n");

  const alphabetLessonIds = alphabetLessons.map((l) => l.id);
  const alphabetUnitLessonIds = [...alphabetLessonIds, ...aggregateLessons.map((l) => l.id)];

  // Delete exercises for all lessons in alphabet units
  const { error: delExErr } = await db
    .from("curated_exercises")
    .delete()
    .in("lesson_id", alphabetUnitLessonIds);
  if (delExErr) console.error("  Warning: exercise delete error:", delExErr.message);
  else console.log(`  🗑  Deleted exercises for ${alphabetUnitLessonIds.length} lessons`);

  // Delete content_items for alphabet lessons
  const { error: delCiErr } = await db
    .from("content_items")
    .delete()
    .in("lesson_id", alphabetLessonIds);
  if (delCiErr) console.error("  Warning: content_items delete error:", delCiErr.message);
  else console.log(`  🗑  Deleted content_items for ${alphabetLessonIds.length} alphabet lessons`);

  console.log("");

  // ── Phase 1: Seed alphabet content (strictly sequential) ───
  console.log("═══ Phase 1: Seeding alphabet content (sequential) ═══\n");

  let contentSuccesses = 0;
  let contentFailures = 0;

  for (const lesson of alphabetLessons) {
    const unit = lesson.curriculum_units;
    const level = unit.curriculum_levels;
    const label = `[${level.locale}] ${level.title} > ${unit.title} > ${lesson.title}`;

    try {
      // Call autofill API
      const res = await fetch(`${BASE_URL}/api/autofill-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: SEED_KEY,
          templateType: "alphabet",
          lessonTitle: lesson.title,
          lessonDescription: "",
          unitTitle: unit.title,
          levelTitle: level.title,
          lessonId: lesson.id,
          unitId: unit.id,
          locale: level.locale,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`API ${res.status}: ${(err as Record<string, string>).error ?? "unknown"}`);
      }

      const data = await res.json();
      const items = data.items ?? [];

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("No items returned from API");
      }

      // Insert content_items IMMEDIATELY so next call sees them
      const rows = items.map((item: Record<string, unknown>, i: number) => ({
        unit_id: unit.id,
        lesson_id: lesson.id,
        item_type: "letter",
        sort_order: i + 1,
        item_data: item,
        created_by: null,
      }));

      const { error: insertErr } = await db.from("content_items").insert(rows);
      if (insertErr) throw new Error(`Insert failed: ${insertErr.message}`);

      // Log the letters that were seeded
      const letterNames = items.map((i: Record<string, string>) => `${i.letter_upper}${i.letter_lower}`).join(" ");
      console.log(`  ✅ ${label}: ${items.length} letters (${letterNames})`);
      contentSuccesses++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ ${label}: ${msg}`);
      contentFailures++;
    }

    // Wait before next call so the DB write is visible to the next exclusion query
    await sleep(CONTENT_DELAY_MS);
  }

  console.log(`\n   Content: ${contentSuccesses} success, ${contentFailures} failed\n`);

  // ── Phase 2: Generate exercises for alphabet lessons ───────
  console.log("═══ Phase 2: Generating alphabet exercises ═══\n");

  let exerciseSuccesses = 0;
  let exerciseFailures = 0;

  for (const lesson of alphabetLessons) {
    const unit = lesson.curriculum_units;
    const level = unit.curriculum_levels;
    const label = `[${level.locale}] ${level.title} > ${unit.title} > ${lesson.title}`;

    try {
      const res = await fetch(`${BASE_URL}/api/generate-lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lesson.id, key: SEED_KEY }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`API ${res.status}: ${(err as Record<string, string>).error ?? "unknown"}`);
      }

      const data = await res.json();
      console.log(`  ✅ ${label}: ${data.count ?? 0} exercises`);
      exerciseSuccesses++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ ${label}: ${msg}`);
      exerciseFailures++;
    }

    await sleep(EXERCISE_DELAY_MS);
  }

  // ── Phase 3: Generate review/quiz exercises ────────────────
  console.log("\n═══ Phase 3: Generating review/quiz for alphabet units ═══\n");

  for (const lesson of aggregateLessons) {
    const unit = lesson.curriculum_units;
    const level = unit.curriculum_levels;
    const label = `[${level.locale}] ${level.title} > ${unit.title} > ${lesson.title}`;

    try {
      const res = await fetch(`${BASE_URL}/api/generate-lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lesson.id, key: SEED_KEY }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`API ${res.status}: ${(err as Record<string, string>).error ?? "unknown"}`);
      }

      const data = await res.json();
      console.log(`  ✅ ${label}: ${data.count ?? 0} exercises`);
      exerciseSuccesses++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ ${label}: ${msg}`);
      exerciseFailures++;
    }

    await sleep(EXERCISE_DELAY_MS);
  }

  // ── Summary ────────────────────────────────────────────────
  console.log(`\n✨ Done!`);
  console.log(`   Content:   ${contentSuccesses} seeded, ${contentFailures} failed`);
  console.log(`   Exercises: ${exerciseSuccesses} generated, ${exerciseFailures} failed`);
  console.log(`   Total lessons processed: ${contentSuccesses + contentFailures + aggregateLessons.length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
