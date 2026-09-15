"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const marks: { id: number; coordinates: [number, number]; color: string }[] = [
  { id: 1, coordinates: [-122.4, 37.8], color: "#22d3ee" },
  { id: 2, coordinates: [-118.2, 34.1], color: "#a78bfa" },
  { id: 3, coordinates: [-74, 40.7], color: "#38bdf8" },
  { id: 4, coordinates: [-99.1, 19.4], color: "#c084fc" },
  { id: 5, coordinates: [-46.6, -23.5], color: "#22d3ee" },
  { id: 6, coordinates: [-58.4, -34.6], color: "#818cf8" },
  { id: 7, coordinates: [-0.1, 51.5], color: "#67e8f9" },
  { id: 8, coordinates: [2.35, 48.85], color: "#a78bfa" },
  { id: 9, coordinates: [13.4, 52.5], color: "#22d3ee" },
  { id: 10, coordinates: [12.5, 41.9], color: "#818cf8" },
  { id: 11, coordinates: [31.2, 30], color: "#c084fc" },
  { id: 12, coordinates: [3.4, 6.5], color: "#22d3ee" },
  { id: 13, coordinates: [28, -26.2], color: "#38bdf8" },
  { id: 14, coordinates: [55.3, 25.2], color: "#a78bfa" },
  { id: 15, coordinates: [72.8, 19.1], color: "#22d3ee" },
  { id: 16, coordinates: [77.2, 28.6], color: "#818cf8" },
  { id: 17, coordinates: [100.5, 13.7], color: "#c084fc" },
  { id: 18, coordinates: [103.8, 1.35], color: "#22d3ee" },
  { id: 19, coordinates: [116.4, 39.9], color: "#38bdf8" },
  { id: 20, coordinates: [121.5, 31.2], color: "#a78bfa" },
  { id: 21, coordinates: [139.7, 35.7], color: "#22d3ee" },
  { id: 22, coordinates: [126.9, 37.5], color: "#818cf8" },
  { id: 23, coordinates: [151.2, -33.9], color: "#c084fc" },
  { id: 24, coordinates: [144.9, -37.8], color: "#22d3ee" },
];

