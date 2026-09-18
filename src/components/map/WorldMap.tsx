"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

const geoUrl = "/countries.geojson";

type Position = [number, number];

type CountryFeature = {
  type: "Feature";
  properties?: { name?: string; ADMIN?: string };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: Position[][] | Position[][][];
  };
};

export type PaidMark = {
  id: number;
  created_at: string;
  country: string;
  message: string | null;
  image_url: string;
  mark_number: number;
};

type WorldMapProps = {
  paidMarks: PaidMark[];
  totalMarks: number;
  onLeaveMark: () => void;
};

function pointInRing(point: Position, ring: Position[]) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const hit = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function markPoint(country: CountryFeature, seed: number): Position {
  const polygons: Position[][][] =
    country.geometry.type === "Polygon"
      ? [country.geometry.coordinates as Position[][]]
      : (country.geometry.coordinates as Position[][][]);

  const polygon = polygons.reduce((best, current) => {
    const area = (ring: Position[]) => {
      const xs = ring.map((p) => p[0]);
      const ys = ring.map((p) => p[1]);
      return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    };
    return area(current[0]) > area(best[0]) ? current : best;
  }, polygons[0]);

  const ring = polygon[0];
  const xs = ring.map((p) => p[0]);
  const ys = ring.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  for (let attempt = 0; attempt < 80; attempt++) {
    const point: Position = [
      minX + seeded(seed * 101 + attempt * 17) * (maxX - minX),
      minY + seeded(seed * 211 + attempt * 29) * (maxY - minY),
    ];
    if (pointInRing(point, ring)) return point;
  }

  return ring[Math.floor(ring.length / 2)] ?? [0, 0];
}

const normalizeCountryName = (name: string) =>
  name.toLowerCase().replace(/[^a-z]/g, "");

const countryAliases: Record<string, string> = {
  unitedstates: "unitedstatesofamerica",
  russia: "russianfederation",
  southkorea: "korea",
  northkorea: "demrepkorea",
  democraticrepublicofthecongo: "demrepcongo",
  congnorepublicofthe: "congo",
  czechia: "czechrepublic",
  türkiye: "turkey",
};

export default function WorldMap({ paidMarks, totalMarks, onLeaveMark }: WorldMapProps) {
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState<[number, number]>([8, 18]);

  return (
    <div className="relative h-[650px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#020a14]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.20),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:36px_36px]" />

      <div className="absolute left-5 top-5 z-20">
        <p className="text-[9px] tracking-[0.34em] text-cyan-300">THE WORLD</p>
        <p className="mt-2 text-[9px] tracking-wider text-slate-600">DRAG · ZOOM · DISCOVER</p>
      </div>

      <button
        type="button"
        className="absolute right-5 top-5 z-20 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[9px] tracking-[0.18em] text-slate-300 backdrop-blur-md"
      >
        ✦ RANDOM MARK
      </button>

      <div className="absolute inset-0 z-10">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 138, center: [8, 18] }}
          width={1000}
          height={650}
          className="h-full w-full"
        >
          <ZoomableGroup
            zoom={mapZoom}
            center={mapCenter}
            minZoom={1}
            maxZoom={8}
            onMoveEnd={({ coordinates, zoom }) => {
              setMapCenter(coordinates as [number, number]);
              if (typeof zoom === "number") setMapZoom(zoom);
            }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) => (
                <>
                  {geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#071827"
                      stroke="#155e75"
                      strokeWidth={0.55 / mapZoom}
                      className="outline-none transition-colors hover:fill-[#0b2435]"
                    />
                  ))}

                  {paidMarks.map((mark) => {
                    const wanted =
                      countryAliases[normalizeCountryName(mark.country)] ??
                      normalizeCountryName(mark.country);
                    const geo = geographies.find((item) => {
                      const properties = item.properties as { name?: string; ADMIN?: string };
                      const actual = normalizeCountryName(properties?.name ?? properties?.ADMIN ?? "");
                      return actual === wanted || actual.includes(wanted) || wanted.includes(actual);
                    });

                    if (!geo) return null;
                    const point = markPoint(geo as unknown as CountryFeature, mark.mark_number);
                    const size = Math.max(8, Math.min(26, 8 + mapZoom * 2.2));

                    return (
                      <Marker key={mark.id} coordinates={point}>
                        <g>
                          <rect
                            x={-size / 2 - 1}
                            y={-size / 2 - 1}
                            width={size + 2}
                            height={size + 2}
                            rx={2}
                            fill="#083344"
                            stroke="rgba(103,232,249,.85)"
                            strokeWidth={0.8 / mapZoom}
                          />
                          <image
                            href={mark.image_url}
                            x={-size / 2}
                            y={-size / 2}
                            width={size}
                            height={size}
                            preserveAspectRatio="xMidYMid slice"
                          />
                          <title>{`Mark #${mark.mark_number} · ${mark.country}`}</title>
                        </g>
                      </Marker>
                    );
                  })}
                </>
              )}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <div className="absolute left-5 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2">
        <button
          type="button"
          onClick={() => setMapZoom((zoom) => Math.min(8, zoom * 1.5))}
          className="h-9 w-9 rounded-lg border border-cyan-200/15 bg-black/50 text-lg text-cyan-100 backdrop-blur"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setMapZoom((zoom) => Math.max(1, zoom / 1.5))}
          className="h-9 w-9 rounded-lg border border-cyan-200/15 bg-black/50 text-lg text-cyan-100 backdrop-blur"
        >
          −
        </button>
      </div>

      <div className="absolute bottom-5 left-5 z-20 rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 backdrop-blur">
        <p className="text-[8px] tracking-wider text-slate-500">LIVE WORLD</p>
        <p className="mt-1 text-[10px] text-cyan-300">{totalMarks.toLocaleString()} marks connected</p>
      </div>

      <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
        <button
          type="button"
          onClick={onLeaveMark}
          className="whitespace-nowrap rounded-full border border-cyan-200/30 bg-cyan-100 px-8 py-3 text-xs font-semibold tracking-wide text-[#021018] shadow-[0_0_35px_rgba(34,211,238,0.28)] transition hover:scale-[1.02]"
        >
          LEAVE YOUR MARK — €1
        </button>
      </div>
    </div>
  );
}
