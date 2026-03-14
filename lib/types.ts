export type UserRole = "teacher" | "student" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export type ExerciseType = "multiple_choice" | "fill_blank" | "matching" | "true_false";

// --- Exercise structures (match Claude API response shapes) ---

export interface MCOption {
  id: "a" | "b" | "c" | "d";
  text_hy: string;
  text_en: string;
  correct: boolean;
  emoji?: string;
}

export interface MultipleChoiceExercise {
  id: string;
  question_hy: string;
  question_en: string;
  emoji?: string;
  options: MCOption[];
  hint_hy: string;
  hint_en: string;
  explanation_hy: string;
  explanation_en: string;
}

export interface FillBlankExercise {
  id: string;
  sentence_hy: string;
  sentence_en: string;
  emoji?: string;
  answer_hy: string;
  answer_en: string;
  answer_emoji?: string;
  distractors_hy: string[];
  distractors_en: string[];
  distractors_emoji?: string[];
  hint_hy: string;
  hint_en: string;
  explanation_hy: string;
  explanation_en: string;
}

export interface MatchingExercise {
  id: string;
  left_hy: string;
  left_en: string;
  right_hy: string;
  right_en: string;
  emoji_left?: string;
  emoji_right?: string;
}

export interface TrueFalseExercise {
  id: string;
  statement_hy: string;
  statement_en: string;
  emoji?: string;
  correct_answer: boolean;
  explanation_hy: string;
  explanation_en: string;
}

export type Exercise = MultipleChoiceExercise | FillBlankExercise | MatchingExercise | TrueFalseExercise;

// --- API response wrappers ---

export interface ExerciseSetResponse {
  exercises: Exercise[];
  topic_title_hy: string;
  topic_title_en: string;
}

export interface GenerateRequest {
  grade: number;
  subject: string;
  topic: string;
  exerciseType: ExerciseType;
  count?: number;
}

export interface GenerateResponse {
  exercises: Exercise[];
  topic_title_hy: string;
  topic_title_en: string;
}

// --- Practice session tracking ---

export interface ExerciseAnswer {
  exerciseIndex: number;
  correct: boolean;
}

export interface SessionResult {
  subject: string;
  topic: string;
  exerciseType: ExerciseType;
  gradeLevel: number;
  score: number;
  total: number;
  exercisesData: unknown;
}
