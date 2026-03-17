// Template engine: generates learn cards + exercises from raw content items
//
// RULES:
// 1. Question and options must NEVER be the same format (no Armenian→Armenian)
// 2. Every exercise has exactly 3 options (1 correct + 2 wrong)
// 3. Feedback format: "[armenian] ([transliteration]) means [english]"
// 4. Difficulty order: Recognition → Recall → Production → Application
// 5. Matching exercises always have exactly 3 pairs
// 6. Quiz exercises always get showCorrectAnswer: false

import { transliterate } from "@/lib/transliterate";

interface ContentItem {
  id: string;
  item_type: string;
  sort_order: number;
  item_data: Record<string, unknown>;
}

interface GeneratedExercise {
  exercise_type: string;
  exercise_data: Record<string, unknown>;
  sort_order: number;
}

// --- HELPERS ---

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick N random items from pool, excluding index correctIdx */
function pickWrong<T>(pool: T[], correctIdx: number, count = 2): T[] {
  return shuffle(pool.filter((_, i) => i !== correctIdx)).slice(0, count);
}

/** Build a shuffled 3-option array: 1 correct + 2 wrong */
function make3Options(correct: { hy: string; en: string }, wrongs: { hy: string; en: string }[]) {
  const all = [{ ...correct, correct: true }, ...wrongs.slice(0, 2).map((w) => ({ ...w, correct: false }))];
  return shuffle(all).map((o, j) => ({ id: ["a", "b", "c"][j] as string, text_hy: o.hy, text_en: o.en, correct: o.correct }));
}

/** Standard feedback: "armenian (transliteration) means english" */
function armFeedback(arm: string, eng: string): string {
  return `${arm} (${transliterate(arm)}) means ${eng}`;
}

/** Emit 3 matching pairs as individual rows sharing the same sort_order */
function emitMatching(
  pairs: { left_hy: string; left_en: string; right_hy: string; right_en: string }[],
  results: GeneratedExercise[],
  sortOrder: number,
) {
  for (const p of pairs.slice(0, 3)) {
    results.push({
      exercise_type: "matching",
      exercise_data: { type: "matching", id: `m${sortOrder}`, ...p, sort_order: sortOrder },
      sort_order: sortOrder,
    });
  }
}

// =============================================================================
// ALPHABET TEMPLATE
// Input: 3 letter content items
// Output: 3 learn cards + 8 exercises = 11 steps
// =============================================================================

