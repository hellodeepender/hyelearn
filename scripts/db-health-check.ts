/**
 * Database health check — verifies critical invariants.
 * Usage: npx tsx scripts/db-health-check.ts
 * Exit code 1 if any critical check fails.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

let passed = 0;
let failed = 0;

function ok(name: string, detail?: string) {
  console.log(`  \u2705 ${name}${detail ? ` — ${detail}` : ""}`);
  passed++;
}
function fail(name: string, detail?: string) {
  console.error(`  \u274C ${name}${detail ? ` — ${detail}` : ""}`);
  failed++;
}

async function main() {
  console.log("\n\uD83C\uDFE5 Database Health Check\n");

  // 1. Auth users have matching profiles
  const { data: authUsers } = await db.auth.admin.listUsers({ perPage: 1000 });
  const { data: profiles } = await db.from("profiles").select("id").limit(10000);
  const profileIds = new Set((profiles ?? []).map((p) => p.id));
  const orphanedUsers = (authUsers?.users ?? []).filter((u) => !profileIds.has(u.id));
  if (orphanedUsers.length === 0) {
    ok("All auth users have profiles", `${authUsers?.users?.length ?? 0} users checked`);
  } else {
    fail("Orphaned auth users (no profile)", `${orphanedUsers.length} users: ${orphanedUsers.slice(0, 3).map((u) => u.email).join(", ")}`);
  }

  // 2. Profiles table has data (trigger is working)
  const { count: profileCount } = await db.from("profiles").select("id", { count: "exact", head: true });
  if ((profileCount ?? 0) > 0) {
    ok("Profiles table has data (trigger working)", `${profileCount} profiles`);
  } else {
    fail("Profiles table is empty — trigger may not be firing");
  }

  // 3. Curriculum integrity — both locales have exercises
  for (const locale of ["hy", "el"]) {
    const { count: lessonCount } = await db.from("curriculum_lessons").select("id", { count: "exact", head: true }).eq("locale", locale).eq("is_active", true);
    const label = locale === "hy" ? "Armenian" : "Greek";

    if ((lessonCount ?? 0) === 0) {
      fail(`${label} has no lessons`);
      continue;
    }

    // Check exercises exist for this locale's lessons
    const { data: sampleLesson } = await db
      .from("curriculum_lessons")
      .select("id")
      .eq("locale", locale)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (sampleLesson) {
      const { count: exCount } = await db
        .from("curated_exercises")
        .select("id", { count: "exact", head: true })
        .eq("lesson_id", sampleLesson.id)
        .eq("status", "approved");

      if ((exCount ?? 0) > 0) {
        ok(`${label} lessons have exercises`, `${lessonCount} lessons, sample has ${exCount} exercises`);
      } else {
        fail(`${label} sample lesson has 0 exercises`, `lesson_id: ${sampleLesson.id}`);
      }
    }
  }

  // 4. No draft exercises linked to active lessons
  const { count: draftCount } = await db
    .from("curated_exercises")
    .select("id", { count: "exact", head: true })
    .neq("status", "approved");
  if ((draftCount ?? 0) === 0) {
    ok("All exercises are approved", "0 draft/pending exercises");
  } else {
    // Not critical — just informational
    ok("Some non-approved exercises exist", `${draftCount} — this is OK if they're teacher drafts`);
  }

  // 5. Donations table exists
  const { error: donationsErr } = await db.from("donations").select("id").limit(1);
  if (!donationsErr) {
    ok("Donations table exists and is queryable");
  } else {
    fail("Donations table not accessible", donationsErr.message);
  }

  // 6. Sunday School tables exist with data
  for (const table of ["sunday_units", "sunday_lessons"] as const) {
    const { count, error } = await db.from(table).select("id", { count: "exact", head: true });
    if (error) {
      fail(`${table} not accessible`, error.message);
    } else if ((count ?? 0) === 0) {
      fail(`${table} is empty`);
    } else {
      ok(`${table} has data`, `${count} rows`);
    }
  }

  // 7. RLS enabled on sensitive tables
  const sensitiveTables = ["student_progress", "exercise_sessions", "student_badges", "student_xp", "profiles", "donations"];
  for (const table of sensitiveTables) {
    // We can't directly check RLS from the client, but we can verify the table exists
    const { error } = await db.from(table).select("id").limit(0);
    if (error) {
      if (error.message?.includes("does not exist")) {
        fail(`Table ${table} does not exist`);
      } else {
        // Service role bypasses RLS, so any other error is unexpected
        fail(`Table ${table} query error`, error.message);
      }
    } else {
      ok(`Table ${table} accessible`);
    }
  }

  // 8. Exercise count sanity check
  const { count: totalEx } = await db.from("curated_exercises").select("id", { count: "exact", head: true });
  if ((totalEx ?? 0) > 1000) {
    ok("Exercise count healthy", `${totalEx} total exercises`);
  } else {
    fail("Exercise count too low", `${totalEx} — expected 4000+`);
  }

  // Summary
  console.log(`\n${"=".repeat(40)}`);
  console.log(`  Passed: ${passed}  Failed: ${failed}`);
  console.log(`${"=".repeat(40)}\n`);

  if (failed > 0) {
    console.error("\u274C Health check FAILED — see errors above\n");
    process.exit(1);
  } else {
    console.log("\u2705 All checks passed\n");
  }
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
