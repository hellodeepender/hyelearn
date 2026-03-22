# DiasporaLearn Operations Runbook

## Quick Reference

| Domain | Locale | Brand |
|--------|--------|-------|
| hyelearn.com | hy | HyeLearn |
| mathaino.net | el | Mathaino |
| diasporalearn.org | en | DiasporaLearn |

## Common Operations

### Deploy
Push to `main` triggers Vercel deploy automatically.

### Run health check
```bash
npm run test:db
```

### Seed Greek exercises
```bash
npx tsx scripts/seed-greek-exercises.ts
```

### Seed Sunday School content
```bash
npx tsx scripts/seed-sunday-school.ts
npx tsx scripts/enrich-sunday-lessons.ts
```

### Generate Sunday School audio
```bash
npx tsx scripts/generate-sunday-school-audio.ts --lesson=1 --locale=hy  # test one
npx tsx scripts/generate-sunday-school-audio.ts                          # all 72
```

### Fix duplicate MC options
```bash
npx tsx scripts/fix-duplicate-mc-options.ts
```

### Backfill badges
```bash
# Run as admin via browser console on the target domain:
fetch('/api/admin/backfill-badges', { method: 'POST' }).then(r => r.json()).then(console.log)
```

## Environment Variables

Required in `.env.local` and Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NARAKEET_API_KEY` (for TTS audio generation)
- `SEED_API_KEY` (for seed scripts)

## Known Issues & Fixes

### Server components return empty data
**Cause:** Cookie-based Supabase SSR client fails when `auth.uid()` is null.
**Fix:** Use service role client for data queries, cookie client only for auth.

### Student progress not saving
**Cause:** `locale` column on `student_progress` may be NOT NULL without default.
**Fix:** Progress API includes locale in insert with fallback retry.

### Badge celebration not showing
**Cause:** `checkAndAwardBadges` needs locale parameter.
**Fix:** Pass locale from domain config through to badge functions.
