import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { callClaude } from "@/lib/claude";

const GRADE_GUIDANCE: Record<string, string> = {
  "Kindergarten": "Use only simple concrete nouns a 5-year-old would know: apple, cat, house, dog, ball. Single words only, very easy.",
  "Grade 1": "Use common everyday words for ages 6-7: school, teacher, friend, water, bread, sun, tree, bird. Simple and concrete.",
  "Grade 2": "Expand vocabulary with adjectives and verbs for ages 7-8: beautiful, to run, to read, happy, garden, morning, family.",
  "Grade 3": "Include abstract concepts for ages 8-9: friendship, homework, weather, important, favorite, adventure, season.",
  "Grade 4": "Use academic vocabulary for ages 9-10: education, culture, tradition, celebrate, discover, knowledge, history.",
  "Grade 5": "Use literary and advanced vocabulary for ages 10-11: imagination, responsibility, achievement, literature, composition.",
};

const UNIT_THEME_GUIDANCE: Record<string, string> = {
  "Reading Basics": "Generate common nouns and simple verbs a child would encounter in reading: story, to read, page, friend, morning, school, picture, to learn.",
  "Everyday Words": "Generate household and daily life vocabulary: breakfast, to sleep, kitchen, clothes, to wash, door, window, to help, table, chair.",
  "Simple Sentences": "Generate action verbs and common adjectives for building sentences: to run, to eat, big, small, happy, sad, to play, fast, slow, new.",
  "Grammar Foundations": "Generate a mix of verbs, adjectives, and prepositions useful for grammar examples: to write, beautiful, under, quickly, to think, difficult, above, slowly.",
  "Reading Comprehension": "Generate slightly abstract nouns and descriptive words for understanding texts: meaning, character, beginning, to explain, important, to understand, question, answer.",
  "Writing Practice": "Generate expressive vocabulary useful for writing: opinion, because, example, to describe, interesting, to feel, reason, to remember, favorite.",
  "Armenian Literature": "Generate literary and cultural vocabulary: poet, story, homeland, tradition, ancient, to sing, hero, village, mountain, dream.",
  "Advanced Grammar": "Generate complex verbs and conjunctions for advanced grammar: although, therefore, to accomplish, nevertheless, to compare, to require, whenever, to improve.",
  "Composition": "Generate academic and essay vocabulary: argument, evidence, conclusion, to persuade, perspective, to analyze, furthermore, to support, to summarize.",
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "teacher" && profile?.role !== "admin") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }

  const { templateType, lessonTitle, lessonDescription, unitTitle, levelTitle, lessonId, unitId } = await request.json() as {
    templateType: string; lessonTitle: string; lessonDescription?: string;
    unitTitle?: string; levelTitle?: string; lessonId?: string; unitId?: string;
  };

  // Grade-appropriate difficulty guidance
  const gradeGuidance = GRADE_GUIDANCE[levelTitle ?? ""] ?? GRADE_GUIDANCE["Grade 1"];

  // Fetch ALL existing words across ALL grades to avoid platform-wide duplicates
  let globalExclusions = "";
  if (templateType !== "alphabet") {
    const { data: allItems } = await supabase
      .from("content_items")
      .select("item_data")
      .eq("item_type", "word");

    if (allItems && allItems.length > 0) {
      const usedWords = allItems
        .map((i) => {
          const d = i.item_data as Record<string, string>;
          return d.english;
        })
        .filter(Boolean);
      if (usedWords.length > 0) {
        globalExclusions = `\nThe following English words have ALREADY been used in other lessons across the platform. Do NOT repeat any of them:\n${[...new Set(usedWords)].join(", ")}\nGenerate 3 completely NEW words.`;
      }
    }
  }

  // Alphabet-specific: check letters used across the level
  let alphabetExclusions = "";
  if (templateType === "alphabet" && unitId && lessonId) {
    const { data: currentUnit } = await supabase.from("curriculum_units").select("level_id").eq("id", unitId).single();
    if (currentUnit) {
      const { data: allUnits } = await supabase.from("curriculum_units").select("id").eq("level_id", currentUnit.level_id);
      if (allUnits) {
        const { data: allLessons } = await supabase
          .from("curriculum_lessons")
          .select("id")
          .in("unit_id", allUnits.map((u) => u.id))
          .neq("id", lessonId);
        if (allLessons && allLessons.length > 0) {
          const { data: existingItems } = await supabase
            .from("content_items")
            .select("item_data")
            .eq("item_type", "letter")
            .in("lesson_id", allLessons.map((l) => l.id));
          if (existingItems && existingItems.length > 0) {
            const usedLetters = existingItems.map((i) => (i.item_data as Record<string, string>).letter_upper).filter(Boolean);
            if (usedLetters.length > 0) {
              const nextStart = usedLetters.length + 1;
              alphabetExclusions = `\nThere are 36 letters in the Armenian alphabet. Letters 1 through ${usedLetters.length} have already been taught. Generate the next 3 letters in sequence (letters ${nextStart}, ${nextStart + 1}, ${nextStart + 2}).\nDo NOT include: ${usedLetters.join(", ")}`;
            }
          }
        }
      }
    }
  }

  const context = [
    levelTitle && `Grade level: ${levelTitle}`,
    unitTitle && `Unit theme: ${unitTitle}`,
    `Lesson: ${lessonTitle}`,
    lessonDescription && `Description: ${lessonDescription}`,
  ].filter(Boolean).join(". ");

  let prompt: string;

  if (templateType === "alphabet") {
    prompt = `You are a Western Armenian language expert. Generate content for an Armenian alphabet lesson.
${context}
${gradeGuidance}
${alphabetExclusions}

Return EXACTLY 3 letters as a JSON array. Each object must have these exact fields:
{
  "letter_upper": "(uppercase Armenian letter)",
  "letter_lower": "(lowercase Armenian letter)",
  "letter_name": "(letter name in Armenian script)",
  "transliteration": "(letter name in Latin characters)",
  "sound": "(phonetic sound, e.g. ah, b, g)",
  "example_word_arm": "(simple common Armenian word starting with this letter, in Armenian script)",
  "example_word_eng": "(English translation)",
  "emoji": "(single emoji that visually matches the example word)"
}

CRITICAL RULES:
- Use Western Armenian pronunciation (NOT Eastern Armenian)
- The emoji MUST visually match example_word_eng
- The example word should be appropriate for ${levelTitle ?? "children"}
- Use real Armenian Unicode characters
- Return ONLY a valid JSON array, nothing else`;
  } else {
    const themeGuidance = UNIT_THEME_GUIDANCE[unitTitle ?? ""] ?? `Generate words thematically related to "${unitTitle ?? "general vocabulary"}".`;

    prompt = `You are generating Armenian vocabulary for a ${levelTitle ?? "children's"} "${unitTitle ?? "vocabulary"}" lesson.

DIFFICULTY LEVEL: ${gradeGuidance}

THEMATIC GUIDANCE: ${themeGuidance}

IMPORTANT: Do NOT generate meta-vocabulary (words ABOUT the subject like "letter", "sentence", "word", "grammar", "lesson"). Generate vocabulary that BELONGS to the subject — real Armenian words students would learn and use.
${globalExclusions}

Return EXACTLY 3 words as a JSON array. Each object must have these exact fields:
{
  "armenian": "(word in Armenian script)",
  "english": "(English translation)",
  "emoji": "(single emoji that visually matches the word)",
  "category": "(category: food, animal, color, family, school, etc.)"
}

CRITICAL RULES:
- Use Western Armenian with classical orthography
- The emoji MUST visually match the english word
- Words must be appropriate for ${levelTitle ?? "children"} (ages matching that grade level)
- Use real Armenian Unicode characters
- Return ONLY a valid JSON array, nothing else`;
  }

  try {
    const rawText = await callClaude(
      "You are a Western Armenian language expert. Return ONLY valid JSON with no markdown or backticks.",
      prompt
    );

    const cleaned = rawText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```$/i, "").trim();
    const items = JSON.parse(cleaned);

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "AI returned invalid data" }, { status: 502 });
    }

    return NextResponse.json({ items, templateType });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[autofill] Error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
