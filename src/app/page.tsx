"use client";

import { useEffect, useState } from "react";
import LeaveMarkModal from "../components/LeaveMarkModal";
import MarksExperience from "../components/experience/MarksExperience";
import type { PaidMark } from "../types/mark";

const PROJECT_START = new Date("2026-10-01T00:00:00");

function getProjectDay() {
  const now = new Date();

  if (now < PROJECT_START) {
    return 0;
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return (
    Math.floor(
      (now.getTime() - PROJECT_START.getTime()) / millisecondsPerDay
    ) + 1
  );
}

export default function Home() {
  const [marks, setMarks] = useState<PaidMark[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [joinOpen, setJoinOpen] = useState(false);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    async function loadMarks() {
      try {
        const response = await fetch("/api/marks", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not load marks.");
        }

        setMarks(Array.isArray(result.marks) ? result.marks : []);
      } catch (error) {
        setDataError(
          error instanceof Error ? error.message : "Could not load marks."
        );
      }
    }

    loadMarks();
  }, []);

  const projectDay = getProjectDay();
  const marksLabel = marks.length === 1 ? "MARK SO FAR" : "MARKS SO FAR";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#05070b] text-white">
      <header className="relative z-50 border-b border-white/[0.055] bg-[#05070b]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[58px] max-w-[1500px] items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.23em]">
                MARK AT ZERO
              </p>

              <p className="mt-0.5 hidden text-[6px] tracking-[0.26em] text-white/25 sm:block">
                LEAVE SOMETHING HUMAN BEHIND
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-[8px] tracking-[0.19em] text-white/35 lg:flex">
            <button className="transition hover:text-white">EXPLORE</button>
            <button className="transition hover:text-white">COUNTRIES</button>
            <button className="transition hover:text-white">RANDOM</button>
            <button className="transition hover:text-white">ABOUT</button>
          </nav>

          <button
            type="button"
            onClick={() => setJoinOpen(true)}
            className="rounded-full bg-white px-4 py-2 text-[8px] font-semibold tracking-[0.13em] text-black transition hover:scale-[1.02]"
          >
            LEAVE YOUR MARK · €1
          </button>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute left-1/2 top-[150px] h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-white/[0.018] blur-[120px]" />

        <div className="relative z-30 mx-auto max-w-[760px] px-5 pb-0 pt-7 text-center md:pt-8">
          <p className="text-[7px] font-medium tracking-[0.4em] text-white/32 md:text-[8px]">
            REAL PEOPLE. REAL MOMENTS.
          </p>

          <h1 className="mt-3 text-[36px] font-medium leading-[0.98] tracking-[-0.045em] sm:text-[43px] md:text-[50px]">
            Leave something human behind.
          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <p className="text-[10px] tracking-[0.05em] text-white/45">
              A photo. Ten words. One Mark.
            </p>

            <span className="hidden h-1 w-1 rounded-full bg-white/15 sm:block" />

            <p className="text-[9px] tracking-[0.1em] text-white/27">
              Alone or together.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setJoinOpen(true)}
            className="mt-4 rounded-full bg-white px-6 py-2.5 text-[8px] font-semibold tracking-[0.14em] text-black transition hover:scale-[1.02]"
          >
            LEAVE YOUR MARK · €1
          </button>
        </div>

        <div className="relative z-10 -mt-1 md:-mt-2">
          <MarksExperience
            marks={marks}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
        </div>

        <div className="relative z-30 mx-auto -mt-1 max-w-[1050px] px-5 pb-4 md:-mt-2 md:px-8">
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.065] pt-4 md:flex-row">
            <div className="text-center md:text-left">
              <p className="leading-none">
                <span className="text-[22px] font-medium tracking-[-0.03em]">
                  {marks.length.toLocaleString()}
                </span>

                <span className="ml-2 text-[7px] tracking-[0.22em] text-white/35">
                  {marksLabel}
                </span>
              </p>

              <p className="mt-1.5 text-[6px] tracking-[0.18em] text-white/20">
                {projectDay > 0
                  ? `DAY ${projectDay} · LIVE SINCE 01 OCT 2026`
                  : "LAUNCHING 01 OCT 2026"}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className="rounded-full border border-white/[0.09] px-4 py-2 text-[7px] tracking-[0.13em] text-white/35 transition hover:border-white/25 hover:text-white"
              >
                RANDOM MARK
              </button>

              <button
                type="button"
                className="rounded-full border border-white/[0.09] px-4 py-2 text-[7px] tracking-[0.13em] text-white/35 transition hover:border-white/25 hover:text-white"
              >
                EXPLORE COUNTRIES
              </button>

              <button
                type="button"
                className="rounded-full border border-white/[0.09] px-4 py-2 text-[7px] tracking-[0.13em] text-white/35 transition hover:border-white/25 hover:text-white"
              >
                FIND A MARK · #
              </button>
            </div>
          </div>

          {dataError && (
            <p className="mt-3 text-center text-[7px] tracking-[0.15em] text-red-300/70">
              LIVE MARKS COULD NOT BE LOADED
            </p>
          )}
        </div>
      </section>

      <footer className="mx-auto max-w-[1050px] px-5 pb-5 md:px-8">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.045] pt-4 sm:flex-row">
          <p className="text-[6px] tracking-[0.18em] text-white/17">
            RESPECT THE MARK · RESPECT THE PEOPLE
          </p>

          <div className="flex gap-4 text-[6px] tracking-[0.14em] text-white/14">
            <button className="transition hover:text-white/40">
              CONTENT POLICY
            </button>

            <button className="transition hover:text-white/40">
              PRIVACY
            </button>

            <button className="transition hover:text-white/40">
              TERMS
            </button>
          </div>
        </div>
      </footer>

      {joinOpen && (
        <LeaveMarkModal onClose={() => setJoinOpen(false)} />
      )}
    </main>
  );
}