/**
 * Site integration tests — crawls all 4 production domains and reports issues.
 * Usage: npx tsx scripts/site-integration-test.ts
 * Exit code 1 if any critical check fails.
 */

const TIMEOUT = 10_000;

let passed = 0;
let failed = 0;
let skipped = 0;

function ok(name: string, detail?: string) {
  console.log(`  \u2705 ${name}${detail ? ` \u2014 ${detail}` : ""}`);
  passed++;
}
function fail(name: string, detail?: string) {
  console.error(`  \u274C ${name}${detail ? ` \u2014 ${detail}` : ""}`);
  failed++;
}
function skip(name: string, detail?: string) {
  console.log(`  \u23ED ${name}${detail ? ` \u2014 ${detail}` : ""}`);
  skipped++;
}

async function fetchSafe(url: string): Promise<{ status: number; text: string; contentType: string } | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "DiasporaLearn-IntegrationTest/1.0" },
    });
    clearTimeout(timer);
    const text = await res.text();
    return { status: res.status, text, contentType: res.headers.get("content-type") ?? "" };
  } catch (err) {
    return null;
  }
}

async function fetchStatus(url: string): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "DiasporaLearn-IntegrationTest/1.0" },
    });
    clearTimeout(timer);
    // Consume body to free connection
    await res.text();
    return res.status;
  } catch {
    return null;
  }
}

// ── Domains ─────────────────────────────────────────────────────

interface DomainSpec {
  domain: string;
  brand: string;
  wrongBrands: string[];
  locale: string;
  scriptRange?: [number, number]; // Unicode range for this locale's script
  forbiddenScripts?: [number, number][]; // Ranges that shouldn't appear
  extraRoutes?: string[];
}

const DOMAINS: DomainSpec[] = [
  {
    domain: "hyelearn.com",
    brand: "HyeLearn",
    wrongBrands: ["Mathaino", "Ta3allam"],
    locale: "hy",
    scriptRange: [0x0530, 0x058f],
    forbiddenScripts: [[0x0370, 0x03ff], [0x0600, 0x06ff]],
  },
  {
    domain: "mathaino.net",
    brand: "Mathaino",
    wrongBrands: ["HyeLearn", "Ta3allam"],
    locale: "el",
    scriptRange: [0x0370, 0x03ff],
    forbiddenScripts: [[0x0530, 0x058f], [0x0600, 0x06ff]],
  },
  {
    domain: "ta3allam.org",
    brand: "Ta3allam",
    wrongBrands: ["HyeLearn", "Mathaino"],
    locale: "ar",
    scriptRange: [0x0600, 0x06ff],
    forbiddenScripts: [[0x0530, 0x058f], [0x0370, 0x03ff]],
  },
  {
    domain: "diasporalearn.org",
    brand: "DiasporaLearn",
    wrongBrands: [],
    locale: "en",
    extraRoutes: ["/blog", "/supporters"],
  },
];

const COMMON_ROUTES = ["/", "/login", "/signup", "/privacy", "/terms", "/cookies", "/contact", "/pricing", "/sunday-school"];

// ── Test functions ──────────────────────────────────────────────

async function testPageAvailability(spec: DomainSpec) {
  console.log(`\n  --- Page Availability ---`);
  const routes = [...COMMON_ROUTES, ...(spec.extraRoutes ?? [])];
  for (const route of routes) {
    const url = `https://www.${spec.domain}${route}`;
    const status = await fetchStatus(url);
    if (status === 200) {
      ok(`GET ${route}`, `${status}`);
    } else if (status) {
      fail(`GET ${route}`, `${status}`);
    } else {
      fail(`GET ${route}`, "timeout/unreachable");
    }
  }
}

async function testBranding(spec: DomainSpec, html: string) {
  console.log(`\n  --- Branding ---`);
  if (html.includes(spec.brand)) {
    ok(`Contains "${spec.brand}"`);
  } else {
    fail(`Missing "${spec.brand}" in HTML`);
  }
  for (const wrong of spec.wrongBrands) {
    // Check header/nav area only (first 5000 chars covers the header)
    const header = html.slice(0, 5000);
    if (header.includes(wrong)) {
      fail(`Header contains wrong brand "${wrong}"`);
    } else {
      ok(`No "${wrong}" in header`);
    }
  }
}

function hasCharsInRange(text: string, lo: number, hi: number): boolean {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= lo && code <= hi) return true;
  }
  return false;
}

