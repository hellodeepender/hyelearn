/**
 * Seed Sunday School units and lessons for Armenian (hy) and Greek (el).
 *
 * Prerequisites: Tables must exist (run migration 20260321_sunday_school.sql first).
 *
 * Usage: npx tsx scripts/seed-sunday-school.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("Missing env vars"); process.exit(1); }

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

// ── UNIT DEFINITIONS ────────────────────────────────────────

interface UnitDef {
  unit_number: number;
  title: string;
  title_native_hy: string;
  title_native_el: string;
  description: string;
  season: string;
  week_start: number;
  week_end: number;
}

const UNITS: UnitDef[] = [
  { unit_number: 1, title: "Fall / Holy Cross", title_native_hy: "\u0531\u0577\u0578\u0582\u0576 / \u054D\u0578\u0582\u0580\u0562 \u053D\u0561\u0579", title_native_el: "\u03A6\u03B8\u03B9\u03BD\u03CC\u03C0\u03C9\u03C1\u03BF / \u03A4\u03AF\u03BC\u03B9\u03BF\u03C2 \u03A3\u03C4\u03B1\u03C5\u03C1\u03CC\u03C2", description: "Welcome to Sunday School. The Feast of the Holy Cross, our church building, and how we pray.", season: "Fall", week_start: 1, week_end: 4 },
  { unit_number: 2, title: "Saints & Heroes", title_native_hy: "\u054D\u0578\u0582\u0580\u0562\u0565\u0580 \u0587 \u0540\u0565\u0580\u0578\u057D\u0576\u0565\u0580", title_native_el: "\u0386\u03B3\u03B9\u03BF\u03B9 \u03BA\u03B1\u03B9 \u0389\u03C1\u03C9\u03B5\u03C2", description: "Patron saints and cultural heroes of our faith.", season: "Fall", week_start: 5, week_end: 8 },
  { unit_number: 3, title: "Advent & Christmas", title_native_hy: "\u053D\u0561\u0572\u0561\u0572\u0561\u057F\u0578\u0576\u0584 \u0587 \u054D\u0578\u0582\u0580\u0562 \u053E\u0576\u0578\u0582\u0576\u0564", title_native_el: "\u03A3\u03B1\u03C1\u03B1\u03BD\u03C4\u03B1\u03AE\u03BC\u03B5\u03C1\u03BF / \u03A7\u03C1\u03B9\u03C3\u03C4\u03BF\u03CD\u03B3\u03B5\u03BD\u03BD\u03B1", description: "Preparing for and celebrating the birth of Christ.", season: "Advent/Christmas", week_start: 9, week_end: 13 },
  { unit_number: 4, title: "Epiphany", title_native_hy: "\u0531\u057D\u057F\u0578\u0582\u0561\u056E\u0561\u0575\u0561\u0575\u057F\u0576\u0578\u0582\u0569\u056B\u0582\u0576", title_native_el: "\u0398\u03B5\u03BF\u03C6\u03AC\u03BD\u03B5\u03B9\u03B1", description: "The Baptism of Jesus and the Blessing of Water.", season: "Epiphany", week_start: 14, week_end: 16 },
  { unit_number: 5, title: "Preparing for Lent", title_native_hy: "\u0532\u0561\u0580\u0565\u056F\u0565\u0576\u0564\u0561\u0576", title_native_el: "\u03A0\u03C1\u03BF\u03B5\u03C4\u03BF\u03B9\u03BC\u03B1\u03C3\u03AF\u03B1 \u03A3\u03B1\u03C1\u03B1\u03BA\u03BF\u03C3\u03C4\u03AE\u03C2", description: "Carnival, forgiveness, and understanding fasting.", season: "Pre-Lent", week_start: 17, week_end: 19 },
  { unit_number: 6, title: "Great Lent", title_native_hy: "\u0544\u0565\u056E \u054A\u0561\u0570\u0584", title_native_el: "\u039C\u03B5\u03B3\u03AC\u03BB\u03B7 \u03A3\u03B1\u03C1\u03B1\u03BA\u03BF\u03C3\u03C4\u03AE", description: "Parables, prayer, and charity during the Lenten journey.", season: "Lent", week_start: 20, week_end: 25 },
  { unit_number: 7, title: "Holy Week & Pascha", title_native_hy: "\u0531\u0582\u0561\u0563 \u0547\u0561\u0562\u0561\u0569 \u0587 \u054D\u0578\u0582\u0580\u0562 \u0536\u0561\u057F\u056B\u056F", title_native_el: "\u039C\u03B5\u03B3\u03AC\u03BB\u03B7 \u0395\u03B2\u03B4\u03BF\u03BC\u03AC\u03B4\u03B1 / \u03A0\u03AC\u03C3\u03C7\u03B1", description: "Palm Sunday through the glorious Resurrection.", season: "Holy Week/Easter", week_start: 26, week_end: 29 },
  { unit_number: 8, title: "The Early Church", title_native_hy: "\u054D\u056F\u0566\u0562\u0576\u0561\u056F\u0561\u0576 \u0535\u056F\u0565\u0572\u0565\u0581\u056B\u0576", title_native_el: "\u0397 \u03A0\u03C1\u03CE\u03C4\u03B7 \u0395\u03BA\u03BA\u03BB\u03B7\u03C3\u03AF\u03B1", description: "Ascension, Pentecost, and the spread of Christianity.", season: "Paschal", week_start: 30, week_end: 33 },
  { unit_number: 9, title: "Summer Celebrations", title_native_hy: "\u0531\u0574\u0561\u057C\u0576\u0561\u0575\u056B\u0576 \u054F\u0578\u0576\u0565\u0580", title_native_el: "\u039A\u03B1\u03BB\u03BF\u03BA\u03B1\u03B9\u03C1\u03B9\u03BD\u03AD\u03C2 \u0393\u03B9\u03BF\u03C1\u03C4\u03AD\u03C2", description: "Transfiguration, the Theotokos, and year-end celebration.", season: "Summer", week_start: 34, week_end: 36 },
];

// ── LESSON CONTENT GENERATORS ────────────────────────────────

function makeOpening(native: string, translit: string, english: string, instructions: string) {
  return { prayer_native: native, prayer_transliteration: translit, prayer_english: english, instructions };
}

function makeStory(script: string, phrases: { native: string; transliteration: string; english: string }[]) {
  return { teacher_script: script, key_phrases: phrases };
}

function makeVocab(words: { word_native: string; word_transliteration: string; word_english: string; usage_example: string }[]) {
  return words;
}

function makeActivity(type: "discussion" | "game" | "craft", instructions: string, questions: string[]) {
  return { type, instructions, questions };
}

function makeClosing(native: string, translit: string, english: string) {
  return { prayer_native: native, prayer_transliteration: translit, prayer_english: english };
}

// ── ARMENIAN COMMON PRAYERS ──────────────────────────────────

const HY_OPENING = makeOpening(
  "\u0540\u0561\u0575\u0580 \u0544\u0565\u0580, \u0578\u0580 \u0575\u0565\u0580\u056F\u056B\u0576\u0584\u0576 \u0565\u057D, \u0585\u0580\u0570\u0576\u0565\u0561\u0301 \u0566\u0574\u0565\u0566.",
  "Hayr Mer, vor yergink yes, orhnyal zmez.",
  "Our Father who art in heaven, bless us.",
  "Read the prayer aloud slowly. Have the children repeat each line after you."
);
const HY_CLOSING = makeClosing(
  "\u0553\u0561\u057C\u0584 \u0584\u0565\u0566, \u054F\u0567\u0580, \u0561\u0574\u0567\u0576.",
  "Park kez, Der, amen.",
  "Glory to you, Lord, amen."
);

// ── GREEK COMMON PRAYERS ─────────────────────────────────────

const EL_OPENING = makeOpening(
  "\u03A0\u03AC\u03C4\u03B5\u03C1 \u03B7\u03BC\u03CE\u03BD, \u03BF \u03B5\u03BD \u03C4\u03BF\u03B9\u03C2 \u03BF\u03C5\u03C1\u03B1\u03BD\u03BF\u03AF\u03C2.",
  "Pater imon, o en tis ouranis.",
  "Our Father, who art in heaven.",
  "Read the prayer aloud slowly. Have the children repeat each line after you."
);
const EL_CLOSING = makeClosing(
  "\u0394\u03CC\u03BE\u03B1 \u03C3\u03BF\u03B9, \u039A\u03CD\u03C1\u03B9\u03B5. \u0391\u03BC\u03AE\u03BD.",
  "Doxa si, Kyrie. Amin.",
  "Glory to you, Lord. Amen."
);

// ── LESSON DEFINITIONS ───────────────────────────────────────
// Each function returns [hyLesson, elLesson]

interface LessonData {
  lesson_number: number;
  title: string;
  title_native: string;
  opening: ReturnType<typeof makeOpening>;
  story: ReturnType<typeof makeStory>;
  vocabulary: ReturnType<typeof makeVocab>;
  activity: ReturnType<typeof makeActivity>;
  closing: ReturnType<typeof makeClosing>;
  liturgical_themes: string[];
  age_notes: string;
}

function genLesson(num: number, locale: "hy" | "el"): LessonData {
  const isHy = locale === "hy";
  const opening = isHy ? HY_OPENING : EL_OPENING;
  const closing = isHy ? HY_CLOSING : EL_CLOSING;
  const ageNote = "For younger children (5-6), focus on the vocabulary cards and coloring. For older children (8-10), engage with the discussion questions.";

  switch (num) {
    // ── UNIT 1: Fall / Holy Cross ──
    case 1: return {
      lesson_number: 1,
      title: "Welcome to Sunday School",
      title_native: isHy ? "\u0532\u0561\u0580\u056B \u0563\u0561\u056C\u0578\u0582\u057D\u057F \u056F\u056B\u0580\u0561\u056F\u056B \u0564\u057A\u0580\u0578\u0581" : "\u039A\u03B1\u03BB\u03CE\u03C2 \u03AE\u03C1\u03B8\u03B1\u03C4\u03B5 \u03C3\u03C4\u03BF \u039A\u03B1\u03C4\u03B7\u03C7\u03B7\u03C4\u03B9\u03BA\u03CC",
      opening, closing,
      story: makeStory(
        isHy
          ? "Welcome to Sunday School! This is a special place where we come together every Sunday to learn about God, our faith, and our Armenian heritage. Just like your parents and grandparents did when they were your age, you will learn beautiful Armenian words, hear amazing stories, and make wonderful friends.\n\nLook around you — this is your church. In Armenian, we call it \"yegeghetsee.\" It's a place where our community comes together to pray, celebrate, and take care of each other. Every Sunday, we'll start with a prayer, learn something new, and have fun together.\n\nWho can tell me something they love about coming to church?"
          : "Welcome to Sunday School! This is a special place where we come together every Sunday to learn about God, our faith, and our Greek heritage. Just like your parents and grandparents did, you will learn beautiful Greek words, hear amazing stories from our tradition, and make wonderful friends.\n\nLook around you — this is your church. In Greek, we call it \"ekklisia.\" It's a place where our community gathers to pray, celebrate, and take care of each other. Every Sunday, we'll start with a prayer, learn something new, and have fun together.\n\nWho can tell me something they love about coming to church?",
        isHy
          ? [{ native: "\u0535\u056F\u0565\u0572\u0565\u0581\u056B", transliteration: "Yegeghetsee", english: "Church" }, { native: "\u0532\u0561\u0580\u0587 \u0565\u056F\u0561\u0584", transliteration: "Parev yegak", english: "Hello, welcome" }, { native: "\u0531\u0572\u0578\u0569\u0584", transliteration: "Aghotk", english: "Prayer" }]
          : [{ native: "\u0395\u03BA\u03BA\u03BB\u03B7\u03C3\u03AF\u03B1", transliteration: "Ekklisia", english: "Church" }, { native: "\u039A\u03B1\u03BB\u03CE\u03C2 \u03AE\u03C1\u03B8\u03B1\u03C4\u03B5", transliteration: "Kalos irthate", english: "Welcome" }, { native: "\u03A0\u03C1\u03BF\u03C3\u03B5\u03C5\u03C7\u03AE", transliteration: "Prosefchi", english: "Prayer" }]
      ),
      vocabulary: makeVocab(isHy
        ? [{ word_native: "\u0535\u056F\u0565\u0572\u0565\u0581\u056B", word_transliteration: "Yegeghetsee", word_english: "Church", usage_example: "We go to the yegeghetsee on Sunday." }, { word_native: "\u0531\u057D\u057F\u0578\u0582\u0561\u056E", word_transliteration: "Asdvadz", word_english: "God", usage_example: "We pray to Asdvadz every day." }, { word_native: "\u054D\u0567\u0580", word_transliteration: "Ser", word_english: "Love", usage_example: "God's ser is everywhere." }]
        : [{ word_native: "\u0395\u03BA\u03BA\u03BB\u03B7\u03C3\u03AF\u03B1", word_transliteration: "Ekklisia", word_english: "Church", usage_example: "We go to the ekklisia on Sunday." }, { word_native: "\u0398\u03B5\u03CC\u03C2", word_transliteration: "Theos", word_english: "God", usage_example: "We pray to Theos every day." }, { word_native: "\u0391\u03B3\u03AC\u03C0\u03B7", word_transliteration: "Agapi", word_english: "Love", usage_example: "God's agapi is everywhere." }]
      ),
      activity: makeActivity("discussion", "Sit in a circle. Ask each child to introduce themselves and share one thing they want to learn this year.", ["What is your name?", "What is your favorite thing about church?", "What do you want to learn in Sunday School?"]),
      liturgical_themes: ["church_building", "prayer"],
      age_notes: ageNote,
    };

    case 2: return {
      lesson_number: 2,
      title: isHy ? "The Feast of the Holy Cross" : "The Feast of the Holy Cross",
      title_native: isHy ? "\u054D\u0578\u0582\u0580\u0562 \u053D\u0561\u0579\u056B \u057F\u0578\u0576" : "\u0397 \u03B3\u03B9\u03BF\u03C1\u03C4\u03AE \u03C4\u03BF\u03C5 \u03A4\u03B9\u03BC\u03AF\u03BF\u03C5 \u03A3\u03C4\u03B1\u03C5\u03C1\u03BF\u03CD",
      opening, closing,
      story: makeStory(
        isHy
          ? "A long, long time ago, a queen named Helena went on a very special journey. She traveled far across the sea to find the most important cross in the world — the cross where Jesus showed his love for everyone.\n\nShe searched and searched until she found it! When she held it up, people were so happy. They lit big fires on the mountaintops to spread the news from village to village. That's why Armenians celebrate the Holy Cross with special church services.\n\nThe cross reminds us of Jesus's love. In Armenian, we call the cross \"khach.\" Can everyone say \"khach\" together?"
          : "A long, long time ago, Empress Helena went on a very special journey to the Holy Land. She traveled far to find the most important cross in the world — the True Cross where Jesus showed his love for everyone.\n\nShe searched and searched in Jerusalem until she found it! When she held it up, people were filled with joy. The church celebrates this discovery every September.\n\nThe cross reminds us of Jesus's love. In Greek, we call the cross \"stavros.\" Can everyone say \"stavros\" together?",
        isHy
          ? [{ native: "\u053D\u0561\u0579", transliteration: "Khach", english: "Cross" }, { native: "\u054D\u0567\u0580", transliteration: "Ser", english: "Love" }, { native: "\u054F\u0578\u0576", transliteration: "Don", english: "Feast/Holiday" }]
          : [{ native: "\u03A3\u03C4\u03B1\u03C5\u03C1\u03CC\u03C2", transliteration: "Stavros", english: "Cross" }, { native: "\u0391\u03B3\u03AC\u03C0\u03B7", transliteration: "Agapi", english: "Love" }, { native: "\u0393\u03B9\u03BF\u03C1\u03C4\u03AE", transliteration: "Yiorti", english: "Feast/Holiday" }]
      ),
      vocabulary: makeVocab(isHy
        ? [{ word_native: "\u053D\u0561\u0579", word_transliteration: "Khach", word_english: "Cross", usage_example: "We make the sign of the khach before we pray." }, { word_native: "\u054D\u0578\u0582\u0580\u0562", word_transliteration: "Soorp", word_english: "Holy/Saint", usage_example: "The Soorp Khach is a special feast." }, { word_native: "\u053D\u0578\u0582\u0576\u056F", word_transliteration: "Khoonk", word_english: "Incense", usage_example: "The beautiful smell of khoonk fills the church." }]
        : [{ word_native: "\u03A3\u03C4\u03B1\u03C5\u03C1\u03CC\u03C2", word_transliteration: "Stavros", word_english: "Cross", usage_example: "We make the sign of the stavros before we pray." }, { word_native: "\u0386\u03B3\u03B9\u03BF\u03C2", word_transliteration: "Agios", word_english: "Holy/Saint", usage_example: "The Agios Stavros is a special feast." }, { word_native: "\u039B\u03B9\u03B2\u03AC\u03BD\u03B9", word_transliteration: "Livani", word_english: "Incense", usage_example: "The beautiful smell of livani fills the church." }]
      ),
      activity: makeActivity("craft", "Give each child paper and crayons. Have them draw and decorate a cross. While they work, practice saying the word for 'cross' in the heritage language.", ["What shape is a cross?", "Where do you see crosses in our church?"]),
      liturgical_themes: ["holy_cross", "feast"],
      age_notes: ageNote,
    };

    case 3: return {
      lesson_number: 3,
      title: "Our Church Building",
      title_native: isHy ? "\u0544\u0565\u0580 \u0565\u056F\u0565\u0572\u0565\u0581\u056B\u0576" : "\u0397 \u03B5\u03BA\u03BA\u03BB\u03B7\u03C3\u03AF\u03B1 \u03BC\u03B1\u03C2",
      opening, closing,
      story: makeStory(
        isHy
          ? "Today we're going to explore our beautiful church! Every Armenian church has special parts. Let's walk through them together.\n\nThe main area where we sit is called the \"navig.\" At the front, behind the curtain, is the most special place — the \"khoran\" (altar). That's where the priest stands during the holy service. Look up — can you see the dome? It represents heaven.\n\nOur church is like a home for our community. When we walk in, we make the sign of the cross and light a candle. These are ways we show respect."
          : "Today we're going to explore our beautiful church! Every Orthodox church has special parts. Let's walk through them together.\n\nThe main area where we sit is called the \"naos.\" At the front, behind the beautiful screen with icons, is the most special place — the \"iero\" (altar). That screen with all the paintings is called the \"ikonostasi.\" Look up — can you see the dome? It represents heaven.\n\nOur church is like a home for our community. When we walk in, we make the sign of the cross, kiss an icon, and light a candle.",
        isHy
          ? [{ native: "\u053D\u0578\u0580\u0561\u0576", transliteration: "Khoran", english: "Altar" }, { native: "\u0544\u0578\u0574", transliteration: "Mom", english: "Candle" }, { native: "\u0554\u0561\u0570\u0561\u0576\u0561", transliteration: "Kahana", english: "Priest" }]
          : [{ native: "\u039D\u03B1\u03CC\u03C2", transliteration: "Naos", english: "Nave (main area)" }, { native: "\u039A\u03B5\u03C1\u03AF", transliteration: "Keri", english: "Candle" }, { native: "\u0399\u03B5\u03C1\u03AD\u03B1\u03C2", transliteration: "Iereas", english: "Priest" }]
      ),
      vocabulary: makeVocab(isHy
        ? [{ word_native: "\u053D\u0578\u0580\u0561\u0576", word_transliteration: "Khoran", word_english: "Altar", usage_example: "The khoran is at the front of the church." }, { word_native: "\u0544\u0578\u0574", word_transliteration: "Mom", word_english: "Candle", usage_example: "We light a mom when we enter the church." }, { word_native: "\u0554\u0561\u0570\u0561\u0576\u0561", word_transliteration: "Kahana", word_english: "Priest", usage_example: "The kahana leads our prayers." }, { word_native: "\u054A\u0561\u057F\u056F\u0565\u0580", word_transliteration: "Badger", word_english: "Icon/Image", usage_example: "We see beautiful badger-ner on the walls." }]
        : [{ word_native: "\u039D\u03B1\u03CC\u03C2", word_transliteration: "Naos", word_english: "Nave", usage_example: "We sit in the naos during the service." }, { word_native: "\u039A\u03B5\u03C1\u03AF", word_transliteration: "Keri", word_english: "Candle", usage_example: "We light a keri when we enter the church." }, { word_native: "\u0399\u03B5\u03C1\u03AD\u03B1\u03C2", word_transliteration: "Iereas", word_english: "Priest", usage_example: "The iereas leads our prayers." }, { word_native: "\u0395\u03B9\u03BA\u03CC\u03BD\u03B1", word_transliteration: "Ikona", word_english: "Icon", usage_example: "We kiss the ikona when we enter." }]
      ),
      activity: makeActivity("game", "Church Scavenger Hunt! Give each child a simple checklist: find the altar, find a candle, find an icon/painting, find the cross. Walk through the church together and check off each item.", ["What is the most special part of our church?", "What do we do when we first walk into church?"]),
      liturgical_themes: ["church_building"],
      age_notes: ageNote,
    };

    case 4: return {
      lesson_number: 4,
      title: "How We Pray",
      title_native: isHy ? "\u053B\u0576\u0579\u057A\u0567\u057D \u056F\u0561\u0572\u0578\u0569\u0565\u0576\u0584" : "\u03A0\u03CE\u03C2 \u03C0\u03C1\u03BF\u03C3\u03B5\u03C5\u03C7\u03CC\u03BC\u03B1\u03C3\u03C4\u03B5",
      opening, closing,
      story: makeStory(
        isHy
          ? "Prayer is how we talk to God. We can pray anytime — when we're happy, when we're scared, when we're thankful, or when we need help. God always listens!\n\nIn our Armenian tradition, we have a special way to start praying. First, we stand up straight and fold our hands. Then we make the sign of the cross — touching our forehead, our chest, our left shoulder, and our right shoulder. As we do this, we say \"Hanoon Hor, yev Vortvo, yev Hokvooyn Surpo\" — \"In the name of the Father, and of the Son, and of the Holy Spirit.\"\n\nLet's practice together! Everyone stand up and follow me."
          : "Prayer is how we talk to God. We can pray anytime — when we're happy, when we're scared, when we're thankful, or when we need help. God always listens!\n\nIn our Orthodox tradition, we have a special way to start praying. First, we stand up straight. Then we make the sign of the cross — we put our thumb, index, and middle fingers together and touch our forehead, our chest, our right shoulder, and our left shoulder. As we do this, we say \"Is to onoma tou Patros, ke tou Yiou, ke tou Agiou Pnevmatos\" — \"In the name of the Father, and of the Son, and of the Holy Spirit.\"\n\nLet's practice together! Everyone stand up and follow me.",
        isHy
          ? [{ native: "\u0531\u0572\u0578\u0569\u0584", transliteration: "Aghotk", english: "Prayer" }, { native: "\u053D\u0561\u0579\u0561\u056F\u0576\u0584\u0565\u056C", transliteration: "Khachagnkel", english: "To make the sign of the cross" }, { native: "\u0540\u0561\u0576\u0578\u0582\u0576 \u0540\u0578\u0580", transliteration: "Hanoon Hor", english: "In the name of the Father" }]
          : [{ native: "\u03A0\u03C1\u03BF\u03C3\u03B5\u03C5\u03C7\u03AE", transliteration: "Prosefchi", english: "Prayer" }, { native: "\u03A3\u03C4\u03B1\u03C5\u03C1\u03CC\u03C2", transliteration: "Stavros", english: "Cross (sign of)" }, { native: "\u0391\u03BC\u03AE\u03BD", transliteration: "Amin", english: "Amen" }]
      ),
      vocabulary: makeVocab(isHy
        ? [{ word_native: "\u0531\u0572\u0578\u0569\u0584", word_transliteration: "Aghotk", word_english: "Prayer", usage_example: "We say an aghotk before we eat." }, { word_native: "\u0531\u0574\u0567\u0576", word_transliteration: "Amen", word_english: "Amen", usage_example: "We say amen at the end of every prayer." }, { word_native: "\u0540\u0561\u0575\u0580 \u0544\u0565\u0580", word_transliteration: "Hayr Mer", word_english: "Our Father", usage_example: "The Hayr Mer is the prayer Jesus taught us." }]
        : [{ word_native: "\u03A0\u03C1\u03BF\u03C3\u03B5\u03C5\u03C7\u03AE", word_transliteration: "Prosefchi", word_english: "Prayer", usage_example: "We say a prosefchi before we eat." }, { word_native: "\u0391\u03BC\u03AE\u03BD", word_transliteration: "Amin", word_english: "Amen", usage_example: "We say amin at the end of every prayer." }, { word_native: "\u03A0\u03AC\u03C4\u03B5\u03C1 \u0397\u03BC\u03CE\u03BD", word_transliteration: "Pater Imon", word_english: "Our Father", usage_example: "The Pater Imon is the prayer Jesus taught us." }]
      ),
      activity: makeActivity("game", "Prayer Practice Relay! Line up two teams. Each child runs to the front, makes the sign of the cross correctly, says 'Amen,' and runs back. First team to finish wins!", ["When is a good time to pray?", "Can you pray when you're not in church?", "What do you want to tell God today?"]),
      liturgical_themes: ["prayer"],
      age_notes: ageNote,
    };

    // ── UNIT 2: Saints & Heroes ──
    case 5: return {
      lesson_number: 5,
      title: isHy ? "St. Gregory the Illuminator" : "St. Demetrios",
      title_native: isHy ? "\u054D\u0578\u0582\u0580\u0562 \u0533\u0580\u056B\u0563\u0578\u0580 \u053C\u0578\u0582\u057D\u0561\u0582\u0578\u0580\u056B\u0579" : "\u0386\u03B3\u03B9\u03BF\u03C2 \u0394\u03B7\u03BC\u03AE\u03C4\u03C1\u03B9\u03BF\u03C2",
      opening, closing,
      story: makeStory(
        isHy
          ? "Today we'll learn about the most important saint in Armenian history — St. Gregory the Illuminator, or \"Soorp Krikor Loosavorich.\"\n\nA long time ago, the king of Armenia, named Tiridates, did not believe in God. He put Gregory in a deep, dark pit for 13 years! But Gregory never stopped praying. When the king became very sick, only Gregory could heal him through prayer.\n\nThe king was so amazed that he decided to follow Jesus. In the year 301, Armenia became the very first country in the whole world to become Christian! Gregory built churches all across the land and taught everyone about God's love. That's why we call him the \"Illuminator\" — he brought the light of faith to Armenia."
          : "Today we'll learn about one of the most beloved saints in Greece — Agios Dimitrios, the patron saint of Thessaloniki.\n\nDimitrios was a brave soldier who lived a long time ago. Even though it was dangerous, he taught people about Jesus. The emperor didn't like this and put Dimitrios in prison. But Dimitrios kept teaching and helping others, even from his prison cell.\n\nThe people of Thessaloniki loved Dimitrios so much that they built a beautiful church in his honor. Every year on October 26, Greeks celebrate his feast day. He reminds us to be brave and to always share God's love, even when it's hard.",
        isHy
          ? [{ native: "\u053C\u0578\u0582\u057D\u0561\u0582\u0578\u0580\u056B\u0579", transliteration: "Loosavorich", english: "Illuminator (bringer of light)" }, { native: "\u053C\u0578\u0575\u057D", transliteration: "Louys", english: "Light" }, { native: "\u0540\u0561\u0582\u0561\u057F\u0584", transliteration: "Havadk", english: "Faith" }]
          : [{ native: "\u0386\u03B3\u03B9\u03BF\u03C2", transliteration: "Agios", english: "Saint" }, { native: "\u0398\u03AC\u03C1\u03C1\u03BF\u03C2", transliteration: "Tharros", english: "Courage" }, { native: "\u03A0\u03AF\u03C3\u03C4\u03B7", transliteration: "Pisti", english: "Faith" }]
      ),
      vocabulary: makeVocab(isHy
        ? [{ word_native: "\u054D\u0578\u0582\u0580\u0562", word_transliteration: "Soorp", word_english: "Saint", usage_example: "Soorp Krikor brought light to Armenia." }, { word_native: "\u053C\u0578\u0582\u057D", word_transliteration: "Louys", word_english: "Light", usage_example: "Gregory brought the louys of faith." }, { word_native: "\u0540\u0561\u0582\u0561\u057F\u0584", word_transliteration: "Havadk", word_english: "Faith", usage_example: "Our havadk makes us strong." }]
        : [{ word_native: "\u0386\u03B3\u03B9\u03BF\u03C2", word_transliteration: "Agios", word_english: "Saint", usage_example: "Agios Dimitrios was very brave." }, { word_native: "\u0398\u03AC\u03C1\u03C1\u03BF\u03C2", word_transliteration: "Tharros", word_english: "Courage", usage_example: "We need tharros to do the right thing." }, { word_native: "\u03A0\u03AF\u03C3\u03C4\u03B7", word_transliteration: "Pisti", word_english: "Faith", usage_example: "Our pisti in God makes us strong." }]
      ),
      activity: makeActivity("craft", isHy ? "Draw St. Gregory holding a torch or a cross. Write the word 'Louys' (Light) on your drawing." : "Draw St. Demetrios as a brave soldier with a shield and cross. Write 'Agios Dimitrios' on your drawing.", ["What made this saint brave?", "How can we be brave in our own lives?"]),
      liturgical_themes: ["saint"],
      age_notes: ageNote,
    };

    // ── For remaining lessons, generate structured content ──
    default: return generateGenericLesson(num, locale, opening, closing, ageNote);
  }
}

function generateGenericLesson(num: number, locale: "hy" | "el", opening: ReturnType<typeof makeOpening>, closing: ReturnType<typeof makeClosing>, ageNote: string): LessonData {
  const isHy = locale === "hy";

  // Lesson metadata by number
  const LESSON_META: Record<number, { title: string; title_hy: string; title_el: string; themes: string[]; storyHy: string; storyEl: string; phrasesHy: { native: string; transliteration: string; english: string }[]; phrasesEl: { native: string; transliteration: string; english: string }[]; vocabHy: { word_native: string; word_transliteration: string; word_english: string; usage_example: string }[]; vocabEl: { word_native: string; word_transliteration: string; word_english: string; usage_example: string }[]; actType: "discussion" | "game" | "craft"; actInstr: string; actQuestions: string[] }> = {
    6: { title: isHy ? "Mesrop Mashtots & the Alphabet" : "St. Nicholas", title_hy: "\u0544\u0565\u057D\u0580\u0578\u057A \u0544\u0561\u0577\u057F\u0578\u0581", title_el: "\u0386\u03B3\u03B9\u03BF\u03C2 \u039D\u03B9\u03BA\u03CC\u03BB\u03B1\u03BF\u03C2", themes: ["saint"], storyHy: "Long ago, Armenians didn't have their own alphabet. A monk named Mesrop Mashtots prayed to God for help. God inspired him, and in the year 405, Mesrop created the Armenian alphabet — 36 beautiful letters! The very first sentence he wrote was: \"To know wisdom and instruction, to understand words of insight.\" Thanks to Mesrop, we can read the Bible, write poetry, and keep our language alive. Every Armenian letter is a gift from God.", storyEl: "St. Nicholas was a bishop who lived in a town called Myra. He loved to help people, especially children and the poor. One famous story tells how he secretly left gold coins in the shoes of three poor girls so they could have a happy life. He was so kind that people all over the world remember him. In Greece, we celebrate his feast day on December 6. He reminds us that the greatest gift we can give is kindness.", phrasesHy: [{ native: "\u0531\u0575\u0562\u0578\u0582\u0562\u0565\u0576", transliteration: "Aypoopen", english: "Alphabet" }, { native: "\u0533\u056B\u0580\u0584", transliteration: "Kirk", english: "Book" }], phrasesEl: [{ native: "\u039A\u03B1\u03BB\u03BF\u03C3\u03CD\u03BD\u03B7", transliteration: "Kalosini", english: "Kindness" }, { native: "\u0394\u03CE\u03C1\u03BF", transliteration: "Doro", english: "Gift" }], vocabHy: [{ word_native: "\u0531\u0575\u0562\u0578\u0582\u0562\u0565\u0576", word_transliteration: "Aypoopen", word_english: "Alphabet", usage_example: "The Armenian aypoopen has 38 letters." }, { word_native: "\u0533\u056B\u0580\u0584", word_transliteration: "Kirk", word_english: "Book", usage_example: "We read from the soorp kirk in church." }, { word_native: "\u054F\u0561\u057C", word_transliteration: "Dar", word_english: "Letter (of alphabet)", usage_example: "Each dar has a beautiful shape." }], vocabEl: [{ word_native: "\u039A\u03B1\u03BB\u03BF\u03C3\u03CD\u03BD\u03B7", word_transliteration: "Kalosini", word_english: "Kindness", usage_example: "St. Nicholas was full of kalosini." }, { word_native: "\u0394\u03CE\u03C1\u03BF", word_transliteration: "Doro", word_english: "Gift", usage_example: "A doro from the heart is the best gift." }, { word_native: "\u0395\u03C0\u03AF\u03C3\u03BA\u03BF\u03C0\u03BF\u03C2", word_transliteration: "Episkopos", word_english: "Bishop", usage_example: "St. Nicholas was an episkopos." }], actType: "craft", actInstr: isHy ? "Practice writing Armenian letters on paper. Start with the first letter, Ayp (\u0531). Decorate it with colors." : "Draw a picture of St. Nicholas giving gifts. Write 'Kalosini' (Kindness) at the top.", actQuestions: ["Why is it important to have our own alphabet/help others?", "How can we show kindness today?"] },
    7: { title: isHy ? "Vartan Mamigonian" : "St. George", title_hy: "\u054E\u0561\u0580\u0564\u0561\u0576 \u0544\u0561\u0574\u056B\u056F\u0578\u0576\u0565\u0561\u0576", title_el: "\u0386\u03B3\u03B9\u03BF\u03C2 \u0393\u03B5\u03CE\u03C1\u03B3\u03B9\u03BF\u03C2", themes: ["saint"], storyHy: "Vartan Mamigonian was a brave Armenian general. A powerful king wanted all Armenians to give up their Christian faith. Vartan said: \"From our faith, no one can shake us — not angels, not men, not fire, not sword!\" He led his soldiers into the Battle of Avarayr in 451 to protect the right of Armenians to worship God. Even though Vartan died in battle, his bravery saved the Armenian faith forever. Today, we remember him as a hero who chose faith over everything.", storyEl: "St. George was a brave soldier who lived long ago. He was known for his incredible courage. The most famous story about him tells how he fought and defeated a dragon that was terrorizing a village! But the dragon really represents evil and fear. George showed that with faith in God, we can overcome anything that scares us. He is one of the most loved saints in all of Greece.", phrasesHy: [{ native: "\u0554\u0561\u057B\u0578\u0582\u0569\u056B\u0582\u0576", transliteration: "Kajootyoon", english: "Courage" }, { native: "\u0546\u0561\u0570\u0561\u057F\u0561\u056F", transliteration: "Nahadak", english: "Martyr" }], phrasesEl: [{ native: "\u0398\u03AC\u03C1\u03C1\u03BF\u03C2", transliteration: "Tharros", english: "Courage" }, { native: "\u039D\u03AF\u03BA\u03B7", transliteration: "Niki", english: "Victory" }], vocabHy: [{ word_native: "\u0554\u0561\u057B", word_transliteration: "Kaj", word_english: "Brave", usage_example: "Vartan was a kaj leader." }, { word_native: "\u0540\u0561\u0582\u0561\u057F\u0584", word_transliteration: "Havadk", word_english: "Faith", usage_example: "Our havadk gives us strength." }, { word_native: "\u0540\u0565\u0580\u0578\u057D", word_transliteration: "Heros", word_english: "Hero", usage_example: "Vartan is an Armenian heros." }], vocabEl: [{ word_native: "\u0398\u03AC\u03C1\u03C1\u03BF\u03C2", word_transliteration: "Tharros", word_english: "Courage", usage_example: "St. George had great tharros." }, { word_native: "\u039D\u03AF\u03BA\u03B7", word_transliteration: "Niki", word_english: "Victory", usage_example: "Good always wins the niki over evil." }, { word_native: "\u0389\u03C1\u03C9\u03B1\u03C2", word_transliteration: "Iroas", word_english: "Hero", usage_example: "St. George is an iroas of our faith." }], actType: "game", actInstr: "Shield of Faith Game: Give each child a paper plate. On one side, they draw a cross. On the other, they write or draw what makes them brave. Hold up your 'shield' when the teacher calls out something scary — the shield protects you!", actQuestions: ["What made Vartan/George brave?", "What are you brave about?", "How does faith help when we're scared?"] },
    8: { title: isHy ? "St. Hripsime" : "St. Kosmas Aitolos", title_hy: "\u054D\u0578\u0582\u0580\u0562 \u0540\u0560\u056B\u0583\u057D\u056B\u0574\u0567", title_el: "\u0386\u03B3\u03B9\u03BF\u03C2 \u039A\u03BF\u03C3\u03BC\u03AC\u03C2 \u03BF \u0391\u03B9\u03C4\u03C9\u03BB\u03CC\u03C2", themes: ["saint"], storyHy: "St. Hripsime was a young woman who was brave and faithful. She traveled with a group of nuns to Armenia to serve God. Even when a powerful king tried to force her to give up her faith, she refused. She chose God's love over everything. Armenians honor her memory because she showed that true strength comes from faith, not from power. The beautiful church of St. Hripsime in Echmiadzin is one of the oldest churches in the world.", storyEl: "St. Kosmas Aitolos was a monk who loved to teach. He traveled all across Greece, walking from village to village, teaching people to read, write, and learn about their faith. He opened over 200 schools! He believed that education was the key to keeping the Greek language and Orthodox faith alive. He reminds us that learning and sharing knowledge is a way to serve God and our community.", phrasesHy: [{ native: "\u0540\u0561\u0574\u0562\u0565\u0580\u0578\u0582\u0569\u056B\u0582\u0576", transliteration: "Hamperootyoon", english: "Patience" }, { native: "\u053E\u0561\u057C\u0561\u0575\u0578\u0582\u0569\u056B\u0582\u0576", transliteration: "Dzarayootyoon", english: "Service" }], phrasesEl: [{ native: "\u039C\u03CC\u03C1\u03C6\u03C9\u03C3\u03B7", transliteration: "Morfosi", english: "Education" }, { native: "\u0394\u03B9\u03B4\u03B1\u03C3\u03BA\u03B1\u03BB\u03AF\u03B1", transliteration: "Didaskalia", english: "Teaching" }], vocabHy: [{ word_native: "\u0540\u0561\u0574\u0562\u0565\u0580\u0578\u0582\u0569\u056B\u0582\u0576", word_transliteration: "Hamperootyoon", word_english: "Patience", usage_example: "St. Hripsime showed great hamperootyoon." }, { word_native: "\u053E\u0561\u057C\u0561\u0575\u0565\u056C", word_transliteration: "Dzarayel", word_english: "To serve", usage_example: "We dzarayel God by helping others." }, { word_native: "\u0540\u0561\u0582\u0561\u057F\u0561\u0580\u056B\u0574", word_transliteration: "Havadareem", word_english: "I believe", usage_example: "Havadareem in God's love." }], vocabEl: [{ word_native: "\u039C\u03CC\u03C1\u03C6\u03C9\u03C3\u03B7", word_transliteration: "Morfosi", word_english: "Education", usage_example: "Kosmas believed in morfosi for everyone." }, { word_native: "\u03A3\u03C7\u03BF\u03BB\u03B5\u03AF\u03BF", word_transliteration: "Scholio", word_english: "School", usage_example: "He opened over 200 scholio across Greece." }, { word_native: "\u0394\u03B9\u03B4\u03AC\u03C3\u03BA\u03B1\u03BB\u03BF\u03C2", word_transliteration: "Didaskalos", word_english: "Teacher", usage_example: "Kosmas was a great didaskalos." }], actType: "discussion", actInstr: "Sit in a circle. Ask each child: What is something you're really good at? How can you use that to help others?", actQuestions: ["What did this saint teach us?", "How can we serve others at school or at home?", "What would you like to teach someone?"] },
  };

  // For lessons 9-36, generate from templates
  const REMAINING: Record<number, { title: string; titleHy: string; titleEl: string; themes: string[]; actType: "discussion" | "game" | "craft" }> = {
    9: { title: "Getting Ready for Christmas", titleHy: "\u054D\u0578\u0582\u0580\u0562 \u053E\u0576\u0578\u0582\u0576\u0564\u056B \u0576\u0561\u056D\u0561\u057A\u0561\u057F\u0580\u0561\u057D\u057F\u0578\u0582\u0569\u056B\u0582\u0576", titleEl: "\u03A0\u03C1\u03BF\u03B5\u03C4\u03BF\u03B9\u03BC\u03B1\u03C3\u03AF\u03B1 \u03B3\u03B9\u03B1 \u03C4\u03B1 \u03A7\u03C1\u03B9\u03C3\u03C4\u03BF\u03CD\u03B3\u03B5\u03BD\u03BD\u03B1", themes: ["nativity"], actType: "craft" },
    10: { title: "The Annunciation", titleHy: "\u0531\u0582\u0565\u057F\u056B\u057D", titleEl: "\u039F \u0395\u03C5\u03B1\u03B3\u03B3\u03B5\u03BB\u03B9\u03C3\u03BC\u03CC\u03C2", themes: ["nativity"], actType: "discussion" },
    11: { title: "The Journey to Bethlehem", titleHy: "\u0543\u0561\u0576\u0561\u057A\u0561\u0580\u0570\u0568 \u0564\u0567\u057A\u056B \u0532\u0565\u0569\u0572\u0565\u0570\u0567\u0574", titleEl: "\u03A4\u03BF \u03C4\u03B1\u03BE\u03AF\u03B4\u03B9 \u03C3\u03C4\u03B7 \u0392\u03B7\u03B8\u03BB\u03B5\u03AD\u03BC", themes: ["nativity"], actType: "game" },
    12: { title: "The Birth of Jesus", titleHy: "\u0545\u056B\u057D\u0578\u0582\u057D\u056B \u056E\u0576\u0578\u0582\u0576\u0564\u0568", titleEl: "\u0397 \u0393\u03AD\u03BD\u03BD\u03B7\u03C3\u03B7 \u03C4\u03BF\u03C5 \u0399\u03B7\u03C3\u03BF\u03CD", themes: ["nativity"], actType: "craft" },
    13: { title: isHy ? "Armenian Christmas Traditions" : "Greek Christmas Traditions", titleHy: "\u0540\u0561\u0575\u056F\u0561\u056F\u0561\u0576 \u053E\u0576\u0578\u0582\u0576\u0564\u056B \u0561\u0582\u0561\u0576\u0564\u0578\u0582\u0575\u0569\u0576\u0565\u0580", titleEl: "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AD\u03C2 \u03A7\u03C1\u03B9\u03C3\u03C4\u03BF\u03C5\u03B3\u03B5\u03BD\u03BD\u03B9\u03AC\u03C4\u03B9\u03BA\u03B5\u03C2 \u03C0\u03B1\u03C1\u03B1\u03B4\u03CC\u03C3\u03B5\u03B9\u03C2", themes: ["nativity", "feast"], actType: "game" },
    14: { title: "The Baptism of Jesus", titleHy: "\u0545\u056B\u057D\u0578\u0582\u057D\u056B \u0544\u056F\u0580\u057F\u0578\u0582\u0569\u056B\u0582\u0576\u0568", titleEl: "\u0397 \u0392\u03AC\u03C0\u03C4\u03B9\u03C3\u03B7 \u03C4\u03BF\u03C5 \u0399\u03B7\u03C3\u03BF\u03CD", themes: ["epiphany"], actType: "discussion" },
    15: { title: isHy ? "Blessing of Water" : "Great Blessing of Waters", titleHy: "\u054B\u0580\u0585\u0580\u0570\u0576\u0567\u0584", titleEl: "\u039C\u03B5\u03B3\u03AC\u03BB\u03BF\u03C2 \u0391\u03B3\u03B9\u03B1\u03C3\u03BC\u03CC\u03C2", themes: ["epiphany", "feast"], actType: "craft" },
    16: { title: "Light of the World", titleHy: "\u053C\u0578\u0582\u057D \u0561\u0577\u056D\u0561\u0580\u0570\u056B", titleEl: "\u03A4\u03BF \u03A6\u03C9\u03C2 \u03C4\u03BF\u03C5 \u039A\u03CC\u03C3\u03BC\u03BF\u03C5", themes: ["epiphany"], actType: "game" },
    17: { title: isHy ? "Paregentan" : "Apokries", titleHy: "\u0532\u0561\u0580\u0565\u056F\u0565\u0576\u0564\u0561\u0576", titleEl: "\u0391\u03C0\u03CC\u03BA\u03C1\u03B9\u03B5\u03C2", themes: ["feast"], actType: "game" },
    18: { title: "Forgiveness", titleHy: "\u0546\u0565\u0580\u0578\u0572\u0578\u0582\u0569\u056B\u0582\u0576", titleEl: "\u03A3\u03C5\u03B3\u03C7\u03CE\u03C1\u03B5\u03C3\u03B7", themes: ["forgiveness"], actType: "discussion" },
    19: { title: "What is Fasting?", titleHy: "\u053B\u0576\u0579 \u0567 \u057A\u0561\u0570\u0584\u0568", titleEl: "\u03A4\u03B9 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03B7 \u03BD\u03B7\u03C3\u03C4\u03B5\u03AF\u03B1;", themes: ["lent"], actType: "craft" },
    20: { title: "The Prodigal Son", titleHy: "\u0531\u0576\u0561\u057C\u0561\u056F \u0578\u0580\u0564\u056B\u0576", titleEl: "\u039F \u0386\u03C3\u03C9\u03C4\u03BF\u03C2 \u03A5\u03B9\u03CC\u03C2", themes: ["parable", "lent", "forgiveness"], actType: "discussion" },
    21: { title: "The Good Samaritan", titleHy: "\u0532\u0561\u0580\u056B \u057D\u0561\u0574\u0561\u0580\u0561\u0581\u056B\u0576", titleEl: "\u039F \u039A\u03B1\u03BB\u03CC\u03C2 \u03A3\u03B1\u03BC\u03B1\u03C1\u03B5\u03AF\u03C4\u03B7\u03C2", themes: ["parable", "lent", "charity"], actType: "game" },
    22: { title: "The Sower and the Seeds", titleHy: "\u054D\u0565\u0580\u0574\u0561\u0576\u0578\u0572\u0568 \u0587 \u057D\u0565\u0580\u0574\u0565\u0580\u0568", titleEl: "\u039F \u03A3\u03C0\u03BF\u03C1\u03AD\u03B1\u03C2", themes: ["parable", "lent"], actType: "craft" },
    23: { title: "Prayer During Lent", titleHy: "\u0531\u0572\u0578\u0569\u0584 \u054A\u0561\u0570\u0584\u056B \u0568\u0576\u0569\u0561\u0581\u0584\u056B\u0576", titleEl: "\u03A0\u03C1\u03BF\u03C3\u03B5\u03C5\u03C7\u03AE \u03C3\u03C4\u03B7 \u03A3\u03B1\u03C1\u03B1\u03BA\u03BF\u03C3\u03C4\u03AE", themes: ["prayer", "lent"], actType: "discussion" },
    24: { title: "Giving and Sharing", titleHy: "\u054F\u0561\u056C \u0587 \u0562\u0561\u056A\u0576\u0565\u056C", titleEl: "\u039D\u03B1 \u03B4\u03AF\u03BD\u03BF\u03C5\u03BC\u03B5 \u03BA\u03B1\u03B9 \u03BD\u03B1 \u03BC\u03BF\u03B9\u03C1\u03B1\u03B6\u03CC\u03BC\u03B1\u03C3\u03C4\u03B5", themes: ["charity", "lent"], actType: "craft" },
    25: { title: "Getting Ready for Holy Week", titleHy: "\u0531\u0582\u0561\u0563 \u0547\u0561\u0562\u0561\u0569\u056B \u0576\u0561\u056D\u0561\u057A\u0561\u057F\u0580\u0561\u057D\u057F\u0578\u0582\u0569\u056B\u0582\u0576", titleEl: "\u03A0\u03C1\u03BF\u03B5\u03C4\u03BF\u03B9\u03BC\u03B1\u03C3\u03AF\u03B1 \u03B3\u03B9\u03B1 \u03C4\u03B7 \u039C\u03B5\u03B3\u03AC\u03BB\u03B7 \u0395\u03B2\u03B4\u03BF\u03BC\u03AC\u03B4\u03B1", themes: ["lent", "holy_week"], actType: "discussion" },
    26: { title: "Palm Sunday", titleHy: "\u053E\u0561\u0572\u056F\u0561\u0566\u0561\u0580\u0564", titleEl: "\u039A\u03C5\u03C1\u03B9\u03B1\u03BA\u03AE \u03C4\u03C9\u03BD \u0392\u03B1\u0390\u03C9\u03BD", themes: ["holy_week"], actType: "craft" },
    27: { title: "The Last Supper", titleHy: "\u054E\u0565\u0580\u057B\u056B\u0576 \u0568\u0576\u0569\u0580\u056B\u0584\u0568", titleEl: "\u039F \u039C\u03C5\u03C3\u03C4\u03B9\u03BA\u03CC\u03C2 \u0394\u03B5\u03AF\u03C0\u03BD\u03BF\u03C2", themes: ["holy_week"], actType: "discussion" },
    28: { title: "Good Friday", titleHy: "\u0531\u0582\u0561\u0563 \u0548\u0582\u0580\u0562\u0561\u0569", titleEl: "\u039C\u03B5\u03B3\u03AC\u03BB\u03B7 \u03A0\u03B1\u03C1\u03B1\u03C3\u03BA\u03B5\u03C5\u03AE", themes: ["holy_week"], actType: "craft" },
    29: { title: "The Resurrection!", titleHy: "\u0540\u0561\u0580\u0578\u0582\u0569\u056B\u0582\u0576\u0568", titleEl: "\u0397 \u0391\u03BD\u03AC\u03C3\u03C4\u03B1\u03C3\u03B7!", themes: ["pascha"], actType: "game" },
    30: { title: "The Ascension", titleHy: "\u0540\u0561\u0574\u0562\u0561\u0580\u0571\u0578\u0582\u0574\u0568", titleEl: "\u0397 \u0391\u03BD\u03AC\u03BB\u03B7\u03C8\u03B7", themes: ["feast"], actType: "discussion" },
    31: { title: "Pentecost", titleHy: "\u0540\u0578\u0563\u0565\u0563\u0561\u056C\u0578\u0582\u057D\u057F", titleEl: "\u03A0\u03B5\u03BD\u03C4\u03B7\u03BA\u03BF\u03C3\u03C4\u03AE", themes: ["pentecost"], actType: "craft" },
    32: { title: isHy ? "The First Armenian Christians" : "The Apostles", titleHy: "\u0531\u057C\u0561\u057B\u056B\u0576 \u0570\u0561\u0575 \u0584\u0580\u056B\u057D\u057F\u0578\u0576\u0565\u0561\u0576\u0565\u0580\u0568", titleEl: "\u039F\u03B9 \u0391\u03C0\u03CC\u03C3\u03C4\u03BF\u03BB\u03BF\u03B9", themes: ["saint"], actType: "game" },
    33: { title: "Our Church Today", titleHy: "\u0544\u0565\u0580 \u0565\u056F\u0565\u0572\u0565\u0581\u056B\u0576 \u0561\u0575\u057D\u0585\u0580", titleEl: "\u0397 \u0395\u03BA\u03BA\u03BB\u03B7\u03C3\u03AF\u03B1 \u03BC\u03B1\u03C2 \u03C3\u03AE\u03BC\u03B5\u03C1\u03B1", themes: ["church_building"], actType: "discussion" },
    34: { title: isHy ? "Vartavar" : "The Transfiguration", titleHy: "\u054E\u0561\u0580\u0564\u0561\u0580\u0561\u057C", titleEl: "\u0397 \u039C\u03B5\u03C4\u03B1\u03BC\u03CC\u03C1\u03C6\u03C9\u03C3\u03B7", themes: ["feast"], actType: "game" },
    35: { title: isHy ? "Assumption of Mary" : "Dormition of the Theotokos", titleHy: "\u054E\u0565\u0580\u0561\u0583\u0578\u056D\u0578\u0582\u0574\u0576 \u054D\u0578\u0582\u0580\u0562 \u0531\u057D\u057F\u0578\u0582\u0561\u056E\u0561\u056E\u0576\u056B", titleEl: "\u039A\u03BF\u03AF\u03BC\u03B7\u03C3\u03B7 \u03C4\u03B7\u03C2 \u0398\u03B5\u03BF\u03C4\u03CC\u03BA\u03BF\u03C5", themes: ["theotokos", "feast"], actType: "craft" },
    36: { title: "Year Review & Celebration", titleHy: "\u054F\u0561\u0580\u0565\u056F\u0561\u0577\u0580\u057B\u0561\u0576\u056B \u0561\u0574\u0583\u0578\u0583\u0578\u0582\u0574", titleEl: "\u0391\u03BD\u03B1\u03C3\u03BA\u03CC\u03C0\u03B7\u03C3\u03B7 \u03BA\u03B1\u03B9 \u0393\u03B9\u03BF\u03C1\u03C4\u03AE", themes: ["feast"], actType: "game" },
  };

  // Check detailed lessons first (6-8)
  if (LESSON_META[num]) {
    const m = LESSON_META[num];
    return {
      lesson_number: num,
      title: m.title,
      title_native: isHy ? m.title_hy : m.title_el,
      opening, closing,
      story: makeStory(isHy ? m.storyHy : m.storyEl, isHy ? m.phrasesHy : m.phrasesEl),
      vocabulary: makeVocab(isHy ? m.vocabHy : m.vocabEl),
      activity: makeActivity(m.actType, m.actInstr, m.actQuestions),
      liturgical_themes: m.themes,
      age_notes: ageNote,
    };
  }

  // Remaining lessons — generate minimal viable content
  const r = REMAINING[num];
  if (!r) {
    return {
      lesson_number: num,
      title: `Lesson ${num}`,
      title_native: "",
      opening, closing,
      story: makeStory("Content for this lesson is being prepared.", []),
      vocabulary: makeVocab([]),
      activity: makeActivity("discussion", "Discuss this week's theme with the class.", ["What did you learn today?", "How can you apply this at home?"]),
      liturgical_themes: [],
      age_notes: ageNote,
    };
  }

  return {
    lesson_number: num,
    title: r.title,
    title_native: isHy ? r.titleHy : r.titleEl,
    opening, closing,
    story: makeStory("Content for this lesson is being prepared. Check back soon for the full teacher script.", []),
    vocabulary: makeVocab([]),
    activity: makeActivity(r.actType, `${r.actType === "discussion" ? "Discuss" : r.actType === "game" ? "Play a game about" : "Create a craft about"} this week's theme: ${r.title}.`, ["What did you learn today?", "How can you share this with your family?"]),
    liturgical_themes: r.themes,
    age_notes: ageNote,
  };
}

// ── MAIN ─────────────────────────────────────────────────────

async function main() {
  console.log("\n\u26EA Sunday School Seeder\n");

  // Step 1: Insert units
  console.log("=== Seeding Units ===\n");

  // Clear existing data
  await db.from("sunday_lessons").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("sunday_units").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("  Cleared existing data\n");

  const unitIdMap: Record<string, Record<number, string>> = { hy: {}, el: {} };

  for (const locale of ["hy", "el"] as const) {
    for (const u of UNITS) {
      const { data, error } = await db.from("sunday_units").insert({
        locale,
        unit_number: u.unit_number,
        title: u.title,
        title_native: locale === "hy" ? u.title_native_hy : u.title_native_el,
        description: u.description,
        season: u.season,
        week_start: u.week_start,
        week_end: u.week_end,
      }).select("id").single();

      if (error) {
        console.error(`  \u274C Unit ${u.unit_number} (${locale}): ${error.message}`);
      } else {
        unitIdMap[locale][u.unit_number] = data.id;
        console.log(`  \u2705 Unit ${u.unit_number} (${locale}): ${u.title}`);
      }
    }
  }

  // Step 2: Insert lessons
  console.log("\n=== Seeding Lessons ===\n");

  let successCount = 0;
  let errorCount = 0;

  for (const locale of ["hy", "el"] as const) {
    for (let lessonNum = 1; lessonNum <= 36; lessonNum++) {
      // Find which unit this lesson belongs to
      const unit = UNITS.find((u) => lessonNum >= u.week_start && lessonNum <= u.week_end);
      if (!unit) { console.error(`  No unit for lesson ${lessonNum}`); errorCount++; continue; }

      const unitId = unitIdMap[locale][unit.unit_number];
      if (!unitId) { console.error(`  No unit ID for unit ${unit.unit_number} (${locale})`); errorCount++; continue; }

      const lesson = genLesson(lessonNum, locale);

      const { error } = await db.from("sunday_lessons").insert({
        locale,
        unit_id: unitId,
        lesson_number: lesson.lesson_number,
        title: lesson.title,
        title_native: lesson.title_native,
        opening: lesson.opening,
        story: lesson.story,
        vocabulary: lesson.vocabulary,
        activity: lesson.activity,
        closing: lesson.closing,
        liturgical_themes: lesson.liturgical_themes,
        age_notes: lesson.age_notes,
      });

      if (error) {
        console.error(`  \u274C Lesson ${lessonNum} (${locale}): ${error.message}`);
        errorCount++;
      } else {
        console.log(`  \u2705 Lesson ${lessonNum} (${locale}): ${lesson.title}`);
        successCount++;
      }
    }
  }

  // Step 3: Verify
  console.log("\n=== Verification ===\n");

  const { data: counts } = await db.from("sunday_lessons").select("locale").order("locale");
  const hyCt = (counts ?? []).filter((r) => r.locale === "hy").length;
  const elCt = (counts ?? []).filter((r) => r.locale === "el").length;
  console.log(`  Armenian lessons: ${hyCt}`);
  console.log(`  Greek lessons: ${elCt}`);

  const { data: lesson29 } = await db.from("sunday_lessons").select("title, locale, story").eq("lesson_number", 29);
  if (lesson29) {
    for (const l of lesson29) {
      const story = l.story as { key_phrases?: { native: string; transliteration: string }[] } | null;
      console.log(`  Lesson 29 (${l.locale}): ${l.title}`);
      if (story?.key_phrases?.[0]) {
        console.log(`    First phrase: ${story.key_phrases[0].native} (${story.key_phrases[0].transliteration})`);
      }
    }
  }

  console.log(`\n\u2728 Done! ${successCount} lessons seeded, ${errorCount} errors.\n`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
