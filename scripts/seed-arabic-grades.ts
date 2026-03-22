/**
 * Seed Arabic grades 1-5 curriculum: levels, units, lessons, content_items, exercises.
 * Mirrors the Armenian/Greek structure using generateLessonContent template engine.
 *
 * Usage: npx tsx scripts/seed-arabic-grades.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { generateLessonContent } from "../lib/lesson-templates";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("Missing env vars"); process.exit(1); }

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

interface WordData {
  target_lang: string;
  english: string;
  emoji: string;
  category: string;
}

// ── GRADE DEFINITIONS ────────────────────────────────────────
interface UnitDef {
  title: string;
  slug: string;
  lessons: { title: string; words: WordData[] }[];
}

interface GradeDef {
  gradeValue: string;
  title: string;
  slug: string;
  description: string;
  sortOrder: number;
  units: UnitDef[];
}

const GRADES: GradeDef[] = [
  {
    gradeValue: "1", title: "Grade 1", slug: "grade-1-ar", description: "Reading skills, expanded vocabulary, simple sentences",
    sortOrder: 2,
    units: [
      { title: "Reading Basics", slug: "reading-basics-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u0643\u062A\u0627\u0628", english: "book", emoji: "\uD83D\uDCD6", category: "school" }, { target_lang: "\u0642\u0644\u0645", english: "pen", emoji: "\u270F\uFE0F", category: "school" }, { target_lang: "\u0645\u062F\u0631\u0633\u0629", english: "school", emoji: "\uD83C\uDFEB", category: "school" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u0645\u0639\u0644\u0645", english: "teacher", emoji: "\uD83D\uDC69\u200D\uD83C\uDFEB", category: "school" }, { target_lang: "\u0635\u0641", english: "class", emoji: "\uD83C\uDFEB", category: "school" }, { target_lang: "\u062A\u0644\u0645\u064A\u0630", english: "student", emoji: "\uD83D\uDC66", category: "school" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u0648\u0631\u0642\u0629", english: "paper", emoji: "\uD83D\uDCC4", category: "school" }, { target_lang: "\u0635\u0641\u062D\u0629", english: "page", emoji: "\uD83D\uDCC3", category: "school" }, { target_lang: "\u0642\u0635\u0629", english: "story", emoji: "\uD83D\uDCDA", category: "school" }] },
      ]},
      { title: "Everyday Words", slug: "everyday-words-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u0641\u0637\u0648\u0631", english: "breakfast", emoji: "\uD83E\uDD50", category: "food" }, { target_lang: "\u063A\u062F\u0627\u0621", english: "lunch", emoji: "\uD83C\uDF5D", category: "food" }, { target_lang: "\u0639\u0634\u0627\u0621", english: "dinner", emoji: "\uD83C\uDF72", category: "food" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u0645\u0637\u0628\u062E", english: "kitchen", emoji: "\uD83C\uDF73", category: "home" }, { target_lang: "\u063A\u0631\u0641\u0629", english: "room", emoji: "\uD83D\uDECF\uFE0F", category: "home" }, { target_lang: "\u0628\u0627\u0628", english: "door", emoji: "\uD83D\uDEAA", category: "home" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u0645\u0644\u0627\u0628\u0633", english: "clothes", emoji: "\uD83D\uDC55", category: "clothing" }, { target_lang: "\u062D\u0630\u0627\u0621", english: "shoes", emoji: "\uD83D\uDC5F", category: "clothing" }, { target_lang: "\u0642\u0628\u0639\u0629", english: "hat", emoji: "\uD83E\uDDE2", category: "clothing" }] },
      ]},
      { title: "Simple Sentences", slug: "simple-sentences-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u0623\u0646\u0627", english: "I", emoji: "\uD83D\uDE4B", category: "pronoun" }, { target_lang: "\u0623\u0646\u062A", english: "you", emoji: "\uD83D\uDC49", category: "pronoun" }, { target_lang: "\u0647\u0648", english: "he", emoji: "\uD83D\uDC66", category: "pronoun" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u0643\u0628\u064A\u0631", english: "big", emoji: "\uD83D\uDC18", category: "adjective" }, { target_lang: "\u0635\u063A\u064A\u0631", english: "small", emoji: "\uD83D\uDC1C", category: "adjective" }, { target_lang: "\u0633\u0639\u064A\u062F", english: "happy", emoji: "\uD83D\uDE04", category: "adjective" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u064A\u0623\u0643\u0644", english: "to eat", emoji: "\uD83C\uDF7D\uFE0F", category: "verb" }, { target_lang: "\u064A\u0634\u0631\u0628", english: "to drink", emoji: "\uD83E\uDD64", category: "verb" }, { target_lang: "\u064A\u0644\u0639\u0628", english: "to play", emoji: "\u26BD", category: "verb" }] },
      ]},
    ],
  },
  {
    gradeValue: "2", title: "Grade 2", slug: "grade-2-ar", description: "Reading comprehension, grammar basics, cultural awareness",
    sortOrder: 3,
    units: [
      { title: "Reading Basics", slug: "reading-basics-2-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u0637\u0642\u0633", english: "weather", emoji: "\u2600\uFE0F", category: "nature" }, { target_lang: "\u0645\u0637\u0631", english: "rain", emoji: "\uD83C\uDF27\uFE0F", category: "nature" }, { target_lang: "\u062B\u0644\u062C", english: "snow", emoji: "\u2744\uFE0F", category: "nature" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u0631\u0628\u064A\u0639", english: "spring", emoji: "\uD83C\uDF38", category: "seasons" }, { target_lang: "\u0635\u064A\u0641", english: "summer", emoji: "\u2600\uFE0F", category: "seasons" }, { target_lang: "\u0634\u062A\u0627\u0621", english: "winter", emoji: "\u2744\uFE0F", category: "seasons" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u064A\u0648\u0645", english: "day", emoji: "\uD83C\uDF1E", category: "time" }, { target_lang: "\u0644\u064A\u0644", english: "night", emoji: "\uD83C\uDF19", category: "time" }, { target_lang: "\u0635\u0628\u0627\u062D", english: "morning", emoji: "\uD83C\uDF05", category: "time" }] },
      ]},
      { title: "Everyday Words", slug: "everyday-words-2-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u0637\u0628\u064A\u0628", english: "doctor", emoji: "\uD83D\uDC69\u200D\u2695\uFE0F", category: "profession" }, { target_lang: "\u0634\u0631\u0637\u064A", english: "police", emoji: "\uD83D\uDC6E", category: "profession" }, { target_lang: "\u0645\u0647\u0646\u062F\u0633", english: "engineer", emoji: "\uD83D\uDC77", category: "profession" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u0633\u0648\u0642", english: "market", emoji: "\uD83C\uDFEA", category: "places" }, { target_lang: "\u0645\u0633\u062C\u062F", english: "mosque", emoji: "\uD83D\uDD4C", category: "places" }, { target_lang: "\u062D\u062F\u064A\u0642\u0629", english: "garden", emoji: "\uD83C\uDF3B", category: "places" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u0633\u064A\u0627\u0631\u0629", english: "car", emoji: "\uD83D\uDE97", category: "transport" }, { target_lang: "\u062D\u0627\u0641\u0644\u0629", english: "bus", emoji: "\uD83D\uDE8C", category: "transport" }, { target_lang: "\u0637\u0627\u0626\u0631\u0629", english: "airplane", emoji: "\u2708\uFE0F", category: "transport" }] },
      ]},
      { title: "Simple Sentences", slug: "simple-sentences-2-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u0647\u064A", english: "she", emoji: "\uD83D\uDC67", category: "pronoun" }, { target_lang: "\u0646\u062D\u0646", english: "we", emoji: "\uD83D\uDC6B", category: "pronoun" }, { target_lang: "\u0647\u0645", english: "they", emoji: "\uD83D\uDC65", category: "pronoun" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u0641\u0648\u0642", english: "above", emoji: "\u2B06\uFE0F", category: "preposition" }, { target_lang: "\u062A\u062D\u062A", english: "under", emoji: "\u2B07\uFE0F", category: "preposition" }, { target_lang: "\u0628\u064A\u0646", english: "between", emoji: "\u2194\uFE0F", category: "preposition" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u064A\u0643\u062A\u0628", english: "to write", emoji: "\u270D\uFE0F", category: "verb" }, { target_lang: "\u064A\u0642\u0631\u0623", english: "to read", emoji: "\uD83D\uDCD6", category: "verb" }, { target_lang: "\u064A\u0631\u0633\u0645", english: "to draw", emoji: "\uD83C\uDFA8", category: "verb" }] },
      ]},
    ],
  },
  {
    gradeValue: "3", title: "Grade 3", slug: "grade-3-ar", description: "Intermediate vocabulary, verb conjugation, cultural content",
    sortOrder: 4,
    units: [
      { title: "Grammar Foundations", slug: "grammar-foundations-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u062C\u0645\u064A\u0644", english: "beautiful", emoji: "\uD83C\uDF3A", category: "adjective" }, { target_lang: "\u0642\u0648\u064A", english: "strong", emoji: "\uD83D\uDCAA", category: "adjective" }, { target_lang: "\u0630\u0643\u064A", english: "smart", emoji: "\uD83E\uDDE0", category: "adjective" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u0635\u062F\u0627\u0642\u0629", english: "friendship", emoji: "\uD83E\uDD1D", category: "abstract" }, { target_lang: "\u0639\u0627\u0626\u0644\u0629", english: "family", emoji: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", category: "abstract" }, { target_lang: "\u062D\u0628", english: "love", emoji: "\u2764\uFE0F", category: "abstract" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u064A\u0630\u0647\u0628", english: "to go", emoji: "\uD83D\uDEB6", category: "verb" }, { target_lang: "\u064A\u0623\u062A\u064A", english: "to come", emoji: "\uD83D\uDC4B", category: "verb" }, { target_lang: "\u064A\u0639\u0645\u0644", english: "to work", emoji: "\uD83D\uDCBC", category: "verb" }] },
      ]},
      { title: "Reading Comprehension", slug: "reading-comprehension-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u0645\u062F\u064A\u0646\u0629", english: "city", emoji: "\uD83C\uDFD9\uFE0F", category: "places" }, { target_lang: "\u0642\u0631\u064A\u0629", english: "village", emoji: "\uD83C\uDFE1", category: "places" }, { target_lang: "\u0634\u0627\u0631\u0639", english: "street", emoji: "\uD83D\uDEE3\uFE0F", category: "places" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u062A\u0627\u0631\u064A\u062E", english: "history", emoji: "\uD83D\uDCDC", category: "academic" }, { target_lang: "\u062B\u0642\u0627\u0641\u0629", english: "culture", emoji: "\uD83C\uDFAD", category: "academic" }, { target_lang: "\u062A\u0631\u0627\u062B", english: "heritage", emoji: "\uD83C\uDFDB\uFE0F", category: "academic" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u0639\u0631\u0628\u064A", english: "Arabic", emoji: "\uD83C\uDDF8\uD83C\uDDE6", category: "language" }, { target_lang: "\u0644\u063A\u0629", english: "language", emoji: "\uD83D\uDDE3\uFE0F", category: "language" }, { target_lang: "\u0643\u0644\u0645\u0629", english: "word", emoji: "\uD83D\uDCDD", category: "language" }] },
      ]},
      { title: "Writing Practice", slug: "writing-practice-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u062C\u0645\u0644\u0629", english: "sentence", emoji: "\u270D\uFE0F", category: "grammar" }, { target_lang: "\u0641\u0639\u0644", english: "verb", emoji: "\uD83C\uDFC3", category: "grammar" }, { target_lang: "\u0627\u0633\u0645", english: "noun", emoji: "\uD83D\uDCCC", category: "grammar" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u0633\u0624\u0627\u0644", english: "question", emoji: "\u2753", category: "grammar" }, { target_lang: "\u062C\u0648\u0627\u0628", english: "answer", emoji: "\u2714\uFE0F", category: "grammar" }, { target_lang: "\u0631\u0623\u064A", english: "opinion", emoji: "\uD83D\uDCAD", category: "grammar" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u0645\u0639\u0646\u0649", english: "meaning", emoji: "\uD83D\uDCA1", category: "grammar" }, { target_lang: "\u0641\u0643\u0631\u0629", english: "idea", emoji: "\uD83D\uDCA1", category: "grammar" }, { target_lang: "\u0648\u0635\u0641", english: "description", emoji: "\uD83D\uDCDD", category: "grammar" }] },
      ]},
    ],
  },
  {
    gradeValue: "4", title: "Grade 4", slug: "grade-4-ar", description: "Advanced reading, complex grammar, Arabic literature",
    sortOrder: 5,
    units: [
      { title: "Advanced Grammar", slug: "advanced-grammar-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u0645\u0627\u0636\u064A", english: "past", emoji: "\u23EA", category: "tense" }, { target_lang: "\u062D\u0627\u0636\u0631", english: "present", emoji: "\u25B6\uFE0F", category: "tense" }, { target_lang: "\u0645\u0633\u062A\u0642\u0628\u0644", english: "future", emoji: "\u23E9", category: "tense" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u0644\u0623\u0646", english: "because", emoji: "\uD83D\uDCA1", category: "conjunction" }, { target_lang: "\u0644\u0643\u0646", english: "but", emoji: "\u2194\uFE0F", category: "conjunction" }, { target_lang: "\u0625\u0630\u0627", english: "if", emoji: "\u2753", category: "conjunction" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u062A\u0639\u0644\u064A\u0645", english: "education", emoji: "\uD83C\uDF93", category: "academic" }, { target_lang: "\u0639\u0644\u0645", english: "science", emoji: "\uD83D\uDD2C", category: "academic" }, { target_lang: "\u0641\u0646", english: "art", emoji: "\uD83C\uDFA8", category: "academic" }] },
      ]},
      { title: "Arabic Literature", slug: "arabic-literature-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u0634\u0627\u0639\u0631", english: "poet", emoji: "\uD83D\uDCDC", category: "literature" }, { target_lang: "\u0642\u0635\u064A\u062F\u0629", english: "poem", emoji: "\uD83D\uDCDD", category: "literature" }, { target_lang: "\u0623\u062F\u0628", english: "literature", emoji: "\uD83D\uDCDA", category: "literature" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u062D\u0643\u0627\u064A\u0629", english: "tale", emoji: "\uD83D\uDCDA", category: "literature" }, { target_lang: "\u0628\u0637\u0644", english: "hero", emoji: "\uD83E\uDDB8", category: "literature" }, { target_lang: "\u062E\u064A\u0627\u0644", english: "imagination", emoji: "\u2728", category: "literature" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u0648\u0637\u0646", english: "homeland", emoji: "\uD83C\uDFE0", category: "culture" }, { target_lang: "\u062A\u0642\u0644\u064A\u062F", english: "tradition", emoji: "\uD83C\uDF8A", category: "culture" }, { target_lang: "\u0642\u062F\u064A\u0645", english: "ancient", emoji: "\uD83C\uDFDB\uFE0F", category: "culture" }] },
      ]},
      { title: "Composition", slug: "composition-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u0645\u0642\u0627\u0644", english: "article", emoji: "\uD83D\uDCF0", category: "writing" }, { target_lang: "\u0645\u0648\u0636\u0648\u0639", english: "topic", emoji: "\uD83D\uDCCC", category: "writing" }, { target_lang: "\u0641\u0642\u0631\u0629", english: "paragraph", emoji: "\uD83D\uDCC4", category: "writing" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u0631\u0633\u0627\u0644\u0629", english: "letter", emoji: "\u2709\uFE0F", category: "writing" }, { target_lang: "\u062F\u0639\u0648\u0629", english: "invitation", emoji: "\uD83D\uDC8C", category: "writing" }, { target_lang: "\u0634\u0643\u0631", english: "thanks", emoji: "\uD83D\uDE4F", category: "writing" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u062D\u062C\u0629", english: "argument", emoji: "\uD83D\uDCAC", category: "writing" }, { target_lang: "\u062F\u0644\u064A\u0644", english: "evidence", emoji: "\uD83D\uDD0D", category: "writing" }, { target_lang: "\u0646\u062A\u064A\u062C\u0629", english: "conclusion", emoji: "\u2705", category: "writing" }] },
      ]},
    ],
  },
  {
    gradeValue: "5", title: "Grade 5", slug: "grade-5-ar", description: "Fluency building, essay writing, cultural projects",
    sortOrder: 6,
    units: [
      { title: "Advanced Grammar", slug: "advanced-grammar-5-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u0645\u0633\u0624\u0648\u0644\u064A\u0629", english: "responsibility", emoji: "\u2705", category: "abstract" }, { target_lang: "\u0627\u0633\u062A\u0642\u0644\u0627\u0644", english: "independence", emoji: "\uD83C\uDFF3\uFE0F", category: "abstract" }, { target_lang: "\u0625\u0646\u062C\u0627\u0632", english: "achievement", emoji: "\uD83C\uDFC6", category: "abstract" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u0628\u0627\u0644\u0631\u063A\u0645", english: "although", emoji: "\u2194\uFE0F", category: "conjunction" }, { target_lang: "\u0644\u0630\u0644\u0643", english: "therefore", emoji: "\u27A1\uFE0F", category: "conjunction" }, { target_lang: "\u0628\u064A\u0646\u0645\u0627", english: "while", emoji: "\u23F3", category: "conjunction" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u064A\u0646\u062C\u0632", english: "to accomplish", emoji: "\uD83C\uDFC6", category: "verb" }, { target_lang: "\u064A\u0641\u0643\u0631", english: "to think", emoji: "\uD83E\uDDD0", category: "verb" }, { target_lang: "\u064A\u0642\u0631\u0631", english: "to decide", emoji: "\u2705", category: "verb" }] },
      ]},
      { title: "Culture & History", slug: "culture-history-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u062D\u0636\u0627\u0631\u0629", english: "civilization", emoji: "\uD83C\uDFDB\uFE0F", category: "history" }, { target_lang: "\u0627\u062E\u062A\u0631\u0627\u0639", english: "invention", emoji: "\uD83D\uDCA1", category: "history" }, { target_lang: "\u0627\u0643\u062A\u0634\u0627\u0641", english: "discovery", emoji: "\uD83D\uDD2D", category: "history" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u0645\u0648\u0633\u064A\u0642\u0649", english: "music", emoji: "\uD83C\uDFB5", category: "culture" }, { target_lang: "\u0641\u0646 \u0627\u0644\u062E\u0637", english: "calligraphy", emoji: "\u270D\uFE0F", category: "culture" }, { target_lang: "\u0639\u0645\u0627\u0631\u0629", english: "architecture", emoji: "\uD83C\uDFDB\uFE0F", category: "culture" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u0633\u0644\u0627\u0645", english: "peace", emoji: "\u262E\uFE0F", category: "values" }, { target_lang: "\u0639\u062F\u0644", english: "justice", emoji: "\u2696\uFE0F", category: "values" }, { target_lang: "\u0643\u0631\u0627\u0645\u0629", english: "dignity", emoji: "\uD83C\uDF1F", category: "values" }] },
      ]},
      { title: "Composition & Expression", slug: "composition-expression-ar", lessons: [
        { title: "Lesson 1", words: [{ target_lang: "\u0645\u0642\u0627\u0644\u0629", english: "essay", emoji: "\uD83D\uDCDD", category: "writing" }, { target_lang: "\u062A\u0642\u0631\u064A\u0631", english: "report", emoji: "\uD83D\uDCCB", category: "writing" }, { target_lang: "\u0645\u0644\u062E\u0635", english: "summary", emoji: "\uD83D\uDCCA", category: "writing" }] },
        { title: "Lesson 2", words: [{ target_lang: "\u062E\u0637\u0627\u0628", english: "speech", emoji: "\uD83C\uDF99\uFE0F", category: "expression" }, { target_lang: "\u062D\u0648\u0627\u0631", english: "dialogue", emoji: "\uD83D\uDCAC", category: "expression" }, { target_lang: "\u0646\u0642\u0627\u0634", english: "discussion", emoji: "\uD83E\uDD14", category: "expression" }] },
        { title: "Lesson 3", words: [{ target_lang: "\u0625\u0628\u062F\u0627\u0639", english: "creativity", emoji: "\uD83C\uDFA8", category: "expression" }, { target_lang: "\u062A\u0639\u0628\u064A\u0631", english: "expression", emoji: "\uD83D\uDDE3\uFE0F", category: "expression" }, { target_lang: "\u0645\u0634\u0631\u0648\u0639", english: "project", emoji: "\uD83D\uDCC1", category: "expression" }] },
      ]},
    ],
  },
];

// ── MAIN SEEDER ──────────────────────────────────────────────

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("\n\uD83C\uDDF8\uD83C\uDDE6 Arabic Grades 1-5 Seeder\n");

  let totalLessons = 0;
  let totalExercises = 0;

  for (const grade of GRADES) {
    console.log(`\n=== ${grade.title} ===`);

    // Create or find level
    let { data: existingLevel } = await db.from("curriculum_levels").select("id").eq("locale", "ar").eq("slug", grade.slug).single();
    let levelId: string;
    if (existingLevel) {
      levelId = existingLevel.id;
    } else {
      const { data: newLevel, error } = await db.from("curriculum_levels").insert({
        slug: grade.slug, title: grade.title, description: grade.description,
        grade_value: grade.gradeValue, sort_order: grade.sortOrder, is_active: true, locale: "ar",
      }).select("id").single();
      if (error || !newLevel) { console.error(`  Failed to create level: ${error?.message}`); continue; }
      levelId = newLevel.id;
    }

    for (let unitIdx = 0; unitIdx < grade.units.length; unitIdx++) {
      const unit = grade.units[unitIdx];

      // Create or find unit
      let { data: existingUnit } = await db.from("curriculum_units").select("id").eq("locale", "ar").eq("slug", unit.slug).single();
      let unitId: string;
      if (existingUnit) {
        unitId = existingUnit.id;
        // Clean existing lessons
        const { data: existingLessons } = await db.from("curriculum_lessons").select("id").eq("unit_id", unitId);
        if (existingLessons) {
          const ids = existingLessons.map((l) => l.id);
          await db.from("curated_exercises").delete().in("lesson_id", ids);
          await db.from("content_items").delete().in("lesson_id", ids);
          await db.from("curriculum_lessons").delete().eq("unit_id", unitId);
        }
      } else {
        const { data: newUnit, error } = await db.from("curriculum_units").insert({
          level_id: levelId, slug: unit.slug, title: unit.title,
          sort_order: unitIdx + 1, is_active: true, locale: "ar",
        }).select("id").single();
        if (error || !newUnit) { console.error(`  Failed to create unit: ${error?.message}`); continue; }
        unitId = newUnit.id;
      }

      // Create practice lessons
      for (let lessonIdx = 0; lessonIdx < unit.lessons.length; lessonIdx++) {
        const lessonDef = unit.lessons[lessonIdx];
        const { data: lesson, error: lessonErr } = await db.from("curriculum_lessons").insert({
          unit_id: unitId, slug: slugify(`${unit.slug}-${lessonDef.title}`),
          title: lessonDef.title, lesson_type: "practice", template_type: "vocabulary",
          passing_score: 70, sort_order: lessonIdx + 1, is_active: true, locale: "ar",
        }).select("id").single();
        if (lessonErr || !lesson) { console.error(`  Lesson error: ${lessonErr?.message}`); continue; }

        // Insert content_items
        const rows = lessonDef.words.map((w, i) => ({
          unit_id: unitId, lesson_id: lesson.id, item_type: "word",
          sort_order: i + 1, item_data: w, created_by: null,
        }));
        await db.from("content_items").insert(rows);

        // Generate exercises
        const generated = generateLessonContent("vocabulary", rows.map((r, i) => ({
          id: String(i), item_type: r.item_type, sort_order: r.sort_order, item_data: r.item_data,
        })), "ar");
        await db.from("curated_exercises").insert(generated.map((ex) => ({
          lesson_id: lesson.id, exercise_type: ex.exercise_type, exercise_data: ex.exercise_data,
          sort_order: ex.sort_order, status: "approved", created_by: null,
        })));

        totalExercises += generated.length;
        totalLessons++;
        console.log(`  \u2705 ${unit.title} > ${lessonDef.title}: ${generated.length} exercises`);
      }

      // Create Review lesson
      const { data: reviewLesson } = await db.from("curriculum_lessons").insert({
        unit_id: unitId, slug: slugify(`${unit.slug}-review`),
        title: "Review", lesson_type: "practice", template_type: "review",
        passing_score: 0, sort_order: unit.lessons.length + 1, is_active: true, locale: "ar",
      }).select("id").single();
      if (reviewLesson) {
        const { data: pIds } = await db.from("curriculum_lessons").select("id").eq("unit_id", unitId).not("template_type", "in", '("review","quiz")');
        const { data: items } = await db.from("content_items").select("id, item_type, sort_order, item_data").in("lesson_id", (pIds ?? []).map((l) => l.id)).order("sort_order");
        if (items && items.length > 0) {
          const gen = generateLessonContent("review", items, "ar");
          await db.from("curated_exercises").insert(gen.map((ex) => ({
            lesson_id: reviewLesson.id, exercise_type: ex.exercise_type, exercise_data: ex.exercise_data,
            sort_order: ex.sort_order, status: "approved", created_by: null,
          })));
          totalExercises += gen.length;
          totalLessons++;
          console.log(`  \u2705 ${unit.title} > Review: ${gen.length} exercises`);
        }
      }

      // Create Quiz lesson
      const { data: quizLesson } = await db.from("curriculum_lessons").insert({
        unit_id: unitId, slug: slugify(`${unit.slug}-quiz`),
        title: "Quiz", lesson_type: "quiz", template_type: "quiz",
        passing_score: 70, sort_order: unit.lessons.length + 2, is_active: true, locale: "ar",
      }).select("id").single();
      if (quizLesson) {
        const { data: pIds } = await db.from("curriculum_lessons").select("id").eq("unit_id", unitId).not("template_type", "in", '("review","quiz")');
        const { data: items } = await db.from("content_items").select("id, item_type, sort_order, item_data").in("lesson_id", (pIds ?? []).map((l) => l.id)).order("sort_order");
        if (items && items.length > 0) {
          const gen = generateLessonContent("quiz", items, "ar");
          await db.from("curated_exercises").insert(gen.map((ex) => ({
            lesson_id: quizLesson.id, exercise_type: ex.exercise_type, exercise_data: ex.exercise_data,
            sort_order: ex.sort_order, status: "approved", created_by: null,
          })));
          totalExercises += gen.length;
          totalLessons++;
          console.log(`  \u2705 ${unit.title} > Quiz: ${gen.length} exercises`);
        }
      }
    }
  }

  // Verification
  console.log("\n=== Verification ===\n");
  const { count: arLessons } = await db.from("curriculum_lessons").select("id", { count: "exact", head: true }).eq("locale", "ar");
  console.log(`  Arabic lessons total: ${arLessons}`);
  console.log(`  Lessons seeded this run: ${totalLessons}`);
  console.log(`  Exercises seeded this run: ${totalExercises}`);

  console.log(`\n\u2728 Done!\n`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
