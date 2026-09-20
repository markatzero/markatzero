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

const CELL_SIZES = {
  world: 8,
  medium: 4,
  detail: 2,
} as const;

type MosaicLevel =
  keyof typeof CELL_SIZES;

function isMosaicLevel(
  value: string | null
): value is MosaicLevel {
  return (
    value !== null &&
    Object.prototype.hasOwnProperty.call(
      CELL_SIZES,
      value
    )
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const requestedLevel =
      searchParams.get("level");

    const level: MosaicLevel =
      isMosaicLevel(requestedLevel)
        ? requestedLevel
        : "world";

    const cellSize =
      CELL_SIZES[level];

    const { data, error } =
      await supabaseAdmin.rpc(
        "get_map_mosaic",
        {
          cell_size: cellSize,
        }
      );

    if (error) {
      throw error;
    }

    return NextResponse.json({
      level,
      cellSize,
      cells: data ?? [],
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not load map mosaic.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}