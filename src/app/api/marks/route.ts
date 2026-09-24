import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);

const MARK_FIELDS =
  "id, created_at, country, message, image_url, mark_number, longitude, latitude";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const maxFileSize = 15 * 1024 * 1024;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const numberValue = searchParams.get("number");
    const randomValue = searchParams.get("random");

    if (numberValue !== null) {
      const markNumber = Number(numberValue);

      if (
        !Number.isSafeInteger(markNumber) ||
        markNumber < 1
      ) {
        return NextResponse.json(
          { error: "Invalid Mark number." },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("marks")
        .select(MARK_FIELDS)
        .eq("status", "paid")
        .eq("mark_number", markNumber)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return NextResponse.json(
          { error: "Mark not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({ mark: data });
    }

    if (randomValue === "true") {
      const { data: firstMark, error: firstError } =
        await supabaseAdmin
          .from("marks")
          .select("mark_number")
          .eq("status", "paid")
          .not("mark_number", "is", null)
          .order("mark_number", { ascending: true })
          .limit(1)
          .maybeSingle();

      if (firstError) {
        throw firstError;
      }

      const { data: lastMark, error: lastError } =
        await supabaseAdmin
          .from("marks")
          .select("mark_number")
          .eq("status", "paid")
          .not("mark_number", "is", null)
          .order("mark_number", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (lastError) {
        throw lastError;
      }

      if (
        !firstMark?.mark_number ||
        !lastMark?.mark_number
      ) {
        return NextResponse.json(
          { error: "No Marks are available yet." },
          { status: 404 }
        );
      }

      const firstNumber = firstMark.mark_number;
      const lastNumber = lastMark.mark_number;

      const randomNumber =
        Math.floor(
          Math.random() * (lastNumber - firstNumber + 1)
        ) + firstNumber;

      const { data: randomMark, error: randomError } =
        await supabaseAdmin
          .from("marks")
          .select(MARK_FIELDS)
          .eq("status", "paid")
          .not("mark_number", "is", null)
          .gte("mark_number", randomNumber)
          .order("mark_number", { ascending: true })
          .limit(1)
          .maybeSingle();

      if (randomError) {
        throw randomError;
      }

      if (!randomMark) {
        return NextResponse.json(
          { error: "No Mark could be selected." },
          { status: 404 }
        );
      }

      return NextResponse.json({ mark: randomMark });
    }

    const { data, error } = await supabaseAdmin
      .from("marks")
      .select(MARK_FIELDS)
      .eq("status", "paid")
      .not("mark_number", "is", null)
      .order("mark_number", { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({ marks: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load marks.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
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
      throw uploadError;
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
      uploadedPath = null;
      throw error;
    }

    return NextResponse.json({ mark: data }, { status: 201 });
  } catch (error) {
    if (uploadedPath) {
      await supabaseAdmin.storage.from("marks").remove([uploadedPath]);
    }

    const message =
      error instanceof Error ? error.message : "Invalid request.";

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}