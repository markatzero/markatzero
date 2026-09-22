"use client";

import { Marker } from "react-simple-maps";

import type { PaidMark } from "../../types/mark";

type Position = [number, number];

type CountryFeature = {
  type: "Feature";
  properties?: Record<string, unknown> | null;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: Position[][] | Position[][][];
  };
};

type GeographyItem = {
  properties?: Record<string, unknown> | null;
  geometry?: unknown;
};

type WorldWallLayerProps = {
  marks: PaidMark[];
  geographies: GeographyItem[];
  zoom: number;
  onSelectMark: (mark: PaidMark) => void;
};

function normalizeCountryName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

const countryAliases: Record<string, string> = {
  unitedstates: "unitedstatesofamerica",
  russia: "russianfederation",
  southkorea: "korea",
  northkorea: "demrepkorea",
  democraticrepublicofthecongo: "demrepcongo",
  congnorepublicofthe: "congo",
  czechia: "czechrepublic",
  turkiye: "turkey",
};

function getCountryName(
  properties?: Record<string, unknown> | null
) {
  if (!properties) {
    return "";
  }

  const name = properties.name;
  const admin = properties.ADMIN;

  if (typeof name === "string") {
    return name;
  }

  if (typeof admin === "string") {
    return admin;
  }

  return "";
}

function pointInRing(
  point: Position,
  ring: Position[]
) {
  const [x, y] = point;
  let inside = false;

  for (
    let i = 0, j = ring.length - 1;
    i < ring.length;
    j = i++
  ) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const hit =
      yi > y !== yj > y &&
      x <
        ((xj - xi) * (y - yi)) /
          (yj - yi) +
          xi;

    if (hit) {
      inside = !inside;
    }
  }

  return inside;
}

function seeded(seed: number) {
  const value =
    Math.sin(seed * 12.9898) * 43758.5453;

  return value - Math.floor(value);
}

function getLargestPolygon(
  country: CountryFeature
): Position[][] {
  const polygons: Position[][][] =
    country.geometry.type === "Polygon"
      ? [
          country.geometry
            .coordinates as Position[][],
        ]
      : (country.geometry
          .coordinates as Position[][][]);

  const area = (ring: Position[]) => {
    const xs = ring.map((point) => point[0]);
    const ys = ring.map((point) => point[1]);

    return (
      (Math.max(...xs) - Math.min(...xs)) *
      (Math.max(...ys) - Math.min(...ys))
    );
  };

  return polygons.reduce(
    (best, current) =>
      area(current[0]) > area(best[0])
        ? current
        : best,
    polygons[0]
  );
}

function createMarkPoint(
  country: CountryFeature,
  seed: number
): Position {
  const polygon = getLargestPolygon(country);
  const ring = polygon[0];

  const xs = ring.map((point) => point[0]);
  const ys = ring.map((point) => point[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  for (
    let attempt = 0;
    attempt < 120;
    attempt++
  ) {
    const point: Position = [
      minX +
        seeded(
          seed * 101 + attempt * 17
        ) *
          (maxX - minX),

      minY +
        seeded(
          seed * 211 + attempt * 29
        ) *
          (maxY - minY),
    ];

    if (pointInRing(point, ring)) {
      return point;
    }
  }

  return (
    ring[Math.floor(ring.length / 2)] ??
    [0, 0]
  );
}

function findCountry(
  countryName: string,
  geographies: GeographyItem[]
) {
  const normalized =
    normalizeCountryName(countryName);

  const wanted =
    countryAliases[normalized] ?? normalized;

  return geographies.find((item) => {
    const actual = normalizeCountryName(
      getCountryName(item.properties)
    );

    return (
      actual === wanted ||
      actual.includes(wanted) ||
      wanted.includes(actual)
    );
  });
}

function resolveMarkPoint(
  mark: PaidMark,
  geographies: GeographyItem[]
): Position | null {
  if (
    typeof mark.longitude === "number" &&
    typeof mark.latitude === "number"
  ) {
    return [
      mark.longitude,
      mark.latitude,
    ];
  }

  const country = findCountry(
    mark.country,
    geographies
  );

  if (!country) {
    return null;
  }

  return createMarkPoint(
    country as CountryFeature,
    mark.mark_number
  );
}

export default function WorldWallLayer({
  marks,
  geographies,
  zoom,
  onSelectMark,
}: WorldWallLayerProps) {
  const size = Math.max(
    9,
    Math.min(30, 9 + zoom * 2)
  );

  return (
    <g data-map-layer="world-wall">
      {marks.map((mark) => {
        const point = resolveMarkPoint(
          mark,
          geographies
        );

        if (!point) {
          return null;
        }

        return (
          <Marker
            key={mark.id}
            coordinates={point}
          >
            <g
              role="button"
              tabIndex={0}
              className="cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                onSelectMark(mark);
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();
                  onSelectMark(mark);
                }
              }}
            >
              <rect
                x={-size / 2 - 1}
                y={-size / 2 - 1}
                width={size + 2}
                height={size + 2}
                rx={1.5}
                fill="#061923"
                stroke="rgba(103,232,249,0.42)"
                strokeWidth={
                  Math.max(0.25, 0.7 / zoom)
                }
              />

              <image
                href={mark.image_url}
                x={-size / 2}
                y={-size / 2}
                width={size}
                height={size}
                preserveAspectRatio="xMidYMid slice"
                pointerEvents="none"
              />

              <title>
                {`Mark #${mark.mark_number} · ${mark.country}`}
              </title>
            </g>
          </Marker>
        );
      })}
    </g>
  );
}