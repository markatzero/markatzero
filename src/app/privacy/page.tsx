import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#05070b] px-6 py-16 text-white">
      <div className="mx-auto max-w-[680px]">
        <Link
          href="/"
          className="text-[8px] tracking-[0.24em] text-white/35 transition hover:text-white"
        >
          ← MARK AT ZERO
        </Link>

        <p className="mt-16 text-[8px] tracking-[0.3em] text-white/30">
          PRIVACY
        </p>

        <h1 className="mt-4 text-3xl font-medium tracking-[-0.03em]">
          Privacy at MARK AT ZERO.
        </h1>

        <div className="mt-10 space-y-7 text-sm leading-7 text-white/55">
          <p>
            MARK AT ZERO collects the information needed to create, publish,
            display, and process payment for a Mark.
          </p>

          <p>
            A published Mark is public. Its photo, message, country, Mark
            number, and Mark type may be visible to anyone who visits the
            service or opens its permanent link.
          </p>

          <p>
            Payment information is processed by our payment provider.
            MARK AT ZERO does not need to store your full card details.
          </p>

          <p>
            Technical information may be processed when you use the service
            for security, reliability, abuse prevention, and operation of
            the website.
          </p>

          <p>
            Do not submit personal information that you do not want to appear
            publicly as part of your Mark.
          </p>

          <p>
            You may contact MARK AT ZERO regarding privacy, removal, or a Mark
            that contains your image or personal information.
          </p>
        </div>

        <p className="mt-14 border-t border-white/10 pt-6 text-[8px] leading-5 tracking-[0.12em] text-white/25">
          MARK AT ZERO · PRIVACY
        </p>
      </div>
    </main>
  );
}