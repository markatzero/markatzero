import Link from "next/link";

export default function TermsPage() {
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
          TERMS
        </p>

        <h1 className="mt-4 text-3xl font-medium tracking-[-0.03em]">
          Leave something human behind.
        </h1>

        <div className="mt-10 space-y-7 text-sm leading-7 text-white/55">
          <p>
            By creating a Mark, you confirm that you have the right to upload
            and share its photo, message, and other submitted content.
          </p>

          <p>
            A Mark is a public contribution to MARK AT ZERO. Published Marks
            may be discovered, viewed, and shared through their permanent
            Mark number and link.
          </p>

          <p>
            You keep ownership of content you submit. You give MARK AT ZERO
            permission to host, display, reproduce, and technically process
            that content as needed to operate and promote the service.
          </p>

          <p>
            Content that violates our Content Policy, applicable law, or the
            rights of others may be hidden or removed.
          </p>

          <p>
            The €1 payment is the one-time price for creating a Mark under
            the current service. It does not purchase advertising space,
            ownership of a position, or ownership of the MARK AT ZERO service.
          </p>

          <p>
            We aim to keep published Marks available over time, but we cannot
            promise uninterrupted or permanent availability of the service.
          </p>

          <p>
            MARK AT ZERO may evolve as the project grows. Material changes to
            these terms will be reflected in the current version published
            on this page.
          </p>
        </div>

        <p className="mt-14 border-t border-white/10 pt-6 text-[8px] leading-5 tracking-[0.12em] text-white/25">
          MARK AT ZERO · TERMS
        </p>
      </div>
    </main>
  );
}