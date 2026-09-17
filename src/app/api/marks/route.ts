import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const maxFileSize = 15 * 1024 * 1024;

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("marks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ marks: data });
}

export async function POST(request: Request) {
  let uploadedPath: string | null = null;

  try {
    const formData = await request.formData();

    const countryValue = formData.get("country");
    const messageValue = formData.get("message");
    const imageValue = formData.get("image");

    const country =
      typeof countryValue === "string" ? countryValue.trim() : "";

    const message =
      typeof messageValue === "string" ? messageValue.trim() : "";

    if (!country) {
      return NextResponse.json(
        { error: "Country is required." },
        { status: 400 }
      );
    }

    if (message.length > 80) {
      return NextResponse.json(
        { error: "Message must be 80 characters or less." },
        { status: 400 }
      );
    }

    if (!(imageValue instanceof File) || imageValue.size === 0) {
      return NextResponse.json(
        { error: "Image is required." },
        { status: 400 }
      );
    }

    if (!allowedImageTypes.has(imageValue.type)) {
      return NextResponse.json(
        { error: "Please choose a JPG, PNG or WEBP image." },
        { status: 400 }
      );
    }

    if (imageValue.size > maxFileSize) {
      return NextResponse.json(
        { error: "This image is over 15 MB. Please choose a smaller image." },
        { status: 400 }
      );
    }

    const extension =
      imageValue.type === "image/png"
        ? "png"
        : imageValue.type === "image/webp"
          ? "webp"
          : "jpg";

    uploadedPath = `pending/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("marks")
      .upload(uploadedPath, imageValue, {
        contentType: imageValue.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("marks")
      .getPublicUrl(uploadedPath);

    const { data, error } = await supabaseAdmin
      .from("marks")
      .insert({
        country,
        message: message || null,
        image_url: publicUrlData.publicUrl,
        status: "pending",
        payment_id: null,
        mark_number: null,
      })
      .select()
      .single();

    if (error) {
      await supabaseAdmin.storage.from("marks").remove([uploadedPath]);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ mark: data }, { status: 201 });
  } catch {
    if (uploadedPath) {
      await supabaseAdmin.storage.from("marks").remove([uploadedPath]);
    }

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}