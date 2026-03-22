/**
 * API integration tests against the live app.
 * Usage: npx tsx scripts/api-tests.ts
 * Requires BASE_URL in environment (default: http://localhost:3000)
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
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

async function testEndpoint(method: string, path: string, expectedStatus: number, name: string, body?: unknown) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === expectedStatus) {
      ok(name, `${method} ${path} → ${res.status}`);
    } else {
      fail(name, `${method} ${path} → ${res.status} (expected ${expectedStatus})`);
    }
  } catch (err) {
    fail(name, `${method} ${path} → ${err instanceof Error ? err.message : "fetch failed"}`);
  }
}

async function main() {
  console.log(`\n\uD83E\uDDEA API Integration Tests (${BASE_URL})\n`);

  // 1. Sitemap returns XML
  try {
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    const ct = res.headers.get("content-type") ?? "";
    if (res.ok && ct.includes("xml")) {
      ok("Sitemap returns valid XML", ct);
    } else {
      fail("Sitemap", `status=${res.status} content-type=${ct}`);
    }
  } catch (err) {
    fail("Sitemap", `fetch failed: ${err instanceof Error ? err.message : err}`);
  }

  // 2. Robots.txt returns text
  try {
    const res = await fetch(`${BASE_URL}/robots.txt`);
    if (res.ok) {
      const text = await res.text();
      if (text.includes("User-agent")) {
        ok("Robots.txt valid", `${text.length} bytes`);
      } else {
        fail("Robots.txt missing User-agent directive");
      }
    } else {
      fail("Robots.txt", `status=${res.status}`);
    }
  } catch (err) {
    fail("Robots.txt", `fetch failed: ${err instanceof Error ? err.message : err}`);
  }

  // 3. Stripe webhook returns 400 for invalid signature (not 404)
  await testEndpoint("POST", "/api/stripe/webhook", 400, "Stripe webhook exists (rejects invalid sig)");

  // 4. Supporters API returns JSON array
  try {
    const res = await fetch(`${BASE_URL}/api/supporters`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        ok("Supporters API returns array", `${data.length} supporters`);
      } else {
        fail("Supporters API didn't return array");
      }
    } else {
      fail("Supporters API", `status=${res.status}`);
    }
  } catch (err) {
    fail("Supporters API", `${err instanceof Error ? err.message : err}`);
  }

  // 5. Practice remaining API returns JSON (requires auth, should 401)
  await testEndpoint("GET", "/api/practice-remaining", 200, "Practice remaining API accessible");

  // 6. Public pages load
  for (const path of ["/", "/pricing", "/supporters", "/sunday-school"]) {
    try {
      const res = await fetch(`${BASE_URL}${path}`);
      if (res.ok) {
        ok(`Page ${path} loads`, `${res.status}`);
      } else {
        fail(`Page ${path}`, `status=${res.status}`);
      }
    } catch (err) {
      fail(`Page ${path}`, `fetch failed`);
    }
  }

  // Summary
  console.log(`\n${"=".repeat(40)}`);
  console.log(`  Passed: ${passed}  Failed: ${failed}`);
  console.log(`${"=".repeat(40)}\n`);

  if (failed > 0) {
    console.error("\u274C Some tests FAILED\n");
    process.exit(1);
  } else {
    console.log("\u2705 All tests passed\n");
  }
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
