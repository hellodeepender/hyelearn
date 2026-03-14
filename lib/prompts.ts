import type { ExerciseType } from "./types";

export function getSystemPrompt(): string {
  return `You are an expert Western Armenian language teacher creating bilingual exercises for Armenian day school students in California.

RULES:
- Use WESTERN Armenian with classical orthography (traditional diaspora spelling).
- Armenian script appears ONLY in _hy fields. English appears ONLY in _en fields. NEVER mix scripts.
- Return ONLY valid JSON. No markdown, no backticks, no preamble, no explanation outside the JSON.
- Content must be pedagogically appropriate for the specified grade level.
- Every exercise must be factually correct and culturally appropriate for Armenian day schools.
- When an "emoji" field is requested, follow these rules:
  - For fill_blank exercises: The emoji MUST represent the CORRECT ANSWER (the word that fills the blank), NOT any other word in the sentence. The emoji is a visual hint to help the student guess the missing word. Example: if the sentence is "The child eats ___" and the answer is "apple", the emoji must be an apple, not a child.
  - For multiple_choice exercises: The emoji on the question MUST represent the subject being asked about — the thing the student needs to identify. Do NOT use emoji for people or generic concepts.
  - Always use a single, concrete, recognizable emoji.`;
}

function isYoungLearner(grade: string): boolean {
  return grade === "K" || grade === "1";
}

function gradeLabel(grade: string): string {
  return grade === "K" ? "Kindergarten" : `Grade ${grade}`;
}

function multipleChoicePrompt(grade: string, subject: string, topic: string, count: number): string {
  if (isYoungLearner(grade)) {
    const optCount = grade === "K" ? 3 : 3;
    return `Generate ${count} multiple-choice questions for ${gradeLabel(grade)} students (ages ${grade === "K" ? "5-6" : "6-7"}).
Subject: ${subject}
Topic: ${topic}

IMPORTANT: These are very young learners. Use only simple, concrete vocabulary. Single-word answers. Picture-identification style.

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "question_hy": "Simple question in Armenian script",
      "question_en": "Same question in English",
      "emoji": "single emoji representing the question concept",
      "options": [
        { "id": "a", "text_hy": "Single Armenian word", "text_en": "English word", "emoji": "emoji for this option", "correct": true },
        { "id": "b", "text_hy": "Single Armenian word", "text_en": "English word", "emoji": "emoji for this option", "correct": false },
        { "id": "c", "text_hy": "Single Armenian word", "text_en": "English word", "emoji": "emoji for this option", "correct": false }
      ],
      "hint_hy": "",
      "hint_en": "",
      "explanation_hy": "Simple explanation in Armenian",
      "explanation_en": "Simple explanation in English"
    }
  ],
  "topic_title_hy": "Topic name in Armenian",
  "topic_title_en": "${topic}"
}

Each question must have exactly ${optCount} options with exactly one correct answer. Keep all text very simple.`;
  }

  return `Generate ${count} multiple-choice questions for ${gradeLabel(grade)} students.
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

function fillBlankPrompt(grade: string, subject: string, topic: string, count: number): string {
  if (isYoungLearner(grade)) {
    return `Generate ${count} fill-in-the-blank exercises for ${gradeLabel(grade)} students (ages ${grade === "K" ? "5-6" : "6-7"}).
Subject: ${subject}
Topic: ${topic}

IMPORTANT: Very young learners. Use very simple sentences with single-word blanks. Only concrete, familiar vocabulary.

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "sentence_hy": "Simple Armenian sentence with ___ for the blank",
      "sentence_en": "English translation of the full sentence",
      "emoji": "emoji representing the sentence topic",
      "answer_hy": "Correct word in Armenian",
      "answer_en": "Correct word in English",
      "answer_emoji": "emoji for the correct answer",
      "distractors_hy": ["wrong1_hy", "wrong2_hy"],
      "distractors_en": ["wrong1_en", "wrong2_en"],
      "distractors_emoji": ["emoji1", "emoji2"],
      "hint_hy": "",
      "hint_en": "",
      "explanation_hy": "Simple explanation in Armenian",
      "explanation_en": "Simple explanation in English"
    }
  ],
  "topic_title_hy": "Topic name in Armenian",
  "topic_title_en": "${topic}"
}

Each sentence must contain exactly one ___ blank. Provide exactly 2 distractors for young learners.`;
  }

  return `Generate ${count} fill-in-the-blank exercises for ${gradeLabel(grade)} students.
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

function matchingPrompt(grade: string, subject: string, topic: string, count: number): string {
  const extra = isYoungLearner(grade)
    ? `\n\nIMPORTANT: Very young learners. Use only simple single words. Add an "emoji" field to each pair.\nAdd "emoji_left" and "emoji_right" fields with relevant emoji for each item.`
    : "";

  return `Generate ${count} matching pairs for ${gradeLabel(grade)} students.
Subject: ${subject}
Topic: ${topic}${extra}

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "left_hy": "Armenian word or phrase (left column)",
      "left_en": "English translation of left item",
      "right_hy": "Armenian definition, synonym, or match (right column)",
      "right_en": "English translation of right item"${isYoungLearner(grade) ? `,
      "emoji_left": "emoji for left item",
      "emoji_right": "emoji for right item"` : ""}
    }
  ],
  "topic_title_hy": "Topic name in Armenian",
  "topic_title_en": "${topic}"
}

Each pair should have a clear, unambiguous match.`;
}

function trueFalsePrompt(grade: string, subject: string, topic: string, count: number): string {
  const extra = isYoungLearner(grade)
    ? `\n\nIMPORTANT: Very young learners. Use very simple, concrete statements. Add an "emoji" field with a relevant emoji for each statement.`
    : "";

  return `Generate ${count} true/false questions for ${gradeLabel(grade)} students.
Subject: ${subject}
Topic: ${topic}${extra}

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "statement_hy": "Statement in Armenian",
      "statement_en": "Same statement in English",${isYoungLearner(grade) ? `
      "emoji": "relevant emoji",` : ""}
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
  grade: string,
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
    case "learn_card":
      return `Generate ${count} vocabulary learn cards for ${grade === "K" ? "Kindergarten" : `Grade ${grade}`} students.
Topic: ${topic}

Return this exact JSON structure:
{
  "exercises": [
    {
      "id": "1",
      "visual": "single emoji representing the word",
      "primary_text": "Armenian word in Armenian script",
      "secondary_text": "English translation"
    }
  ],
  "topic_title_hy": "Topic name in Armenian",
  "topic_title_en": "${topic}"
}`;
  }
}
