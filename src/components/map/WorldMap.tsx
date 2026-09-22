"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

import WorldWallLayer from "./WorldWallLayer";

import useVisibleMapMarks from "../../hooks/useVisibleMapMarks";
import { getMapBounds } from "../../lib/mapViewport";
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
  const [mapZoom, setMapZoom] =
    useState(1);

  const [mapCenter, setMapCenter] =
    useState<[number, number]>([8, 18]);

  const [selectedMark, setSelectedMark] =
    useState<PaidMark | null>(null);

  const useVisibleMarks = mapZoom >= 8;

  const visibleBounds = useMemo(() => {
    if (!useVisibleMarks) {
      return null;
    }

    return getMapBounds({
      center: mapCenter,
      zoom: mapZoom,
    });
  }, [
    mapCenter,
    mapZoom,
    useVisibleMarks,
  ]);

  const {
    marks: visibleMarks,
    loading: visibleMarksLoading,
    error: visibleMarksError,
  } = useVisibleMapMarks(
    visibleBounds,
    useVisibleMarks
  );

  const displayedMarks =
    useVisibleMarks
      ? visibleMarks
      : paidMarks;

  return (
    <div className="relative h-[650px] overflow-hidden rounded-2xl border border-cyan-300/[0.10] bg-[#01070d] shadow-[inset_0_0_100px_rgba(6,182,212,0.04)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,145,178,0.13),transparent_55%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="absolute left-5 top-5 z-20">
        <p className="text-[9px] tracking-[0.34em] text-cyan-300">
          THE WORLD
        </p>

        <p className="mt-2 text-[9px] tracking-[0.18em] text-slate-600">
          HUMANITY IN ONE PLACE
        </p>
      </div>

      <button
        type="button"
        className="absolute right-5 top-5 z-20 rounded-full border border-cyan-200/10 bg-black/40 px-4 py-2 text-[9px] tracking-[0.18em] text-slate-300 backdrop-blur-md"
      >
        RANDOM HUMAN
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
            onMoveEnd={({
              coordinates,
              zoom,
            }) => {
              setMapCenter(
                coordinates as [
                  number,
                  number
                ]
              );

              if (
                typeof zoom === "number"
              ) {
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
                      fill="#06141e"
                      stroke="rgba(103,232,249,0.24)"
                      strokeWidth={
                        0.48 / mapZoom
                      }
                      className="outline-none transition-colors hover:fill-[#0a202b]"
                    />
                  ))}

                  <WorldWallLayer
                    marks={displayedMarks}
                    geographies={
                      geographies
                    }
                    zoom={mapZoom}
                    onSelectMark={
                      setSelectedMark
                    }
                  />
                </>
              )}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {useVisibleMarks &&
        visibleMarksLoading && (
          <div className="pointer-events-none absolute right-5 top-16 z-20 rounded-lg border border-white/[0.08] bg-black/50 px-3 py-2 text-[8px] tracking-wider text-cyan-200 backdrop-blur">
            REVEALING HUMANITY
          </div>
        )}

      {useVisibleMarks &&
        visibleMarksError && (
          <div className="absolute right-5 top-16 z-20 max-w-[240px] rounded-lg border border-red-300/20 bg-black/60 px-3 py-2 text-[8px] leading-4 text-red-200 backdrop-blur">
            MARKS COULD NOT BE LOADED
          </div>
        )}

      {selectedMark && (
        <div className="absolute bottom-20 right-5 z-30 w-[260px] overflow-hidden rounded-2xl border border-cyan-200/20 bg-[#03111d]/95 shadow-[0_0_35px_rgba(34,211,238,0.16)] backdrop-blur-xl">
          <div className="relative aspect-[16/10] overflow-hidden bg-[#06131d]">
            <img
              src={selectedMark.image_url}
              alt={`Mark #${selectedMark.mark_number}`}
              className="h-full w-full object-cover"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#03111d] via-transparent to-transparent" />

            <button
              type="button"
              onClick={() =>
                setSelectedMark(null)
              }
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/50 text-sm text-white/70 backdrop-blur transition hover:text-white"
              aria-label="Close mark details"
            >
              ×
            </button>

            <p className="absolute bottom-3 left-4 text-[9px] tracking-[0.22em] text-cyan-200">
              MARK #
              {selectedMark.mark_number}
            </p>
          </div>

          <div className="p-4">
            <p className="text-[9px] tracking-[0.2em] text-slate-500">
              {selectedMark.country}
            </p>

            {selectedMark.message && (
              <p className="mt-3 text-xs leading-5 text-slate-200">
                {selectedMark.message}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="absolute left-5 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2">
        <button
          type="button"
          onClick={() =>
            setMapZoom((zoom) =>
              Math.min(
                64,
                zoom * 1.5
              )
            )
          }
          className="h-9 w-9 rounded-full border border-cyan-200/15 bg-black/50 text-lg text-cyan-100 backdrop-blur"
          aria-label="Zoom in"
        >
          +
        </button>

        <button
          type="button"
          onClick={() =>
            setMapZoom((zoom) =>
              Math.max(
                1,
                zoom / 1.5
              )
            )
          }
          className="h-9 w-9 rounded-full border border-cyan-200/15 bg-black/50 text-lg text-cyan-100 backdrop-blur"
          aria-label="Zoom out"
        >
          −
        </button>
      </div>

      <div className="absolute bottom-5 left-5 z-20">
        <p className="text-[8px] tracking-[0.22em] text-slate-600">
          WORLD → HUMANITY → ONE HUMAN
        </p>

        <p className="mt-2 text-[9px] tracking-[0.12em] text-cyan-300">
          {totalMarks.toLocaleString()} / 1,000,000
        </p>
      </div>

      <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
        <button
          type="button"
          onClick={onLeaveMark}
          className="whitespace-nowrap rounded-full border border-cyan-200/30 bg-cyan-100 px-8 py-3 text-xs font-semibold tracking-wide text-[#021018] shadow-[0_0_35px_rgba(34,211,238,0.20)] transition hover:scale-[1.02]"
        >
          LEAVE YOUR MARK · €1
        </button>
      </div>
    </div>
  );
}