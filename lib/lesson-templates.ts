// Template engine: generates learn cards + exercises from raw content items

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

function mcOptions(items: { hy: string; en: string }[], correctIdx: number) {
  const ids = ["a", "b", "c", "d"];
  return items.slice(0, Math.min(items.length, 4)).map((item, i) => ({
    id: ids[i], text_hy: item.hy, text_en: item.en, correct: i === correctIdx,
  }));
}

// --- ALPHABET TEMPLATE ---

function generateAlphabet(items: ContentItem[]): GeneratedExercise[] {
  const letters = items.filter((i) => i.item_type === "letter").sort((a, b) => a.sort_order - b.sort_order);
  if (letters.length < 2) return [];

  const results: GeneratedExercise[] = [];
  let sort = 1;

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
        sort_order: sort,
      },
      sort_order: sort++,
    });
  }

  const names = letters.map((l) => ({ hy: l.item_data.letter_name as string, en: l.item_data.transliteration as string }));
  const letts = letters.map((l) => ({ hy: `${l.item_data.letter_upper}`, en: l.item_data.transliteration as string }));

  // Recognition: show letter, pick name
  for (let i = 0; i < letters.length; i++) {
    const d = letters[i].item_data;
    const opts = shuffle(names.map((n, j) => ({ ...n, correct: j === i })));
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(sort),
        emoji: "",
        question_hy: `${d.letter_upper} ${d.letter_lower}`,
        question_en: "What is the name of this letter?",
        options: opts.map((o, j) => ({ id: ["a", "b", "c"][j], text_hy: o.hy, text_en: o.en, correct: o.correct })),
        hint_hy: "", hint_en: `This letter sounds like "${d.sound}"`,
        explanation_hy: `${d.letter_upper} ${d.letter_lower} - ${d.letter_name}`,
        explanation_en: `This letter is called ${d.transliteration} and sounds like "${d.sound}"`,
        sort_order: sort,
      },
      sort_order: sort++,
    });
  }

  // Sound matching: which letter makes this sound?
  for (let i = 0; i < Math.min(2, letters.length); i++) {
    const d = letters[i].item_data;
    const opts = shuffle(letts.map((l, j) => ({ ...l, correct: j === i })));
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(sort),
        emoji: "",
        question_hy: `"${d.sound}"`,
        question_en: `Which letter makes the sound "${d.sound}"?`,
        options: opts.map((o, j) => ({ id: ["a", "b", "c"][j], text_hy: o.hy, text_en: o.en, correct: o.correct })),
        hint_hy: "", hint_en: `Think about the letter called ${d.transliteration}`,
        explanation_hy: `${d.letter_upper} - ${d.letter_name}`,
        explanation_en: `The letter ${d.transliteration} (${d.letter_upper}) makes the sound "${d.sound}"`,
        sort_order: sort,
      },
      sort_order: sort++,
    });
  }

  // Word association: which letter does this word start with?
  const wordLetter = letters[0].item_data;
  const wordOpts = shuffle(letts.map((l, j) => ({ ...l, correct: j === 0 })));
  results.push({
    exercise_type: "multiple_choice",
    exercise_data: {
      type: "multiple_choice", id: String(sort),
      emoji: wordLetter.emoji as string,
      question_hy: wordLetter.example_word_arm as string,
      question_en: `Which letter does "${wordLetter.example_word_eng}" start with?`,
      options: wordOpts.map((o, j) => ({ id: ["a", "b", "c"][j], text_hy: o.hy, text_en: o.en, correct: o.correct })),
      hint_hy: "", hint_en: `${wordLetter.example_word_eng} starts with the letter ${wordLetter.transliteration}`,
      explanation_hy: `${wordLetter.example_word_arm} - ${wordLetter.letter_upper}`,
      explanation_en: `"${wordLetter.example_word_eng}" starts with ${wordLetter.transliteration} (${wordLetter.letter_upper})`,
      sort_order: sort,
    },
    sort_order: sort++,
  });

  // Matching: all letters to names
  for (const l of letters) {
    const d = l.item_data;
    results.push({
      exercise_type: "matching",
      exercise_data: {
        type: "matching",
        id: `m${sort}`,
        left_hy: `${d.letter_upper} ${d.letter_lower}`,
        left_en: d.transliteration as string,
        right_hy: d.letter_name as string,
        right_en: d.transliteration as string,
        sort_order: sort,
      },
      sort_order: sort,
    });
  }
  sort++;

  // Fill blank: the letter ___ sounds like X
  const fbLetter = letters[0].item_data;
  results.push({
    exercise_type: "fill_blank",
    exercise_data: {
      type: "fill_blank", id: String(sort),
      emoji: "",
      sentence_hy: `___ - "${fbLetter.sound}"`,
      sentence_en: `The letter ___ sounds like "${fbLetter.sound}"`,
      answer_hy: `${fbLetter.letter_upper}`,
      answer_en: fbLetter.transliteration as string,
      distractors_hy: letters.slice(1).map((l) => `${l.item_data.letter_upper}`),
      distractors_en: letters.slice(1).map((l) => l.item_data.transliteration as string),
      hint_hy: "", hint_en: `This letter is called ${fbLetter.transliteration}`,
      explanation_hy: `${fbLetter.letter_upper} - ${fbLetter.letter_name}`,
      explanation_en: `${fbLetter.transliteration} (${fbLetter.letter_upper}) sounds like "${fbLetter.sound}"`,
      sort_order: sort,
    },
    sort_order: sort,
  });

  return results;
}

