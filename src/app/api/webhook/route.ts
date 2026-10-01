import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

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
        const paymentId = session.payment_intent
          ? String(session.payment_intent)
          : session.id;

        const { data: markNumber, error: finalizeError } =
          await supabaseAdmin.rpc("finalize_paid_mark", {
            p_mark_id: markId,
            p_payment_id: paymentId,
          });

        if (finalizeError) {
          throw finalizeError;
        }

        if (
          markNumber !== null &&
          (!Number.isSafeInteger(Number(markNumber)) ||
            Number(markNumber) < 1)
        ) {
          throw new Error("Invalid permanent Mark number.");
        }

        if (markNumber !== null) {
          const { data: mark, error: markError } = await supabaseAdmin
            .from("marks")
            .select("pending_image_path")
            .eq("id", markId)
            .single();

          if (markError) {
            throw markError;
          }

          if (mark.pending_image_path) {
            const pendingPath = mark.pending_image_path;
            const fileName = pendingPath.split("/").pop();

            if (!fileName) {
              throw new Error("Invalid pending image path.");
            }

            const publicPath = `published/${markNumber}/${fileName}`;

            const { data: imageData, error: downloadError } =
              await supabaseAdmin.storage
                .from("mark-pending")
                .download(pendingPath);

            if (downloadError) {
              throw downloadError;
            }

            const { error: uploadError } = await supabaseAdmin.storage
              .from("marks")
              .upload(publicPath, imageData, {
                contentType: imageData.type || undefined,
                upsert: true,
              });

            if (uploadError) {
              throw uploadError;
            }

            const { data: publicUrlData } = supabaseAdmin.storage
              .from("marks")
              .getPublicUrl(publicPath);

            const { error: updateError } = await supabaseAdmin
              .from("marks")
              .update({
                image_url: publicUrlData.publicUrl,
                pending_image_path: null,
              })
              .eq("id", markId);

            if (updateError) {
              await supabaseAdmin.storage
                .from("marks")
                .remove([publicPath]);

              throw updateError;
            }

            const { error: removeError } = await supabaseAdmin.storage
              .from("mark-pending")
              .remove([pendingPath]);

            if (removeError) {
              console.error(
                "Could not remove private pending image:",
                removeError
              );
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook failed.";

    console.error("WEBHOOK ERROR:", error);

    return NextResponse.json({ error: message }, { status: 400 });
  }
}