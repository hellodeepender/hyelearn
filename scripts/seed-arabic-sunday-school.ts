/**
 * Seed Arabic (Maronite Catholic) Sunday School: 18 units, 72 lessons.
 * Usage: npx tsx scripts/seed-arabic-sunday-school.ts
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
  title_native: string;
  description: string;
  season: string;
  week_start: number;
  week_end: number;
}

const UNITS: UnitDef[] = [
  { unit_number: 1, title: "Feast of the Cross", title_native: "عيد الصليب", description: "Welcome to Sunday School. The Feast of the Holy Cross and our Maronite church.", season: "Fall", week_start: 1, week_end: 4 },
  { unit_number: 2, title: "Autumn Saints", title_native: "قدّيسو الخريف", description: "Saints who inspire our faith: St. Maroun, St. Charbel, and others.", season: "Fall", week_start: 5, week_end: 8 },
  { unit_number: 3, title: "Advent", title_native: "زمن المجيء", description: "Preparing our hearts for the birth of Christ.", season: "Advent", week_start: 9, week_end: 12 },
  { unit_number: 4, title: "Christmas", title_native: "عيد الميلاد", description: "Celebrating the birth of Jesus in Bethlehem.", season: "Christmas", week_start: 13, week_end: 16 },
  { unit_number: 5, title: "Epiphany", title_native: "عيد الغطاس", description: "The Baptism of Jesus and the Blessing of Water.", season: "Epiphany", week_start: 17, week_end: 20 },
  { unit_number: 6, title: "Winter Teachings", title_native: "تعاليم الشتاء", description: "Jesus the teacher: parables and lessons for daily life.", season: "Winter", week_start: 21, week_end: 24 },
  { unit_number: 7, title: "Great Lent", title_native: "الصوم الكبير", description: "Prayer, fasting, and charity during the Lenten journey.", season: "Lent", week_start: 25, week_end: 28 },
  { unit_number: 8, title: "Holy Week", title_native: "أسبوع الآلام", description: "Palm Sunday through the Crucifixion.", season: "Holy Week", week_start: 29, week_end: 32 },
  { unit_number: 9, title: "Easter", title_native: "عيد الفصح", description: "The glorious Resurrection and its meaning.", season: "Easter", week_start: 33, week_end: 36 },
  { unit_number: 10, title: "Post-Easter", title_native: "ما بعد الفصح", description: "The appearances of the Risen Christ and doubting Thomas.", season: "Paschal", week_start: 37, week_end: 40 },
  { unit_number: 11, title: "Pentecost", title_native: "عيد العنصرة", description: "The coming of the Holy Spirit and the birth of the Church.", season: "Pentecost", week_start: 41, week_end: 44 },
  { unit_number: 12, title: "Summer Saints", title_native: "قدّيسو الصيف", description: "Saints of the summer season and their lessons.", season: "Summer", week_start: 45, week_end: 48 },
  { unit_number: 13, title: "Assumption of Mary", title_native: "عيد انتقال العذراء", description: "Honoring the Blessed Virgin Mary and her role in our faith.", season: "Summer", week_start: 49, week_end: 52 },
  { unit_number: 14, title: "Parables of Jesus", title_native: "أمثال يسوع", description: "Learning wisdom through the stories Jesus told.", season: "Fall", week_start: 53, week_end: 56 },
  { unit_number: 15, title: "Miracles of Jesus", title_native: "معجزات يسوع", description: "The amazing things Jesus did and what they teach us.", season: "Fall", week_start: 57, week_end: 60 },
  { unit_number: 16, title: "Psalms and Proverbs", title_native: "المزامير والأمثال", description: "Wisdom from the Old Testament for young hearts.", season: "Winter", week_start: 61, week_end: 64 },
  { unit_number: 17, title: "The Apostles", title_native: "الرسل", description: "The twelve apostles and how they spread the Good News.", season: "Winter", week_start: 65, week_end: 68 },
  { unit_number: 18, title: "Year Review", title_native: "مراجعة السنة", description: "Reviewing what we learned and celebrating our faith journey.", season: "Spring", week_start: 69, week_end: 72 },
];

// ── HELPER FUNCTIONS ────────────────────────────────────────

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

// ── ARABIC (MARONITE) COMMON PRAYERS ────────────────────────

const AR_OPENING = makeOpening(
  "بِاسْمِ الآبِ وَالابْنِ وَالرُّوحِ القُدُس، إلهٌ واحِد، آمين.",
  "Bismil-Aab wal-Ibn war-Ruuh al-Qudus, Ilaahun waahid, aameen.",
  "In the name of the Father, the Son, and the Holy Spirit, one God, Amen.",
  "Read the prayer aloud slowly. Have the children repeat each line after you. Make the sign of the cross together."
);

const AR_CLOSING = makeClosing(
  "المَجدُ للآبِ وَالابنِ وَالرُّوحِ القُدُس، مِنَ الآنَ وَإلى الأبَد، آمين.",
  "Al-majdu lil-Aab wal-Ibn war-Ruuh al-Qudus, minal-aana wa ila al-abad, aameen.",
  "Glory to the Father, the Son, and the Holy Spirit, now and forever, Amen."
);

// ── LESSON DEFINITIONS ──────────────────────────────────────

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

function genLesson(num: number): LessonData {
  const opening = AR_OPENING;
  const closing = AR_CLOSING;
  const ageNote = "For younger children (5-6), focus on the vocabulary cards and coloring. For older children (8-10), engage with the discussion questions.";

  switch (num) {
    // ── UNIT 1: Feast of the Cross ──

    case 1: return {
      lesson_number: 1,
      title: "Welcome to Sunday School",
      title_native: "أهلاً بكم في مدرسة الأحد",
      opening, closing,
      story: makeStory(
        "Welcome to Sunday School in the Maronite tradition! This is a special place where we come together every Sunday to learn about God, our faith, and our beautiful heritage.\n\nIn Arabic, we call the church \"kaneesa\" (كنيسة). The Maronite church is named after St. Maroun, a holy monk who lived in the mountains of Lebanon. Just like your parents and grandparents did when they were your age, you will learn beautiful Arabic words, hear amazing stories from the Bible, and make wonderful friends.\n\nLook around you — this is your kaneesa. It's a place where our community comes together to pray, celebrate, and take care of each other. Every Sunday, we'll start with a prayer (salaat), learn something new, and have fun together.\n\nWho can tell me something they love about coming to church?",
        [
          { native: "كنيسة", transliteration: "kaneesa", english: "Church" },
          { native: "صلاة", transliteration: "salaat", english: "Prayer" },
          { native: "أهلاً", transliteration: "ahlan", english: "Welcome" },
        ]
      ),
      vocabulary: makeVocab([
        { word_native: "كنيسة", word_transliteration: "kaneesa", word_english: "Church", usage_example: "We go to the kaneesa on Sunday." },
        { word_native: "الله", word_transliteration: "Allah", word_english: "God", usage_example: "We pray to Allah every day." },
        { word_native: "محبة", word_transliteration: "mahabba", word_english: "Love", usage_example: "God's mahabba is everywhere." },
      ]),
      activity: makeActivity("discussion", "Sit in a circle. Ask each child to introduce themselves and share one thing they want to learn this year in Sunday School.", ["What is your name?", "What is your favorite thing about church?", "What do you want to learn in Sunday School?"]),
      liturgical_themes: ["church_building", "prayer"],
      age_notes: ageNote,
    };

    case 2: return {
      lesson_number: 2,
      title: "The Feast of the Holy Cross",
      title_native: "عيد الصليب المقدّس",
      opening, closing,
      story: makeStory(
        "The Feast of the Holy Cross (Eid al-Saleeb) celebrates when Queen Helena found the True Cross in Jerusalem. In the Maronite tradition, this is one of our most important feasts. The cross (saleeb) reminds us of Jesus's love for everyone.\n\nA long, long time ago, Queen Helena traveled far across the sea to find the most important cross in the world — the cross where Jesus showed his love for all of us. She searched and searched until she found it! When she held it up, people were so happy that they lit fires on the mountaintops to spread the good news.\n\nIn Arabic, we call the cross \"saleeb.\" Can everyone say \"saleeb\" together? The cross is a sign of God's love. Every time we see a cross, we remember how much Jesus loves us.",
        [
          { native: "صليب", transliteration: "saleeb", english: "Cross" },
          { native: "عيد", transliteration: "eid", english: "Feast" },
          { native: "محبة", transliteration: "mahabba", english: "Love" },
        ]
      ),
      vocabulary: makeVocab([
        { word_native: "صليب", word_transliteration: "saleeb", word_english: "Cross", usage_example: "We make the sign of the saleeb before we pray." },
        { word_native: "مقدّس", word_transliteration: "muqaddas", word_english: "Holy", usage_example: "The Saleeb al-Muqaddas is a special feast." },
        { word_native: "بخور", word_transliteration: "bukhoor", word_english: "Incense", usage_example: "The beautiful smell of bukhoor fills the church." },
      ]),
      activity: makeActivity("craft", "Give each child paper and crayons. Have them draw and decorate a cross. While they work, practice saying the word 'saleeb' (cross) in Arabic.", ["What shape is a cross?", "Where do you see crosses in our church?"]),
      liturgical_themes: ["holy_cross", "feast"],
      age_notes: ageNote,
    };

    case 3: return {
      lesson_number: 3,
      title: "Our Maronite Church",
      title_native: "كنيستنا المارونية",
      opening, closing,
      story: makeStory(
        "Let's explore our Maronite church! Every Maronite church has special parts. Let's walk through them together.\n\nThe main area where the priest stands is called the \"haykal\" (altar area). The tabernacle (bayt al-qurbaan) holds the Blessed Sacrament — the Body of Christ. Look at the icons and the beautiful cedar cross — the cedar tree is a symbol of Lebanon and our Maronite heritage.\n\nWhen we walk into the church, we dip our fingers in holy water, make the sign of the cross, and light a candle (sham'a). These are ways we show our love and respect for God.\n\nOur church is like a home for our community. The priest (kaahin) leads our prayers and teaches us about God's love. Can you point to the haykal?",
        [
          { native: "هيكل", transliteration: "haykal", english: "Altar" },
          { native: "كاهن", transliteration: "kaahin", english: "Priest" },
          { native: "شمعة", transliteration: "sham'a", english: "Candle" },
        ]
      ),
      vocabulary: makeVocab([
        { word_native: "هيكل", word_transliteration: "haykal", word_english: "Altar", usage_example: "The haykal is at the front of the church." },
        { word_native: "شمعة", word_transliteration: "sham'a", word_english: "Candle", usage_example: "We light a sham'a when we enter." },
        { word_native: "كاهن", word_transliteration: "kaahin", word_english: "Priest", usage_example: "The kaahin leads our prayers." },
        { word_native: "أيقونة", word_transliteration: "ayqoona", word_english: "Icon", usage_example: "We see beautiful ayqoonaat on the walls." },
      ]),
      activity: makeActivity("game", "Church Scavenger Hunt! Give each child a simple checklist: find the altar (haykal), find a candle (sham'a), find an icon (ayqoona), find the cross (saleeb). Walk through the church together and check off each item.", ["What is the most special part of our church?", "What do we do when we first walk into church?"]),
      liturgical_themes: ["church_building"],
      age_notes: ageNote,
    };

    case 4: return {
      lesson_number: 4,
      title: "How We Pray",
      title_native: "كيف نصلّي",
      opening, closing,
      story: makeStory(
        "Prayer (salaat) is how we talk to God. We can pray anytime — when we're happy, when we're scared, when we're thankful, or when we need help. God always listens!\n\nIn the Maronite tradition, we have a special way to start praying. First, we stand up straight and fold our hands. Then we make the sign of the cross. We touch our forehead, our chest, our left shoulder, then our right shoulder. As we do this, we say \"Bismil-Aab, wal-Ibn, war-Ruuh al-Qudus\" — \"In the name of the Father, the Son, and the Holy Spirit.\"\n\nThe most important prayer Jesus taught us is called the \"Abaana\" — the Our Father. We say \"aameen\" at the end of every prayer, which means \"so be it\" or \"we believe.\"\n\nLet's practice together! Everyone stand up and follow me.",
        [
          { native: "صلاة", transliteration: "salaat", english: "Prayer" },
          { native: "إشارة الصليب", transliteration: "ishaarat as-saleeb", english: "Sign of the Cross" },
          { native: "آمين", transliteration: "aameen", english: "Amen" },
        ]
      ),
      vocabulary: makeVocab([
        { word_native: "صلاة", word_transliteration: "salaat", word_english: "Prayer", usage_example: "We say a salaat before we eat." },
        { word_native: "آمين", word_transliteration: "aameen", word_english: "Amen", usage_example: "We say aameen at the end of every prayer." },
        { word_native: "أبانا", word_transliteration: "abaana", word_english: "Our Father", usage_example: "The Abaana is the prayer Jesus taught us." },
      ]),
      activity: makeActivity("game", "Prayer Practice Relay! Line up two teams. Each child runs to the front, makes the sign of the cross correctly, says 'Aameen,' and runs back. First team to finish wins!", ["When is a good time to pray?", "Can you pray when you're not in church?", "What do you want to tell God today?"]),
      liturgical_themes: ["prayer"],
      age_notes: ageNote,
    };

    // ── UNIT 2: Autumn Saints ──

    case 5: return {
      lesson_number: 5,
      title: "St. Maroun",
      title_native: "مار مارون",
      opening, closing,
      story: makeStory(
        "Today we'll learn about the most important saint in our Maronite tradition — St. Maroun (Maar Maaroon)!\n\nSt. Maroun lived in the mountains of Syria around 400 AD. He was a monk who loved to pray outdoors, close to nature and God. He would stand on a mountaintop and pray for hours, even in the rain and snow. His faith was so strong that people came from far away to learn from him. He healed the sick and comforted the sad.\n\nAfter he died, his followers became known as Maronites — that's us! The Maronite Church is named after him. His followers built a monastery over his tomb and eventually moved to the beautiful mountains of Lebanon.\n\nSt. Maroun teaches us that we can be close to God anywhere — on a mountain, in a garden, or in our own room. All we need to do is open our hearts and pray.",
        [
          { native: "مار", transliteration: "maar", english: "Saint" },
          { native: "راهب", transliteration: "raahib", english: "Monk" },
          { native: "جبل", transliteration: "jabal", english: "Mountain" },
        ]
      ),
      vocabulary: makeVocab([
        { word_native: "مار", word_transliteration: "maar", word_english: "Saint", usage_example: "Maar Maaroon is the founder of our church." },
        { word_native: "راهب", word_transliteration: "raahib", word_english: "Monk", usage_example: "A raahib devotes his life to God." },
        { word_native: "جبل", word_transliteration: "jabal", word_english: "Mountain", usage_example: "Maar Maaroon prayed on the jabal." },
      ]),
      activity: makeActivity("craft", "Draw St. Maroun on a mountain, praying under the open sky. Write the word 'Maar Maaroon' on your drawing. Use green and brown for the mountain and blue for the sky.", ["What made St. Maroun special?", "Where is your favorite place to pray?", "How can we be close to God like St. Maroun?"]),
      liturgical_themes: ["saint"],
      age_notes: ageNote,
    };

    case 6: return {
      lesson_number: 6,
      title: "St. Charbel",
      title_native: "مار شربل",
      opening, closing,
      story: makeStory(
        "Today we'll learn about one of the most famous saints in the world — St. Charbel (Maar Sharbel)!\n\nSt. Charbel was a Lebanese Maronite monk who lived about 150 years ago in a small village called Annaya, high up in the mountains of Lebanon. He spent years praying in silence, farming the land, and serving God. He lived a very simple life — no fancy clothes, no big house — just prayer and hard work.\n\nAfter he died, something amazing happened. Many miracles (mu'jizaat) began to occur near his tomb. People who were sick were healed. A bright light was seen shining from his grave! People from all over the world — Christians, Muslims, and others — visit his shrine in Annaya to ask for his prayers.\n\nSt. Charbel teaches us that a quiet, humble life of prayer is very powerful. We don't need to be loud or famous to be close to God.",
        [
          { native: "معجزة", transliteration: "mu'jiza", english: "Miracle" },
          { native: "صلاة", transliteration: "salaat", english: "Prayer" },
          { native: "لبنان", transliteration: "Lubnaan", english: "Lebanon" },
        ]
      ),
      vocabulary: makeVocab([
        { word_native: "معجزة", word_transliteration: "mu'jiza", word_english: "Miracle", usage_example: "Maar Sharbel is known for many mu'jizaat." },
        { word_native: "قرية", word_transliteration: "qarya", word_english: "Village", usage_example: "He lived in a quiet qarya." },
        { word_native: "صمت", word_transliteration: "samt", word_english: "Silence", usage_example: "He prayed in samt." },
      ]),
      activity: makeActivity("discussion", "Sit in a circle. Ask the children: What can we learn from silence and prayer? Try sitting in silence together for one full minute, then talk about what it felt like.", ["What was it like to sit in silence?", "Why did St. Charbel love to pray?", "How can we find quiet time to pray at home?"]),
      liturgical_themes: ["saint"],
      age_notes: ageNote,
    };

    case 7: return {
      lesson_number: 7,
      title: "St. Rafqa",
      title_native: "مار رفقا",
      opening, closing,
      story: makeStory(
        "Today we'll learn about a very brave and faithful saint — St. Rafqa (Maar Rafqa)!\n\nSt. Rafqa was a Lebanese Maronite nun who lived about 150 years ago. When she was young, she became a nun and dedicated her life to teaching children and serving God. She was kind, joyful, and full of faith.\n\nLater in her life, she suffered from a very painful illness that made her blind and caused her great pain. But even through all her suffering, she never stopped praying and thanking God. She said that her suffering brought her closer to Jesus, who also suffered on the cross.\n\nSt. Rafqa teaches us about patience (sabr) and gratitude (shukr). Even when things are hard, we can trust that God is with us and loves us. She reminds us to always say \"thank you\" to God — shukr li-Allah!",
        [
          { native: "صبر", transliteration: "sabr", english: "Patience" },
          { native: "شكر", transliteration: "shukr", english: "Gratitude" },
          { native: "راهبة", transliteration: "raahiba", english: "Nun" },
        ]
      ),
      vocabulary: makeVocab([
        { word_native: "صبر", word_transliteration: "sabr", word_english: "Patience", usage_example: "Maar Rafqa showed great sabr." },
        { word_native: "شكر", word_transliteration: "shukr", word_english: "Gratitude", usage_example: "We give shukr to God every day." },
        { word_native: "راهبة", word_transliteration: "raahiba", word_english: "Nun", usage_example: "Maar Rafqa was a raahiba." },
      ]),
      activity: makeActivity("craft", "Draw something you are thankful for — it could be your family, your friends, nature, or anything else. Write the word 'shukr' (gratitude) on your drawing.", ["What are you thankful for today?", "How did St. Rafqa show patience?", "How can we be patient when things are hard?"]),
      liturgical_themes: ["saint"],
      age_notes: ageNote,
    };

    case 8: return {
      lesson_number: 8,
      title: "The Cedars of God",
      title_native: "أرز الرب",
      opening, closing,
      story: makeStory(
        "Today we're going to learn about one of the most special places in Lebanon — the Cedars of God (Arz ar-Rabb)!\n\nIn Lebanon, high up in the mountains, grow the famous Cedars of God. These ancient trees have been there for thousands of years — some were already old when King Solomon built the Temple in Jerusalem! The cedar tree (arza) is tall, strong, and beautiful. It stays green all year round, even in the snow.\n\nThe cedar tree is a symbol of Lebanon and appears on the Lebanese flag. In the Bible, the Psalms say: \"The righteous shall flourish like the cedar of Lebanon.\" This means that when we have faith and do good, we grow strong and beautiful like the cedar.\n\nOur Maronite ancestors lived among these cedars in the mountains of Lebanon. The cedar reminds us of our heritage — strong, enduring, and always reaching toward heaven.",
        [
          { native: "أرزة", transliteration: "arza", english: "Cedar tree" },
          { native: "لبنان", transliteration: "Lubnaan", english: "Lebanon" },
          { native: "مزمور", transliteration: "mazmoor", english: "Psalm" },
        ]
      ),
      vocabulary: makeVocab([
        { word_native: "أرزة", word_transliteration: "arza", word_english: "Cedar", usage_example: "The arza is the symbol of Lebanon." },
        { word_native: "لبنان", word_transliteration: "Lubnaan", word_english: "Lebanon", usage_example: "Our Maronite roots are in Lubnaan." },
        { word_native: "مزمور", word_transliteration: "mazmoor", word_english: "Psalm", usage_example: "We read a mazmoor together." },
      ]),
      activity: makeActivity("craft", "Draw a cedar tree and write 'Arz ar-Rabb' (Cedars of God) on it. Color the tree green and the sky blue. If time allows, draw the Lebanese flag with the cedar in the middle.", ["Why is the cedar tree special to Lebanon?", "What does it mean to be strong like a cedar?", "How can our faith help us grow strong?"]),
      liturgical_themes: ["heritage"],
      age_notes: ageNote,
    };

    // ── For remaining lessons, generate structured content ──
    default: return generateRemainingLesson(num, opening, closing, ageNote);
  }
}

function generateRemainingLesson(num: number, opening: ReturnType<typeof makeOpening>, closing: ReturnType<typeof makeClosing>, ageNote: string): LessonData {
  const REMAINING: Record<number, { title: string; title_native: string; themes: string[]; actType: "discussion" | "game" | "craft" }> = {
    // Unit 3 - Advent (lessons 9-12)
    9:  { title: "Getting Ready for Christmas", title_native: "الاستعداد للميلاد", themes: ["nativity"], actType: "craft" },
    10: { title: "The Annunciation", title_native: "البشارة", themes: ["nativity"], actType: "discussion" },
    11: { title: "The Journey to Bethlehem", title_native: "الرحلة إلى بيت لحم", themes: ["nativity"], actType: "game" },
    12: { title: "The Visitation", title_native: "الزيارة", themes: ["nativity"], actType: "craft" },

    // Unit 4 - Christmas (lessons 13-16)
    13: { title: "The Birth of Jesus", title_native: "ميلاد يسوع", themes: ["nativity"], actType: "craft" },
    14: { title: "The Shepherds", title_native: "الرعاة", themes: ["nativity"], actType: "game" },
    15: { title: "The Three Wise Men", title_native: "المجوس الثلاثة", themes: ["nativity", "feast"], actType: "craft" },
    16: { title: "Maronite Christmas Traditions", title_native: "تقاليد الميلاد المارونية", themes: ["nativity", "feast"], actType: "game" },

    // Unit 5 - Epiphany (lessons 17-20)
    17: { title: "The Baptism of Jesus", title_native: "معمودية يسوع", themes: ["epiphany"], actType: "discussion" },
    18: { title: "Blessing of Water", title_native: "تبريك المياه", themes: ["epiphany", "feast"], actType: "craft" },
    19: { title: "Light of the World", title_native: "نور العالم", themes: ["epiphany"], actType: "game" },
    20: { title: "Our Own Baptism", title_native: "معموديتنا", themes: ["epiphany"], actType: "discussion" },

    // Unit 6 - Winter Teachings (lessons 21-24)
    21: { title: "The Beatitudes", title_native: "التطويبات", themes: ["teaching"], actType: "discussion" },
    22: { title: "Love Your Neighbor", title_native: "أحبب قريبك", themes: ["charity", "teaching"], actType: "game" },
    23: { title: "The Lord's Prayer", title_native: "الصلاة الربانية", themes: ["prayer"], actType: "craft" },
    24: { title: "Forgiveness", title_native: "المغفرة", themes: ["forgiveness"], actType: "discussion" },

    // Unit 7 - Great Lent (lessons 25-28)
    25: { title: "What is Fasting?", title_native: "ما هو الصوم؟", themes: ["lent"], actType: "discussion" },
    26: { title: "The Prodigal Son", title_native: "الابن الشاطر", themes: ["parable", "lent", "forgiveness"], actType: "discussion" },
    27: { title: "The Good Samaritan", title_native: "السامري الصالح", themes: ["parable", "lent", "charity"], actType: "game" },
    28: { title: "Prayer During Lent", title_native: "الصلاة في الصوم", themes: ["prayer", "lent"], actType: "craft" },

    // Unit 8 - Holy Week (lessons 29-32)
    29: { title: "Palm Sunday", title_native: "أحد الشعانين", themes: ["holy_week"], actType: "craft" },
    30: { title: "The Last Supper", title_native: "العشاء الأخير", themes: ["holy_week"], actType: "discussion" },
    31: { title: "Good Friday", title_native: "الجمعة العظيمة", themes: ["holy_week"], actType: "craft" },
    32: { title: "The Burial", title_native: "الدفن", themes: ["holy_week"], actType: "discussion" },

    // Unit 9 - Easter (lessons 33-36)
    33: { title: "The Resurrection", title_native: "القيامة", themes: ["pascha"], actType: "game" },
    34: { title: "The Empty Tomb", title_native: "القبر الفارغ", themes: ["pascha"], actType: "craft" },
    35: { title: "Jesus Appears to the Disciples", title_native: "يسوع يظهر للتلاميذ", themes: ["pascha"], actType: "discussion" },
    36: { title: "Maronite Easter Traditions", title_native: "تقاليد الفصح المارونية", themes: ["pascha", "feast"], actType: "game" },

    // Unit 10 - Post-Easter (lessons 37-40)
    37: { title: "Doubting Thomas", title_native: "توما الشكّاك", themes: ["pascha"], actType: "discussion" },
    38: { title: "The Road to Emmaus", title_native: "الطريق إلى عمواس", themes: ["pascha"], actType: "game" },
    39: { title: "Jesus and Peter", title_native: "يسوع وبطرس", themes: ["pascha"], actType: "discussion" },
    40: { title: "The Great Commission", title_native: "الإرسالية الكبرى", themes: ["pascha"], actType: "craft" },

    // Unit 11 - Pentecost (lessons 41-44)
    41: { title: "The Ascension", title_native: "الصعود", themes: ["feast"], actType: "discussion" },
    42: { title: "The Coming of the Holy Spirit", title_native: "حلول الروح القدس", themes: ["pentecost"], actType: "craft" },
    43: { title: "The First Christians", title_native: "المسيحيون الأوائل", themes: ["pentecost"], actType: "discussion" },
    44: { title: "Sharing Our Faith", title_native: "مشاركة إيماننا", themes: ["pentecost"], actType: "game" },

    // Unit 12 - Summer Saints (lessons 45-48)
    45: { title: "St. Elias", title_native: "مار الياس", themes: ["saint"], actType: "craft" },
    46: { title: "St. Peter and St. Paul", title_native: "مار بطرس ومار بولس", themes: ["saint"], actType: "game" },
    47: { title: "St. Thérèse of Lisieux", title_native: "مار تريز", themes: ["saint"], actType: "discussion" },
    48: { title: "St. Nimatullah", title_native: "مار نعمة الله", themes: ["saint"], actType: "craft" },

    // Unit 13 - Assumption of Mary (lessons 49-52)
    49: { title: "Mary the Mother of Jesus", title_native: "مريم أم يسوع", themes: ["theotokos"], actType: "discussion" },
    50: { title: "The Rosary", title_native: "المسبحة الوردية", themes: ["theotokos", "prayer"], actType: "craft" },
    51: { title: "The Assumption", title_native: "انتقال العذراء", themes: ["theotokos", "feast"], actType: "game" },
    52: { title: "Our Lady of Lebanon", title_native: "سيّدة لبنان", themes: ["theotokos"], actType: "craft" },

    // Unit 14 - Parables (lessons 53-56)
    53: { title: "The Mustard Seed", title_native: "حبّة الخردل", themes: ["parable"], actType: "craft" },
    54: { title: "The Lost Sheep", title_native: "الخروف الضائع", themes: ["parable"], actType: "game" },
    55: { title: "The Talents", title_native: "الوزنات", themes: ["parable"], actType: "discussion" },
    56: { title: "The Pearl of Great Price", title_native: "اللؤلؤة الثمينة", themes: ["parable"], actType: "craft" },

    // Unit 15 - Miracles (lessons 57-60)
    57: { title: "Water into Wine", title_native: "تحويل الماء إلى خمر", themes: ["miracle"], actType: "game" },
    58: { title: "Feeding the Five Thousand", title_native: "إطعام الخمسة آلاف", themes: ["miracle"], actType: "craft" },
    59: { title: "Walking on Water", title_native: "المشي على الماء", themes: ["miracle"], actType: "discussion" },
    60: { title: "Healing the Blind Man", title_native: "شفاء الأعمى", themes: ["miracle"], actType: "game" },

    // Unit 16 - Psalms and Proverbs (lessons 61-64)
    61: { title: "The Lord is My Shepherd", title_native: "الرب راعيّ", themes: ["psalm"], actType: "craft" },
    62: { title: "Make a Joyful Noise", title_native: "رنّموا للرب", themes: ["psalm"], actType: "game" },
    63: { title: "Wisdom from Proverbs", title_native: "حكمة الأمثال", themes: ["proverb"], actType: "discussion" },
    64: { title: "The Golden Rule", title_native: "القاعدة الذهبية", themes: ["teaching"], actType: "craft" },

    // Unit 17 - The Apostles (lessons 65-68)
    65: { title: "Peter the Rock", title_native: "بطرس الصخرة", themes: ["apostle"], actType: "discussion" },
    66: { title: "Paul's Journeys", title_native: "رحلات بولس", themes: ["apostle"], actType: "game" },
    67: { title: "The Twelve Apostles", title_native: "الرسل الاثنا عشر", themes: ["apostle"], actType: "craft" },
    68: { title: "The Church in Antioch", title_native: "الكنيسة في أنطاكية", themes: ["apostle"], actType: "discussion" },

    // Unit 18 - Year Review (lessons 69-72)
    69: { title: "Our Favorite Stories", title_native: "قصصنا المفضلة", themes: ["review"], actType: "discussion" },
    70: { title: "Our Favorite Words", title_native: "كلماتنا المفضلة", themes: ["review"], actType: "game" },
    71: { title: "Our Faith Journey", title_native: "رحلة إيماننا", themes: ["review"], actType: "craft" },
    72: { title: "Year-End Celebration", title_native: "حفل نهاية السنة", themes: ["review", "feast"], actType: "game" },
  };

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
    title_native: r.title_native,
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
  console.log("\n🇱🇧 Arabic (Maronite) Sunday School Seeder\n");

  // Clear existing Arabic Sunday School data only
  const { data: existingArUnits } = await db.from("sunday_units").select("id").eq("locale", "ar");
  if (existingArUnits?.length) {
    const unitIds = existingArUnits.map(u => u.id);
    await db.from("sunday_lessons").delete().in("unit_id", unitIds);
    await db.from("sunday_units").delete().eq("locale", "ar");
    console.log("  Cleared existing Arabic data\n");
  }

  // Insert units
  console.log("=== Seeding Units ===\n");
  const unitIdMap: Record<number, string> = {};

  for (const u of UNITS) {
    const { data, error } = await db.from("sunday_units").insert({
      locale: "ar",
      unit_number: u.unit_number,
      title: u.title,
      title_native: u.title_native,
      description: u.description,
      season: u.season,
      week_start: u.week_start,
      week_end: u.week_end,
    }).select("id").single();

    if (error) {
      console.error(`  ❌ Unit ${u.unit_number}: ${error.message}`);
    } else {
      unitIdMap[u.unit_number] = data.id;
      console.log(`  ✅ Unit ${u.unit_number}: ${u.title} (${u.title_native})`);
    }
  }

  // Insert lessons
  console.log("\n=== Seeding Lessons ===\n");
  let successCount = 0;
  let errorCount = 0;

  for (let lessonNum = 1; lessonNum <= 72; lessonNum++) {
    const unit = UNITS.find(u => lessonNum >= u.week_start && lessonNum <= u.week_end);
    if (!unit) { console.error(`  No unit for lesson ${lessonNum}`); errorCount++; continue; }

    const unitId = unitIdMap[unit.unit_number];
    if (!unitId) { console.error(`  No unit ID for unit ${unit.unit_number}`); errorCount++; continue; }

    const lesson = genLesson(lessonNum);

    const { error } = await db.from("sunday_lessons").insert({
      locale: "ar",
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
      console.error(`  ❌ Lesson ${lessonNum}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`  ✅ Lesson ${lessonNum}: ${lesson.title}`);
      successCount++;
    }
  }

  // Verify
  console.log("\n=== Verification ===\n");
  const { count: unitCount } = await db.from("sunday_units").select("id", { count: "exact", head: true }).eq("locale", "ar");
  const { count: lessonCount } = await db.from("sunday_lessons").select("id", { count: "exact", head: true }).eq("locale", "ar");
  console.log(`  Arabic units: ${unitCount}`);
  console.log(`  Arabic lessons: ${lessonCount}`);
  console.log(`\n✨ Done! ${successCount} lessons seeded, ${errorCount} errors.\n`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
