export interface GameObject {
  id: string;
  word: string;
  wordEn: string;
  letter: string;
  x: number;
  y: number;
  illustration: string;
}

export interface GameScene {
  id: string;
  locale: string;
  title: string;
  titleEn: string;
  objects: GameObject[];
}

export const GAME_SCENES: Record<string, GameScene> = {
  hy: {
    id: "nouris-room",
    locale: "hy",
    title: "\u0546\u0578\u0582\u0580\u056B\u056B \u057D\u0565\u0576\u0575\u0561\u056F\u0568",
    titleEn: "Nouri's Room",
    objects: [
      { id: "cat", word: "\u056F\u0561\u057F\u0578\u0582", wordEn: "cat", letter: "\u053F", x: 40, y: 70, illustration: "cat" },
      { id: "book", word: "\u0563\u056B\u0580\u0584", wordEn: "book", letter: "\u0533", x: 25, y: 85, illustration: "book" },
      { id: "apple", word: "\u056D\u0576\u0571\u0578\u0580", wordEn: "apple", letter: "\u053D", x: 18, y: 35, illustration: "apple" },
      { id: "dog", word: "\u0577\u0578\u0582\u0576", wordEn: "dog", letter: "\u0547", x: 68, y: 72, illustration: "dog" },
      { id: "sun", word: "\u0561\u0580\u0565\u057E", wordEn: "sun", letter: "\u0531", x: 50, y: 18, illustration: "sun" },
      { id: "bird", word: "\u0569\u057C\u0579\u0578\u0582\u0576", wordEn: "bird", letter: "\u0539", x: 60, y: 42, illustration: "bird" },
    ],
  },
  el: {
    id: "sophias-room",
    locale: "el",
    title: "\u03A4\u03BF \u03B4\u03C9\u03BC\u03AC\u03C4\u03B9\u03BF \u03C4\u03B7\u03C2 \u03A3\u03BF\u03C6\u03AF\u03B1\u03C2",
    titleEn: "Sophia's Room",
    objects: [
      { id: "cat", word: "\u03B3\u03AC\u03C4\u03B1", wordEn: "cat", letter: "\u0393", x: 40, y: 70, illustration: "cat" },
      { id: "book", word: "\u03B2\u03B9\u03B2\u03BB\u03AF\u03BF", wordEn: "book", letter: "\u0392", x: 25, y: 85, illustration: "book" },
      { id: "apple", word: "\u03BC\u03AE\u03BB\u03BF", wordEn: "apple", letter: "\u039C", x: 18, y: 35, illustration: "apple" },
      { id: "dog", word: "\u03C3\u03BA\u03CD\u03BB\u03BF\u03C2", wordEn: "dog", letter: "\u03A3", x: 68, y: 72, illustration: "dog" },
      { id: "sun", word: "\u03AE\u03BB\u03B9\u03BF\u03C2", wordEn: "sun", letter: "\u0389", x: 50, y: 18, illustration: "sun" },
      { id: "bird", word: "\u03C0\u03BF\u03C5\u03BB\u03AF", wordEn: "bird", letter: "\u03A0", x: 60, y: 42, illustration: "bird" },
    ],
  },
  ar: {
    id: "zaytouns-room",
    locale: "ar",
    title: "\u063A\u0631\u0641\u0629 \u0632\u064A\u062A\u0648\u0646",
    titleEn: "Zaytoun's Room",
    objects: [
      { id: "cat", word: "\u0642\u0637\u0629", wordEn: "cat", letter: "\u0642", x: 40, y: 70, illustration: "cat" },
      { id: "book", word: "\u0643\u062A\u0627\u0628", wordEn: "book", letter: "\u0643", x: 25, y: 85, illustration: "book" },
      { id: "apple", word: "\u062A\u0641\u0627\u062D\u0629", wordEn: "apple", letter: "\u062A", x: 18, y: 35, illustration: "apple" },
      { id: "bread", word: "\u062E\u0628\u0632", wordEn: "bread", letter: "\u062E", x: 75, y: 55, illustration: "bread" },
      { id: "sun", word: "\u0634\u0645\u0633", wordEn: "sun", letter: "\u0634", x: 50, y: 18, illustration: "sun" },
      { id: "water", word: "\u0645\u0627\u0621", wordEn: "water", letter: "\u0645", x: 60, y: 42, illustration: "water" },
    ],
  },
};
