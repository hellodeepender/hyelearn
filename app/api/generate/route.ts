import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Integrate Claude API for exercise generation
  return NextResponse.json(
    { message: "Exercise generation endpoint — not yet implemented" },
    { status: 501 }
  );
}
