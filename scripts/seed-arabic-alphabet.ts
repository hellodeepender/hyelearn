/**
 * Seed Arabic alphabet curriculum: levels, units, lessons, content_items, exercises.
 * Hardcoded — no AI. Uses the template engine directly.
 *
 * Usage: npx tsx scripts/seed-arabic-alphabet.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { generateLessonContent } from "../lib/lesson-templates";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("Missing env vars"); process.exit(1); }

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

// ── Arabic alphabet (28 letters) ─────────────────────────────
interface LetterData {
  letter_upper: string; // Isolated form (Arabic has no upper/lowercase — reuse field)
  letter_lower: string; // Also isolated form
  letter_name: string;  // Arabic name
  transliteration: string;
  sound: string;
  example_word_target: string;
  example_word_eng: string;
  emoji: string;
}

const ARABIC_LETTERS: LetterData[] = [
  // Part 1: أ ب ت ث ج ح خ
  // letter_upper = isolated form, letter_lower = initial form (with tatweel ـ for connecting letters)
  // Non-connecting letters (أ/ا د ذ ر ز و) keep the same form
  { letter_upper: "\u0623", letter_lower: "\u0623", letter_name: "\u0623\u064E\u0644\u0650\u0641", transliteration: "alif", sound: "a", example_word_target: "\u0623\u0633\u062F", example_word_eng: "lion", emoji: "\uD83E\uDD81" },
  { letter_upper: "\u0628", letter_lower: "\u0628\u0640", letter_name: "\u0628\u0627\u0621", transliteration: "baa", sound: "b", example_word_target: "\u0628\u064A\u062A", example_word_eng: "house", emoji: "\uD83C\uDFE0" },
  { letter_upper: "\u062A", letter_lower: "\u062A\u0640", letter_name: "\u062A\u0627\u0621", transliteration: "taa", sound: "t", example_word_target: "\u062A\u0641\u0627\u062D", example_word_eng: "apple", emoji: "\uD83C\uDF4E" },
  { letter_upper: "\u062B", letter_lower: "\u062B\u0640", letter_name: "\u062B\u0627\u0621", transliteration: "thaa", sound: "th", example_word_target: "\u062B\u0639\u0644\u0628", example_word_eng: "fox", emoji: "\uD83E\uDD8A" },
  { letter_upper: "\u062C", letter_lower: "\u062C\u0640", letter_name: "\u062C\u064A\u0645", transliteration: "jeem", sound: "j", example_word_target: "\u062C\u0645\u0644", example_word_eng: "camel", emoji: "\uD83D\uDC2B" },
  { letter_upper: "\u062D", letter_lower: "\u062D\u0640", letter_name: "\u062D\u0627\u0621", transliteration: "haa", sound: "h", example_word_target: "\u062D\u0635\u0627\u0646", example_word_eng: "horse", emoji: "\uD83D\uDC34" },
  { letter_upper: "\u062E", letter_lower: "\u062E\u0640", letter_name: "\u062E\u0627\u0621", transliteration: "khaa", sound: "kh", example_word_target: "\u062E\u0628\u0632", example_word_eng: "bread", emoji: "\uD83C\uDF5E" },
  // Part 2: د ذ ر ز س ش ص
  { letter_upper: "\u062F", letter_lower: "\u062F", letter_name: "\u062F\u0627\u0644", transliteration: "daal", sound: "d", example_word_target: "\u062F\u064F\u0628", example_word_eng: "bear", emoji: "\uD83D\uDC3B" },
  { letter_upper: "\u0630", letter_lower: "\u0630", letter_name: "\u0630\u0627\u0644", transliteration: "dhaal", sound: "dh", example_word_target: "\u0630\u0647\u0628", example_word_eng: "gold", emoji: "\u2728" },
  { letter_upper: "\u0631", letter_lower: "\u0631", letter_name: "\u0631\u0627\u0621", transliteration: "raa", sound: "r", example_word_target: "\u0631\u0645\u0627\u0646", example_word_eng: "pomegranate", emoji: "\uD83C\uDF4E" },
  { letter_upper: "\u0632", letter_lower: "\u0632", letter_name: "\u0632\u0627\u064A", transliteration: "zaay", sound: "z", example_word_target: "\u0632\u0647\u0631\u0629", example_word_eng: "flower", emoji: "\uD83C\uDF3A" },
  { letter_upper: "\u0633", letter_lower: "\u0633\u0640", letter_name: "\u0633\u064A\u0646", transliteration: "seen", sound: "s", example_word_target: "\u0633\u0645\u0643", example_word_eng: "fish", emoji: "\uD83D\uDC1F" },
  { letter_upper: "\u0634", letter_lower: "\u0634\u0640", letter_name: "\u0634\u064A\u0646", transliteration: "sheen", sound: "sh", example_word_target: "\u0634\u0645\u0633", example_word_eng: "sun", emoji: "\u2600\uFE0F" },
  { letter_upper: "\u0635", letter_lower: "\u0635\u0640", letter_name: "\u0635\u0627\u062F", transliteration: "saad", sound: "s (emphatic)", example_word_target: "\u0635\u0642\u0631", example_word_eng: "falcon", emoji: "\uD83E\uDD85" },
  // Part 3: ض ط ظ ع غ ف ق
  { letter_upper: "\u0636", letter_lower: "\u0636\u0640", letter_name: "\u0636\u0627\u062F", transliteration: "daad", sound: "d (emphatic)", example_word_target: "\u0636\u0641\u062F\u0639", example_word_eng: "frog", emoji: "\uD83D\uDC38" },
  { letter_upper: "\u0637", letter_lower: "\u0637\u0640", letter_name: "\u0637\u0627\u0621", transliteration: "taa (emphatic)", sound: "t (emphatic)", example_word_target: "\u0637\u0627\u0626\u0631", example_word_eng: "bird", emoji: "\uD83D\uDC26" },
  { letter_upper: "\u0638", letter_lower: "\u0638\u0640", letter_name: "\u0638\u0627\u0621", transliteration: "dhaa (emphatic)", sound: "dh (emphatic)", example_word_target: "\u0638\u0644", example_word_eng: "shadow", emoji: "\uD83C\uDF11" },
  { letter_upper: "\u0639", letter_lower: "\u0639\u0640", letter_name: "\u0639\u064E\u064A\u0646", transliteration: "ayn", sound: "'a (deep)", example_word_target: "\u0639\u064A\u0646", example_word_eng: "eye", emoji: "\uD83D\uDC41\uFE0F" },
  { letter_upper: "\u063A", letter_lower: "\u063A\u0640", letter_name: "\u063A\u064E\u064A\u0646", transliteration: "ghayn", sound: "gh", example_word_target: "\u063A\u0632\u0627\u0644", example_word_eng: "deer", emoji: "\uD83E\uDD8C" },
  { letter_upper: "\u0641", letter_lower: "\u0641\u0640", letter_name: "\u0641\u0627\u0621", transliteration: "faa", sound: "f", example_word_target: "\u0641\u0631\u0627\u0634\u0629", example_word_eng: "butterfly", emoji: "\uD83E\uDD8B" },
  { letter_upper: "\u0642", letter_lower: "\u0642\u0640", letter_name: "\u0642\u0627\u0641", transliteration: "qaaf", sound: "q", example_word_target: "\u0642\u0645\u0631", example_word_eng: "moon", emoji: "\uD83C\uDF19" },
  // Part 4: ك ل م ن ه و ي
  { letter_upper: "\u0643", letter_lower: "\u0643\u0640", letter_name: "\u0643\u0627\u0641", transliteration: "kaaf", sound: "k", example_word_target: "\u0643\u062A\u0627\u0628", example_word_eng: "book", emoji: "\uD83D\uDCD6" },
  { letter_upper: "\u0644", letter_lower: "\u0644\u0640", letter_name: "\u0644\u0627\u0645", transliteration: "laam", sound: "l", example_word_target: "\u0644\u064A\u0645\u0648\u0646", example_word_eng: "lemon", emoji: "\uD83C\uDF4B" },
  { letter_upper: "\u0645", letter_lower: "\u0645\u0640", letter_name: "\u0645\u064A\u0645", transliteration: "meem", sound: "m", example_word_target: "\u0645\u0627\u0621", example_word_eng: "water", emoji: "\uD83D\uDCA7" },
  { letter_upper: "\u0646", letter_lower: "\u0646\u0640", letter_name: "\u0646\u0648\u0646", transliteration: "noon", sound: "n", example_word_target: "\u0646\u062C\u0645", example_word_eng: "star", emoji: "\u2B50" },
  { letter_upper: "\u0647", letter_lower: "\u0647\u0640", letter_name: "\u0647\u0627\u0621", transliteration: "haa", sound: "h (light)", example_word_target: "\u0647\u0644\u0627\u0644", example_word_eng: "crescent", emoji: "\uD83C\uDF19" },
  { letter_upper: "\u0648", letter_lower: "\u0648", letter_name: "\u0648\u0627\u0648", transliteration: "waaw", sound: "w", example_word_target: "\u0648\u0631\u062F", example_word_eng: "rose", emoji: "\uD83C\uDF39" },
  { letter_upper: "\u064A", letter_lower: "\u064A\u0640", letter_name: "\u064A\u0627\u0621", transliteration: "yaa", sound: "y", example_word_target: "\u064A\u062F", example_word_eng: "hand", emoji: "\u270B" },
];

// ── Seed structure ───────────────────────────────────────────

const PARTS = [
  { title: "Arabic Alphabet Part 1", letters: ARABIC_LETTERS.slice(0, 7), lessonsPerPart: 3, lettersPerLesson: [3, 2, 2] },
  { title: "Arabic Alphabet Part 2", letters: ARABIC_LETTERS.slice(7, 14), lessonsPerPart: 3, lettersPerLesson: [3, 2, 2] },
  { title: "Arabic Alphabet Part 3", letters: ARABIC_LETTERS.slice(14, 21), lessonsPerPart: 3, lettersPerLesson: [3, 2, 2] },
  { title: "Arabic Alphabet Part 4", letters: ARABIC_LETTERS.slice(21, 28), lessonsPerPart: 3, lettersPerLesson: [3, 2, 2] },
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("\n\uD83C\uDDF8\uD83C\uDDE6 Arabic Alphabet Seeder\n");

  // Step 1: Create or find the Kindergarten level for Arabic
  let { data: existingLevel } = await db.from("curriculum_levels").select("id").eq("locale", "ar").eq("slug", "kindergarten-ar").single();

  let levelId: string;
  if (existingLevel) {
    levelId = existingLevel.id;
    console.log("  Using existing Kindergarten level:", levelId);
  } else {
    const { data: newLevel, error } = await db.from("curriculum_levels").insert({
      slug: "kindergarten-ar",
      title: "Kindergarten",
      description: "Arabic alphabet, basic vocabulary, simple expressions",
      grade_value: "K",
      sort_order: 1,
      is_active: true,
      locale: "ar",
    }).select("id").single();
    if (error || !newLevel) { console.error("Failed to create level:", error?.message); process.exit(1); }
    levelId = newLevel.id;
    console.log("  Created Kindergarten level:", levelId);
  }

  let totalExercises = 0;
  let globalLessonSort = 0;

  for (let partIdx = 0; partIdx < PARTS.length; partIdx++) {
    const part = PARTS[partIdx];
    console.log(`\n=== ${part.title} ===`);

    // Create unit
    const unitSlug = slugify(part.title);
    let { data: existingUnit } = await db.from("curriculum_units").select("id").eq("locale", "ar").eq("slug", unitSlug).single();

    let unitId: string;
    if (existingUnit) {
      unitId = existingUnit.id;
      // Clean existing data
      const { data: existingLessons } = await db.from("curriculum_lessons").select("id").eq("unit_id", unitId);
      if (existingLessons) {
        const lessonIds = existingLessons.map((l) => l.id);
        await db.from("curated_exercises").delete().in("lesson_id", lessonIds);
        await db.from("content_items").delete().in("lesson_id", lessonIds);
        await db.from("curriculum_lessons").delete().eq("unit_id", unitId);
      }
    } else {
      const { data: newUnit, error } = await db.from("curriculum_units").insert({
        level_id: levelId,
        slug: unitSlug,
        title: part.title,
        sort_order: partIdx + 1,
        is_active: true,
        locale: "ar",
      }).select("id").single();
      if (error || !newUnit) { console.error("Failed to create unit:", error?.message); process.exit(1); }
      unitId = newUnit.id;
    }

    // Create practice lessons
    let letterIdx = 0;
    for (let lessonIdx = 0; lessonIdx < part.lessonsPerPart; lessonIdx++) {
      globalLessonSort++;
      const count = part.lettersPerLesson[lessonIdx];
      const letters = part.letters.slice(letterIdx, letterIdx + count);
      letterIdx += count;

      const lessonTitle = `Lesson ${lessonIdx + 1}`;
      const { data: lesson, error: lessonErr } = await db.from("curriculum_lessons").insert({
        unit_id: unitId,
        slug: `lesson-${globalLessonSort}`,
        title: lessonTitle,
        lesson_type: "practice",
        template_type: "alphabet",
        passing_score: 70,
        sort_order: lessonIdx + 1,
        is_active: true,
        locale: "ar",
      }).select("id").single();

      if (lessonErr || !lesson) { console.error(`  Failed to create lesson: ${lessonErr?.message}`); continue; }

      // Insert content_items
      const contentRows = letters.map((l, i) => ({
        unit_id: unitId,
        lesson_id: lesson.id,
        item_type: "letter",
        sort_order: i + 1,
        item_data: l,
        created_by: null,
      }));
      await db.from("content_items").insert(contentRows);

      // Generate exercises using template engine
      const generated = generateLessonContent("alphabet", contentRows.map((r, i) => ({
        id: String(i), item_type: r.item_type, sort_order: r.sort_order, item_data: r.item_data,
      })), "ar");

      await db.from("curated_exercises").insert(generated.map((ex) => ({
        lesson_id: lesson.id,
        exercise_type: ex.exercise_type,
        exercise_data: ex.exercise_data,
        sort_order: ex.sort_order,
        status: "approved",
        created_by: null,
      })));

      totalExercises += generated.length;
      const letterNames = letters.map((l) => `${l.letter_upper} (${l.transliteration})`).join(", ");
      console.log(`  \u2705 ${lessonTitle}: ${letterNames} \u2192 ${generated.length} exercises`);
    }

    // Create Review lesson
    globalLessonSort++;
    const { data: reviewLesson } = await db.from("curriculum_lessons").insert({
      unit_id: unitId,
      slug: `review-${globalLessonSort}`,
      title: "Review",
      lesson_type: "practice",
      template_type: "review",
      passing_score: 0,
      sort_order: part.lessonsPerPart + 1,
      is_active: true,
      locale: "ar",
    }).select("id").single();

    if (reviewLesson) {
      // Get all content from practice lessons in this unit
      const { data: practiceIds } = await db.from("curriculum_lessons").select("id").eq("unit_id", unitId).not("template_type", "in", '("review","quiz")');
      const { data: unitItems } = await db.from("content_items").select("id, item_type, sort_order, item_data").in("lesson_id", (practiceIds ?? []).map((l) => l.id)).order("sort_order");
      if (unitItems && unitItems.length > 0) {
        const gen = generateLessonContent("review", unitItems, "ar");
        await db.from("curated_exercises").insert(gen.map((ex) => ({
          lesson_id: reviewLesson.id, exercise_type: ex.exercise_type, exercise_data: ex.exercise_data,
          sort_order: ex.sort_order, status: "approved", created_by: null,
        })));
        totalExercises += gen.length;
        console.log(`  \u2705 Review: ${gen.length} exercises`);
      }
    }

    // Create Quiz lesson
    globalLessonSort++;
    const { data: quizLesson } = await db.from("curriculum_lessons").insert({
      unit_id: unitId,
      slug: `quiz-${globalLessonSort}`,
      title: "Quiz",
      lesson_type: "quiz",
      template_type: "quiz",
      passing_score: 70,
      sort_order: part.lessonsPerPart + 2,
      is_active: true,
      locale: "ar",
    }).select("id").single();

    if (quizLesson) {
      const { data: practiceIds } = await db.from("curriculum_lessons").select("id").eq("unit_id", unitId).not("template_type", "in", '("review","quiz")');
      const { data: unitItems } = await db.from("content_items").select("id, item_type, sort_order, item_data").in("lesson_id", (practiceIds ?? []).map((l) => l.id)).order("sort_order");
      if (unitItems && unitItems.length > 0) {
        const gen = generateLessonContent("quiz", unitItems, "ar");
        await db.from("curated_exercises").insert(gen.map((ex) => ({
          lesson_id: quizLesson.id, exercise_type: ex.exercise_type, exercise_data: ex.exercise_data,
          sort_order: ex.sort_order, status: "approved", created_by: null,
        })));
        totalExercises += gen.length;
        console.log(`  \u2705 Quiz: ${gen.length} exercises`);
      }
    }
  }

  // Verification
  console.log("\n=== Verification ===\n");
  const { count: lessonCount } = await db.from("curriculum_lessons").select("id", { count: "exact", head: true }).eq("locale", "ar");
  const { count: exerciseCount } = await db.from("curated_exercises").select("id", { count: "exact", head: true });
  console.log(`  Arabic lessons: ${lessonCount}`);
  console.log(`  Total exercises generated: ${totalExercises}`);

  // Spot check first and last letters
  const { data: firstLesson } = await db.from("content_items").select("item_data").eq("item_type", "letter").order("sort_order").limit(1);
  const firstLetter = firstLesson?.[0]?.item_data as LetterData | undefined;
  console.log(`  First letter: ${firstLetter?.letter_upper} (${firstLetter?.transliteration})`);

  console.log(`\n\u2728 Done!\n`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
