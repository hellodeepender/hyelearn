// Template engine: generates learn cards + exercises from raw content items
//
// RULES:
// 1. Question and options must NEVER be the same format (no target→target)
// 2. Every exercise has exactly 3 options (1 correct + 2 wrong)
// 3. Feedback format: "[target] ([transliteration]) means [english]"
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

/** Pick N random items from pool, excluding index correctIdx. Adjusts count to available items. */
function pickWrong<T>(pool: T[], correctIdx: number, count = 2): T[] {
  const available = pool.filter((_, i) => i !== correctIdx);
  return shuffle(available).slice(0, Math.min(count, available.length));
}

/** Build a shuffled option array: 1 correct + up to 2 wrong */
function makeOptions(correct: { hy: string; en: string; emoji?: string }, wrongs: { hy: string; en: string; emoji?: string }[]) {
  const ids = ["a", "b", "c"];
  const wrongSlice = wrongs.slice(0, 2);
  const all = [{ ...correct, correct: true }, ...wrongSlice.map((w) => ({ ...w, correct: false }))];
  return shuffle(all).map((o, j) => ({
    id: ids[j] as string,
    text_hy: o.hy,
    text_en: o.en,
    ...(o.emoji ? { emoji: o.emoji } : {}),
    correct: o.correct,
  }));
}

/** Alias for backward compatibility */
const make3Options = makeOptions;

/** Standard feedback: "target (transliteration) means english" */
function armFeedback(arm: string, eng: string, locale: string = "hy"): string {
  return `${arm} (${transliterate(arm, locale)}) means ${eng}`;
}

/** Emit 3 matching pairs as individual rows sharing the same sort_order */
function emitMatching(
  pairs: { left_hy: string; left_en: string; right_hy: string; right_en: string }[],
  results: GeneratedExercise[],
  sortOrder: number,
) {
  const valid = pairs.filter((p) => p.left_hy && p.right_hy);
  valid.slice(0, 3).forEach((p, idx) => {
    results.push({
      exercise_type: "matching",
      exercise_data: { type: "matching", id: `m${sortOrder}-${idx}`, ...p, sort_order: sortOrder },
      sort_order: sortOrder,
    });
  });
}

/** Replace a random word in a phrase with ___ and return [blanked, removed] */
function blankWord(text: string): [string, string] {
  const words = text.split(/\s+/);
  const candidates = words.map((w, i) => ({ w, i })).filter((x) => x.w.length > 2);
  const pick = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : { w: words[words.length - 1], i: words.length - 1 };
  const blanked = words.map((w, i) => i === pick.i ? "___" : w).join(" ");
  return [blanked, pick.w];
}


// =============================================================================
// ALPHABET TEMPLATE (unchanged)
// =============================================================================

