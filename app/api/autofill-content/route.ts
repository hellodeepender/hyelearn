import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { callClaude } from "@/lib/claude";
import { getGradeBand, BAND_CONFIG } from "@/lib/grade-bands";
import { headers } from "next/headers";

// ── Locale config ────────────────────────────────────────────
const LOCALE_CONFIG = {
  hy: { languageName: "Western Armenian", dialect: "classical orthography", scriptNote: "Use real Armenian Unicode characters", alphabetSize: 36, expert: "Western Armenian language expert", pronunciationNote: "Use Western Armenian pronunciation (NOT Eastern Armenian)" },
  el: { languageName: "Modern Greek", dialect: "standard Modern Greek (Demotic)", scriptNote: "Use real Greek Unicode characters with proper accent marks (tonos)", alphabetSize: 24, expert: "Modern Greek language expert", pronunciationNote: "Use standard Modern Greek pronunciation" },
} as const;

// ── Grade-level difficulty guidance (language-agnostic) ──────
const GRADE_GUIDANCE: Record<string, string> = {
  "Kindergarten": "Use only simple concrete nouns a 5-year-old would know: apple, cat, house, dog, ball. Single words only, very easy.",
  "Grade 1": "Use common everyday words for ages 6-7: school, teacher, friend, water, bread, sun, tree, bird. Simple and concrete.",
  "Grade 2": "Expand vocabulary with adjectives and verbs for ages 7-8: beautiful, to run, to read, happy, garden, morning, family.",
  "Grade 3": "Include abstract concepts for ages 8-9: friendship, homework, weather, important, favorite, adventure, season.",
  "Grade 4": "Use academic vocabulary for ages 9-10: education, culture, tradition, celebrate, discover, knowledge, history.",
  "Grade 5": "Use literary and advanced vocabulary for ages 10-11: imagination, responsibility, achievement, literature, composition.",
};

function getThemeGuidance(unitTitle: string, languageName: string): string {
  const themes: Record<string, string> = {
    "Numbers 1-10": `Generate ONLY ${languageName} number words. Lesson 1: one, two, three. Lesson 2: four, five, six. Lesson 3: seven, eight, nine. Use number emoji (1️⃣ 2️⃣ 3️⃣ etc). Do NOT generate random vocabulary — only number words.`,
    "Colors": `Generate ONLY ${languageName} color words. Lesson 1: red, blue, green. Lesson 2: yellow, orange, purple. Lesson 3: white, black, pink. Use colored circle/object emoji. Do NOT generate random vocabulary — only colors.`,
    "Animals": `Generate ONLY ${languageName} animal words. Lesson 1: cat, dog, bird. Lesson 2: fish, horse, cow. Lesson 3: rabbit, bear, butterfly. Use animal emoji. Do NOT generate random vocabulary — only animals.`,
    "My Family": `Generate ONLY ${languageName} family member words. Lesson 1: mother, father, brother. Lesson 2: sister, grandmother, grandfather. Lesson 3: baby, family, home. Use family emoji. Do NOT generate random vocabulary — only family words.`,
    "Reading Basics": "Generate common nouns and simple verbs a child would encounter in reading: story, to read, page, friend, morning, school, picture, to learn.",
    "Everyday Words": "Generate household and daily life vocabulary: breakfast, to sleep, kitchen, clothes, to wash, door, window, to help, table, chair.",
    "Simple Sentences": "Generate action verbs and common adjectives for building sentences: to run, to eat, big, small, happy, sad, to play, fast, slow, new.",
    "Grammar Foundations": "Generate a mix of verbs, adjectives, and prepositions useful for grammar examples: to write, beautiful, under, quickly, to think, difficult, above, slowly.",
    "Reading Comprehension": "Generate slightly abstract nouns and descriptive words for understanding texts: meaning, character, beginning, to explain, important, to understand, question, answer.",
    "Writing Practice": "Generate expressive vocabulary useful for writing: opinion, because, example, to describe, interesting, to feel, reason, to remember, favorite.",
    "Literature": `Generate literary and cultural vocabulary related to ${languageName} culture: poet, story, homeland, tradition, ancient, to sing, hero, village, mountain, dream.`,
    "Advanced Grammar": "Generate complex verbs and conjunctions for advanced grammar: although, therefore, to accomplish, nevertheless, to compare, to require, whenever, to improve.",
    "Composition": "Generate academic and essay vocabulary: argument, evidence, conclusion, to persuade, perspective, to analyze, furthermore, to support, to summarize.",
  };
  return themes[unitTitle] ?? `Generate words thematically related to "${unitTitle ?? "general vocabulary"}".`;
}

