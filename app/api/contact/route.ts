import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limit: max 3 per email per hour
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const hour = 3600000;
  const timestamps = (rateLimitMap.get(email) ?? []).filter((t) => now - t < hour);
  if (timestamps.length >= 3) return false;
  timestamps.push(now);
  rateLimitMap.set(email, timestamps);
  return true;
}

export async function POST(request: NextRequest) {
  const { name, email, subject, message } = await request.json() as {
    name?: string; email?: string; subject?: string; message?: string;
  };

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!checkRateLimit(email.trim().toLowerCase())) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY not set");
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: "HyeLearn <noreply@hyelearn.com>",
      to: "support@hyelearn.com",
      replyTo: email.trim(),
      subject: `[HyeLearn Contact] ${subject} from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p>${message.replace(/\n/g, "<br />")}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Send error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
