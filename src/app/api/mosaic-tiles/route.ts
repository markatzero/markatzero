import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAX_TILES = 256;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    throw new Error("Supabase server environment variables are missing");
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const levelParam = request.nextUrl.searchParams.get("level");

    if (levelParam === null) {
      return NextResponse.json(
        { error: "Missing level" },
        { status: 400 }
      );
    }

    const level = Number(levelParam);

    if (!Number.isInteger(level) || level < 0) {
      return NextResponse.json(
        { error: "Invalid level" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("mosaic_tiles")
      .select(
        "id, level, tile_x, tile_y, west, east, south, north, image_url, mark_count, version"
      )
      .eq("level", level)
      .eq("status", "ready")
      .order("tile_y", { ascending: true })
      .order("tile_x", { ascending: true })
      .limit(MAX_TILES);

    if (error) {
      console.error("Failed to load mosaic tiles:", error);

      return NextResponse.json(
        { error: "Failed to load mosaic tiles" },
        { status: 500 }
      );
    }

    const tiles = (data ?? []).map((tile) => ({
      id: String(tile.id),
      level: tile.level,
      tileX: tile.tile_x,
      tileY: tile.tile_y,
      west: tile.west,
      east: tile.east,
      south: tile.south,
      north: tile.north,
      imageUrl: tile.image_url,
      markCount: tile.mark_count,
      version: tile.version,
    }));

    return NextResponse.json({
      level,
      tiles,
      limit: MAX_TILES,
    });
  } catch (error) {
    console.error("Unexpected mosaic tiles API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}