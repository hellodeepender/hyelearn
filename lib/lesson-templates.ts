// Template engine: generates learn cards + exercises from raw content items
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick N random items from pool, excluding index correctIdx */
function pickWrong<T>(pool: T[], correctIdx: number, count: number = 2): T[] {
  return shuffle(pool.filter((_, i) => i !== correctIdx)).slice(0, count);
}

/** Build a shuffled 3-option array: 1 correct + 2 wrong */
function make3Options(correct: { hy: string; en: string }, wrongs: { hy: string; en: string }[]) {
  const all = [{ ...correct, correct: true }, ...wrongs.slice(0, 2).map((w) => ({ ...w, correct: false }))];
  return shuffle(all).map((o, j) => ({ id: ["a", "b", "c"][j], text_hy: o.hy, text_en: o.en, correct: o.correct }));
}

/** Emit matching exercises in groups of max 3 pairs */
function emitMatchingGroups(
  items: { left_hy: string; left_en: string; right_hy: string; right_en: string }[],
  results: GeneratedExercise[],
  sort: { val: number }
) {
  const shuffled = shuffle([...items]);
  for (let g = 0; g < shuffled.length; g += 3) {
    const group = shuffled.slice(g, g + 3);
    if (group.length < 2) break;
    for (const item of group) {
      results.push({
        exercise_type: "matching",
        exercise_data: { type: "matching", id: `m${sort.val}`, ...item, sort_order: sort.val },
        sort_order: sort.val,
      });
    }
    sort.val++;
  }
}

// --- ALPHABET TEMPLATE ---

function generateAlphabet(items: ContentItem[]): GeneratedExercise[] {
  const letters = items.filter((i) => i.item_type === "letter").sort((a, b) => a.sort_order - b.sort_order);
  if (letters.length < 2) return [];

  const results: GeneratedExercise[] = [];
  const sort = { val: 1 };

  // Learn cards
  for (const l of letters) {
    const d = l.item_data;
    results.push({
      exercise_type: "learn_card",
      exercise_data: {
        type: "learn_card",
        letter: `${d.letter_upper} ${d.letter_lower}`,
        letter_name: d.letter_name as string,
        transliteration: d.transliteration as string,
        sound: d.sound as string,
        example_word: d.example_word_arm as string,
        example_translation: d.example_word_eng as string,
        emoji: d.emoji as string,
        sort_order: sort.val,
      },
      sort_order: sort.val++,
    });
  }

  const names = letters.map((l) => ({ hy: l.item_data.letter_name as string, en: l.item_data.transliteration as string }));
  const letts = letters.map((l) => ({ hy: `${l.item_data.letter_upper}`, en: l.item_data.transliteration as string }));

  // Recognition: 3 options each
  for (let i = 0; i < letters.length; i++) {
    const d = letters[i].item_data;
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(sort.val), emoji: "",
        question_hy: `${d.letter_upper} ${d.letter_lower}`,
        question_en: "What is the name of this letter?",
        options: make3Options(names[i], pickWrong(names, i)),
        hint_hy: "", hint_en: `This letter sounds like "${d.sound}"`,
        explanation_hy: `${d.letter_upper} ${d.letter_lower} - ${d.letter_name}`,
        explanation_en: `This letter is called ${d.transliteration} and sounds like "${d.sound}"`,
        sort_order: sort.val,
      },
      sort_order: sort.val++,
    });
  }

  // Sound matching: 3 options each
  for (let i = 0; i < Math.min(2, letters.length); i++) {
    const d = letters[i].item_data;
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(sort.val), emoji: "",
        question_hy: `"${d.sound}"`,
        question_en: `Which letter makes the sound "${d.sound}"?`,
        options: make3Options(letts[i], pickWrong(letts, i)),
        hint_hy: "", hint_en: `Think about the letter called ${d.transliteration}`,
        explanation_hy: `${d.letter_upper} - ${d.letter_name}`,
        explanation_en: `The letter ${d.transliteration} (${d.letter_upper}) makes the sound "${d.sound}"`,
        sort_order: sort.val,
      },
      sort_order: sort.val++,
    });
  }

  // Word association: 3 options
  const wl = letters[0].item_data;
  results.push({
    exercise_type: "multiple_choice",
    exercise_data: {
      type: "multiple_choice", id: String(sort.val),
      emoji: wl.emoji as string,
      question_hy: wl.example_word_arm as string,
      question_en: `Which letter does ${wl.example_word_arm} (${transliterate(wl.example_word_arm as string)}) start with?`,
      options: make3Options(letts[0], pickWrong(letts, 0)),
      hint_hy: "", hint_en: `${wl.example_word_arm} (${transliterate(wl.example_word_arm as string)}) starts with ${wl.transliteration}`,
      explanation_hy: `${wl.example_word_arm} - ${wl.letter_upper}`,
      explanation_en: `${wl.example_word_arm} (${transliterate(wl.example_word_arm as string)}) starts with ${wl.transliteration} (${wl.letter_upper})`,
      sort_order: sort.val,
    },
    sort_order: sort.val++,
  });

  // Matching: groups of 3
  emitMatchingGroups(
    letters.map((l) => ({
      left_hy: `${l.item_data.letter_upper} ${l.item_data.letter_lower}`,
      left_en: l.item_data.transliteration as string,
      right_hy: l.item_data.letter_name as string,
      right_en: l.item_data.transliteration as string,
    })),
    results, sort
  );

  // Fill blank
  const fb = letters[0].item_data;
  results.push({
    exercise_type: "fill_blank",
    exercise_data: {
      type: "fill_blank", id: String(sort.val), emoji: "",
      sentence_hy: `___ - "${fb.sound}"`,
      sentence_en: `The letter ___ sounds like "${fb.sound}"`,
      answer_hy: `${fb.letter_upper}`, answer_en: fb.transliteration as string,
      distractors_hy: letters.slice(1, 3).map((l) => `${l.item_data.letter_upper}`),
      distractors_en: letters.slice(1, 3).map((l) => l.item_data.transliteration as string),
      hint_hy: "", hint_en: `This letter is called ${fb.transliteration}`,
      explanation_hy: `${fb.letter_upper} - ${fb.letter_name}`,
      explanation_en: `${fb.transliteration} (${fb.letter_upper}) sounds like "${fb.sound}"`,
      sort_order: sort.val,
    },
    sort_order: sort.val,
  });

  return results;
}

