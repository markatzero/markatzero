"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

import MarksLayer from "./MarksLayer";
import MosaicLayer, {
  getMapDetailLevel,
} from "./MosaicLayer";
import type { PaidMark } from "../../types/mark";

const geoUrl = "/countries.geojson";

type WorldMapProps = {
  paidMarks: PaidMark[];
  totalMarks: number;
  onLeaveMark: () => void;
};

export default function WorldMap({
  paidMarks,
  totalMarks,
  onLeaveMark,
}: WorldMapProps) {
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] =
    useState<[number, number]>([8, 18]);

  const [selectedMark, setSelectedMark] =
    useState<PaidMark | null>(null);

  const detailLevel =
    getMapDetailLevel(mapZoom);

  return (
    <div className="relative h-[650px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#020a14]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.20),transparent_58%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:36px_36px]" />

      <div className="absolute left-5 top-5 z-20">
        <p className="text-[9px] tracking-[0.34em] text-cyan-300">
          THE WORLD
        </p>

        <p className="mt-2 text-[9px] tracking-wider text-slate-600">
          DRAG · ZOOM · DISCOVER
        </p>
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
          projectionConfig={{
            scale: 138,
            center: [8, 18],
          }}
          width={1000}
          height={650}
          className="h-full w-full"
        >
          <ZoomableGroup
            zoom={mapZoom}
            center={mapCenter}
            minZoom={1}
            maxZoom={64}
            onMoveEnd={({ coordinates, zoom }) => {
              setMapCenter(
                coordinates as [number, number]
              );

              if (typeof zoom === "number") {
                setMapZoom(zoom);
              }
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

                  {detailLevel !== "marks" && (
                    <MosaicLayer
                      zoom={mapZoom}
                      marks={paidMarks}
                    />
                  )}

                  {detailLevel === "marks" && (
                    <MarksLayer
                      marks={paidMarks}
                      geographies={geographies}
                      zoom={mapZoom}
                      onSelectMark={setSelectedMark}
                    />
                  )}
                </>
              )}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {selectedMark && (
        <div className="absolute bottom-20 right-5 z-30 w-[260px] rounded-2xl border border-cyan-200/20 bg-[#03111d]/95 p-4 shadow-[0_0_35px_rgba(34,211,238,0.16)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setSelectedMark(null)}
            className="absolute right-3 top-2 text-lg text-slate-500 transition hover:text-white"
            aria-label="Close mark details"
          >
            ×
          </button>

          <div className="flex items-center gap-3">
            <img
              src={selectedMark.image_url}
              alt={`Mark #${selectedMark.mark_number}`}
              className="h-14 w-14 rounded-lg border border-cyan-200/20 object-cover"
            />

            <div className="min-w-0">
              <p className="text-[9px] tracking-[0.22em] text-cyan-300">
                MARK #{selectedMark.mark_number}
              </p>

              <p className="mt-1 truncate text-sm font-medium text-white">
                {selectedMark.country}
              </p>
            </div>
          </div>

          {selectedMark.message && (
            <p className="mt-4 border-t border-white/[0.08] pt-3 text-xs leading-5 text-slate-300">
              {selectedMark.message}
            </p>
          )}
        </div>
      )}

      <div className="absolute left-5 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2">
        <button
          type="button"
          onClick={() =>
            setMapZoom((zoom) =>
              Math.min(64, zoom * 1.5)
            )
          }
          className="h-9 w-9 rounded-lg border border-cyan-200/15 bg-black/50 text-lg text-cyan-100 backdrop-blur"
        >
          +
        </button>

        <button
          type="button"
          onClick={() =>
            setMapZoom((zoom) =>
              Math.max(1, zoom / 1.5)
            )
          }
          className="h-9 w-9 rounded-lg border border-cyan-200/15 bg-black/50 text-lg text-cyan-100 backdrop-blur"
        >
          −
        </button>
      </div>

      <div className="absolute bottom-5 left-5 z-20 rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 backdrop-blur">
        <p className="text-[8px] tracking-wider text-slate-500">
          LIVE WORLD
        </p>

        <p className="mt-1 text-[10px] text-cyan-300">
          {totalMarks.toLocaleString()} marks connected
        </p>
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