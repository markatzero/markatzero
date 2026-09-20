import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY!;

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey
);

const MAX_VISIBLE_MARKS = 250;

function readNumber(
  searchParams: URLSearchParams,
  name: string
) {
  const value = searchParams.get(name);

  if (value === null || value.trim() === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const west = readNumber(
      searchParams,
      "west"
    );

    const east = readNumber(
      searchParams,
      "east"
    );

    const south = readNumber(
      searchParams,
      "south"
    );

    const north = readNumber(
      searchParams,
      "north"
    );

    const hasAnyBounds =
      west !== null ||
      east !== null ||
      south !== null ||
      north !== null;

    const hasAllBounds =
      west !== null &&
      east !== null &&
      south !== null &&
      north !== null;

    if (hasAnyBounds && !hasAllBounds) {
      return NextResponse.json(
        {
          error:
            "west, east, south and north must be provided together.",
        },
        { status: 400 }
      );
    }

    if (
      hasAllBounds &&
      (west < -180 ||
        west > 180 ||
        east < -180 ||
        east > 180 ||
        south < -90 ||
        south > 90 ||
        north < -90 ||
        north > 90 ||
        south >= north)
    ) {
      return NextResponse.json(
        {
          error: "Invalid map bounds.",
        },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from("marks")
      .select(
        "id, created_at, country, message, image_url, mark_number, longitude, latitude"
      )
      .eq("status", "paid")
      .not("mark_number", "is", null)
      .not("longitude", "is", null)
      .not("latitude", "is", null);

    if (hasAllBounds) {
      query = query
        .gte("longitude", west)
        .lte("longitude", east)
        .gte("latitude", south)
        .lte("latitude", north);
    }

    const { data, error } = await query
      .order("mark_number", {
        ascending: false,
      })
      .limit(MAX_VISIBLE_MARKS);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      marks: data ?? [],
      limit: MAX_VISIBLE_MARKS,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not load map marks.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}