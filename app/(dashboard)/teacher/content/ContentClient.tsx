"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Level { id: string; title: string; sort_order: number }
interface Unit { id: string; title: string; level_id: string; sort_order: number }
interface Lesson { id: string; title: string; unit_id: string; template_type: string; sort_order: number }

interface LetterRow { letter_upper: string; letter_lower: string; letter_name: string; transliteration: string; sound: string; example_word_arm: string; example_word_eng: string; emoji: string }
interface WordRow { armenian: string; english: string; emoji: string; category: string }

interface Props { levels: Level[]; units: Unit[]; lessons: Lesson[]; userId: string }

const EMPTY_LETTER: LetterRow = { letter_upper: "", letter_lower: "", letter_name: "", transliteration: "", sound: "", example_word_arm: "", example_word_eng: "", emoji: "" };
const EMPTY_WORD: WordRow = { armenian: "", english: "", emoji: "", category: "general" };

export default function ContentClient({ levels, units, lessons, userId }: Props) {
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [letterRows, setLetterRows] = useState<LetterRow[]>([{ ...EMPTY_LETTER }, { ...EMPTY_LETTER }, { ...EMPTY_LETTER }]);
  const [wordRows, setWordRows] = useState<WordRow[]>([{ ...EMPTY_WORD }, { ...EMPTY_WORD }, { ...EMPTY_WORD }]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [result, setResult] = useState<{ count?: number; errors?: string[] } | null>(null);
  const [error, setError] = useState("");

  const filteredUnits = units.filter((u) => u.level_id === selectedLevel);
  const filteredLessons = lessons.filter((l) => l.unit_id === selectedUnit);
  const lesson = lessons.find((l) => l.id === selectedLesson);
  const isAlphabet = lesson?.template_type === "alphabet";

  function updateLetter(idx: number, field: keyof LetterRow, value: string) {
    setLetterRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }

  function updateWord(idx: number, field: keyof WordRow, value: string) {
    setWordRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }

  async function handleAutofill() {
    if (!selectedLesson || !lesson) return;
    setAutofilling(true);
    setError("");
    setResult(null);
    setAiGenerated(false);

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
      setAiGenerated(true);
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
    const unitId = lesson ? lessons.find((l) => l.id === selectedLesson)?.unit_id : null;

    // Delete existing content items for this lesson
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
      setResult({ count: items.length });
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
      setResult({ count: data.count, errors: data.validation?.errors });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    }
    setGenerating(false);
  }

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
          {result.count ? `${result.count} items processed.` : ""}
          {result.errors && result.errors.length > 0 && (
            <ul className="mt-2 list-disc ml-4">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Selectors */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <select value={selectedLevel} onChange={(e) => { setSelectedLevel(e.target.value); setSelectedUnit(""); setSelectedLesson(""); }}
          className="px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm">
          <option value="">Level...</option>
          {levels.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        <select value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setSelectedLesson(""); }}
          className="px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm" disabled={!selectedLevel}>
          <option value="">Unit...</option>
          {filteredUnits.map((u) => <option key={u.id} value={u.id}>{u.title}</option>)}
        </select>
        <select value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)}
          className="px-3 py-2 border border-brown-200 rounded-lg bg-warm-white text-sm" disabled={!selectedUnit}>
          <option value="">Lesson...</option>
          {filteredLessons.map((l) => <option key={l.id} value={l.id}>{l.title} ({l.template_type})</option>)}
        </select>
      </div>

      {/* Content form */}
      {selectedLesson && (
        <div className="space-y-6">
          {/* Auto-fill button */}
          <div className="flex items-center justify-between">
            <div />
            <button onClick={handleAutofill} disabled={autofilling}
              className="flex items-center gap-1.5 border-2 border-gold/50 hover:border-gold text-gold-dark px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {autofilling ? "Generating..." : "\u2728 Auto-fill with AI"}
            </button>
          </div>

          {aiGenerated && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3">
              AI-generated content. Please review before saving.
            </div>
          )}

          <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
            <h2 className="font-semibold text-brown-800 mb-1">
              {isAlphabet ? "Letter Content" : "Vocabulary Content"}
            </h2>
            <p className="text-xs text-brown-400 mb-4">Template: {lesson?.template_type}</p>

            {isAlphabet ? (
              <div className="space-y-4">
                {letterRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2">
                    <input placeholder="Upper (e.g. A)" value={row.letter_upper} onChange={(e) => updateLetter(i, "letter_upper", e.target.value)}
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
                <button onClick={() => setWordRows((prev) => [...prev, { ...EMPTY_WORD }])}
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
    </main>
  );
}
