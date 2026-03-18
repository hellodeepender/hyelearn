"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useLocale } from "@/lib/locale-context";
import { getGradeBand, BAND_CONFIG, type GradeBand } from "@/lib/grade-bands";

interface Level { id: string; slug: string; title: string; sort_order: number }
interface Unit { id: string; slug: string; title: string; level_id: string; sort_order: number }
interface Lesson { id: string; slug: string; title: string; unit_id: string; template_type: string; sort_order: number }

// Content row types
interface LetterRow { letter_upper: string; letter_lower: string; letter_name: string; transliteration: string; sound: string; example_word_target: string; example_word_eng: string; emoji: string }
interface WordRow { target_lang: string; english: string; emoji: string; category: string }
interface PhraseRow { target_lang: string; english: string }
interface ReadingPassage { title: string; text: string }
interface GrammarNote { topic: string; explanation: string; examples: string[] }
interface CompositionPrompt { prompt: string; instructions: string; min_sentences: number }
interface DiscussionQuestion { question: string; question_eng: string }

interface Props { levels: Level[]; units: Unit[]; lessons: Lesson[]; userId: string }

const EMPTY_LETTER: LetterRow = { letter_upper: "", letter_lower: "", letter_name: "", transliteration: "", sound: "", example_word_target: "", example_word_eng: "", emoji: "" };
const EMPTY_WORD: WordRow = { target_lang: "", english: "", emoji: "", category: "general" };
const EMPTY_PHRASE: PhraseRow = { target_lang: "", english: "" };
const EMPTY_READING: ReadingPassage = { title: "", text: "" };
const EMPTY_GRAMMAR: GrammarNote = { topic: "", explanation: "", examples: [""] };
const EMPTY_COMPOSITION: CompositionPrompt = { prompt: "", instructions: "", min_sentences: 3 };
const EMPTY_DISCUSSION: DiscussionQuestion = { question: "", question_eng: "" };

type ContentStatus = "empty" | "loaded" | "modified" | "ai";

const BAND_BADGE: Record<GradeBand, string> = {
  emergent: "bg-blue-50 text-blue-700",
  early: "bg-green-50 text-green-700",
  developing: "bg-amber-50 text-amber-700",
  fluent: "bg-red-50 text-red-700",
};

function gradeFromLevel(title: string): string {
  if (title.toLowerCase().includes("kindergarten")) return "K";
  const m = title.match(/\d+/);
  return m ? m[0] : "1";
}

