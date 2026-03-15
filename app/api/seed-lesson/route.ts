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

  // Find Kindergarten > Alphabet Part 1 > Lesson 1
  const { data: level } = await db.from("curriculum_levels").select("id").eq("slug", "kindergarten").single();
  if (!level) return NextResponse.json({ error: "Kindergarten level not found" }, { status: 404 });

  const { data: unit } = await db.from("curriculum_units").select("id").eq("level_id", level.id).eq("slug", "alphabet-1").single();
  if (!unit) return NextResponse.json({ error: "Alphabet Part 1 unit not found" }, { status: 404 });

  const { data: lesson } = await db.from("curriculum_lessons").select("id").eq("unit_id", unit.id).eq("slug", "lesson-1").single();
  if (!lesson) return NextResponse.json({ error: "Lesson 1 not found" }, { status: 404 });

  // Delete existing exercises
  await db.from("curated_exercises").delete().eq("lesson_id", lesson.id);

  const userPrompt = `Generate a scaffolded Kindergarten lesson teaching 3 Western Armenian words: Apple, Cat, Book.

Return ONLY valid JSON (no markdown, no backticks). The exercises array must contain exactly 11 items in this order:

LEARN CARDS (sort_order 1-3): Introduce each word
1. Learn card for Apple: { "type": "learn_card", "visual": "(apple emoji)", "primary_text": "(Armenian word for apple)", "secondary_text": "Apple", "sort_order": 1 }
2. Learn card for Cat: same format, sort_order 2
3. Learn card for Book: same format, sort_order 3

RECOGNITION exercises (sort_order 4-6): Show emoji, ask "What is this?" in Armenian
4. Show apple emoji. Question in Armenian: "What is this?" Options: 3 Armenian words (apple correct). hint_en: "This is a fruit"
5. Show cat emoji. Same format. hint_en: "This is an animal"
6. Show book emoji. Same format. hint_en: "You read this"

RECALL exercises (sort_order 7-8): Show Armenian word, ask what it means. NO emoji.
7. Show the Armenian word for apple. Question: "What does this word mean?" Options: 3 ENGLISH words (Apple, Cat, Book). Apple is correct.
8. Show the Armenian word for cat. Same format. Cat is correct.

REVERSE RECALL (sort_order 9): Show apple emoji, ask "How do you say Apple in Armenian?"
9. emoji: apple. Question in Armenian asks how to say Apple. Options: 3 Armenian words. Apple word is correct.

MATCHING (sort_order 10): Match all 3 words
10. Type "matching" with 3 pairs. Each pair: left_hy (Armenian word), left_en (English), right_hy (English word in Armenian context), right_en (English meaning). The left column has the Armenian words and the right column has the English translations.

Actually for matching, use this format:
{ "type": "matching", "exercises_data": [
  { "id": "1", "left_hy": "(apple in Armenian)", "left_en": "Apple", "right_hy": "(apple in Armenian)", "right_en": "Apple" },
  { "id": "2", "left_hy": "(cat in Armenian)", "left_en": "Cat", "right_hy": "(cat in Armenian)", "right_en": "Cat" },
  { "id": "3", "left_hy": "(book in Armenian)", "left_en": "Book", "right_hy": "(book in Armenian)", "right_en": "Book" }
], "sort_order": 10 }

Wait, matching format should be individual items. Use this:
{ "type": "matching", "id": "m1", "left_hy": "(apple Armenian)", "left_en": "Apple", "right_hy": "Apple", "right_en": "Apple", "sort_order": 10 }
And two more matching items at sort_order 10 (same sort_order groups them).

Actually simpler — make 3 matching exercises all at sort_order 10:
Item 10a: { "type": "matching", "id": "m1", "left_hy": "(apple Armenian)", "left_en": "Apple", "right_hy": "Apple", "right_en": "Apple", "sort_order": 10 }
Item 10b: { "type": "matching", "id": "m2", "left_hy": "(cat Armenian)", "left_en": "Cat", "right_hy": "Cat", "right_en": "Cat", "sort_order": 10 }
Item 10c: { "type": "matching", "id": "m3", "left_hy": "(book Armenian)", "left_en": "Book", "right_hy": "Book", "right_en": "Book", "sort_order": 10 }

FILL IN BLANK (sort_order 11): Simple sentence with missing word
11. A very simple Armenian sentence like "I eat ___" where the answer is the apple word. Provide all 3 Armenian words as distractors. emoji: apple.

For ALL multiple_choice exercises, use this JSON format:
{
  "type": "multiple_choice",
  "id": "(number)",
  "emoji": "(emoji or empty string)",
  "question_hy": "(Armenian question text)",
  "question_en": "(English translation)",
  "options": [
    { "id": "a", "text_hy": "(Armenian text)", "text_en": "(English)", "correct": true/false },
    { "id": "b", "text_hy": "...", "text_en": "...", "correct": true/false },
    { "id": "c", "text_hy": "...", "text_en": "...", "correct": true/false }
  ],
  "hint_hy": "",
  "hint_en": "(English hint)",
  "explanation_hy": "(Armenian explanation)",
  "explanation_en": "(English explanation)",
  "sort_order": (number)
}

For fill_blank:
{
  "type": "fill_blank",
  "id": "(number)",
  "emoji": "(emoji)",
  "sentence_hy": "(Armenian sentence with ___ for blank)",
  "sentence_en": "(English translation)",
  "answer_hy": "(correct Armenian word)",
  "answer_en": "(English)",
  "distractors_hy": ["(wrong1)", "(wrong2)"],
  "distractors_en": ["(wrong1 English)", "(wrong2 English)"],
  "hint_hy": "",
  "hint_en": "(hint)",
  "explanation_hy": "(Armenian)",
  "explanation_en": "(English)",
  "sort_order": 11
}

CRITICAL RULES:
- Use REAL emoji characters, not descriptions
- Use Western Armenian with classical orthography
- Armenian script ONLY in _hy and primary_text fields
- English ONLY in _en and secondary_text fields
- The apple emoji must be a real apple emoji
- The cat emoji must be a real cat face emoji
- The book emoji must be a real book/books emoji
- Return the complete JSON object: { "exercises": [...] }`;

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
    return NextResponse.json({ error: "Failed to parse Claude response", raw: rawText.slice(0, 1000) }, { status: 502 });
  }

  if (!Array.isArray(parsed.exercises) || parsed.exercises.length === 0) {
    return NextResponse.json({ error: "No exercises returned" }, { status: 502 });
  }

  // Insert as approved exercises
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
