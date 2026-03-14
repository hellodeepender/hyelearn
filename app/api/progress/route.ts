import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch student progress from Supabase
  return NextResponse.json(
    { message: "Progress endpoint — not yet implemented" },
    { status: 501 }
  );
}

export async function POST() {
  // TODO: Save exercise results to Supabase
  return NextResponse.json(
    { message: "Progress endpoint — not yet implemented" },
    { status: 501 }
  );
}
