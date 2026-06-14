"use client";

import dynamic from "next/dynamic";

const GalaxyMap = dynamic(() => import("./galaxy/GalaxyMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full items-center justify-center bg-bg">
      <span className="font-mono animate-pulse text-[11px] uppercase tracking-[0.4em] text-accent">
        Charting the veil…
      </span>
    </div>
  ),
});

export default function Home() {
  return <GalaxyMap />;
}
