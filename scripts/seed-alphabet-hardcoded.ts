/**
 * DiasporaLearn — Hardcoded Alphabet Seeder (zero AI calls for content)
 *
 * Usage:
 *   npx tsx scripts/seed-alphabet-hardcoded.ts --locale=el
 *   npx tsx scripts/seed-alphabet-hardcoded.ts --locale=hy --exercises-only
 *   npx tsx scripts/seed-alphabet-hardcoded.ts --locale=el --exercises-only
 *
 * Prerequisites:
 *   - .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_API_KEY
 *   - BASE_URL in .env.local (default http://localhost:3000)
 *   - npm run dev running at BASE_URL
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const args = process.argv.slice(2);
const localeArg = args.find((a) => a.startsWith("--locale="))?.split("=")[1];
const exercisesOnly = args.includes("--exercises-only");

if (!localeArg || !["hy", "el"].includes(localeArg)) {
  console.error("Usage: npx tsx scripts/seed-alphabet-hardcoded.ts --locale=hy|el [--exercises-only]");
  process.exit(1);
}

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

// ── Greek alphabet (24 letters) ──────────────────────────────
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

const GREEK_LETTERS: LetterData[] = [
  { letter_upper: "\u0391", letter_lower: "\u03B1", letter_name: "\u03AC\u03BB\u03C6\u03B1", transliteration: "álfa", sound: "a", example_word_target: "\u03B1\u03B3\u03B5\u03BB\u03AC\u03B4\u03B1", example_word_eng: "cow", emoji: "\uD83D\uDC04" },
  { letter_upper: "\u0392", letter_lower: "\u03B2", letter_name: "\u03B2\u03AE\u03C4\u03B1", transliteration: "víta", sound: "v", example_word_target: "\u03B2\u03B9\u03B2\u03BB\u03AF\u03BF", example_word_eng: "book", emoji: "\uD83D\uDCD6" },
  { letter_upper: "\u0393", letter_lower: "\u03B3", letter_name: "\u03B3\u03AC\u03BC\u03B1", transliteration: "gáma", sound: "g", example_word_target: "\u03B3\u03AC\u03C4\u03B1", example_word_eng: "cat", emoji: "\uD83D\uDC31" },
  { letter_upper: "\u0394", letter_lower: "\u03B4", letter_name: "\u03B4\u03AD\u03BB\u03C4\u03B1", transliteration: "délta", sound: "d", example_word_target: "\u03B4\u03AD\u03BD\u03C4\u03C1\u03BF", example_word_eng: "tree", emoji: "\uD83C\uDF33" },
  { letter_upper: "\u0395", letter_lower: "\u03B5", letter_name: "\u03AD\u03C8\u03B9\u03BB\u03BF\u03BD", transliteration: "épsilon", sound: "e", example_word_target: "\u03B5\u03BB\u03B9\u03AC", example_word_eng: "olive", emoji: "\uD83E\uDED2" },
  { letter_upper: "\u0396", letter_lower: "\u03B6", letter_name: "\u03B6\u03AE\u03C4\u03B1", transliteration: "zíta", sound: "z", example_word_target: "\u03B6\u03CE\u03BF", example_word_eng: "animal", emoji: "\uD83D\uDC3E" },
  { letter_upper: "\u0397", letter_lower: "\u03B7", letter_name: "\u03AE\u03C4\u03B1", transliteration: "íta", sound: "i", example_word_target: "\u03AE\u03BB\u03B9\u03BF\u03C2", example_word_eng: "sun", emoji: "\u2600\uFE0F" },
  { letter_upper: "\u0398", letter_lower: "\u03B8", letter_name: "\u03B8\u03AE\u03C4\u03B1", transliteration: "thíta", sound: "th", example_word_target: "\u03B8\u03AC\u03BB\u03B1\u03C3\u03C3\u03B1", example_word_eng: "sea", emoji: "\uD83C\uDF0A" },
  { letter_upper: "\u0399", letter_lower: "\u03B9", letter_name: "\u03B9\u03CE\u03C4\u03B1", transliteration: "ióta", sound: "i", example_word_target: "\u03AF\u03C0\u03C0\u03BF\u03C2", example_word_eng: "horse", emoji: "\uD83D\uDC34" },
  { letter_upper: "\u039A", letter_lower: "\u03BA", letter_name: "\u03BA\u03AC\u03C0\u03B1", transliteration: "kápa", sound: "k", example_word_target: "\u03BA\u03AE\u03C0\u03BF\u03C2", example_word_eng: "garden", emoji: "\uD83C\uDF3B" },
  { letter_upper: "\u039B", letter_lower: "\u03BB", letter_name: "\u03BB\u03AC\u03BC\u03B4\u03B1", transliteration: "lámda", sound: "l", example_word_target: "\u03BB\u03BF\u03C5\u03BB\u03BF\u03CD\u03B4\u03B9", example_word_eng: "flower", emoji: "\uD83C\uDF38" },
  { letter_upper: "\u039C", letter_lower: "\u03BC", letter_name: "\u03BC\u03B9", transliteration: "mi", sound: "m", example_word_target: "\u03BC\u03AE\u03BB\u03BF", example_word_eng: "apple", emoji: "\uD83C\uDF4E" },
  { letter_upper: "\u039D", letter_lower: "\u03BD", letter_name: "\u03BD\u03B9", transliteration: "ni", sound: "n", example_word_target: "\u03BD\u03B5\u03C1\u03CC", example_word_eng: "water", emoji: "\uD83D\uDCA7" },
  { letter_upper: "\u039E", letter_lower: "\u03BE", letter_name: "\u03BA\u03C3\u03B9", transliteration: "ksi", sound: "ks", example_word_target: "\u03BE\u03CD\u03BB\u03BF", example_word_eng: "wood", emoji: "\uD83E\uDEB5" },
  { letter_upper: "\u039F", letter_lower: "\u03BF", letter_name: "\u03CC\u03BC\u03B9\u03BA\u03C1\u03BF\u03BD", transliteration: "ómikron", sound: "o", example_word_target: "\u03BF\u03BC\u03C0\u03C1\u03AD\u03BB\u03B1", example_word_eng: "umbrella", emoji: "\u2602\uFE0F" },
  { letter_upper: "\u03A0", letter_lower: "\u03C0", letter_name: "\u03C0\u03B9", transliteration: "pi", sound: "p", example_word_target: "\u03C0\u03CC\u03C1\u03C4\u03B1", example_word_eng: "door", emoji: "\uD83D\uDEAA" },
  { letter_upper: "\u03A1", letter_lower: "\u03C1", letter_name: "\u03C1\u03BF", transliteration: "ro", sound: "r", example_word_target: "\u03C1\u03BF\u03BB\u03CC\u03B9", example_word_eng: "clock", emoji: "\u23F0" },
  { letter_upper: "\u03A3", letter_lower: "\u03C3", letter_name: "\u03C3\u03AF\u03B3\u03BC\u03B1", transliteration: "sígma", sound: "s", example_word_target: "\u03C3\u03BA\u03CD\u03BB\u03BF\u03C2", example_word_eng: "dog", emoji: "\uD83D\uDC15" },
  { letter_upper: "\u03A4", letter_lower: "\u03C4", letter_name: "\u03C4\u03B1\u03C6", transliteration: "taf", sound: "t", example_word_target: "\u03C4\u03C5\u03C1\u03AF", example_word_eng: "cheese", emoji: "\uD83E\uDDC0" },
  { letter_upper: "\u03A5", letter_lower: "\u03C5", letter_name: "\u03CD\u03C8\u03B9\u03BB\u03BF\u03BD", transliteration: "ýpsilon", sound: "i", example_word_target: "\u03CD\u03C0\u03BD\u03BF\u03C2", example_word_eng: "sleep", emoji: "\uD83D\uDE34" },
  { letter_upper: "\u03A6", letter_lower: "\u03C6", letter_name: "\u03C6\u03B9", transliteration: "fi", sound: "f", example_word_target: "\u03C6\u03B5\u03B3\u03B3\u03AC\u03C1\u03B9", example_word_eng: "moon", emoji: "\uD83C\uDF19" },
  { letter_upper: "\u03A7", letter_lower: "\u03C7", letter_name: "\u03C7\u03B9", transliteration: "chi", sound: "ch", example_word_target: "\u03C7\u03B5\u03BB\u03CE\u03BD\u03B1", example_word_eng: "turtle", emoji: "\uD83D\uDC22" },
  { letter_upper: "\u03A8", letter_lower: "\u03C8", letter_name: "\u03C8\u03B9", transliteration: "psi", sound: "ps", example_word_target: "\u03C8\u03AC\u03C1\u03B9", example_word_eng: "fish", emoji: "\uD83D\uDC1F" },
  { letter_upper: "\u03A9", letter_lower: "\u03C9", letter_name: "\u03C9\u03BC\u03AD\u03B3\u03B1", transliteration: "oméga", sound: "o", example_word_target: "\u03CE\u03C1\u03B1", example_word_eng: "hour", emoji: "\uD83D\uDD50" },
];

// ── Armenian alphabet (38 letters, Western Armenian pronunciation) ──
const ARMENIAN_LETTERS: LetterData[] = [
  // 1-9: Alphabet Part 1
  { letter_upper: "\u0531", letter_lower: "\u0561", letter_name: "\u0561\u0575\u0562", transliteration: "ayp", sound: "a", example_word_target: "\u0561\u0574\u057A", example_word_eng: "cloud", emoji: "\u2601\uFE0F" },
  { letter_upper: "\u0532", letter_lower: "\u0562", letter_name: "\u0562\u0565\u0576", transliteration: "pen", sound: "p", example_word_target: "\u0562\u0561\u057C", example_word_eng: "word", emoji: "\uD83D\uDCDD" },
  { letter_upper: "\u0533", letter_lower: "\u0563", letter_name: "\u0563\u056B\u0574", transliteration: "kim", sound: "k", example_word_target: "\u0563\u056B\u0580\u0584", example_word_eng: "book", emoji: "\uD83D\uDCD6" },
  { letter_upper: "\u0534", letter_lower: "\u0564", letter_name: "\u0564\u0561", transliteration: "ta", sound: "t", example_word_target: "\u0564\u0578\u0582\u057C", example_word_eng: "door", emoji: "\uD83D\uDEAA" },
  { letter_upper: "\u0535", letter_lower: "\u0565", letter_name: "\u0565\u0579", transliteration: "yech", sound: "ye", example_word_target: "\u0565\u056F\u0565\u0572\u0565\u0581\u056B", example_word_eng: "church", emoji: "\u26EA" },
  { letter_upper: "\u0536", letter_lower: "\u0566", letter_name: "\u0566\u0561", transliteration: "za", sound: "z", example_word_target: "\u0566\u0561\u0576\u0563", example_word_eng: "bell", emoji: "\uD83D\uDD14" },
  { letter_upper: "\u0537", letter_lower: "\u0567", letter_name: "\u0567", transliteration: "eh", sound: "e", example_word_target: "\u0567\u057B", example_word_eng: "page", emoji: "\uD83D\uDCC4" },
  { letter_upper: "\u0538", letter_lower: "\u0568", letter_name: "\u0568\u0569", transliteration: "ut", sound: "u", example_word_target: "\u0568\u0576\u057F\u0561\u0576\u056B\u0584", example_word_eng: "family", emoji: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67" },
  { letter_upper: "\u0539", letter_lower: "\u0569", letter_name: "\u0569\u0578", transliteration: "to", sound: "t'", example_word_target: "\u0569\u056B\u057C", example_word_eng: "bird", emoji: "\uD83D\uDC26" },
  // 10-18: Alphabet Part 2
  { letter_upper: "\u053A", letter_lower: "\u056A", letter_name: "\u056A\u0567", transliteration: "zhe", sound: "zh", example_word_target: "\u056A\u0561\u0574", example_word_eng: "hour", emoji: "\u23F0" },
  { letter_upper: "\u053B", letter_lower: "\u056B", letter_name: "\u056B\u0576\u056B", transliteration: "ini", sound: "i", example_word_target: "\u056B\u0576\u0584", example_word_eng: "self", emoji: "\uD83E\uDDD1" },
  { letter_upper: "\u053C", letter_lower: "\u056C", letter_name: "\u056C\u056B\u0582\u0576", transliteration: "liun", sound: "l", example_word_target: "\u056C\u0578\u0582\u057D\u056B\u0576", example_word_eng: "light", emoji: "\uD83D\uDCA1" },
  { letter_upper: "\u053D", letter_lower: "\u056D", letter_name: "\u056D\u0567", transliteration: "khe", sound: "kh", example_word_target: "\u056D\u0576\u0571\u0578\u0580", example_word_eng: "apple", emoji: "\uD83C\uDF4E" },
  { letter_upper: "\u053E", letter_lower: "\u056E", letter_name: "\u056E\u0561", transliteration: "dza", sound: "dz", example_word_target: "\u056E\u0561\u057C", example_word_eng: "tree", emoji: "\uD83C\uDF33" },
  { letter_upper: "\u053F", letter_lower: "\u056F", letter_name: "\u0563\u0565\u0576", transliteration: "gen", sound: "g", example_word_target: "\u056F\u0561\u057F\u0578\u0582", example_word_eng: "cat", emoji: "\uD83D\uDC31" },
  { letter_upper: "\u0540", letter_lower: "\u0570", letter_name: "\u0570\u0578", transliteration: "ho", sound: "h", example_word_target: "\u0570\u0561\u0581", example_word_eng: "bread", emoji: "\uD83C\uDF5E" },
  { letter_upper: "\u0541", letter_lower: "\u0571", letter_name: "\u0571\u0561", transliteration: "tsa", sound: "ts", example_word_target: "\u0571\u0578\u0582\u056F", example_word_eng: "fish", emoji: "\uD83D\uDC1F" },
  { letter_upper: "\u0542", letter_lower: "\u0572", letter_name: "\u0572\u0561\u057F", transliteration: "ghat", sound: "gh", example_word_target: "\u0572\u0565\u056F", example_word_eng: "beautiful", emoji: "\u2728" },
  // 19-27: Alphabet Part 3
  { letter_upper: "\u0543", letter_lower: "\u0573", letter_name: "\u0573\u0567", transliteration: "je", sound: "j", example_word_target: "\u0573\u0578\u0582\u0580", example_word_eng: "water", emoji: "\uD83D\uDCA7" },
  { letter_upper: "\u0544", letter_lower: "\u0574", letter_name: "\u0574\u0565\u0576", transliteration: "men", sound: "m", example_word_target: "\u0574\u0561\u0574\u0561", example_word_eng: "mother", emoji: "\uD83D\uDC69" },
  { letter_upper: "\u0545", letter_lower: "\u0575", letter_name: "\u0575\u056B", transliteration: "yi", sound: "y", example_word_target: "\u0575\u0578\u0569", example_word_eng: "seven", emoji: "7\uFE0F\u20E3" },
  { letter_upper: "\u0546", letter_lower: "\u0576", letter_name: "\u0576\u0578\u0582", transliteration: "nu", sound: "n", example_word_target: "\u0576\u0561\u0580\u0576\u057B", example_word_eng: "orange", emoji: "\uD83C\uDF4A" },
  { letter_upper: "\u0547", letter_lower: "\u0577", letter_name: "\u0577\u0561", transliteration: "sha", sound: "sh", example_word_target: "\u0577\u0578\u0582\u0576", example_word_eng: "dog", emoji: "\uD83D\uDC15" },
  { letter_upper: "\u0548", letter_lower: "\u0578", letter_name: "\u0578", transliteration: "vo", sound: "o", example_word_target: "\u0578\u057F\u0584", example_word_eng: "foot", emoji: "\uD83E\uDDB6" },
  { letter_upper: "\u0549", letter_lower: "\u0579", letter_name: "\u0579\u0561", transliteration: "cha", sound: "ch", example_word_target: "\u0579\u0578\u0580\u057D", example_word_eng: "four", emoji: "4\uFE0F\u20E3" },
  { letter_upper: "\u054A", letter_lower: "\u057A", letter_name: "\u057A\u0567", transliteration: "be", sound: "b", example_word_target: "\u057A\u0561\u057F\u0578\u0582\u0570\u0561\u0576", example_word_eng: "window", emoji: "\uD83E\uDE9F" },
  { letter_upper: "\u054B", letter_lower: "\u057B", letter_name: "\u057B\u0567", transliteration: "che", sound: "ch", example_word_target: "\u057B\u0565\u0580\u0574\u0561\u056F", example_word_eng: "warm", emoji: "\u2600\uFE0F" },
  // 28-38: Alphabet Part 4
  { letter_upper: "\u054C", letter_lower: "\u057C", letter_name: "\u057C\u0561", transliteration: "ra", sound: "r", example_word_target: "\u057C\u0561\u0564\u056B\u0578", example_word_eng: "radio", emoji: "\uD83D\uDCFB" },
  { letter_upper: "\u054D", letter_lower: "\u057D", letter_name: "\u057D\u0567", transliteration: "se", sound: "s", example_word_target: "\u057D\u0565\u0572\u0561\u0576", example_word_eng: "table", emoji: "\uD83E\uDE91" },
  { letter_upper: "\u054E", letter_lower: "\u057E", letter_name: "\u057E\u0565\u0582", transliteration: "vev", sound: "v", example_word_target: "\u057E\u0561\u0580\u0564", example_word_eng: "rose", emoji: "\uD83C\uDF39" },
  { letter_upper: "\u054F", letter_lower: "\u057F", letter_name: "\u057F\u056B\u0582\u0576", transliteration: "diun", sound: "d", example_word_target: "\u057F\u0578\u0582\u0576", example_word_eng: "house", emoji: "\uD83C\uDFE0" },
  { letter_upper: "\u0550", letter_lower: "\u0580", letter_name: "\u0580\u0567", transliteration: "re", sound: "r", example_word_target: "\u0580\u0561\u0576\u0581\u0584", example_word_eng: "lunch", emoji: "\uD83C\uDF5D" },
  { letter_upper: "\u0551", letter_lower: "\u0581", letter_name: "\u0581\u0578", transliteration: "tso", sound: "ts'", example_word_target: "\u0581\u0578\u0580\u0565\u0576", example_word_eng: "wheat", emoji: "\uD83C\uDF3E" },
  { letter_upper: "\u0552", letter_lower: "\u0582", letter_name: "\u0582\u056B\u0582", transliteration: "hiun", sound: "u", example_word_target: "\u0578\u0582\u057D\u0578\u0582\u0581\u056B\u0579", example_word_eng: "teacher", emoji: "\uD83D\uDC69\u200D\uD83C\uDFEB" },
  { letter_upper: "\u0553", letter_lower: "\u0583", letter_name: "\u0583\u056B\u0582\u0580", transliteration: "piur", sound: "p'", example_word_target: "\u0583\u0578\u0584\u0580", example_word_eng: "small", emoji: "\uD83D\uDC23" },
  { letter_upper: "\u0554", letter_lower: "\u0584", letter_name: "\u0584\u0567", transliteration: "ke", sound: "k'", example_word_target: "\u0584\u0561\u0572\u0561\u0584", example_word_eng: "city", emoji: "\uD83C\uDFD9\uFE0F" },
  { letter_upper: "\u0555", letter_lower: "\u0585", letter_name: "\u0585", transliteration: "o", sound: "o", example_word_target: "\u0585\u0564", example_word_eng: "air", emoji: "\uD83D\uDCA8" },
  { letter_upper: "\u0556", letter_lower: "\u0586", letter_name: "\u0586\u0567", transliteration: "fe", sound: "f", example_word_target: "\u0586\u0578\u0582\u0569\u057A\u0578\u056C", example_word_eng: "football", emoji: "\u26BD" },
];

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log(`\n\uD83D\uDD24 Hardcoded Alphabet Seeder`);
  console.log(`   Locale: ${localeArg}`);
  console.log(`   Mode:   ${exercisesOnly ? "exercises only" : "content + exercises"}`);
  console.log(`   URL:    ${BASE_URL}\n`);

  // Fetch alphabet lessons for this locale
  const { data: allLessons, error } = await db
    .from("curriculum_lessons")
    .select(`
      id, slug, title, template_type, sort_order, unit_id,
      curriculum_units!inner(
        id, slug, title, sort_order,
        curriculum_levels!inner(locale)
      )
    `)
    .eq("is_active", true)
    .order("sort_order");

  if (error || !allLessons) {
    console.error("Failed to fetch lessons:", error?.message);
    process.exit(1);
  }

  type Row = typeof allLessons[0] & {
    curriculum_units: { id: string; slug: string; title: string; sort_order: number; curriculum_levels: { locale: string } };
  };

  const lessons = (allLessons as unknown as Row[])
    .filter((l) => l.curriculum_units.curriculum_levels.locale === localeArg)
    .sort((a, b) => {
      if (a.curriculum_units.sort_order !== b.curriculum_units.sort_order)
        return a.curriculum_units.sort_order - b.curriculum_units.sort_order;
      return a.sort_order - b.sort_order;
    });

  const alphabetUnitIds = new Set(lessons.filter((l) => l.template_type === "alphabet").map((l) => l.unit_id));
  const alphabetLessons = lessons.filter((l) => l.template_type === "alphabet" && alphabetUnitIds.has(l.unit_id));
  const aggregateLessons = lessons.filter((l) => (l.template_type === "review" || l.template_type === "quiz") && alphabetUnitIds.has(l.unit_id));

  console.log(`Found ${alphabetLessons.length} alphabet lessons + ${aggregateLessons.length} review/quiz\n`);

  if (alphabetLessons.length === 0) {
    console.log("No alphabet lessons found for this locale.");
    return;
  }

  // ── Content seeding ────────────────────────────────────────
  if (!exercisesOnly) {
    if (localeArg === "el") {
      console.log("\u2550\u2550\u2550 Seeding Greek alphabet content \u2550\u2550\u2550\n");

      // Clean existing
      const allIds = [...alphabetLessons.map((l) => l.id), ...aggregateLessons.map((l) => l.id)];
      await db.from("curated_exercises").delete().in("lesson_id", allIds);
      await db.from("content_items").delete().in("lesson_id", alphabetLessons.map((l) => l.id));
      console.log("  \uD83D\uDDD1  Cleaned existing content + exercises\n");

      // Distribute 24 letters across 12 lessons (2 per lesson)
      if (alphabetLessons.length !== 12) {
        console.warn(`  Warning: expected 12 alphabet lessons, found ${alphabetLessons.length}`);
      }

      let letterIdx = 0;
      for (const lesson of alphabetLessons) {
        const unit = lesson.curriculum_units;
        const lettersForLesson = GREEK_LETTERS.slice(letterIdx, letterIdx + 2);
        letterIdx += 2;

        if (lettersForLesson.length === 0) continue;

        const rows = lettersForLesson.map((l, i) => ({
          unit_id: unit.id,
          lesson_id: lesson.id,
          item_type: "letter",
          sort_order: i + 1,
          item_data: l,
          created_by: null,
        }));

        const { error: insertErr } = await db.from("content_items").insert(rows);
        const names = lettersForLesson.map((l) => `${l.letter_upper}${l.letter_lower}`).join(" ");
        if (insertErr) {
          console.error(`  \u274C ${unit.title} > ${lesson.title}: ${insertErr.message}`);
        } else {
          console.log(`  \u2705 ${unit.title} > ${lesson.title}: ${names}`);
        }
      }

      console.log(`\n  Inserted ${Math.min(letterIdx, GREEK_LETTERS.length)} Greek letters\n`);

    } else {
      // Armenian: hardcoded 38 letters
      console.log("\u2550\u2550\u2550 Seeding Armenian alphabet content \u2550\u2550\u2550\n");

      const allIds = [...alphabetLessons.map((l) => l.id), ...aggregateLessons.map((l) => l.id)];
      await db.from("curated_exercises").delete().in("lesson_id", allIds);
      await db.from("content_items").delete().in("lesson_id", alphabetLessons.map((l) => l.id));
      console.log("  \uD83D\uDDD1  Cleaned existing content + exercises\n");

      // 38 letters across 12 lessons: 3 per lesson, last 2 lessons get 4
      // Distribution: 3,3,3 | 3,3,3 | 3,3,3 | 3,4,4 (= 9+9+9+11 = 38)
      const LETTERS_PER_LESSON = [3,3,3, 3,3,3, 3,3,3, 3,4,4];

      let letterIdx = 0;
      for (let li = 0; li < alphabetLessons.length; li++) {
        const lesson = alphabetLessons[li];
        const unit = lesson.curriculum_units;
        const count = LETTERS_PER_LESSON[li] ?? 3;
        const lettersForLesson = ARMENIAN_LETTERS.slice(letterIdx, letterIdx + count);
        letterIdx += count;

        if (lettersForLesson.length === 0) continue;

        const rows = lettersForLesson.map((l, i) => ({
          unit_id: unit.id,
          lesson_id: lesson.id,
          item_type: "letter",
          sort_order: i + 1,
          item_data: l,
          created_by: null,
        }));

        const { error: insertErr } = await db.from("content_items").insert(rows);
        const names = lettersForLesson.map((l) => `${l.letter_upper}${l.letter_lower}`).join(" ");
        if (insertErr) {
          console.error(`  \u274C ${unit.title} > ${lesson.title}: ${insertErr.message}`);
        } else {
          console.log(`  \u2705 ${unit.title} > ${lesson.title}: ${names}`);
        }
      }

      console.log(`\n  Inserted ${Math.min(letterIdx, ARMENIAN_LETTERS.length)} Armenian letters\n`);
    }
  }

  // ── Exercise generation ────────────────────────────────────
  console.log("\u2550\u2550\u2550 Generating exercises \u2550\u2550\u2550\n");

  let successes = 0;
  let failures = 0;

  for (const lesson of alphabetLessons) {
    const label = `${lesson.curriculum_units.title} > ${lesson.title}`;
    try {
      const res = await fetch(`${BASE_URL}/api/generate-lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lesson.id, key: SEED_KEY }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as Record<string, string>).error ?? `${res.status}`);
      }
      const data = await res.json();
      console.log(`  \u2705 ${label}: ${data.count ?? 0} exercises`);
      successes++;
    } catch (err) {
      console.error(`  \u274C ${label}: ${err instanceof Error ? err.message : err}`);
      failures++;
    }
    await sleep(500);
  }

  console.log("\n\u2550\u2550\u2550 Review/Quiz exercises \u2550\u2550\u2550\n");

  for (const lesson of aggregateLessons) {
    const label = `${lesson.curriculum_units.title} > ${lesson.title}`;
    try {
      const res = await fetch(`${BASE_URL}/api/generate-lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lesson.id, key: SEED_KEY }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as Record<string, string>).error ?? `${res.status}`);
      }
      const data = await res.json();
      console.log(`  \u2705 ${label}: ${data.count ?? 0} exercises`);
      successes++;
    } catch (err) {
      console.error(`  \u274C ${label}: ${err instanceof Error ? err.message : err}`);
      failures++;
    }
    await sleep(500);
  }

  console.log(`\n\u2728 Done! ${successes} succeeded, ${failures} failed`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
