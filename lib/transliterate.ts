// ── Armenian (Western) ────────────────────────────────────────
// Western Armenian transliteration (Hübschmann-Meillet based, Western pronunciation)
// NOTE: Western Armenian has different consonant values than Eastern Armenian

const ARM_DIGRAPHS: [string, string][] = [
  ["\u0578\u0582", "u"],   // ու -> u
  ["\u0548\u0582", "U"],   // Ու -> U
];

const ARM_MAP: Record<string, string> = {
  "\u0561": "a",    "\u0531": "A",    // ա Ա
  "\u0562": "p",    "\u0532": "P",    // բ Բ (Western: p)
  "\u0563": "k",    "\u0533": "K",    // գ Գ (Western: k)
  "\u0564": "t",    "\u0534": "T",    // դ Դ (Western: t)
  "\u0565": "ye",   "\u0535": "Ye",   // ե Ե
  "\u0566": "z",    "\u0536": "Z",    // զ Զ
  "\u0567": "e",    "\u0537": "E",    // է Է
  "\u0568": "u",    "\u0538": "U",    // ը Ը
  "\u0569": "t'",   "\u0539": "T'",   // թ Թ
  "\u056A": "zh",   "\u053A": "Zh",   // ժ Ժ
  "\u056B": "i",    "\u053B": "I",    // ի Ի
  "\u056C": "l",    "\u053C": "L",    // լ Լ
  "\u056D": "kh",   "\u053D": "Kh",   // խ Խ
  "\u056E": "dz",   "\u053E": "Dz",   // ծ Ծ
  "\u056F": "g",    "\u053F": "G",    // կ Կ (Western: g)
  "\u0570": "h",    "\u0540": "H",    // հ Հ
  "\u0571": "ts",   "\u0541": "Ts",   // ձ Ձ
  "\u0572": "gh",   "\u0542": "Gh",   // ղ Ղ
  "\u0573": "j",    "\u0543": "J",    // ճ Ճ (Western: j)
  "\u0574": "m",    "\u0544": "M",    // մ Մ
  "\u0575": "y",    "\u0545": "Y",    // յ Յ
  "\u0576": "n",    "\u0546": "N",    // ն Ն
  "\u0577": "sh",   "\u0547": "Sh",   // շ Շ
  "\u0578": "o",    "\u0548": "O",    // ո Ո
  "\u0579": "ch",   "\u0549": "Ch",   // չ Չ
  "\u057A": "b",    "\u054A": "B",    // պ Պ (Western: b)
  "\u057B": "ch",   "\u054B": "Ch",   // ջ Ջ (Western: ch)
  "\u057C": "r",    "\u054C": "R",    // ռ Ռ
  "\u057D": "s",    "\u054D": "S",    // ս Ս
  "\u057E": "v",    "\u054E": "V",    // վ Վ
  "\u057F": "d",    "\u054F": "D",    // տ Տ (Western: d)
  "\u0580": "r",    "\u0550": "R",    // ր Ր
  "\u0581": "ts'",  "\u0551": "Ts'",  // ց Ց
  "\u0582": "u",    "\u0552": "U",    // ու (standalone)
  "\u0583": "p'",   "\u0553": "P'",   // փ Փ
  "\u0584": "k'",   "\u0554": "K'",   // ք Ք
  "\u0585": "o",    "\u0555": "O",    // օ Օ
  "\u0586": "f",    "\u0556": "F",    // ֆ Ֆ
  "\u0587": "yev",                    // և
};

// ── Greek ─────────────────────────────────────────────────────
// Standard Modern Greek romanization (ISO 843 / scholarly convention)

