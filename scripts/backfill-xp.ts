/**
 * Backfill XP for all students based on their completed lessons.
 * Recalculates total_xp from student_progress and updates profiles.
 *
 * Usage: npx tsx scripts/backfill-xp.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const XP = { LESSON_COMPLETE: 10, REVIEW_COMPLETE: 10, QUIZ_PASS: 25, PERFECT_BONUS: 5 };

async function main() {
  console.log("\n\uD83D\uDD04 Backfilling XP from student_progress\n");

  // Get all students with progress
  const { data: students } = await db.from("profiles").select("id, full_name, total_xp").eq("role", "student");
  if (!students || students.length === 0) { console.log("No students found."); return; }

  for (const student of students) {
    // Get all passed lessons with their template type
    const { data: progress } = await db
      .from("student_progress")
      .select("lesson_id, passed, score, total, curriculum_lessons!inner(template_type)")
      .eq("student_id", student.id)
      .eq("passed", true);

    if (!progress || progress.length === 0) {
      console.log(`  ${student.full_name}: 0 passed lessons, skipping`);
      continue;
    }

    let calculatedXP = 0;
    for (const p of progress) {
      const templateType = (p.curriculum_lessons as unknown as { template_type: string }).template_type;
      if (templateType === "quiz") {
        calculatedXP += XP.QUIZ_PASS;
      } else if (templateType === "review") {
        calculatedXP += XP.REVIEW_COMPLETE;
      } else {
        calculatedXP += XP.LESSON_COMPLETE;
      }
      // Perfect score bonus
      if (p.total && p.total > 0 && p.score === p.total) {
        calculatedXP += XP.PERFECT_BONUS;
      }
    }

    // Update if different
    if (calculatedXP !== (student.total_xp ?? 0)) {
      await db.from("profiles").update({ total_xp: calculatedXP }).eq("id", student.id);
      console.log(`  \u2705 ${student.full_name}: ${student.total_xp ?? 0} \u2192 ${calculatedXP} XP (${progress.length} lessons)`);
    } else {
      console.log(`  \u2713 ${student.full_name}: ${calculatedXP} XP (already correct)`);
    }

    // Ensure student_xp rows exist for each lesson
    for (const p of progress) {
      const templateType = (p.curriculum_lessons as unknown as { template_type: string }).template_type;
      const source = templateType === "quiz" ? "quiz_pass" : templateType === "review" ? "review_complete" : "lesson_complete";
      const amount = templateType === "quiz" ? XP.QUIZ_PASS : templateType === "review" ? XP.REVIEW_COMPLETE : XP.LESSON_COMPLETE;

      const { data: existing } = await db
        .from("student_xp")
        .select("id")
        .eq("student_id", student.id)
        .eq("source", source)
        .eq("source_id", p.lesson_id)
        .limit(1);

      if (!existing || existing.length === 0) {
        await db.from("student_xp").insert({
          student_id: student.id,
          xp_amount: amount,
          source,
          source_id: p.lesson_id,
        });
      }
    }
  }

  console.log("\n\u2728 Done!\n");
}

main().catch(console.error);
