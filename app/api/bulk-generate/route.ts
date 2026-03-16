import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { callClaude } from "@/lib/claude";
import { generateLessonContent } from "@/lib/lesson-templates";

function getDb(authClient: Awaited<ReturnType<typeof createServerClient>>) {
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return sk ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, sk, { auth: { persistSession: false, autoRefreshToken: false } }) : authClient;
}

const GRADE_GUIDANCE: Record<string, string> = {
  "Kindergarten": "simple concrete nouns for ages 5-6: apple, cat, house, dog, ball",
  "Grade 1": "common everyday words for ages 6-7: school, teacher, friend, water",
  "Grade 2": "adjectives and verbs for ages 7-8: beautiful, to run, happy, garden",
  "Grade 3": "abstract concepts for ages 8-9: friendship, homework, weather",
  "Grade 4": "academic vocabulary for ages 9-10: education, culture, tradition",
  "Grade 5": "literary vocabulary for ages 10-11: imagination, responsibility",
};

const UNIT_THEMES: Record<string, string> = {
  "Reading Basics": "reading and school words: story, to read, page, friend",
  "Everyday Words": "household and daily life: breakfast, kitchen, clothes",
  "Simple Sentences": "action verbs and adjectives: to run, big, small, happy",
  "Grammar Foundations": "verbs, adjectives, prepositions: to write, beautiful, under",
  "Reading Comprehension": "abstract nouns: meaning, character, to explain",
  "Writing Practice": "expressive vocabulary: opinion, because, to describe",
  "Armenian Literature": "literary vocabulary: poet, homeland, tradition, ancient",
  "Advanced Grammar": "complex verbs and conjunctions: although, to accomplish",
  "Composition": "academic vocabulary: argument, evidence, conclusion",
};

export async function POST() {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await authClient.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "teacher" && profile?.role !== "admin") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }

  const db = getDb(authClient);

  // Find all empty practice lessons (no content_items)
  const { data: allLessons } = await db
    .from("curriculum_lessons")
    .select("id, slug, title, template_type, sort_order, unit_id, curriculum_units!inner(id, title, slug, sort_order, level_id, curriculum_levels!inner(id, title, slug, sort_order))")
    .in("template_type", ["vocabulary", "alphabet"])
    .eq("is_active", true)
    .order("sort_order");

  if (!allLessons) return NextResponse.json({ error: "No lessons found" }, { status: 404 });

  // Filter to lessons with no content_items
  const { data: usedLessonIds } = await db.from("content_items").select("lesson_id");
  const usedSet = new Set((usedLessonIds ?? []).map((r) => r.lesson_id));
  const emptyLessons = allLessons.filter((l) => !usedSet.has(l.id));

  if (emptyLessons.length === 0) {
    return NextResponse.json({ total: 0, completed: 0, failed: 0, details: [], message: "All lessons already have content" });
  }

  const details: { level: string; unit: string; lesson: string; status: string; items: number }[] = [];
  let completed = 0;
  let failed = 0;

  for (const lesson of emptyLessons) {
    const unit = lesson.curriculum_units as unknown as { id: string; title: string; slug: string; sort_order: number; level_id: string; curriculum_levels: { id: string; title: string; slug: string; sort_order: number } };
    const level = unit.curriculum_levels;

    try {
      // Fetch all existing words for deduplication
      const { data: existingItems } = await db.from("content_items").select("item_data").eq("item_type", "word");
      const usedWords = (existingItems ?? []).map((i) => (i.item_data as Record<string, string>).english).filter(Boolean);
      const exclusions = usedWords.length > 0 ? `\nDo NOT repeat these words: ${[...new Set(usedWords)].join(", ")}` : "";

      const gradeGuide = GRADE_GUIDANCE[level.title] ?? GRADE_GUIDANCE["Grade 1"];
      const themeGuide = UNIT_THEMES[unit.title] ?? `words related to "${unit.title}"`;

      let items: Record<string, string>[];

      if (lesson.template_type === "alphabet") {
        // Fetch used letters for alphabet deduplication
        const { data: existingLetters } = await db.from("content_items").select("item_data").eq("item_type", "letter");
        const usedLetters = (existingLetters ?? []).map((i) => (i.item_data as Record<string, string>).letter_upper).filter(Boolean);
        const letterExclusions = usedLetters.length > 0
          ? `\nLetters 1-${usedLetters.length} already taught. Generate next 3 in sequence.\nDo NOT include: ${usedLetters.join(", ")}`
          : "";

        const raw = await callClaude(
          "You are a Western Armenian language expert. Return ONLY valid JSON array.",
          `Generate 3 Armenian alphabet letters for ${level.title}. ${gradeGuide}${letterExclusions}

Return JSON array: [{"letter_upper":"...","letter_lower":"...","letter_name":"...","transliteration":"...","sound":"...","example_word_arm":"...","example_word_eng":"...","emoji":"..."}]

Use Western Armenian pronunciation. Emoji must match the example word.`
        );
        items = JSON.parse(raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```$/i, "").trim());
      } else {
        const raw = await callClaude(
          "You are a Western Armenian language expert. Return ONLY valid JSON array.",
          `Generate 3 vocabulary words for ${level.title} "${unit.title}" lesson. ${gradeGuide}. Theme: ${themeGuide}.${exclusions}

Do NOT generate meta-vocabulary (words about the subject like "letter", "grammar"). Generate vocabulary that belongs to the subject.

Return JSON array: [{"armenian":"...","english":"...","emoji":"...","category":"..."}]

Use Western Armenian with classical orthography. Emoji must match the word.`
        );
        items = JSON.parse(raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```$/i, "").trim());
      }

      if (!Array.isArray(items) || items.length === 0) throw new Error("No items returned");

      // Save content_items
      const inserts = items.map((item, i) => ({
        unit_id: unit.id,
        lesson_id: lesson.id,
        item_type: lesson.template_type === "alphabet" ? "letter" : "word",
        sort_order: i + 1,
        item_data: item,
        created_by: user.id,
      }));

      await db.from("content_items").delete().eq("lesson_id", lesson.id);
      await db.from("content_items").insert(inserts);

      // Generate exercises from template
      const generated = generateLessonContent(lesson.template_type, inserts.map((ins, i) => ({
        id: String(i), item_type: ins.item_type, sort_order: ins.sort_order, item_data: ins.item_data,
      })));

      await db.from("curated_exercises").delete().eq("lesson_id", lesson.id);
      await db.from("curated_exercises").insert(generated.map((ex) => ({
        lesson_id: lesson.id,
        exercise_type: ex.exercise_type,
        exercise_data: ex.exercise_data,
        sort_order: ex.sort_order,
        status: "approved",
        created_by: user.id,
      })));

      details.push({ level: level.title, unit: unit.title, lesson: lesson.title, status: "success", items: items.length });
      completed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[bulk-generate] Failed: ${level.title} > ${unit.title} > ${lesson.title}:`, msg);
      details.push({ level: level.title, unit: unit.title, lesson: lesson.title, status: `error: ${msg}`, items: 0 });
      failed++;
    }

    // Rate limit: 1 second between API calls
    await new Promise((r) => setTimeout(r, 1000));
  }

  return NextResponse.json({ total: emptyLessons.length, completed, failed, details });
}
