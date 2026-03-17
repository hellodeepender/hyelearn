"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useLocale } from "@/lib/locale-context";

interface ExerciseItem {
  id: string;
  type: string;
  data: Record<string, unknown>;
  lessonTitle: string;
  unitTitle: string;
}

// --- Editable field component ---
function EditableField({ label, value, onChange, large, multiline }: {
  label: string; value: string; onChange: (v: string) => void; large?: boolean; multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  if (editing) {
    const cls = "w-full px-3 py-2 border border-gold/50 rounded-lg text-sm bg-gold/5 focus:outline-none focus:ring-2 focus:ring-gold/30";
    return (
      <div className="mb-2">
        <label className="block text-[10px] uppercase text-brown-400 mb-0.5">{label}</label>
        {multiline ? (
          <textarea ref={ref as React.RefObject<HTMLTextAreaElement>} value={value} onChange={(e) => onChange(e.target.value)}
            onBlur={() => setEditing(false)} rows={2} className={cls} autoFocus />
        ) : (
          <input ref={ref as React.RefObject<HTMLInputElement>} type="text" value={value} onChange={(e) => onChange(e.target.value)}
            onBlur={() => setEditing(false)} className={cls} autoFocus />
        )}
      </div>
    );
  }

  return (
    <div className="group mb-1 cursor-pointer" onClick={() => setEditing(true)}>
      <p className={`${large ? "text-xl font-semibold text-brown-800" : "text-sm text-brown-400"} flex items-center gap-1`}>
        <span>{value || "(empty)"}</span>
        <span className="opacity-0 group-hover:opacity-100 text-brown-300 text-xs transition-opacity">&#9998;</span>
      </p>
    </div>
  );
}

// --- Exercise preview renderers ---
function MCPreview({ data, onUpdate, lang }: { data: Record<string, unknown>; onUpdate: (d: Record<string, unknown>) => void; lang: string }) {
  const emoji = data.emoji as string | undefined;
  const options = (data.options ?? []) as { id: string; text_hy: string; text_en: string; correct: boolean; emoji?: string }[];

  return (
    <div className="space-y-4">
      {emoji && <div className="text-4xl text-center">{emoji}</div>}
      <EditableField label={`Question (${lang})`} value={String(data.question_hy ?? "")} large
        onChange={(v) => onUpdate({ ...data, question_hy: v })} />
      <EditableField label="Question (English)" value={String(data.question_en ?? "")}
        onChange={(v) => onUpdate({ ...data, question_en: v })} />

      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${opt.correct ? "border-green-400 bg-green-50" : "border-brown-100 bg-brown-50/50"}`}>
            {opt.emoji && <span className="text-2xl">{opt.emoji}</span>}
            <div className="flex-1 min-w-0">
              <EditableField label={`Option ${opt.id.toUpperCase()} (${lang})`} value={opt.text_hy} large
                onChange={(v) => {
                  const newOpts = [...options];
                  newOpts[i] = { ...newOpts[i], text_hy: v };
                  onUpdate({ ...data, options: newOpts });
                }} />
              <EditableField label={`Option ${opt.id.toUpperCase()} (English)`} value={opt.text_en}
                onChange={(v) => {
                  const newOpts = [...options];
                  newOpts[i] = { ...newOpts[i], text_en: v };
                  onUpdate({ ...data, options: newOpts });
                }} />
            </div>
            <button
              onClick={() => {
                const newOpts = options.map((o, j) => ({ ...o, correct: j === i }));
                onUpdate({ ...data, options: newOpts });
              }}
              className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm ${
                opt.correct ? "border-green-500 bg-green-500 text-white" : "border-brown-200 text-brown-300 hover:border-green-300"
              }`}
              title="Mark as correct"
            >
              {opt.correct ? "\u2713" : ""}
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-brown-100 pt-3">
        <EditableField label={`Explanation (${lang})`} value={String(data.explanation_hy ?? "")} multiline
          onChange={(v) => onUpdate({ ...data, explanation_hy: v })} />
        <EditableField label="Explanation (English)" value={String(data.explanation_en ?? "")} multiline
          onChange={(v) => onUpdate({ ...data, explanation_en: v })} />
      </div>
    </div>
  );
}

