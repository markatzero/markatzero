"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("CONFIRMING YOUR MARK...");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setMessage("CHECKOUT SESSION NOT FOUND");
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function checkMark() {
      try {
        attempts += 1;

        const response = await fetch(
          `/api/checkout/status?session_id=${encodeURIComponent(sessionId!)}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not verify payment.");
        }

        if (
          result.status === "ready" &&
          Number.isSafeInteger(Number(result.markNumber)) &&
          Number(result.markNumber) > 0
        ) {
          if (!cancelled) {
            router.replace(`/${Number(result.markNumber)}`);
          }

          return;
        }

        if (attempts < 15 && !cancelled) {
          window.setTimeout(checkMark, 1000);
          return;
        }

        if (!cancelled) {
          setMessage(
            "PAYMENT RECEIVED · YOUR MARK IS STILL BEING PREPARED"
          );
        }
      } catch {
        if (attempts < 15 && !cancelled) {
          window.setTimeout(checkMark, 1000);
          return;
        }

        if (!cancelled) {
          setMessage("WE COULD NOT OPEN YOUR MARK YET");
        }
      }
    }

    checkMark();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070b] px-6 text-white">
      <div className="text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20">
          <span className="h-2 w-2 rounded-full bg-white" />
        </div>

        <p className="mt-6 text-[8px] tracking-[0.32em] text-white/30">
          MARK AT ZERO
        </p>

        <h1 className="mt-4 text-[28px] font-medium tracking-[-0.03em]">
          YOU LEFT YOUR MARK.
        </h1>

        <p className="mt-4 text-[8px] tracking-[0.18em] text-white/35">
          {message}
        </p>
      </div>
    </main>
  );
}

function PaymentSuccessFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070b] px-6 text-white">
      <p className="text-[8px] tracking-[0.22em] text-white/35">
        CONFIRMING YOUR MARK...
      </p>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}