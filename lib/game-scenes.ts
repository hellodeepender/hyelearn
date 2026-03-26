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
  previewEmoji: string;
  objects: GameObject[];
}

export const GAME_SCENES: Record<string, GameScene[]> = {
  hy: [
    {
      id: "nouris-room",
      locale: "hy",
      title: "\u0546\u0578\u0582\u0580\u056B\u056B \u057D\u0565\u0576\u0575\u0561\u056F\u0568",
      titleEn: "Nouri's Room",
      previewEmoji: "\uD83D\uDECF\uFE0F",
      objects: [
        { id: "cat", word: "\u056F\u0561\u057F\u0578\u0582", wordEn: "cat", letter: "\u053F", x: 40, y: 70, illustration: "cat" },
        { id: "book", word: "\u0563\u056B\u0580\u0584", wordEn: "book", letter: "\u0533", x: 25, y: 85, illustration: "book" },
        { id: "apple", word: "\u056D\u0576\u0571\u0578\u0580", wordEn: "apple", letter: "\u053D", x: 18, y: 35, illustration: "apple" },
        { id: "dog", word: "\u0577\u0578\u0582\u0576", wordEn: "dog", letter: "\u0547", x: 68, y: 72, illustration: "dog" },
        { id: "sun", word: "\u0561\u0580\u0565\u057E", wordEn: "sun", letter: "\u0531", x: 50, y: 18, illustration: "sun" },
        { id: "bird", word: "\u0569\u057C\u0579\u0578\u0582\u0576", wordEn: "bird", letter: "\u0539", x: 60, y: 42, illustration: "bird" },
      ],
    },
    {
      id: "kitchen",
      locale: "hy",
      title: "\u053D\u0578\u0570\u0561\u0576\u0578\u0581\u0568",
      titleEn: "The Kitchen",
      previewEmoji: "\uD83C\uDF73",
      objects: [
        { id: "bread-k", word: "\u0570\u0561\u0581", wordEn: "bread", letter: "\u0540", x: 30, y: 55, illustration: "bread" },
        { id: "water-k", word: "\u057B\u0578\u0582\u0580", wordEn: "water", letter: "\u054B", x: 65, y: 45, illustration: "water" },
        { id: "orange-k", word: "\u0576\u0561\u0580\u056B\u0576\u057B", wordEn: "orange", letter: "\u0546", x: 20, y: 35, illustration: "orange" },
        { id: "cheese-k", word: "\u057A\u0561\u0576\u056B\u0580", wordEn: "cheese", letter: "\u054A", x: 75, y: 65, illustration: "cheese" },
        { id: "fish-k", word: "\u056E\u0578\u0582\u056F", wordEn: "fish", letter: "\u053E", x: 50, y: 75, illustration: "fish" },
        { id: "egg-k", word: "\u0571\u0578\u0582", wordEn: "egg", letter: "\u0541", x: 40, y: 30, illustration: "egg" },
      ],
    },
    {
      id: "garden",
      locale: "hy",
      title: "\u054A\u0561\u0580\u057F\u0565\u0566",
      titleEn: "The Garden",
      previewEmoji: "\uD83C\uDF33",
      objects: [
        { id: "rose-g", word: "\u057E\u0561\u0580\u0564", wordEn: "rose", letter: "\u054E", x: 25, y: 60, illustration: "flower" },
        { id: "butterfly-g", word: "\u0569\u056B\u0569\u0565\u057C", wordEn: "butterfly", letter: "\u0539", x: 50, y: 35, illustration: "butterfly" },
        { id: "frog-g", word: "\u0563\u0578\u0580\u057F", wordEn: "frog", letter: "\u0533", x: 70, y: 75, illustration: "frog" },
        { id: "rain-g", word: "\u0561\u0576\u0571\u0580\u0587", wordEn: "rain", letter: "\u0531", x: 40, y: 15, illustration: "rain" },
        { id: "bee-g", word: "\u0574\u0565\u0572\u0578\u0582", wordEn: "bee", letter: "\u0544", x: 60, y: 25, illustration: "bee" },
        { id: "mushroom-g", word: "\u057D\u0578\u0582\u0576\u056F", wordEn: "mushroom", letter: "\u054D", x: 35, y: 80, illustration: "mushroom" },
      ],
    },
    {
      id: "playground",
      locale: "hy",
      title: "\u053D\u0561\u0572\u0561\u0564\u0561\u0577\u057F",
      titleEn: "The Playground",
      previewEmoji: "\uD83C\uDFA2",
      objects: [
        { id: "ball-p", word: "\u0563\u0576\u0564\u0561\u056F", wordEn: "ball", letter: "\u0533", x: 45, y: 70, illustration: "ball" },
        { id: "kite-p", word: "\u0585\u0564\u0561\u057A\u0561\u057F", wordEn: "kite", letter: "\u0555", x: 30, y: 20, illustration: "kite" },
        { id: "swing-p", word: "\u0573\u0578\u0573", wordEn: "swing", letter: "\u0543", x: 60, y: 50, illustration: "swing" },
        { id: "balloon-p", word: "\u0583\u0578\u0582\u0579\u056B\u056F", wordEn: "balloon", letter: "\u0553", x: 75, y: 30, illustration: "balloon" },
        { id: "slide-p", word: "\u057D\u0561\u0570\u0578\u0582\u0576\u0584", wordEn: "slide", letter: "\u054D", x: 20, y: 55, illustration: "slide" },
        { id: "bicycle-p", word: "\u0570\u0565\u056E\u0561\u0576\u056B\u057E", wordEn: "bicycle", letter: "\u0540", x: 20, y: 65, illustration: "bicycle" },
      ],
    },
  ],
  el: [
    {
      id: "sophias-room",
      locale: "el",
      title: "\u03A4\u03BF \u03B4\u03C9\u03BC\u03AC\u03C4\u03B9\u03BF \u03C4\u03B7\u03C2 \u03A3\u03BF\u03C6\u03AF\u03B1\u03C2",
      titleEn: "Sophia's Room",
      previewEmoji: "\uD83D\uDECF\uFE0F",
      objects: [
        { id: "cat", word: "\u03B3\u03AC\u03C4\u03B1", wordEn: "cat", letter: "\u0393", x: 40, y: 70, illustration: "cat" },
        { id: "book", word: "\u03B2\u03B9\u03B2\u03BB\u03AF\u03BF", wordEn: "book", letter: "\u0392", x: 25, y: 85, illustration: "book" },
        { id: "apple", word: "\u03BC\u03AE\u03BB\u03BF", wordEn: "apple", letter: "\u039C", x: 18, y: 35, illustration: "apple" },
        { id: "dog", word: "\u03C3\u03BA\u03CD\u03BB\u03BF\u03C2", wordEn: "dog", letter: "\u03A3", x: 68, y: 72, illustration: "dog" },
        { id: "sun", word: "\u03AE\u03BB\u03B9\u03BF\u03C2", wordEn: "sun", letter: "\u0389", x: 50, y: 18, illustration: "sun" },
        { id: "bird", word: "\u03C0\u03BF\u03C5\u03BB\u03AF", wordEn: "bird", letter: "\u03A0", x: 60, y: 42, illustration: "bird" },
      ],
    },
    {
      id: "kitchen",
      locale: "el",
      title: "\u0397 \u039A\u03BF\u03C5\u03B6\u03AF\u03BD\u03B1",
      titleEn: "The Kitchen",
      previewEmoji: "\uD83C\uDF73",
      objects: [
        { id: "bread-k", word: "\u03C8\u03C9\u03BC\u03AF", wordEn: "bread", letter: "\u03A8", x: 30, y: 55, illustration: "bread" },
        { id: "water-k", word: "\u03BD\u03B5\u03C1\u03CC", wordEn: "water", letter: "\u039D", x: 65, y: 45, illustration: "water" },
        { id: "orange-k", word: "\u03C0\u03BF\u03C1\u03C4\u03BF\u03BA\u03AC\u03BB\u03B9", wordEn: "orange", letter: "\u03A0", x: 20, y: 35, illustration: "orange" },
        { id: "cheese-k", word: "\u03C4\u03C5\u03C1\u03AF", wordEn: "cheese", letter: "\u03A4", x: 75, y: 65, illustration: "cheese" },
        { id: "egg-k", word: "\u03B1\u03C5\u03B3\u03CC", wordEn: "egg", letter: "\u0391", x: 50, y: 75, illustration: "egg" },
        { id: "spoon-k", word: "\u03BA\u03BF\u03C5\u03C4\u03AC\u03BB\u03B9", wordEn: "spoon", letter: "\u039A", x: 40, y: 30, illustration: "spoon" },
      ],
    },
    {
      id: "garden",
      locale: "el",
      title: "\u039F \u039A\u03AE\u03C0\u03BF\u03C2",
      titleEn: "The Garden",
      previewEmoji: "\uD83C\uDF33",
      objects: [
        { id: "tree-g", word: "\u03B4\u03AD\u03BD\u03C4\u03C1\u03BF", wordEn: "tree", letter: "\u0394", x: 25, y: 60, illustration: "tree" },
        { id: "flower-g", word: "\u03BB\u03BF\u03C5\u03BB\u03BF\u03CD\u03B4\u03B9", wordEn: "flower", letter: "\u039B", x: 50, y: 35, illustration: "flower" },
        { id: "butterfly-g", word: "\u03C0\u03B5\u03C4\u03B1\u03BB\u03BF\u03CD\u03B4\u03B1", wordEn: "butterfly", letter: "\u03A0", x: 70, y: 40, illustration: "butterfly" },
        { id: "frog-g", word: "\u03B2\u03AC\u03C4\u03C1\u03B1\u03C7\u03BF\u03C2", wordEn: "frog", letter: "\u0392", x: 40, y: 75, illustration: "frog" },
        { id: "cloud-g", word: "\u03C3\u03CD\u03BD\u03BD\u03B5\u03C6\u03BF", wordEn: "cloud", letter: "\u03A3", x: 60, y: 15, illustration: "cloud" },
        { id: "bee-g", word: "\u03BC\u03AD\u03BB\u03B9\u03C3\u03C3\u03B1", wordEn: "bee", letter: "\u039C", x: 35, y: 25, illustration: "bee" },
      ],
    },
    {
      id: "playground",
      locale: "el",
      title: "\u0397 \u03A0\u03B1\u03B9\u03B4\u03B9\u03BA\u03AE \u03A7\u03B1\u03C1\u03AC",
      titleEn: "The Playground",
      previewEmoji: "\uD83C\uDFA2",
      objects: [
        { id: "ball-p", word: "\u03BC\u03C0\u03AC\u03BB\u03B1", wordEn: "ball", letter: "\u039C", x: 45, y: 70, illustration: "ball" },
        { id: "kite-p", word: "\u03C7\u03B1\u03C1\u03C4\u03B1\u03B5\u03C4\u03CC\u03C2", wordEn: "kite", letter: "\u03A7", x: 30, y: 20, illustration: "kite" },
        { id: "swing-p", word: "\u03BA\u03BF\u03CD\u03BD\u03B9\u03B1", wordEn: "swing", letter: "\u039A", x: 60, y: 50, illustration: "swing" },
        { id: "slide-p", word: "\u03C4\u03C3\u03BF\u03C5\u03BB\u03AE\u03B8\u03C1\u03B1", wordEn: "slide", letter: "\u03A4", x: 75, y: 55, illustration: "slide" },
        { id: "bicycle-p", word: "\u03C0\u03BF\u03B4\u03AE\u03BB\u03B1\u03C4\u03BF", wordEn: "bicycle", letter: "\u03A0", x: 20, y: 65, illustration: "bicycle" },
        { id: "balloon-p", word: "\u03B1\u03B5\u03C1\u03CC\u03C3\u03C4\u03B1\u03C4\u03BF", wordEn: "balloon", letter: "\u0391", x: 50, y: 30, illustration: "balloon" },
      ],
    },
  ],
  ar: [
    {
      id: "zaytouns-room",
      locale: "ar",
      title: "\u063A\u0631\u0641\u0629 \u0632\u064A\u062A\u0648\u0646",
      titleEn: "Zaytoun's Room",
      previewEmoji: "\uD83D\uDECF\uFE0F",
      objects: [
        { id: "cat", word: "\u0642\u0637\u0629", wordEn: "cat", letter: "\u0642", x: 40, y: 70, illustration: "cat" },
        { id: "book", word: "\u0643\u062A\u0627\u0628", wordEn: "book", letter: "\u0643", x: 25, y: 85, illustration: "book" },
        { id: "apple", word: "\u062A\u0641\u0627\u062D\u0629", wordEn: "apple", letter: "\u062A", x: 18, y: 35, illustration: "apple" },
        { id: "bread", word: "\u062E\u0628\u0632", wordEn: "bread", letter: "\u062E", x: 75, y: 55, illustration: "bread" },
        { id: "sun", word: "\u0634\u0645\u0633", wordEn: "sun", letter: "\u0634", x: 50, y: 18, illustration: "sun" },
        { id: "water", word: "\u0645\u0627\u0621", wordEn: "water", letter: "\u0645", x: 60, y: 42, illustration: "water" },
      ],
    },
    {
      id: "kitchen",
      locale: "ar",
      title: "\u0627\u0644\u0645\u0637\u0628\u062E",
      titleEn: "The Kitchen",
      previewEmoji: "\uD83C\uDF73",
      objects: [
        { id: "egg-k", word: "\u0628\u064A\u0636\u0629", wordEn: "egg", letter: "\u0628", x: 30, y: 55, illustration: "egg" },
        { id: "fish-k", word: "\u0633\u0645\u0643\u0629", wordEn: "fish", letter: "\u0633", x: 65, y: 45, illustration: "fish" },
        { id: "milk-k", word: "\u062D\u0644\u064A\u0628", wordEn: "milk", letter: "\u062D", x: 20, y: 35, illustration: "milk" },
        { id: "rice-k", word: "\u0623\u0631\u0632", wordEn: "rice", letter: "\u0623", x: 75, y: 65, illustration: "rice" },
        { id: "spoon-k", word: "\u0645\u0644\u0639\u0642\u0629", wordEn: "spoon", letter: "\u0645", x: 50, y: 75, illustration: "spoon" },
        { id: "plate-k", word: "\u0635\u062D\u0646", wordEn: "plate", letter: "\u0635", x: 40, y: 30, illustration: "plate" },
      ],
    },
    {
      id: "garden",
      locale: "ar",
      title: "\u0627\u0644\u062D\u062F\u064A\u0642\u0629",
      titleEn: "The Garden",
      previewEmoji: "\uD83C\uDF33",
      objects: [
        { id: "tree-g", word: "\u0634\u062C\u0631\u0629", wordEn: "tree", letter: "\u0634", x: 25, y: 60, illustration: "tree" },
        { id: "flower-g", word: "\u0632\u0647\u0631\u0629", wordEn: "flower", letter: "\u0632", x: 50, y: 35, illustration: "flower" },
        { id: "butterfly-g", word: "\u0641\u0631\u0627\u0634\u0629", wordEn: "butterfly", letter: "\u0641", x: 70, y: 40, illustration: "butterfly" },
        { id: "frog-g", word: "\u0636\u0641\u062F\u0639", wordEn: "frog", letter: "\u0636", x: 40, y: 75, illustration: "frog" },
        { id: "bee-g", word: "\u0646\u062D\u0644\u0629", wordEn: "bee", letter: "\u0646", x: 60, y: 25, illustration: "bee" },
        { id: "rain-g", word: "\u0645\u0637\u0631", wordEn: "rain", letter: "\u0645", x: 35, y: 15, illustration: "rain" },
      ],
    },
    {
      id: "playground",
      locale: "ar",
      title: "\u0627\u0644\u0645\u0644\u0639\u0628",
      titleEn: "The Playground",
      previewEmoji: "\uD83C\uDFA2",
      objects: [
        { id: "ball-p", word: "\u0643\u0631\u0629", wordEn: "ball", letter: "\u0643", x: 45, y: 70, illustration: "ball" },
        { id: "swing-p", word: "\u0623\u0631\u062C\u0648\u062D\u0629", wordEn: "swing", letter: "\u0623", x: 30, y: 50, illustration: "swing" },
        { id: "balloon-p", word: "\u0628\u0627\u0644\u0648\u0646", wordEn: "balloon", letter: "\u0628", x: 60, y: 30, illustration: "balloon" },
        { id: "slide-p", word: "\u0632\u0644\u0627\u0642\u0629", wordEn: "slide", letter: "\u0632", x: 75, y: 55, illustration: "slide" },
        { id: "bicycle-p", word: "\u062F\u0631\u0627\u062C\u0629", wordEn: "bicycle", letter: "\u062F", x: 20, y: 65, illustration: "bicycle" },
        { id: "kite-p", word: "\u0637\u0627\u0626\u0631\u0629", wordEn: "kite", letter: "\u0637", x: 50, y: 20, illustration: "kite" },
      ],
    },
  ],
};
