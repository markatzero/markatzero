import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const TILE_SIZE = 512;
const LEVELS = [0, 1, 2, 3];

const OUTPUT_DIR = path.join(
  process.cwd(),
  "tmp",
  "mosaic-tiles"
);

function longitudeToTileX(longitude, level) {
  const tilesPerAxis = 2 ** level;

  return Math.min(
    tilesPerAxis - 1,
    Math.max(
      0,
      Math.floor(
        ((longitude + 180) / 360) *
          tilesPerAxis
      )
    )
  );
}

function latitudeToMercatorY(latitude) {
  const clampedLatitude = Math.max(
    -85.05112878,
    Math.min(85.05112878, latitude)
  );

  const radians =
    (clampedLatitude * Math.PI) / 180;

  return (
    0.5 -
    Math.log(
      (1 + Math.sin(radians)) /
        (1 - Math.sin(radians))
    ) /
      (4 * Math.PI)
  );
}

function latitudeToTileY(latitude, level) {
  const tilesPerAxis = 2 ** level;

  return Math.min(
    tilesPerAxis - 1,
    Math.max(
      0,
      Math.floor(
        latitudeToMercatorY(latitude) *
          tilesPerAxis
      )
    )
  );
}

function tileBounds(level, tileX, tileY) {
  const tilesPerAxis = 2 ** level;

  const west =
    (tileX / tilesPerAxis) * 360 - 180;

  const east =
    ((tileX + 1) / tilesPerAxis) * 360 -
    180;

  const northRadians = Math.atan(
    Math.sinh(
      Math.PI *
        (1 - (2 * tileY) / tilesPerAxis)
    )
  );

  const southRadians = Math.atan(
    Math.sinh(
      Math.PI *
        (1 -
          (2 * (tileY + 1)) /
            tilesPerAxis)
    )
  );

  return {
    west,
    east,
    north:
      (northRadians * 180) / Math.PI,
    south:
      (southRadians * 180) / Math.PI,
  };
}

function markPositionInsideTile(
  longitude,
  latitude,
  level,
  tileX,
  tileY
) {
  const tilesPerAxis = 2 ** level;

  const worldX =
    ((longitude + 180) / 360) *
    tilesPerAxis;

  const worldY =
    latitudeToMercatorY(latitude) *
    tilesPerAxis;

  return {
    x: (worldX - tileX) * TILE_SIZE,
    y: (worldY - tileY) * TILE_SIZE,
  };
}

function getMarkSize(markCount, level) {
  const levelBoost = 1 + level * 0.18;

  const calculatedSize =
    (TILE_SIZE /
      Math.max(
        4,
        Math.sqrt(markCount) * 1.5
      )) *
    levelBoost;

  return Math.max(
    12,
    Math.min(
      96,
      Math.floor(calculatedSize)
    )
  );
}

async function downloadMarkImage(imageUrl) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(
      `Image download failed: ${response.status}`
    );
  }

  return Buffer.from(
    await response.arrayBuffer()
  );
}

async function loadMarkImages(marks) {
  const images = new Map();

  for (const mark of marks) {
    try {
      const source =
        await downloadMarkImage(
          mark.image_url
        );

      images.set(mark.id, source);
    } catch (error) {
      console.error(
        `Skipping Mark ${mark.id}:`,
        error.message
      );
    }
  }

  return images;
}

function groupMarksByTile(marks, level) {
  const tiles = new Map();

  for (const mark of marks) {
    const tileX = longitudeToTileX(
      mark.longitude,
      level
    );

    const tileY = latitudeToTileY(
      mark.latitude,
      level
    );

    const key = `${tileX}:${tileY}`;

    if (!tiles.has(key)) {
      tiles.set(key, {
        level,
        tileX,
        tileY,
        marks: [],
      });
    }

    tiles.get(key).marks.push(mark);
  }

  return tiles;
}

