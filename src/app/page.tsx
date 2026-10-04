"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LeaveMarkModal from "../components/LeaveMarkModal";
import MarkTypeChoice from "../components/MarkTypeChoice";
import MarksExperience from "../components/experience/MarksExperience";
import type { PaidMark } from "../types/mark";

const PROJECT_START = new Date("2026-10-05T00:00:00");

type CountrySummary = {
  country: string;
  mark_count: number;
};

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

function getMarkNumberFromPath(pathname: string) {
  const match = pathname.match(/^\/(\d+)\/?$/);

  if (!match) {
    return null;
  }

  const markNumber = Number(match[1]);

  if (!Number.isSafeInteger(markNumber) || markNumber < 1) {
    return null;
  }

  return markNumber;
}

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  const [marks, setMarks] = useState<PaidMark[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [joinOpen, setJoinOpen] = useState(false);
  const [markChoiceOpen, setMarkChoiceOpen] = useState(false);

  const [findOpen, setFindOpen] = useState(false);
  const [findValue, setFindValue] = useState("");

  const [countriesOpen, setCountriesOpen] = useState(false);
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState("");

  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryMarks, setCountryMarks] = useState<PaidMark[]>([]);
  const [countryLoading, setCountryLoading] = useState(false);

  const [dataError, setDataError] = useState("");
  const [randomLoading, setRandomLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMarks() {
      try {
        setDataError("");

        const requestedMarkNumber = getMarkNumberFromPath(pathname);

        const latestResponse = await fetch("/api/marks", {
          cache: "no-store",
        });

        const latestResult = await latestResponse.json();

        if (!latestResponse.ok) {
          throw new Error(
            latestResult.error || "Could not load marks."
          );
        }

        const latestMarks: PaidMark[] = Array.isArray(latestResult.marks)
          ? latestResult.marks
          : [];

        const latestTotalCount =
          typeof latestResult.totalCount === "number"
            ? latestResult.totalCount
            : latestMarks.length;

        if (!cancelled) {
          setTotalCount(latestTotalCount);
        }

        if (requestedMarkNumber === null) {
          if (!cancelled) {
            setMarks(latestMarks);
            setSelectedIndex(0);
          }

          return;
        }

        const existingIndex = latestMarks.findIndex(
          (mark) => mark.mark_number === requestedMarkNumber
        );

        if (existingIndex >= 0) {
          if (!cancelled) {
            setMarks(latestMarks);
            setSelectedIndex(existingIndex);
          }

          return;
        }

        const markResponse = await fetch(
          `/api/marks?number=${requestedMarkNumber}`,
          {
            cache: "no-store",
          }
        );

        const markResult = await markResponse.json();

        if (markResponse.status === 404) {
          if (!cancelled) {
            setMarks(latestMarks);
            setSelectedIndex(0);
            setDataError(
              `MARK #${requestedMarkNumber} WAS NOT FOUND`
            );
          }

          return;
        }

        if (!markResponse.ok) {
          throw new Error(
            markResult.error || "Could not load this Mark."
          );
        }

        const requestedMark = markResult.mark as PaidMark;

        if (!cancelled) {
          setMarks([requestedMark, ...latestMarks]);
          setSelectedIndex(0);
        }
      } catch (error) {
        if (!cancelled) {
          setDataError(
            error instanceof Error
              ? error.message
              : "Could not load marks."
          );
        }
      }
    }

    loadMarks();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  function selectMark(index: number) {
    const mark = marks[index];

    if (!mark) {
      return;
    }

    setSelectedIndex(index);

    const nextPath = `/${mark.mark_number}`;

    if (pathname !== nextPath) {
      router.push(nextPath);
    }
  }

  async function openRandomMark() {
    if (randomLoading) {
      return;
    }

    try {
      setRandomLoading(true);
      setDataError("");

      const response = await fetch("/api/marks?random=true", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not find a random Mark."
        );
      }

      const randomMark = result.mark as PaidMark;

      router.push(`/${randomMark.mark_number}`);
    } catch (error) {
      setDataError(
        error instanceof Error
          ? error.message
          : "Could not find a random Mark."
      );
    } finally {
      setRandomLoading(false);
    }
  }

  function openFindMark() {
    setDataError("");
    setFindOpen(true);
  }

  function closeFindMark() {
    setFindOpen(false);
    setFindValue("");
  }

  function submitFindMark(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const markNumber = Number(findValue);

    if (
      !Number.isSafeInteger(markNumber) ||
      markNumber < 1
    ) {
      setDataError("ENTER A VALID MARK NUMBER");
      return;
    }

    setDataError("");
    setFindOpen(false);
    setFindValue("");

    router.push(`/${markNumber}`);
  }

  async function openCountries() {
    setCountriesOpen(true);
    setSelectedCountry("");
    setCountryMarks([]);
    setCountriesError("");

    if (countries.length > 0 || countriesLoading) {
      return;
    }

    try {
      setCountriesLoading(true);

      const response = await fetch("/api/marks?countries=true", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not load countries."
        );
      }

      const loadedCountries: CountrySummary[] =
        Array.isArray(result.countries)
          ? result.countries.map(
              (item: {
                country?: unknown;
                mark_count?: unknown;
              }) => ({
                country:
                  typeof item.country === "string"
                    ? item.country
                    : "",
                mark_count: Number(item.mark_count) || 0,
              })
            )
          : [];

      setCountries(
        loadedCountries.filter(
          (item) => item.country && item.mark_count > 0
        )
      );
    } catch (error) {
      setCountriesError(
        error instanceof Error
          ? error.message
          : "Could not load countries."
      );
    } finally {
      setCountriesLoading(false);
    }
  }

  function closeCountries() {
    setCountriesOpen(false);
    setSelectedCountry("");
    setCountryMarks([]);
    setCountriesError("");
  }

  async function openCountry(country: string) {
    if (countryLoading) {
      return;
    }

    try {
      setSelectedCountry(country);
      setCountryMarks([]);
      setCountriesError("");
      setCountryLoading(true);

      const response = await fetch(
        `/api/marks?country=${encodeURIComponent(country)}`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not load this country."
        );
      }

      const loadedMarks: PaidMark[] = Array.isArray(result.marks)
        ? result.marks
        : [];

      setCountryMarks(loadedMarks);
    } catch (error) {
      setCountriesError(
        error instanceof Error
          ? error.message
          : "Could not load this country."
      );
    } finally {
      setCountryLoading(false);
    }
  }

  function backToCountries() {
    setSelectedCountry("");
    setCountryMarks([]);
    setCountriesError("");
  }

  function openCountryMark(mark: PaidMark) {
    closeCountries();
    router.push(`/${mark.mark_number}`);
  }

  const projectDay = getProjectDay();
  const marksLabel =
    totalCount === 1 ? "MARK SO FAR" : "MARKS SO FAR";

  const selectedCountrySummary = countries.find(
    (item) => item.country === selectedCountry
  );

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
            <button
              type="button"
              className="transition hover:text-white"
            >
              EXPLORE
            </button>

            <button
              type="button"
              onClick={openCountries}
              className="transition hover:text-white"
            >
              COUNTRIES
            </button>

            <button
              type="button"
              onClick={openRandomMark}
              disabled={randomLoading}
              className="transition hover:text-white disabled:opacity-30"
            >
              {randomLoading ? "LOADING" : "RANDOM"}
            </button>

            <button
              type="button"
              className="transition hover:text-white"
            >
              ABOUT
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setMarkChoiceOpen(true)}
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
            onClick={() => setMarkChoiceOpen(true)}
            className="mt-4 rounded-full bg-white px-6 py-2.5 text-[8px] font-semibold tracking-[0.14em] text-black transition hover:scale-[1.02]"
          >
            LEAVE YOUR MARK · €1
          </button>
        </div>

        <div className="relative z-10 -mt-1 md:-mt-2">
          <MarksExperience
            marks={marks}
            selectedIndex={selectedIndex}
            onSelect={selectMark}
          />
        </div>

        <div className="relative z-30 mx-auto -mt-1 max-w-[1050px] px-5 pb-4 md:-mt-2 md:px-8">
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.065] pt-4 md:flex-row">
            <div className="text-center md:text-left">
              <p className="leading-none">
                <span className="text-[22px] font-medium tracking-[-0.03em]">
                  {totalCount.toLocaleString()}
                </span>

                <span className="ml-2 text-[7px] tracking-[0.22em] text-white/35">
                  {marksLabel}
                </span>
              </p>

              <p className="mt-1.5 text-[6px] tracking-[0.18em] text-white/20">
                {projectDay > 0
                  ? `DAY ${projectDay} · LIVE SINCE 05 OCT 2026`
                  : "LAUNCHING 05 OCT 2026"}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={openRandomMark}
                disabled={randomLoading}
                className="rounded-full border border-white/[0.09] px-4 py-2 text-[7px] tracking-[0.13em] text-white/35 transition hover:border-white/25 hover:text-white disabled:opacity-30"
              >
                {randomLoading ? "LOADING..." : "RANDOM MARK"}
              </button>

              <button
                type="button"
                onClick={openCountries}
                className="rounded-full border border-white/[0.09] px-4 py-2 text-[7px] tracking-[0.13em] text-white/35 transition hover:border-white/25 hover:text-white"
              >
                EXPLORE COUNTRIES
              </button>

              <button
                type="button"
                onClick={openFindMark}
                className="rounded-full border border-white/[0.09] px-4 py-2 text-[7px] tracking-[0.13em] text-white/35 transition hover:border-white/25 hover:text-white"
              >
                FIND A MARK · #
              </button>
            </div>
          </div>

          {dataError && (
            <p className="mt-3 text-center text-[7px] tracking-[0.15em] text-red-300/70">
              {dataError}
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
            <a
              href="/content-policy"
              className="transition hover:text-white/40"
            >
              CONTENT POLICY
            </a>

            <a
              href="/privacy"
              className="transition hover:text-white/40"
            >
              PRIVACY
            </a>

            <a
              href="/terms"
              className="transition hover:text-white/40"
            >
              TERMS
            </a>
          </div>
        </div>
      </footer>

      {countriesOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 px-5 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              closeCountries();
            }
          }}
        >
          <div className="flex max-h-[82vh] w-full max-w-[680px] flex-col overflow-hidden rounded-[24px] border border-white/[0.12] bg-[#090d13] shadow-[0_30px_120px_rgba(0,0,0,0.85)]">
            <div className="flex items-start justify-between gap-5 border-b border-white/[0.07] px-6 py-5 md:px-7">
              <div className="min-w-0">
                {selectedCountry ? (
                  <>
                    <button
                      type="button"
                      onClick={backToCountries}
                      className="mb-3 text-[7px] tracking-[0.2em] text-white/25 transition hover:text-white/70"
                    >
                      ← ALL COUNTRIES
                    </button>

                    <p className="truncate text-[24px] font-medium tracking-[-0.03em] text-white/95">
                      {selectedCountry}
                    </p>

                    <p className="mt-1.5 text-[7px] tracking-[0.18em] text-white/28">
                      {selectedCountrySummary
                        ? `${selectedCountrySummary.mark_count.toLocaleString()} ${
                            selectedCountrySummary.mark_count === 1
                              ? "MARK"
                              : "MARKS"
                          }`
                        : "MARKS FROM THIS COUNTRY"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[7px] tracking-[0.3em] text-white/30">
                      EXPLORE
                    </p>

                    <p className="mt-2 text-[24px] font-medium tracking-[-0.03em] text-white/95">
                      Countries
                    </p>

                    <p className="mt-1.5 text-[8px] leading-4 tracking-[0.06em] text-white/30">
                      Discover Marks left by people around the world.
                    </p>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={closeCountries}
                aria-label="Close countries"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-[15px] text-white/35 transition hover:border-white/30 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="min-h-[240px] overflow-y-auto p-4 md:p-5">
              {!selectedCountry && countriesLoading && (
                <div className="flex min-h-[220px] items-center justify-center">
                  <p className="text-[7px] tracking-[0.24em] text-white/25">
                    LOADING COUNTRIES...
                  </p>
                </div>
              )}

              {!selectedCountry &&
                !countriesLoading &&
                countries.length === 0 &&
                !countriesError && (
                  <div className="flex min-h-[220px] items-center justify-center text-center">
                    <div>
                      <p className="text-[12px] text-white/55">
                        No countries yet.
                      </p>

                      <p className="mt-2 text-[7px] tracking-[0.12em] text-white/22">
                        THE FIRST MARK WILL START THE WORLD.
                      </p>
                    </div>
                  </div>
                )}

              {!selectedCountry &&
                !countriesLoading &&
                countries.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {countries.map((item) => (
                      <button
                        key={item.country}
                        type="button"
                        onClick={() => openCountry(item.country)}
                        className="group flex items-center justify-between rounded-[15px] border border-white/[0.07] bg-white/[0.025] px-4 py-4 text-left transition hover:border-white/[0.18] hover:bg-white/[0.05]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-medium text-white/80 transition group-hover:text-white">
                            {item.country}
                          </p>

                          <p className="mt-1 text-[6px] tracking-[0.16em] text-white/23">
                            {item.mark_count.toLocaleString()}{" "}
                            {item.mark_count === 1
                              ? "MARK"
                              : "MARKS"}
                          </p>
                        </div>

                        <span className="ml-4 text-[15px] text-white/16 transition group-hover:translate-x-0.5 group-hover:text-white/55">
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                )}

              {selectedCountry && countryLoading && (
                <div className="flex min-h-[220px] items-center justify-center">
                  <p className="text-[7px] tracking-[0.24em] text-white/25">
                    LOADING MARKS...
                  </p>
                </div>
              )}

              {selectedCountry &&
                !countryLoading &&
                countryMarks.length === 0 &&
                !countriesError && (
                  <div className="flex min-h-[220px] items-center justify-center text-center">
                    <p className="text-[9px] tracking-[0.12em] text-white/30">
                      NO MARKS FOUND
                    </p>
                  </div>
                )}

              {selectedCountry &&
                !countryLoading &&
                countryMarks.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {countryMarks.map((mark) => (
                      <button
                        key={mark.id}
                        type="button"
                        onClick={() => openCountryMark(mark)}
                        className="group overflow-hidden rounded-[15px] border border-white/[0.08] bg-white/[0.025] text-left transition hover:-translate-y-0.5 hover:border-white/[0.2]"
                      >
                        <div className="aspect-[4/5] overflow-hidden bg-white/[0.025]">
                          <img
                            src={mark.image_url}
                            alt={`Mark #${mark.mark_number}`}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                        </div>

                        <div className="p-3">
                          <p className="text-[6px] tracking-[0.18em] text-white/25">
                            MARK #
                            {mark.mark_number.toLocaleString()}
                          </p>

                          {mark.message && (
                            <p className="mt-1.5 line-clamp-2 text-[8px] leading-4 text-white/60">
                              {mark.message}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

              {countriesError && (
                <div className="py-6 text-center">
                  <p className="text-[7px] tracking-[0.13em] text-red-300/70">
                    {countriesError}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-4">
              <p className="text-[6px] tracking-[0.16em] text-white/16">
                REAL PEOPLE · REAL MOMENTS
              </p>

              {selectedCountry &&
                selectedCountrySummary &&
                selectedCountrySummary.mark_count > 10 && (
                  <p className="text-[6px] tracking-[0.13em] text-white/20">
                    SHOWING LATEST 10
                  </p>
                )}
            </div>
          </div>
        </div>
      )}

      {findOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              closeFindMark();
            }
          }}
        >
          <div className="w-full max-w-[360px] rounded-[20px] border border-white/[0.12] bg-[#090d13] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[7px] tracking-[0.3em] text-white/30">
                  FIND A MARK
                </p>

                <p className="mt-2 text-[18px] tracking-[-0.02em] text-white/90">
                  Enter its number.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFindMark}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-[14px] text-white/35 transition hover:border-white/30 hover:text-white"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={submitFindMark}
              className="mt-6 flex items-center gap-2"
            >
              <div className="flex min-w-0 flex-1 items-center rounded-full border border-white/[0.13] bg-white/[0.035] px-4">
                <span className="text-[13px] text-white/25">
                  #
                </span>

                <input
                  autoFocus
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={findValue}
                  onChange={(event) =>
                    setFindValue(event.target.value)
                  }
                  placeholder="18427"
                  className="h-11 min-w-0 flex-1 bg-transparent px-2 text-[13px] text-white outline-none placeholder:text-white/15"
                />
              </div>

              <button
                type="submit"
                className="h-11 rounded-full bg-white px-5 text-[8px] font-semibold tracking-[0.16em] text-black transition hover:scale-[1.02]"
              >
                GO
              </button>
            </form>

            <p className="mt-4 text-[6px] leading-4 tracking-[0.13em] text-white/20">
              EVERY MARK HAS ONE PERMANENT NUMBER.
            </p>
          </div>
        </div>
      )}

      {markChoiceOpen && (
        <MarkTypeChoice
          onClose={() => setMarkChoiceOpen(false)}
          onMyMark={() => {
            setMarkChoiceOpen(false);
            setJoinOpen(true);
          }}
          onOurMark={() => router.push("/our")}
        />
      )}

      {joinOpen && (
        <LeaveMarkModal onClose={() => setJoinOpen(false)} />
      )}
    </main>
  );
}