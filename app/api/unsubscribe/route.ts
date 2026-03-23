import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const token = request.nextUrl.searchParams.get("token");
  const secret = process.env.CRON_SECRET;

  if (!id || !token || !secret) {
    return new Response("Invalid request", { status: 400 });
  }

  const expected = createHmac("sha256", secret).update(id).digest("hex").slice(0, 16);
  if (token !== expected) {
    return new Response("Invalid link", { status: 403 });
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  await db.from("profiles").update({ email_weekly_progress: false }).eq("id", id);

  return new Response(
    `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Unsubscribed</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;padding:80px 20px;background:#FAFAFA;">
  <div style="max-width:400px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #E5E5E5;">
    <h1 style="margin:0 0 12px;font-size:22px;color:#333;">Unsubscribed</h1>
    <p style="margin:0;color:#777;font-size:15px;line-height:1.5;">
      You will no longer receive weekly progress emails.
    </p>
  </div>
</body></html>`,
    { headers: { "Content-Type": "text/html" } },
  );
}
