/**
 * Seed Tagalog Grades 1-5 (75 lessons: 5 grades × 3 units × 5 lessons each)
 * Mirrors the Armenian grade structure exactly.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-tagalog-grades.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Types ──────────────────────────────────────────────────

interface Word { tl: string; en: string; emoji: string }

interface UnitDef {
  slug: string;
  title: string;
  description: string;
  lessons: { slug: string; title: string; description: string; words: Word[] }[];
}

interface GradeDef {
  slug: string;
  title: string;
  description: string;
  gradeValue: string;
  sortOrder: number;
  units: UnitDef[];
}

// ── Helper: build exercises from words ──────────────────────

function buildLearnCards(lessonId: string, words: Word[]) {
  return words.map((w, i) => ({
    lesson_id: lessonId,
    exercise_type: "learn_card",
    exercise_data: {
      type: "learn_card",
      visual: w.emoji,
      primary_text: w.tl,
      secondary_text: w.en,
      sort_order: i + 1,
    },
    sort_order: i + 1,
    status: "approved",
    locale: "tl",
  }));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildVocabExercises(lessonId: string, words: Word[]) {
  const exercises: object[] = [];
  let s = words.length + 1;

  if (words.length < 3) return buildLearnCards(lessonId, words);

  // Learn cards first
  exercises.push(...buildLearnCards(lessonId, words));

  // Multiple choice: "What is this?" (picture recognition)
  for (let i = 0; i < Math.min(3, words.length); i++) {
    const correct = words[i];
    const wrongs = shuffle(words.filter((_, j) => j !== i)).slice(0, 2);
    const options = shuffle([
      { id: "a", text_tl: correct.tl, text_en: correct.en, correct: true },
      ...wrongs.map((w, j) => ({ id: String.fromCharCode(98 + j), text_tl: w.tl, text_en: w.en, correct: false })),
    ]);
    exercises.push({
      lesson_id: lessonId,
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(s), emoji: correct.emoji,
        question_tl: "", question_en: "What is this?",
        options,
        hint_tl: "", hint_en: `This means ${correct.en}`,
        explanation_tl: correct.tl, explanation_en: `${correct.emoji} ${correct.tl} means ${correct.en}`,
        sort_order: s,
      },
      sort_order: s++,
      status: "approved",
      locale: "tl",
    });
  }

  // Multiple choice: "What does this word mean?"
  for (let i = 0; i < Math.min(2, words.length); i++) {
    const correct = words[i];
    const wrongs = shuffle(words.filter((_, j) => j !== i)).slice(0, 2);
    const options = shuffle([
      { id: "a", text_tl: correct.en, text_en: correct.en, correct: true },
      ...wrongs.map((w, j) => ({ id: String.fromCharCode(98 + j), text_tl: w.en, text_en: w.en, correct: false })),
    ]);
    exercises.push({
      lesson_id: lessonId,
      exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(s), emoji: "",
        question_tl: correct.tl, question_en: "What does this word mean?",
        options,
        hint_tl: "", hint_en: `Think about: ${correct.en}`,
        explanation_tl: `${correct.tl} = ${correct.en}`,
        explanation_en: `${correct.tl} means ${correct.en}`,
        sort_order: s,
      },
      sort_order: s++,
      status: "approved",
      locale: "tl",
    });
  }

  // Fill blank
  const fb = words[0];
  exercises.push({
    lesson_id: lessonId,
    exercise_type: "fill_blank",
    exercise_data: {
      type: "fill_blank", id: String(s), emoji: fb.emoji,
      sentence_tl: `___ ${fb.emoji}`.trim(), sentence_en: `___ means ${fb.en}`,
      answer_tl: fb.tl, answer_en: fb.en,
      distractors_tl: words.slice(1, 3).map(w => w.tl),
      distractors_en: words.slice(1, 3).map(w => w.en),
      hint_tl: "", hint_en: `${fb.tl} means ${fb.en}`,
      explanation_tl: `${fb.tl} = ${fb.en}`, explanation_en: `${fb.tl} means ${fb.en}`,
      sort_order: s,
    },
    sort_order: s++,
    status: "approved",
    locale: "tl",
  });

  // Matching (3 pairs)
  const matchWords = words.slice(0, 3);
  matchWords.forEach((w, i) => {
    exercises.push({
      lesson_id: lessonId,
      exercise_type: "matching",
      exercise_data: {
        type: "matching", id: `m${s}-${i}`,
        left_tl: w.tl, left_en: w.tl,
        right_tl: w.en, right_en: w.en,
        sort_order: s,
      },
      sort_order: s,
      status: "approved",
      locale: "tl",
    });
  });
  s++;

  return exercises;
}

function buildReviewExercises(lessonId: string, allUnitWords: Word[]) {
  // Review uses all words from the unit with showCorrectAnswer: true
  const exercises: object[] = [];
  let s = 1;

  // Learn cards for all
  for (const w of allUnitWords) {
    exercises.push({
      lesson_id: lessonId,
      exercise_type: "learn_card",
      exercise_data: { type: "learn_card", visual: w.emoji, primary_text: w.tl, secondary_text: w.en, sort_order: s },
      sort_order: s++,
      status: "approved",
      locale: "tl",
    });
  }

  if (allUnitWords.length < 3) return exercises;

  // 2 recognition MC
  for (let i = 0; i < 2; i++) {
    const correct = allUnitWords[i];
    const wrongs = shuffle(allUnitWords.filter((_, j) => j !== i)).slice(0, 2);
    exercises.push({
      lesson_id: lessonId, exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(s), emoji: correct.emoji,
        question_tl: "", question_en: "What is this?",
        options: shuffle([
          { id: "a", text_tl: correct.tl, text_en: correct.en, correct: true },
          ...wrongs.map((w, j) => ({ id: String.fromCharCode(98 + j), text_tl: w.tl, text_en: w.en, correct: false })),
        ]),
        hint_tl: "", hint_en: "", explanation_tl: correct.tl, explanation_en: `${correct.tl} = ${correct.en}`,
        showCorrectAnswer: true, sort_order: s,
      },
      sort_order: s++, status: "approved", locale: "tl",
    });
  }

  // Matching
  const matchW = allUnitWords.slice(0, 3);
  matchW.forEach((w, i) => {
    exercises.push({
      lesson_id: lessonId, exercise_type: "matching",
      exercise_data: { type: "matching", id: `m${s}-${i}`, left_tl: w.tl, left_en: w.tl, right_tl: w.en, right_en: w.en, sort_order: s },
      sort_order: s, status: "approved", locale: "tl",
    });
  });
  s++;

  return exercises;
}

function buildQuizExercises(lessonId: string, allUnitWords: Word[]) {
  // Quiz: no learn cards, no hints, showCorrectAnswer: false
  const exercises: object[] = [];
  let s = 1;

  if (allUnitWords.length < 3) return exercises;

  // 3 recognition MC
  for (let i = 0; i < Math.min(3, allUnitWords.length); i++) {
    const correct = allUnitWords[i];
    const wrongs = shuffle(allUnitWords.filter((_, j) => j !== i)).slice(0, 2);
    exercises.push({
      lesson_id: lessonId, exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(s), emoji: correct.emoji,
        question_tl: "", question_en: "What is this?",
        options: shuffle([
          { id: "a", text_tl: correct.tl, text_en: correct.en, correct: true },
          ...wrongs.map((w, j) => ({ id: String.fromCharCode(98 + j), text_tl: w.tl, text_en: w.en, correct: false })),
        ]),
        hint_tl: "", hint_en: "", explanation_tl: correct.tl, explanation_en: `${correct.tl} = ${correct.en}`,
        showCorrectAnswer: false, sort_order: s,
      },
      sort_order: s++, status: "approved", locale: "tl",
    });
  }

  // 2 recall MC
  for (let i = 0; i < Math.min(2, allUnitWords.length); i++) {
    const correct = allUnitWords[i + Math.min(3, allUnitWords.length - 3)];
    if (!correct) break;
    const wrongs = shuffle(allUnitWords.filter(w => w !== correct)).slice(0, 2);
    exercises.push({
      lesson_id: lessonId, exercise_type: "multiple_choice",
      exercise_data: {
        type: "multiple_choice", id: String(s), emoji: "",
        question_tl: correct.tl, question_en: "What does this word mean?",
        options: shuffle([
          { id: "a", text_tl: correct.en, text_en: correct.en, correct: true },
          ...wrongs.map((w, j) => ({ id: String.fromCharCode(98 + j), text_tl: w.en, text_en: w.en, correct: false })),
        ]),
        hint_tl: "", hint_en: "", explanation_tl: `${correct.tl} = ${correct.en}`,
        explanation_en: `${correct.tl} means ${correct.en}`,
        showCorrectAnswer: false, sort_order: s,
      },
      sort_order: s++, status: "approved", locale: "tl",
    });
  }

  // Fill blank
  const fb = allUnitWords[0];
  exercises.push({
    lesson_id: lessonId, exercise_type: "fill_blank",
    exercise_data: {
      type: "fill_blank", id: String(s), emoji: fb.emoji,
      sentence_tl: `___ ${fb.emoji}`.trim(), sentence_en: `___ means ${fb.en}`,
      answer_tl: fb.tl, answer_en: fb.en,
      distractors_tl: allUnitWords.slice(1, 3).map(w => w.tl),
      distractors_en: allUnitWords.slice(1, 3).map(w => w.en),
      hint_tl: "", hint_en: "",
      explanation_tl: `${fb.tl} = ${fb.en}`, explanation_en: `${fb.tl} means ${fb.en}`,
      sort_order: s,
    },
    sort_order: s++, status: "approved", locale: "tl",
  });

  // Matching
  const matchW = allUnitWords.slice(0, 3);
  matchW.forEach((w, i) => {
    exercises.push({
      lesson_id: lessonId, exercise_type: "matching",
      exercise_data: { type: "matching", id: `m${s}-${i}`, left_tl: w.tl, left_en: w.tl, right_tl: w.en, right_en: w.en, sort_order: s },
      sort_order: s, status: "approved", locale: "tl",
    });
  });

  return exercises;
}

// ── Curriculum Data ─────────────────────────────────────────

const GRADES: GradeDef[] = [
  {
    slug: "tl-grade-1", title: "Grade 1", description: "Building reading skills, expanding vocabulary, simple sentences",
    gradeValue: "1", sortOrder: 2,
    units: [
      {
        slug: "tl-g1-reading-basics", title: "Pagbasa (Reading Basics)", description: "Learn basic reading skills with simple Tagalog words",
        lessons: [
          { slug: "tl-g1-rb-l1", title: "Mga Pantig (Syllables)", description: "Learn common syllables", words: [
            { tl: "Ba", en: "Syllable ba", emoji: "🔤" }, { tl: "Ka", en: "Syllable ka", emoji: "🔤" },
            { tl: "Ma", en: "Syllable ma", emoji: "🔤" }, { tl: "Pa", en: "Syllable pa", emoji: "🔤" },
            { tl: "Ta", en: "Syllable ta", emoji: "🔤" },
          ]},
          { slug: "tl-g1-rb-l2", title: "Simpleng Salita (Simple Words)", description: "Read simple two-syllable words", words: [
            { tl: "Bata", en: "Child", emoji: "👧" }, { tl: "Lola", en: "Grandmother", emoji: "👵" },
            { tl: "Lolo", en: "Grandfather", emoji: "👴" }, { tl: "Guro", en: "Teacher", emoji: "👩‍🏫" },
            { tl: "Tayo", en: "Us / We", emoji: "👥" },
          ]},
          { slug: "tl-g1-rb-l3", title: "Mga Salitang Pang-araw-araw", description: "Everyday reading words", words: [
            { tl: "Aklat", en: "Book", emoji: "📚" }, { tl: "Lapis", en: "Pencil", emoji: "✏️" },
            { tl: "Papel", en: "Paper", emoji: "📄" }, { tl: "Silya", en: "Chair", emoji: "🪑" },
            { tl: "Pisara", en: "Blackboard", emoji: "📋" },
          ]},
        ],
      },
      {
        slug: "tl-g1-everyday-words", title: "Mga Salita (Everyday Words)", description: "Build vocabulary for everyday conversations",
        lessons: [
          { slug: "tl-g1-ew-l1", title: "Sa Paaralan (At School)", description: "School vocabulary", words: [
            { tl: "Paaralan", en: "School", emoji: "🏫" }, { tl: "Klase", en: "Class", emoji: "📖" },
            { tl: "Kaibigan", en: "Friend", emoji: "🤝" }, { tl: "Laruan", en: "Toy", emoji: "🧸" },
            { tl: "Bag", en: "Bag", emoji: "🎒" },
          ]},
          { slug: "tl-g1-ew-l2", title: "Sa Bahay (At Home)", description: "Home vocabulary", words: [
            { tl: "Kusina", en: "Kitchen", emoji: "🍳" }, { tl: "Kwarto", en: "Bedroom", emoji: "🛏️" },
            { tl: "Banyo", en: "Bathroom", emoji: "🚿" }, { tl: "Sala", en: "Living room", emoji: "🛋️" },
            { tl: "Hagdan", en: "Stairs", emoji: "🪜" },
          ]},
          { slug: "tl-g1-ew-l3", title: "Mga Damit (Clothes)", description: "Clothing words", words: [
            { tl: "Damit", en: "Clothes", emoji: "👕" }, { tl: "Sapatos", en: "Shoes", emoji: "👟" },
            { tl: "Sombrero", en: "Hat", emoji: "🧢" }, { tl: "Palda", en: "Skirt", emoji: "👗" },
            { tl: "Medyas", en: "Socks", emoji: "🧦" },
          ]},
        ],
      },
      {
        slug: "tl-g1-simple-sentences", title: "Mga Pangungusap (Simple Sentences)", description: "Form simple sentences in Tagalog",
        lessons: [
          { slug: "tl-g1-ss-l1", title: "Ako ay... (I am...)", description: "Simple self-introduction", words: [
            { tl: "Ako ay masaya", en: "I am happy", emoji: "😊" }, { tl: "Ako ay gutom", en: "I am hungry", emoji: "🤤" },
            { tl: "Ako ay malaki", en: "I am big", emoji: "💪" }, { tl: "Ako ay mabait", en: "I am kind", emoji: "😇" },
            { tl: "Ako ay matalino", en: "I am smart", emoji: "🧠" },
          ]},
          { slug: "tl-g1-ss-l2", title: "Ito ay... (This is...)", description: "Identify objects", words: [
            { tl: "Ito ay pusa", en: "This is a cat", emoji: "🐱" }, { tl: "Ito ay aso", en: "This is a dog", emoji: "🐕" },
            { tl: "Ito ay bulaklak", en: "This is a flower", emoji: "🌸" }, { tl: "Ito ay bola", en: "This is a ball", emoji: "⚽" },
            { tl: "Ito ay bituin", en: "This is a star", emoji: "⭐" },
          ]},
          { slug: "tl-g1-ss-l3", title: "Gusto ko... (I like...)", description: "Express preferences", words: [
            { tl: "Gusto ko ng saging", en: "I like bananas", emoji: "🍌" }, { tl: "Gusto ko ng gatas", en: "I like milk", emoji: "🥛" },
            { tl: "Gusto ko maglaro", en: "I like to play", emoji: "🎮" }, { tl: "Gusto ko kumain", en: "I like to eat", emoji: "🍽️" },
            { tl: "Gusto ko matulog", en: "I like to sleep", emoji: "😴" },
          ]},
        ],
      },
    ],
  },
  {
    slug: "tl-grade-2", title: "Grade 2", description: "Reading comprehension, grammar basics, cultural awareness",
    gradeValue: "2", sortOrder: 3,
    units: [
      {
        slug: "tl-g2-reading-basics", title: "Pagbasa (Reading)", description: "Strengthen reading with longer words and phrases",
        lessons: [
          { slug: "tl-g2-rb-l1", title: "Panahon (Weather)", description: "Weather vocabulary", words: [
            { tl: "Maaraw", en: "Sunny", emoji: "☀️" }, { tl: "Maulan", en: "Rainy", emoji: "🌧️" },
            { tl: "Mahangin", en: "Windy", emoji: "💨" }, { tl: "Maulap", en: "Cloudy", emoji: "☁️" },
            { tl: "Mainit", en: "Hot", emoji: "🥵" }, { tl: "Malamig", en: "Cold", emoji: "🥶" },
          ]},
          { slug: "tl-g2-rb-l2", title: "Mga Lugar (Places)", description: "Places in the community", words: [
            { tl: "Palengke", en: "Market", emoji: "🏪" }, { tl: "Simbahan", en: "Church", emoji: "⛪" },
            { tl: "Ospital", en: "Hospital", emoji: "🏥" }, { tl: "Parke", en: "Park", emoji: "🌳" },
            { tl: "Aklatan", en: "Library", emoji: "📚" },
          ]},
          { slug: "tl-g2-rb-l3", title: "Transportasyon", description: "Transportation words", words: [
            { tl: "Kotse", en: "Car", emoji: "🚗" }, { tl: "Bus", en: "Bus", emoji: "🚌" },
            { tl: "Tren", en: "Train", emoji: "🚆" }, { tl: "Bangka", en: "Boat", emoji: "🚣" },
            { tl: "Bisikleta", en: "Bicycle", emoji: "🚲" },
          ]},
        ],
      },
      {
        slug: "tl-g2-everyday-words", title: "Mga Salita (Expanded Vocabulary)", description: "Expand vocabulary for home and school",
        lessons: [
          { slug: "tl-g2-ew-l1", title: "Mga Damdamin (Feelings)", description: "Express emotions", words: [
            { tl: "Masaya", en: "Happy", emoji: "😊" }, { tl: "Malungkot", en: "Sad", emoji: "😢" },
            { tl: "Galit", en: "Angry", emoji: "😠" }, { tl: "Takot", en: "Scared", emoji: "😨" },
            { tl: "Pagod", en: "Tired", emoji: "😫" }, { tl: "Excited", en: "Excited", emoji: "🤩" },
          ]},
          { slug: "tl-g2-ew-l2", title: "Mga Hugis (Shapes)", description: "Learn shapes", words: [
            { tl: "Bilog", en: "Circle", emoji: "⭕" }, { tl: "Parisukat", en: "Square", emoji: "🟦" },
            { tl: "Tatsulok", en: "Triangle", emoji: "🔺" }, { tl: "Bituin", en: "Star", emoji: "⭐" },
            { tl: "Puso", en: "Heart", emoji: "❤️" },
          ]},
          { slug: "tl-g2-ew-l3", title: "Oras (Time)", description: "Telling time", words: [
            { tl: "Umaga", en: "Morning", emoji: "🌅" }, { tl: "Tanghali", en: "Noon", emoji: "☀️" },
            { tl: "Hapon", en: "Afternoon", emoji: "🌤️" }, { tl: "Gabi", en: "Night", emoji: "🌙" },
            { tl: "Kahapon", en: "Yesterday", emoji: "⏪" }, { tl: "Bukas", en: "Tomorrow", emoji: "⏩" },
          ]},
        ],
      },
      {
        slug: "tl-g2-simple-sentences", title: "Mga Pangungusap (Longer Sentences)", description: "Build longer sentences with adjectives and verbs",
        lessons: [
          { slug: "tl-g2-ss-l1", title: "Mga Pang-uri (Adjectives)", description: "Describing words", words: [
            { tl: "Malaki", en: "Big", emoji: "🐘" }, { tl: "Maliit", en: "Small", emoji: "🐜" },
            { tl: "Matangkad", en: "Tall", emoji: "🦒" }, { tl: "Mabilis", en: "Fast", emoji: "🏎️" },
            { tl: "Mabagal", en: "Slow", emoji: "🐢" },
          ]},
          { slug: "tl-g2-ss-l2", title: "Mga Pandiwa (Verbs)", description: "Action words", words: [
            { tl: "Kumain", en: "To eat", emoji: "🍽️" }, { tl: "Uminom", en: "To drink", emoji: "🥤" },
            { tl: "Tumakbo", en: "To run", emoji: "🏃" }, { tl: "Maglaro", en: "To play", emoji: "🎮" },
            { tl: "Matulog", en: "To sleep", emoji: "😴" },
          ]},
          { slug: "tl-g2-ss-l3", title: "Mga Tanong (Questions)", description: "Asking questions", words: [
            { tl: "Ano?", en: "What?", emoji: "❓" }, { tl: "Sino?", en: "Who?", emoji: "🤔" },
            { tl: "Saan?", en: "Where?", emoji: "📍" }, { tl: "Kailan?", en: "When?", emoji: "📅" },
            { tl: "Bakit?", en: "Why?", emoji: "💭" },
          ]},
        ],
      },
    ],
  },
  {
    slug: "tl-grade-3", title: "Grade 3", description: "Intermediate vocabulary, grammar basics, Philippine culture",
    gradeValue: "3", sortOrder: 4,
    units: [
      {
        slug: "tl-g3-grammar", title: "Balarila (Grammar Foundations)", description: "Learn basic Tagalog grammar rules",
        lessons: [
          { slug: "tl-g3-gf-l1", title: "Pangngalan (Nouns)", description: "Types of nouns", words: [
            { tl: "Tao", en: "Person", emoji: "🧑" }, { tl: "Hayop", en: "Animal", emoji: "🐾" },
            { tl: "Bagay", en: "Thing", emoji: "📦" }, { tl: "Lugar", en: "Place", emoji: "📍" },
            { tl: "Pangyayari", en: "Event", emoji: "🎉" },
          ]},
          { slug: "tl-g3-gf-l2", title: "Panghalip (Pronouns)", description: "Personal pronouns", words: [
            { tl: "Ako", en: "I / Me", emoji: "☝️" }, { tl: "Ikaw", en: "You", emoji: "👉" },
            { tl: "Siya", en: "He / She", emoji: "🧑" }, { tl: "Tayo", en: "We (inclusive)", emoji: "👥" },
            { tl: "Sila", en: "They", emoji: "👫" },
          ]},
          { slug: "tl-g3-gf-l3", title: "Mga Panlapi (Affixes)", description: "Common word prefixes", words: [
            { tl: "Mag-aral", en: "To study", emoji: "📖" }, { tl: "Magluto", en: "To cook", emoji: "🍳" },
            { tl: "Maglinis", en: "To clean", emoji: "🧹" }, { tl: "Magsulat", en: "To write", emoji: "✍️" },
            { tl: "Magbasa", en: "To read", emoji: "📚" },
          ]},
        ],
      },
      {
        slug: "tl-g3-reading", title: "Pag-unawa (Reading Comprehension)", description: "Read short passages and answer questions",
        lessons: [
          { slug: "tl-g3-rc-l1", title: "Ang Pamilya Ko", description: "Read about family", words: [
            { tl: "Magulang", en: "Parents", emoji: "👨‍👩‍👧" }, { tl: "Anak", en: "Child", emoji: "👧" },
            { tl: "Lola", en: "Grandmother", emoji: "👵" }, { tl: "Lolo", en: "Grandfather", emoji: "👴" },
            { tl: "Pinsan", en: "Cousin", emoji: "🤝" }, { tl: "Tito", en: "Uncle", emoji: "👨" },
          ]},
          { slug: "tl-g3-rc-l2", title: "Ang Aming Barangay", description: "Community reading", words: [
            { tl: "Barangay", en: "Village", emoji: "🏘️" }, { tl: "Kapitbahay", en: "Neighbor", emoji: "🏠" },
            { tl: "Tindahan", en: "Store", emoji: "🏪" }, { tl: "Kalsada", en: "Street", emoji: "🛤️" },
            { tl: "Plasa", en: "Plaza", emoji: "⛲" },
          ]},
          { slug: "tl-g3-rc-l3", title: "Mga Hayop sa Pilipinas", description: "Philippine animals", words: [
            { tl: "Kalabaw", en: "Water buffalo", emoji: "🐃" }, { tl: "Agila", en: "Eagle", emoji: "🦅" },
            { tl: "Tarsier", en: "Tarsier", emoji: "🐒" }, { tl: "Pagong", en: "Turtle", emoji: "🐢" },
            { tl: "Daga", en: "Mouse", emoji: "🐭" },
          ]},
        ],
      },
      {
        slug: "tl-g3-writing", title: "Pagsulat (Writing Practice)", description: "Practice writing simple paragraphs",
        lessons: [
          { slug: "tl-g3-wp-l1", title: "Mga Araw ng Linggo", description: "Days of the week", words: [
            { tl: "Lunes", en: "Monday", emoji: "1️⃣" }, { tl: "Martes", en: "Tuesday", emoji: "2️⃣" },
            { tl: "Miyerkules", en: "Wednesday", emoji: "3️⃣" }, { tl: "Huwebes", en: "Thursday", emoji: "4️⃣" },
            { tl: "Biyernes", en: "Friday", emoji: "5️⃣" }, { tl: "Sabado", en: "Saturday", emoji: "6️⃣" },
            { tl: "Linggo", en: "Sunday", emoji: "7️⃣" },
          ]},
          { slug: "tl-g3-wp-l2", title: "Mga Buwan", description: "Months of the year", words: [
            { tl: "Enero", en: "January", emoji: "❄️" }, { tl: "Pebrero", en: "February", emoji: "💕" },
            { tl: "Marso", en: "March", emoji: "🌸" }, { tl: "Abril", en: "April", emoji: "🌧️" },
            { tl: "Mayo", en: "May", emoji: "🌺" }, { tl: "Hunyo", en: "June", emoji: "☀️" },
          ]},
          { slug: "tl-g3-wp-l3", title: "Mga Buwan (Ikalawang Bahagi)", description: "More months", words: [
            { tl: "Hulyo", en: "July", emoji: "🎆" }, { tl: "Agosto", en: "August", emoji: "🌻" },
            { tl: "Setyembre", en: "September", emoji: "🍂" }, { tl: "Oktubre", en: "October", emoji: "🎃" },
            { tl: "Nobyembre", en: "November", emoji: "🍁" }, { tl: "Disyembre", en: "December", emoji: "🎄" },
          ]},
        ],
      },
    ],
  },
  {
    slug: "tl-grade-4", title: "Grade 4", description: "Advanced reading, complex grammar, Philippine literature",
    gradeValue: "4", sortOrder: 5,
    units: [
      {
        slug: "tl-g4-grammar", title: "Balarila (Advanced Grammar)", description: "Advanced verb conjugation and sentence structure",
        lessons: [
          { slug: "tl-g4-gf-l1", title: "Aspekto ng Pandiwa (Verb Tenses)", description: "Past, present, future", words: [
            { tl: "Kumain (nakaraan)", en: "Ate (past)", emoji: "⏪" }, { tl: "Kumakain (kasalukuyan)", en: "Eating (present)", emoji: "▶️" },
            { tl: "Kakain (hinaharap)", en: "Will eat (future)", emoji: "⏩" }, { tl: "Nagluto", en: "Cooked", emoji: "🍳" },
            { tl: "Naglalaro", en: "Playing", emoji: "🎮" },
          ]},
          { slug: "tl-g4-gf-l2", title: "Mga Pang-abay (Adverbs)", description: "Describing how actions are done", words: [
            { tl: "Mabilis", en: "Quickly", emoji: "⚡" }, { tl: "Dahan-dahan", en: "Slowly", emoji: "🐌" },
            { tl: "Malakas", en: "Loudly", emoji: "📢" }, { tl: "Tahimik", en: "Quietly", emoji: "🤫" },
            { tl: "Palagi", en: "Always", emoji: "♾️" }, { tl: "Minsan", en: "Sometimes", emoji: "🔄" },
          ]},
          { slug: "tl-g4-gf-l3", title: "Mga Pangatnig (Conjunctions)", description: "Connecting words", words: [
            { tl: "At", en: "And", emoji: "➕" }, { tl: "Pero", en: "But", emoji: "↩️" },
            { tl: "O", en: "Or", emoji: "🔀" }, { tl: "Dahil", en: "Because", emoji: "💡" },
            { tl: "Kung", en: "If", emoji: "❔" },
          ]},
        ],
      },
      {
        slug: "tl-g4-reading", title: "Pag-unawa (Comprehension)", description: "Longer texts with comprehension questions",
        lessons: [
          { slug: "tl-g4-rc-l1", title: "Mga Tradisyon (Traditions)", description: "Philippine traditions", words: [
            { tl: "Piyesta", en: "Fiesta", emoji: "🎊" }, { tl: "Pasko", en: "Christmas", emoji: "🎄" },
            { tl: "Simbang Gabi", en: "Night Mass", emoji: "⛪" }, { tl: "Noche Buena", en: "Christmas Eve dinner", emoji: "🍗" },
            { tl: "Handaan", en: "Feast", emoji: "🎉" },
          ]},
          { slug: "tl-g4-rc-l2", title: "Mga Pagkain ng Pilipinas", description: "Filipino food", words: [
            { tl: "Adobo", en: "Adobo (stew)", emoji: "🍲" }, { tl: "Sinigang", en: "Sour soup", emoji: "🥣" },
            { tl: "Lumpia", en: "Spring roll", emoji: "🌯" }, { tl: "Halo-halo", en: "Mixed dessert", emoji: "🍧" },
            { tl: "Bibingka", en: "Rice cake", emoji: "🍰" },
          ]},
          { slug: "tl-g4-rc-l3", title: "Mga Bayani (Heroes)", description: "Philippine heroes", words: [
            { tl: "Bayani", en: "Hero", emoji: "🦸" }, { tl: "Kalayaan", en: "Freedom", emoji: "🕊️" },
            { tl: "Watawat", en: "Flag", emoji: "🇵🇭" }, { tl: "Bayan", en: "Nation", emoji: "🏛️" },
            { tl: "Kasaysayan", en: "History", emoji: "📜" },
          ]},
        ],
      },
      {
        slug: "tl-g4-writing", title: "Pagsulat (Composition)", description: "Write multi-paragraph compositions",
        lessons: [
          { slug: "tl-g4-wp-l1", title: "Mga Panlapi: -um- at mag-", description: "Verb focus affixes", words: [
            { tl: "Tumakbo", en: "Ran (um-)", emoji: "🏃" }, { tl: "Kumanta", en: "Sang (um-)", emoji: "🎤" },
            { tl: "Magluto", en: "Cook (mag-)", emoji: "🍳" }, { tl: "Magtanim", en: "Plant (mag-)", emoji: "🌱" },
            { tl: "Sumayaw", en: "Danced (um-)", emoji: "💃" },
          ]},
          { slug: "tl-g4-wp-l2", title: "Katawan at Kalusugan", description: "Health vocabulary", words: [
            { tl: "Kalusugan", en: "Health", emoji: "💪" }, { tl: "Doktor", en: "Doctor", emoji: "👨‍⚕️" },
            { tl: "Gamot", en: "Medicine", emoji: "💊" }, { tl: "Sakit", en: "Sick", emoji: "🤒" },
            { tl: "Ehersisyo", en: "Exercise", emoji: "🏋️" },
          ]},
          { slug: "tl-g4-wp-l3", title: "Mga Propesyon (Professions)", description: "Jobs and careers", words: [
            { tl: "Guro", en: "Teacher", emoji: "👩‍🏫" }, { tl: "Pulis", en: "Police", emoji: "👮" },
            { tl: "Bumbero", en: "Firefighter", emoji: "🧑‍🚒" }, { tl: "Nars", en: "Nurse", emoji: "👩‍⚕️" },
            { tl: "Magsasaka", en: "Farmer", emoji: "👨‍🌾" },
          ]},
        ],
      },
    ],
  },
  {
    slug: "tl-grade-5", title: "Grade 5", description: "Composition skills, advanced grammar, cultural studies",
    gradeValue: "5", sortOrder: 6,
    units: [
      {
        slug: "tl-g5-literature", title: "Panitikan (Philippine Literature)", description: "Read and discuss Filipino literary works",
        lessons: [
          { slug: "tl-g5-lit-l1", title: "Mga Salawikain (Proverbs)", description: "Filipino proverbs and wisdom", words: [
            { tl: "Salawikain", en: "Proverb", emoji: "📜" }, { tl: "Karunungan", en: "Wisdom", emoji: "🦉" },
            { tl: "Aral", en: "Lesson / Moral", emoji: "💡" }, { tl: "Halimbawa", en: "Example", emoji: "👆" },
            { tl: "Kahulugan", en: "Meaning", emoji: "🔍" },
          ]},
          { slug: "tl-g5-lit-l2", title: "Mga Alamat (Legends)", description: "Philippine legends", words: [
            { tl: "Alamat", en: "Legend", emoji: "📖" }, { tl: "Diwata", en: "Fairy / Spirit", emoji: "🧚" },
            { tl: "Engkanto", en: "Enchanted being", emoji: "✨" }, { tl: "Bathala", en: "God (ancient)", emoji: "🌟" },
            { tl: "Kwento", en: "Story", emoji: "📚" },
          ]},
          { slug: "tl-g5-lit-l3", title: "Mga Tula (Poetry)", description: "Filipino poetry forms", words: [
            { tl: "Tula", en: "Poem", emoji: "📝" }, { tl: "Tugma", en: "Rhyme", emoji: "🎵" },
            { tl: "Sukat", en: "Meter", emoji: "📏" }, { tl: "Taludtod", en: "Verse / Line", emoji: "📃" },
            { tl: "Saknong", en: "Stanza", emoji: "📄" },
          ]},
        ],
      },
      {
        slug: "tl-g5-grammar", title: "Balarila (Advanced)", description: "Master complex grammatical structures",
        lessons: [
          { slug: "tl-g5-ag-l1", title: "Pokus ng Pandiwa (Verb Focus)", description: "Actor vs Object focus", words: [
            { tl: "Bumili (aktor)", en: "Bought (actor focus)", emoji: "🛒" },
            { tl: "Binili (layon)", en: "Was bought (object focus)", emoji: "📦" },
            { tl: "Sinulat", en: "Was written", emoji: "✍️" },
            { tl: "Niluto", en: "Was cooked", emoji: "🍳" },
            { tl: "Tinulungan", en: "Was helped", emoji: "🤝" },
          ]},
          { slug: "tl-g5-ag-l2", title: "Mga Uri ng Pangungusap", description: "Sentence types", words: [
            { tl: "Pasalaysay", en: "Declarative", emoji: "📝" }, { tl: "Patanong", en: "Interrogative", emoji: "❓" },
            { tl: "Pautos", en: "Imperative", emoji: "☝️" }, { tl: "Padamdam", en: "Exclamatory", emoji: "❗" },
            { tl: "Pangungusap", en: "Sentence", emoji: "💬" },
          ]},
          { slug: "tl-g5-ag-l3", title: "Mga Pormal na Salita", description: "Formal and respectful language", words: [
            { tl: "Po", en: "Respectful particle", emoji: "🙏" }, { tl: "Opo", en: "Yes (respectful)", emoji: "✅" },
            { tl: "Mano po", en: "Blessing gesture", emoji: "🤲" }, { tl: "Salamat po", en: "Thank you (respectful)", emoji: "🙏" },
            { tl: "Pasensya na po", en: "Sorry (respectful)", emoji: "😔" },
          ]},
        ],
      },
      {
        slug: "tl-g5-composition", title: "Komposisyon (Composition)", description: "Write essays and creative pieces",
        lessons: [
          { slug: "tl-g5-comp-l1", title: "Kalikasan ng Pilipinas", description: "Philippine nature", words: [
            { tl: "Bulkan", en: "Volcano", emoji: "🌋" }, { tl: "Dagat", en: "Sea / Ocean", emoji: "🌊" },
            { tl: "Bundok", en: "Mountain", emoji: "⛰️" }, { tl: "Ilog", en: "River", emoji: "🏞️" },
            { tl: "Pulo", en: "Island", emoji: "🏝️" },
          ]},
          { slug: "tl-g5-comp-l2", title: "Mga Pista (Festivals)", description: "Philippine festivals", words: [
            { tl: "Sinulog", en: "Sinulog Festival", emoji: "💃" }, { tl: "Ati-Atihan", en: "Ati-Atihan Festival", emoji: "🎭" },
            { tl: "Pahiyas", en: "Pahiyas Festival", emoji: "🌾" }, { tl: "Panagbenga", en: "Flower Festival", emoji: "🌸" },
            { tl: "MassKara", en: "MassKara Festival", emoji: "🎪" },
          ]},
          { slug: "tl-g5-comp-l3", title: "Ang Pilipinas Ko", description: "My Philippines — cultural identity", words: [
            { tl: "Pilipino", en: "Filipino", emoji: "🇵🇭" }, { tl: "Wika", en: "Language", emoji: "🗣️" },
            { tl: "Kultura", en: "Culture", emoji: "🎨" }, { tl: "Pagkakaisa", en: "Unity", emoji: "🤝" },
            { tl: "Pagmamahal", en: "Love", emoji: "❤️" },
          ]},
        ],
      },
    ],
  },
];

// ── Main ────────────────────────────────────────────────────

async function main() {
  console.log("\n🇵🇭 Seeding Tagalog Grades 1-5...\n");

  let totalLessons = 0;
  let totalExercises = 0;

  for (const grade of GRADES) {
    // Create level
    let levelId: string;
    const { data: existingLevel } = await db
      .from("curriculum_levels").select("id").eq("locale", "tl").eq("slug", grade.slug).single();

    if (existingLevel) {
      levelId = existingLevel.id;
    } else {
      const { data, error } = await db.from("curriculum_levels").insert({
        slug: grade.slug, title: grade.title, description: grade.description,
        grade_value: grade.gradeValue, sort_order: grade.sortOrder, is_active: true, locale: "tl",
      }).select("id").single();
      if (error) { console.error(`  Failed level ${grade.slug}:`, error.message); continue; }
      levelId = data!.id;
    }
    console.log(`\n  Grade ${grade.gradeValue}: ${levelId}`);

    for (const unit of grade.units) {
      // Create unit
      let unitId: string;
      const { data: existingUnit } = await db
        .from("curriculum_units").select("id").eq("locale", "tl").eq("slug", unit.slug).single();

      if (existingUnit) {
        unitId = existingUnit.id;
      } else {
        const { data, error } = await db.from("curriculum_units").insert({
          level_id: levelId, slug: unit.slug, title: unit.title, description: unit.description,
          sort_order: grade.units.indexOf(unit) + 1, is_active: true, locale: "tl",
        }).select("id").single();
        if (error) { console.error(`    Failed unit ${unit.slug}:`, error.message); continue; }
        unitId = data!.id;
      }

      // Collect all words from this unit's practice lessons (for review/quiz)
      const allUnitWords: Word[] = [];

      for (let li = 0; li < unit.lessons.length; li++) {
        const lesson = unit.lessons[li];
        allUnitWords.push(...lesson.words);

        // Create lesson
        let lessonId: string;
        const { data: existingLesson } = await db
          .from("curriculum_lessons").select("id").eq("locale", "tl").eq("slug", lesson.slug).single();

        if (existingLesson) {
          lessonId = existingLesson.id;
        } else {
          const { data, error } = await db.from("curriculum_lessons").insert({
            unit_id: unitId, slug: lesson.slug, title: lesson.title, description: lesson.description,
            lesson_type: "practice", template_type: "vocabulary",
            sort_order: li + 1, passing_score: 70, is_active: true, locale: "tl",
          }).select("id").single();
          if (error) { console.error(`      Failed lesson ${lesson.slug}:`, error.message); continue; }
          lessonId = data!.id;
        }

        // Build & insert exercises
        await db.from("curated_exercises").delete().eq("lesson_id", lessonId);
        const exercises = buildVocabExercises(lessonId, lesson.words);
        const { error: exErr } = await db.from("curated_exercises").insert(exercises);
        if (exErr) { console.error(`      Exercise error ${lesson.slug}:`, exErr.message); }
        else { totalExercises += exercises.length; }
        totalLessons++;
      }

      // Create Review lesson
      const reviewSlug = `${unit.slug}-review`;
      let reviewId: string;
      const { data: existingReview } = await db
        .from("curriculum_lessons").select("id").eq("locale", "tl").eq("slug", reviewSlug).single();
      if (existingReview) {
        reviewId = existingReview.id;
      } else {
        const { data, error } = await db.from("curriculum_lessons").insert({
          unit_id: unitId, slug: reviewSlug, title: "Review", description: "Review all words from this unit",
          lesson_type: "practice", template_type: "review",
          sort_order: unit.lessons.length + 1, passing_score: 70, is_active: true, locale: "tl",
        }).select("id").single();
        if (error) { console.error(`      Failed review ${reviewSlug}:`, error.message); continue; }
        reviewId = data!.id;
      }
      await db.from("curated_exercises").delete().eq("lesson_id", reviewId);
      const reviewExercises = buildReviewExercises(reviewId, allUnitWords);
      const { error: revErr } = await db.from("curated_exercises").insert(reviewExercises);
      if (revErr) console.error(`      Review exercise error:`, revErr.message);
      else totalExercises += reviewExercises.length;
      totalLessons++;

      // Create Quiz lesson
      const quizSlug = `${unit.slug}-quiz`;
      let quizId: string;
      const { data: existingQuiz } = await db
        .from("curriculum_lessons").select("id").eq("locale", "tl").eq("slug", quizSlug).single();
      if (existingQuiz) {
        quizId = existingQuiz.id;
      } else {
        const { data, error } = await db.from("curriculum_lessons").insert({
          unit_id: unitId, slug: quizSlug, title: "Unit Quiz", description: "Test your knowledge",
          lesson_type: "quiz", template_type: "quiz",
          sort_order: unit.lessons.length + 2, passing_score: 70, is_active: true, locale: "tl",
        }).select("id").single();
        if (error) { console.error(`      Failed quiz ${quizSlug}:`, error.message); continue; }
        quizId = data!.id;
      }
      await db.from("curated_exercises").delete().eq("lesson_id", quizId);
      const quizExercises = buildQuizExercises(quizId, allUnitWords);
      const { error: quizErr } = await db.from("curated_exercises").insert(quizExercises);
      if (quizErr) console.error(`      Quiz exercise error:`, quizErr.message);
      else totalExercises += quizExercises.length;
      totalLessons++;

      console.log(`    ${unit.title}: ${unit.lessons.length + 2} lessons`);
    }
  }

  // Verification
  console.log("\n--- Summary ---");
  console.log(`  Total lessons created: ${totalLessons}`);
  console.log(`  Total exercises created: ${totalExercises}`);

  const { data: byGrade } = await db
    .from("curriculum_levels")
    .select("grade_value, curriculum_units(curriculum_lessons(id))")
    .eq("locale", "tl")
    .order("sort_order");

  if (byGrade) {
    console.log("\n--- Lessons by grade ---");
    for (const level of byGrade) {
      const units = (level.curriculum_units ?? []) as { curriculum_lessons: { id: string }[] }[];
      const count = units.reduce((s, u) => s + (u.curriculum_lessons?.length ?? 0), 0);
      console.log(`  Grade ${level.grade_value}: ${count} lessons`);
    }
  }

  const { count: exCount } = await db
    .from("curated_exercises")
    .select("id", { count: "exact", head: true })
    .eq("locale", "tl")
    .eq("status", "approved");
  console.log(`\n  Total approved tl exercises: ${exCount ?? "?"}`);

  console.log("\nDone!\n");
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