// --- VOCABULARY TEMPLATE ---

function generateVocabulary(items: ContentItem[]): GeneratedExercise[] {
  const words = items.filter((i) => i.item_type === "word").sort((a, b) => a.sort_order - b.sort_order);
  if (words.length < 2) return [];

  const results: GeneratedExercise[] = [];
  const sort = { val: 1 };
  const armWords = words.map((w) => ({ hy: w.item_data.armenian as string, en: w.item_data.english as string }));

  // Learn cards
  for (const w of words) {
    const d = w.item_data;
    results.push({
      exercise_type: "learn_card",
      exercise_data: {
        type: "learn_card", visual: d.emoji as string,
        primary_text: d.armenian as string, secondary_text: d.english as string,
        sort_order: sort.val,
      },
      sort_order: sort.val++,
    });
  }

  // Recognition: 3 options each
  for (let i = 0; i < words.length; i++) {
    const d = words[i].item_data;
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(sort.val),
        emoji: d.emoji as string,
        question_hy: d.armenian as string, question_en: "What is this?",
        options: make3Options(armWords[i], pickWrong(armWords, i)),
        hint_hy: "", hint_en: `This is: ${d.english}`,
        explanation_hy: d.armenian as string, explanation_en: `This is ${d.english}`,
        sort_order: sort.val,
      },
      sort_order: sort.val++,
    });
  }

  // Recall: 3 options each
  for (let i = 0; i < Math.min(3, words.length); i++) {
    const d = words[i].item_data;
    const enWords = armWords.map((w) => ({ hy: w.en, en: w.en }));
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(sort.val), emoji: "",
        question_hy: d.armenian as string, question_en: "What does this word mean?",
        options: make3Options(enWords[i], pickWrong(enWords, i)),
        hint_hy: "", hint_en: `Think about: ${d.english}`,
        explanation_hy: `${d.armenian} = ${d.english}`,
        explanation_en: `${d.armenian} means "${d.english}"`,
        sort_order: sort.val,
      },
      sort_order: sort.val++,
    });
  }

  // Matching: groups of 3
  emitMatchingGroups(
    words.map((w) => ({
      left_hy: w.item_data.armenian as string, left_en: w.item_data.english as string,
      right_hy: w.item_data.english as string, right_en: w.item_data.english as string,
    })),
    results, sort
  );

  // Fill blank
  if (words.length >= 2) {
    const fb = words[0].item_data;
    results.push({
      exercise_type: "fill_blank",
      exercise_data: {
        type: "fill_blank", id: String(sort.val),
        emoji: fb.emoji as string,
        sentence_hy: `___ ${fb.emoji}`, sentence_en: `The word for ${fb.english} is ___`,
        answer_hy: fb.armenian as string, answer_en: fb.english as string,
        distractors_hy: words.slice(1, 3).map((w) => w.item_data.armenian as string),
        distractors_en: words.slice(1, 3).map((w) => w.item_data.english as string),
        hint_hy: "", hint_en: `This is a ${fb.english}`,
        explanation_hy: `${fb.armenian} = ${fb.english}`, explanation_en: `The answer is ${fb.english}`,
        sort_order: sort.val,
      },
      sort_order: sort.val,
    });
  }

  return results;
}

