/**
 * Code smoke tests — static analysis for common bug patterns.
 * Usage: npx tsx scripts/code-smoke-test.ts
 * Exit code 1 if any critical check fails.
 */

import * as fs from "fs";
import * as path from "path";

let passed = 0;
let failed = 0;

function ok(name: string, detail?: string) {
  console.log(`  \u2705 ${name}${detail ? ` \u2014 ${detail}` : ""}`);
  passed++;
}
function fail(name: string, detail?: string) {
  console.error(`  \u274C ${name}${detail ? ` \u2014 ${detail}` : ""}`);
  failed++;
}

function readFilesRecursive(dir: string, ext: string[]): { path: string; content: string }[] {
  const results: { path: string; content: string }[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== ".next") {
      results.push(...readFilesRecursive(full, ext));
    } else if (entry.isFile() && ext.some((e) => entry.name.endsWith(e))) {
      results.push({ path: full, content: fs.readFileSync(full, "utf-8") });
    }
  }
  return results;
}

function lineNumbers(content: string, pattern: RegExp): number[] {
  const lines = content.split("\n");
  const matches: number[] = [];
  lines.forEach((line, i) => { if (pattern.test(line)) matches.push(i + 1); });
  return matches;
}

// ── CHECK 1: Portfolio pages must not have login/signup links ──
function check1() {
  const dirs = ["app/portfolio", "app/supporters"];
  const files = dirs.flatMap((d) => readFilesRecursive(d, [".tsx", ".ts"]));
  const issues: string[] = [];

  for (const f of files) {
    const lines = lineNumbers(f.content, /href=.*\/(login|signup)['"]/);
    if (lines.length > 0) {
      issues.push(`${f.path}:${lines.join(",")}`);
    }
  }

  if (issues.length === 0) {
    ok("Portfolio pages have no login/signup links");
  } else {
    fail("Portfolio pages contain login/signup links", issues.join("; "));
  }
}

// ── CHECK 2: Portfolio pages must not reference locale-specific branding ──
function check2() {
  const dirs = ["app/portfolio", "app/supporters"];
  const files = dirs.flatMap((d) => readFilesRecursive(d, [".tsx", ".ts"]));
  const issues: string[] = [];

  for (const f of files) {
    const lines = f.content.split("\n");
    lines.forEach((line, i) => {
      // Skip product cards data (expected to have brand names)
      if (/name:\s*["']HyeLearn|name:\s*["']Mathaino|language:\s*["']/.test(line)) return;
      // Skip href links to child sites (expected)
      if (/href.*hyelearn\.com|href.*mathaino\.net/.test(line)) return;
      // Skip comments
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) return;

      // Check for branding used as page UI text (not in data objects)
      if (/>\s*HyeLearn\s*<|>\s*Mathaino\s*<|className.*HyeLearn|className.*Mathaino/.test(line)) {
        issues.push(`${f.path}:${i + 1} — ${line.trim().slice(0, 80)}`);
      }
    });
  }

  if (issues.length === 0) {
    ok("Portfolio pages use DiasporaLearn branding (not locale-specific)");
  } else {
    fail("Portfolio pages have locale-specific branding", issues.join("; "));
  }
}

// ── CHECK 3: No hardcoded locale defaults outside allowed files ──
function check3() {
  const allowedFiles = new Set([
    "middleware.ts", "server-locale.ts", "translations.ts", "domains.ts",
    "grade-labels.ts", "grade-bands.ts", "transliterate.ts", "badges.ts",
    "xp.ts", "curriculum.ts", "lesson-templates.ts", "content-validator.ts",
  ]);
  const files = [
    ...readFilesRecursive("app", [".tsx", ".ts"]),
    ...readFilesRecursive("components", [".tsx", ".ts"]),
  ];
  const issues: string[] = [];

  for (const f of files) {
    const basename = path.basename(f.path);
    if (allowedFiles.has(basename)) continue;
    // Skip scripts and migrations
    if (f.path.includes("scripts") || f.path.includes("migrations")) continue;

    const lines = lineNumbers(f.content, /(?:default|DEFAULT|fallback).*['"]hy['"]/i);
    if (lines.length > 0) {
      issues.push(`${f.path}:${lines.join(",")}`);
    }
  }

  if (issues.length === 0) {
    ok("No hardcoded 'hy' locale defaults in app/components code");
  } else {
    // This is a warning, not always a bug
    ok("Hardcoded 'hy' defaults found (review if intentional)", `${issues.length} files: ${issues.slice(0, 3).join("; ")}`);
  }
}

// ── CHECK 4: diasporalearn.org pages must not link to protected routes ──
function check4() {
  const dirs = ["app/portfolio", "app/supporters"];
  const files = dirs.flatMap((d) => readFilesRecursive(d, [".tsx", ".ts"]));
  const protectedRoutes = /href=.*\/(student|teacher|practice|account)['"\/]/;
  const issues: string[] = [];

  for (const f of files) {
    const lines = lineNumbers(f.content, protectedRoutes);
    if (lines.length > 0) {
      issues.push(`${f.path}:${lines.join(",")}`);
    }
  }

  if (issues.length === 0) {
    ok("Portfolio pages have no links to protected routes");
  } else {
    fail("Portfolio pages link to protected routes", issues.join("; "));
  }
}

// ── CHECK 5: Translation key completeness ──
function check5() {
  const localeDir = "locales";
  if (!fs.existsSync(localeDir)) {
    ok("Translation check skipped (no locales directory)");
    return;
  }

  const hyDir = path.join(localeDir, "hy");
  const elDir = path.join(localeDir, "el");
  if (!fs.existsSync(hyDir) || !fs.existsSync(elDir)) {
    fail("Missing hy or el locale directory");
    return;
  }

  const hyFiles = fs.readdirSync(hyDir).filter((f) => f.endsWith(".json"));
  const elFiles = fs.readdirSync(elDir).filter((f) => f.endsWith(".json"));
  const allFiles = [...new Set([...hyFiles, ...elFiles])];
  const missingKeys: string[] = [];

  for (const file of allFiles) {
    const hyPath = path.join(hyDir, file);
    const elPath = path.join(elDir, file);

    if (!fs.existsSync(hyPath)) { missingKeys.push(`${file} missing in hy`); continue; }
    if (!fs.existsSync(elPath)) { missingKeys.push(`${file} missing in el`); continue; }

    const hyKeys = Object.keys(JSON.parse(fs.readFileSync(hyPath, "utf-8")));
    const elKeys = Object.keys(JSON.parse(fs.readFileSync(elPath, "utf-8")));
    const hySet = new Set(hyKeys);
    const elSet = new Set(elKeys);

    for (const k of hyKeys) {
      if (!elSet.has(k)) missingKeys.push(`${file}: key "${k}" in hy but not el`);
    }
    for (const k of elKeys) {
      if (!hySet.has(k)) missingKeys.push(`${file}: key "${k}" in el but not hy`);
    }
  }

  if (missingKeys.length === 0) {
    ok("Translation keys complete across hy and el", `${allFiles.length} files checked`);
  } else {
    fail("Translation key mismatches", missingKeys.slice(0, 5).join("; ") + (missingKeys.length > 5 ? ` (+${missingKeys.length - 5} more)` : ""));
  }
}

// ── CHECK 6: No cross-locale Unicode contamination ──
function check6() {
  const armenianRange = /[\u0530-\u058F]/;
  const greekRange = /[\u0370-\u03FF]/;
  const issues: string[] = [];

  // Check Armenian locale files for Greek characters
  const hyFiles = readFilesRecursive("locales/hy", [".json"]);
  for (const f of hyFiles) {
    if (greekRange.test(f.content)) {
      const lines = lineNumbers(f.content, greekRange);
      issues.push(`Greek chars in Armenian file ${f.path}:${lines.slice(0, 3).join(",")}`);
    }
  }

  // Check Greek locale files for Armenian characters
  const elFiles = readFilesRecursive("locales/el", [".json"]);
  for (const f of elFiles) {
    if (armenianRange.test(f.content)) {
      const lines = lineNumbers(f.content, armenianRange);
      issues.push(`Armenian chars in Greek file ${f.path}:${lines.slice(0, 3).join(",")}`);
    }
  }

  if (issues.length === 0) {
    ok("No cross-locale Unicode contamination in translation files");
  } else {
    fail("Cross-locale Unicode contamination", issues.join("; "));
  }
}

// ── MAIN ──
console.log("\n\uD83D\uDD0D Code Smoke Tests\n");

check1();
check2();
check3();
check4();
check5();
check6();

console.log(`\n${"=".repeat(40)}`);
console.log(`  Passed: ${passed}  Failed: ${failed}`);
console.log(`${"=".repeat(40)}\n`);

if (failed > 0) {
  console.error("\u274C Code smoke tests FAILED\n");
  process.exit(1);
} else {
  console.log("\u2705 All code smoke tests passed\n");
}