const GRK_DIGRAPHS: [string, string][] = [
  ["αι", "ai"],  ["αί", "ai"],
  ["ει", "ei"],  ["εί", "ei"],
  ["οι", "oi"],  ["οί", "oi"],
  ["υι", "yi"],
  ["αυ", "av"],  ["αύ", "av"],
  ["ευ", "ev"],  ["εύ", "ev"],
  ["ου", "ou"],  ["ού", "ou"],
  ["γγ", "ng"],
  ["γκ", "gk"],
  ["γξ", "nx"],
  ["γχ", "nch"],
  ["μπ", "b"],
  ["ντ", "d"],
  ["τσ", "ts"],
  ["τζ", "dz"],
  // Uppercase variants
  ["ΑΙ", "AI"], ["ΕΙ", "EI"], ["ΟΙ", "OI"],
  ["ΑΥ", "AV"], ["ΕΥ", "EV"], ["ΟΥ", "OU"],
];

const GRK_MAP: Record<string, string> = {
  "α": "a",   "Α": "A",
  "β": "v",   "Β": "V",
  "γ": "g",   "Γ": "G",
  "δ": "d",   "Δ": "D",
  "ε": "e",   "Ε": "E",
  "ζ": "z",   "Ζ": "Z",
  "η": "i",   "Η": "I",
  "θ": "th",  "Θ": "Th",
  "ι": "i",   "Ι": "I",
  "κ": "k",   "Κ": "K",
  "λ": "l",   "Λ": "L",
  "μ": "m",   "Μ": "M",
  "ν": "n",   "Ν": "N",
  "ξ": "x",   "Ξ": "X",
  "ο": "o",   "Ο": "O",
  "π": "p",   "Π": "P",
  "ρ": "r",   "Ρ": "R",
  "σ": "s",   "Σ": "S",
  "ς": "s",
  "τ": "t",   "Τ": "T",
  "υ": "y",   "Υ": "Y",
  "φ": "f",   "Φ": "F",
  "χ": "ch",  "Χ": "Ch",
  "ψ": "ps",  "Ψ": "Ps",
  "ω": "o",   "Ω": "O",
  // Accented vowels
  "ά": "a",   "Ά": "A",
  "έ": "e",   "Έ": "E",
  "ή": "i",   "Ή": "I",
  "ί": "i",   "Ί": "I",
  "ό": "o",   "Ό": "O",
  "ύ": "y",   "Ύ": "Y",
  "ώ": "o",   "Ώ": "O",
  "ϊ": "i",   "Ϊ": "I",
  "ϋ": "y",   "Ϋ": "Y",
  "ΐ": "i",
  "ΰ": "y",
};

// ── Arabic ──────────────────────────────────────────────────────
// Basic Arabic-to-Latin character map with diacritics support

const AR_DIGRAPHS: [string, string][] = [
  ["\u0627\u0644", "al-"], // ال -> al-
  ["\u0644\u0627", "la"],  // لا -> la
];

const AR_MAP: Record<string, string> = {
  "\u0623": "a",   "\u0625": "i",   "\u0627": "a",   "\u0622": "aa",  // أ إ ا آ
  "\u0628": "b",   // ب
  "\u062A": "t",   "\u0629": "a",   // ت ة (taa marbuta)
  "\u062B": "th",  // ث
  "\u062C": "j",   // ج
  "\u062D": "h",   // ح
  "\u062E": "kh",  // خ
  "\u062F": "d",   // د
  "\u0630": "dh",  // ذ
  "\u0631": "r",   // ر
  "\u0632": "z",   // ز
  "\u0633": "s",   // س
  "\u0634": "sh",  // ش
  "\u0635": "s",   // ص
  "\u0636": "d",   // ض
  "\u0637": "t",   // ط
  "\u0638": "dh",  // ظ
  "\u0639": "'",   // ع
  "\u063A": "gh",  // غ
  "\u0641": "f",   // ف
  "\u0642": "q",   // ق
  "\u0643": "k",   // ك
  "\u0644": "l",   // ل
  "\u0645": "m",   // م
  "\u0646": "n",   // ن
  "\u0647": "h",   // ه
  "\u0648": "w",   // و
  "\u064A": "y",   "\u0649": "a",   // ي ى (alif maqsura)
  // Diacritics
  "\u064E": "a",   // fatha
  "\u064F": "u",   // damma
  "\u0650": "i",   // kasra
  "\u0651": "",    // shadda (handled as double in known words)
  "\u0652": "",    // sukun
  "\u0670": "a",   // superscript alif
};

