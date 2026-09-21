import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const TILE_SIZE = 512;
const LEVELS = [0, 1, 2, 3];
const STORAGE_BUCKET = "mosaic-tiles";

const OUTPUT_DIR = path.join(
  process.cwd(),
  "tmp",
  "mosaic-tiles"
);

const GEOJSON_PATH = path.join(
  process.cwd(),
  "public",
  "countries.geojson"
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

function longitudeToWorldPixel(
  longitude,
  level
) {
  const worldSize =
    TILE_SIZE * 2 ** level;

  return (
    ((longitude + 180) / 360) *
    worldSize
  );
}

function latitudeToWorldPixel(
  latitude,
  level
) {
  const worldSize =
    TILE_SIZE * 2 ** level;

  return (
    latitudeToMercatorY(latitude) *
    worldSize
  );
}

function coordinateToTilePixel(
  longitude,
  latitude,
  level,
  tileX,
  tileY
) {
  const worldX = longitudeToWorldPixel(
    longitude,
    level
  );

  const worldY = latitudeToWorldPixel(
    latitude,
    level
  );

  return {
    x: worldX - tileX * TILE_SIZE,
    y: worldY - tileY * TILE_SIZE,
  };
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
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

function getSupabaseConfig() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const secretKey =
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    throw new Error(
      "Supabase environment variables are missing"
    );
  }

  return {
    supabaseUrl,
    secretKey,
  };
}

async function supabaseRequest(
  url,
  options = {}
) {
  const { secretKey } =
    getSupabaseConfig();

  return fetch(url, {
    ...options,
    headers: {
      apikey: secretKey,
      Authorization:
        `Bearer ${secretKey}`,
      ...(options.headers ?? {}),
    },
  });
}

async function loadPaidMarks() {
  const { supabaseUrl } =
    getSupabaseConfig();

  const response = await supabaseRequest(
    `${supabaseUrl}/rest/v1/marks` +
      "?select=id,image_url,longitude,latitude" +
      "&status=eq.paid" +
      "&mark_number=not.is.null" +
      "&longitude=not.is.null" +
      "&latitude=not.is.null"
  );

  if (!response.ok) {
    throw new Error(
      `Marks request failed: ${response.status}`
    );
  }

  return response.json();
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

async function loadLandGeoJson() {
  const content = await fs.readFile(
    GEOJSON_PATH,
    "utf8"
  );

  const geoJson = JSON.parse(content);

  if (
    !geoJson ||
    !Array.isArray(geoJson.features)
  ) {
    throw new Error(
      "countries.geojson is not a valid FeatureCollection"
    );
  }

  return geoJson;
}

function geometryToPolygons(geometry) {
  if (!geometry) {
    return [];
  }

  if (geometry.type === "Polygon") {
    return [geometry.coordinates];
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates;
  }

  return [];
}

function normalizeLongitudeForTile(
  longitude,
  tileCenterLongitude
) {
  let normalized = longitude;

  while (
    normalized - tileCenterLongitude >
    180
  ) {
    normalized -= 360;
  }

  while (
    normalized - tileCenterLongitude <
    -180
  ) {
    normalized += 360;
  }

  return normalized;
}

function ringToSvgPath(
  ring,
  level,
  tileX,
  tileY,
  tileCenterLongitude
) {
  if (
    !Array.isArray(ring) ||
    ring.length < 3
  ) {
    return "";
  }

  const commands = [];

  for (
    let index = 0;
    index < ring.length;
    index += 1
  ) {
    const coordinate = ring[index];

    if (
      !Array.isArray(coordinate) ||
      coordinate.length < 2
    ) {
      continue;
    }

    const longitude =
      normalizeLongitudeForTile(
        Number(coordinate[0]),
        tileCenterLongitude
      );

    const latitude =
      Number(coordinate[1]);

    if (
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude)
    ) {
      continue;
    }

    const point =
      coordinateToTilePixel(
        longitude,
        latitude,
        level,
        tileX,
        tileY
      );

    const command =
      commands.length === 0 ? "M" : "L";

    commands.push(
      `${command}${point.x.toFixed(2)} ` +
        `${point.y.toFixed(2)}`
    );
  }

  if (commands.length < 3) {
    return "";
  }

  commands.push("Z");

  return commands.join(" ");
}

function polygonToSvgPath(
  polygon,
  level,
  tileX,
  tileY,
  tileCenterLongitude
) {
  if (!Array.isArray(polygon)) {
    return "";
  }

  return polygon
    .map((ring) =>
      ringToSvgPath(
        ring,
        level,
        tileX,
        tileY,
        tileCenterLongitude
      )
    )
    .filter(Boolean)
    .join(" ");
}

