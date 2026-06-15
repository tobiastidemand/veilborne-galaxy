"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

// R3F must stay client-only — no SSR.
const Hologram = dynamic(() => import("@/components/Hologram"), { ssr: false });

export default function KiHologramPage() {
  return (
    <main className="fixed inset-0 bg-black">
      <Hologram src="/ki-greenscreen.mp4" className="h-full w-full" />

      <Link
        href="/"
        className="pointer-events-auto fixed left-6 top-6 z-10 cursor-pointer rounded-md border border-accent/30 bg-bg/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent backdrop-blur-md transition-all hover:border-accent hover:text-accent-bright hover:shadow-[0_0_12px_var(--glow)]"
      >
        ‹ Back to Galaxy
      </Link>
    </main>
  );
}
