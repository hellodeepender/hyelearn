/**
 * Deterministic seed script for Tagalog (tl) content:
 *   1. Filipino alphabet (28 letters)
 *   2. Kindergarten vocabulary lessons (10 lessons)
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-tagalog.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Filipino Alphabet (28 letters) ──────────────────────────

interface LetterData {
  letter_upper: string;
  letter_lower: string;
  letter_name: string;
  transliteration: string;
  sound: string;
  example_word_target: string;
  example_word_eng: string;
  emoji: string;
}

const TAGALOG_LETTERS: LetterData[] = [
  { letter_upper: "A", letter_lower: "a", letter_name: "ey", transliteration: "ey", sound: "a", example_word_target: "aso", example_word_eng: "dog", emoji: "🐕" },
  { letter_upper: "B", letter_lower: "b", letter_name: "bi", transliteration: "bi", sound: "b", example_word_target: "bahay", example_word_eng: "house", emoji: "🏠" },
  { letter_upper: "C", letter_lower: "c", letter_name: "si", transliteration: "si", sound: "s", example_word_target: "cake", example_word_eng: "cake", emoji: "🎂" },
  { letter_upper: "D", letter_lower: "d", letter_name: "di", transliteration: "di", sound: "d", example_word_target: "damo", example_word_eng: "grass", emoji: "🌿" },
  { letter_upper: "E", letter_lower: "e", letter_name: "i", transliteration: "i", sound: "e", example_word_target: "eroplano", example_word_eng: "airplane", emoji: "✈️" },
  { letter_upper: "F", letter_lower: "f", letter_name: "ef", transliteration: "ef", sound: "f", example_word_target: "family", example_word_eng: "family", emoji: "👨‍👩‍👧‍👦" },
  { letter_upper: "G", letter_lower: "g", letter_name: "dyi", transliteration: "dyi", sound: "g", example_word_target: "gatas", example_word_eng: "milk", emoji: "🥛" },
  { letter_upper: "H", letter_lower: "h", letter_name: "eyts", transliteration: "eyts", sound: "h", example_word_target: "halaman", example_word_eng: "plant", emoji: "🌱" },
  { letter_upper: "I", letter_lower: "i", letter_name: "ay", transliteration: "ay", sound: "i", example_word_target: "ibon", example_word_eng: "bird", emoji: "🐦" },
  { letter_upper: "J", letter_lower: "j", letter_name: "dyey", transliteration: "dyey", sound: "j", example_word_target: "juice", example_word_eng: "juice", emoji: "🧃" },
  { letter_upper: "K", letter_lower: "k", letter_name: "key", transliteration: "key", sound: "k", example_word_target: "kamay", example_word_eng: "hand", emoji: "✋" },
  { letter_upper: "L", letter_lower: "l", letter_name: "el", transliteration: "el", sound: "l", example_word_target: "lapis", example_word_eng: "pencil", emoji: "✏️" },
  { letter_upper: "M", letter_lower: "m", letter_name: "em", transliteration: "em", sound: "m", example_word_target: "mata", example_word_eng: "eye", emoji: "👁️" },
  { letter_upper: "N", letter_lower: "n", letter_name: "en", transliteration: "en", sound: "n", example_word_target: "nanay", example_word_eng: "mother", emoji: "👩" },
  { letter_upper: "Ñ", letter_lower: "ñ", letter_name: "enye", transliteration: "enye", sound: "ny", example_word_target: "Niño", example_word_eng: "child (boy)", emoji: "👦" },
  { letter_upper: "Ng", letter_lower: "ng", letter_name: "endyi", transliteration: "endyi", sound: "ng", example_word_target: "ngipin", example_word_eng: "tooth", emoji: "🦷" },
  { letter_upper: "O", letter_lower: "o", letter_name: "o", transliteration: "o", sound: "o", example_word_target: "oras", example_word_eng: "time", emoji: "⏰" },
  { letter_upper: "P", letter_lower: "p", letter_name: "pi", transliteration: "pi", sound: "p", example_word_target: "pusa", example_word_eng: "cat", emoji: "🐱" },
  { letter_upper: "Q", letter_lower: "q", letter_name: "kyu", transliteration: "kyu", sound: "k", example_word_target: "queen", example_word_eng: "queen", emoji: "👸" },
  { letter_upper: "R", letter_lower: "r", letter_name: "ar", transliteration: "ar", sound: "r", example_word_target: "rosas", example_word_eng: "rose", emoji: "🌹" },
  { letter_upper: "S", letter_lower: "s", letter_name: "es", transliteration: "es", sound: "s", example_word_target: "saging", example_word_eng: "banana", emoji: "🍌" },
  { letter_upper: "T", letter_lower: "t", letter_name: "ti", transliteration: "ti", sound: "t", example_word_target: "tala", example_word_eng: "star", emoji: "⭐" },
  { letter_upper: "U", letter_lower: "u", letter_name: "yu", transliteration: "yu", sound: "u", example_word_target: "ulan", example_word_eng: "rain", emoji: "🌧️" },
  { letter_upper: "V", letter_lower: "v", letter_name: "vi", transliteration: "vi", sound: "v", example_word_target: "vitamina", example_word_eng: "vitamin", emoji: "💊" },
  { letter_upper: "W", letter_lower: "w", letter_name: "dobolyu", transliteration: "dobolyu", sound: "w", example_word_target: "walis", example_word_eng: "broom", emoji: "🧹" },
  { letter_upper: "X", letter_lower: "x", letter_name: "eks", transliteration: "eks", sound: "ks", example_word_target: "x-ray", example_word_eng: "x-ray", emoji: "🩻" },
  { letter_upper: "Y", letter_lower: "y", letter_name: "way", transliteration: "way", sound: "y", example_word_target: "yelo", example_word_eng: "ice", emoji: "🧊" },
  { letter_upper: "Z", letter_lower: "z", letter_name: "zi", transliteration: "zi", sound: "z", example_word_target: "zoo", example_word_eng: "zoo", emoji: "🦁" },
];

// ── Kindergarten Lessons (10 topics) ────────────────────────

interface VocabWord {
  target: string;
  english: string;
  emoji: string;
}

interface LessonDef {
  slug: string;
  title: string;
  description: string;
  words: VocabWord[];
}

const K_LESSONS: LessonDef[] = [
  {
    slug: "tl-k-greetings",
    title: "Pagbati (Greetings)",
    description: "Learn basic Tagalog greetings",
    words: [
      { target: "Kamusta", english: "Hello / How are you", emoji: "👋" },
      { target: "Magandang umaga", english: "Good morning", emoji: "🌅" },
      { target: "Magandang hapon", english: "Good afternoon", emoji: "☀️" },
      { target: "Magandang gabi", english: "Good evening", emoji: "🌙" },
      { target: "Paalam", english: "Goodbye", emoji: "👋" },
    ],
  },
  {
    slug: "tl-k-colors",
    title: "Mga Kulay (Colors)",
    description: "Learn colors in Tagalog",
    words: [
      { target: "Pula", english: "Red", emoji: "🔴" },
      { target: "Asul", english: "Blue", emoji: "🔵" },
      { target: "Dilaw", english: "Yellow", emoji: "🟡" },
      { target: "Berde", english: "Green", emoji: "🟢" },
      { target: "Puti", english: "White", emoji: "⚪" },
      { target: "Itim", english: "Black", emoji: "⚫" },
    ],
  },
  {
    slug: "tl-k-numbers-1-5",
    title: "Mga Numero 1-5",
    description: "Count from 1 to 5 in Tagalog",
    words: [
      { target: "Isa", english: "One", emoji: "1️⃣" },
      { target: "Dalawa", english: "Two", emoji: "2️⃣" },
      { target: "Tatlo", english: "Three", emoji: "3️⃣" },
      { target: "Apat", english: "Four", emoji: "4️⃣" },
      { target: "Lima", english: "Five", emoji: "5️⃣" },
    ],
  },
  {
    slug: "tl-k-numbers-6-10",
    title: "Mga Numero 6-10",
    description: "Count from 6 to 10 in Tagalog",
    words: [
      { target: "Anim", english: "Six", emoji: "6️⃣" },
      { target: "Pito", english: "Seven", emoji: "7️⃣" },
      { target: "Walo", english: "Eight", emoji: "8️⃣" },
      { target: "Siyam", english: "Nine", emoji: "9️⃣" },
      { target: "Sampu", english: "Ten", emoji: "🔟" },
    ],
  },
  {
    slug: "tl-k-family",
    title: "Pamilya (Family)",
    description: "Learn family words in Tagalog",
    words: [
      { target: "Nanay", english: "Mother", emoji: "👩" },
      { target: "Tatay", english: "Father", emoji: "👨" },
      { target: "Ate", english: "Older sister", emoji: "👧" },
      { target: "Kuya", english: "Older brother", emoji: "👦" },
      { target: "Kapatid", english: "Sibling", emoji: "👫" },
    ],
  },
  {
    slug: "tl-k-animals",
    title: "Mga Hayop (Animals)",
    description: "Learn animal names in Tagalog",
    words: [
      { target: "Aso", english: "Dog", emoji: "🐕" },
      { target: "Pusa", english: "Cat", emoji: "🐱" },
      { target: "Ibon", english: "Bird", emoji: "🐦" },
      { target: "Isda", english: "Fish", emoji: "🐟" },
      { target: "Manok", english: "Chicken", emoji: "🐔" },
    ],
  },
  {
    slug: "tl-k-food",
    title: "Pagkain (Food)",
    description: "Learn food words in Tagalog",
    words: [
      { target: "Kanin", english: "Rice", emoji: "🍚" },
      { target: "Tinapay", english: "Bread", emoji: "🍞" },
      { target: "Prutas", english: "Fruit", emoji: "🍎" },
      { target: "Gulay", english: "Vegetable", emoji: "🥬" },
      { target: "Tubig", english: "Water", emoji: "💧" },
    ],
  },
  {
    slug: "tl-k-body-parts",
    title: "Mga Bahagi ng Katawan (Body Parts)",
    description: "Learn body parts in Tagalog",
    words: [
      { target: "Ulo", english: "Head", emoji: "🗣️" },
      { target: "Mata", english: "Eye", emoji: "👁️" },
      { target: "Ilong", english: "Nose", emoji: "👃" },
      { target: "Bibig", english: "Mouth", emoji: "👄" },
      { target: "Kamay", english: "Hand", emoji: "✋" },
    ],
  },
  {
    slug: "tl-k-phrases",
    title: "Mga Salita (Common Phrases)",
    description: "Learn common Tagalog phrases",
    words: [
      { target: "Oo", english: "Yes", emoji: "👍" },
      { target: "Hindi", english: "No", emoji: "👎" },
      { target: "Salamat", english: "Thank you", emoji: "🙏" },
      { target: "Pakiusap", english: "Please", emoji: "🤲" },
      { target: "Pasensya na", english: "Sorry", emoji: "😔" },
    ],
  },
  {
    slug: "tl-k-home",
    title: "Ang Bahay Ko (My Home)",
    description: "Learn home-related words in Tagalog",
    words: [
      { target: "Bahay", english: "House", emoji: "🏠" },
      { target: "Pinto", english: "Door", emoji: "🚪" },
      { target: "Bintana", english: "Window", emoji: "🪟" },
      { target: "Mesa", english: "Table", emoji: "🪑" },
      { target: "Upuan", english: "Chair", emoji: "💺" },
    ],
  },
];

// ── Main seed function ──────────────────────────────────────

async function main() {
  console.log("\n🇵🇭 Seeding Tagalog (tl) content...\n");

  // 1. Ensure we have a Kindergarten level
  let levelId: string;
  const { data: existingLevel } = await db
    .from("curriculum_levels")
    .select("id")
    .eq("locale", "tl")
    .eq("slug", "tl-kindergarten")
    .single();

  if (existingLevel) {
    levelId = existingLevel.id;
    console.log("  Level exists:", levelId);
  } else {
    const { data: newLevel, error } = await db
      .from("curriculum_levels")
      .insert({
        slug: "tl-kindergarten",
        title: "Kindergarten",
        description: "Filipino alphabet, basic vocabulary, simple expressions",
        grade_value: "K",
        sort_order: 1,
        is_active: true,
        locale: "tl",
      })
      .select("id")
      .single();
    if (error) {
      console.error("  Failed to create level:", error.message);
      process.exit(1);
    }
    levelId = newLevel!.id;
    console.log("  Created level:", levelId);
  }

  // 2. Seed alphabet as content_items in an "Alphabet" unit
  let alphaUnitId: string;
  const { data: existingAlphaUnit } = await db
    .from("curriculum_units")
    .select("id")
    .eq("locale", "tl")
    .eq("slug", "tl-k-alphabet")
    .single();

  if (existingAlphaUnit) {
    alphaUnitId = existingAlphaUnit.id;
    console.log("  Alphabet unit exists:", alphaUnitId);
  } else {
    const { data: newUnit, error } = await db
      .from("curriculum_units")
      .insert({
        level_id: levelId,
        slug: "tl-k-alphabet",
        title: "Filipino Alphabet",
        description: "Learn the 28 letters of the Filipino alphabet",
        sort_order: 1,
        is_active: true,
        locale: "tl",
      })
      .select("id")
      .single();
    if (error) {
      console.error("  Failed to create alphabet unit:", error.message);
      process.exit(1);
    }
    alphaUnitId = newUnit!.id;
    console.log("  Created alphabet unit:", alphaUnitId);
  }

  // Create alphabet lesson
  let alphaLessonId: string;
  const { data: existingAlphaLesson } = await db
    .from("curriculum_lessons")
    .select("id")
    .eq("locale", "tl")
    .eq("slug", "tl-k-alphabet-learn")
    .single();

  if (existingAlphaLesson) {
    alphaLessonId = existingAlphaLesson.id;
    console.log("  Alphabet lesson exists:", alphaLessonId);
  } else {
    const { data: newLesson, error } = await db
      .from("curriculum_lessons")
      .insert({
        unit_id: alphaUnitId,
        slug: "tl-k-alphabet-learn",
        title: "Filipino Alphabet",
        description: "Learn all 28 letters of the Filipino alphabet",
        lesson_type: "learn_card",
        template_type: "learn_card",
        passing_score: 70,
        sort_order: 1,
        is_active: true,
        locale: "tl",
      })
      .select("id")
      .single();
    if (error) {
      console.error("  Failed to create alphabet lesson:", error.message);
      process.exit(1);
    }
    alphaLessonId = newLesson!.id;
    console.log("  Created alphabet lesson:", alphaLessonId);
  }

  // Seed alphabet learn cards as curated_exercises
  const alphaExercises = TAGALOG_LETTERS.map((letter, i) => ({
    lesson_id: alphaLessonId,
    exercise_type: "learn_card",
    exercise_data: {
      type: "learn_card",
      letter: letter.letter_upper,
      letter_name: letter.letter_name,
      transliteration: letter.transliteration,
      sound: letter.sound,
      example_word: letter.example_word_target,
      example_translation: letter.example_word_eng,
      emoji: letter.emoji,
      sort_order: i + 1,
    },
    sort_order: i + 1,
    status: "approved",
    locale: "tl",
  }));

  // Delete existing alphabet exercises for this lesson to avoid duplicates
  await db.from("curated_exercises").delete().eq("lesson_id", alphaLessonId);
  const { error: alphaInsertErr } = await db.from("curated_exercises").insert(alphaExercises);
  if (alphaInsertErr) {
    console.error("  Failed to insert alphabet exercises:", alphaInsertErr.message);
  } else {
    console.log(`  Inserted ${TAGALOG_LETTERS.length} alphabet learn cards`);
  }

  // 3. Seed vocabulary unit + lessons
  let vocabUnitId: string;
  const { data: existingVocabUnit } = await db
    .from("curriculum_units")
    .select("id")
    .eq("locale", "tl")
    .eq("slug", "tl-k-vocabulary")
    .single();

  if (existingVocabUnit) {
    vocabUnitId = existingVocabUnit.id;
    console.log("  Vocabulary unit exists:", vocabUnitId);
  } else {
    const { data: newUnit, error } = await db
      .from("curriculum_units")
      .insert({
        level_id: levelId,
        slug: "tl-k-vocabulary",
        title: "Basic Vocabulary",
        description: "Greetings, colors, numbers, family, and more",
        sort_order: 2,
        is_active: true,
        locale: "tl",
      })
      .select("id")
      .single();
    if (error) {
      console.error("  Failed to create vocab unit:", error.message);
      process.exit(1);
    }
    vocabUnitId = newUnit!.id;
    console.log("  Created vocabulary unit:", vocabUnitId);
  }

  // Seed each K lesson
  for (let li = 0; li < K_LESSONS.length; li++) {
    const lesson = K_LESSONS[li];

    let lessonId: string;
    const { data: existingLesson } = await db
      .from("curriculum_lessons")
      .select("id")
      .eq("locale", "tl")
      .eq("slug", lesson.slug)
      .single();

    if (existingLesson) {
      lessonId = existingLesson.id;
    } else {
      const { data: newLesson, error } = await db
        .from("curriculum_lessons")
        .insert({
          unit_id: vocabUnitId,
          slug: lesson.slug,
          title: lesson.title,
          description: lesson.description,
          lesson_type: "learn_card",
          template_type: "learn_card",
          passing_score: 70,
          sort_order: li + 1,
          is_active: true,
          locale: "tl",
        })
        .select("id")
        .single();
      if (error) {
        console.error(`  Failed to create lesson ${lesson.slug}:`, error.message);
        continue;
      }
      lessonId = newLesson!.id;
    }

    // Build learn card exercises for this lesson's words
    const exercises = lesson.words.map((word, wi) => ({
      lesson_id: lessonId,
      exercise_type: "learn_card",
      exercise_data: {
        type: "learn_card",
        visual: word.emoji,
        primary_text: word.target,
        secondary_text: word.english,
        sort_order: wi + 1,
      },
      sort_order: wi + 1,
      status: "approved",
      locale: "tl",
    }));

    // Delete existing exercises for this lesson to avoid duplicates
    await db.from("curated_exercises").delete().eq("lesson_id", lessonId);
    const { error: insertErr } = await db.from("curated_exercises").insert(exercises);
    if (insertErr) {
      console.error(`  Failed to insert exercises for ${lesson.slug}:`, insertErr.message);
    } else {
      console.log(`  ${lesson.title}: ${exercises.length} learn cards`);
    }
  }

  // 4. Verification
  console.log("\n--- Verification ---");

  const { data: lessonCount } = await db
    .from("curriculum_lessons")
    .select("id", { count: "exact" })
    .eq("locale", "tl");
  console.log(`  Tagalog lessons: ${lessonCount?.length ?? 0}`);

  const { data: exerciseCount } = await db
    .from("curated_exercises")
    .select("id", { count: "exact" })
    .eq("locale", "tl");
  console.log(`  Tagalog exercises: ${exerciseCount?.length ?? 0}`);

  console.log("\nDone!\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
