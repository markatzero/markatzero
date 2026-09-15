"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type Mark = {
  id: number;
  coordinates: [number, number];
  color: string;
  size: number;
};

const cities: [number, number][] = [
  [-122.4, 37.8], [-118.2, 34.1], [-87.6, 41.8], [-74, 40.7],
  [-99.1, 19.4], [-79.4, 43.7], [-46.6, -23.5], [-43.2, -22.9],
  [-58.4, -34.6], [-70.7, -33.4], [-0.1, 51.5], [2.35, 48.85],
  [4.9, 52.3], [13.4, 52.5], [12.5, 41.9], [-3.7, 40.4],
  [18.1, 59.3], [30.5, 50.4], [28.9, 41], [31.2, 30],
  [3.4, 6.5], [36.8, -1.3], [28, -26.2], [18.4, -33.9],
  [55.3, 25.2], [46.7, 24.7], [51.5, 25.3], [44.4, 33.3],
  [51.4, 35.7], [72.8, 19.1], [77.2, 28.6], [77.6, 12.9],
  [88.4, 22.6], [90.4, 23.8], [100.5, 13.7], [103.8, 1.35],
  [106.8, -6.2], [106.6, 10.8], [116.4, 39.9], [121.5, 31.2],
  [114.2, 22.3], [121, 14.6], [126.9, 37.5], [139.7, 35.7],
  [135.5, 34.7], [151.2, -33.9], [144.9, -37.8], [174.8, -36.8],
];

const colors = [
  "#22d3ee",
  "#38bdf8",
  "#818cf8",
  "#a78bfa",
  "#c084fc",
  "#67e8f9",
];

const marks: Mark[] = Array.from({ length: 190 }, (_, index) => {
  const base = cities[index % cities.length];
  const offsetX = (((index * 37) % 17) - 8) * 0.65;
  const offsetY = (((index * 23) % 13) - 6) * 0.45;

  return {
    id: index + 1,
    coordinates: [base[0] + offsetX, base[1] + offsetY],
    color: colors[index % colors.length],
    size: 1.5 + (index % 4) * 0.45,
  };
});

const topCountries = [
  ["01", "United States", "31,482"],
  ["02", "Brazil", "18,921"],
  ["03", "Japan", "16,540"],
  ["04", "Germany", "14,287"],
  ["05", "United Kingdom", "12,804"],
];

const recentMarks = [
  ["#184392", "Japan", "✦"],
  ["#184391", "Brazil", "●"],
  ["#184390", "Germany", "▲"],
  ["#184389", "Canada", "◆"],
];

const countries = [
  "United States",
  "Brazil",
  "Japan",
  "Germany",
  "United Kingdom",
  "France",
  "Italy",
  "Spain",
  "Canada",
  "Mexico",
  "Argentina",
  "Australia",
  "India",
  "China",
  "South Korea",
  "Indonesia",
  "Saudi Arabia",
  "United Arab Emirates",
  "Egypt",
  "South Africa",
  "Nigeria",
  "Türkiye",
  "Netherlands",
  "Sweden",
  "Poland",
  "Other",
];

