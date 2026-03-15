import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { callClaude } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "teacher" && profile?.role !== "admin") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }

  const { templateType, lessonTitle, lessonDescription, unitTitle, lessonId, unitId } = await request.json() as {
    templateType: string; lessonTitle: string; lessonDescription?: string; unitTitle?: string;
    lessonId?: string; unitId?: string;
  };

  // Fetch existing content from OTHER lessons in the same unit to avoid repeats
  let exclusionText = "";
  if (unitId && lessonId) {
    const { data: otherLessons } = await supabase
      .from("curriculum_lessons")
      .select("id")
      .eq("unit_id", unitId)
      .neq("id", lessonId);

    if (otherLessons && otherLessons.length > 0) {
      const otherLessonIds = otherLessons.map((l) => l.id);
      const { data: existingItems } = await supabase
        .from("content_items")
        .select("item_type, item_data")
        .in("lesson_id", otherLessonIds);

      if (existingItems && existingItems.length > 0) {
        if (templateType === "alphabet") {
          const usedLetters = existingItems
            .filter((i) => i.item_type === "letter")
            .map((i) => (i.item_data as Record<string, string>).letter_upper)
            .filter(Boolean);
          if (usedLetters.length > 0) {
            exclusionText = `\nThe following letters have ALREADY been taught in previous lessons of this unit. Do NOT include any of them:\n${usedLetters.join(", ")}\nGenerate the NEXT 3 letters in alphabetical order after these.`;
          }
        } else {
          const usedWords = existingItems
            .filter((i) => i.item_type === "word")
            .map((i) => {
              const d = i.item_data as Record<string, string>;
              return `${d.armenian} (${d.english})`;
            })
            .filter(Boolean);
          if (usedWords.length > 0) {
            exclusionText = `\nThe following words have ALREADY been taught in previous lessons of this unit. Do NOT include any of them:\n${usedWords.join(", ")}\nGenerate 3 NEW words that have not been taught yet.`;
          }
        }
      }
    }
  }

  const context = [
    unitTitle && `Unit: ${unitTitle}`,
    `Lesson: ${lessonTitle}`,
    lessonDescription && `Description: ${lessonDescription}`,
  ].filter(Boolean).join(". ");

  let prompt: string;

  if (templateType === "alphabet") {
    prompt = `You are a Western Armenian language expert. Generate content for an Armenian alphabet lesson.
Context: ${context}
${exclusionText}
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
- The emoji MUST visually match example_word_eng (apple emoji for apple, cat emoji for cat)
- Pick the most iconic/common word for each letter
- Use real Armenian Unicode characters
- Return ONLY a valid JSON array, nothing else`;
  } else {
    prompt = `You are a Western Armenian language expert. Generate vocabulary content for a children's lesson.
Context: ${context}
${exclusionText}
Return EXACTLY 3 words as a JSON array. Each object must have these exact fields:
{
  "armenian": "(word in Armenian script)",
  "english": "(English translation)",
  "emoji": "(single emoji that visually matches the word)",
  "category": "(category: food, animal, color, family, school, etc.)"
}

CRITICAL RULES:
- Use Western Armenian with classical orthography
- The emoji MUST visually match the english word (apple = apple emoji, cat = cat emoji)
- Pick simple, concrete words that kindergarten/grade 1 children can identify
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
