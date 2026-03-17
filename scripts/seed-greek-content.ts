/**
 * DiasporaLearn — Greek Content Seeder
 * scripts/seed-greek-content.ts
 *
 * Generates K-2 Greek lessons and exercises using Claude AI,
 * then inserts them into your Supabase database.
 *
 * Usage:
 *   npx tsx scripts/seed-greek-content.ts
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local  (needs write access, bypasses RLS)
 *   - ANTHROPIC_API_KEY in .env.local
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { getSystemPrompt, buildUserPrompt } from "../lib/prompts";

dotenv.config({ path: ".env.local" });

// ── Clients ───────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role bypasses RLS
  { auth: { persistSession: false } }
);

// ── Curriculum definition ─────────────────────────────────────
// Maps each unit slug to the lessons that should be generated.
// lesson_type: "learn_card" | "multiple_choice" | "fill_blank" | "matching" | "true_false" | "review" | "quiz"

interface LessonDef {
  slug: string;
  title: string;
  template_type: string;
  exerciseType: string;
  topic: string;
  exerciseCount: number;
  passing_score: number;
}

interface UnitDef {
  slug: string;
  grade: string;
  subject: string;
  lessons: LessonDef[];
}

const GREEK_CURRICULUM: UnitDef[] = [
  // ── Kindergarten ─────────────────────────────────────────────
  {
    slug: "el-k-alphabet-1",
    grade: "K",
    subject: "Greek Language",
    lessons: [
      { slug: "el-k-alph1-learn", title: "Μαθαίνω τα Γράμματα Α–Η", template_type: "learn_card", exerciseType: "learn_card", topic: "Greek letters Α through Η", exerciseCount: 8, passing_score: 70 },
      { slug: "el-k-alph1-match", title: "Ταιριάζω τα Γράμματα", template_type: "matching", exerciseType: "matching", topic: "Match Greek letters Α–Η with their names", exerciseCount: 6, passing_score: 70 },
      { slug: "el-k-alph1-quiz",  title: "Κουίζ: Γράμματα Α–Η", template_type: "quiz", exerciseType: "multiple_choice", topic: "Greek letters Α through Η", exerciseCount: 5, passing_score: 60 },
    ],
  },
  {
    slug: "el-k-alphabet-2",
    grade: "K",
    subject: "Greek Language",
    lessons: [
      { slug: "el-k-alph2-learn", title: "Μαθαίνω τα Γράμματα Θ–Ο", template_type: "learn_card", exerciseType: "learn_card", topic: "Greek letters Θ through Ο", exerciseCount: 8, passing_score: 70 },
      { slug: "el-k-alph2-match", title: "Ταιριάζω τα Γράμματα", template_type: "matching", exerciseType: "matching", topic: "Match Greek letters Θ–Ο with their names", exerciseCount: 6, passing_score: 70 },
      { slug: "el-k-alph2-quiz",  title: "Κουίζ: Γράμματα Θ–Ο", template_type: "quiz", exerciseType: "multiple_choice", topic: "Greek letters Θ through Ο", exerciseCount: 5, passing_score: 60 },
    ],
  },
  {
    slug: "el-k-alphabet-3",
    grade: "K",
    subject: "Greek Language",
    lessons: [
      { slug: "el-k-alph3-learn", title: "Μαθαίνω τα Γράμματα Π–Ω", template_type: "learn_card", exerciseType: "learn_card", topic: "Greek letters Π through Ω", exerciseCount: 9, passing_score: 70 },
      { slug: "el-k-alph3-match", title: "Ταιριάζω τα Γράμματα", template_type: "matching", exerciseType: "matching", topic: "Match Greek letters Π–Ω with their names", exerciseCount: 6, passing_score: 70 },
      { slug: "el-k-alph3-quiz",  title: "Κουίζ: Ολόκληρο Αλφάβητο", template_type: "quiz", exerciseType: "multiple_choice", topic: "Full Greek alphabet review", exerciseCount: 8, passing_score: 60 },
    ],
  },
  {
    slug: "el-k-greetings",
    grade: "K",
    subject: "Greek Language",
    lessons: [
      { slug: "el-k-greet-learn",  title: "Χαιρετισμοί", template_type: "learn_card", exerciseType: "learn_card", topic: "Greek greetings: hello, goodbye, good morning, good night, please, thank you", exerciseCount: 6, passing_score: 70 },
      { slug: "el-k-greet-match",  title: "Ταιριάζω Χαιρετισμούς", template_type: "matching", exerciseType: "matching", topic: "Match Greek greetings to their meaning", exerciseCount: 5, passing_score: 70 },
      { slug: "el-k-greet-choice", title: "Διαλέγω τον Χαιρετισμό", template_type: "multiple_choice", exerciseType: "multiple_choice", topic: "Choosing the right Greek greeting for a situation", exerciseCount: 5, passing_score: 70 },
    ],
  },
  {
    slug: "el-k-colors",
    grade: "K",
    subject: "Greek Language",
    lessons: [
      { slug: "el-k-colors-learn",  title: "Τα Χρώματα", template_type: "learn_card", exerciseType: "learn_card", topic: "Greek colors: red, blue, green, yellow, orange, purple, black, white", exerciseCount: 8, passing_score: 70 },
      { slug: "el-k-numbers-learn", title: "Οι Αριθμοί 1–10", template_type: "learn_card", exerciseType: "learn_card", topic: "Greek numbers 1 through 10", exerciseCount: 10, passing_score: 70 },
      { slug: "el-k-colors-quiz",   title: "Κουίζ: Χρώματα και Αριθμοί", template_type: "quiz", exerciseType: "multiple_choice", topic: "Greek colors and numbers 1–10", exerciseCount: 6, passing_score: 60 },
    ],
  },
  {
    slug: "el-k-family",
    grade: "K",
    subject: "Greek Language",
    lessons: [
      { slug: "el-k-family-learn",  title: "Η Οικογένειά μου", template_type: "learn_card", exerciseType: "learn_card", topic: "Greek family members: mother, father, brother, sister, grandmother, grandfather", exerciseCount: 6, passing_score: 70 },
      { slug: "el-k-family-match",  title: "Ταιριάζω την Οικογένεια", template_type: "matching", exerciseType: "matching", topic: "Match Greek family words to their English meaning", exerciseCount: 5, passing_score: 70 },
      { slug: "el-k-family-blank",  title: "Συμπληρώνω τη Λέξη", template_type: "fill_blank", exerciseType: "fill_blank", topic: "Greek family members in simple sentences", exerciseCount: 5, passing_score: 70 },
    ],
  },
  {
    slug: "el-k-animals",
    grade: "K",
    subject: "Greek Language",
    lessons: [
      { slug: "el-k-animals-learn",  title: "Τα Ζώα", template_type: "learn_card", exerciseType: "learn_card", topic: "Common Greek animal names: dog, cat, bird, fish, rabbit, horse, cow, sheep", exerciseCount: 8, passing_score: 70 },
      { slug: "el-k-animals-choice", title: "Ποιο Ζώο Είναι;", template_type: "multiple_choice", exerciseType: "multiple_choice", topic: "Identifying animals by their Greek name", exerciseCount: 6, passing_score: 70 },
      { slug: "el-k-animals-blank",  title: "Συμπληρώνω το Ζώο", template_type: "fill_blank", exerciseType: "fill_blank", topic: "Greek animals in simple sentences", exerciseCount: 5, passing_score: 70 },
    ],
  },
  {
    slug: "el-k-review",
    grade: "K",
    subject: "Greek Language",
    lessons: [
      { slug: "el-k-review-mc",   title: "Ανακεφαλαίωση: Πολλαπλή Επιλογή", template_type: "review", exerciseType: "multiple_choice", topic: "Kindergarten Greek review: alphabet, greetings, colors, numbers, family, animals", exerciseCount: 8, passing_score: 70 },
      { slug: "el-k-review-tf",   title: "Ανακεφαλαίωση: Σωστό/Λάθος", template_type: "true_false", exerciseType: "true_false", topic: "Kindergarten Greek review", exerciseCount: 6, passing_score: 70 },
      { slug: "el-k-final-quiz",  title: "Τελικό Κουίζ Νηπιαγωγείου", template_type: "quiz", exerciseType: "multiple_choice", topic: "Full Kindergarten Greek curriculum", exerciseCount: 10, passing_score: 70 },
    ],
  },

  // ── Grade 1 ───────────────────────────────────────────────────
  {
    slug: "el-g1-family",
    grade: "1",
    subject: "Greek Language",
    lessons: [
      { slug: "el-g1-family-learn",  title: "Μέλη της Οικογένειας", template_type: "learn_card", exerciseType: "learn_card", topic: "Extended Greek family: aunt, uncle, cousin, parents, grandparents", exerciseCount: 8, passing_score: 70 },
      { slug: "el-g1-family-blank",  title: "Η Οικογένειά μου σε Προτάσεις", template_type: "fill_blank", exerciseType: "fill_blank", topic: "Greek family members in sentences", exerciseCount: 6, passing_score: 70 },
      { slug: "el-g1-family-quiz",   title: "Κουίζ: Οικογένεια", template_type: "quiz", exerciseType: "multiple_choice", topic: "Greek family vocabulary", exerciseCount: 6, passing_score: 70 },
    ],
  },
  {
    slug: "el-g1-home",
    grade: "1",
    subject: "Greek Language",
    lessons: [
      { slug: "el-g1-home-learn",  title: "Δωμάτια του Σπιτιού", template_type: "learn_card", exerciseType: "learn_card", topic: "Rooms in a Greek home: kitchen, bedroom, bathroom, living room, garden", exerciseCount: 6, passing_score: 70 },
      { slug: "el-g1-home-items",  title: "Αντικείμενα στο Σπίτι", template_type: "learn_card", exerciseType: "learn_card", topic: "Common household objects in Greek", exerciseCount: 8, passing_score: 70 },
      { slug: "el-g1-home-blank",  title: "Πού Είναι;", template_type: "fill_blank", exerciseType: "fill_blank", topic: "Describing where things are in a Greek home", exerciseCount: 6, passing_score: 70 },
    ],
  },
  {
    slug: "el-g1-food",
    grade: "1",
    subject: "Greek Language",
    lessons: [
      { slug: "el-g1-food-learn",  title: "Φαγητά και Ποτά", template_type: "learn_card", exerciseType: "learn_card", topic: "Common Greek foods and drinks, including traditional Greek foods", exerciseCount: 8, passing_score: 70 },
      { slug: "el-g1-food-match",  title: "Ταιριάζω Φαγητά", template_type: "matching", exerciseType: "matching", topic: "Match Greek food names to their category", exerciseCount: 6, passing_score: 70 },
      { slug: "el-g1-food-blank",  title: "Τι Τρώω;", template_type: "fill_blank", exerciseType: "fill_blank", topic: "Greek food in mealtime sentences", exerciseCount: 6, passing_score: 70 },
    ],
  },
  {
    slug: "el-g1-days",
    grade: "1",
    subject: "Greek Language",
    lessons: [
      { slug: "el-g1-days-learn",   title: "Ημέρες της Εβδομάδας", template_type: "learn_card", exerciseType: "learn_card", topic: "Days of the week in Greek", exerciseCount: 7, passing_score: 70 },
      { slug: "el-g1-months-learn", title: "Μήνες του Χρόνου", template_type: "learn_card", exerciseType: "learn_card", topic: "Months of the year in Greek", exerciseCount: 12, passing_score: 70 },
      { slug: "el-g1-days-quiz",    title: "Κουίζ: Ημέρες και Μήνες", template_type: "quiz", exerciseType: "multiple_choice", topic: "Days of week and months in Greek", exerciseCount: 8, passing_score: 70 },
    ],
  },
  {
    slug: "el-g1-sentences",
    grade: "1",
    subject: "Greek Language",
    lessons: [
      { slug: "el-g1-sent-learn",  title: "Απλές Προτάσεις", template_type: "learn_card", exerciseType: "learn_card", topic: "Simple Greek sentence patterns: I am, I have, I like, I want", exerciseCount: 6, passing_score: 70 },
      { slug: "el-g1-sent-blank",  title: "Φτιάχνω Προτάσεις", template_type: "fill_blank", exerciseType: "fill_blank", topic: "Completing simple Greek sentences", exerciseCount: 8, passing_score: 70 },
      { slug: "el-g1-sent-quiz",   title: "Κουίζ: Προτάσεις", template_type: "quiz", exerciseType: "multiple_choice", topic: "Simple Greek sentences", exerciseCount: 6, passing_score: 70 },
    ],
  },
  {
    slug: "el-g1-review",
    grade: "1",
    subject: "Greek Language",
    lessons: [
      { slug: "el-g1-review-mc",   title: "Ανακεφαλαίωση Α' Δημοτικού", template_type: "review", exerciseType: "multiple_choice", topic: "Grade 1 Greek review: family, home, food, days, sentences", exerciseCount: 10, passing_score: 70 },
      { slug: "el-g1-review-tf",   title: "Σωστό/Λάθος: Α' Δημοτικό", template_type: "true_false", exerciseType: "true_false", topic: "Grade 1 Greek review", exerciseCount: 8, passing_score: 70 },
      { slug: "el-g1-final-quiz",  title: "Τελικό Κουίζ Α' Δημοτικού", template_type: "quiz", exerciseType: "multiple_choice", topic: "Full Grade 1 Greek curriculum", exerciseCount: 10, passing_score: 70 },
    ],
  },

  // ── Grade 2 ───────────────────────────────────────────────────
  {
    slug: "el-g2-school",
    grade: "2",
    subject: "Greek Language",
    lessons: [
      { slug: "el-g2-school-learn",  title: "Στο Σχολείο", template_type: "learn_card", exerciseType: "learn_card", topic: "School vocabulary in Greek: classroom objects, school subjects, school roles", exerciseCount: 8, passing_score: 70 },
      { slug: "el-g2-school-blank",  title: "Η Σχολική μου Μέρα", template_type: "fill_blank", exerciseType: "fill_blank", topic: "Describing a school day in Greek", exerciseCount: 6, passing_score: 70 },
      { slug: "el-g2-school-quiz",   title: "Κουίζ: Σχολείο", template_type: "quiz", exerciseType: "multiple_choice", topic: "School vocabulary in Greek", exerciseCount: 6, passing_score: 70 },
    ],
  },
  {
    slug: "el-g2-neighborhood",
    grade: "2",
    subject: "Greek Language",
    lessons: [
      { slug: "el-g2-neighborhood-learn", title: "Η Γειτονιά μου", template_type: "learn_card", exerciseType: "learn_card", topic: "Neighborhood places in Greek: store, park, church, library, bakery, café", exerciseCount: 8, passing_score: 70 },
      { slug: "el-g2-neighborhood-blank", title: "Πού Πηγαίνω;", template_type: "fill_blank", exerciseType: "fill_blank", topic: "Going places in the Greek neighborhood", exerciseCount: 6, passing_score: 70 },
      { slug: "el-g2-neighborhood-match", title: "Ταιριάζω Μέρη", template_type: "matching", exerciseType: "matching", topic: "Match neighborhood places to their purpose", exerciseCount: 6, passing_score: 70 },
    ],
  },
  {
    slug: "el-g2-seasons",
    grade: "2",
    subject: "Greek Language",
    lessons: [
      { slug: "el-g2-seasons-learn",  title: "Οι Εποχές", template_type: "learn_card", exerciseType: "learn_card", topic: "Four seasons in Greek with weather vocabulary", exerciseCount: 8, passing_score: 70 },
      { slug: "el-g2-seasons-blank",  title: "Ο Καιρός", template_type: "fill_blank", exerciseType: "fill_blank", topic: "Describing weather and seasons in Greek", exerciseCount: 6, passing_score: 70 },
      { slug: "el-g2-seasons-tf",     title: "Σωστό/Λάθος: Εποχές", template_type: "true_false", exerciseType: "true_false", topic: "Facts about Greek seasons and weather", exerciseCount: 6, passing_score: 70 },
    ],
  },
  {
    slug: "el-g2-stories",
    grade: "2",
    subject: "Greek Language",
    lessons: [
      { slug: "el-g2-stories-vocab",  title: "Λέξεις από Παραμύθια", template_type: "learn_card", exerciseType: "learn_card", topic: "Story vocabulary in Greek: characters, settings, actions in folk tales", exerciseCount: 8, passing_score: 70 },
      { slug: "el-g2-stories-choice", title: "Κατανόηση Παραμυθιού", template_type: "multiple_choice", exerciseType: "multiple_choice", topic: "Comprehension questions about a short Greek folk story", exerciseCount: 6, passing_score: 70 },
      { slug: "el-g2-stories-blank",  title: "Συμπληρώνω την Ιστορία", template_type: "fill_blank", exerciseType: "fill_blank", topic: "Filling in blanks in a short Greek folk story", exerciseCount: 6, passing_score: 70 },
    ],
  },
  {
    slug: "el-g2-holidays",
    grade: "2",
    subject: "Greek Language",
    lessons: [
      { slug: "el-g2-holidays-learn",  title: "Ελληνικές Γιορτές", template_type: "learn_card", exerciseType: "learn_card", topic: "Greek holidays and traditions: Easter, Christmas, name days, Apokries", exerciseCount: 8, passing_score: 70 },
      { slug: "el-g2-holidays-match",  title: "Ταιριάζω Γιορτές", template_type: "matching", exerciseType: "matching", topic: "Match Greek holidays to their traditions", exerciseCount: 6, passing_score: 70 },
      { slug: "el-g2-holidays-tf",     title: "Σωστό/Λάθος: Γιορτές", template_type: "true_false", exerciseType: "true_false", topic: "Facts about Greek holidays and traditions", exerciseCount: 6, passing_score: 70 },
    ],
  },
  {
    slug: "el-g2-review",
    grade: "2",
    subject: "Greek Language",
    lessons: [
      { slug: "el-g2-review-mc",   title: "Ανακεφαλαίωση Β' Δημοτικού", template_type: "review", exerciseType: "multiple_choice", topic: "Grade 2 Greek review: school, neighborhood, seasons, stories, holidays", exerciseCount: 10, passing_score: 70 },
      { slug: "el-g2-review-blank", title: "Συμπληρώνω: Β' Δημοτικό", template_type: "fill_blank", exerciseType: "fill_blank", topic: "Grade 2 Greek review", exerciseCount: 8, passing_score: 70 },
      { slug: "el-g2-final-quiz",  title: "Τελικό Κουίζ Β' Δημοτικού", template_type: "quiz", exerciseType: "multiple_choice", topic: "Full Grade 2 Greek curriculum", exerciseCount: 12, passing_score: 70 },
    ],
  },
];

// ── AI content generation ─────────────────────────────────────

async function generateExercises(
  grade: string,
  subject: string,
  lessonDef: LessonDef
): Promise<object[]> {
  const systemPrompt = getSystemPrompt("el");
  const userPrompt = buildUserPrompt(
    grade,
    subject,
    lessonDef.topic,
    lessonDef.exerciseType as any,
    lessonDef.exerciseCount,
    "el"
  );

  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as any).text)
    .join("");

  const clean = text.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(clean);
  return parsed.exercises ?? [];
}

// ── Database helpers ──────────────────────────────────────────

async function getUnitId(unitSlug: string): Promise<string | null> {
  const { data } = await supabase
    .from("curriculum_units")
    .select("id")
    .eq("slug", unitSlug)
    .eq("locale", "el")
    .single();
  return data?.id ?? null;
}

async function insertLesson(unitId: string, lesson: LessonDef, sortOrder: number): Promise<string | null> {
  // Check if already exists
  const { data: existing } = await supabase
    .from("curriculum_lessons")
    .select("id")
    .eq("slug", lesson.slug)
    .single();

  if (existing) {
    console.log(`  ⏭  Lesson already exists: ${lesson.slug}`);
    return existing.id;
  }

  const { data, error } = await supabase
    .from("curriculum_lessons")
    .insert({
      unit_id: unitId,
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.topic,
      lesson_type: "practice",
      template_type: lesson.template_type,
      sort_order: sortOrder,
      passing_score: lesson.passing_score,
      is_active: true,
      locale: "el",
    })
    .select("id")
    .single();

  if (error) {
    console.error(`  ❌ Failed to insert lesson ${lesson.slug}:`, error.message);
    return null;
  }
  return data.id;
}

async function insertExercises(lessonId: string, exercises: object[], exerciseType: string): Promise<void> {
  const rows = exercises.map((ex, i) => ({
    lesson_id: lessonId,
    exercise_type: exerciseType,
    exercise_data: ex,
    sort_order: i + 1,
    status: "approved",
    locale: "el",
  }));

  const { error } = await supabase.from("curated_exercises").insert(rows);
  if (error) {
    console.error(`  ❌ Failed to insert exercises:`, error.message);
  }
}

// ── Main seeder ───────────────────────────────────────────────

async function seed() {
  console.log("🇬🇷 DiasporaLearn — Greek Content Seeder\n");

  let totalLessons = 0;
  let totalExercises = 0;
  let errors = 0;

  for (const unit of GREEK_CURRICULUM) {
    console.log(`\n📚 Unit: ${unit.slug} (Grade ${unit.grade})`);

    const unitId = await getUnitId(unit.slug);
    if (!unitId) {
      console.error(`  ❌ Unit not found in DB: ${unit.slug} — run SQL migrations first`);
      errors++;
      continue;
    }

    for (let i = 0; i < unit.lessons.length; i++) {
      const lesson = unit.lessons[i];
      console.log(`  📝 Lesson: ${lesson.title}`);

      // Insert lesson row
      const lessonId = await insertLesson(unitId, lesson, i + 1);
      if (!lessonId) { errors++; continue; }

      // Generate exercises via Claude
      console.log(`     🤖 Generating ${lesson.exerciseCount} ${lesson.exerciseType} exercises...`);
      let exercises: object[] = [];
      try {
        exercises = await generateExercises(unit.grade, unit.subject, lesson);
        console.log(`     ✅ Generated ${exercises.length} exercises`);
      } catch (err: any) {
        console.error(`     ❌ AI generation failed:`, err.message);
        errors++;
        continue;
      }

      // Insert exercises
      await insertExercises(lessonId, exercises, lesson.exerciseType);
      totalLessons++;
      totalExercises += exercises.length;

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`\n✨ Done!`);
  console.log(`   Lessons created: ${totalLessons}`);
  console.log(`   Exercises created: ${totalExercises}`);
  if (errors > 0) console.log(`   Errors: ${errors} (check logs above)`);
}

seed().catch(console.error);
