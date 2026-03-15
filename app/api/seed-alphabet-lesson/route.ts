import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { callClaude } from "@/lib/claude";
import { getSystemPrompt } from "@/lib/prompts";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!process.env.SEED_API_KEY || key !== process.env.SEED_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Missing Supabase config" }, { status: 500 });
  }

  const db = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Find Armenian Alphabet Part 1 > Lesson 1
  const { data: level } = await db.from("curriculum_levels").select("id").eq("slug", "kindergarten").single();
  if (!level) return NextResponse.json({ error: "Kindergarten not found" }, { status: 404 });

  const { data: unit } = await db.from("curriculum_units").select("id").eq("level_id", level.id).eq("slug", "armenian-alphabet-1").single();
  if (!unit) return NextResponse.json({ error: "Armenian Alphabet Part 1 not found. Run migration 005 first." }, { status: 404 });

  const { data: lesson } = await db.from("curriculum_lessons").select("id").eq("unit_id", unit.id).eq("slug", "lesson-1").single();
  if (!lesson) return NextResponse.json({ error: "Lesson 1 not found" }, { status: 404 });

  await db.from("curated_exercises").delete().eq("lesson_id", lesson.id);

  const userPrompt = `Generate a Kindergarten lesson teaching the first 3 letters of the Western Armenian alphabet.

For each of the first 3 letters, provide:
- The uppercase and lowercase Armenian letter forms
- The traditional Armenian letter name
- A Latin transliteration of the name
- The phonetic sound it makes (simple, like "ah")
- A common Western Armenian word starting with that letter
- The English translation of that word
- A matching emoji for the example word (the emoji MUST match the word: apple emoji for apple, etc.)

Return ONLY valid JSON (no markdown, no backticks).

LEARN CARDS use this EXACT format (sort_order 1-3):
{
  "type": "learn_card",
  "letter": "(Uppercase) (lowercase)",
  "letter_name": "(Armenian letter name in Armenian script)",
  "transliteration": "(Latin transliteration of the name)",
  "sound": "(simple phonetic sound like ah, b, k)",
  "example_word": "(Armenian word in Armenian script)",
  "example_translation": "(English translation)",
  "emoji": "(real emoji matching the example word)",
  "sort_order": 1
}

RECOGNITION exercises (sort_order 4-6): Show a letter, ask its name
{
  "type": "multiple_choice", "id": "4", "emoji": "",
  "question_hy": "(Show the letter and ask 'What is the name of this letter?' in Armenian)",
  "question_en": "What is the name of this letter?",
  "options": [
    { "id": "a", "text_hy": "(correct letter name)", "text_en": "(name)", "correct": true },
    { "id": "b", "text_hy": "(wrong name)", "text_en": "(name)", "correct": false },
    { "id": "c", "text_hy": "(wrong name)", "text_en": "(name)", "correct": false }
  ],
  "hint_hy": "", "hint_en": "(hint about the sound)",
  "explanation_hy": "(Armenian)", "explanation_en": "(English)",
  "sort_order": 4
}

SOUND MATCHING (sort_order 7-8): Which letter makes this sound?
Same multiple_choice format. Question asks which letter makes sound X. Options are the 3 letters.

WORD ASSOCIATION (sort_order 9): Which letter does this word start with?
Show the example word's emoji. Options are the 3 letters.

MATCHING (sort_order 10): Match 3 letters to their names
3 items with sort_order 10:
{ "type": "matching", "id": "m1", "left_hy": "(letter)", "left_en": "(letter transliteration)", "right_hy": "(letter name Armenian)", "right_en": "(letter name English)", "sort_order": 10 }

FILL BLANK (sort_order 11):
{ "type": "fill_blank", "id": "11", "emoji": "",
  "sentence_hy": "(The letter ___ sounds like X in Armenian)",
  "sentence_en": "The letter ___ sounds like (sound).",
  "answer_hy": "(correct letter)", "answer_en": "(letter name)",
  "distractors_hy": ["(wrong letter)", "(wrong letter)"],
  "distractors_en": ["(name)", "(name)"],
  "hint_hy": "", "hint_en": "(hint)",
  "explanation_hy": "(Armenian)", "explanation_en": "(English)",
  "sort_order": 11
}

RULES:
- Use REAL Armenian letters from the actual Armenian alphabet (first 3 letters)
- Use Western Armenian letter names and pronunciation
- Armenian script ONLY in _hy, letter, letter_name, example_word fields
- English ONLY in _en, transliteration, example_translation, sound fields
- Emoji MUST match the example word (apple emoji for apple word, etc.)
- Return: { "exercises": [...] } with exactly 14 items (3 learn + 3 recognition + 2 sound + 1 word + 3 matching + 1 fill + 1 extra = adjust to fit)`;

  let rawText: string;
  try {
    rawText = await callClaude(getSystemPrompt(), userPrompt);
  } catch (err) {
    return NextResponse.json({ error: "Claude API failed", details: String(err) }, { status: 502 });
  }

  let parsed: { exercises: Record<string, unknown>[] };
  try {
    const cleaned = rawText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```$/i, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json({ error: "Failed to parse", raw: rawText.slice(0, 1000) }, { status: 502 });
  }

  if (!Array.isArray(parsed.exercises) || parsed.exercises.length === 0) {
    return NextResponse.json({ error: "No exercises returned" }, { status: 502 });
  }

  const inserts = parsed.exercises.map((ex) => ({
    lesson_id: lesson.id,
    exercise_type: (ex.type as string) ?? "multiple_choice",
    exercise_data: ex,
    sort_order: (ex.sort_order as number) ?? 10,
    status: "approved",
  }));

  const { error: insertErr } = await db.from("curated_exercises").insert(inserts);
  if (insertErr) {
    return NextResponse.json({ error: "Insert failed", details: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: inserts.length, lessonId: lesson.id });
}
