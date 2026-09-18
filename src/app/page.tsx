"use client";

import { useEffect, useMemo, useState } from "react";
import LeaveMarkModal from "../components/LeaveMarkModal";
import WorldMap from "../components/map/WorldMap";
import type { PaidMark } from "../types/mark";

export default function Home() {
  const [paidMarks, setPaidMarks] = useState<PaidMark[]>([]);
  const [dataError, setDataError] = useState("");

  const [joinOpen, setJoinOpen] = useState(false);

  useEffect(() => {
    async function loadPaidMarks() {
      try {
        const response = await fetch("/api/marks", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not load marks.");
        }

        setPaidMarks(Array.isArray(result.marks) ? result.marks : []);
      } catch (error) {
        setDataError(
          error instanceof Error ? error.message : "Could not load marks."
        );
      }
    }

    loadPaidMarks();
  }, []);


  const totalMarks = paidMarks.length;

  const countryTotals = useMemo(() => {
    const totals = new Map<string, number>();

    paidMarks.forEach((mark) => {
      totals.set(mark.country, (totals.get(mark.country) ?? 0) + 1);
    });

    return Array.from(totals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  }, [paidMarks]);

  const totalCountries = countryTotals.length;
  const topCountries = countryTotals.slice(0, 5);
  const recentMarks = paidMarks.slice(0, 4);

  function openJoin() {
    setJoinOpen(true);
  }

  return (
    <main className="min-h-screen bg-[#02050d] text-white">
      <header className="border-b border-white/[0.07] bg-[#02050d]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 md:px-8">
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
            onClick={openJoin}
            className="rounded-full border border-cyan-300/40 bg-cyan-300/[0.06] px-5 py-2.5 text-xs tracking-wider text-cyan-100 transition hover:bg-cyan-300/[0.12]"
          >
            JOIN NOW · €1
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-4 py-5 md:px-8">
        <div className="mb-4 grid grid-cols-3 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.025]">
          <div className="px-3 py-3 text-center">
            <p className="text-[8px] tracking-[0.28em] text-slate-500">
              PEOPLE
            </p>

            <p className="mt-1 text-lg font-medium md:text-xl">
              {totalMarks.toLocaleString()}
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
              {totalCountries.toLocaleString()}
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
              {totalMarks.toLocaleString()}
              <span className="ml-2 hidden text-[9px] font-normal text-cyan-400 sm:inline">
                AND GROWING
              </span>
            </p>
          </div>
        </div>

        {dataError && (
          <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-center text-[10px] text-red-300">
            LIVE DATA COULD NOT BE LOADED
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[1fr_230px]">
          <WorldMap paidMarks={paidMarks} totalMarks={totalMarks} onLeaveMark={openJoin} />

          <aside className="hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 xl:block">
            <div className="flex items-center justify-between">
              <p className="text-[9px] tracking-[0.25em] text-slate-400">
                TOP COUNTRIES
              </p>

              <span className="text-[9px] text-cyan-400/60">LIVE</span>
            </div>

            <div className="mt-6 space-y-5 text-xs">
              {topCountries.length > 0 ? (
                topCountries.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between border-b border-white/[0.05] pb-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-slate-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="text-[11px] text-slate-300">
                        {item.name}
                      </span>
                    </div>

                    <span className="text-[10px] text-cyan-300/80">
                      {item.total.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] leading-5 text-slate-600">
                  NO PAID MARKS YET.
                </p>
              )}
            </div>

            <p className="mt-7 text-[8px] leading-5 tracking-wider text-slate-600">
              EVERY MARK BECOMES PART OF ONE GLOBAL MOMENT AT 00:00:00.
            </p>
          </aside>
        </div>

        <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[9px] tracking-[0.25em] text-slate-500">
              RECENT & FEATURED MARKS
            </p>

            <p className="text-[8px] tracking-wider text-cyan-400/60">
              LIVE
            </p>
          </div>

          {recentMarks.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {recentMarks.map((mark) => (
                <div
                  key={mark.id}
                  className="rounded-xl border border-cyan-200/[0.08] bg-[#030b15] p-2 transition hover:border-cyan-300/25"
                >
                  <div className="aspect-[16/10] overflow-hidden rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06]">
                    <img
                      src={mark.image_url}
                      alt={`Mark #${mark.mark_number}`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 px-1 pb-1 pt-3">
                    <p className="text-[10px] text-cyan-100">
                      #{mark.mark_number}
                    </p>

                    <p className="mt-1 truncate text-[8px] tracking-wider text-slate-600">
                      {mark.country}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-[10px] text-slate-600">
              NO PAID MARKS YET.
            </p>
          )}
        </div>

        <div className="py-8 text-center">
          <p className="text-[9px] tracking-[0.35em] text-slate-600">
            ONE MILLION IS THE FIRST MILESTONE · THE WORLD KEEPS GROWING
          </p>
        </div>
      </section>

      {joinOpen && <LeaveMarkModal onClose={() => setJoinOpen(false)} />}
    </main>
  );
}
