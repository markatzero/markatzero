import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { isValidCountryCode } from "../../../lib/countries";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const country = String(formData.get("country") || "").trim();
    const countryCode = String(
      formData.get("country_code") || ""
    )
      .trim()
      .toUpperCase();

    const message = String(formData.get("message") || "").trim();
    const policyAccepted =
      String(formData.get("policy_accepted") || "") === "true";

    const image = formData.get("image");

    if (!country || !isValidCountryCode(countryCode)) {
      return NextResponse.json(
        { error: "Choose a valid country." },
        { status: 400 }
      );
    }

    if (!message || countWords(message) > 10) {
      return NextResponse.json(
        { error: "Your shared message must be 1 to 10 words." },
        { status: 400 }
      );
    }

    if (!policyAccepted) {
      return NextResponse.json(
        { error: "You must accept the content rules." },
        { status: 400 }
      );
    }

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Choose a shared photo." },
        { status: 400 }
      );
    }

    if (
      image.size <= 0 ||
      image.size > MAX_IMAGE_SIZE ||
      !ALLOWED_IMAGE_TYPES.has(image.type)
    ) {
      return NextResponse.json(
        { error: "Use a JPG, PNG or WEBP image up to 15 MB." },
        { status: 400 }
      );
    }

    const extension =
      image.type === "image/png"
        ? "png"
        : image.type === "image/webp"
          ? "webp"
          : "jpg";

    const storagePath = `pending/${crypto.randomUUID()}.${extension}`;

    const imageBuffer = Buffer.from(await image.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("mark-pending")
      .upload(storagePath, imageBuffer, {
        contentType: image.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: mark, error: insertError } = await supabaseAdmin
      .from("marks")
      .insert({
        country,
        country_code: countryCode,
        message,
        image_url: null,
        pending_image_path: storagePath,
        status: "pending",
        mark_type: "our",
        policy_accepted_at: new Date().toISOString(),
        policy_version: "2026-09-27",
      })
      .select("id")
      .single();

    if (insertError) {
      await supabaseAdmin.storage
        .from("mark-pending")
        .remove([storagePath]);

      throw insertError;
    }

    return NextResponse.json({
      markId: mark.id,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not create OUR MARK.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}