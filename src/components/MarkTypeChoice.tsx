"use client";

type Props = {
  onMyMark: () => void;
  onOurMark: () => void;
  onClose: () => void;
};

export default function MarkTypeChoice({
  onMyMark,
  onOurMark,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0d12] p-8 text-center text-white">
        <button
          type="button"
          onClick={onClose}
          className="mb-6 text-sm text-white/50 hover:text-white"
        >
          CLOSE
        </button>

        <h2 className="text-3xl font-semibold">Leave Your Mark</h2>

        <p className="mt-3 text-white/60">
          A photo. Ten words. One Mark.
        </p>

        <div className="mt-8 grid gap-3">
          <button
            type="button"
            onClick={onMyMark}
            className="rounded-full bg-[#f2eadc] px-6 py-4 font-semibold text-black"
          >
            MY MARK · €1
          </button>

          <button
            type="button"
            onClick={onOurMark}
            className="rounded-full border border-white/20 px-6 py-4 font-semibold text-white"
          >
            OUR MARK · €1
          </button>
        </div>

        <p className="mt-6 text-sm text-white/40">
          Alone or together.
        </p>
      </div>
    </div>
  );
}