function generateAlphabet(items: ContentItem[], locale: string): GeneratedExercise[] {
  const letters = items.filter((i) => i.item_type === "letter").sort((a, b) => a.sort_order - b.sort_order);
  if (letters.length < 2) return [];

  const results: GeneratedExercise[] = [];
  let s = 1;

  for (const l of letters) {
    const d = l.item_data;
    results.push({
      exercise_type: "learn_card",
      exercise_data: {
        type: "learn_card",
        letter: `${d.letter_upper} ${d.letter_lower}`,
        letter_name: d.letter_name as string,
        transliteration: (d.transliteration as string) || transliterate(d.letter_name as string, locale),
        sound: d.sound as string,
        example_word: d.example_word_target as string,
        example_translation: transliterate(d.example_word_target as string, locale),
        emoji: d.emoji as string,
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  const charPool = letters.map((l) => ({
    hy: `${l.item_data.letter_upper} ${l.item_data.letter_lower}`,
    en: l.item_data.transliteration as string,
  }));

  for (let i = 0; i < Math.min(3, letters.length); i++) {
    const d = letters[i].item_data;
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(s), emoji: "",
        question_hy: d.letter_name as string, question_en: "Which letter is this?",
        options: make3Options(charPool[i], pickWrong(charPool, i)),
        hint_hy: "", hint_en: `${d.letter_name} (${d.transliteration}) — sounds like "${d.sound}"`,
        explanation_hy: `${d.letter_upper} ${d.letter_lower} - ${d.letter_name}`,
        explanation_en: `${d.letter_upper} ${d.letter_lower} is ${d.letter_name} (${d.transliteration})`,
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  for (let i = 0; i < Math.min(2, letters.length); i++) {
    const d = letters[i].item_data;
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(s), emoji: "",
        question_hy: `"${d.sound}"`, question_en: "Which letter makes this sound?",
        options: make3Options(charPool[i], pickWrong(charPool, i)),
        hint_hy: "", hint_en: `Think about the letter ${d.letter_name}`,
        explanation_hy: `${d.letter_upper} - ${d.letter_name}`,
        explanation_en: `${d.letter_name} (${d.letter_upper}) sounds like "${d.sound}"`,
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  const wl = letters[0].item_data;
  const wlArm = wl.example_word_target as string;
  results.push({
    exercise_type: "multiple_choice",
    exercise_data: {
      type: "multiple_choice", id: String(s),
      emoji: wl.emoji as string,
      question_hy: wlArm, question_en: `Which letter does ${wlArm} (${transliterate(wlArm, locale)}) start with?`,
      options: make3Options(charPool[0], pickWrong(charPool, 0)),
      hint_hy: "", hint_en: `${wlArm} (${transliterate(wlArm, locale)}) starts with ${wl.transliteration}`,
      explanation_hy: `${wlArm} - ${wl.letter_upper}`,
      explanation_en: `${wlArm} (${transliterate(wlArm, locale)}) starts with ${wl.letter_name} (${wl.letter_upper})`,
      sort_order: s,
    },
    sort_order: s++,
  });

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

  const fb = letters[0].item_data;
  results.push({
    exercise_type: "fill_blank",
    exercise_data: {
      type: "fill_blank", id: String(s), emoji: "",
      sentence_hy: `___ - "${fb.sound}"`, sentence_en: `The letter ___ sounds like "${fb.sound}"`,
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
// VOCABULARY TEMPLATE (extended with phrases, passages, grammar, etc.)
// =============================================================================

function generateVocabulary(items: ContentItem[], locale: string): GeneratedExercise[] {
  const words = items.filter((i) => i.item_type === "word").sort((a, b) => a.sort_order - b.sort_order);
  const phrases = items.filter((i) => i.item_type === "phrase").sort((a, b) => a.sort_order - b.sort_order);
  const readingPassage = items.find((i) => i.item_type === "reading_passage");
  const grammarNote = items.find((i) => i.item_type === "grammar_note");
  const compositionPrompt = items.find((i) => i.item_type === "composition_prompt");
  const discussionQuestions = items.filter((i) => i.item_type === "discussion_question");

  if (words.length < 2 && phrases.length === 0) return [];

  const results: GeneratedExercise[] = [];
  let s = 1;

  // --- Word learn cards ---
  for (const w of words) {
    const d = w.item_data;
    results.push({
      exercise_type: "learn_card",
      exercise_data: {
        type: "learn_card", visual: (d.emoji as string) ?? "",
        primary_text: d.target_lang as string, secondary_text: d.english as string,
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  // --- Word exercises (only if 3+ words for proper 3-option MC) ---
  if (words.length >= 3) {
    const armPool = words.map((w) => ({ hy: w.item_data.target_lang as string, en: "", emoji: w.item_data.emoji as string }));
    const engPool = words.map((w) => ({ hy: w.item_data.english as string, en: w.item_data.english as string, emoji: w.item_data.emoji as string }));

    // Picture Recognition
    for (let i = 0; i < Math.min(3, words.length); i++) {
      const d = words[i].item_data;
      results.push({
        exercise_type: "multiple_choice",
        exercise_data: {
          type: "multiple_choice", id: String(s),
          emoji: d.emoji as string, question_hy: "", question_en: "What is this?",
          options: make3Options(armPool[i], pickWrong(armPool, i)),
          hint_hy: "", hint_en: "Choose the word for this picture",
          explanation_hy: d.target_lang as string,
          explanation_en: `${d.emoji} ${armFeedback(d.target_lang as string, d.english as string, locale)}`,
          sort_order: s,
        },
        sort_order: s++,
      });
    }

    // Recall
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
          explanation_en: armFeedback(d.target_lang as string, d.english as string, locale),
          sort_order: s,
        },
        sort_order: s++,
      });
    }

    // Reverse Recall
    const ri = Math.min(2, words.length - 1);
    const rd = words[ri].item_data;
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(s),
        emoji: (rd.emoji as string) ?? "",
        question_hy: rd.english as string, question_en: "How do you say this?",
        options: make3Options(armPool[ri], pickWrong(armPool, ri)),
        hint_hy: "", hint_en: armFeedback(rd.target_lang as string, rd.english as string, locale),
        explanation_hy: rd.target_lang as string,
        explanation_en: armFeedback(rd.target_lang as string, rd.english as string, locale),
        sort_order: s,
      },
      sort_order: s++,
    });

    // Matching
    emitMatching(
      words.slice(0, 3).map((w) => ({
        left_hy: w.item_data.target_lang as string,
        left_en: transliterate(w.item_data.target_lang as string, locale),
        right_hy: w.item_data.english as string,
        right_en: w.item_data.english as string,
      })),
      results, s,
    );
    s++;

    // Fill-blank
    const fb = words[0].item_data;
    results.push({
      exercise_type: "fill_blank",
      exercise_data: {
        type: "fill_blank", id: String(s),
        emoji: (fb.emoji as string) ?? "",
        sentence_hy: `___ ${fb.emoji ?? ""}`.trim(), sentence_en: `___ means ${fb.english}`,
        answer_hy: fb.target_lang as string, answer_en: fb.english as string,
        distractors_hy: words.slice(1, 3).map((w) => w.item_data.target_lang as string),
        distractors_en: words.slice(1, 3).map((w) => w.item_data.english as string),
        hint_hy: "", hint_en: armFeedback(fb.target_lang as string, fb.english as string, locale),
        explanation_hy: `${fb.target_lang} = ${fb.english}`,
        explanation_en: armFeedback(fb.target_lang as string, fb.english as string, locale),
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  // --- Phrase learn cards ---
  for (const p of phrases) {
    const d = p.item_data;
    results.push({
      exercise_type: "learn_card",
      exercise_data: {
        type: "learn_card", visual: "",
        primary_text: d.target_lang as string, secondary_text: d.english as string,
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  // Phrase fill-blank exercise
  if (phrases.length >= 2) {
    const phraseText = phrases[0].item_data.target_lang as string;
    const [blanked, removed] = blankWord(phraseText);
    // Collect distractor words from other phrases/words
    const distractorPool = [
      ...phrases.slice(1).flatMap((p) => (p.item_data.target_lang as string).split(/\s+/).filter((w) => w.length > 2)),
      ...words.map((w) => w.item_data.target_lang as string),
    ].filter((w) => w !== removed);
    const distractors = shuffle(distractorPool).slice(0, 2);
    if (distractors.length >= 2) {
      results.push({
        exercise_type: "fill_blank",
        exercise_data: {
          type: "fill_blank", id: String(s), emoji: "",
          sentence_hy: blanked, sentence_en: phrases[0].item_data.english as string,
          answer_hy: removed, answer_en: "",
          distractors_hy: distractors, distractors_en: ["", ""],
          hint_hy: "", hint_en: "Complete the phrase",
          explanation_hy: phraseText, explanation_en: phrases[0].item_data.english as string,
          sort_order: s,
        },
        sort_order: s++,
      });
    }
  }

  // --- Reading passage ---
  if (readingPassage) {
    const d = readingPassage.item_data;
    results.push({
      exercise_type: "learn_card",
      exercise_data: {
        type: "learn_card", card_type: "passage", visual: "",
        primary_text: d.title as string, secondary_text: d.text as string,
        sort_order: s,
      },
      sort_order: s++,
    });

    // Comprehension: find a vocabulary word in the passage
    if (words.length >= 3) {
      const passageText = (d.text as string).toLowerCase();
      const foundWord = words.find((w) => passageText.includes((w.item_data.target_lang as string).toLowerCase()));
      if (foundWord) {
        const foundIdx = words.indexOf(foundWord);
        const armPool = words.map((w) => ({ hy: w.item_data.target_lang as string, en: w.item_data.english as string }));
        results.push({
          exercise_type: "multiple_choice",
          exercise_data: {
            type: "multiple_choice", id: String(s), emoji: "",
            question_hy: "", question_en: "Which vocabulary word appears in the passage?",
            options: make3Options(armPool[foundIdx], pickWrong(armPool, foundIdx)),
            hint_hy: "", hint_en: "Look for a word you learned in this lesson",
            explanation_hy: foundWord.item_data.target_lang as string,
            explanation_en: `"${foundWord.item_data.target_lang}" appears in the passage`,
            sort_order: s,
          },
          sort_order: s++,
        });
      }
    }
  }

  // --- Grammar note ---
  if (grammarNote) {
    const d = grammarNote.item_data;
    results.push({
      exercise_type: "learn_card",
      exercise_data: {
        type: "learn_card", card_type: "grammar", visual: "",
        primary_text: d.topic as string, secondary_text: d.explanation as string,
        examples: Array.isArray(d.examples) ? d.examples : [],
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  // --- Composition prompt ---
  if (compositionPrompt) {
    const d = compositionPrompt.item_data;
    results.push({
      exercise_type: "learn_card",
      exercise_data: {
        type: "learn_card", card_type: "composition", visual: "",
        primary_text: d.prompt as string, secondary_text: d.instructions as string,
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  // --- Discussion questions ---
  for (const q of discussionQuestions) {
    const d = q.item_data;
    results.push({
      exercise_type: "learn_card",
      exercise_data: {
        type: "learn_card", card_type: "discussion", visual: "",
        primary_text: d.question as string, secondary_text: d.question_eng as string,
        sort_order: s,
      },
      sort_order: s++,
    });
  }

  return results;
}

// =============================================================================
// REVIEW TEMPLATE: learn cards + 6 exercises
// QUIZ TEMPLATE: 9 exercises, no learn cards, no feedback
// =============================================================================

function generateReview(items: ContentItem[], isQuiz: boolean, locale: string): GeneratedExercise[] {
  const letters = items.filter((i) => i.item_type === "letter");
  const words = items.filter((i) => i.item_type === "word");
  const phrases = items.filter((i) => i.item_type === "phrase");
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
            transliteration: (d.transliteration as string) || transliterate(d.letter_name as string, locale),
            sound: d.sound as string,
            example_word: d.example_word_target as string,
            example_translation: transliterate(d.example_word_target as string, locale),
            emoji: d.emoji as string,
            sort_order: s,
          },
          sort_order: s++,
        });
      } else if (item.item_type === "word" || item.item_type === "phrase") {
        results.push({
          exercise_type: "learn_card",
          exercise_data: {
            type: "learn_card", visual: (d.emoji as string) ?? "",
            primary_text: d.target_lang as string, secondary_text: d.english as string,
            sort_order: s,
          },
          sort_order: s++,
        });
      } else if (item.item_type === "reading_passage") {
        results.push({
          exercise_type: "learn_card",
          exercise_data: {
            type: "learn_card", card_type: "passage", visual: "",
            primary_text: d.title as string, secondary_text: d.text as string,
            sort_order: s,
          },
          sort_order: s++,
        });
      } else if (item.item_type === "grammar_note") {
        results.push({
          exercise_type: "learn_card",
          exercise_data: {
            type: "learn_card", card_type: "grammar", visual: "",
            primary_text: d.topic as string, secondary_text: d.explanation as string,
            examples: Array.isArray(d.examples) ? d.examples : [],
            sort_order: s,
          },
          sort_order: s++,
        });
      }
    }
  }

  // --- Build option pools ---
  const canLetters = letters.length >= 2;
  const canWords = words.length >= 2;
  const charPool = letters.map((l) => ({
    hy: `${l.item_data.letter_upper} ${l.item_data.letter_lower}`,
    en: l.item_data.transliteration as string,
  }));
  const armPool = words.map((w) => ({ hy: w.item_data.target_lang as string, en: "" }));
  const engPool = words.map((w) => ({ hy: w.item_data.english as string, en: w.item_data.english as string }));

  const sL = shuffle(letters.map((_, i) => i));
  const sW = shuffle(words.map((_, i) => i));
  let li = 0, wi = 0;

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
          hint_hy: "", hint_en: h("Choose the word for this picture"),
          explanation_hy: d.target_lang as string,
          explanation_en: `${d.emoji} ${armFeedback(d.target_lang as string, d.english as string, locale)}`,
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
          explanation_en: armFeedback(d.target_lang as string, d.english as string, locale),
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
          question_hy: d.english as string, question_en: "How do you say this?",
          options: make3Options(armPool[idx], pickWrong(armPool, idx)),
          hint_hy: "", hint_en: "",
          explanation_hy: d.target_lang as string,
          explanation_en: armFeedback(d.target_lang as string, d.english as string, locale),
          showCorrectAnswer: false, sort_order: s,
        },
        sort_order: s++,
      });
    } else if (canLetters && li < sL.length) {
      const idx = sL[li++];
      const d = letters[idx].item_data;
      const arm = d.example_word_target as string;
      results.push({
        exercise_type: "multiple_choice",
        exercise_data: {
          type: "multiple_choice", id: String(s),
          emoji: d.emoji as string,
          question_hy: arm, question_en: `Which letter does ${arm} (${transliterate(arm, locale)}) start with?`,
          options: make3Options(charPool[idx], pickWrong(charPool, idx)),
          hint_hy: "", hint_en: "",
          explanation_hy: `${arm} - ${d.letter_upper}`,
          explanation_en: `${arm} (${transliterate(arm, locale)}) starts with ${d.letter_name} (${d.letter_upper})`,
          showCorrectAnswer: false, sort_order: s,
        },
        sort_order: s++,
      });
    }
  }

  // --- Matching (1 exercise, 3 pairs) ---
  const matchableItems = shuffle([...words, ...phrases].filter((i) => {
    const tl = i.item_data.target_lang as string;
    const en = i.item_data.english as string;
    return tl && tl.trim() !== "" && en && en.trim() !== "";
  }));
  const matchItems = matchableItems.slice(0, 3);
  if (matchItems.length >= 2) {
    emitMatching(
      matchItems.map((item) => {
        const d = item.item_data;
        return {
          left_hy: d.target_lang as string,
          left_en: transliterate(d.target_lang as string, locale),
          right_hy: d.english as string,
          right_en: d.english as string,
        };
      }),
      results, s,
    );
    s++;
  } else if (letters.length >= 2) {
    emitMatching(
      letters.slice(0, 3).map((l) => ({
        left_hy: `${l.item_data.letter_upper} ${l.item_data.letter_lower}`,
        left_en: l.item_data.transliteration as string,
        right_hy: l.item_data.letter_name as string,
        right_en: l.item_data.transliteration as string,
      })),
      results, s,
    );
    s++;
  }

  // --- Fill-in-blank ---
  const fbPool = [...words, ...phrases].filter((i) => i.item_data.target_lang);
  const fbItem = shuffle(fbPool)[0];
  if (fbItem) {
    const d = fbItem.item_data;
    const isPhrase = fbItem.item_type === "phrase";
    const others = fbPool.filter((x) => x.id !== fbItem.id);

    if (isPhrase) {
      const [blanked, removed] = blankWord(d.target_lang as string);
      const distractorWords = shuffle(
        others.flatMap((o) => (o.item_data.target_lang as string).split(/\s+/).filter((w) => w.length > 2 && w !== removed))
      ).slice(0, 2);
      if (distractorWords.length >= 2) {
        results.push({
          exercise_type: "fill_blank",
          exercise_data: {
            type: "fill_blank", id: String(s), emoji: "",
            sentence_hy: blanked, sentence_en: d.english as string,
            answer_hy: removed, answer_en: "",
            distractors_hy: distractorWords, distractors_en: ["", ""],
            hint_hy: "", hint_en: h("Complete the phrase"),
            explanation_hy: d.target_lang as string, explanation_en: d.english as string,
            sort_order: s,
          },
          sort_order: s++,
        });
      }
    } else {
      results.push({
        exercise_type: "fill_blank",
        exercise_data: {
          type: "fill_blank", id: String(s),
          emoji: (d.emoji as string) ?? "",
          sentence_hy: `___ ${d.emoji ?? ""}`.trim(), sentence_en: `___ means ${d.english}`,
          answer_hy: d.target_lang as string, answer_en: d.english as string,
          distractors_hy: others.slice(0, 2).map((o) => o.item_data.target_lang as string),
          distractors_en: others.slice(0, 2).map((o) => o.item_data.english as string),
          hint_hy: "", hint_en: h(armFeedback(d.target_lang as string, d.english as string, locale)),
          explanation_hy: `${d.target_lang} = ${d.english}`,
          explanation_en: armFeedback(d.target_lang as string, d.english as string, locale),
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
  locale: string = "hy",
): GeneratedExercise[] {
  switch (templateType) {
    case "alphabet":
      return generateAlphabet(contentItems, locale);
    case "vocabulary":
      return generateVocabulary(contentItems, locale);
    case "review":
      return generateReview(contentItems, false, locale);
    case "quiz":
      return generateReview(contentItems, true, locale);
    default:
      return generateVocabulary(contentItems, locale);
  }
}