function createLandMaskSvg(
  geoJson,
  level,
  tileX,
  tileY
) {
  const bounds = tileBounds(
    level,
    tileX,
    tileY
  );

  const tileCenterLongitude =
    (bounds.west + bounds.east) / 2;

  const paths = [];

  for (const feature of geoJson.features) {
    const polygons =
      geometryToPolygons(
        feature.geometry
      );

    for (const polygon of polygons) {
      const pathData =
        polygonToSvgPath(
          polygon,
          level,
          tileX,
          tileY,
          tileCenterLongitude
        );

      if (!pathData) {
        continue;
      }

      paths.push(
        `<path d="${escapeXml(
          pathData
        )}" fill="white" fill-rule="evenodd"/>`
      );
    }
  }

  return Buffer.from(
    [
      `<svg`,
      ` xmlns="http://www.w3.org/2000/svg"`,
      ` width="${TILE_SIZE}"`,
      ` height="${TILE_SIZE}"`,
      ` viewBox="0 0 ${TILE_SIZE} ${TILE_SIZE}">`,
      `<rect width="${TILE_SIZE}" height="${TILE_SIZE}" fill="black"/>`,
      ...paths,
      `</svg>`,
    ].join("")
  );
}

async function prepareLandMask(
  geoJson,
  level,
  tileX,
  tileY
) {
  const svg = createLandMaskSvg(
    geoJson,
    level,
    tileX,
    tileY
  );

  const mask = await sharp(svg)
    .resize(TILE_SIZE, TILE_SIZE)
    .greyscale()
    .png()
    .toBuffer();

  const stats = await sharp(mask).stats();

  const mean =
    stats.channels?.[0]?.mean ?? 0;

  return {
    mask,
    hasLand: mean > 0.5,
  };
}

function groupMarksByTile(marks, level) {
  const groups = new Map();

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

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(mark);
  }

  return groups;
}

function createAllTiles(
  level,
  groupedMarks
) {
  const tilesPerAxis = 2 ** level;
  const tiles = [];

  for (
    let tileY = 0;
    tileY < tilesPerAxis;
    tileY += 1
  ) {
    for (
      let tileX = 0;
      tileX < tilesPerAxis;
      tileX += 1
    ) {
      const key = `${tileX}:${tileY}`;

      tiles.push({
        level,
        tileX,
        tileY,
        marks:
          groupedMarks.get(key) ?? [],
      });
    }
  }

  return tiles;
}

function getPhotoCellSize(level) {
  if (level === 0) {
    return 32;
  }

  if (level === 1) {
    return 40;
  }

  if (level === 2) {
    return 48;
  }

  return 56;
}

function hashNumber(value) {
  let hash = 2166136261;

  const text = String(value);

  for (
    let index = 0;
    index < text.length;
    index += 1
  ) {
    hash ^= text.charCodeAt(index);

    hash = Math.imul(
      hash,
      16777619
    );
  }

  return hash >>> 0;
}

function getDeterministicImageIndex(
  level,
  tileX,
  tileY,
  cellX,
  cellY,
  imageCount
) {
  if (imageCount <= 1) {
    return 0;
  }

  const hash = hashNumber(
    [
      level,
      tileX,
      tileY,
      cellX,
      cellY,
    ].join(":")
  );

  return hash % imageCount;
}

async function preparePhotoSources(
  markImages,
  levels
) {
  const sources = [
    ...markImages.entries(),
  ];

  const preparedByLevel = new Map();

  for (const level of levels) {
    const cellSize =
      getPhotoCellSize(level);

    const prepared = [];

    for (const [markId, source] of sources) {
      try {
        const image = await sharp(source)
          .rotate()
          .resize(
            cellSize,
            cellSize,
            {
              fit: "cover",
              position: "centre",
            }
          )
          .webp({
            quality: 82,
          })
          .toBuffer();

        prepared.push({
          markId,
          image,
        });
      } catch (error) {
        console.error(
          `Could not prepare Mark ${markId} ` +
            `for level ${level}:`,
          error.message
        );
      }
    }

    preparedByLevel.set(
      level,
      prepared
    );

    console.log(
      `Prepared ${prepared.length} photo source(s) ` +
        `for level ${level}`
    );
  }

  return preparedByLevel;
}

function createPhotoWallComposites(
  tile,
  preparedImages
) {
  if (preparedImages.length === 0) {
    return [];
  }

  const cellSize =
    getPhotoCellSize(tile.level);

  const columns = Math.ceil(
    TILE_SIZE / cellSize
  );

  const rows = Math.ceil(
    TILE_SIZE / cellSize
  );

  const composites = [];

  for (
    let cellY = 0;
    cellY < rows;
    cellY += 1
  ) {
    for (
      let cellX = 0;
      cellX < columns;
      cellX += 1
    ) {
      const imageIndex =
        getDeterministicImageIndex(
          tile.level,
          tile.tileX,
          tile.tileY,
          cellX,
          cellY,
          preparedImages.length
        );

      const source =
        preparedImages[imageIndex];

      composites.push({
        input: source.image,
        left: cellX * cellSize,
        top: cellY * cellSize,
      });
    }
  }

  return composites;
}

