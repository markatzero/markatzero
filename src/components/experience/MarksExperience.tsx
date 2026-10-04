import type { CSSProperties } from "react";
import type { PaidMark } from "../../types/mark";

type Props = {
  marks: PaidMark[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

type StripMark = {
  mark: PaidMark;
  globalIndex: number;
};

type RibbonProps = {
  marks: StripMark[];
  onSelect: (index: number) => void;
  direction: "left" | "right";
  speed: number;
  top: string;
  opacity: number;
  scale: number;
  phase: number;
};

function getArc(index: number, phase: number) {
  const position = (index + phase) % 15;
  const distance = Math.abs(position - 7);

  return {
    y: Math.pow(distance, 1.55) * 1.55,
    rotate: (position - 7) * 0.55,
    scale: 1 - distance * 0.012,
  };
}

function EmptyFrame({
  index,
  phase,
}: {
  index: number;
  phase: number;
}) {
  const arc = getArc(index, phase);

  const style: CSSProperties = {
    transform: `translateY(${arc.y}px) rotate(${arc.rotate}deg) scale(${arc.scale})`,
  };

  return (
    <div
      aria-hidden="true"
      style={style}
      className="relative h-[96px] w-[72px] shrink-0 overflow-hidden rounded-[7px] border border-white/[0.045] bg-[#0c1117]/70 md:h-[112px] md:w-[84px]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/30" />

      <div className="absolute left-[12%] top-[10%] h-[55%] w-[70%] rounded-full bg-white/[0.018] blur-xl" />

      <div className="absolute inset-x-2 bottom-2 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
    </div>
  );
}

function MarkFrame({
  item,
  index,
  phase,
  onSelect,
}: {
  item: StripMark;
  index: number;
  phase: number;
  onSelect: (index: number) => void;
}) {
  const arc = getArc(index, phase);

  const style: CSSProperties = {
    transform: `translateY(${arc.y}px) rotate(${arc.rotate}deg) scale(${arc.scale})`,
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(item.globalIndex)}
      style={style}
      className="group relative h-[96px] w-[72px] shrink-0 overflow-hidden rounded-[7px] border border-white/15 bg-[#0c1117] shadow-[0_14px_38px_rgba(0,0,0,0.5)] transition-[filter] duration-300 hover:z-40 hover:brightness-110 md:h-[112px] md:w-[84px]"
    >
      <img
        src={item.mark.image_url}
        alt={`Mark #${item.mark.mark_number}`}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-7">
        <p className="text-left text-[6px] tracking-[0.12em] text-white/75">
          #{item.mark.mark_number}
        </p>
      </div>
    </button>
  );
}

function Ribbon({
  marks,
  onSelect,
  direction,
  speed,
  top,
  opacity,
  scale,
  phase,
}: RibbonProps) {
  const slotCount = 22;

  const frames = Array.from({ length: slotCount }).map((_, index) => {
    const item = marks[index];

    return item ? (
      <MarkFrame
        key={`mark-${item.mark.id}`}
        item={item}
        index={index}
        phase={phase}
        onSelect={onSelect}
      />
    ) : (
      <EmptyFrame
        key={`empty-${phase}-${index}`}
        index={index}
        phase={phase}
      />
    );
  });

  const animationStyle = {
    "--ribbon-duration": `${speed}s`,
    "--ribbon-opacity": opacity,
    "--ribbon-scale": scale,
  } as CSSProperties;

  return (
    <div
      className="absolute left-0 right-0 overflow-hidden"
      style={{ top }}
    >
      <div
        className={`mark-ribbon ${
          direction === "left"
            ? "mark-ribbon-left"
            : "mark-ribbon-right"
        }`}
        style={animationStyle}
      >
        <div className="flex shrink-0 items-center gap-[7px] pr-[7px]">
          {frames}
        </div>

        <div
          aria-hidden="true"
          className="flex shrink-0 items-center gap-[7px] pr-[7px]"
        >
          {frames.map((frame, index) => (
            <div key={`copy-${phase}-${index}`}>
              {frame}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MarksExperience({
  marks,
  selectedIndex,
  onSelect,
}: Props) {
  const selectedMark = marks[selectedIndex] ?? null;

  const strips: StripMark[][] = [[], [], [], []];

  marks.forEach((mark, globalIndex) => {
    strips[globalIndex % strips.length].push({
      mark,
      globalIndex,
    });
  });

  function previousMark() {
    if (marks.length < 2) return;

    onSelect(
      selectedIndex === 0
        ? marks.length - 1
        : selectedIndex - 1
    );
  }

  function nextMark() {
    if (marks.length < 2) return;

    onSelect(
      selectedIndex === marks.length - 1
        ? 0
        : selectedIndex + 1
    );
  }

  return (
    <section className="relative h-[430px] w-full overflow-hidden md:h-[455px]">
      <style>{`
        @keyframes markRibbonLeft {
          from {
            transform:
              translate3d(0, 0, 0)
              scale(var(--ribbon-scale));
          }

          to {
            transform:
              translate3d(-50%, 0, 0)
              scale(var(--ribbon-scale));
          }
        }

        @keyframes markRibbonRight {
          from {
            transform:
              translate3d(-50%, 0, 0)
              scale(var(--ribbon-scale));
          }

          to {
            transform:
              translate3d(0, 0, 0)
              scale(var(--ribbon-scale));
          }
        }

        .mark-ribbon {
          display: flex;
          width: max-content;
          opacity: var(--ribbon-opacity);
          transform-origin: center center;
          will-change: transform;
        }

        .mark-ribbon-left {
          animation:
            markRibbonLeft
            var(--ribbon-duration)
            linear
            infinite;
        }

        .mark-ribbon-right {
          animation:
            markRibbonRight
            var(--ribbon-duration)
            linear
            infinite;
        }

        .mark-ribbon:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .mark-ribbon-left,
          .mark-ribbon-right {
            animation: none;
          }
        }
      `}</style>

      {/* cinematic atmosphere */}
      <div className="pointer-events-none absolute left-1/2 top-[48%] h-[340px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[#172432]/25 blur-[105px]" />

      <div className="pointer-events-none absolute left-1/2 top-[46%] h-[220px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c8d8df]/[0.035] blur-[70px]" />

      {/* moving film ribbons */}
      <Ribbon
        marks={strips[0]}
        onSelect={onSelect}
        direction="left"
        speed={58}
        top="6px"
        opacity={0.28}
        scale={0.84}
        phase={0}
      />

      <Ribbon
        marks={strips[1]}
        onSelect={onSelect}
        direction="right"
        speed={72}
        top="102px"
        opacity={0.48}
        scale={0.94}
        phase={3}
      />

      <Ribbon
        marks={strips[2]}
        onSelect={onSelect}
        direction="left"
        speed={64}
        top="235px"
        opacity={0.5}
        scale={1}
        phase={6}
      />

      <Ribbon
        marks={strips[3]}
        onSelect={onSelect}
        direction="right"
        speed={82}
        top="344px"
        opacity={0.24}
        scale={0.86}
        phase={9}
      />

      {/* focused Mark */}
      <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
        {selectedMark ? (
          <div className="flex w-full max-w-[670px] items-center justify-center gap-3 md:gap-5">
            <button
              type="button"
              onClick={previousMark}
              disabled={marks.length < 2}
              aria-label="Previous Mark"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full md:h-10 md:w-10 border border-white/20 bg-[#06090e]/85 text-[22px] text-white/65 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition hover:scale-105 hover:border-white/45 hover:text-white disabled:opacity-15"
            >
              ‹
            </button>

            <article className="relative flex w-full max-w-[510px] items-stretch">
              <div className="relative z-20 h-[190px] w-[145px] shrink-0 overflow-hidden rounded-[14px] border border-white/25 bg-[#10151b] shadow-[0_22px_70px_rgba(0,0,0,0.72)] md:h-[225px] md:w-[180px]">
                <img
                  src={selectedMark.image_url}
                  alt={`Mark #${selectedMark.mark_number}`}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/[0.035]" />
              </div>

              <div className="relative z-10 -ml-3 my-3 flex min-w-0 flex-1 flex-col justify-between rounded-r-[16px] border border-l-0 border-white/[0.13] bg-[#080c12]/90 py-4 pl-7 pr-3 md:py-5 md:pl-8 md:pr-5 shadow-[0_20px_70px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
                <div>
                  <p className="text-[7px] tracking-[0.32em] text-white/40">
                    {selectedMark.mark_type === "our" ? "OUR MARK" : "MY MARK"}
                  </p>

                  <p className="mt-2 text-[7px] tracking-[0.32em] text-white/40">
                    MARK #{selectedMark.mark_number.toLocaleString()}
                  </p>

                  {(() => {
                    const n = selectedMark.mark_number;
                    const label =
                      n === 1 ? "THE BEGINNING" :
                      n <= 10 ? "FIRST TEN" :
                      n < 100 ? "FIRST HUNDRED" :
                      n === 100 ? "MILESTONE 100" :
                      n === 1000 ? "MILESTONE 1K" :
                      n === 10000 ? "MILESTONE 10K" :
                      n === 100000 ? "MILESTONE 100K" :
                      n === 1000000 ? "MILESTONE 1M" :
                      null;

                    return label ? (
                      <p className="mt-1.5 text-[7px] font-medium tracking-[0.24em] text-white/65">
                        {label}
                      </p>
                    ) : null;
                  })()}

                  <p className="mt-4 text-[14px] leading-6 text-white/85">
                    {selectedMark.message ||
                      "A human Mark left behind."}
                  </p>

                  <div className="mt-5 flex items-center gap-2">
                    {selectedMark.country_code && (
                      <img
                        src={"https://flagcdn.com/24x18/" + selectedMark.country_code.toLowerCase() + ".png"}
                        alt=""
                        width={24}
                        height={18}
                        className="h-[18px] w-6 rounded-[2px] object-cover"
                      />
                    )}

                    <span className="text-[8px] tracking-[0.12em] text-white/45">
                      {selectedMark.country.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={async () => {
                      const url =
                        window.location.origin + "/" + selectedMark.mark_number;
                      const shareData = {
                        title: "MARK AT ZERO",
                        text:
                          "MARK #" +
                          selectedMark.mark_number +
                          " · " +
                          (selectedMark.message || "A human Mark left behind."),
                        url,
                      };

                      try {
                        if (navigator.share) {
                          await navigator.share(shareData);
                        } else {
                          await navigator.clipboard.writeText(url);
                        }
                      } catch {}
                    }}
                    className="mb-3 text-[7px] tracking-[0.22em] text-white/45 transition hover:text-white"
                  >
                    SHARE MARK
                  </button>

                  <a
                    href={"/report?mark=" + selectedMark.mark_number}
                    className="mb-3 ml-4 inline-block text-[7px] tracking-[0.22em] text-white/25 transition hover:text-white"
                  >
                    REPORT THIS MARK
                  </a>

                  <p className="text-[6px] tracking-[0.2em] text-white/20">
                    PART OF MARK AT ZERO
                  </p>
                </div>
              </div>
            </article>

            <button
              type="button"
              onClick={nextMark}
              disabled={marks.length < 2}
              aria-label="Next Mark"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full md:h-10 md:w-10 border border-white/20 bg-[#06090e]/85 text-[22px] text-white/65 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition hover:scale-105 hover:border-white/45 hover:text-white disabled:opacity-15"
            >
              ›
            </button>
          </div>
        ) : (
          <div className="relative z-30 flex flex-col items-center">
            <div className="h-[120px] w-[92px] rounded-[12px] border border-white/[0.12] bg-gradient-to-br from-white/[0.055] to-white/[0.01] shadow-[0_25px_70px_rgba(0,0,0,0.65)] backdrop-blur-xl" />

            <p className="mt-4 text-[7px] tracking-[0.3em] text-white/30">
              THE FIRST MARK IS WAITING
            </p>
          </div>
        )}
      </div>

      {/* depth masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-40 w-[11%] bg-gradient-to-r from-[#05070b] via-[#05070b]/75 to-transparent" />

      <div className="pointer-events-none absolute inset-y-0 right-0 z-40 w-[11%] bg-gradient-to-l from-[#05070b] via-[#05070b]/75 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-12 bg-gradient-to-b from-[#05070b]/90 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-14 bg-gradient-to-t from-[#05070b] to-transparent" />
    </section>
  );
}