// Known example words from seed data — character map can't infer vowels
const AR_KNOWN_WORDS: Record<string, string> = {
  "\u0623\u0633\u062F": "asad",             // أسد - lion
  "\u0628\u064A\u062A": "bayt",             // بيت - house
  "\u062A\u0641\u0627\u062D": "tuffaah",    // تفاح - apple
  "\u062B\u0639\u0644\u0628": "tha'lab",    // ثعلب - fox
  "\u062C\u0645\u0644": "jamal",            // جمل - camel
  "\u062D\u0635\u0627\u0646": "hisaan",     // حصان - horse
  "\u062E\u0628\u0632": "khubz",            // خبز - bread
  "\u062F\u064F\u0628": "dubb",             // دُب - bear
  "\u0630\u0647\u0628": "dhahab",           // ذهب - gold
  "\u0631\u0645\u0627\u0646": "rummaan",    // رمان - pomegranate
  "\u0632\u0647\u0631\u0629": "zahra",      // زهرة - flower
  "\u0633\u0645\u0643": "samak",            // سمك - fish
  "\u0634\u0645\u0633": "shams",            // شمس - sun
  "\u0635\u0642\u0631": "saqr",             // صقر - falcon
  "\u0636\u0641\u062F\u0639": "difda'",     // ضفدع - frog
  "\u0637\u0627\u0626\u0631": "taa'ir",     // طائر - bird
  "\u0638\u0644": "dhil",                   // ظل - shadow
  "\u0639\u064A\u0646": "'ayn",             // عين - eye
  "\u063A\u0632\u0627\u0644": "ghazaal",    // غزال - deer
  "\u0641\u0631\u0627\u0634\u0629": "faraasha", // فراشة - butterfly
  "\u0642\u0645\u0631": "qamar",            // قمر - moon
  "\u0643\u062A\u0627\u0628": "kitaab",     // كتاب - book
  "\u0644\u064A\u0645\u0648\u0646": "laymoon", // ليمون - lemon
  "\u0645\u0627\u0621": "maa'",             // ماء - water
  "\u0646\u062C\u0645": "najm",             // نجم - star
  "\u0647\u0644\u0627\u0644": "hilaal",     // هلال - crescent
  "\u0648\u0631\u062F": "ward",             // ورد - rose
  "\u064A\u062F": "yad",                    // يد - hand
};

// ── Core transliteration function ─────────────────────────────

function applyDigraphsAndMap(
  text: string,
  digraphs: [string, string][],
  map: Record<string, string>
): string {
  let result = text;
  for (const [from, to] of digraphs) {
    result = result.split(from).join(to);
  }
  let output = "";
  for (const char of result) {
    output += map[char] ?? char;
  }
  return output;
}

// ── Public API ────────────────────────────────────────────────

/**
 * Transliterate text to Latin script.
 * @param text  The text to transliterate
 * @param locale  "hy" for Armenian (default), "el" for Greek, "ar" for Arabic
 */
export function transliterate(text: string, locale: string = "hy"): string {
  if (locale === "el") {
    return applyDigraphsAndMap(text, GRK_DIGRAPHS, GRK_MAP);
  }
  if (locale === "ar") {
    // Check known words first (Arabic lacks written vowels, so lookup is more accurate)
    const known = AR_KNOWN_WORDS[text.trim()];
    if (known) return known;
    return applyDigraphsAndMap(text, AR_DIGRAPHS, AR_MAP);
  }
  // Default: Western Armenian
  return applyDigraphsAndMap(text, ARM_DIGRAPHS, ARM_MAP);
}