function FBPreview({ data, onUpdate, lang }: { data: Record<string, unknown>; onUpdate: (d: Record<string, unknown>) => void; lang: string }) {
  const emoji = data.emoji as string | undefined;
  const distractorsHy = (data.distractors_hy ?? []) as string[];
  const distractorsEn = (data.distractors_en ?? []) as string[];

  return (
    <div className="space-y-4">
      {emoji && <div className="text-4xl text-center">{emoji}</div>}
      <EditableField label={`Sentence (${lang}, use ___ for blank)`} value={String(data.sentence_hy ?? "")} large
        onChange={(v) => onUpdate({ ...data, sentence_hy: v })} />
      <EditableField label="Sentence (English)" value={String(data.sentence_en ?? "")}
        onChange={(v) => onUpdate({ ...data, sentence_en: v })} />

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl border-2 border-green-400 bg-green-50">
          <p className="text-[10px] uppercase text-green-600 mb-1">Correct Answer</p>
          <EditableField label={lang} value={String(data.answer_hy ?? "")} large
            onChange={(v) => onUpdate({ ...data, answer_hy: v })} />
          <EditableField label="English" value={String(data.answer_en ?? "")}
            onChange={(v) => onUpdate({ ...data, answer_en: v })} />
        </div>
        {distractorsHy.map((d, i) => (
          <div key={i} className="p-3 rounded-xl border-2 border-brown-100 bg-brown-50/50">
            <p className="text-[10px] uppercase text-brown-400 mb-1">Distractor {i + 1}</p>
            <EditableField label={lang} value={d} large
              onChange={(v) => {
                const nd = [...distractorsHy]; nd[i] = v;
                onUpdate({ ...data, distractors_hy: nd });
              }} />
            <EditableField label="English" value={distractorsEn[i] ?? ""}
              onChange={(v) => {
                const nd = [...distractorsEn]; nd[i] = v;
                onUpdate({ ...data, distractors_en: nd });
              }} />
          </div>
        ))}
      </div>

      <div className="border-t border-brown-100 pt-3">
        <EditableField label={`Explanation (${lang})`} value={String(data.explanation_hy ?? "")} multiline
          onChange={(v) => onUpdate({ ...data, explanation_hy: v })} />
        <EditableField label="Explanation (English)" value={String(data.explanation_en ?? "")} multiline
          onChange={(v) => onUpdate({ ...data, explanation_en: v })} />
      </div>
    </div>
  );
}

function MatchPreview({ data, onUpdate, lang }: { data: Record<string, unknown>; onUpdate: (d: Record<string, unknown>) => void; lang: string }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-[10px] uppercase text-brown-400 mb-2">Left Column</p>
        <EditableField label={lang} value={String(data.left_hy ?? "")} large
          onChange={(v) => onUpdate({ ...data, left_hy: v })} />
        <EditableField label="English" value={String(data.left_en ?? "")}
          onChange={(v) => onUpdate({ ...data, left_en: v })} />
      </div>
      <div>
        <p className="text-[10px] uppercase text-brown-400 mb-2">Right Column (Match)</p>
        <EditableField label={lang} value={String(data.right_hy ?? "")} large
          onChange={(v) => onUpdate({ ...data, right_hy: v })} />
        <EditableField label="English" value={String(data.right_en ?? "")}
          onChange={(v) => onUpdate({ ...data, right_en: v })} />
      </div>
    </div>
  );
}

function TFPreview({ data, onUpdate, lang }: { data: Record<string, unknown>; onUpdate: (d: Record<string, unknown>) => void; lang: string }) {
  const emoji = data.emoji as string | undefined;
  const correct = data.correct_answer as boolean;

  return (
    <div className="space-y-4">
      {emoji && <div className="text-4xl text-center">{emoji}</div>}
      <EditableField label={`Statement (${lang})`} value={String(data.statement_hy ?? "")} large
        onChange={(v) => onUpdate({ ...data, statement_hy: v })} />
      <EditableField label="Statement (English)" value={String(data.statement_en ?? "")}
        onChange={(v) => onUpdate({ ...data, statement_en: v })} />

      <div className="flex gap-3">
        <button
          onClick={() => onUpdate({ ...data, correct_answer: true })}
          className={`flex-1 p-3 rounded-xl border-2 text-center font-medium ${correct ? "border-green-400 bg-green-50 text-green-700" : "border-brown-100 text-brown-400"}`}
        >
          \u2713 True
        </button>
        <button
          onClick={() => onUpdate({ ...data, correct_answer: false })}
          className={`flex-1 p-3 rounded-xl border-2 text-center font-medium ${!correct ? "border-green-400 bg-green-50 text-green-700" : "border-brown-100 text-brown-400"}`}
        >
          \u2717 False
        </button>
      </div>

      <div className="border-t border-brown-100 pt-3">
        <EditableField label={`Explanation (${lang})`} value={String(data.explanation_hy ?? "")} multiline
          onChange={(v) => onUpdate({ ...data, explanation_hy: v })} />
        <EditableField label="Explanation (English)" value={String(data.explanation_en ?? "")} multiline
          onChange={(v) => onUpdate({ ...data, explanation_en: v })} />
      </div>
    </div>
  );
}

