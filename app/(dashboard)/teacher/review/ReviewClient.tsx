"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface ExerciseItem {
  id: string;
  type: string;
  data: Record<string, unknown>;
  lessonTitle: string;
  unitTitle: string;
}

export default function ReviewClient({ exercises: initial }: { exercises: ExerciseItem[] }) {
  const router = useRouter();
  const [exercises, setExercises] = useState(initial);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  async function handleAction(id: string, action: "approved" | "rejected", notes?: string) {
    setProcessing(id);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("curated_exercises").update({
      status: action,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
    }).eq("id", id);

    setExercises((prev) => prev.filter((e) => e.id !== id));
    setProcessing(null);
    setRejectId(null);
    setRejectNotes("");
    router.refresh();
  }

  if (exercises.length === 0) {
    return (
      <div className="bg-warm-white border border-brown-200 border-dashed rounded-xl p-8 text-center">
        <p className="text-brown-400">All exercises reviewed!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {exercises.map((ex) => (
        <div key={ex.id} className="bg-warm-white border border-brown-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
              {ex.type.replace("_", " ")}
            </span>
            <span className="text-xs text-brown-400">{ex.unitTitle} &rarr; {ex.lessonTitle}</span>
          </div>

          {/* Preview exercise data */}
          <div className="bg-cream/50 border border-brown-100 rounded-xl p-4 mb-4 text-sm">
            <pre className="whitespace-pre-wrap text-brown-700 overflow-auto max-h-60 font-mono text-xs">
              {JSON.stringify(ex.data, null, 2)}
            </pre>
          </div>

          {/* Actions */}
          {rejectId === ex.id ? (
            <div className="space-y-3">
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Why is this exercise being rejected?"
                className="w-full px-3 py-2 border border-brown-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 bg-warm-white"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(ex.id, "rejected", rejectNotes)}
                  disabled={!rejectNotes.trim() || processing === ex.id}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => { setRejectId(null); setRejectNotes(""); }}
                  className="border border-brown-200 text-brown-700 px-4 py-2 rounded-lg text-sm"
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
                {processing === ex.id ? "..." : "Approve"}
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
      ))}
    </div>
  );
}
