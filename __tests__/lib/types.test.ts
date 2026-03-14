import { describe, it, expect } from "vitest";
import type {
  ExerciseType,
  MultipleChoiceExercise,
  FillBlankExercise,
  MatchingExercise,
  TrueFalseExercise,
  MCOption,
} from "@/lib/types";

describe("Type definitions", () => {
  it("ExerciseType union includes all four types", () => {
    const types: ExerciseType[] = ["multiple_choice", "fill_blank", "matching", "true_false"];
    expect(types).toHaveLength(4);
  });

  it("MCOption supports emoji field", () => {
    const opt: MCOption = { id: "a", text_hy: "test", text_en: "test", correct: true, emoji: "🍎" };
    expect(opt.emoji).toBe("🍎");
  });

  it("MCOption works without emoji", () => {
    const opt: MCOption = { id: "b", text_hy: "test", text_en: "test", correct: false };
    expect(opt.emoji).toBeUndefined();
  });

  it("MultipleChoiceExercise supports optional emoji", () => {
    const exercise: MultipleChoiceExercise = {
      id: "1", question_hy: "q", question_en: "q", emoji: "🐕",
      options: [{ id: "a", text_hy: "a", text_en: "a", correct: true }],
      hint_hy: "", hint_en: "", explanation_hy: "", explanation_en: "",
    };
    expect(exercise.emoji).toBe("🐕");
  });

  it("FillBlankExercise supports optional emoji fields", () => {
    const exercise: FillBlankExercise = {
      id: "1", sentence_hy: "s", sentence_en: "s", emoji: "🍎",
      answer_hy: "a", answer_en: "a", answer_emoji: "🍎",
      distractors_hy: ["d"], distractors_en: ["d"], distractors_emoji: ["🍌"],
      hint_hy: "", hint_en: "", explanation_hy: "", explanation_en: "",
    };
    expect(exercise.answer_emoji).toBe("🍎");
    expect(exercise.distractors_emoji).toHaveLength(1);
  });

  it("MatchingExercise supports optional emoji fields", () => {
    const exercise: MatchingExercise = {
      id: "1", left_hy: "l", left_en: "l", right_hy: "r", right_en: "r",
      emoji_left: "🐱", emoji_right: "cat",
    };
    expect(exercise.emoji_left).toBe("🐱");
  });

  it("TrueFalseExercise supports optional emoji", () => {
    const exercise: TrueFalseExercise = {
      id: "1", statement_hy: "s", statement_en: "s", emoji: "🌞",
      correct_answer: true, explanation_hy: "", explanation_en: "",
    };
    expect(exercise.emoji).toBe("🌞");
  });
});
