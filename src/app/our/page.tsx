"use client";

import { useRouter } from "next/navigation";
import OurMarkModal from "../../components/OurMarkModal";

export default function OurMarkPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#05070b]">
      <OurMarkModal onClose={() => router.push("/")} />
    </main>
  );
}