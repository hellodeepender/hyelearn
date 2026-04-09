import type { ExerciseType } from "./types";

// ── Locale config ─────────────────────────────────────────────
// Add a new entry here when adding a new language.

interface LocaleConfig {
  languageName: string;       // e.g. "Western Armenian"
  dialect?: string;           // e.g. "with classical orthography"
  studentDescription: string; // e.g. "Armenian day school students in California"
  scriptField: string;        // e.g. "hy" → fields become _hy
  scriptNote: string;         // instruction about script usage
}

const LOCALE_CONFIGS: Record<string, LocaleConfig> = {
  hy: {
    languageName: "Western Armenian",
    dialect: "with classical orthography (traditional diaspora spelling)",
    studentDescription: "Armenian diaspora children in the United States",
    scriptField: "hy",
    scriptNote: "Armenian script appears ONLY in _hy fields. English appears ONLY in _en fields. NEVER mix scripts.",
  },
  el: {
    languageName: "Greek",
    dialect: "Standard Modern Greek as spoken in the Greek diaspora",
    studentDescription: "Greek diaspora children learning heritage Greek",
    scriptField: "el",
    scriptNote: "Greek script appears ONLY in _el fields. English appears ONLY in _en fields. NEVER mix scripts.",
  },
  ar: {
    languageName: "Arabic",
    dialect: "Modern Standard Arabic with Lebanese pronunciation and vocabulary where applicable",
    studentDescription: "Arabic-speaking diaspora children (Lebanese, Iraqi, and other Christian communities) learning heritage Arabic",
    scriptField: "ar",
    scriptNote: "Arabic script appears ONLY in _ar fields. English appears ONLY in _en fields. NEVER mix scripts. All Arabic text must be fully vowelized (with tashkeel/harakat).",
  },
  tl: {
    languageName: "Tagalog",
    dialect: "Standard Filipino (Tagalog) as spoken in the Philippine diaspora",
    studentDescription: "Filipino diaspora children learning heritage Tagalog",
    scriptField: "tl",
    scriptNote: "Tagalog text (Latin script) appears ONLY in _tl fields. English appears ONLY in _en fields. NEVER mix languages in a single field.",
  },
};

function getLocaleConfig(locale: string): LocaleConfig {
  return LOCALE_CONFIGS[locale] ?? LOCALE_CONFIGS["hy"];
}

// ── System prompt ─────────────────────────────────────────────

export function getSystemPrompt(locale: string = "hy"): string {
  const cfg = getLocaleConfig(locale);
  const dialectNote = cfg.dialect ? ` ${cfg.dialect}` : "";

  return `You are an expert ${cfg.languageName} language teacher creating bilingual exercises for ${cfg.studentDescription}.

RULES:
- Use ${cfg.languageName}${dialectNote}.
- ${cfg.scriptNote}
- Return ONLY valid JSON. No markdown, no backticks, no preamble, no explanation outside the JSON.
- Content must be pedagogically appropriate for the specified grade level.
- Every exercise must be factually correct and culturally appropriate.
- When an "emoji" field is requested, follow these rules:
  - For fill_blank exercises: The emoji MUST represent the CORRECT ANSWER (the word that fills the blank), NOT any other word in the sentence. The emoji is a visual hint to help the student guess the missing word.
  - For multiple_choice exercises: The emoji on the question MUST represent the subject being asked about — the thing the student needs to identify. Do NOT use emoji for people or generic concepts.
  - For true_false exercises: NEVER use ✅ or ❌ — those spoil the answer. Use an emoji related to the topic (🔤 for alphabet, or the word's emoji), or 🤔 as default.
  - Always use a single, concrete, recognizable emoji.`;
}

// ── Helpers ───────────────────────────────────────────────────

function isYoungLearner(grade: string): boolean {
  return grade === "K" || grade === "1";
}

function gradeLabel(grade: string): string {
  return grade === "K" ? "Kindergarten" : `Grade ${grade}`;
}

// Returns the script field suffix for a locale, e.g. "el" for Greek
function sf(locale: string): string {
  return getLocaleConfig(locale).scriptField;
}

// ── Exercise prompt builders ──────────────────────────────────

function multipleChoicePrompt(grade: string, subject: string, topic: string, count: number, locale: string): string {
  const s = sf(locale);
  const young = isYoungLearner(grade);
  const optCount = young ? 3 : 4;
  const ageRange = grade === "K" ? "5-6" : "6-7";

  const youngNote = young
    ? `\n\nIMPORTANT: These are very young learners (ages ${ageRange}). Use only simple, concrete vocabulary. Single-word answers. Picture-identification style.`
    : "";

  return `Generate ${count} multiple-choice questions for ${gradeLabel(grade)} students.
Subject: ${subject}
Topic: ${topic}${youngNote}

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "question_${s}": "Question in target language script",
      "question_en": "Same question in English",
      ${young ? `"emoji": "single emoji representing the question concept",` : ""}
      "options": [
        { "id": "a", "text_${s}": "Option in target language", "text_en": "English", ${young ? `"emoji": "emoji for option", ` : ""}"correct": true },
        { "id": "b", "text_${s}": "Option in target language", "text_en": "English", ${young ? `"emoji": "emoji for option", ` : ""}"correct": false },
        { "id": "c", "text_${s}": "Option in target language", "text_en": "English", ${young ? `"emoji": "emoji for option", ` : ""}"correct": false }${!young ? `,
        { "id": "d", "text_${s}": "Option in target language", "text_en": "English", "correct": false }` : ""}
      ],
      "hint_${s}": "${young ? "" : "Hint in target language"}",
      "hint_en": "${young ? "" : "Hint in English"}",
      "explanation_${s}": "Explanation in target language",
      "explanation_en": "Explanation in English"
    }
  ],
  "topic_title_${s}": "Topic name in target language",
  "topic_title_en": "${topic}"
}

Each question must have exactly ${optCount} options with exactly one correct answer.`;
}

