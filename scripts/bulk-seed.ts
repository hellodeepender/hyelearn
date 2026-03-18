/**
 * DiasporaLearn — Bulk Content Seeder
 * scripts/bulk-seed.ts
 *
 * Seeds ALL lessons with AI-generated content and exercises.
 *
 * Usage:
 *   npx tsx scripts/bulk-seed.ts
 *   npx tsx scripts/bulk-seed.ts --locale=el
 *   npx tsx scripts/bulk-seed.ts --dry-run
 *   npx tsx scripts/bulk-seed.ts --skip-existing
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - SEED_API_KEY in .env.local
 *   - BASE_URL in .env.local (default: https://hyelearn.com)
 *   - Running server at BASE_URL (npm run dev or production)
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// ── Args ─────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const skipExisting = args.includes("--skip-existing");
const localeArg = args.find((a) => a.startsWith("--locale="))?.split("=")[1];

// ── Config ───────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SEED_KEY = process.env.SEED_API_KEY!;
const BASE_URL = process.env.BASE_URL || "https://hyelearn.com";
const DELAY_MS = 2000;

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

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌱 DiasporaLearn Bulk Seeder`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Locale:   ${localeArg ?? "all"}`);
  console.log(`   Dry run:  ${dryRun}`);
  console.log(`   Skip existing: ${skipExisting}\n`);

  // Fetch all lessons with unit + level info
  const { data: lessons, error } = await db
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

  if (error || !lessons) {
    console.error("Failed to fetch lessons:", error?.message);
    process.exit(1);
  }

  // Type helper
  type LessonRow = typeof lessons[0] & {
    curriculum_units: {
      id: string; slug: string; title: string; sort_order: number; level_id: string;
      curriculum_levels: { id: string; slug: string; title: string; sort_order: number; locale: string };
    };
  };

  // Sort by locale, level, unit, lesson
  const sorted = (lessons as unknown as LessonRow[]).sort((a, b) => {
    const aU = a.curriculum_units;
    const bU = b.curriculum_units;
    const aL = aU.curriculum_levels;
    const bL = bU.curriculum_levels;
    if (aL.locale !== bL.locale) return aL.locale.localeCompare(bL.locale);
    if (aL.sort_order !== bL.sort_order) return aL.sort_order - bL.sort_order;
    if (aU.sort_order !== bU.sort_order) return aU.sort_order - bU.sort_order;
    return a.sort_order - b.sort_order;
  });

  // Filter by locale
  const filtered = localeArg
    ? sorted.filter((l) => l.curriculum_units.curriculum_levels.locale === localeArg)
    : sorted;

  // Separate practice and aggregate lessons
  const practice = filtered.filter((l) => l.template_type === "alphabet" || l.template_type === "vocabulary");
  const aggregate = filtered.filter((l) => l.template_type === "review" || l.template_type === "quiz");

  console.log(`📊 Found ${filtered.length} lessons: ${practice.length} practice + ${aggregate.length} review/quiz\n`);

  // Check which lessons already have content
  let existingSet = new Set<string>();
  if (skipExisting) {
    const { data: existing } = await db
      .from("content_items")
      .select("lesson_id")
      .limit(50000);
    existingSet = new Set((existing ?? []).map((r) => r.lesson_id));
  }

  let successes = 0;
  let failures = 0;
  let skipped = 0;

  // ── Phase 1: Practice lessons (content + exercises) ────────
  console.log("═══ Phase 1: Practice Lessons ═══\n");

  for (const lesson of practice) {
    const unit = lesson.curriculum_units;
    const level = unit.curriculum_levels;
    const label = `[${level.locale}] ${level.title} > ${unit.title} > ${lesson.title}`;

    if (skipExisting && existingSet.has(lesson.id)) {
      console.log(`  ⏭  ${label} (already has content)`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`  📋 ${label} (${lesson.template_type})`);
      continue;
    }

    try {
      // Step 1: Autofill content
      const autofillRes = await fetch(`${BASE_URL}/api/autofill-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: SEED_KEY,
          templateType: lesson.template_type,
          lessonTitle: lesson.title,
          lessonDescription: "",
          unitTitle: unit.title,
          levelTitle: level.title,
          lessonId: lesson.id,
          unitId: unit.id,
          locale: level.locale,
        }),
      });

      if (!autofillRes.ok) {
        const err = await autofillRes.json().catch(() => ({}));
        throw new Error(`Autofill failed: ${(err as Record<string, string>).error ?? autofillRes.status}`);
      }

      const autofillData = await autofillRes.json();
      const items = autofillData.items ?? [];

      // Insert content_items
      await db.from("content_items").delete().eq("lesson_id", lesson.id);

      const contentRows: Record<string, unknown>[] = [];
      let sortOrder = 1;

      // Words
      for (const item of items) {
        const itemType = lesson.template_type === "alphabet" ? "letter" : "word";
        contentRows.push({
          unit_id: unit.id, lesson_id: lesson.id, item_type: itemType,
          sort_order: sortOrder++, item_data: item, created_by: null,
        });
      }
      // Phrases
      for (const p of autofillData.phrases ?? []) {
        contentRows.push({
          unit_id: unit.id, lesson_id: lesson.id, item_type: "phrase",
          sort_order: sortOrder++, item_data: p, created_by: null,
        });
      }
      // Reading passage
      if (autofillData.reading_passage) {
        contentRows.push({
          unit_id: unit.id, lesson_id: lesson.id, item_type: "reading_passage",
          sort_order: sortOrder++, item_data: autofillData.reading_passage, created_by: null,
        });
      }
      // Grammar note
      if (autofillData.grammar_note) {
        contentRows.push({
          unit_id: unit.id, lesson_id: lesson.id, item_type: "grammar_note",
          sort_order: sortOrder++, item_data: autofillData.grammar_note, created_by: null,
        });
      }
      // Composition prompt
      if (autofillData.composition_prompt) {
        contentRows.push({
          unit_id: unit.id, lesson_id: lesson.id, item_type: "composition_prompt",
          sort_order: sortOrder++, item_data: autofillData.composition_prompt, created_by: null,
        });
      }
      // Discussion questions
      for (const dq of autofillData.discussion_questions ?? []) {
        contentRows.push({
          unit_id: unit.id, lesson_id: lesson.id, item_type: "discussion_question",
          sort_order: sortOrder++, item_data: dq, created_by: null,
        });
      }

      if (contentRows.length > 0) {
        const { error: insertErr } = await db.from("content_items").insert(contentRows);
        if (insertErr) throw new Error(`Insert content failed: ${insertErr.message}`);
      }

      // Step 2: Generate exercises
      const genRes = await fetch(`${BASE_URL}/api/generate-lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lesson.id, key: SEED_KEY }),
      });

      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({}));
        throw new Error(`Generate failed: ${(err as Record<string, string>).error ?? genRes.status}`);
      }

      const genData = await genRes.json();
      console.log(`  ✅ ${label} (${contentRows.length} items, ${genData.count ?? 0} exercises)`);
      successes++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ ${label}: ${msg}`);
      failures++;
    }

    await sleep(DELAY_MS);
  }

  // ── Phase 2: Review/Quiz lessons (exercises only) ──────────
  console.log("\n═══ Phase 2: Review/Quiz Lessons ═══\n");

  for (const lesson of aggregate) {
    const unit = lesson.curriculum_units;
    const level = unit.curriculum_levels;
    const label = `[${level.locale}] ${level.title} > ${unit.title} > ${lesson.title}`;

    if (dryRun) {
      console.log(`  📋 ${label} (${lesson.template_type})`);
      continue;
    }

    try {
      const genRes = await fetch(`${BASE_URL}/api/generate-lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lesson.id, key: SEED_KEY }),
      });

      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({}));
        throw new Error(`Generate failed: ${(err as Record<string, string>).error ?? genRes.status}`);
      }

      const genData = await genRes.json();
      console.log(`  ✅ ${label} (${genData.count ?? 0} exercises)`);
      successes++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ ${label}: ${msg}`);
      failures++;
    }

    // Shorter delay for review/quiz (no AI call needed)
    await sleep(500);
  }

  // ── Summary ────────────────────────────────────────────────
  console.log(`\n✨ Done!`);
  console.log(`   Processed: ${successes + failures + skipped}`);
  console.log(`   Successes: ${successes}`);
  console.log(`   Failures:  ${failures}`);
  if (skipped > 0) console.log(`   Skipped:   ${skipped}`);
  if (dryRun) console.log(`   (Dry run — no changes made)`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
