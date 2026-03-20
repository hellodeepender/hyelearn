// English labels for curriculum titles in non-English locales

const LEVEL_LABELS_EL: Record<string, string> = {
  "\u039D\u03B7\u03C0\u03B9\u03B1\u03B3\u03C9\u03B3\u03B5\u03AF\u03BF": "Kindergarten",
  "\u0391' \u0394\u03B7\u03BC\u03BF\u03C4\u03B9\u03BA\u03BF\u03CD": "Grade 1",
  "\u0392' \u0394\u03B7\u03BC\u03BF\u03C4\u03B9\u03BA\u03BF\u03CD": "Grade 2",
  "\u0393' \u0394\u03B7\u03BC\u03BF\u03C4\u03B9\u03BA\u03BF\u03CD": "Grade 3",
  "\u0394' \u0394\u03B7\u03BC\u03BF\u03C4\u03B9\u03BA\u03BF\u03CD": "Grade 4",
  "\u0395' \u0394\u03B7\u03BC\u03BF\u03C4\u03B9\u03BA\u03BF\u03CD": "Grade 5",
};

const UNIT_LABELS_EL: Record<string, string> = {
  "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03CC \u0391\u03BB\u03C6\u03AC\u03B2\u03B7\u03C4\u03BF Part 1": "Greek Alphabet Part 1",
  "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03CC \u0391\u03BB\u03C6\u03AC\u03B2\u03B7\u03C4\u03BF Part 2": "Greek Alphabet Part 2",
  "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03CC \u0391\u03BB\u03C6\u03AC\u03B2\u03B7\u03C4\u03BF Part 3": "Greek Alphabet Part 3",
  "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03CC \u0391\u03BB\u03C6\u03AC\u03B2\u03B7\u03C4\u03BF Part 4": "Greek Alphabet Part 4",
  "\u039B\u03B5\u03BE\u03B9\u03BB\u03CC\u03B3\u03B9\u03BF Part 1": "Vocabulary Part 1",
  "\u039B\u03B5\u03BE\u03B9\u03BB\u03CC\u03B3\u03B9\u03BF Part 2": "Vocabulary Part 2",
  "\u039B\u03B5\u03BE\u03B9\u03BB\u03CC\u03B3\u03B9\u03BF Part 3": "Vocabulary Part 3",
};

export function getEnglishTitle(title: string, locale: string): string | null {
  if (locale !== "el") return null;

  // Exact match on level/unit labels
  if (LEVEL_LABELS_EL[title]) return LEVEL_LABELS_EL[title];
  if (UNIT_LABELS_EL[title]) return UNIT_LABELS_EL[title];

  // Pattern matching for lesson titles
  if (title.startsWith("\u039C\u03AC\u03B8\u03B7\u03BC\u03B1")) return title.replace("\u039C\u03AC\u03B8\u03B7\u03BC\u03B1", "Lesson");
  if (title === "\u0395\u03C0\u03B1\u03BD\u03AC\u03BB\u03B7\u03C8\u03B7") return "Review";
  if (title === "\u0391\u03BD\u03B1\u03C3\u03BA\u03CC\u03C0\u03B7\u03C3\u03B7") return "Review";
  if (title === "\u039A\u03BF\u03C5\u03AF\u03B6") return "Quiz";

  return null;
}
