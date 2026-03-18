# Phase 3 — Bug List & Status

*Generated: March 17, 2026*
*Pick up from here next session.*

---

## Completed ✅

| # | Task | Commit |
|---|------|--------|
| 1 | JSONB field rename: `armenian` → `target_lang`, `example_word_arm` → `example_word_target` | ✅ DB + code |
| 2 | `lib/grade-bands.ts` — single source of truth for band/content/exercise mapping | ✅ |
| 3 | Content editor — 4 layouts per grade band (Emergent/Early/Developing/Fluent) | ✅ |
| 4 | `api/autofill-content` — locale-aware, generates all content types per band | ✅ |
| 5 | `lib/lesson-templates.ts` — exercise generation for phrases, passages, grammar, composition, discussion | ✅ |
| 6 | `lib/content-validator.ts` — updated for new item types | ✅ |
| 7 | Greek K–2 curriculum structure seeded (3 levels, 18 units, 90 lessons) | ✅ |
| 8 | Bulk seed script (`scripts/bulk-seed.ts`) — all 90 Greek lessons seeded | ✅ |
| 9 | TTS route made locale-aware (voice map: hy→nune, el→eleni placeholder) | ✅ |
| 10 | Matching component — gold highlight on both sides, unique IDs per pair | ✅ |

---

## Known Bugs 🐛

### P0 — Must fix before educator review

**BUG-1: Duplicate alphabet letters in Armenian content**
- Severity: **P0** — breaks exercises (duplicate MC options, wrong matching)
- Root cause: Bulk seed script called autofill for each lesson sequentially, but the exclusion logic didn't properly track letters already seeded in earlier API calls within the same run.
- Evidence: `Ֆ` appears 10 times, `Ք` appears 10 times across alphabet units
- Fix approach: 
  1. Delete ALL Armenian alphabet content_items
  2. Fix the exclusion logic in `autofill-content` to query existing letters BEFORE generating
  3. Re-seed alphabet lessons one unit at a time, verifying no duplicates
  4. Regenerate exercises for those lessons
- Scope: Armenian alphabet units only (Parts 1–4). Greek alphabet needs checking too.

**BUG-2: Matching exercise — can't undo a pair once selected**
- Severity: **P0** — UX-breaking, students can't fix mistakes
- Root cause: `handleRightClick` sets the match permanently in the Map. No mechanism to un-pair.
- Fix: When clicking an already-matched left item, remove it from the Map and reset `selectedLeft`. When clicking a right item that's already paired, allow re-pairing to the new left selection.
- File: `components/exercises/Matching.tsx`

**BUG-3: Matching correctness logic may be wrong**
- Severity: **P0** — possibly linked to BUG-1 (duplicate data) not the code itself
- Evidence: "ev" and "ev" showed as wrong match. Could be caused by duplicate letters creating ambiguous pairs.
- Action: Re-test AFTER fixing BUG-1. If still broken, debug the index-based correctness check.

### P1 — Fix before launch

**BUG-4: Mixed English/Armenian in MC exercise options**
- Severity: **P1** — confusing but functional
- Where: Reading comprehension "What is this passage about?" exercise
- Root cause: GENERIC_TITLES constant had English wrong answers mixed with Armenian correct answer
- Status: Code fix applied (removed GENERIC_TITLES), but old exercises still in DB
- Fix: Regenerate exercises for affected lessons. The code fix is already deployed.

**BUG-5: Grammar learn cards show English as primary text**
- Severity: **P1** — works as designed (English explanation + target lang examples) but needs educator review to confirm this is the right pedagogy
- Decision made: Grammar explanation in English, examples in target language
- Action: Educator to review and confirm this approach works for students

**BUG-6: Greek TTS voice not tested**
- Severity: **P1** — audio may not work on mathaino.net
- Root cause: `eleni` is a placeholder voice name. Need to test on Narakeet and pick the best Greek voice for children.
- Fix: Test Greek voices at narakeet.com/languages/greek-text-to-speech/, pick one, update VOICE_MAP in `app/api/tts/route.ts`

### P2 — Nice to have

**BUG-7: Content editor placeholder still says "Question (Armenian)" for Greek**
- Where: Discussion questions section in ContentClient.tsx
- Fix: Make placeholder locale-aware using `englishName` from locale context

**BUG-8: Armenian bulk seed needs to run**
- Status: Greek is done (90/90). Armenian was started but may need rerun after BUG-1 fix.
- Action: After fixing BUG-1, reseed Armenian alphabet, then run full Armenian bulk seed.

---

## Untested Items ⚠️

From the E2E checklist, these were NOT tested yet:

- [ ] Armenian: Grade 1-2 lesson (Early band) — words + phrases
- [ ] Armenian: Grade 3-4 lesson (Developing band) — full content
- [ ] Armenian: Grade 5 lesson (Fluent band) — all content types
- [ ] Armenian: Review lesson aggregation
- [ ] Armenian: Audio (TTS) playback
- [ ] Greek: Site loads on mathaino.net with correct branding
- [ ] Greek: Any student lesson playback
- [ ] Greek: Audio (TTS) playback
- [ ] Greek: Review/Quiz aggregation
- [ ] Teacher: Editor loads saved content from bulk seed
- [ ] Teacher: Save → Generate flow for all bands
- [ ] Teacher: Locale-aware labels
- [ ] Cross-cutting: No mixed languages in exercises
- [ ] Cross-cutting: Student progress per locale

---

## Recommended Fix Order for Next Session

1. **BUG-1** (duplicate letters) — SQL cleanup + reseed
2. **BUG-2** (matching undo) — component fix
3. **BUG-8** (Armenian bulk seed) — rerun after BUG-1
4. Re-run E2E checklist
5. **BUG-6** (Greek TTS voice) — pick and test
6. **BUG-7** (placeholder text) — quick fix
7. Educator review of content quality

---

## Phase 3 Status

**~90% complete.** All architecture is in place. Remaining work is bug fixes and content quality. Once bugs are fixed and E2E passes, Phase 3 is done and we move to Phase 4 (educator review + Greek content refinement).