function generateAlphabet(items: ContentItem[]): GeneratedExercise[] {
  const letters = items.filter((i) => i.item_type === "letter").sort((a, b) => a.sort_order - b.sort_order);
  if (letters.length < 3) return [];

  const results: GeneratedExercise[] = [];
  let s = 1;

  // --- Learn Cards (3, sort 1-3) ---
  for (const l of letters) {
    const d = l.item_data;
    results.push({
      exercise_type: "learn_card",
      exercise_data: {
        type: "learn_card",
        letter: `${d.letter_upper} ${d.letter_lower}`,
        letter_name: d.letter_name as string,
        transliteration: (d.transliteration as string) || transliterate(d.letter_name as string),
        sound: d.sound as string,
        example_word: d.example_word_target as string,
        example_translation: transliterate(d.example_word_target as string),
        emoji: d.emoji as string,
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  // Option pools
  // Letters as "Ա ա" for picking the visual letter form
  const charPool = letters.map((l) => ({
    hy: `${l.item_data.letter_upper} ${l.item_data.letter_lower}`,
    en: l.item_data.transliteration as string,
  }));

  // --- Exercise 1-3: Letter Recognition (sort 4-6) ---
  // SHOW: letter name (text) → PICK: letter character
  // Tests: "You know the name — can you find the letter?"
  for (let i = 0; i < Math.min(3, letters.length); i++) {
    const d = letters[i].item_data;
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(s), emoji: "",
        question_hy: d.letter_name as string,
        question_en: "Which letter is this?",
        options: make3Options(charPool[i], pickWrong(charPool, i)),
        hint_hy: "", hint_en: `${d.letter_name} (${d.transliteration}) — sounds like "${d.sound}"`,
        explanation_hy: `${d.letter_upper} ${d.letter_lower} - ${d.letter_name}`,
        explanation_en: `${d.letter_upper} ${d.letter_lower} is ${d.letter_name} (${d.transliteration})`,
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  // --- Exercise 4-5: Sound Recognition (sort 7-8) ---
  // SHOW: sound description → PICK: letter character
  // Tests: "You hear this sound — which letter makes it?"
  for (let i = 0; i < Math.min(2, letters.length); i++) {
    const d = letters[i].item_data;
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(s), emoji: "",
        question_hy: `"${d.sound}"`,
        question_en: "Which letter makes this sound?",
        options: make3Options(charPool[i], pickWrong(charPool, i)),
        hint_hy: "", hint_en: `Think about the letter ${d.letter_name}`,
        explanation_hy: `${d.letter_upper} - ${d.letter_name}`,
        explanation_en: `${d.letter_name} (${d.letter_upper}) sounds like "${d.sound}"`,
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  // --- Exercise 6: Word Association (sort 9) ---
  // SHOW: example word + emoji → PICK: letter character
  // Tests: "This word starts with which letter?"
  const wl = letters[0].item_data;
  const wlArm = wl.example_word_target as string;
  results.push({
    exercise_type: "multiple_choice",
    exercise_data: {
      type: "multiple_choice", id: String(s),
      emoji: wl.emoji as string,
      question_hy: wlArm,
      question_en: `Which letter does ${wlArm} (${transliterate(wlArm)}) start with?`,
      options: make3Options(charPool[0], pickWrong(charPool, 0)),
      hint_hy: "", hint_en: `${wlArm} (${transliterate(wlArm)}) starts with ${wl.transliteration}`,
      explanation_hy: `${wlArm} - ${wl.letter_upper}`,
      explanation_en: `${wlArm} (${transliterate(wlArm)}) starts with ${wl.letter_name} (${wl.letter_upper})`,
      sort_order: s,
    },
    sort_order: s++,
  });

  // --- Exercise 7: Matching (sort 10) ---
  // 3 pairs: letter character ↔ letter name
  emitMatching(
    letters.map((l) => ({
      left_hy: `${l.item_data.letter_upper} ${l.item_data.letter_lower}`,
      left_en: l.item_data.transliteration as string,
      right_hy: l.item_data.letter_name as string,
      right_en: l.item_data.transliteration as string,
    })),
    results, s,
  );
  s++;

  // --- Exercise 8: Fill-in-blank (sort 11) ---
  // "The letter ___ sounds like '[sound]'" → pick letter character
  const fb = letters[0].item_data;
  results.push({
    exercise_type: "fill_blank",
    exercise_data: {
      type: "fill_blank", id: String(s), emoji: "",
      sentence_hy: `___ - "${fb.sound}"`,
      sentence_en: `The letter ___ sounds like "${fb.sound}"`,
      answer_hy: `${fb.letter_upper}`, answer_en: fb.transliteration as string,
      distractors_hy: letters.slice(1, 3).map((l) => `${l.item_data.letter_upper}`),
      distractors_en: letters.slice(1, 3).map((l) => l.item_data.transliteration as string),
      hint_hy: "", hint_en: `This letter is ${fb.letter_name} (${fb.transliteration})`,
      explanation_hy: `${fb.letter_name} - ${fb.letter_upper} ${fb.letter_lower}`,
      explanation_en: `${fb.letter_name} (${fb.letter_upper} ${fb.letter_lower}) sounds like "${fb.sound}"`,
      sort_order: s,
    },
    sort_order: s,
  });

  return results;
}

// =============================================================================
// VOCABULARY TEMPLATE
// Input: 3 word content items
// Output: 3 learn cards + 8 exercises = 11 steps
// =============================================================================

function generateVocabulary(items: ContentItem[]): GeneratedExercise[] {
  const words = items.filter((i) => i.item_type === "word").sort((a, b) => a.sort_order - b.sort_order);
  if (words.length < 3) return [];

  const results: GeneratedExercise[] = [];
  let s = 1;

  // --- Learn Cards (3, sort 1-3) ---
  for (const w of words) {
    const d = w.item_data;
    results.push({
      exercise_type: "learn_card",
      exercise_data: {
        type: "learn_card", visual: d.emoji as string,
        primary_text: d.target_lang as string, secondary_text: d.english as string,
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  // Option pools
  const armPool = words.map((w) => ({ hy: w.item_data.target_lang as string, en: "" }));
  const engPool = words.map((w) => ({ hy: w.item_data.english as string, en: w.item_data.english as string }));

  // --- Exercise 1-3: Picture Recognition (sort 4-6) ---
  // SHOW: emoji only → PICK: Armenian word
  // Tests: "You see a picture — which Armenian word is it?"
  for (let i = 0; i < Math.min(3, words.length); i++) {
    const d = words[i].item_data;
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(s),
        emoji: d.emoji as string,
        question_hy: "", question_en: "What is this?",
        options: make3Options(armPool[i], pickWrong(armPool, i)),
        hint_hy: "", hint_en: "Choose the Armenian word for this picture",
        explanation_hy: d.target_lang as string,
        explanation_en: `${d.emoji} ${armFeedback(d.target_lang as string, d.english as string)}`,
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  // --- Exercise 4-5: Recall — Armenian to English (sort 7-8) ---
  // SHOW: Armenian word → PICK: English translation
  // Tests: "You see the Armenian word — what does it mean?"
  for (let i = 0; i < Math.min(2, words.length); i++) {
    const d = words[i].item_data;
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(s), emoji: "",
        question_hy: d.target_lang as string, question_en: "What does this word mean?",
        options: make3Options(engPool[i], pickWrong(engPool, i)),
        hint_hy: "", hint_en: `Think about: ${d.english}`,
        explanation_hy: `${d.target_lang} = ${d.english}`,
        explanation_en: armFeedback(d.target_lang as string, d.english as string),
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  // --- Exercise 6: Reverse Recall — English to Armenian (sort 9) ---
  // SHOW: English word + emoji → PICK: Armenian word
  // Tests: "How do you say this in Armenian?"
  const ri = Math.min(2, words.length - 1);
  const rd = words[ri].item_data;
  results.push({
    exercise_type: "multiple_choice",
    exercise_data: {
      type: "multiple_choice", id: String(s),
      emoji: rd.emoji as string,
      question_hy: rd.english as string, question_en: "How do you say this in Armenian?",
      options: make3Options(armPool[ri], pickWrong(armPool, ri)),
      hint_hy: "", hint_en: armFeedback(rd.target_lang as string, rd.english as string),
      explanation_hy: rd.target_lang as string,
      explanation_en: armFeedback(rd.target_lang as string, rd.english as string),
      sort_order: s,
    },
    sort_order: s++,
  });

  // --- Exercise 7: Matching (sort 10) ---
  // 3 pairs: Armenian word ↔ English word
  emitMatching(
    words.map((w) => ({
      left_hy: w.item_data.target_lang as string,
      left_en: transliterate(w.item_data.target_lang as string),
      right_hy: w.item_data.english as string,
      right_en: w.item_data.english as string,
    })),
    results, s,
  );
  s++;

  // --- Exercise 8: Fill-in-blank (sort 11) ---
  // "___ means [english]" → pick Armenian word
  const fb = words[0].item_data;
  results.push({
    exercise_type: "fill_blank",
    exercise_data: {
      type: "fill_blank", id: String(s),
      emoji: fb.emoji as string,
      sentence_hy: `___ ${fb.emoji}`, sentence_en: `___ means ${fb.english}`,
      answer_hy: fb.target_lang as string, answer_en: fb.english as string,
      distractors_hy: words.slice(1, 3).map((w) => w.item_data.target_lang as string),
      distractors_en: words.slice(1, 3).map((w) => w.item_data.english as string),
      hint_hy: "", hint_en: armFeedback(fb.target_lang as string, fb.english as string),
      explanation_hy: `${fb.target_lang} = ${fb.english}`,
      explanation_en: armFeedback(fb.target_lang as string, fb.english as string),
      sort_order: s,
    },
    sort_order: s,
  });

  return results;
}

// =============================================================================
// REVIEW TEMPLATE: learn cards + 6 exercises
// QUIZ TEMPLATE: 9 exercises, no learn cards, no feedback
// =============================================================================

function generateReview(items: ContentItem[], isQuiz: boolean): GeneratedExercise[] {
  const letters = items.filter((i) => i.item_type === "letter");
  const words = items.filter((i) => i.item_type === "word");
  const results: GeneratedExercise[] = [];
  let s = 1;
  const showCorrect = !isQuiz;
  const h = (text: string) => isQuiz ? "" : text;

  // --- Learn Cards (review only) ---
  if (!isQuiz) {
    for (const item of items.sort((a, b) => a.sort_order - b.sort_order)) {
      const d = item.item_data;
      if (item.item_type === "letter") {
        results.push({
          exercise_type: "learn_card",
          exercise_data: {
            type: "learn_card",
            letter: `${d.letter_upper} ${d.letter_lower}`,
            letter_name: d.letter_name as string,
            transliteration: (d.transliteration as string) || transliterate(d.letter_name as string),
            sound: d.sound as string,
            example_word: d.example_word_target as string,
            example_translation: transliterate(d.example_word_target as string),
            emoji: d.emoji as string,
            sort_order: s,
          },
          sort_order: s++,
        });
      } else {
        results.push({
          exercise_type: "learn_card",
          exercise_data: {
            type: "learn_card", visual: d.emoji as string,
            primary_text: d.target_lang as string, secondary_text: d.english as string,
            sort_order: s,
          },
          sort_order: s++,
        });
      }
    }
  }

  // --- Build option pools ---
  const canLetters = letters.length >= 3;
  const canWords = words.length >= 3;
  const charPool = letters.map((l) => ({
    hy: `${l.item_data.letter_upper} ${l.item_data.letter_lower}`,
    en: l.item_data.transliteration as string,
  }));
  const armPool = words.map((w) => ({ hy: w.item_data.target_lang as string, en: "" }));
  const engPool = words.map((w) => ({ hy: w.item_data.english as string, en: w.item_data.english as string }));

  // Shuffle for variety
  const sL = shuffle(letters.map((_, i) => i));
  const sW = shuffle(words.map((_, i) => i));
  let li = 0, wi = 0;

  // --- Exercise counts ---
  // Review: 2 recognition + 2 recall + 1 matching + 1 fill-blank = 6
  // Quiz:   3 recognition + 3 recall + 1 reverse + 1 matching + 1 fill-blank = 9
  const recogCount = isQuiz ? 3 : 2;
  const recallCount = isQuiz ? 3 : 2;

  // --- Recognition exercises ---
  for (let done = 0; done < recogCount; done++) {
    if (canWords && wi < sW.length) {
      const idx = sW[wi++];
      const d = words[idx].item_data;
      results.push({
        exercise_type: "multiple_choice",
        exercise_data: {
          type: "multiple_choice", id: String(s),
          emoji: d.emoji as string, question_hy: "", question_en: "What is this?",
          options: make3Options(armPool[idx], pickWrong(armPool, idx)),
          hint_hy: "", hint_en: h("Choose the Armenian word for this picture"),
          explanation_hy: d.target_lang as string,
          explanation_en: `${d.emoji} ${armFeedback(d.target_lang as string, d.english as string)}`,
          showCorrectAnswer: showCorrect, sort_order: s,
        },
        sort_order: s++,
      });
    } else if (canLetters && li < sL.length) {
      const idx = sL[li++];
      const d = letters[idx].item_data;
      results.push({
        exercise_type: "multiple_choice",
        exercise_data: {
          type: "multiple_choice", id: String(s), emoji: "",
          question_hy: d.letter_name as string, question_en: "Which letter is this?",
          options: make3Options(charPool[idx], pickWrong(charPool, idx)),
          hint_hy: "", hint_en: h(`${d.letter_name} (${d.transliteration}) — sounds like "${d.sound}"`),
          explanation_hy: `${d.letter_upper} ${d.letter_lower} - ${d.letter_name}`,
          explanation_en: `${d.letter_upper} ${d.letter_lower} is ${d.letter_name} (${d.transliteration})`,
          showCorrectAnswer: showCorrect, sort_order: s,
        },
        sort_order: s++,
      });
    }
  }

  // --- Recall exercises ---
  for (let done = 0; done < recallCount; done++) {
    if (canWords && wi < sW.length) {
      const idx = sW[wi++];
      const d = words[idx].item_data;
      results.push({
        exercise_type: "multiple_choice",
        exercise_data: {
          type: "multiple_choice", id: String(s), emoji: "",
          question_hy: d.target_lang as string, question_en: "What does this word mean?",
          options: make3Options(engPool[idx], pickWrong(engPool, idx)),
          hint_hy: "", hint_en: h(`Think about: ${d.english}`),
          explanation_hy: `${d.target_lang} = ${d.english}`,
          explanation_en: armFeedback(d.target_lang as string, d.english as string),
          showCorrectAnswer: showCorrect, sort_order: s,
        },
        sort_order: s++,
      });
    } else if (canLetters && li < sL.length) {
      const idx = sL[li++];
      const d = letters[idx].item_data;
      results.push({
        exercise_type: "multiple_choice",
        exercise_data: {
          type: "multiple_choice", id: String(s), emoji: "",
          question_hy: `"${d.sound}"`, question_en: "Which letter makes this sound?",
          options: make3Options(charPool[idx], pickWrong(charPool, idx)),
          hint_hy: "", hint_en: h(`Think about the letter ${d.letter_name}`),
          explanation_hy: `${d.letter_upper} - ${d.letter_name}`,
          explanation_en: `${d.letter_name} (${d.letter_upper}) sounds like "${d.sound}"`,
          showCorrectAnswer: showCorrect, sort_order: s,
        },
        sort_order: s++,
      });
    }
  }

  // --- Reverse Recall (quiz only) ---
  if (isQuiz) {
    if (canWords && wi < sW.length) {
      const idx = sW[wi++];
      const d = words[idx].item_data;
      results.push({
        exercise_type: "multiple_choice",
        exercise_data: {
          type: "multiple_choice", id: String(s),
          emoji: d.emoji as string,
          question_hy: d.english as string, question_en: "How do you say this in Armenian?",
          options: make3Options(armPool[idx], pickWrong(armPool, idx)),
          hint_hy: "", hint_en: "",
          explanation_hy: d.target_lang as string,
          explanation_en: armFeedback(d.target_lang as string, d.english as string),
          showCorrectAnswer: false, sort_order: s,
        },
        sort_order: s++,
      });
    } else if (canLetters && li < sL.length) {
      // Word association as reverse for letter-only units
      const idx = sL[li++];
      const d = letters[idx].item_data;
      const arm = d.example_word_target as string;
      results.push({
        exercise_type: "multiple_choice",
        exercise_data: {
          type: "multiple_choice", id: String(s),
          emoji: d.emoji as string,
          question_hy: arm, question_en: `Which letter does ${arm} (${transliterate(arm)}) start with?`,
          options: make3Options(charPool[idx], pickWrong(charPool, idx)),
          hint_hy: "", hint_en: "",
          explanation_hy: `${arm} - ${d.letter_upper}`,
          explanation_en: `${arm} (${transliterate(arm)}) starts with ${d.letter_name} (${d.letter_upper})`,
          showCorrectAnswer: false, sort_order: s,
        },
        sort_order: s++,
      });
    }
  }

  // --- Matching (1 exercise, 3 pairs) ---
  const allItems = shuffle([...items]);
  const matchItems = allItems.slice(0, 3);
  if (matchItems.length >= 2) {
    emitMatching(
      matchItems.map((item) => {
        const d = item.item_data;
        const isLetter = item.item_type === "letter";
        return {
          left_hy: isLetter ? `${d.letter_upper} ${d.letter_lower}` : d.target_lang as string,
          left_en: isLetter ? d.transliteration as string : transliterate(d.target_lang as string),
          right_hy: isLetter ? d.letter_name as string : d.english as string,
          right_en: isLetter ? d.transliteration as string : d.english as string,
        };
      }),
      results, s,
    );
    s++;
  }

  // --- Fill-in-blank ---
  const fbCount = isQuiz ? 1 : 1;
  const fbItems = shuffle([...items]).slice(0, fbCount);
  for (const item of fbItems) {
    const d = item.item_data;
    const isLetter = item.item_type === "letter";
    const others = items.filter((x) => x.id !== item.id && x.item_type === item.item_type);

    if (isLetter) {
      results.push({
        exercise_type: "fill_blank",
        exercise_data: {
          type: "fill_blank", id: String(s), emoji: "",
          sentence_hy: `___ - "${d.sound}"`,
          sentence_en: `The letter ___ sounds like "${d.sound}"`,
          answer_hy: `${d.letter_upper}`, answer_en: d.transliteration as string,
          distractors_hy: others.slice(0, 2).map((o) => `${o.item_data.letter_upper}`),
          distractors_en: others.slice(0, 2).map((o) => o.item_data.transliteration as string),
          hint_hy: "", hint_en: h(`This letter is ${d.letter_name} (${d.transliteration})`),
          explanation_hy: `${d.letter_name} - ${d.letter_upper} ${d.letter_lower}`,
          explanation_en: `${d.letter_name} (${d.letter_upper} ${d.letter_lower}) sounds like "${d.sound}"`,
          sort_order: s,
        },
        sort_order: s++,
      });
    } else {
      results.push({
        exercise_type: "fill_blank",
        exercise_data: {
          type: "fill_blank", id: String(s),
          emoji: d.emoji as string,
          sentence_hy: `___ ${d.emoji}`, sentence_en: `___ means ${d.english}`,
          answer_hy: d.target_lang as string, answer_en: d.english as string,
          distractors_hy: others.slice(0, 2).map((o) => o.item_data.target_lang as string),
          distractors_en: others.slice(0, 2).map((o) => o.item_data.english as string),
          hint_hy: "", hint_en: h(armFeedback(d.target_lang as string, d.english as string)),
          explanation_hy: `${d.target_lang} = ${d.english}`,
          explanation_en: armFeedback(d.target_lang as string, d.english as string),
          sort_order: s,
        },
        sort_order: s++,
      });
    }
  }

  // Quiz: ensure EVERY exercise has showCorrectAnswer: false
  if (isQuiz) {
    for (const ex of results) {
      if (ex.exercise_type !== "learn_card") {
        ex.exercise_data = { ...ex.exercise_data, showCorrectAnswer: false };
      }
    }
  }

  return results;
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function generateLessonContent(
  templateType: string,
  contentItems: ContentItem[],
): GeneratedExercise[] {
  switch (templateType) {
    case "alphabet":
      return generateAlphabet(contentItems);
    case "vocabulary":
      return generateVocabulary(contentItems);
    case "review":
      return generateReview(contentItems, false);
    case "quiz":
      return generateReview(contentItems, true);
    default:
      return generateVocabulary(contentItems);
  }
}
