import Link from "next/link";

export default function BattlePage() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-4 bg-[#03020a] px-6 text-center font-body text-[#e9e2d0]">
      <div className="scanlines pointer-events-none fixed inset-0 z-50" />
      <h1 className="font-title text-2xl font-black tracking-[0.14em] text-[#f0d080] drop-shadow-[0_0_18px_rgba(240,208,128,0.25)]">
        Battle Stations
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-[#e9e2d0]/70">
        The ship-combat system is being redesigned. The old prototype is shelved
        while a new system is built.
      </p>
      <Link
        href="/"
        className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a84c] transition-colors hover:text-[#f0d080]"
      >
        ‹ Return to the Chart
      </Link>
    </div>
  );
}
