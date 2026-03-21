# Codebase Audit Report

**Date:** 2026-03-21
**Scope:** Full codebase audit — bugs, Sunday School, quest map, auth, performance, unused code, consistency

---

## Summary

**Overall status: Production-ready.** Zero TypeScript errors. Zero broken imports. All features wired correctly. Two minor cleanup opportunities and a few low-priority items.

| Severity | Count |
|----------|-------|
| P0 (Critical) | 0 |
| P1 (High) | 0 |
| P2 (Medium/Low) | 6 |

---

## 1. Bugs & Errors

### TypeScript
- `npx tsc --noEmit` passes with zero errors.
- No broken imports found across all `.tsx` and `.ts` files.

### Dead pricing references
- **No active code** contains "$9.99", "$79.99", "Upgrade", "Go Pro", or "premium feature" in `app/` or `components/` directories.
- The unused `Paywall.tsx` still contains old pricing text (see item #6 below).

---

## 2. Sunday School Track

| Check | Status |
|-------|--------|
| `/sunday-school` route renders | OK |
| `/sunday-school/[lessonId]` route renders | OK |
| AudioPlayButton import resolves | OK |
| DownloadPDFButton import resolves (dynamic jsPDF) | OK |
| Supabase query fields match `sunday_units` schema | OK |
| Supabase query fields match `sunday_lessons` schema | OK |
| JSONB interfaces (Opening, Story, VocabWord, Activity, Closing) match DB | OK |
| `audio_url` fields in JSONB types | OK |
| Prev/next lesson navigation | OK |
| K-5 CTA banner on both pages | OK |

**No issues found.**

---

## 3. Quest Map

### Asset verification

All 25 PNG files present in `public/images/quest-map/`:
- 10 Armenian icons (hy-icon-*.png) — all referenced in MapPath.tsx `HY_ICONS` array
- 10 Greek icons (el-icon-*.png) — all referenced in MapPath.tsx `EL_ICONS` array
- 2 backgrounds (quest-bg-armenian.png, quest-bg-greek.png) — referenced in MapPath.tsx
- 3 reward assets (reward-trophy.png, reward-star.png, reward-chest.png) — present but **not yet referenced in code**

### Issues

| # | File | Line | Severity | Issue | Suggested Fix |
|---|------|------|----------|-------|---------------|
| 1 | `public/images/quest-map/reward-*.png` | — | P2 | 3 reward assets (trophy, star, chest) exist but are not referenced anywhere in code | Either wire them into the confetti/completion celebration or remove them to save bundle size |

---

## 4. Auth & RLS

| Check | Status |
|-------|--------|
| `/sunday-school` NOT in middleware protected routes | OK — public |
| `sunday_units` has public SELECT policy | OK |
| `sunday_lessons` has public SELECT policy | OK |
| Admin-only INSERT/UPDATE/DELETE policies | OK |
| No `auth.getUser()` call in Sunday School pages | OK — uses anon client |

**No issues found.**

---

## 5. Performance Concerns

| # | File | Line | Severity | Issue | Suggested Fix |
|---|------|------|----------|-------|---------------|
| 2 | `components/curriculum/MapPath.tsx` | 143 | P2 | Uses `<img>` tags inside absolute-positioned divs for quest map icons. These are static PNGs that could benefit from `next/image` optimization, but the dynamic positioning makes it impractical. Current `loading="lazy"` is applied. | Acceptable as-is. Consider compressing PNGs if they're large. |
| 3 | `app/(dashboard)/student/page.tsx` | 232 | P2 | Badge images use plain `<img>` tags with dynamic `src` from DB. Could use `next/image` with `unoptimized` prop for external URLs. | Low priority — images are small badge PNGs served from same domain. |

**jsPDF bundle**: Correctly dynamically imported in `DownloadPDFButton.tsx` via `await import()` — not in main bundle.

---

## 6. Unused Code

| # | File | Line | Severity | Issue | Suggested Fix |
|---|------|------|----------|-------|---------------|
| 4 | `components/ui/Paywall.tsx` | entire file | P2 | Component exists but is not imported anywhere. Contains stale pricing text ($9.99). | Delete the file. No code references it. |
| 5 | `components/curriculum/MapIcons.tsx` | entire file | P2 | All SVG icon exports (Pomegranate, Khachkar, Amphora, etc.) and `getIconSet()` are no longer imported anywhere. MapPath.tsx now uses PNG icons. The extra icons added for badges (OliveBranch, Monastery, Oracle) are also unused. | Delete or keep for potential future use. Not causing harm but adds ~180 lines of dead code. |

---

## 7. Consistency Issues

| # | File | Line | Severity | Issue | Suggested Fix |
|---|------|------|----------|-------|---------------|
| 6 | `lib/generate-sunday-school-pdf.ts` | ~195 | P2 | PDF footer hardcodes "diasporalearn.org" regardless of locale. This is likely intentional (brand URL), but the brand name ("HyeLearn" vs "Mathaino") is correctly locale-aware on the same line. | Confirm intentional. No action needed if so. |

### Verified clean

- No remaining Armenian-only assumptions in shared code
- All locale-switching (`hy`/`el`) works correctly in: badges, XP levels, curriculum queries, translations, domain config
- `getEnglishTitle()` only activates for `el` locale (Armenian titles are already English-friendly)
- Grade labels mapping covers all Greek level/unit/lesson titles

---

## Files Verified

- `app/sunday-school/page.tsx` (197 lines)
- `app/sunday-school/[lessonId]/page.tsx` (338 lines)
- `components/ui/AudioPlayButton.tsx` (53 lines)
- `components/sunday-school/DownloadPDFButton.tsx` (37 lines)
- `components/curriculum/MapPath.tsx` (287 lines)
- `components/curriculum/MapIcons.tsx` (183 lines)
- `lib/generate-sunday-school-pdf.ts` (219 lines)
- `lib/word-search.ts` (104 lines)
- `lib/badges.ts` (59 lines)
- `lib/access.ts` (101 lines)
- `middleware.ts` (89 lines)
- `config/domains.ts` (139 lines)
- `app/globals.css` (78 lines)
- `supabase/migrations/20260321_sunday_school.sql` (58 lines)
- All 25 quest-map PNG assets

---

## Recommendation

The codebase is clean and production-ready. The only actionable items are:
1. Delete `components/ui/Paywall.tsx` (dead code with stale pricing)
2. Delete or archive `components/curriculum/MapIcons.tsx` (SVG icons replaced by PNGs)
3. Optionally wire reward PNGs into completion celebrations
