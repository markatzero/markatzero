import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const ALLOWED_REASONS = new Set([
  "my-image",
  "harassment",
  "hate",
  "sexual",
  "violence",
  "impersonation",
  "copyright",
  "other",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const markNumber = Number(body.markNumber);
    const reason = String(body.reason || "").trim();
    const details = String(body.details || "").trim();

    if (!Number.isSafeInteger(markNumber) || markNumber <= 0) {
      return NextResponse.json(
        { error: "Enter a valid Mark number." },
        { status: 400 }
      );
    }

    if (!ALLOWED_REASONS.has(reason)) {
      return NextResponse.json(
        { error: "Choose a valid reason." },
        { status: 400 }
      );
    }

    if (details.length > 1000) {
      return NextResponse.json(
        { error: "Details are too long." },
        { status: 400 }
      );
    }

    const { data: mark, error: markError } = await supabaseAdmin
      .from("marks")
      .select("id")
      .eq("status", "paid")
      .eq("mark_number", markNumber)
      .maybeSingle();

    if (markError) {
      throw markError;
    }

    if (!mark) {
      return NextResponse.json(
        { error: "Mark not found." },
        { status: 404 }
      );
    }

    const { error: reportError } = await supabaseAdmin
      .from("mark_reports")
      .insert({
        mark_number: markNumber,
        reason,
        details: details || null,
      });

    if (reportError) {
      throw reportError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Report submission failed:", error);

    return NextResponse.json(
      { error: "Could not submit report." },
      { status: 500 }
    );
  }
}