// --- REVIEW TEMPLATE: learn cards + exercises ---
// --- QUIZ TEMPLATE: exercises only, no feedback on wrong answers ---

function generateReview(items: ContentItem[], isQuiz: boolean): GeneratedExercise[] {
  const letters = items.filter((i) => i.item_type === "letter");
  const words = items.filter((i) => i.item_type === "word");
  const allItems = shuffle([...letters, ...words]);
  const results: GeneratedExercise[] = [];
  let sortVal = 1;
  const h = (text: string) => isQuiz ? "" : text;
  const showCorrect = !isQuiz;

  // Review: generate learn card refreshers first
  if (!isQuiz) {
    for (const item of items) {
      const d = item.item_data;
      if (item.item_type === "letter") {
        results.push({
          exercise_type: "learn_card",
          exercise_data: {
            type: "learn_card",
            letter: `${d.letter_upper} ${d.letter_lower}`,
            letter_name: d.letter_name as string,
            transliteration: d.transliteration as string,
            sound: d.sound as string,
            example_word: d.example_word_arm as string,
            example_translation: d.example_word_eng as string,
            emoji: d.emoji as string,
            sort_order: sortVal,
          },
          sort_order: sortVal++,
        });
      } else {
        results.push({
          exercise_type: "learn_card",
          exercise_data: {
            type: "learn_card", visual: d.emoji as string,
            primary_text: d.armenian as string, secondary_text: d.english as string,
            sort_order: sortVal,
          },
          sort_order: sortVal++,
        });
      }
    }
  }

  // Build pools
  const letterPool = letters.map((l) => ({ hy: l.item_data.letter_name as string, en: l.item_data.transliteration as string }));
  const letterChars = letters.map((l) => ({ hy: `${l.item_data.letter_upper}`, en: l.item_data.transliteration as string }));
  const wordPool = words.map((w) => ({ hy: w.item_data.armenian as string, en: w.item_data.english as string }));

  // Review: 4 MC + 1 fill + 1 matching = 6 exercises
  // Quiz:   6 MC + 2 fill + 1 matching = 9 exercises
  const mcMax = isQuiz ? 6 : 4;
  let mcCount = 0;

  // Recognition (letters)
  for (let i = 0; i < Math.min(3, letters.length) && mcCount < mcMax; i++) {
    const d = letters[i].item_data;
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(sortVal), emoji: "",
        question_hy: `${d.letter_upper} ${d.letter_lower}`, question_en: "What is the name of this letter?",
        options: make3Options(letterPool[i], pickWrong(letterPool, i)),
        hint_hy: "", hint_en: h(`Sounds like "${d.sound}"`),
        explanation_hy: `${d.letter_upper} - ${d.letter_name}`, explanation_en: `This is ${d.transliteration}`,
        showCorrectAnswer: showCorrect, sort_order: sortVal,
      },
      sort_order: sortVal++,
    });
    mcCount++;
  }

  // Sound matching (letters)
  for (let i = 0; i < letters.length && mcCount < mcMax; i++) {
    const d = letters[i].item_data;
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(sortVal), emoji: "",
        question_hy: `"${d.sound}"`, question_en: `Which letter makes the sound "${d.sound}"?`,
        options: make3Options(letterChars[i], pickWrong(letterChars, i)),
        hint_hy: "", hint_en: h(`Think about ${d.transliteration}`),
        explanation_hy: `${d.letter_upper} - ${d.letter_name}`, explanation_en: `${d.transliteration} makes "${d.sound}"`,
        showCorrectAnswer: showCorrect, sort_order: sortVal,
      },
      sort_order: sortVal++,
    });
    mcCount++;
  }

  // Word recognition
  for (let i = 0; i < words.length && mcCount < mcMax; i++) {
    const d = words[i].item_data;
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(sortVal),
        emoji: d.emoji as string, question_hy: d.armenian as string, question_en: "What is this?",
        options: make3Options(wordPool[i], pickWrong(wordPool, i)),
        hint_hy: "", hint_en: h(`This is ${d.english}`),
        explanation_hy: d.armenian as string, explanation_en: `This is ${d.english}`,
        showCorrectAnswer: showCorrect, sort_order: sortVal,
      },
      sort_order: sortVal++,
    });
    mcCount++;
  }

  // --- 1 Matching exercise (pick 3 random items) ---
  const matchPool = shuffle(allItems).slice(0, 3);
  if (matchPool.length >= 2) {
    for (const item of matchPool) {
      const d = item.item_data;
      const isLetter = item.item_type === "letter";
      results.push({
        exercise_type: "matching",
        exercise_data: {
          type: "matching", id: `m${sortVal}`,
          left_hy: isLetter ? `${d.letter_upper} ${d.letter_lower}` : d.armenian as string,
          left_en: isLetter ? d.transliteration as string : d.english as string,
          right_hy: isLetter ? d.letter_name as string : d.english as string,
          right_en: isLetter ? d.transliteration as string : d.english as string,
          sort_order: sortVal,
        },
        sort_order: sortVal,
      });
    }
    sortVal++;
  }

  // Fill blank: review 1, quiz 2
  const fbCount = isQuiz ? 2 : 1;
  const fbItems = shuffle(allItems).slice(0, fbCount);
  for (const item of fbItems) {
    const d = item.item_data;
    const isLetter = item.item_type === "letter";
    const answer_hy = isLetter ? `${d.letter_upper}` : d.armenian as string;
    const answer_en = isLetter ? d.transliteration as string : d.english as string;
    const others = allItems.filter((x) => x.id !== item.id);
    results.push({
      exercise_type: "fill_blank",
      exercise_data: {
        type: "fill_blank", id: String(sortVal),
        emoji: (isLetter ? "" : d.emoji) as string,
        sentence_hy: isLetter ? `___ - "${d.sound}"` : `___ ${d.emoji}`,
        sentence_en: isLetter ? `The letter ___ sounds like "${d.sound}"` : `The word for ${d.english} is ___`,
        answer_hy, answer_en,
        distractors_hy: others.slice(0, 2).map((o) => o.item_type === "letter" ? `${o.item_data.letter_upper}` : o.item_data.armenian as string),
        distractors_en: others.slice(0, 2).map((o) => o.item_type === "letter" ? o.item_data.transliteration as string : o.item_data.english as string),
        hint_hy: "", hint_en: h(isLetter ? `Called ${d.transliteration}` : `This is ${d.english}`),
        explanation_hy: isLetter ? `${d.letter_upper} - ${d.letter_name}` : `${d.armenian} = ${d.english}`,
        explanation_en: isLetter ? `${d.transliteration} sounds like "${d.sound}"` : `The answer is ${d.english}`,
        sort_order: sortVal,
      },
      sort_order: sortVal++,
    });
  }

  // For quiz: ensure EVERY exercise has showCorrectAnswer: false
  if (isQuiz) {
    for (const ex of results) {
      if (ex.exercise_type !== "learn_card") {
        ex.exercise_data = { ...ex.exercise_data, showCorrectAnswer: false };
      }
    }
  }

  return results;
}

// --- MAIN EXPORT ---

export function generateLessonContent(
  templateType: string,
  contentItems: ContentItem[]
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