function fillBlankPrompt(grade: string, subject: string, topic: string, count: number, locale: string): string {
  const s = sf(locale);
  const young = isYoungLearner(grade);
  const ageRange = grade === "K" ? "5-6" : "6-7";
  const distractorCount = young ? 2 : 3;

  const youngNote = young
    ? `\n\nIMPORTANT: Very young learners (ages ${ageRange}). Use very simple sentences with single-word blanks. Only concrete, familiar vocabulary.`
    : "";

  return `Generate ${count} fill-in-the-blank exercises for ${gradeLabel(grade)} students.
Subject: ${subject}
Topic: ${topic}${youngNote}

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "sentence_${s}": "Sentence in target language with ___ for the blank",
      "sentence_en": "English translation of the full sentence",
      ${young ? `"emoji": "emoji representing the sentence topic",` : ""}
      "answer_${s}": "Correct word in target language",
      "answer_en": "Correct word in English",
      ${young ? `"answer_emoji": "emoji for the correct answer",` : ""}
      "distractors_${s}": ${JSON.stringify(Array(distractorCount).fill("wrong_option"))},
      "distractors_en": ${JSON.stringify(Array(distractorCount).fill("wrong_option_en"))},
      ${young ? `"distractors_emoji": ${JSON.stringify(Array(distractorCount).fill("emoji"))},` : ""}
      "hint_${s}": "${young ? "" : "Hint in target language"}",
      "hint_en": "${young ? "" : "Hint in English"}",
      "explanation_${s}": "Explanation in target language",
      "explanation_en": "Explanation in English"
    }
  ],
  "topic_title_${s}": "Topic name in target language",
  "topic_title_en": "${topic}"
}

Each sentence must contain exactly one ___ blank. Provide exactly ${distractorCount} distractors.`;
}

function matchingPrompt(grade: string, subject: string, topic: string, count: number, locale: string): string {
  const s = sf(locale);
  const young = isYoungLearner(grade);

  const youngNote = young
    ? `\n\nIMPORTANT: Very young learners. Use only simple single words. Add "emoji_left" and "emoji_right" fields with relevant emoji for each item.`
    : "";

  return `Generate ${count} matching pairs for ${gradeLabel(grade)} students.
Subject: ${subject}
Topic: ${topic}${youngNote}

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "left_${s}": "Word or phrase in target language",
      "left_en": "English translation of left item",
      "right_${s}": "Definition, synonym, or match in target language",
      "right_en": "English translation of right item"${young ? `,
      "emoji_left": "emoji for left item",
      "emoji_right": "emoji for right item"` : ""}
    }
  ],
  "topic_title_${s}": "Topic name in target language",
  "topic_title_en": "${topic}"
}

Each pair should have a clear, unambiguous match.`;
}

function trueFalsePrompt(grade: string, subject: string, topic: string, count: number, locale: string): string {
  const s = sf(locale);
  const young = isYoungLearner(grade);

  const youngNote = young
    ? `\n\nIMPORTANT: Very young learners. Use very simple, concrete statements. Add an "emoji" field with a relevant emoji for each statement.`
    : "";

  const emojiRule = young
    ? `\nIMPORTANT emoji rules for true/false exercises:
- NEVER use ✅ or ❌ as the emoji — those spoil the answer.
- If the statement is about a letter or alphabet, use "🔤".
- If the statement is about a specific word or object, use an emoji that represents that word/object.
- Otherwise, use "🤔" as the default emoji.
- The emoji must relate to the TOPIC of the statement, never to whether the answer is true or false.`
    : "";

  return `Generate ${count} true/false questions for ${gradeLabel(grade)} students.
Subject: ${subject}
Topic: ${topic}${youngNote}${emojiRule}

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "statement_${s}": "Statement in target language",
      "statement_en": "Same statement in English",
      ${young ? `"emoji": "relevant emoji (NEVER ✅ or ❌)",` : ""}
      "correct_answer": true,
      "explanation_${s}": "Why it is true/false, in target language",
      "explanation_en": "Why it is true/false, in English"
    }
  ],
  "topic_title_${s}": "Topic name in target language",
  "topic_title_en": "${topic}"
}

Mix true and false answers roughly equally.`;
}

function learnCardPrompt(grade: string, topic: string, count: number, locale: string): string {
  const s = sf(locale);

  return `Generate ${count} vocabulary learn cards for ${gradeLabel(grade)} students.
Topic: ${topic}

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "visual": "single emoji representing the word",
      "primary_text": "Word in target language script",
      "secondary_text": "English translation"
    }
  ],
  "topic_title_${s}": "Topic name in target language",
  "topic_title_en": "${topic}"
}`;
}

// ── Main export ───────────────────────────────────────────────

export function buildUserPrompt(
  grade: string,
  subject: string,
  topic: string,
  exerciseType: ExerciseType,
  count: number,
  locale: string = "hy"
): string {
  switch (exerciseType) {
    case "multiple_choice":
      return multipleChoicePrompt(grade, subject, topic, count, locale);
    case "fill_blank":
      return fillBlankPrompt(grade, subject, topic, count, locale);
    case "matching":
      return matchingPrompt(grade, subject, topic, count, locale);
    case "true_false":
      return trueFalsePrompt(grade, subject, topic, count, locale);
    case "learn_card":
      return learnCardPrompt(grade, topic, count, locale);
  }
}