async function buildTile(
  tile,
  geoJson,
  preparedImages
) {
  if (preparedImages.length === 0) {
    return null;
  }

  const { mask, hasLand } =
    await prepareLandMask(
      geoJson,
      tile.level,
      tile.tileX,
      tile.tileY
    );

  if (!hasLand) {
    return null;
  }

  const photoComposites =
    createPhotoWallComposites(
      tile,
      preparedImages
    );

  if (photoComposites.length === 0) {
    return null;
  }

  const photoWall =
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
      .composite(photoComposites)
      .png()
      .toBuffer();

  const maskedTile =
    await sharp(photoWall)
      .composite([
        {
          input: mask,
          blend: "dest-in",
        },
      ])
      .webp({
        quality: 88,
        alphaQuality: 100,
      })
      .toBuffer();

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

  await fs.writeFile(
    outputPath,
    maskedTile
  );

  return outputPath;
}

async function uploadTile(
  tile,
  outputPath
) {
  const {
    supabaseUrl,
  } = getSupabaseConfig();

  const storagePath =
    `level-${tile.level}/` +
    `${tile.tileX}-${tile.tileY}.webp`;

  const file =
    await fs.readFile(outputPath);

  const response = await supabaseRequest(
    `${supabaseUrl}` +
      `/storage/v1/object/` +
      `${STORAGE_BUCKET}/` +
      `${storagePath}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "image/webp",
        "x-upsert": "true",
      },
      body: file,
    }
  );

  if (!response.ok) {
    const message =
      await response.text();

    throw new Error(
      `Tile upload failed: ` +
        `${response.status} ${message}`
    );
  }

  return {
    storagePath,
    imageUrl:
      `${supabaseUrl}` +
      `/storage/v1/object/public/` +
      `${STORAGE_BUCKET}/` +
      `${storagePath}`,
  };
}

async function saveTileMetadata(
  tile,
  imageUrl
) {
  const {
    supabaseUrl,
  } = getSupabaseConfig();

  const bounds = tileBounds(
    tile.level,
    tile.tileX,
    tile.tileY
  );

  const response = await supabaseRequest(
    `${supabaseUrl}` +
      `/rest/v1/mosaic_tiles` +
      `?on_conflict=level,tile_x,tile_y`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        Prefer:
          "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        level: tile.level,
        tile_x: tile.tileX,
        tile_y: tile.tileY,
        west: bounds.west,
        east: bounds.east,
        south: bounds.south,
        north: bounds.north,
        image_url: imageUrl,
        mark_count: tile.marks.length,
        status: "ready",
        updated_at:
          new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) {
    const message =
      await response.text();

    throw new Error(
      `Metadata save failed: ` +
        `${response.status} ${message}`
    );
  }
}

async function clearPreviousOutput() {
  await fs.rm(OUTPUT_DIR, {
    recursive: true,
    force: true,
  });
}

async function main() {
  await loadEnvironment();

  console.log(
    "Loading countries GeoJSON"
  );

  const geoJson =
    await loadLandGeoJson();

  console.log(
    `Loaded ${geoJson.features.length} ` +
      `geographic feature(s)`
  );

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

  if (markImages.size === 0) {
    console.log(
      "No Mark images could be downloaded"
    );
    return;
  }

  console.log(
    "Preparing Photo Mosaic sources"
  );

  const preparedByLevel =
    await preparePhotoSources(
      markImages,
      LEVELS
    );

  await clearPreviousOutput();

  let totalTiles = 0;

  for (const level of LEVELS) {
    const groupedMarks =
      groupMarksByTile(
        marks,
        level
      );

    const tiles = createAllTiles(
      level,
      groupedMarks
    );

    const preparedImages =
      preparedByLevel.get(level) ?? [];

    console.log(
      `Level ${level}: checking ` +
        `${tiles.length} tile(s)`
    );

    for (const tile of tiles) {
      const outputPath =
        await buildTile(
          tile,
          geoJson,
          preparedImages
        );

      if (!outputPath) {
        continue;
      }

      const uploaded =
        await uploadTile(
          tile,
          outputPath
        );

      await saveTileMetadata(
        tile,
        uploaded.imageUrl
      );

      totalTiles += 1;

      console.log(
        [
          `Published level ${tile.level}`,
          `tile ${tile.tileX}:${tile.tileY}`,
          `local Marks: ${tile.marks.length}`,
        ].join(" ")
      );
    }
  }

  console.log(
    `Generation complete: ` +
      `${totalTiles} land tile(s) published`
  );
}

main().catch((error) => {
  console.error(
    "Mosaic generation failed:",
    error
  );

  process.exitCode = 1;
});