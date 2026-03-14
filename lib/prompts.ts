import type { ExerciseType } from "./types";

export function getSystemPrompt(): string {
  return `You are an expert Western Armenian language teacher creating bilingual exercises for Armenian day school students in California.

RULES:
- Use WESTERN Armenian with classical orthography (traditional diaspora spelling).
- Armenian script (Ա-Ֆ) appears ONLY in _hy fields. English appears ONLY in _en fields. NEVER mix scripts.
- Return ONLY valid JSON. No markdown, no backticks, no preamble, no explanation outside the JSON.
- Content must be pedagogically appropriate for the specified grade level.
- Every exercise must be factually correct and culturally appropriate for Armenian day schools.`;
}

function multipleChoicePrompt(grade: number, subject: string, topic: string, count: number): string {
  return `Generate ${count} multiple-choice questions for Grade ${grade} students.
Subject: ${subject}
Topic: ${topic}

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "question_hy": "Question in Armenian script",
      "question_en": "Same question in English",
      "options": [
        { "id": "a", "text_hy": "Armenian option", "text_en": "English option", "correct": false },
        { "id": "b", "text_hy": "Armenian option", "text_en": "English option", "correct": true },
        { "id": "c", "text_hy": "Armenian option", "text_en": "English option", "correct": false },
        { "id": "d", "text_hy": "Armenian option", "text_en": "English option", "correct": false }
      ],
      "hint_hy": "Hint in Armenian",
      "hint_en": "Hint in English",
      "explanation_hy": "Why the answer is correct, in Armenian",
      "explanation_en": "Why the answer is correct, in English"
    }
  ],
  "topic_title_hy": "Topic name in Armenian",
  "topic_title_en": "${topic}"
}

Each question must have exactly 4 options with exactly one correct answer.`;
}

function fillBlankPrompt(grade: number, subject: string, topic: string, count: number): string {
  return `Generate ${count} fill-in-the-blank exercises for Grade ${grade} students.
Subject: ${subject}
Topic: ${topic}

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "sentence_hy": "Armenian sentence with ___ for the blank",
      "sentence_en": "English translation of the full sentence",
      "answer_hy": "Correct word in Armenian",
      "answer_en": "Correct word in English",
      "distractors_hy": ["wrong1_hy", "wrong2_hy", "wrong3_hy"],
      "distractors_en": ["wrong1_en", "wrong2_en", "wrong3_en"],
      "hint_hy": "Hint in Armenian",
      "hint_en": "Hint in English",
      "explanation_hy": "Explanation in Armenian",
      "explanation_en": "Explanation in English"
    }
  ],
  "topic_title_hy": "Topic name in Armenian",
  "topic_title_en": "${topic}"
}

Each sentence must contain exactly one ___ blank. Provide exactly 3 distractors (wrong answers) for each.`;
}

function matchingPrompt(grade: number, subject: string, topic: string, count: number): string {
  return `Generate ${count} matching pairs for Grade ${grade} students.
Subject: ${subject}
Topic: ${topic}

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "left_hy": "Armenian word or phrase (left column)",
      "left_en": "English translation of left item",
      "right_hy": "Armenian definition, synonym, or match (right column)",
      "right_en": "English translation of right item"
    }
  ],
  "topic_title_hy": "Topic name in Armenian",
  "topic_title_en": "${topic}"
}

Each pair should have a clear, unambiguous match. Left column items are Armenian words; right column items are their meanings, translations, or matching concepts.`;
}

function trueFalsePrompt(grade: number, subject: string, topic: string, count: number): string {
  return `Generate ${count} true/false questions for Grade ${grade} students.
Subject: ${subject}
Topic: ${topic}

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "statement_hy": "Statement in Armenian",
      "statement_en": "Same statement in English",
      "correct_answer": true,
      "explanation_hy": "Why it is true/false, in Armenian",
      "explanation_en": "Why it is true/false, in English"
    }
  ],
  "topic_title_hy": "Topic name in Armenian",
  "topic_title_en": "${topic}"
}

Mix true and false answers roughly equally.`;
}

export function buildUserPrompt(
  grade: number,
  subject: string,
  topic: string,
  exerciseType: ExerciseType,
  count: number
): string {
  switch (exerciseType) {
    case "multiple_choice":
      return multipleChoicePrompt(grade, subject, topic, count);
    case "fill_blank":
      return fillBlankPrompt(grade, subject, topic, count);
    case "matching":
      return matchingPrompt(grade, subject, topic, count);
    case "true_false":
      return trueFalsePrompt(grade, subject, topic, count);
  }
}
