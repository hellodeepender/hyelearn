"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function CreateClassForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    // Get teacher's school_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("id", user.id)
      .single();

    const { error: insertError } = await supabase.from("classes").insert({
      name: name.trim(),
      grade_level: gradeLevel === "K" ? 0 : Number(gradeLevel),
      join_code: generateJoinCode(),
      teacher_id: user.id,
      school_id: profile?.school_id,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setName("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-warm-white border border-brown-100 rounded-xl p-5 space-y-4">
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
      <div>
        <label htmlFor="className" className="block text-sm font-medium text-brown-700 mb-1">
          Class Name
        </label>
        <input
          id="className"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Armenian 4A"
          className="w-full px-3 py-2 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white text-sm"
        />
      </div>
      <div>
        <label htmlFor="gradeLevel" className="block text-sm font-medium text-brown-700 mb-1">
          Grade Level
        </label>
        <select
          id="gradeLevel"
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
          className="w-full px-3 py-2 border border-brown-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-warm-white text-sm"
        >
          <option value="K">Kindergarten</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
            <option key={g} value={String(g)}>Grade {g}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? "Creating..." : "Create Class"}
      </button>
    </form>
  );
}
