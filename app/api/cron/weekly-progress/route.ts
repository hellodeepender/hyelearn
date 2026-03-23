import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";
import { DOMAIN_MAP, type DomainConfig } from "@/config/domains";

export const maxDuration = 300; // 5 min — Vercel limit for cron jobs

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSubject(locale: string): string {
  switch (locale) {
    case "hy": return "Weekly Armenian Learning Update";
    case "el": return "Weekly Greek Learning Update";
    case "ar": return "Weekly Arabic Learning Update";
    default:   return "Weekly Learning Update";
  }
}

function configForLocale(locale: string): DomainConfig {
  return Object.values(DOMAIN_MAP).find((c) => c.locale === locale) ?? DOMAIN_MAP["hyelearn.com"];
}

const BADGE_LABELS: Record<string, string> = {
  first_lesson: "First Lesson",
  lessons_10: "10 Lessons",
  alphabet_complete: "Alphabet Master",
  perfect_quiz: "Perfect Score",
  kindergarten_complete: "Kindergarten Graduate",
  grade_complete: "Grade Complete",
  streak_7: "7-Day Streak",
  streak_30: "30-Day Streak",
  streak_100: "100-Day Streak",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function computeStreak(
  db: any,
  studentId: string,
): Promise<number> {
  const cutoff = new Date(Date.now() - 120 * 86_400_000).toISOString();
  const { data } = await db
    .from("student_progress")
    .select("completed_at")
    .eq("student_id", studentId)
    .gte("completed_at", cutoff)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (!data?.length) return 0;

  const dates = new Set(
    data.map((r: { completed_at: string }) => r.completed_at.slice(0, 10)),
  );
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  if (!dates.has(today) && !dates.has(yesterday)) return 0;

  let streak = 0;
  const d = new Date(dates.has(today) ? today : yesterday);
  while (dates.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return streak;
}

function buildEmailHtml(p: {
  childName: string;
  lessonsCompleted: number;
  weeklyXp: number;
  streak: number;
  badges: string[];
  config: DomainConfig;
  unsubscribeUrl: string;
}): string {
  const { childName, lessonsCompleted, weeklyXp, streak, badges, config, unsubscribeUrl } = p;
  const c = config.theme.primary;

  const badgeHtml =
    badges.length > 0
      ? `<tr><td style="padding:0 0 24px;">
           <p style="margin:0 0 8px;font-size:14px;color:#333;font-weight:600;">Badges earned this week:</p>
           <p style="margin:0;">${badges.map((b) => `<span style="display:inline-block;background:#FFF8E1;color:#F9A825;font-size:12px;font-weight:600;padding:4px 10px;border-radius:12px;margin:2px 4px 2px 0;">${BADGE_LABELS[b] ?? b}</span>`).join("")}</p>
         </td></tr>`
      : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:100%;">
  <tr><td style="background:${c};padding:24px 32px;">
    <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">${config.brandName}</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Weekly Progress Report</p>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="margin:0 0 20px;color:#333;font-size:16px;line-height:1.5;">
      Here&rsquo;s how <strong>${childName}</strong> did this week:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td width="33%" style="text-align:center;padding:16px 8px;background:#f9f9f9;border-radius:8px;">
          <div style="font-size:28px;font-weight:700;color:${c};">${lessonsCompleted}</div>
          <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Lessons</div>
        </td>
        <td width="4%"></td>
        <td width="29%" style="text-align:center;padding:16px 8px;background:#f9f9f9;border-radius:8px;">
          <div style="font-size:28px;font-weight:700;color:${c};">${streak}</div>
          <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Day Streak</div>
        </td>
        <td width="4%"></td>
        <td width="30%" style="text-align:center;padding:16px 8px;background:#f9f9f9;border-radius:8px;">
          <div style="font-size:28px;font-weight:700;color:${c};">${weeklyXp}</div>
          <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">XP Earned</div>
        </td>
      </tr>
    </table>
    ${badgeHtml}
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:8px 0 0;">
        <a href="${config.url}" style="display:inline-block;background:${c};color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
          Continue Learning &rarr;
        </a>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:16px 32px;background:#f9f9f9;border-top:1px solid #eee;">
    <p style="margin:0;font-size:11px;color:#999;text-align:center;line-height:1.6;">
      You&rsquo;re receiving this because your child has an account on ${config.brandName}.<br/>
      <a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline;">Unsubscribe from weekly updates</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

// ---------------------------------------------------------------------------
// POST handler — called by GitHub Actions cron
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  const testEmail = request.nextUrl.searchParams.get("test_email");
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  // 1. Active students in last 7 days
  const { data: rows } = await db
    .from("student_progress")
    .select("student_id")
    .gte("completed_at", sevenDaysAgo)
    .not("completed_at", "is", null);

  if (!rows?.length) {
    return NextResponse.json({ message: "No active students", sent: 0 });
  }

  const studentIds = [...new Set(rows.map((r) => r.student_id))];
  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const studentId of studentIds) {
    try {
      // Parent email (parent created the account)
      const { data: { user: authUser } } = await db.auth.admin.getUserById(studentId);
      if (!authUser?.email) { skipped++; continue; }

      // In test mode, only process the matching email
      if (testEmail && authUser.email !== testEmail) { skipped++; continue; }

      // Profile + opt-out check
      const { data: profile } = await db
        .from("profiles")
        .select("full_name, email_weekly_progress")
        .eq("id", studentId)
        .eq("role", "student")
        .single();

      if (!profile || (!testEmail && profile.email_weekly_progress === false)) {
        skipped++;
        continue;
      }

      // Locale from most recent completed lesson
      const { data: recentLesson } = await db
        .from("student_progress")
        .select("curriculum_lessons(locale)")
        .eq("student_id", studentId)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

      const locale =
        (recentLesson?.curriculum_lessons as unknown as { locale: string } | null)?.locale ?? "hy";
      const config = configForLocale(locale);

      // Weekly stats
      const { count: lessonsCompleted } = await db
        .from("student_progress")
        .select("id", { count: "exact", head: true })
        .eq("student_id", studentId)
        .gte("completed_at", sevenDaysAgo);

      const { data: xpRows } = await db
        .from("student_xp")
        .select("xp_amount")
        .eq("student_id", studentId)
        .gte("created_at", sevenDaysAgo);
      const weeklyXp = xpRows?.reduce((s, r) => s + r.xp_amount, 0) ?? 0;

      const { data: badges } = await db
        .from("student_badges")
        .select("badge_slug")
        .eq("student_id", studentId)
        .gte("earned_at", sevenDaysAgo);

      const streak = await computeStreak(db, studentId);

      // Signed unsubscribe token
      const token = createHmac("sha256", secret)
        .update(studentId)
        .digest("hex")
        .slice(0, 16);
      const unsubscribeUrl = `https://diasporalearn.org/api/unsubscribe?id=${studentId}&token=${token}`;

      const html = buildEmailHtml({
        childName: profile.full_name,
        lessonsCompleted: lessonsCompleted ?? 0,
        weeklyXp,
        streak,
        badges: badges?.map((b) => b.badge_slug) ?? [],
        config,
        unsubscribeUrl,
      });

      const emailPayload = {
        from: `${config.brandName} <noreply@diasporalearn.org>`,
        to: authUser.email,
        subject: getSubject(locale),
      };

      console.log("[weekly-progress] Sending:", {
        ...emailPayload,
        student: profile.full_name,
        locale,
        lessonsCompleted: lessonsCompleted ?? 0,
        weeklyXp,
        streak,
        badges: badges?.map((b) => b.badge_slug) ?? [],
      });

      await resend.emails.send({ ...emailPayload, html });

      sent++;
    } catch (err) {
      errors.push(`${studentId}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  return NextResponse.json({
    sent,
    skipped,
    errors: errors.length,
    ...(errors.length > 0 ? { errorDetails: errors.slice(0, 10) } : {}),
  });
}