export default function ContentClient({ levels, units, lessons, userId }: Props) {
  const { englishName } = useLocale();

  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");

  // Content state
  const [letterRows, setLetterRows] = useState<LetterRow[]>([{ ...EMPTY_LETTER }, { ...EMPTY_LETTER }, { ...EMPTY_LETTER }]);
  const [wordRows, setWordRows] = useState<WordRow[]>([{ ...EMPTY_WORD }, { ...EMPTY_WORD }, { ...EMPTY_WORD }]);
  const [phraseRows, setPhraseRows] = useState<PhraseRow[]>([{ ...EMPTY_PHRASE }, { ...EMPTY_PHRASE }]);
  const [readingPassage, setReadingPassage] = useState<ReadingPassage>({ ...EMPTY_READING });
  const [grammarNote, setGrammarNote] = useState<GrammarNote>({ ...EMPTY_GRAMMAR });
  const [compositionPrompt, setCompositionPrompt] = useState<CompositionPrompt>({ ...EMPTY_COMPOSITION });
  const [discussionQuestions, setDiscussionQuestions] = useState<DiscussionQuestion[]>([{ ...EMPTY_DISCUSSION }, { ...EMPTY_DISCUSSION }]);

  // UI state
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [contentStatus, setContentStatus] = useState<ContentStatus>("empty");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count?: number; learnCards?: number; exercises?: number; errors?: string[]; action?: string } | null>(null);
  const [error, setError] = useState("");

  // Derived
  const filteredUnits = units.filter((u) => u.level_id === selectedLevel);
  const filteredLessons = lessons.filter((l) => l.unit_id === selectedUnit);
  const lesson = lessons.find((l) => l.id === selectedLesson);
  const isAlphabet = lesson?.template_type === "alphabet";
  const isReviewOrQuiz = lesson?.template_type === "review" || lesson?.template_type === "quiz";
  const levelObj = levels.find((l) => l.id === selectedLevel);
  const grade = levelObj ? gradeFromLevel(levelObj.title) : "K";
  const band = getGradeBand(grade);
  const bandConfig = BAND_CONFIG[band];
  const unitObj = units.find((u) => u.id === selectedUnit);
  const unitName = unitObj?.title ?? "";
  const contentLabel = isAlphabet ? "Letter Content"
    : unitName.includes("Grammar") ? "Grammar Content"
    : unitName.includes("Reading") ? "Reading Content"
    : unitName.includes("Writing") ? "Writing Content"
    : unitName.includes("Literature") ? "Literature Content"
    : "Vocabulary Content";
  const isSpecialized = unitName.includes("Grammar") || unitName.includes("Reading") || unitName.includes("Writing") || unitName.includes("Literature");
  const wordLabel = isSpecialized ? `${englishName} term` : `${englishName} word`;
  const engLabel = isSpecialized ? "English meaning" : "English";
  const showEmoji = bandConfig.emojiSupported;

  function resetAllContent() {
    setLetterRows([{ ...EMPTY_LETTER }, { ...EMPTY_LETTER }, { ...EMPTY_LETTER }]);
    setWordRows([{ ...EMPTY_WORD }, { ...EMPTY_WORD }, { ...EMPTY_WORD }]);
    setPhraseRows([{ ...EMPTY_PHRASE }, { ...EMPTY_PHRASE }]);
    setReadingPassage({ ...EMPTY_READING });
    setGrammarNote({ ...EMPTY_GRAMMAR });
    setCompositionPrompt({ ...EMPTY_COMPOSITION });
    setDiscussionQuestions([{ ...EMPTY_DISCUSSION }, { ...EMPTY_DISCUSSION }]);
  }

  function markModified() {
    if (contentStatus === "loaded") setContentStatus("modified");
  }

  // Load existing content items when lesson changes
  const loadContent = useCallback(async (lessonId: string) => {
    setLoading(true);
    setError("");
    setResult(null);
    setContentStatus("empty");
    resetAllContent();

    const supabase = createClient();
    const { data: items } = await supabase
      .from("content_items")
      .select("item_type, item_data, sort_order")
      .eq("lesson_id", lessonId)
      .order("sort_order");

    if (items && items.length > 0) {
      const lessonObj = lessons.find((l) => l.id === lessonId);

      if (lessonObj?.template_type === "alphabet") {
        const rows = items.filter((i) => i.item_type === "letter").map((i) => {
          const d = i.item_data as Record<string, string>;
          return {
            letter_upper: d.letter_upper ?? "", letter_lower: d.letter_lower ?? "",
            letter_name: d.letter_name ?? "", transliteration: d.transliteration ?? "",
            sound: d.sound ?? "", example_word_target: d.example_word_target ?? "",
            example_word_eng: d.example_word_eng ?? "", emoji: d.emoji ?? "",
          };
        });
        while (rows.length < 3) rows.push({ ...EMPTY_LETTER });
        setLetterRows(rows);
      } else {
        // Words
        const wRows = items.filter((i) => i.item_type === "word").map((i) => {
          const d = i.item_data as Record<string, string>;
          return { target_lang: d.target_lang ?? "", english: d.english ?? "", emoji: d.emoji ?? "", category: d.category ?? "general" };
        });
        while (wRows.length < 3) wRows.push({ ...EMPTY_WORD });
        setWordRows(wRows);

        // Phrases
        const pRows = items.filter((i) => i.item_type === "phrase").map((i) => {
          const d = i.item_data as Record<string, string>;
          return { target_lang: d.target_lang ?? "", english: d.english ?? "" };
        });
        if (pRows.length > 0) setPhraseRows(pRows);

        // Reading passage
        const rp = items.find((i) => i.item_type === "reading_passage");
        if (rp) {
          const d = rp.item_data as Record<string, string>;
          setReadingPassage({ title: d.title ?? "", text: d.text ?? "" });
        }

        // Grammar note
        const gn = items.find((i) => i.item_type === "grammar_note");
        if (gn) {
          const d = gn.item_data as Record<string, unknown>;
          setGrammarNote({
            topic: (d.topic as string) ?? "", explanation: (d.explanation as string) ?? "",
            examples: Array.isArray(d.examples) ? (d.examples as string[]) : [""],
          });
        }

        // Composition prompt
        const cp = items.find((i) => i.item_type === "composition_prompt");
        if (cp) {
          const d = cp.item_data as Record<string, unknown>;
          setCompositionPrompt({
            prompt: (d.prompt as string) ?? "", instructions: (d.instructions as string) ?? "",
            min_sentences: (d.min_sentences as number) ?? 3,
          });
        }

        // Discussion questions
        const dqs = items.filter((i) => i.item_type === "discussion_question").map((i) => {
          const d = i.item_data as Record<string, string>;
          return { question: d.question ?? "", question_eng: d.question_eng ?? "" };
        });
        if (dqs.length > 0) setDiscussionQuestions(dqs);
      }
      setContentStatus("loaded");
    }
    setLoading(false);
  }, [lessons]); // eslint-disable-line react-hooks/exhaustive-deps

  function selectLesson(lessonId: string) {
    setSelectedLesson(lessonId);
    if (lessonId) loadContent(lessonId);
  }

  function updateLetter(idx: number, field: keyof LetterRow, value: string) {
    setLetterRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    markModified();
  }
  function updateWord(idx: number, field: keyof WordRow, value: string) {
    setWordRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    markModified();
  }
  function updatePhrase(idx: number, field: keyof PhraseRow, value: string) {
    setPhraseRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    markModified();
  }
  function updateDiscussion(idx: number, field: keyof DiscussionQuestion, value: string) {
    setDiscussionQuestions((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    markModified();
  }

  async function handleAutofill() {
    if (!selectedLesson || !lesson) return;
    setAutofilling(true);
    setError("");
    setResult(null);
    const unit = units.find((u) => u.id === selectedUnit);

    try {
      const res = await fetch("/api/autofill-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: lesson.template_type, lessonTitle: lesson.title, lessonDescription: "",
          unitTitle: unit?.title ?? "", levelTitle: levelObj?.title ?? "",
          lessonId: selectedLesson, unitId: selectedUnit,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Auto-fill failed");

      if (isAlphabet && Array.isArray(data.items)) {
        setLetterRows(data.items.map((item: Record<string, string>) => ({
          letter_upper: item.letter_upper ?? "", letter_lower: item.letter_lower ?? "",
          letter_name: item.letter_name ?? "", transliteration: item.transliteration ?? "",
          sound: item.sound ?? "", example_word_target: item.example_word_target ?? "",
          example_word_eng: item.example_word_eng ?? "", emoji: item.emoji ?? "",
        })));
      } else if (Array.isArray(data.items)) {
        setWordRows(data.items.map((item: Record<string, string>) => ({
          target_lang: item.target_lang ?? "", english: item.english ?? "",
          emoji: item.emoji ?? "", category: item.category ?? "general",
        })));
      }
      // Extended content types from API (snake_case keys)
      if (Array.isArray(data.phrases)) setPhraseRows(data.phrases);
      if (data.reading_passage) setReadingPassage(data.reading_passage);
      if (data.grammar_note) setGrammarNote(data.grammar_note);
      if (data.composition_prompt) setCompositionPrompt(data.composition_prompt);
      if (Array.isArray(data.discussion_questions)) setDiscussionQuestions(data.discussion_questions);
      setContentStatus("ai");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto-fill failed");
    }
    setAutofilling(false);
  }

  async function handleSave() {
    if (!selectedLesson) return;
    setSaving(true);
    setError("");
    setResult(null);

    const supabase = createClient();
    const unitId = lessons.find((l) => l.id === selectedLesson)?.unit_id;

    await supabase.from("content_items").delete().eq("lesson_id", selectedLesson);

    const items: { unit_id: string | undefined; lesson_id: string; item_type: string; sort_order: number; item_data: unknown; created_by: string }[] = [];
    let sortOrder = 1;

    if (isAlphabet) {
      for (const r of letterRows.filter((r) => r.letter_upper)) {
        items.push({ unit_id: unitId, lesson_id: selectedLesson, item_type: "letter", sort_order: sortOrder++, item_data: r, created_by: userId });
      }
    } else {
      // Words
      for (const r of wordRows.filter((r) => r.target_lang)) {
        items.push({ unit_id: unitId, lesson_id: selectedLesson, item_type: "word", sort_order: sortOrder++, item_data: r, created_by: userId });
      }
      // Phrases
      for (const r of phraseRows.filter((r) => r.target_lang)) {
        items.push({ unit_id: unitId, lesson_id: selectedLesson, item_type: "phrase", sort_order: sortOrder++, item_data: r, created_by: userId });
      }
      // Reading passage
      if (readingPassage.title || readingPassage.text) {
        items.push({ unit_id: unitId, lesson_id: selectedLesson, item_type: "reading_passage", sort_order: sortOrder++, item_data: readingPassage, created_by: userId });
      }
      // Grammar note
      if (grammarNote.topic || grammarNote.explanation) {
        items.push({ unit_id: unitId, lesson_id: selectedLesson, item_type: "grammar_note", sort_order: sortOrder++, item_data: grammarNote, created_by: userId });
      }
      // Composition prompt
      if (compositionPrompt.prompt) {
        items.push({ unit_id: unitId, lesson_id: selectedLesson, item_type: "composition_prompt", sort_order: sortOrder++, item_data: compositionPrompt, created_by: userId });
      }
      // Discussion questions
      for (const r of discussionQuestions.filter((r) => r.question)) {
        items.push({ unit_id: unitId, lesson_id: selectedLesson, item_type: "discussion_question", sort_order: sortOrder++, item_data: r, created_by: userId });
      }
    }

    if (items.length === 0) {
      setError("No content to save. Fill in at least one row.");
      setSaving(false);
      return;
    }

    const { error: insertErr } = await supabase.from("content_items").insert(items);
    if (insertErr) {
      setError(insertErr.message);
    } else {
      setResult({ count: items.length, action: "save" });
      setContentStatus("loaded");
    }
    setSaving(false);
  }

  async function handleGenerate() {
    if (!selectedLesson) return;
    setGenerating(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: selectedLesson }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult({ count: data.count, learnCards: data.learnCards, exercises: data.exercises, errors: data.validation?.errors, action: "generate" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    }
    setGenerating(false);
  }

  const statusLabel = {
    empty: { text: "New \u2014 no content yet", color: "text-brown-400" },
    loaded: { text: "Saved content loaded", color: "text-green-600" },
    modified: { text: "Unsaved changes", color: "text-amber-600" },
    ai: { text: "AI-generated \u2014 review before saving", color: "text-amber-600" },
  };

  // --- Section label helper ---
  function SectionLabel({ children }: { children: string }) {
    return <p className="text-sm font-semibold text-brown-600 mb-2 mt-4">{children}</p>;
  }

  const inputCls = "px-2 py-1.5 border border-brown-200 rounded text-sm bg-warm-white";
  const textareaCls = "w-full px-3 py-2 border border-brown-200 rounded-lg text-sm bg-warm-white resize-none focus:outline-none focus:ring-2 focus:ring-gold/30";

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brown-800">Content Editor</h1>
          <p className="text-brown-500 text-sm mt-1">Enter lesson content, then generate exercises</p>
        </div>
        <Link href="/teacher" className="text-sm text-brown-500 hover:text-brown-700 border border-brown-200 px-3 py-1.5 rounded-lg">Dashboard</Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}
      {result && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">
          {result.action === "generate"
            ? `Lesson generated! ${result.count} steps (${result.learnCards ?? 0} learn cards + ${result.exercises ?? 0} exercises)`
            : `${result.count} content items saved.`}
          {result.action === "generate" && selectedLesson && (() => {
            const l = lessons.find((x) => x.id === selectedLesson);
            const u = l ? units.find((x) => x.id === l.unit_id) : null;
            const lv = u ? levels.find((x) => x.id === u.level_id) : null;
            if (l && u && lv) {
              const url = `/student/curriculum/${lv.slug}/${u.slug}/${l.slug}`;
              return <> <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium underline ml-1">Preview as student &rarr;</a></>;
            }
            return null;
          })()}
          {result.errors && result.errors.length > 0 && (
            <ul className="mt-2 list-disc ml-4 text-amber-700">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Selectors */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <select value={selectedLevel} onChange={(e) => { setSelectedLevel(e.target.value); setSelectedUnit(""); setSelectedLesson(""); setContentStatus("empty"); resetAllContent(); }}
          className="px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm">
          <option value="">Level...</option>
          {levels.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        <select value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setSelectedLesson(""); setContentStatus("empty"); resetAllContent(); }}
          className="px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm" disabled={!selectedLevel}>
          <option value="">Unit...</option>
          {filteredUnits.map((u) => <option key={u.id} value={u.id}>{u.title}</option>)}
        </select>
        <select value={selectedLesson} onChange={(e) => selectLesson(e.target.value)}
          className="px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm" disabled={!selectedUnit}>
          <option value="">Lesson...</option>
          {filteredLessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
      </div>

      {/* Review/Quiz — no content entry, just generate */}
      {selectedLesson && !loading && isReviewOrQuiz && (
        <div className="space-y-6">
          <div className="bg-warm-white border border-brown-100 rounded-xl p-6 text-center">
            <p className="font-semibold text-brown-800 mb-1">
              {lesson?.template_type === "quiz" ? "Unit Quiz" : "Review Lesson"}
            </p>
            <p className="text-sm text-brown-500 mb-4">
              This {lesson?.template_type} automatically uses content from all practice lessons in this unit. Click Generate to create exercises.
            </p>
            <button onClick={handleGenerate} disabled={generating}
              className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
              {generating ? "Generating..." : "Generate Exercises"}
            </button>
          </div>
        </div>
      )}

      {/* Content form (non-review/quiz) */}
      {selectedLesson && !loading && !isReviewOrQuiz && (
        <div className="space-y-6">
          {/* Status + Auto-fill + Band badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className={`text-xs font-medium ${statusLabel[contentStatus].color}`}>
                {statusLabel[contentStatus].text}
              </p>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${BAND_BADGE[band]}`}>
                {bandConfig.label}
              </span>
            </div>
            {isAlphabet ? (
              <p className="text-xs font-medium text-brown-400">Alphabet content is pre-set. You can edit example words and emoji.</p>
            ) : (
              <button onClick={handleAutofill} disabled={autofilling}
                className="flex items-center gap-1.5 border-2 border-gold/50 hover:border-gold text-gold-dark px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {autofilling ? "Generating..." : "\u2728 Auto-fill with AI"}
              </button>
            )}
          </div>

          <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
            <h2 className="font-semibold text-brown-800 mb-4">{contentLabel}</h2>

            {isAlphabet ? (
              /* ── ALPHABET TEMPLATE (unchanged) ── */
              <div className="space-y-4">
                {letterRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2">
                    <input placeholder="Upper" value={row.letter_upper} onChange={(e) => updateLetter(i, "letter_upper", e.target.value)} className={inputCls} />
                    <input placeholder="Lower" value={row.letter_lower} onChange={(e) => updateLetter(i, "letter_lower", e.target.value)} className={inputCls} />
                    <input placeholder="Name" value={row.letter_name} onChange={(e) => updateLetter(i, "letter_name", e.target.value)} className={inputCls} />
                    <input placeholder="Sound" value={row.sound} onChange={(e) => updateLetter(i, "sound", e.target.value)} className={inputCls} />
                    <input placeholder="Transliteration" value={row.transliteration} onChange={(e) => updateLetter(i, "transliteration", e.target.value)} className={inputCls} />
                    <input placeholder="Example word" value={row.example_word_target} onChange={(e) => updateLetter(i, "example_word_target", e.target.value)} className={inputCls} />
                    <input placeholder="English" value={row.example_word_eng} onChange={(e) => updateLetter(i, "example_word_eng", e.target.value)} className={inputCls} />
                    <input placeholder="Emoji" value={row.emoji} onChange={(e) => updateLetter(i, "emoji", e.target.value)} className={inputCls} />
                  </div>
                ))}
              </div>
            ) : (
              /* ── GRADE-BAND CONTENT LAYOUTS ── */
              <div className="space-y-2">
                {/* Words — all bands */}
                <SectionLabel>Words</SectionLabel>
                <div className="space-y-3">
                  {wordRows.map((row, i) => (
                    <div key={i} className={`grid gap-2 ${showEmoji ? "grid-cols-3" : "grid-cols-2"}`}>
                      <input placeholder={wordLabel} value={row.target_lang} onChange={(e) => updateWord(i, "target_lang", e.target.value)} className={inputCls} />
                      <input placeholder={engLabel} value={row.english} onChange={(e) => updateWord(i, "english", e.target.value)} className={inputCls} />
                      {showEmoji && <input placeholder="Emoji" value={row.emoji} onChange={(e) => updateWord(i, "emoji", e.target.value)} className={inputCls} />}
                    </div>
                  ))}
                  <button onClick={() => { setWordRows((prev) => [...prev, { ...EMPTY_WORD }]); markModified(); }}
                    className="text-xs text-gold hover:text-gold-dark font-medium">+ Add word</button>
                </div>

                {/* Phrases — early, developing, fluent */}
                {(band === "early" || band === "developing") && (
                  <>
                    <SectionLabel>Phrases</SectionLabel>
                    <div className="space-y-3">
                      {phraseRows.map((row, i) => (
                        <div key={i} className="grid grid-cols-2 gap-2">
                          <input placeholder={`${englishName} phrase`} value={row.target_lang} onChange={(e) => updatePhrase(i, "target_lang", e.target.value)} className={inputCls} />
                          <input placeholder="English" value={row.english} onChange={(e) => updatePhrase(i, "english", e.target.value)} className={inputCls} />
                        </div>
                      ))}
                      <button onClick={() => { setPhraseRows((prev) => [...prev, { ...EMPTY_PHRASE }]); markModified(); }}
                        className="text-xs text-gold hover:text-gold-dark font-medium">+ Add phrase</button>
                    </div>
                  </>
                )}

                {/* Reading passage — developing, fluent */}
                {(band === "developing" || band === "fluent") && (
                  <>
                    <SectionLabel>Reading Passage</SectionLabel>
                    <div className="space-y-2">
                      <input placeholder="Title" value={readingPassage.title}
                        onChange={(e) => { setReadingPassage((p) => ({ ...p, title: e.target.value })); markModified(); }}
                        className={`w-full ${inputCls}`} />
                      <textarea placeholder="Passage text..." value={readingPassage.text} rows={5}
                        onChange={(e) => { setReadingPassage((p) => ({ ...p, text: e.target.value })); markModified(); }}
                        className={textareaCls} />
                    </div>
                  </>
                )}

                {/* Grammar note — developing, fluent */}
                {(band === "developing" || band === "fluent") && (
                  <>
                    <SectionLabel>Grammar Focus</SectionLabel>
                    <div className="space-y-2">
                      <input placeholder="Topic" value={grammarNote.topic}
                        onChange={(e) => { setGrammarNote((p) => ({ ...p, topic: e.target.value })); markModified(); }}
                        className={`w-full ${inputCls}`} />
                      <textarea placeholder="Explanation..." value={grammarNote.explanation} rows={3}
                        onChange={(e) => { setGrammarNote((p) => ({ ...p, explanation: e.target.value })); markModified(); }}
                        className={textareaCls} />
                      <div className="space-y-1">
                        {grammarNote.examples.map((ex, i) => (
                          <input key={i} placeholder={`Example ${i + 1}`} value={ex}
                            onChange={(e) => {
                              const next = [...grammarNote.examples]; next[i] = e.target.value;
                              setGrammarNote((p) => ({ ...p, examples: next })); markModified();
                            }}
                            className={`w-full ${inputCls}`} />
                        ))}
                        <button onClick={() => { setGrammarNote((p) => ({ ...p, examples: [...p.examples, ""] })); markModified(); }}
                          className="text-xs text-gold hover:text-gold-dark font-medium">+ Add example</button>
                      </div>
                    </div>
                  </>
                )}

                {/* Composition prompt — fluent only */}
                {band === "fluent" && (
                  <>
                    <SectionLabel>Composition Prompt</SectionLabel>
                    <div className="space-y-2">
                      <textarea placeholder="Writing prompt..." value={compositionPrompt.prompt} rows={3}
                        onChange={(e) => { setCompositionPrompt((p) => ({ ...p, prompt: e.target.value })); markModified(); }}
                        className={textareaCls} />
                      <input placeholder="Instructions" value={compositionPrompt.instructions}
                        onChange={(e) => { setCompositionPrompt((p) => ({ ...p, instructions: e.target.value })); markModified(); }}
                        className={`w-full ${inputCls}`} />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-brown-500">Min sentences:</label>
                        <input type="number" min={1} max={20} value={compositionPrompt.min_sentences}
                          onChange={(e) => { setCompositionPrompt((p) => ({ ...p, min_sentences: parseInt(e.target.value) || 3 })); markModified(); }}
                          className={`w-20 ${inputCls}`} />
                      </div>
                    </div>
                  </>
                )}

                {/* Discussion questions — fluent only */}
                {band === "fluent" && (
                  <>
                    <SectionLabel>Discussion Questions</SectionLabel>
                    <div className="space-y-3">
                      {discussionQuestions.map((row, i) => (
                        <div key={i} className="grid grid-cols-2 gap-2">
                          <input placeholder={`Question (${englishName})`} value={row.question} onChange={(e) => updateDiscussion(i, "question", e.target.value)} className={inputCls} />
                          <input placeholder="Question (English)" value={row.question_eng} onChange={(e) => updateDiscussion(i, "question_eng", e.target.value)} className={inputCls} />
                        </div>
                      ))}
                      <button onClick={() => { setDiscussionQuestions((prev) => [...prev, { ...EMPTY_DISCUSSION }]); markModified(); }}
                        className="text-xs text-gold hover:text-gold-dark font-medium">+ Add question</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
              {saving ? "Saving..." : "Save Content"}
            </button>
            <button onClick={handleGenerate} disabled={generating}
              className="border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-5 py-2.5 rounded-lg text-sm font-medium">
              {generating ? "Generating..." : "Generate Lesson"}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <p className="text-sm text-brown-400 text-center py-8">Loading saved content...</p>
      )}
    </main>
  );
}