// ── Main handler ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "teacher" && profile?.role !== "admin") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }

  const { templateType, lessonTitle, lessonDescription, unitTitle, levelTitle, lessonId, unitId, locale: clientLocale } = await request.json() as {
    templateType: string; lessonTitle: string; lessonDescription?: string;
    unitTitle?: string; levelTitle?: string; lessonId?: string; unitId?: string; locale?: string;
  };

  // Locale detection: client param > header > default
  const headersList = await headers();
  const locale = ((clientLocale ?? headersList.get("x-locale") ?? "hy") === "el" ? "el" : "hy") as keyof typeof LOCALE_CONFIG;
  const lang = LOCALE_CONFIG[locale];

  // Grade band detection
  const grade = levelTitle === "Kindergarten" ? "K" : levelTitle?.replace("Grade ", "") ?? "1";
  const band = getGradeBand(grade);

  // Grade-appropriate difficulty guidance
  const gradeGuidance = GRADE_GUIDANCE[levelTitle ?? ""] ?? GRADE_GUIDANCE["Grade 1"];

  // Global word exclusions (cross-locale is fine — prevents duplicate English)
  let globalExclusions = "";
  if (templateType !== "alphabet") {
    const { data: allItems } = await supabase
      .from("content_items")
      .select("item_data")
      .eq("item_type", "word");

    if (allItems && allItems.length > 0) {
      const usedWords = allItems
        .map((i) => (i.item_data as Record<string, string>).english)
        .filter(Boolean);
      if (usedWords.length > 0) {
        globalExclusions = `\nThe following English words have ALREADY been used. Do NOT repeat any of them:\n${[...new Set(usedWords)].join(", ")}\nGenerate completely NEW words.`;
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
              alphabetExclusions = `\nThere are ${lang.alphabetSize} letters in the ${lang.languageName} alphabet. Letters 1 through ${usedLetters.length} have already been taught. Generate the next 3 letters in sequence (letters ${nextStart}, ${nextStart + 1}, ${nextStart + 2}).\nDo NOT include: ${usedLetters.join(", ")}`;
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
    // ── ALPHABET PROMPT ──────────────────────────────────────
    prompt = `You are a ${lang.expert}. Generate content for a ${lang.languageName} alphabet lesson.
${context}
${gradeGuidance}
${alphabetExclusions}

Return EXACTLY 3 letters as a JSON array. Each object must have these exact fields:
{
  "letter_upper": "(uppercase ${lang.languageName} letter)",
  "letter_lower": "(lowercase ${lang.languageName} letter)",
  "letter_name": "(letter name in ${lang.languageName} script)",
  "transliteration": "(letter name in Latin characters)",
  "sound": "(phonetic sound, e.g. ah, b, g)",
  "example_word_target": "(simple common ${lang.languageName} word starting with this letter, in ${lang.languageName} script)",
  "example_word_eng": "(English translation)",
  "emoji": "(single emoji that visually matches the example word)"
}

CRITICAL RULES:
- ${lang.pronunciationNote}
- The emoji MUST visually match example_word_eng
- The example word should be appropriate for ${levelTitle ?? "children"}
- ${lang.scriptNote}
- Return ONLY a valid JSON array, nothing else`;

  } else {
    // ── VOCABULARY / BAND-SPECIFIC PROMPT ─────────────────────
    const themeGuidance = getThemeGuidance(unitTitle ?? "", lang.languageName);

    const wordSpec = `{ "target_lang": "(word in ${lang.languageName} script)", "english": "(English translation)", "emoji": "(single emoji)", "category": "(category)" }`;
    const phraseSpec = `{ "target_lang": "(phrase in ${lang.languageName} script)", "english": "(English translation)" }`;

    let structureSpec: string;
    let structureNote: string;

    if (band === "emergent") {
      structureSpec = `Return a JSON array of 3 word objects:\n[${wordSpec}, ...]`;
      structureNote = "Return ONLY a JSON array of 3 word objects.";
    } else if (band === "early") {
      structureSpec = `Return a JSON object with this structure:
{
  "words": [${wordSpec}, ${wordSpec}, ${wordSpec}],
  "phrases": [${phraseSpec}, ${phraseSpec}]
}`;
      structureNote = "Return a JSON object with 'words' (3 items) and 'phrases' (2 items).";
    } else if (band === "developing") {
      structureSpec = `Return a JSON object with this structure:
{
  "words": [${wordSpec}, ${wordSpec}, ${wordSpec}],
  "phrases": [${phraseSpec}, ${phraseSpec}],
  "reading_passage": {
    "title": "(passage title in ${lang.languageName})",
    "text": "(3-5 sentences in ${lang.languageName} script, age-appropriate)"
  },
  "grammar_note": {
    "topic": "(grammar topic, e.g. 'Noun Plurals')",
    "explanation": "(explanation in English of a grammar point from the passage)",
    "examples": ["(example sentence in ${lang.languageName})", "(another example)"]
  }
}`;
      structureNote = "Return a JSON object with 'words' (3), 'phrases' (2), 'reading_passage', and 'grammar_note'.";
    } else {
      // fluent
      structureSpec = `Return a JSON object with this structure:
{
  "words": [${wordSpec}, ${wordSpec}, ${wordSpec}],
  "reading_passage": {
    "title": "(passage title in ${lang.languageName})",
    "text": "(5-8 sentences in ${lang.languageName} script, age-appropriate)"
  },
  "grammar_note": {
    "topic": "(grammar topic)",
    "explanation": "(explanation in English)",
    "examples": ["(example 1 in ${lang.languageName})", "(example 2)", "(example 3)"]
  },
  "composition_prompt": {
    "prompt": "(writing prompt in ${lang.languageName} script)",
    "instructions": "(instructions in English for what to write)",
    "min_sentences": 5
  },
  "discussion_questions": [
    { "question": "(question in ${lang.languageName} script)", "question_eng": "(English translation)" },
    { "question": "(question in ${lang.languageName} script)", "question_eng": "(English translation)" }
  ]
}`;
      structureNote = "Return a JSON object with 'words' (3), 'reading_passage', 'grammar_note', 'composition_prompt', and 'discussion_questions' (2).";
    }

    prompt = `You are generating ${lang.languageName} content for a ${levelTitle ?? "children's"} "${unitTitle ?? "vocabulary"}" lesson.

DIFFICULTY LEVEL: ${gradeGuidance}

THEMATIC GUIDANCE: ${themeGuidance}

IMPORTANT: Do NOT generate meta-vocabulary (words ABOUT the subject like "letter", "sentence", "word", "grammar", "lesson"). Generate vocabulary that BELONGS to the subject — real ${lang.languageName} words students would learn and use.
${globalExclusions}

${structureSpec}

CRITICAL RULES:
- Use ${lang.languageName} ${lang.dialect}
- The emoji MUST visually match the english word (for word items)
- Words must be appropriate for ${levelTitle ?? "children"} (ages matching that grade level)
- ${lang.scriptNote}
- ${structureNote}`;
  }

  try {
    const rawText = await callClaude(
      `You are a ${lang.expert}. Return ONLY valid JSON with no markdown or backticks.`,
      prompt,
    );

    const cleaned = rawText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    if (band === "emergent" && templateType !== "alphabet") {
      // Emergent returns a plain array of words
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return NextResponse.json({ error: "AI returned invalid data" }, { status: 502 });
      }
      return NextResponse.json({
        items: parsed,
        phrases: [],
        reading_passage: null,
        grammar_note: null,
        composition_prompt: null,
        discussion_questions: [],
        templateType,
        band,
      });
    } else if (templateType === "alphabet") {
      // Alphabet returns a plain array of letter items
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return NextResponse.json({ error: "AI returned invalid data" }, { status: 502 });
      }
      return NextResponse.json({ items: parsed, templateType, band });
    } else {
      // Early/developing/fluent return an object with words, phrases, etc.
      const words = parsed.words;
      if (!Array.isArray(words) || words.length === 0) {
        return NextResponse.json({ error: "AI returned invalid data (no words)" }, { status: 502 });
      }
      return NextResponse.json({
        items: words,
        phrases: parsed.phrases ?? [],
        reading_passage: parsed.reading_passage ?? null,
        grammar_note: parsed.grammar_note ?? null,
        composition_prompt: parsed.composition_prompt ?? null,
        discussion_questions: parsed.discussion_questions ?? [],
        templateType,
        band,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[autofill] Error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
