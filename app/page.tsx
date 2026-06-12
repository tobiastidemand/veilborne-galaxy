"use client";

import dynamic from "next/dynamic";

const GalaxyMap = dynamic(() => import("./galaxy/GalaxyMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full items-center justify-center bg-[#03020a]">
      <span className="font-display animate-pulse text-sm tracking-[0.4em] text-[#c9a84c]">
        CHARTING THE VEIL…
      </span>
    </div>
  ),
});

export default function Home() {
  return <GalaxyMap />;
}
