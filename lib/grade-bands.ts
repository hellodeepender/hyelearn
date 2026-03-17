export type GradeBand = "emergent" | "early" | "developing" | "fluent";

export function getGradeBand(grade: string): GradeBand {
  if (grade === "K") return "emergent";
  if (grade === "1" || grade === "2") return "early";
  if (grade === "3" || grade === "4") return "developing";
  return "fluent";
}

export interface BandConfig {
  label: string;
  contentTypes: readonly string[];
  exerciseTypes: readonly string[];
  emojiSupported: boolean;
}

export const BAND_CONFIG = {
  emergent: {
    label: "Emergent (K)",
    contentTypes: ["letter", "word"],
    exerciseTypes: ["multiple_choice", "matching", "true_false"],
    emojiSupported: true,
  },
  early: {
    label: "Early (1\u20132)",
    contentTypes: ["word", "phrase"],
    exerciseTypes: ["multiple_choice", "matching", "true_false", "fill_blank", "sentence_completion"],
    emojiSupported: true,
  },
  developing: {
    label: "Developing (3\u20134)",
    contentTypes: ["word", "phrase", "reading_passage", "grammar_note"],
    exerciseTypes: ["multiple_choice", "matching", "fill_blank", "sentence_completion", "reading_comprehension", "sentence_construction", "grammar_exercise"],
    emojiSupported: false,
  },
  fluent: {
    label: "Fluent (5+)",
    contentTypes: ["word", "phrase", "reading_passage", "grammar_note", "composition_prompt", "discussion_question"],
    exerciseTypes: ["multiple_choice", "fill_blank", "sentence_completion", "reading_comprehension", "sentence_construction", "grammar_exercise", "translation", "composition", "discussion"],
    emojiSupported: false,
  },
} as const satisfies Record<GradeBand, BandConfig>;

export function getContentTypes(grade: string): readonly string[] {
  return BAND_CONFIG[getGradeBand(grade)].contentTypes;
}

export function getExerciseTypes(grade: string): readonly string[] {
  return BAND_CONFIG[getGradeBand(grade)].exerciseTypes;
}

export function hasEmoji(grade: string): boolean {
  return BAND_CONFIG[getGradeBand(grade)].emojiSupported;
}