// --- Main Review Client ---
export default function ReviewClient({ exercises: initial }: { exercises: ExerciseItem[] }) {
  const { englishName: lang } = useLocale();
  const router = useRouter();
  const [exercises, setExercises] = useState(initial);
  const [editedData, setEditedData] = useState<Map<string, Record<string, unknown>>>(new Map());
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [reviewed, setReviewed] = useState(0);
  const total = initial.length;

  function updateExerciseData(id: string, data: Record<string, unknown>) {
    setEditedData((prev) => new Map(prev).set(id, data));
  }

  function getExerciseData(ex: ExerciseItem): Record<string, unknown> {
    return editedData.get(ex.id) ?? ex.data;
  }

  function hasEdits(id: string): boolean {
    return editedData.has(id);
  }

  async function handleAction(id: string, action: "approved" | "rejected", notes?: string) {
    setProcessing(id);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const currentData = editedData.get(id);

    // Save exercise review history
    const original = exercises.find((e) => e.id === id);
    if (original && user) {
      await supabase.from("exercise_reviews").insert({
        exercise_id: id,
        reviewer_id: user.id,
        original_data: original.data,
        corrected_data: currentData ?? null,
        notes: notes || null,
        action,
      });
    }

    // Update exercise
    const updates: Record<string, unknown> = {
      status: action,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
    };
    if (currentData) {
      updates.exercise_data = currentData;
    }

    await supabase.from("curated_exercises").update(updates).eq("id", id);

    setExercises((prev) => prev.filter((e) => e.id !== id));
    setEditedData((prev) => { const n = new Map(prev); n.delete(id); return n; });
    setProcessing(null);
    setRejectId(null);
    setRejectNotes("");
    setReviewed((r) => r + 1);
    router.refresh();
  }

  async function handleApproveAll() {
    for (const ex of exercises) {
      await handleAction(ex.id, "approved");
    }
  }

  if (exercises.length === 0) {
    return (
      <div className="bg-warm-white border border-brown-200 border-dashed rounded-xl p-10 text-center">
        <p className="text-2xl mb-2">{"\u2713"}</p>
        <p className="text-brown-700 font-medium">All exercises reviewed!</p>
        <p className="text-brown-400 text-sm mt-1">{reviewed} exercise{reviewed !== 1 ? "s" : ""} processed</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar and bulk action */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-brown-500">
          {reviewed} of {total} reviewed &middot; {exercises.length} remaining
        </p>
        {exercises.length > 1 && (
          <button
            onClick={handleApproveAll}
            disabled={processing !== null}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Approve All ({exercises.length})
          </button>
        )}
      </div>

      {exercises.map((ex, idx) => {
        const data = getExerciseData(ex);
        const edited = hasEdits(ex.id);

        return (
          <div key={ex.id} className="bg-warm-white border border-brown-100 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-brown-50/50 border-b border-brown-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                  {ex.type.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-brown-400">
                  {ex.unitTitle} &rarr; {ex.lessonTitle}
                </span>
              </div>
              <span className="text-xs text-brown-300">#{idx + 1}</span>
            </div>

            {/* Rendered preview with inline editing */}
            <div className="px-6 py-5">
              {ex.type === "multiple_choice" && (
                <MCPreview data={data} onUpdate={(d) => updateExerciseData(ex.id, d)} lang={lang} />
              )}
              {ex.type === "fill_blank" && (
                <FBPreview data={data} onUpdate={(d) => updateExerciseData(ex.id, d)} lang={lang} />
              )}
              {ex.type === "matching" && (
                <MatchPreview data={data} onUpdate={(d) => updateExerciseData(ex.id, d)} lang={lang} />
              )}
              {ex.type === "true_false" && (
                <TFPreview data={data} onUpdate={(d) => updateExerciseData(ex.id, d)} lang={lang} />
              )}
            </div>

            {/* Edited indicator */}
            {edited && (
              <div className="mx-6 mb-3 px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-lg text-xs text-gold-dark">
                You have unsaved edits. Click Approve to save and approve.
              </div>
            )}

            {/* Actions */}
            <div className="px-6 py-4 bg-brown-50/30 border-t border-brown-100">
              {rejectId === ex.id ? (
                <div className="space-y-3">
                  <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Why is this exercise being rejected?"
                    className="w-full px-3 py-2 border border-brown-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 bg-warm-white"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(ex.id, "rejected", rejectNotes)}
                      disabled={!rejectNotes.trim() || processing === ex.id}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      {processing === ex.id ? "Rejecting..." : "Confirm Reject"}
                    </button>
                    <button
                      onClick={() => { setRejectId(null); setRejectNotes(""); }}
                      className="border border-brown-200 text-brown-600 px-4 py-2 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(ex.id, "approved")}
                    disabled={processing === ex.id}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {processing === ex.id ? "Approving..." : edited ? "Save & Approve" : "Approve"}
                  </button>
                  <button
                    onClick={() => setRejectId(ex.id)}
                    className="border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
