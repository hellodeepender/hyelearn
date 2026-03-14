import type { DifficultyLevel, ExerciseType } from "./types";

export function buildExercisePrompt(
  topic: string,
  difficulty: DifficultyLevel,
  exerciseType: ExerciseType,
  count: number
): string {
  return `You are an expert Western Armenian language teacher creating bilingual exercises for Armenian day school students.

Generate ${count} ${exerciseType.replace(/_/g, " ")} exercise(s) about "${topic}" at the ${difficulty} level.

Requirements:
- Use Western Armenian (not Eastern Armenian)
- Include both Armenian text and English translations/context
- Difficulty "${difficulty}" means:
  - beginner: basic vocabulary, simple sentences, common words
  - intermediate: compound sentences, verb conjugations, everyday conversation
  - advanced: complex grammar, idiomatic expressions, literary Armenian
- Each exercise must have a clear correct answer and a brief explanation in both languages

Return valid JSON matching this structure:
{
  "exercises": [
    {
      "type": "${exerciseType}",
      "difficulty": "${difficulty}",
      "topic": "${topic}",
      "prompt": "English prompt text",
      "prompt_armenian": "Armenian prompt text",
      "options": ["option1", "option2", "option3", "option4"],
      "correct_answer": "the correct answer",
      "explanation": "Why this is correct (English)",
      "explanation_armenian": "Why this is correct (Armenian)"
    }
  ]
}`;
}
