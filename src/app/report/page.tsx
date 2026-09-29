"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ReportForm() {
  const searchParams = useSearchParams();
  const initialMark = searchParams.get("mark") || "";

  const [markNumber, setMarkNumber] = useState(initialMark);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  return (
    <main className="min-h-screen bg-[#05070b] px-6 py-16 text-white">
      <div className="mx-auto max-w-[620px]">
        <Link
          href="/"
          className="text-[8px] tracking-[0.24em] text-white/35 transition hover:text-white"
        >
          ← MARK AT ZERO
        </Link>

        <p className="mt-16 text-[8px] tracking-[0.3em] text-white/30">
          REPORT A MARK
        </p>

        <h1 className="mt-4 text-3xl font-medium tracking-[-0.03em]">
          Help us protect the space.
        </h1>

        <p className="mt-5 text-sm leading-7 text-white/50">
          Report a Mark that violates our Content Policy, uses your image
          without permission, or infringes your rights.
        </p>

        <form
          className="mt-10 space-y-6"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setStatus("");

            try {
              const response = await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  markNumber,
                  reason,
                  details,
                }),
              });

              const result = await response.json();

              if (!response.ok) {
                throw new Error(result.error || "Could not submit report.");
              }

              setStatus("REPORT RECEIVED · THANK YOU");
              setReason("");
              setDetails("");
            } catch (error) {
              setStatus(
                error instanceof Error
                  ? error.message
                  : "Could not submit report."
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="block">
            <span className="text-[8px] tracking-[0.2em] text-white/35">
              MARK NUMBER
            </span>
            <input
              value={markNumber}
              onChange={(event) => setMarkNumber(event.target.value)}
              inputMode="numeric"
              placeholder="18427"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none transition focus:border-white/30"
            />
          </label>

          <label className="block">
            <span className="text-[8px] tracking-[0.2em] text-white/35">
              REASON
            </span>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0f15] px-4 py-3 text-sm outline-none transition focus:border-white/30"
            >
              <option value="">Choose a reason</option>
              <option value="my-image">My image or personal rights</option>
              <option value="harassment">Harassment or harmful content</option>
              <option value="hate">Hate or threats</option>
              <option value="sexual">Nudity or sexual content</option>
              <option value="violence">Graphic violence</option>
              <option value="impersonation">Impersonation or deception</option>
              <option value="copyright">Copyright or ownership</option>
              <option value="other">Other policy violation</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[8px] tracking-[0.2em] text-white/35">
              DETAILS · OPTIONAL
            </span>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Tell us what happened."
              className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none transition focus:border-white/30"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#f1eadb] px-6 py-3 text-[9px] font-medium tracking-[0.2em] text-[#111318] transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-50"
          >
            {loading ? "SUBMITTING..." : "SUBMIT REPORT"}
          </button>

          {status && (
            <p className="text-center text-[8px] tracking-[0.12em] text-white/45">
              {status}
            </p>
          )}
        </form>

        <p className="mt-8 text-[7px] leading-5 tracking-[0.1em] text-white/25">
          Reports are reviewed against the MARK AT ZERO Content Policy.
        </p>
      </div>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense>
      <ReportForm />
    </Suspense>
  );
}