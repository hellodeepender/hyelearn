"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Level { id: string; slug: string; title: string; sort_order: number }
interface Unit { id: string; slug: string; title: string; level_id: string; sort_order: number }
interface Lesson { id: string; slug: string; title: string; unit_id: string; template_type: string; sort_order: number }

interface LetterRow { letter_upper: string; letter_lower: string; letter_name: string; transliteration: string; sound: string; example_word_arm: string; example_word_eng: string; emoji: string }
interface WordRow { armenian: string; english: string; emoji: string; category: string }

interface Props { levels: Level[]; units: Unit[]; lessons: Lesson[]; userId: string }

const EMPTY_LETTER: LetterRow = { letter_upper: "", letter_lower: "", letter_name: "", transliteration: "", sound: "", example_word_arm: "", example_word_eng: "", emoji: "" };
const EMPTY_WORD: WordRow = { armenian: "", english: "", emoji: "", category: "general" };

type ContentStatus = "empty" | "loaded" | "modified" | "ai";

export default function ContentClient({ levels, units, lessons, userId }: Props) {
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [letterRows, setLetterRows] = useState<LetterRow[]>([{ ...EMPTY_LETTER }, { ...EMPTY_LETTER }, { ...EMPTY_LETTER }]);
  const [wordRows, setWordRows] = useState<WordRow[]>([{ ...EMPTY_WORD }, { ...EMPTY_WORD }, { ...EMPTY_WORD }]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [contentStatus, setContentStatus] = useState<ContentStatus>("empty");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count?: number; learnCards?: number; exercises?: number; errors?: string[]; action?: string } | null>(null);
  const [error, setError] = useState("");

  const filteredUnits = units.filter((u) => u.level_id === selectedLevel);
  const filteredLessons = lessons.filter((l) => l.unit_id === selectedUnit);
  const lesson = lessons.find((l) => l.id === selectedLesson);
  const isAlphabet = lesson?.template_type === "alphabet";
  const isReviewOrQuiz = lesson?.template_type === "review" || lesson?.template_type === "quiz";

  // Load existing content items when lesson changes
  const loadContent = useCallback(async (lessonId: string) => {
    setLoading(true);
    setError("");
    setResult(null);
    setContentStatus("empty");

    const supabase = createClient();
    const { data: items } = await supabase
      .from("content_items")
      .select("item_type, item_data, sort_order")
      .eq("lesson_id", lessonId)
      .order("sort_order");

    if (items && items.length > 0) {
      const lessonObj = lessons.find((l) => l.id === lessonId);
      if (lessonObj?.template_type === "alphabet") {
        const rows = items
          .filter((i) => i.item_type === "letter")
          .map((i) => {
            const d = i.item_data as Record<string, string>;
            return {
              letter_upper: d.letter_upper ?? "",
              letter_lower: d.letter_lower ?? "",
              letter_name: d.letter_name ?? "",
              transliteration: d.transliteration ?? "",
              sound: d.sound ?? "",
              example_word_arm: d.example_word_arm ?? "",
              example_word_eng: d.example_word_eng ?? "",
              emoji: d.emoji ?? "",
            };
          });
        while (rows.length < 3) rows.push({ ...EMPTY_LETTER });
        setLetterRows(rows);
      } else {
        const rows = items
          .filter((i) => i.item_type === "word")
          .map((i) => {
            const d = i.item_data as Record<string, string>;
            return {
              armenian: d.armenian ?? "",
              english: d.english ?? "",
              emoji: d.emoji ?? "",
              category: d.category ?? "general",
            };
          });
        while (rows.length < 3) rows.push({ ...EMPTY_WORD });
        setWordRows(rows);
      }
      setContentStatus("loaded");
    } else {
      setLetterRows([{ ...EMPTY_LETTER }, { ...EMPTY_LETTER }, { ...EMPTY_LETTER }]);
      setWordRows([{ ...EMPTY_WORD }, { ...EMPTY_WORD }, { ...EMPTY_WORD }]);
      setContentStatus("empty");
    }
    setLoading(false);
  }, [lessons]);

  function selectLesson(lessonId: string) {
    setSelectedLesson(lessonId);
    if (lessonId) loadContent(lessonId);
  }

  function updateLetter(idx: number, field: keyof LetterRow, value: string) {
    setLetterRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    if (contentStatus === "loaded") setContentStatus("modified");
  }

  function updateWord(idx: number, field: keyof WordRow, value: string) {
    setWordRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    if (contentStatus === "loaded") setContentStatus("modified");
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
          templateType: lesson.template_type,
          lessonTitle: lesson.title,
          lessonDescription: "",
          unitTitle: unit?.title ?? "",
          lessonId: selectedLesson,
          unitId: selectedUnit,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Auto-fill failed");

      if (isAlphabet && Array.isArray(data.items)) {
        setLetterRows(data.items.map((item: Record<string, string>) => ({
          letter_upper: item.letter_upper ?? "",
          letter_lower: item.letter_lower ?? "",
          letter_name: item.letter_name ?? "",
          transliteration: item.transliteration ?? "",
          sound: item.sound ?? "",
          example_word_arm: item.example_word_arm ?? "",
          example_word_eng: item.example_word_eng ?? "",
          emoji: item.emoji ?? "",
        })));
      } else if (Array.isArray(data.items)) {
        setWordRows(data.items.map((item: Record<string, string>) => ({
          armenian: item.armenian ?? "",
          english: item.english ?? "",
          emoji: item.emoji ?? "",
          category: item.category ?? "general",
        })));
      }
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

    const items = isAlphabet
      ? letterRows.filter((r) => r.letter_upper).map((r, i) => ({
          unit_id: unitId, lesson_id: selectedLesson, item_type: "letter",
          sort_order: i + 1, item_data: r, created_by: userId,
        }))
      : wordRows.filter((r) => r.armenian).map((r, i) => ({
          unit_id: unitId, lesson_id: selectedLesson, item_type: "word",
          sort_order: i + 1, item_data: r, created_by: userId,
        }));

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
    empty: { text: "New — no content yet", color: "text-brown-400" },
    loaded: { text: "Saved content loaded", color: "text-green-600" },
    modified: { text: "Unsaved changes", color: "text-amber-600" },
    ai: { text: "AI-generated — review before saving", color: "text-amber-600" },
  };

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
        <select value={selectedLevel} onChange={(e) => { setSelectedLevel(e.target.value); setSelectedUnit(""); setSelectedLesson(""); setContentStatus("empty"); }}
          className="px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm">
          <option value="">Level...</option>
          {levels.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        <select value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setSelectedLesson(""); setContentStatus("empty"); }}
          className="px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm" disabled={!selectedLevel}>
          <option value="">Unit...</option>
          {filteredUnits.map((u) => <option key={u.id} value={u.id}>{u.title}</option>)}
        </select>
        <select value={selectedLesson} onChange={(e) => selectLesson(e.target.value)}
          className="px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm" disabled={!selectedUnit}>
          <option value="">Lesson...</option>
          {filteredLessons.map((l) => <option key={l.id} value={l.id}>{l.title} ({l.template_type})</option>)}
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
          {/* Status + Auto-fill */}
          <div className="flex items-center justify-between">
            <p className={`text-xs font-medium ${statusLabel[contentStatus].color}`}>
              {statusLabel[contentStatus].text}
            </p>
            <button onClick={handleAutofill} disabled={autofilling}
              className="flex items-center gap-1.5 border-2 border-gold/50 hover:border-gold text-gold-dark px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {autofilling ? "Generating..." : "\u2728 Auto-fill with AI"}
            </button>
          </div>

          <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
            <h2 className="font-semibold text-brown-800 mb-1">
              {isAlphabet ? "Letter Content" : "Vocabulary Content"}
            </h2>
            <p className="text-xs text-brown-400 mb-4">Template: {lesson?.template_type}</p>

            {isAlphabet ? (
              <div className="space-y-4">
                {letterRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2">
                    <input placeholder="Upper" value={row.letter_upper} onChange={(e) => updateLetter(i, "letter_upper", e.target.value)}
                      className="px-2 py-1.5 border border-brown-200 rounded text-sm bg-warm-white" />
                    <input placeholder="Lower" value={row.letter_lower} onChange={(e) => updateLetter(i, "letter_lower", e.target.value)}
                      className="px-2 py-1.5 border border-brown-200 rounded text-sm bg-warm-white" />
                    <input placeholder="Name" value={row.letter_name} onChange={(e) => updateLetter(i, "letter_name", e.target.value)}
                      className="px-2 py-1.5 border border-brown-200 rounded text-sm bg-warm-white" />
                    <input placeholder="Sound" value={row.sound} onChange={(e) => updateLetter(i, "sound", e.target.value)}
                      className="px-2 py-1.5 border border-brown-200 rounded text-sm bg-warm-white" />
                    <input placeholder="Transliteration" value={row.transliteration} onChange={(e) => updateLetter(i, "transliteration", e.target.value)}
                      className="px-2 py-1.5 border border-brown-200 rounded text-sm bg-warm-white" />
                    <input placeholder="Example word" value={row.example_word_arm} onChange={(e) => updateLetter(i, "example_word_arm", e.target.value)}
                      className="px-2 py-1.5 border border-brown-200 rounded text-sm bg-warm-white" />
                    <input placeholder="English" value={row.example_word_eng} onChange={(e) => updateLetter(i, "example_word_eng", e.target.value)}
                      className="px-2 py-1.5 border border-brown-200 rounded text-sm bg-warm-white" />
                    <input placeholder="Emoji" value={row.emoji} onChange={(e) => updateLetter(i, "emoji", e.target.value)}
                      className="px-2 py-1.5 border border-brown-200 rounded text-sm bg-warm-white" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {wordRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <input placeholder="Armenian word" value={row.armenian} onChange={(e) => updateWord(i, "armenian", e.target.value)}
                      className="px-2 py-1.5 border border-brown-200 rounded text-sm bg-warm-white" />
                    <input placeholder="English" value={row.english} onChange={(e) => updateWord(i, "english", e.target.value)}
                      className="px-2 py-1.5 border border-brown-200 rounded text-sm bg-warm-white" />
                    <input placeholder="Emoji" value={row.emoji} onChange={(e) => updateWord(i, "emoji", e.target.value)}
                      className="px-2 py-1.5 border border-brown-200 rounded text-sm bg-warm-white" />
                  </div>
                ))}
                <button onClick={() => { setWordRows((prev) => [...prev, { ...EMPTY_WORD }]); if (contentStatus === "loaded") setContentStatus("modified"); }}
                  className="text-xs text-gold hover:text-gold-dark font-medium">+ Add word</button>
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