export default function Home() {
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#02050d] text-white">
      <header className="border-b border-white/[0.07] bg-[#02050d]">
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
            onClick={() => setJoinOpen(true)}
            className="rounded-full border border-cyan-300/40 bg-cyan-300/[0.06] px-5 py-2.5 text-xs tracking-wider text-cyan-100 transition hover:bg-cyan-300/[0.12]"
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
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.13),transparent_58%)]" />
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
                projectionConfig={{ scale: 147, center: [0, 5] }}
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
                          fill="#06111c"
                          stroke="#164e63"
                          strokeWidth={0.38}
                        />
                      ))
                    }
                  </Geographies>

                  {marks.map((mark) => (
                    <Marker key={mark.id} coordinates={mark.coordinates}>
                      <circle
                        r={mark.size * 2.7}
                        fill={mark.color}
                        opacity={0.07}
                      />
                      <circle
                        r={mark.size}
                        fill={mark.color}
                        opacity={0.95}
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
                onClick={() => setJoinOpen(true)}
                className="whitespace-nowrap rounded-full bg-white px-7 py-3 text-xs font-semibold tracking-wide text-black shadow-[0_0_35px_rgba(255,255,255,0.12)] transition hover:scale-[1.02]"
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
              <span className="text-[9px] text-cyan-400/60">LIVE</span>
            </div>

            <div className="mt-6 space-y-5 text-xs">
              {topCountries.map(([rank, country, total]) => (
                <div
                  key={country}
                  className="flex items-center justify-between border-b border-white/[0.05] pb-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-slate-600">{rank}</span>
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
            {recentMarks.map(([number, country, symbol]) => (
              <div
                key={number}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">
                  {symbol}
                </div>
                <div>
                  <p className="text-[10px] text-slate-300">{number}</p>
                  <p className="mt-1 text-[8px] tracking-wider text-slate-600">
                    {country}
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

      {joinOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setJoinOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-[520px] overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#050b16] shadow-[0_0_80px_rgba(34,211,238,0.08)]">
            <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_70%)]" />

            <div className="relative p-6 sm:p-8">
              <button
                type="button"
                onClick={() => setJoinOpen(false)}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm text-slate-500 transition hover:text-white"
              >
                ×
              </button>

              <p className="text-[9px] tracking-[0.32em] text-cyan-300">
                MARK AT ZERO
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Leave your mark.
              </h2>

              <p className="mt-2 max-w-md text-xs leading-6 text-slate-500">
                Add one piece of yourself to a global moment shared at
                00:00:00.
              </p>

              <div className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="country"
                    className="mb-2 block text-[9px] tracking-[0.2em] text-slate-500"
                  >
                    YOUR COUNTRY
                  </label>

                  <select
                    id="country"
                    defaultValue=""
                    className="w-full rounded-xl border border-white/10 bg-[#08111f] px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-cyan-300/40"
                  >
                    <option value="" disabled>
                      Choose a country
                    </option>

                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-[9px] tracking-[0.2em] text-slate-500"
                  >
                    YOUR MESSAGE
                  </label>

                  <input
                    id="message"
                    type="text"
                    maxLength={80}
                    placeholder="A few words for the world..."
                    className="w-full rounded-xl border border-white/10 bg-[#08111f] px-4 py-3 text-sm text-slate-300 outline-none placeholder:text-slate-700 focus:border-cyan-300/40"
                  />

                  <p className="mt-2 text-right text-[8px] text-slate-700">
                    MAX 80 CHARACTERS
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-[9px] tracking-[0.2em] text-slate-500">
                    YOUR MARK
                  </p>

                  <label
                    htmlFor="mark-file"
                    className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-cyan-300/20 bg-cyan-300/[0.025] p-4 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.05]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] text-lg text-cyan-300">
                      +
                    </div>

                    <div>
                      <p className="text-xs text-slate-300">
                        Choose your image
                      </p>
                      <p className="mt-1 text-[9px] text-slate-600">
                        Your photo, logo, symbol or artwork
                      </p>
                    </div>
                  </label>

                  <input
                    id="mark-file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between border-t border-white/[0.07] pt-5">
                <div>
                  <p className="text-[8px] tracking-[0.18em] text-slate-600">
                    ONE MARK
                  </p>
                  <p className="mt-1 text-lg font-medium">€1</p>
                </div>

                <button
                  type="button"
                  className="rounded-full bg-white px-7 py-3 text-xs font-semibold tracking-wide text-black transition hover:scale-[1.02]"
                >
                  CONTINUE
                </button>
              </div>

              <p className="mt-5 text-center text-[8px] leading-4 tracking-wider text-slate-700">
                PAYMENT IS NOT ACTIVE IN THIS DEVELOPMENT VERSION.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}