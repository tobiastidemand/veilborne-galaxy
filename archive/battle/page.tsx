"use client";

import dynamic from "next/dynamic";

const BattleRoom = dynamic(() => import("./BattleRoom"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full items-center justify-center bg-[#03020a]">
      <span className="font-display animate-pulse text-sm tracking-[0.4em] text-[#c9a84c]">
        SOUNDING BATTLE STATIONS…
      </span>
    </div>
  ),
});

export default function BattlePage() {
  return <BattleRoom />;
}