const recentMarks = [
  { number: "#184392", country: "Japan", symbol: "✦" },
  { number: "#184391", country: "Brazil", symbol: "●" },
  { number: "#184390", country: "Germany", symbol: "▲" },
  { number: "#184389", country: "Canada", symbol: "◆" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#02050d] text-white">
      <header className="border-b border-white/[0.07] bg-[#02050d]/90">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 md:px-8">
          <div className="flex items-center gap-5">
            <div>
              <div className="text-3xl font-semibold tracking-[0.08em] md:text-4xl">
                00:00:00
              </div>
              <div className="mt-1 text-[8px] tracking-[0.34em] text-cyan-300/70">
                MARK AT ZERO
              </div>
            </div>

            <div className="hidden h-10 w-px bg-white/10 md:block" />

            <p className="hidden text-[10px] tracking-[0.24em] text-slate-400 md:block">
              ONE MILLION PEOPLE. ONE MOMENT.
            </p>
          </div>

          <nav className="hidden items-center gap-7 text-[11px] tracking-wider text-slate-400 lg:flex">
            <span className="text-white">WORLD</span>
            <span>EXPLORE</span>
            <span>TOP COUNTRIES</span>
            <span>ABOUT</span>
          </nav>

          <button
            type="button"
            className="rounded-full border border-cyan-300/40 bg-cyan-300/[0.06] px-5 py-2.5 text-xs tracking-wider text-cyan-100"
          >
            JOIN NOW · €1
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-4 py-5 md:px-8">
        <div className="mb-4 grid grid-cols-3 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.025]">
          <div className="px-3 py-3 text-center">
            <p className="text-[8px] tracking-[0.28em] text-slate-500">
              PEOPLE
            </p>
            <p className="mt-1 text-lg font-medium md:text-xl">
              184,392
              <span className="ml-2 hidden text-[10px] font-normal text-slate-600 sm:inline">
                / 1,000,000
              </span>
            </p>
          </div>

          <div className="border-x border-white/[0.07] px-3 py-3 text-center">
            <p className="text-[8px] tracking-[0.28em] text-slate-500">
              COUNTRIES
            </p>
            <p className="mt-1 text-lg font-medium md:text-xl">
              142
              <span className="ml-2 text-[10px] font-normal text-slate-600">
                / 195
              </span>
            </p>
          </div>

          <div className="px-3 py-3 text-center">
            <p className="text-[8px] tracking-[0.28em] text-slate-500">
              MARKS
            </p>
            <p className="mt-1 text-lg font-medium md:text-xl">
              184,392
              <span className="ml-2 hidden text-[9px] font-normal text-cyan-400 sm:inline">
                AND GROWING
              </span>
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_230px]">
          <div className="relative h-[610px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#030914]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.10),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:40px_40px]" />

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

            <div className="absolute inset-0">
              <ComposableMap
                width={1000}
                height={500}
                projectionConfig={{
                  scale: 147,
                  center: [0, 5],
                }}
                className="h-full w-full"
              >
                <ZoomableGroup
                  center={[0, 5]}
                  zoom={1}
                  minZoom={1}
                  maxZoom={8}
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#071522"
                          stroke="#164e63"
                          strokeWidth={0.45}
                        />
                      ))
                    }
                  </Geographies>

                  {marks.map((mark) => (
                    <Marker
                      key={mark.id}
                      coordinates={mark.coordinates}
                    >
                      <circle
                        r={7}
                        fill={mark.color}
                        opacity={0.12}
                      />
                      <circle
                        r={3}
                        fill={mark.color}
                        stroke="#ffffff"
                        strokeWidth={0.55}
                      />
                    </Marker>
                  ))}
                </ZoomableGroup>
              </ComposableMap>
            </div>

            <div className="absolute bottom-5 left-5 z-20 rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 backdrop-blur">
              <p className="text-[8px] tracking-wider text-slate-500">
                LIVE WORLD
              </p>
              <p className="mt-1 text-[10px] text-cyan-300">
                184,392 marks connected
              </p>
            </div>

            <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
              <button
                type="button"
                className="whitespace-nowrap rounded-full bg-white px-7 py-3 text-xs font-semibold tracking-wide text-black shadow-[0_0_35px_rgba(255,255,255,0.12)]"
              >
                LEAVE YOUR MARK — €1
              </button>
            </div>
          </div>

          <aside className="hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 xl:block">
            <div className="flex items-center justify-between">
              <p className="text-[9px] tracking-[0.25em] text-slate-400">
                TOP COUNTRIES
              </p>
              <span className="text-[9px] text-slate-600">LIVE</span>
            </div>

            <div className="mt-6 space-y-5 text-xs">
              {[
                ["01", "United States", "31,482"],
                ["02", "Brazil", "18,921"],
                ["03", "Japan", "16,540"],
                ["04", "Germany", "14,287"],
                ["05", "United Kingdom", "12,804"],
              ].map(([rank, country, total]) => (
                <div
                  key={country}
                  className="flex items-center justify-between border-b border-white/[0.05] pb-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-slate-600">
                      {rank}
                    </span>
                    <span className="text-[11px] text-slate-300">
                      {country}
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-300/80">
                    {total}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-7 text-[8px] leading-5 tracking-wider text-slate-600">
              EVERY MARK BECOMES PART OF ONE GLOBAL MOMENT AT 00:00:00.
            </p>
          </aside>
        </div>

        <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[9px] tracking-[0.25em] text-slate-500">
              RECENT MARKS
            </p>
            <p className="text-[8px] tracking-wider text-cyan-400/60">
              LIVE
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {recentMarks.map((mark) => (
              <div
                key={mark.number}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">
                  {mark.symbol}
                </div>

                <div>
                  <p className="text-[10px] text-slate-300">
                    {mark.number}
                  </p>
                  <p className="mt-1 text-[8px] tracking-wider text-slate-600">
                    {mark.country}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="py-8 text-center">
          <p className="text-[9px] tracking-[0.35em] text-slate-600">
            ONE MILLION PEOPLE · ONE MOMENT · ONE WORLD
          </p>
        </div>
      </section>
    </main>
  );
}