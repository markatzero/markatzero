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

type MarksLayerProps = {
  marks: PaidMark[];
  geographies: GeographyItem[];
  zoom: number;
  onSelectMark: (mark: PaidMark) => void;
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

function markPoint(
  country: CountryFeature,
  seed: number
): Position {
  const polygons: Position[][][] =
    country.geometry.type === "Polygon"
      ? [
          country.geometry
            .coordinates as Position[][],
        ]
      : (country.geometry
          .coordinates as Position[][][]);

  const polygon = polygons.reduce(
    (best, current) => {
      const area = (ring: Position[]) => {
        const xs = ring.map(
          (point) => point[0]
        );
        const ys = ring.map(
          (point) => point[1]
        );

        return (
          (Math.max(...xs) -
            Math.min(...xs)) *
          (Math.max(...ys) -
            Math.min(...ys))
        );
      };

      return area(current[0]) >
        area(best[0])
        ? current
        : best;
    },
    polygons[0]
  );

  const ring = polygon[0];

  const xs = ring.map(
    (point) => point[0]
  );
  const ys = ring.map(
    (point) => point[1]
  );

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  for (
    let attempt = 0;
    attempt < 80;
    attempt++
  ) {
    const point: Position = [
      minX +
        seeded(
          seed * 101 +
            attempt * 17
        ) *
          (maxX - minX),

      minY +
        seeded(
          seed * 211 +
            attempt * 29
        ) *
          (maxY - minY),
    ];

    if (pointInRing(point, ring)) {
      return point;
    }
  }

  return (
    ring[
      Math.floor(ring.length / 2)
    ] ?? [0, 0]
  );
}

const normalizeCountryName = (
  name: string
) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");

const countryAliases: Record<
  string,
  string
> = {
  unitedstates:
    "unitedstatesofamerica",
  russia: "russianfederation",
  southkorea: "korea",
  northkorea: "demrepkorea",
  democraticrepublicofthecongo:
    "demrepcongo",
  congnorepublicofthe: "congo",
  czechia: "czechrepublic",
  turkiye: "turkey",
};

export default function MarksLayer({
  marks,
  geographies,
  zoom,
  onSelectMark,
}: MarksLayerProps) {
  return (
    <>
      {marks.map((mark) => {
        let point: Position | null = null;

        if (
          typeof mark.longitude ===
            "number" &&
          typeof mark.latitude ===
            "number"
        ) {
          point = [
            mark.longitude,
            mark.latitude,
          ];
        } else {
          const wanted =
            countryAliases[
              normalizeCountryName(
                mark.country
              )
            ] ??
            normalizeCountryName(
              mark.country
            );

          const geo = geographies.find(
            (item) => {
              const actual =
                normalizeCountryName(
                  getCountryName(
                    item.properties
                  )
                );

              return (
                actual === wanted ||
                actual.includes(wanted) ||
                wanted.includes(actual)
              );
            }
          );

          if (geo) {
            point = markPoint(
              geo as CountryFeature,
              mark.mark_number
            );
          }
        }

        if (!point) {
          return null;
        }

        const size = Math.max(
          8,
          Math.min(
            26,
            8 + zoom * 2.2
          )
        );

        return (
          <Marker
            key={mark.id}
            coordinates={point}
          >
            <g
              role="button"
              tabIndex={0}
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
              className="cursor-pointer"
            >
              <rect
                x={-size / 2 - 1}
                y={-size / 2 - 1}
                width={size + 2}
                height={size + 2}
                rx={2}
                fill="#083344"
                stroke="rgba(103,232,249,.85)"
                strokeWidth={0.8 / zoom}
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
    </>
  );
}