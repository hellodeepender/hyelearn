export type UserRole = "teacher" | "student";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type ExerciseType =
  | "multiple_choice"
  | "fill_in_the_blank"
  | "translation"
  | "matching"
  | "sentence_building";

export interface Exercise {
  id: string;
  type: ExerciseType;
  difficulty: DifficultyLevel;
  topic: string;
  prompt: string;
  prompt_armenian?: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  explanation_armenian?: string;
}

export interface ExerciseSet {
  id: string;
  title: string;
  topic: string;
  difficulty: DifficultyLevel;
  exercises: Exercise[];
  created_by: string;
  created_at: string;
}

export interface StudentProgress {
  user_id: string;
  exercise_id: string;
  score: number;
  completed_at: string;
  time_spent_seconds: number;
}

export interface GenerateRequest {
  topic: string;
  difficulty: DifficultyLevel;
  exercise_type: ExerciseType;
  count: number;
}
