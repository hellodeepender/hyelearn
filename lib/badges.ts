export interface Badge {
  slug: string;
  name: string;
  nameArmenian: string;
  description: string;
  emoji: string;
  condition: string;
  category: "milestone" | "achievement" | "streak";
}

export const BADGES: Badge[] = [
  {
    slug: "pomegranate",
    name: "Pomegranate",
    nameArmenian: "\u0546\u0578\u0582\u057C",
    description: "Completed your first lesson",
    emoji: "\uD83C\uDF4E",
    condition: "first_lesson",
    category: "milestone",
  },
  {
    slug: "khachkar",
    name: "Khachkar",
    nameArmenian: "\u053D\u0561\u0579\u0584\u0561\u0580",
    description: "Completed the Armenian Alphabet",
    emoji: "\u271D\uFE0F",
    condition: "alphabet_complete",
    category: "milestone",
  },
  {
    slug: "duduk",
    name: "Duduk",
    nameArmenian: "\u0534\u0578\u0582\u0564\u0578\u0582\u056F",
    description: "Completed 10 lessons",
    emoji: "\uD83C\uDFB5",
    condition: "lessons_10",
    category: "milestone",
  },
  {
    slug: "ararat",
    name: "Mount Ararat",
    nameArmenian: "\u0531\u0580\u0561\u0580\u0561\u057F",
    description: "Scored 100% on a quiz",
    emoji: "\uD83C\uDFD4\uFE0F",
    condition: "perfect_quiz",
    category: "achievement",
  },
  {
    slug: "garni",
    name: "Garni Temple",
    nameArmenian: "\u0533\u0561\u057C\u0576\u056B",
    description: "Completed all of Kindergarten",
    emoji: "\uD83C\uDFDB\uFE0F",
    condition: "kindergarten_complete",
    category: "milestone",
  },
  {
    slug: "tatev",
    name: "Tatev Monastery",
    nameArmenian: "\u054F\u0561\u0569\u0587",
    description: "Completed an entire grade level",
    emoji: "\u26EA",
    condition: "grade_complete",
    category: "milestone",
  },
  {
    slug: "streak_7",
    name: "Week Warrior",
    nameArmenian: "",
    description: "7-day learning streak",
    emoji: "\uD83D\uDD25",
    condition: "streak_7",
    category: "streak",
  },
  {
    slug: "streak_30",
    name: "Monthly Master",
    nameArmenian: "",
    description: "30-day learning streak",
    emoji: "\uD83D\uDCAA",
    condition: "streak_30",
    category: "streak",
  },
  {
    slug: "streak_100",
    name: "Century Champion",
    nameArmenian: "",
    description: "100-day learning streak",
    emoji: "\uD83D\uDC51",
    condition: "streak_100",
    category: "streak",
  },
];

export function getBadgeBySlug(slug: string): Badge | undefined {
  return BADGES.find((b) => b.slug === slug);
}
