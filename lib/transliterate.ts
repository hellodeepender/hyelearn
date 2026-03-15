// Western Armenian transliteration (Hübschmann-Meillet based, Western pronunciation)
// NOTE: Western Armenian has different consonant values than Eastern Armenian

const DIGRAPHS: [string, string][] = [
  ["\u0578\u0582", "u"],   // ու -> u
  ["\u0548\u0582", "U"],   // Ou -> U
];

const MAP: Record<string, string> = {
  // Lowercase - Western Armenian pronunciation
  "\u0561": "a",    // ա
  "\u0562": "p",    // բ (Western: p, not b)
  "\u0563": "k",    // գ (Western: k, not g)
  "\u0564": "t",    // դ (Western: t, not d)
  "\u0565": "ye",   // ե
  "\u0566": "z",    // զ
  "\u0567": "e",    // է
  "\u0568": "u",    // ը
  "\u0569": "t'",   // թ
  "\u056A": "zh",   // ժ
  "\u056B": "i",    // ի
  "\u056C": "l",    // լ
  "\u056D": "kh",   // խ
  "\u056E": "dz",   // ծ (Western: dz)
  "\u056F": "g",    // կ (Western: g, not k)
  "\u0570": "h",    // հ
  "\u0571": "ts",   // ձ (Western: ts)
  "\u0572": "gh",   // ղ
  "\u0573": "j",    // ճ (Western: j)
  "\u0574": "m",    // մ
  "\u0575": "y",    // յ
  "\u0576": "n",    // ն
  "\u0577": "sh",   // շ
  "\u0578": "vo",   // delays (word-initial vo, medial o)
  "\u0579": "ch",   // չ
  "\u057A": "b",    // պ (Western: b, not p)
  "\u057B": "ch",   // ջ (Western: ch)
  "\u057C": "r",    // ռ
  "\u057D": "s",    // ս
  "\u057E": "v",    // վ
  "\u057F": "d",    // delays (Western: d, not t)
  "\u0580": "r",    // ր
  "\u0581": "ts'",  // ց
  "\u0582": "u",    // ու (standalone after digraph pass)
  "\u0583": "p'",   // փ
  "\u0584": "k'",   // ք
  "\u0585": "o",    // օ
  "\u0586": "f",    // ֆ
  "\u0587": "yev",  // և

  // Uppercase
  "\u0531": "A",    // Ա
  "\u0532": "P",    // Բ
  "\u0533": "K",    // Գ
  "\u0534": "T",    // Դ
  "\u0535": "Ye",   // Ե
  "\u0536": "Z",    // Զ
  "\u0537": "E",    // Է
  "\u0538": "U",    // Ը
  "\u0539": "T'",   // Թ
  "\u053A": "Zh",   // Ժ
  "\u053B": "I",    // Ի
  "\u053C": "L",    // Լ
  "\u053D": "Kh",   // Խ
  "\u053E": "Dz",   // Ծ
  "\u053F": "G",    // Կ
  "\u0540": "H",    // Հ
  "\u0541": "Ts",   // Ձ
  "\u0542": "Gh",   // Ղ
  "\u0543": "J",    // Ճ
  "\u0544": "M",    // Մ
  "\u0545": "Y",    // Յ
  "\u0546": "N",    // Ն
  "\u0547": "Sh",   // Շ
  "\u0548": "Vo",   // Ո
  "\u0549": "Ch",   // Չ
  "\u054A": "B",    // Պ
  "\u054B": "Ch",   // Ջ
  "\u054C": "R",    // Ռ
  "\u054D": "S",    // Ս
  "\u054E": "V",    // Վ
  "\u054F": "D",    // Տ
  "\u0550": "R",    // Ր
  "\u0551": "Ts'",  // Ց
  "\u0552": "U",    // Ւ
  "\u0553": "P'",   // Փ
  "\u0554": "K'",   // Ք
  "\u0555": "O",    // Օ
  "\u0556": "F",    // Ֆ
};

export function transliterate(text: string): string {
  // Handle digraphs first
  let result = text;
  for (const [arm, lat] of DIGRAPHS) {
    result = result.split(arm).join(lat);
  }

  let output = "";
  for (const char of result) {
    output += MAP[char] ?? char;
  }
  return output;
}
