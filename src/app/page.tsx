"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
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

type PaidMark = {
  id: number;
  created_at: string;
  country: string;
  message: string | null;
  image_url: string;
  mark_number: number;
};

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Republic of the)",
  "Costa Rica",
  "Côte d’Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Holy See (Vatican City)",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Türkiye",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

export default function Home() {
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState<[number, number]>([8, 18]);

  const [paidMarks, setPaidMarks] = useState<PaidMark[]>([]);
  const [dataError, setDataError] = useState("");

  const [joinOpen, setJoinOpen] = useState(false);
  const [step, setStep] = useState<"create" | "review">("create");

  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");

  const [markFile, setMarkFile] = useState<File | null>(null);
  const [markPreview, setMarkPreview] = useState<string | null>(null);

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    return () => {
      if (markPreview) {
        URL.revokeObjectURL(markPreview);
      }
    };
  }, [markPreview]);

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
    setStep("create");
    setFormError("");
    setIsSubmitting(false);
    setJoinOpen(true);
  }

  function closeJoin() {
    setJoinOpen(false);
    setStep("create");
    setCountry("");
    setMessage("");
    setMarkFile(null);
    setMarkPreview(null);
    setFormError("");
    setIsSubmitting(false);
  }

  function handleMarkFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxFileSize = 15 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      event.target.value = "";
      setFormError("Please choose a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > maxFileSize) {
      event.target.value = "";
      setFormError("This image is over 15 MB. Please choose a smaller image.");
      return;
    }

    if (markPreview) {
      URL.revokeObjectURL(markPreview);
    }

    setMarkFile(file);
    setMarkPreview(URL.createObjectURL(file));
    setFormError("");
  }

  function removeMark() {
    if (markPreview) {
      URL.revokeObjectURL(markPreview);
    }

    setMarkFile(null);
    setMarkPreview(null);

    const input = document.getElementById(
      "mark-file"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  function continueToReview() {
    if (!country) {
      setFormError("Please choose your country.");
      return;
    }

    if (!markFile || !markPreview) {
      setFormError("Please choose an image for your mark.");
      return;
    }

    setFormError("");
    setStep("review");
  }

  async function startCheckout() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError("");

    try {
      if (!markFile) {
        throw new Error("Please choose an image for your mark.");
      }

      const formData = new FormData();
      formData.append("country", country);
      formData.append("message", message);
      formData.append("image", markFile);

      const markResponse = await fetch("/api/marks", {
        method: "POST",
        body: formData,
      });

      const markResult = await markResponse.json();

      if (!markResponse.ok || !markResult.mark?.id) {
        throw new Error(markResult.error || "Could not prepare your mark.");
      }

      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markId: markResult.mark.id,
        }),
      });

      const checkoutResult = await checkoutResponse.json();

      if (!checkoutResponse.ok || !checkoutResult.url) {
        throw new Error(
          checkoutResult.error || "Could not start secure checkout."
        );
      }

      window.location.href = checkoutResult.url;
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not start checkout."
      );
      setIsSubmitting(false);
    }
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
                            const properties = item.properties as {
                              name?: string;
                              ADMIN?: string;
                            };
                            const actual = normalizeCountryName(
                              properties?.name ?? properties?.ADMIN ?? ""
                            );
                            return (
                              actual === wanted ||
                              actual.includes(wanted) ||
                              wanted.includes(actual)
                            );
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
                onClick={openJoin}
                className="whitespace-nowrap rounded-full border border-cyan-200/30 bg-cyan-100 px-8 py-3 text-xs font-semibold tracking-wide text-[#021018] shadow-[0_0_35px_rgba(34,211,238,0.28)] transition hover:scale-[1.02]"
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

      {joinOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeJoin();
            }
          }}
        >
          <div className="relative w-full max-w-[520px] overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#050b16] shadow-[0_0_80px_rgba(34,211,238,0.08)]">
            <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_70%)]" />

            <div className="relative p-6 sm:p-8">
              <button
                type="button"
                onClick={closeJoin}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm text-slate-500 transition hover:text-white"
              >
                ×
              </button>

              {step === "create" ? (
                <>
                  <p className="text-[9px] tracking-[0.32em] text-cyan-300">
                    MARK AT ZERO · 01
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
                        value={country}
                        onChange={(event) => {
                          setCountry(event.target.value);
                          setFormError("");
                        }}
                        className="w-full rounded-xl border border-white/10 bg-[#08111f] px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-cyan-300/40"
                      >
                        <option value="" disabled>
                          Choose a country
                        </option>

                        {countries.map((itemCountry) => (
                          <option key={itemCountry} value={itemCountry}>
                            {itemCountry}
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
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="A few words for the world..."
                        className="w-full rounded-xl border border-white/10 bg-[#08111f] px-4 py-3 text-sm text-slate-300 outline-none placeholder:text-slate-700 focus:border-cyan-300/40"
                      />

                      <p className="mt-2 text-right text-[8px] text-slate-700">
                        {message.length} / 80
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-[9px] tracking-[0.2em] text-slate-500">
                        YOUR MARK
                      </p>

                      {!markPreview ? (
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
                      ) : (
                        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.025] p-3">
                          <div className="flex items-center gap-4">
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                              <img
                                src={markPreview}
                                alt="Your mark preview"
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-[9px] tracking-[0.18em] text-cyan-300">
                                MARK READY
                              </p>

                              <p className="mt-2 truncate text-xs text-slate-300">
                                {markFile?.name}
                              </p>

                              <p className="mt-1 text-[9px] text-slate-600">
                                Preview of your mark
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={removeMark}
                              className="rounded-full border border-white/10 px-3 py-2 text-[9px] tracking-wider text-slate-500 transition hover:border-white/20 hover:text-white"
                            >
                              REMOVE
                            </button>
                          </div>

                          <label
                            htmlFor="mark-file"
                            className="mt-3 block cursor-pointer rounded-lg border border-white/[0.07] py-2 text-center text-[9px] tracking-[0.18em] text-slate-500 transition hover:text-cyan-300"
                          >
                            CHOOSE A DIFFERENT IMAGE
                          </label>
                        </div>
                      )}

                      <input
                        id="mark-file"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleMarkFile}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-[10px] text-red-300">
                      {formError}
                    </div>
                  )}

                  <div className="mt-7 flex items-center justify-between border-t border-white/[0.07] pt-5">
                    <div>
                      <p className="text-[8px] tracking-[0.18em] text-slate-600">
                        ONE MARK
                      </p>

                      <p className="mt-1 text-lg font-medium">€1</p>
                    </div>

                    <button
                      type="button"
                      onClick={continueToReview}
                      className="rounded-full bg-white px-7 py-3 text-xs font-semibold tracking-wide text-black transition hover:scale-[1.02]"
                    >
                      CONTINUE
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[9px] tracking-[0.32em] text-cyan-300">
                    MARK AT ZERO · 02
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                    Review your mark.
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    This is how your contribution will enter the world.
                  </p>

                  <div className="mt-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08111f]">
                    <div className="relative aspect-[16/9] overflow-hidden bg-black/30">
                      {markPreview && (
                        <img
                          src={markPreview}
                          alt="Mark review"
                          className="h-full w-full object-contain"
                        />
                      )}

                      <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[8px] tracking-[0.18em] text-cyan-200 backdrop-blur">
                        YOUR MARK
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[8px] tracking-[0.2em] text-slate-600">
                            COUNTRY
                          </p>

                          <p className="mt-2 text-sm text-slate-200">
                            {country}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[8px] tracking-[0.2em] text-slate-600">
                            PRICE
                          </p>

                          <p className="mt-2 text-sm text-white">€1</p>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-white/[0.07] pt-5">
                        <p className="text-[8px] tracking-[0.2em] text-slate-600">
                          MESSAGE
                        </p>

                        <p className="mt-2 min-h-5 text-xs leading-5 text-slate-300">
                          {message.trim()
                            ? message
                            : "No message — just your mark."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("create")}
                      className="rounded-full border border-white/10 px-6 py-3 text-[10px] tracking-[0.15em] text-slate-400 transition hover:text-white"
                    >
                      ← EDIT
                    </button>

                    <button
                      type="button"
                      onClick={startCheckout}
                      disabled={isSubmitting}
                      className="rounded-full bg-white px-7 py-3 text-xs font-semibold tracking-wide text-black transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "PREPARING PAYMENT..."
                        : "PAY €1 & LEAVE YOUR MARK"}
                    </button>
                  </div>

                  {formError && (
                    <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-[10px] text-red-300">
                      {formError}
                    </div>
                  )}



                  <p className="mt-5 text-center text-[8px] leading-4 tracking-wider text-slate-700">
                    SECURE CHECKOUT POWERED BY STRIPE · SANDBOX TEST MODE
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
