import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

import {
  getPermanentMarkCoordinates,
  type CountryGeoJson,
} from "../../../lib/map";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function loadCountriesGeoJson(): Promise<CountryGeoJson> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "countries.geojson"
  );

  const file = await readFile(filePath, "utf8");

  return JSON.parse(file) as CountryGeoJson;
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret is not configured." },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature." },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const markId = Number(session.metadata?.mark_id);

      if (
        Number.isInteger(markId) &&
        markId > 0 &&
        session.payment_status === "paid"
      ) {
        const { data: mark, error: markError } = await supabaseAdmin
          .from("marks")
          .select(
            "id, status, mark_number, country, longitude, latitude"
          )
          .eq("id", markId)
          .single();

        if (markError) {
          throw markError;
        }

        if (mark.status === "pending") {
          const { data: lastMark, error: lastMarkError } =
            await supabaseAdmin
              .from("marks")
              .select("mark_number")
              .not("mark_number", "is", null)
              .order("mark_number", { ascending: false })
              .limit(1)
              .maybeSingle();

          if (lastMarkError) {
            throw lastMarkError;
          }

          const nextMarkNumber =
            (lastMark?.mark_number ?? 0) + 1;

          const countriesGeoJson =
            await loadCountriesGeoJson();

          const coordinates =
            getPermanentMarkCoordinates(
              mark.country,
              nextMarkNumber,
              countriesGeoJson
            );

          if (!coordinates) {
            throw new Error(
              `Could not generate coordinates for country: ${mark.country}`
            );
          }

          const { error: updateError } = await supabaseAdmin
            .from("marks")
            .update({
              status: "paid",
              payment_id: session.payment_intent
                ? String(session.payment_intent)
                : session.id,
              mark_number: nextMarkNumber,
              longitude: coordinates.longitude,
              latitude: coordinates.latitude,
            })
            .eq("id", markId)
            .eq("status", "pending");

          if (updateError) {
            throw updateError;
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Webhook failed.";

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}