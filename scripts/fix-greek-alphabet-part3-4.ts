/**
 * Fix Greek Alphabet Parts 3 & 4
 *
 * Part 3: Τ,Υ,Φ (L1) → Χ,Ψ,Ω (L2) → Review Τ-Ω (L3) → Review → Quiz
 * Part 4: Review Α-Ι (L1) → Review Κ-Σ (L2) → Review Τ-Ω (L3) → Full Review → Full Quiz
 *
 * Usage:
 *   npm run dev  (in another terminal)
 *   npx tsx scripts/fix-greek-alphabet-part3-4.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SEED_KEY = process.env.SEED_API_KEY!;
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

if (!SUPABASE_URL || !SERVICE_KEY || !SEED_KEY) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_API_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Full Greek alphabet data (same as seed-alphabet-hardcoded.ts)
const GREEK_LETTERS = [
  { letter_upper: "Α", letter_lower: "α", letter_name: "άλφα", transliteration: "álfa", sound: "a", example_word_target: "αγελάδα", example_word_eng: "cow", emoji: "🐄" },
  { letter_upper: "Β", letter_lower: "β", letter_name: "βήτα", transliteration: "víta", sound: "v", example_word_target: "βιβλίο", example_word_eng: "book", emoji: "📖" },
  { letter_upper: "Γ", letter_lower: "γ", letter_name: "γάμα", transliteration: "gáma", sound: "g", example_word_target: "γάτα", example_word_eng: "cat", emoji: "🐱" },
  { letter_upper: "Δ", letter_lower: "δ", letter_name: "δέλτα", transliteration: "délta", sound: "d", example_word_target: "δέντρο", example_word_eng: "tree", emoji: "🌳" },
  { letter_upper: "Ε", letter_lower: "ε", letter_name: "έψιλον", transliteration: "épsilon", sound: "e", example_word_target: "ελιά", example_word_eng: "olive", emoji: "🫒" },
  { letter_upper: "Ζ", letter_lower: "ζ", letter_name: "ζήτα", transliteration: "zíta", sound: "z", example_word_target: "ζώο", example_word_eng: "animal", emoji: "🐾" },
  { letter_upper: "Η", letter_lower: "η", letter_name: "ήτα", transliteration: "íta", sound: "i", example_word_target: "ήλιος", example_word_eng: "sun", emoji: "☀️" },
  { letter_upper: "Θ", letter_lower: "θ", letter_name: "θήτα", transliteration: "thíta", sound: "th", example_word_target: "θάλασσα", example_word_eng: "sea", emoji: "🌊" },
  { letter_upper: "Ι", letter_lower: "ι", letter_name: "ιώτα", transliteration: "ióta", sound: "i", example_word_target: "ίππος", example_word_eng: "horse", emoji: "🐴" },
  { letter_upper: "Κ", letter_lower: "κ", letter_name: "κάπα", transliteration: "kápa", sound: "k", example_word_target: "κήπος", example_word_eng: "garden", emoji: "🌻" },
  { letter_upper: "Λ", letter_lower: "λ", letter_name: "λάμδα", transliteration: "lámda", sound: "l", example_word_target: "λουλούδι", example_word_eng: "flower", emoji: "🌸" },
  { letter_upper: "Μ", letter_lower: "μ", letter_name: "μι", transliteration: "mi", sound: "m", example_word_target: "μήλο", example_word_eng: "apple", emoji: "🍎" },
  { letter_upper: "Ν", letter_lower: "ν", letter_name: "νι", transliteration: "ni", sound: "n", example_word_target: "νερό", example_word_eng: "water", emoji: "💧" },
  { letter_upper: "Ξ", letter_lower: "ξ", letter_name: "κσι", transliteration: "ksi", sound: "ks", example_word_target: "ξύλο", example_word_eng: "wood", emoji: "🪵" },
  { letter_upper: "Ο", letter_lower: "ο", letter_name: "όμικρον", transliteration: "ómikron", sound: "o", example_word_target: "ομπρέλα", example_word_eng: "umbrella", emoji: "☂️" },
  { letter_upper: "Π", letter_lower: "π", letter_name: "πι", transliteration: "pi", sound: "p", example_word_target: "πόρτα", example_word_eng: "door", emoji: "🚪" },
  { letter_upper: "Ρ", letter_lower: "ρ", letter_name: "ρο", transliteration: "ro", sound: "r", example_word_target: "ρολόι", example_word_eng: "clock", emoji: "⏰" },
  { letter_upper: "Σ", letter_lower: "σ", letter_name: "σίγμα", transliteration: "sígma", sound: "s", example_word_target: "σκύλος", example_word_eng: "dog", emoji: "🐕" },
  // Part 3 letters (index 18-23)
  { letter_upper: "Τ", letter_lower: "τ", letter_name: "ταυ", transliteration: "taf", sound: "t", example_word_target: "τυρί", example_word_eng: "cheese", emoji: "🧀" },
  { letter_upper: "Υ", letter_lower: "υ", letter_name: "ύψιλον", transliteration: "ýpsilon", sound: "ee", example_word_target: "ύπνος", example_word_eng: "sleep", emoji: "😴" },
  { letter_upper: "Φ", letter_lower: "φ", letter_name: "φι", transliteration: "fi", sound: "f", example_word_target: "φίλος", example_word_eng: "friend", emoji: "🤝" },
  { letter_upper: "Χ", letter_lower: "χ", letter_name: "χι", transliteration: "chi", sound: "ch", example_word_target: "χέρι", example_word_eng: "hand", emoji: "✋" },
  { letter_upper: "Ψ", letter_lower: "ψ", letter_name: "ψι", transliteration: "psi", sound: "ps", example_word_target: "ψάρι", example_word_eng: "fish", emoji: "🐟" },
  { letter_upper: "Ω", letter_lower: "ω", letter_name: "ωμέγα", transliteration: "oméga", sound: "o", example_word_target: "ώρα", example_word_eng: "hour", emoji: "⏰" },
];

async function callGenerateLesson(lessonId: string, label: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/generate-lesson`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id: lessonId, key: SEED_KEY }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as Record<string, string>).error ?? `${res.status}`);
    }
    const data = await res.json();
    console.log(`  ✅ ${label}: ${data.count ?? 0} exercises`);
    return true;
  } catch (err) {
    console.error(`  ❌ ${label}: ${err instanceof Error ? err.message : err}`);
    return false;
  }
}

async function main() {
  console.log("\n🔧 Fix Greek Alphabet Parts 3 & 4\n");

  // Find Part 3 and Part 4 units
  const { data: units, error: unitErr } = await db
    .from("curriculum_units")
    .select("id, title, sort_order, curriculum_levels!inner(locale)")
    .order("sort_order");

  if (unitErr || !units) {
    console.error("Failed to fetch units:", unitErr?.message);
    process.exit(1);
  }

  type UnitRow = typeof units[0] & { curriculum_levels: { locale: string } };
  const greekUnits = (units as unknown as UnitRow[])
    .filter((u) => u.curriculum_levels.locale === "el")
    .sort((a, b) => a.sort_order - b.sort_order);

  // Find alphabet units (Part 3 and Part 4)
  const alphabetUnits = greekUnits.filter((u) =>
    u.title.includes("Αλφάβητο") || u.title.includes("Alphabet")
  );

  console.log("Found alphabet units:");
  for (const u of alphabetUnits) {
    console.log(`  ${u.title} (sort: ${u.sort_order})`);
  }

  if (alphabetUnits.length < 4) {
    console.error(`\nExpected at least 4 alphabet units, found ${alphabetUnits.length}`);
    console.log("Available Greek units:");
    for (const u of greekUnits) {
      console.log(`  ${u.title} (sort: ${u.sort_order})`);
    }
    process.exit(1);
  }

  const part3Unit = alphabetUnits[2]; // 3rd alphabet unit
  const part4Unit = alphabetUnits[3]; // 4th alphabet unit

  console.log(`\nPart 3: ${part3Unit.title} (${part3Unit.id})`);
  console.log(`Part 4: ${part4Unit.title} (${part4Unit.id})\n`);

  // Fetch lessons for both units
  for (const unit of [part3Unit, part4Unit]) {
    const { data: lessons } = await db
      .from("curriculum_lessons")
      .select("id, title, slug, template_type, sort_order")
      .eq("unit_id", unit.id)
      .eq("is_active", true)
      .order("sort_order");

    if (!lessons || lessons.length === 0) {
      console.error(`No lessons found for ${unit.title}`);
      continue;
    }

    console.log(`\n═══ ${unit.title} ═══`);
    for (const l of lessons) {
      console.log(`  ${l.sort_order}. ${l.title} (${l.template_type}) [${l.id}]`);
    }

    const practiceLessons = lessons.filter((l) => l.template_type === "alphabet");
    const reviewLessons = lessons.filter((l) => l.template_type === "review");
    const quizLessons = lessons.filter((l) => l.template_type === "quiz");

    // Delete existing content_items and exercises for ALL lessons in this unit
    const allLessonIds = lessons.map((l) => l.id);
    await db.from("curated_exercises").delete().in("lesson_id", allLessonIds);
    await db.from("content_items").delete().in("lesson_id", allLessonIds);
    console.log(`  🗑  Cleaned existing content + exercises`);

    // Determine which letters to assign
    const isPart3 = unit.id === part3Unit.id;

    if (isPart3) {
      // Part 3: Τ,Υ,Φ (L1) → Χ,Ψ,Ω (L2) → all 6 mixed (L3)
      const letterSets = [
        GREEK_LETTERS.slice(18, 21), // Τ, Υ, Φ
        GREEK_LETTERS.slice(21, 24), // Χ, Ψ, Ω
        GREEK_LETTERS.slice(18, 24), // all 6 for review practice
      ];

      for (let i = 0; i < practiceLessons.length && i < letterSets.length; i++) {
        const lesson = practiceLessons[i];
        const letters = letterSets[i];

        const rows = letters.map((l, idx) => ({
          unit_id: unit.id,
          lesson_id: lesson.id,
          item_type: "letter",
          sort_order: idx + 1,
          item_data: l,
          created_by: null,
        }));

        const { error: insertErr } = await db.from("content_items").insert(rows);
        const names = letters.map((l) => `${l.letter_upper}${l.letter_lower}`).join(" ");
        if (insertErr) {
          console.error(`  ❌ ${lesson.title}: ${insertErr.message}`);
        } else {
          console.log(`  ✅ Content: ${lesson.title}: ${names}`);
        }
      }
    } else {
      // Part 4: Review Α-Ι (L1) → Review Κ-Σ (L2) → Review Τ-Ω (L3)
      const letterSets = [
        GREEK_LETTERS.slice(0, 9),   // Α through Ι
        GREEK_LETTERS.slice(9, 18),  // Κ through Σ
        GREEK_LETTERS.slice(18, 24), // Τ through Ω
      ];

      for (let i = 0; i < practiceLessons.length && i < letterSets.length; i++) {
        const lesson = practiceLessons[i];
        const letters = letterSets[i];

        const rows = letters.map((l, idx) => ({
          unit_id: unit.id,
          lesson_id: lesson.id,
          item_type: "letter",
          sort_order: idx + 1,
          item_data: l,
          created_by: null,
        }));

        const { error: insertErr } = await db.from("content_items").insert(rows);
        const names = letters.map((l) => `${l.letter_upper}${l.letter_lower}`).join(" ");
        if (insertErr) {
          console.error(`  ❌ ${lesson.title}: ${insertErr.message}`);
        } else {
          console.log(`  ✅ Content: ${lesson.title}: ${names}`);
        }
      }
    }

    // Generate exercises for practice lessons
    console.log(`\n  --- Generating exercises ---`);
    for (const lesson of practiceLessons) {
      await callGenerateLesson(lesson.id, lesson.title);
      await sleep(500);
    }

    // Generate exercises for review lessons
    for (const lesson of reviewLessons) {
      await callGenerateLesson(lesson.id, `Review: ${lesson.title}`);
      await sleep(500);
    }

    // Generate exercises for quiz lessons
    for (const lesson of quizLessons) {
      await callGenerateLesson(lesson.id, `Quiz: ${lesson.title}`);
      await sleep(500);
    }
  }

  // Verification: check all Greek alphabet units
  console.log("\n\n═══ VERIFICATION ═══\n");

  const { data: verifyData } = await db
    .from("content_items")
    .select("lesson_id, item_data, curriculum_lessons!inner(title, sort_order, curriculum_units!inner(title))")
    .eq("item_type", "letter")
    .order("sort_order");

  if (verifyData) {
    type VerifyRow = {
      item_data: { letter_upper: string; letter_lower: string };
      curriculum_lessons: { title: string; sort_order: number; curriculum_units: { title: string } };
    };

    const grouped = new Map<string, { lessonTitle: string; unitTitle: string; letters: string[] }>();
    for (const row of verifyData as unknown as VerifyRow[]) {
      const unit = row.curriculum_lessons.curriculum_units.title;
      if (!unit.includes("Αλφάβητο") && !unit.includes("Alphabet")) continue;

      const key = `${unit} > ${row.curriculum_lessons.title}`;
      if (!grouped.has(key)) {
        grouped.set(key, { unitTitle: unit, lessonTitle: row.curriculum_lessons.title, letters: [] });
      }
      grouped.get(key)!.letters.push(`${row.item_data.letter_upper}${row.item_data.letter_lower}`);
    }

    for (const [key, val] of grouped) {
      console.log(`  ${key}: ${val.letters.join(", ")}`);
    }
  }

  // Count exercises per unit
  console.log("\n  --- Exercise counts ---");
  for (const unit of alphabetUnits) {
    const { data: lessons } = await db
      .from("curriculum_lessons")
      .select("id, title, sort_order")
      .eq("unit_id", unit.id)
      .order("sort_order");

    for (const l of lessons ?? []) {
      const { count } = await db
        .from("curated_exercises")
        .select("id", { count: "exact", head: true })
        .eq("lesson_id", l.id);
      console.log(`  ${unit.title} > ${l.title}: ${count ?? 0} exercises`);
    }
  }

  console.log("\n✨ Done!\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
