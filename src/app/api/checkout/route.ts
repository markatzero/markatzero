import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const markId = Number(body.markId);

    if (!Number.isInteger(markId) || markId <= 0) {
      return NextResponse.json(
        { error: "A valid mark ID is required." },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        mark_id: String(markId),
      },
      success_url: `${origin}/?payment=success&mark=${markId}`,
      cancel_url: `${origin}/?payment=cancelled&mark=${markId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create checkout.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}