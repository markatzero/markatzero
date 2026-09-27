"use client";

type OurMarkModalProps = {
  onClose: () => void;
};

export default function OurMarkModal({
  onClose,
}: OurMarkModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-[520px] rounded-[28px] border border-white/10 bg-[#08090b] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-lg text-white/40 transition hover:text-white"
        >
          ×
        </button>

        <p className="text-[9px] font-medium tracking-[0.3em] text-[#d8c7a0]">
          MARK AT ZERO · OUR MARK
        </p>

        <h2 className="mt-3 pr-10 text-3xl font-semibold tracking-[-0.03em] text-white">
          Leave something together.
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/45">
          One shared photo. Ten shared words. One Mark.
        </p>

        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <p className="text-sm leading-6 text-white/65">
            OUR MARK is ready for its creation flow.
          </p>

          <p className="mt-2 text-[10px] leading-5 text-white/30">
            Two people · one shared moment · one permanent Mark number
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 w-full rounded-full bg-[#f2ead9] px-7 py-3 text-xs font-semibold tracking-wide text-black transition hover:bg-white"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}