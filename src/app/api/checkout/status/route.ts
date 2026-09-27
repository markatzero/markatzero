import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return NextResponse.json(
        { error: "Invalid checkout session." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({
        status: "waiting",
        markNumber: null,
      });
    }

    const markId = Number(session.metadata?.mark_id);

    if (!Number.isInteger(markId) || markId <= 0) {
      return NextResponse.json(
        { error: "This checkout is not linked to a Mark." },
        { status: 400 }
      );
    }

    const { data: mark, error } = await supabaseAdmin
      .from("marks")
      .select("status, mark_number")
      .eq("id", markId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!mark || mark.status !== "paid" || !mark.mark_number) {
      return NextResponse.json({
        status: "waiting",
        markNumber: null,
      });
    }

    return NextResponse.json({
      status: "ready",
      markNumber: mark.mark_number,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not verify checkout.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}