async function testCrossContamination(spec: DomainSpec, html: string) {
  if (!spec.forbiddenScripts?.length) return;
  console.log(`\n  --- Cross-Domain Script Contamination ---`);
  // Strip footer area (last 2000 chars which may have cross-links)
  const body = html.slice(0, Math.max(0, html.length - 2000));
  const rangeNames: Record<string, string> = {
    "1328-1423": "Armenian",
    "880-1023": "Greek",
    "1536-1791": "Arabic",
  };
  for (const [lo, hi] of spec.forbiddenScripts) {
    const label = rangeNames[`${lo}-${hi}`] ?? `U+${lo.toString(16)}-${hi.toString(16)}`;
    if (hasCharsInRange(body, lo, hi)) {
      fail(`Contains ${label} characters (cross-contamination)`);
    } else {
      ok(`No ${label} characters in main content`);
    }
  }
}

async function testBrokenImages(spec: DomainSpec, html: string) {
  console.log(`\n  --- Images ---`);
  const imgSrcs: string[] = [];
  const regex = /<img[^>]+src="([^"]+)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    imgSrcs.push(match[1]);
  }
  // Also check srcset and Next.js image patterns
  const srcsetRegex = /srcSet="([^"]+)"/g;
  while ((match = srcsetRegex.exec(html)) !== null) {
    const first = match[1].split(",")[0]?.trim().split(" ")[0];
    if (first) imgSrcs.push(first);
  }

  // Decode HTML entities in URLs
  const decoded = imgSrcs.map(s => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
  const unique = [...new Set(decoded)].slice(0, 15); // Cap at 15 to avoid overwhelming
  if (unique.length === 0) {
    skip("No images found in HTML");
    return;
  }

  let broken = 0;
  for (const src of unique) {
    const url = src.startsWith("http") ? src : `https://www.${spec.domain}${src}`;
    const status = await fetchStatus(url);
    if (status && status < 400) continue;
    fail(`Broken image: ${src}`, status ? `${status}` : "unreachable");
    broken++;
  }
  if (broken === 0) {
    ok(`All ${unique.length} images accessible`);
  }
}

async function testMetaTags(spec: DomainSpec, html: string) {
  console.log(`\n  --- Meta/SEO ---`);
  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
  if (titleMatch?.[1]?.includes(spec.brand)) {
    ok(`<title> contains "${spec.brand}"`);
  } else {
    fail(`<title> missing or wrong`, titleMatch?.[1]?.slice(0, 60) ?? "no title");
  }

  // Meta description
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  if (descMatch?.[1]?.length) {
    ok("Meta description present", `${descMatch[1].length} chars`);
  } else {
    fail("Meta description missing");
  }

  // Canonical
  const canonMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
  if (canonMatch?.[1]?.includes(spec.domain)) {
    ok("Canonical URL correct", canonMatch[1]);
  } else if (canonMatch) {
    fail("Canonical URL points to wrong domain", canonMatch[1]);
  } else {
    skip("No canonical tag found");
  }

  // OG tags
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/);
  if (ogTitle?.[1]) {
    ok("og:title present", ogTitle[1].slice(0, 50));
  } else {
    skip("og:title not found");
  }
}

async function testAuthBranding(spec: DomainSpec) {
  console.log(`\n  --- Auth Page Branding ---`);
  for (const route of ["/login", "/signup"]) {
    const res = await fetchSafe(`https://www.${spec.domain}${route}`);
    if (!res) { fail(`${route} unreachable`); continue; }
    if (res.text.includes(spec.brand)) {
      ok(`${route} shows "${spec.brand}"`);
    } else {
      fail(`${route} missing "${spec.brand}"`);
    }
    for (const wrong of spec.wrongBrands) {
      if (res.text.slice(0, 5000).includes(wrong)) {
        fail(`${route} header shows wrong brand "${wrong}"`);
      }
    }
  }
}

async function testSundaySchool(spec: DomainSpec) {
  if (spec.locale === "en") return; // diasporalearn.org doesn't have its own sunday school
  console.log(`\n  --- Sunday School ---`);
  const res = await fetchSafe(`https://www.${spec.domain}/sunday-school`);
  if (!res) { fail("Sunday School unreachable"); return; }
  if (res.status !== 200) { fail("Sunday School", `status ${res.status}`); return; }
  ok("Sunday School loads", `${res.status}`);

  // Check for locale-appropriate content
  if (spec.scriptRange) {
    const [lo, hi] = spec.scriptRange;
    if (hasCharsInRange(res.text, lo, hi)) {
      ok(`Contains ${spec.locale} script characters`);
    } else {
      fail(`No ${spec.locale} script characters found`);
    }
  }
}