// --- VOCABULARY TEMPLATE ---

function generateVocabulary(items: ContentItem[]): GeneratedExercise[] {
  const words = items.filter((i) => i.item_type === "word").sort((a, b) => a.sort_order - b.sort_order);
  if (words.length < 2) return [];

  const results: GeneratedExercise[] = [];
  let sort = 1;

  // Learn cards
  for (const w of words) {
    const d = w.item_data;
    results.push({
      exercise_type: "learn_card",
      exercise_data: {
        type: "learn_card",
        visual: d.emoji as string,
        primary_text: d.armenian as string,
        secondary_text: d.english as string,
        sort_order: sort,
      },
      sort_order: sort++,
    });
  }

  const armWords = words.map((w) => ({ hy: w.item_data.armenian as string, en: w.item_data.english as string }));

  // Recognition: show emoji, what is this?
  for (let i = 0; i < words.length; i++) {
    const d = words[i].item_data;
    const opts = shuffle(armWords.map((w, j) => ({ ...w, correct: j === i })));
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(sort),
        emoji: d.emoji as string,
        question_hy: d.armenian as string,
        question_en: "What is this?",
        options: opts.map((o, j) => ({ id: ["a", "b", "c", "d"][j], text_hy: o.hy, text_en: o.en, correct: o.correct })),
        hint_hy: "", hint_en: `This is: ${d.english}`,
        explanation_hy: d.armenian as string,
        explanation_en: `This is ${d.english}`,
        sort_order: sort,
      },
      sort_order: sort++,
    });
  }

  // Recall: show Armenian word, what does it mean?
  for (let i = 0; i < Math.min(3, words.length); i++) {
    const d = words[i].item_data;
    const opts = shuffle(armWords.map((w, j) => ({ hy: w.en, en: w.en, correct: j === i })));
    results.push({
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(sort),
        emoji: "",
        question_hy: d.armenian as string,
        question_en: "What does this word mean?",
        options: opts.map((o, j) => ({ id: ["a", "b", "c", "d"][j], text_hy: o.hy, text_en: o.en, correct: o.correct })),
        hint_hy: "", hint_en: `Think about: ${d.english}`,
        explanation_hy: `${d.armenian} = ${d.english}`,
        explanation_en: `${d.armenian} means "${d.english}"`,
        sort_order: sort,
      },
      sort_order: sort++,
    });
  }

  // Matching
  for (const w of words) {
    const d = w.item_data;
    results.push({
      exercise_type: "matching",
      exercise_data: {
        type: "matching", id: `m${sort}`,
        left_hy: d.armenian as string, left_en: d.english as string,
        right_hy: d.english as string, right_en: d.english as string,
        sort_order: sort,
      },
      sort_order: sort,
    });
  }
  sort++;

  // Fill blank
  if (words.length >= 2) {
    const fb = words[0].item_data;
    results.push({
      exercise_type: "fill_blank",
      exercise_data: {
        type: "fill_blank", id: String(sort),
        emoji: fb.emoji as string,
        sentence_hy: `___ ${fb.emoji}`,
        sentence_en: `The word for ${fb.english} is ___`,
        answer_hy: fb.armenian as string, answer_en: fb.english as string,
        distractors_hy: words.slice(1, 3).map((w) => w.item_data.armenian as string),
        distractors_en: words.slice(1, 3).map((w) => w.item_data.english as string),
        hint_hy: "", hint_en: `This is a ${fb.english}`,
        explanation_hy: `${fb.armenian} = ${fb.english}`,
        explanation_en: `The answer is ${fb.english}`,
        sort_order: sort,
      },
      sort_order: sort,
    });
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
    case "quiz":
      // Review/quiz use vocabulary template with all unit content
      return generateVocabulary(contentItems);
    default:
      return generateVocabulary(contentItems);
  }
}
