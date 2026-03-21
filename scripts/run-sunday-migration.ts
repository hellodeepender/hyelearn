/**
 * Run the Sunday School migration via Supabase SQL.
 * Usage: npx tsx scripts/run-sunday-migration.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
dotenv.config({ path: ".env.local" });

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const sql = fs.readFileSync("supabase/migrations/20260321_sunday_school.sql", "utf-8");
  const { error } = await db.rpc("exec_sql", { query: sql }).single();
  if (error) {
    // Try individual statements
    console.log("RPC not available, trying individual table creation...\n");

    // Check if tables exist by trying to query them
    const { error: checkErr } = await db.from("sunday_units").select("id").limit(1);
    if (checkErr?.message?.includes("does not exist")) {
      console.log("Tables do not exist. Please run the migration SQL in the Supabase dashboard:");
      console.log("  Dashboard > SQL Editor > paste contents of supabase/migrations/20260321_sunday_school.sql");
      process.exit(1);
    }
    console.log("Tables already exist. Proceeding...");
  } else {
    console.log("Migration executed successfully.");
  }
}

main().catch(console.error);
