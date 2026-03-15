// Validates that generated exercises match their source content items

interface ContentItem {
  item_type: string;
  item_data: Record<string, unknown>;
}

interface Exercise {
  exercise_type: string;
  exercise_data: Record<string, unknown>;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateLesson(
  contentItems: ContentItem[],
  exercises: Exercise[],
  templateType: string
): ValidationResult {
  const errors: string[] = [];

  // Collect known content strings
  const knownArmenian = new Set<string>();
  const knownEnglish = new Set<string>();
  const knownEmoji = new Set<string>();

  for (const item of contentItems) {
    const d = item.item_data;
    if (item.item_type === "letter") {
      knownArmenian.add(d.letter_upper as string);
      knownArmenian.add(d.letter_lower as string);
      knownArmenian.add(d.letter_name as string);
      knownArmenian.add(d.example_word_arm as string);
      knownEnglish.add(d.example_word_eng as string);
      knownEnglish.add(d.transliteration as string);
      if (d.emoji) knownEmoji.add(d.emoji as string);
    } else if (item.item_type === "word") {
      knownArmenian.add(d.armenian as string);
      knownEnglish.add(d.english as string);
      if (d.emoji) knownEmoji.add(d.emoji as string);
    }
  }

  // Check minimum exercise count
  const minExercises = templateType === "quiz" ? 6 : 4;
  const practiceExercises = exercises.filter((e) => e.exercise_type !== "learn_card");
  if (practiceExercises.length < minExercises) {
    errors.push(`Too few exercises: ${practiceExercises.length} (minimum ${minExercises})`);
  }

  // Check learn cards exist
  const learnCards = exercises.filter((e) => e.exercise_type === "learn_card");
  if (templateType !== "quiz" && learnCards.length === 0 && contentItems.length > 0) {
    errors.push("No learn cards generated for non-quiz lesson");
  }

  // Check content items have learn cards
  if (templateType !== "quiz" && templateType !== "review") {
    if (learnCards.length < contentItems.length) {
      errors.push(`Only ${learnCards.length} learn cards for ${contentItems.length} content items`);
    }
  }

  // Check MC exercises have exactly 1 correct answer
  for (const ex of exercises) {
    if (ex.exercise_type !== "multiple_choice") continue;
    const opts = ex.exercise_data.options as { correct: boolean }[] | undefined;
    if (!opts) { errors.push(`MC exercise missing options`); continue; }
    const correctCount = opts.filter((o) => o.correct).length;
    if (correctCount !== 1) {
      errors.push(`MC exercise has ${correctCount} correct answers (should be 1)`);
    }
    // Check for duplicate options
    const texts = opts.map((o) => (o as Record<string, unknown>).text_hy as string);
    if (new Set(texts).size !== texts.length) {
      errors.push("MC exercise has duplicate options");
    }
  }

  // Check emoji consistency
  for (const ex of exercises) {
    const emoji = ex.exercise_data.emoji as string;
    if (emoji && knownEmoji.size > 0 && !knownEmoji.has(emoji)) {
      errors.push(`Exercise uses emoji "${emoji}" not found in content items`);
    }
  }

  return { valid: errors.length === 0, errors };
}