async function buildTile(
  tile,
  markImages
) {
  const markCount = tile.marks.length;

  if (markCount === 0) {
    return null;
  }

  const markSize = getMarkSize(
    markCount,
    tile.level
  );

  const composites = [];

  for (const mark of tile.marks) {
    const source = markImages.get(
      mark.id
    );

    if (!source) {
      continue;
    }

    try {
      const image = await sharp(source)
        .resize(markSize, markSize, {
          fit: "cover",
        })
        .webp({
          quality: 82,
        })
        .toBuffer();

      const position =
        markPositionInsideTile(
          mark.longitude,
          mark.latitude,
          tile.level,
          tile.tileX,
          tile.tileY
        );

      composites.push({
        input: image,
        left: Math.max(
          0,
          Math.min(
            TILE_SIZE - markSize,
            Math.round(
              position.x -
                markSize / 2
            )
          )
        ),
        top: Math.max(
          0,
          Math.min(
            TILE_SIZE - markSize,
            Math.round(
              position.y -
                markSize / 2
            )
          )
        ),
      });
    } catch (error) {
      console.error(
        `Could not prepare Mark ${mark.id}:`,
        error.message
      );
    }
  }

  if (composites.length === 0) {
    return null;
  }

  const outputPath = path.join(
    OUTPUT_DIR,
    `level-${tile.level}`,
    `${tile.tileX}-${tile.tileY}.webp`
  );

  await fs.mkdir(
    path.dirname(outputPath),
    {
      recursive: true,
    }
  );

  await sharp({
    create: {
      width: TILE_SIZE,
      height: TILE_SIZE,
      channels: 4,
      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: 0,
      },
    },
  })
    .composite(composites)
    .webp({
      quality: 86,
    })
    .toFile(outputPath);

  return outputPath;
}

async function loadEnvironment() {
  const envPath = path.join(
    process.cwd(),
    ".env.local"
  );

  const content = await fs.readFile(
    envPath,
    "utf8"
  );

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (
      !trimmed ||
      trimmed.startsWith("#")
    ) {
      continue;
    }

    const separator =
      trimmed.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = trimmed
      .slice(0, separator)
      .trim();

    let value = trimmed
      .slice(separator + 1)
      .trim();

    if (
      (value.startsWith('"') &&
        value.endsWith('"')) ||
      (value.startsWith("'") &&
        value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function loadPaidMarks() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const secretKey =
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    throw new Error(
      "Supabase environment variables are missing"
    );
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/marks` +
      "?select=id,image_url,longitude,latitude" +
      "&status=eq.paid" +
      "&mark_number=not.is.null" +
      "&longitude=not.is.null" +
      "&latitude=not.is.null",
    {
      headers: {
        apikey: secretKey,
        Authorization:
          `Bearer ${secretKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Marks request failed: ${response.status}`
    );
  }

  return response.json();
}

async function clearPreviousOutput() {
  await fs.rm(OUTPUT_DIR, {
    recursive: true,
    force: true,
  });
}

async function main() {
  await loadEnvironment();

  const marks = await loadPaidMarks();

  console.log(
    `Loaded ${marks.length} paid Marks`
  );

  if (marks.length === 0) {
    console.log(
      "No paid Marks available"
    );
    return;
  }

  console.log(
    "Downloading Mark images"
  );

  const markImages =
    await loadMarkImages(marks);

  console.log(
    `Downloaded ${markImages.size} Mark image(s)`
  );

  await clearPreviousOutput();

  let totalTiles = 0;

  for (const level of LEVELS) {
    const tiles = groupMarksByTile(
      marks,
      level
    );

    console.log(
      `Level ${level}: building ${tiles.size} tile(s)`
    );

    for (const tile of tiles.values()) {
      const outputPath =
        await buildTile(
          tile,
          markImages
        );

      if (!outputPath) {
        continue;
      }

      totalTiles += 1;

      const bounds = tileBounds(
        level,
        tile.tileX,
        tile.tileY
      );

      console.log(
        [
          `Created ${outputPath}`,
          `Marks: ${tile.marks.length}`,
          `Bounds:`,
          JSON.stringify(bounds),
        ].join(" ")
      );
    }
  }

  console.log(
    `Generation complete: ${totalTiles} tile(s)`
  );
}

main().catch((error) => {
  console.error(
    "Mosaic generation failed:",
    error
  );

  process.exitCode = 1;
});