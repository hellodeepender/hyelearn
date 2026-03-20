/**
 * Fix duplicate multiple-choice options across all exercises.
 *
 * Usage: npx tsx scripts/fix-duplicate-mc-options.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing env vars");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

// Greek letter pool (for alphabet exercises)
const GREEK_LETTERS = [
  "\u0391 \u03B1", "\u0392 \u03B2", "\u0393 \u03B3", "\u0394 \u03B4", "\u0395 \u03B5", "\u0396 \u03B6",
  "\u0397 \u03B7", "\u0398 \u03B8", "\u0399 \u03B9", "\u039A \u03BA", "\u039B \u03BB", "\u039C \u03BC",
  "\u039D \u03BD", "\u039E \u03BE", "\u039F \u03BF", "\u03A0 \u03C0", "\u03A1 \u03C1", "\u03A3 \u03C3",
  "\u03A4 \u03C4", "\u03A5 \u03C5", "\u03A6 \u03C6", "\u03A7 \u03C7", "\u03A8 \u03C8", "\u03A9 \u03C9",
];

const GREEK_LETTER_EN = [
  "\u00E1lfa", "v\u00EDta", "g\u00E1ma", "d\u00E9lta", "\u00E9psilon", "z\u00EDta",
  "\u00EDta", "th\u00EDta", "i\u00F3ta", "k\u00E1pa", "l\u00E1mda", "mi",
  "ni", "ksi", "\u00F3mikron", "pi", "ro", "s\u00EDgma",
  "taf", "\u00FDpsilon", "fi", "chi", "psi", "om\u00E9ga",
];

// Armenian letter pool
const ARMENIAN_LETTERS = [
  "\u0531 \u0561", "\u0532 \u0562", "\u0533 \u0563", "\u0534 \u0564", "\u0535 \u0565",
  "\u0536 \u0566", "\u0537 \u0567", "\u0538 \u0568", "\u0539 \u0569", "\u053A \u056A",
  "\u053B \u056B", "\u053C \u056C", "\u053D \u056D", "\u053E \u056E", "\u053F \u056F",
  "\u0540 \u0570", "\u0541 \u0571", "\u0542 \u0572", "\u0543 \u0573", "\u0544 \u0574",
  "\u0545 \u0575", "\u0546 \u0576", "\u0547 \u0577", "\u0548 \u0578", "\u0549 \u0579",
  "\u054A \u057A", "\u054B \u057B", "\u054C \u057C", "\u054D \u057D", "\u054E \u057E",
  "\u054F \u057F", "\u0550 \u0580", "\u0551 \u0581", "\u0552 \u0582", "\u0553 \u0583",
  "\u0554 \u0584", "\u0555 \u0585", "\u0556 \u0586",
];

const ARMENIAN_LETTER_EN = [
  "ayp", "pen", "kim", "ta", "yech", "za", "eh", "ut", "to", "zhe",
  "ini", "liun", "khe", "dza", "gen", "ho", "tsa", "ghat", "je", "men",
  "yi", "nu", "sha", "vo", "cha", "be", "che", "ra", "se", "vev",
  "diun", "re", "tso", "hiun", "piur", "ke", "o", "fe",
];

// Vocabulary distractor pools (Greek)
const DISTRACTOR_EL = [
  "\u03C3\u03C0\u03AF\u03C4\u03B9", "\u03BD\u03B5\u03C1\u03CC", "\u03B2\u03B9\u03B2\u03BB\u03AF\u03BF",
  "\u03B4\u03C1\u03CC\u03BC\u03BF\u03C2", "\u03B8\u03AC\u03BB\u03B1\u03C3\u03C3\u03B1",
  "\u03BF\u03C5\u03C1\u03B1\u03BD\u03CC\u03C2", "\u03B4\u03AD\u03BD\u03C4\u03C1\u03BF",
  "\u03AE\u03BB\u03B9\u03BF\u03C2", "\u03C0\u03CC\u03C1\u03C4\u03B1",
  "\u03BA\u03B1\u03C1\u03AD\u03BA\u03BB\u03B1", "\u03C4\u03C1\u03B1\u03B3\u03BF\u03CD\u03B4\u03B9",
  "\u03C7\u03C1\u03CE\u03BC\u03B1", "\u03C6\u03C9\u03C4\u03B9\u03AC", "\u03C0\u03BF\u03C5\u03BB\u03AF",
  "\u03C8\u03C9\u03BC\u03AF", "\u03BB\u03BF\u03C5\u03BB\u03BF\u03CD\u03B4\u03B9",
  "\u03B1\u03C3\u03C4\u03AD\u03C1\u03B9", "\u03C6\u03B5\u03B3\u03B3\u03AC\u03C1\u03B9",
  "\u03C3\u03CD\u03BD\u03BD\u03B5\u03C6\u03BF", "\u03C0\u03BF\u03C4\u03AC\u03BC\u03B9",
];

// Vocabulary distractor pools (Armenian)
const DISTRACTOR_HY = [
  "\u057F\u0578\u0582\u0576", "\u057B\u0578\u0582\u0580", "\u0563\u056B\u0580\u0584",
  "\u0573\u0561\u0576\u0561\u057A\u0561\u0580\u0570", "\u056E\u0578\u057E",
  "\u0565\u0580\u056F\u056B\u0576\u0584", "\u056E\u0561\u057C", "\u0561\u0580\u0587",
  "\u0564\u0578\u0582\u057C", "\u0561\u0569\u0578\u057C",
  "\u0565\u0580\u0563", "\u0563\u0578\u0575\u0576", "\u056F\u0580\u0561\u056F",
  "\u0569\u056B\u057C", "\u0570\u0561\u0581", "\u056E\u0561\u0572\u056B\u056F",
  "\u0561\u057D\u057F\u0572", "\u056C\u0578\u0582\u057D\u056B\u0576",
  "\u0561\u0574\u057A", "\u0563\u0565\u057F\u056B\u0576",
];

const DISTRACTOR_EN = [
  "house", "water", "book", "road", "sea", "sky", "tree", "sun",
  "door", "chair", "song", "color", "fire", "bird", "bread", "flower",
  "star", "moon", "cloud", "river",
];

interface Option {
  id: string;
  text_hy: string;
  text_en: string;
  correct: boolean;
}

interface ExerciseRow {
  id: string;
  exercise_data: {
    options?: Option[];
    question_en?: string;
    [key: string]: unknown;
  };
  lesson_id: string;
}

function isAlphabetExercise(data: ExerciseRow["exercise_data"]): boolean {
  const q = (data.question_en ?? "").toLowerCase();
  return q.includes("letter") || q.includes("sound");
}

function pickDistractor(existing: Set<string>, pool: string[]): string {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (const item of shuffled) {
    if (!existing.has(item)) return item;
  }
  return pool[Math.floor(Math.random() * pool.length)] + "\u200B"; // zero-width space to force unique
}

async function main() {
  console.log("\n\uD83D\uDD27 Fix duplicate MC options\n");

  // Fetch ALL multiple_choice exercises (paginate past 1000 limit)
  const allExercises: ExerciseRow[] = [];
  let page = 0;
  const pageSize = 1000;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error: fetchErr } = await db
      .from("curated_exercises")
      .select("id, exercise_data, lesson_id")
      .eq("exercise_type", "multiple_choice")
      .eq("status", "approved")
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (fetchErr) { console.error("Fetch error:", fetchErr.message); process.exit(1); }
    if (!data || data.length === 0) break;
    allExercises.push(...(data as ExerciseRow[]));
    if (data.length < pageSize) break;
    page++;
  }
  const exercises = allExercises;
  const error = null;

  if (error) {
    console.error("Failed to fetch exercises:", error.message);
    process.exit(1);
  }

  console.log(`Found ${exercises.length} MC exercises total\n`);

  // Fetch lesson info for locale detection
  const lessonIds = [...new Set((exercises as ExerciseRow[]).map((e) => e.lesson_id))];
  const { data: lessons } = await db
    .from("curriculum_lessons")
    .select("id, title, curriculum_units!inner(title, curriculum_levels!inner(locale))")
    .in("id", lessonIds);

  type LessonRow = {
    id: string;
    title: string;
    curriculum_units: { title: string; curriculum_levels: { locale: string } };
  };

  const lessonMap = new Map<string, LessonRow>();
  for (const l of (lessons ?? []) as unknown as LessonRow[]) {
    lessonMap.set(l.id, l);
  }

  let fixed = 0;
  let skipped = 0;
  const fixedByUnit = new Map<string, number>();

  for (const ex of exercises as ExerciseRow[]) {
    const options = ex.exercise_data?.options;
    if (!options || !Array.isArray(options) || options.length < 2) continue;

    // Check for duplicate text_hy
    const textSet = new Set<string>();
    let hasDup = false;
    for (const opt of options) {
      if (textSet.has(opt.text_hy)) {
        hasDup = true;
        break;
      }
      textSet.add(opt.text_hy);
    }
    if (!hasDup) continue;

    // Find correct option
    const correctOpt = options.find((o) => o.correct);
    if (!correctOpt) { skipped++; continue; }

    // Build existing texts set
    const existingTexts = new Set(options.map((o) => o.text_hy));
    const existingEn = new Set(options.map((o) => o.text_en));
    const lesson = lessonMap.get(ex.lesson_id);
    const locale = lesson?.curriculum_units?.curriculum_levels?.locale ?? "hy";
    const isAlphabet = isAlphabetExercise(ex.exercise_data);

    // Track which text_hy values we've seen to find dupes
    const seen = new Set<string>();
    let changed = false;

    const newOptions = options.map((opt) => {
      if (opt.correct) {
        seen.add(opt.text_hy);
        return opt;
      }

      // If this text_hy was already seen, it's a duplicate
      if (seen.has(opt.text_hy)) {
        let newHy: string;
        let newEn: string;

        if (isAlphabet) {
          const letterPool = locale === "el" ? GREEK_LETTERS : ARMENIAN_LETTERS;
          const enPool = locale === "el" ? GREEK_LETTER_EN : ARMENIAN_LETTER_EN;
          newHy = pickDistractor(existingTexts, letterPool);
          const idx = letterPool.indexOf(newHy);
          newEn = idx >= 0 ? enPool[idx] : newHy;
        } else {
          const hyPool = locale === "el" ? DISTRACTOR_EL : DISTRACTOR_HY;
          newHy = pickDistractor(existingTexts, hyPool);
          newEn = pickDistractor(existingEn, DISTRACTOR_EN);
        }

        existingTexts.add(newHy);
        existingEn.add(newEn);
        changed = true;
        return { ...opt, text_hy: newHy, text_en: newEn };
      }

      seen.add(opt.text_hy);
      return opt;
    });

    if (!changed) { skipped++; continue; }

    // Update in DB
    const newData = { ...ex.exercise_data, options: newOptions };
    const { error: updateErr } = await db
      .from("curated_exercises")
      .update({ exercise_data: newData })
      .eq("id", ex.id);

    if (updateErr) {
      console.error(`  \u274C Failed to update ${ex.id}: ${updateErr.message}`);
      skipped++;
    } else {
      fixed++;
      const unitTitle = lesson?.curriculum_units?.title ?? "Unknown";
      fixedByUnit.set(unitTitle, (fixedByUnit.get(unitTitle) ?? 0) + 1);

      // Log details
      const dupTexts = options.filter((o, i) => options.findIndex((x) => x.text_hy === o.text_hy) !== i).map((o) => o.text_hy);
      console.log(`  \u2705 ${unitTitle} > ${lesson?.title}: fixed "${dupTexts.join(", ")}"`);
    }
  }

  console.log(`\n\u2550\u2550\u2550 SUMMARY \u2550\u2550\u2550\n`);
  console.log(`Total MC exercises scanned: ${exercises.length}`);
  console.log(`Fixed: ${fixed}`);
  console.log(`Skipped/errors: ${skipped}`);

  if (fixedByUnit.size > 0) {
    console.log(`\nFixes by unit:`);
    for (const [unit, count] of [...fixedByUnit.entries()].sort()) {
      console.log(`  ${unit}: ${count}`);
    }
  }

  console.log(`\n\u2728 Done!\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