async function testApiHealth(spec: DomainSpec) {
  console.log(`\n  --- API Health ---`);

  // Manifest
  const manifest = await fetchSafe(`https://www.${spec.domain}/api/manifest`);
  if (manifest?.status === 200) {
    try {
      const json = JSON.parse(manifest.text);
      if (json.name?.includes(spec.brand)) {
        ok("Manifest valid", `name: "${json.name}"`);
      } else {
        fail("Manifest wrong brand", `name: "${json.name}"`);
      }
    } catch {
      fail("Manifest invalid JSON");
    }
  } else {
    fail("Manifest", manifest ? `${manifest.status}` : "unreachable");
  }

  // Sitemap
  const sitemap = await fetchSafe(`https://www.${spec.domain}/sitemap.xml`);
  if (sitemap?.status === 200 && sitemap.text.includes("<urlset")) {
    ok("Sitemap valid XML");
  } else if (sitemap?.status === 200) {
    skip("Sitemap returned but may not be XML");
  } else {
    skip("Sitemap", sitemap ? `${sitemap.status}` : "unreachable");
  }
}

async function testPortfolio() {
  console.log(`\n  --- Portfolio Completeness ---`);
  const res = await fetchSafe("https://www.diasporalearn.org/");
  if (!res || res.status !== 200) { fail("Portfolio unreachable"); return; }

  for (const platform of ["HyeLearn", "Mathaino", "Ta3allam"]) {
    if (res.text.includes(platform)) {
      ok(`Lists "${platform}"`);
    } else {
      fail(`Missing "${platform}"`);
    }
  }

  if (res.text.includes("/blog")) {
    ok("Blog link present");
  } else {
    fail("Blog link missing");
  }

  // Check screenshot images
  const screenshots = ["screenshot-hyelearn", "screenshot-mathaino", "screenshot-ta3allam"];
  for (const name of screenshots) {
    if (res.text.includes(name)) {
      ok(`Screenshot reference: ${name}`);
    } else {
      fail(`Missing screenshot: ${name}`);
    }
  }
}

async function testTts(spec: DomainSpec) {
  if (spec.locale === "en") return;
  console.log(`\n  --- TTS ---`);
  const testWord = spec.locale === "ar" ? encodeURIComponent("\u0645\u0631\u062D\u0628\u0627") : "hello";
  const url = `https://www.${spec.domain}/api/tts?text=${testWord}&locale=${spec.locale}`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "DiasporaLearn-IntegrationTest/1.0" },
    });
    clearTimeout(timer);
    // Don't consume full body for audio
    const ct = res.headers.get("content-type") ?? "";
    if (res.status === 200 && (ct.includes("audio") || ct.includes("octet-stream"))) {
      ok(`TTS returns audio`, `${ct}`);
    } else if (res.status === 302 || res.status === 307) {
      // Redirect to cached audio is fine
      ok(`TTS redirects to cached audio`, `${res.status}`);
    } else {
      // TTS depends on Narakeet — don't fail the suite for third-party issues
      skip(`TTS`, `${res.status} (third-party API may be down)`);
    }
  } catch {
    fail("TTS unreachable");
  }
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  console.log("\n\uD83C\uDF10 Site Integration Tests\n");

  for (const spec of DOMAINS) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`  \uD83C\uDF0D ${spec.domain} (${spec.brand})`);
    console.log(`${"=".repeat(60)}`);

    // Fetch landing page once for multiple tests
    const landing = await fetchSafe(`https://www.${spec.domain}/`);
    const html = landing?.text ?? "";

    await testPageAvailability(spec);
    if (html) {
      await testBranding(spec, html);
      await testCrossContamination(spec, html);
      await testBrokenImages(spec, html);
      await testMetaTags(spec, html);
    } else {
      fail("Landing page unreachable \u2014 skipping HTML tests");
    }
    await testAuthBranding(spec);
    await testSundaySchool(spec);
    await testApiHealth(spec);
    if (spec.domain === "diasporalearn.org") {
      await testPortfolio();
    }
    await testTts(spec);
  }

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  SUMMARY`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  \u2705 Passed: ${passed}`);
  console.log(`  \u274C Failed: ${failed}`);
  if (skipped > 0) console.log(`  \u23ED Skipped: ${skipped}`);
  console.log();

  if (failed > 0) {
    console.error(`\u274C ${failed} test(s) failed.\n`);
    process.exit(1);
  }

  console.log(`\u2705 All ${passed} tests passed.\n`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
