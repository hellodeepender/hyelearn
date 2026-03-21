/**
 * Seed initial donation records.
 * Usage: npx tsx scripts/seed-donations.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("Seeding donations...\n");

  const donations = [
    { donor_name: "Victoria Vartkessian", show_name: true, amount_cents: 0, created_at: "2026-03-21T00:00:00Z" },
    { donor_name: "Wartan Vartkessian", show_name: true, amount_cents: 0, created_at: "2026-03-20T00:00:00Z" },
    { donor_name: "Nina Vartkessian", show_name: true, amount_cents: 0, created_at: "2026-03-19T00:00:00Z" },
    { donor_name: "Ourania Kampagianni", show_name: true, amount_cents: 0, created_at: "2026-03-18T00:00:00Z" },
    { donor_name: "D Singh", show_name: true, amount_cents: 0, created_at: "2026-03-17T00:00:00Z" },
  ];

  for (const d of donations) {
    const { error } = await db.from("donations").insert(d);
    if (error) {
      if (error.message?.includes("does not exist")) {
        console.error("Table 'donations' does not exist. Run migration first.");
        process.exit(1);
      }
      console.error(`  Error: ${error.message}`);
    } else {
      console.log(`  ${d.donor_name}`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
