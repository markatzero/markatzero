import Link from "next/link";

export default function ContentPolicyPage() {
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
          CONTENT POLICY
        </p>

        <h1 className="mt-4 text-3xl font-medium tracking-[-0.03em]">
          Respect the Mark. Respect the people.
        </h1>

        <p className="mt-8 text-sm leading-7 text-white/60">
          MARK AT ZERO is a shared human space. Every Mark should respect
          the people who appear in it and the people who discover it.
        </p>

        <div className="mt-10 space-y-7 text-sm leading-7 text-white/55">
          <p>
            Upload only photos and content you have the right to use.
            Do not post someone&apos;s image without the permission required
            to share it.
          </p>

          <p>
            Do not upload nudity, sexual content, hate, threats, graphic
            violence, harassment, illegal content, impersonation, or content
            intended to harm, exploit, or deceive others.
          </p>

          <p>
            Marks that violate these rules may be hidden or removed.
            Repeated or serious abuse may be restricted from the service.
          </p>

          <p>
            If a Mark contains your image, infringes your rights, or violates
            these rules, you can report it for review.
          </p>
        </div>

        <p className="mt-14 border-t border-white/10 pt-6 text-[8px] leading-5 tracking-[0.12em] text-white/25">
          MARK AT ZERO · CONTENT POLICY
        </p>
      </div>
    </main>
  );
}