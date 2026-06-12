"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import {
  CHAIN_MARKER,
  THREAT_STYLE,
  type StarSystemData,
} from "./data";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/5 py-1.5">
      <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">
        {label}
      </span>
      <span className="text-right text-sm text-white/85">{value}</span>
    </div>
  );
}

export default function SystemPanel({
  system,
  open,
  onBack,
}: {
  system: StarSystemData | null;
  open: boolean;
  onBack: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Keep the last system rendered while the panel slides out.
  const [shown, setShown] = useState<StarSystemData | null>(null);

  // Adjust during render (not in an effect) so the last system stays
  // visible while the panel slides out.
  if (system && system !== shown) setShown(system);

  useLayoutEffect(() => {
    if (panelRef.current) gsap.set(panelRef.current, { xPercent: 100 });
  }, []);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.to(panelRef.current, {
      xPercent: open ? 0 : 100,
      duration: 0.6,
      ease: "power3.out",
    });
  }, [open, shown]);

  const chainStyle = shown
    ? CHAIN_MARKER[shown.chain.level] ?? { color: "#9a9a9a", opacity: 0.7 }
    : null;
  const threat = shown ? THREAT_STYLE[shown.threat] : null;

  return (
    <aside
      ref={panelRef}
      className="fixed right-0 top-0 z-30 h-full w-[340px] overflow-y-auto border-l border-[#c9a84c]/50 bg-[rgba(7,5,26,0.94)] backdrop-blur-md"
    >
      {shown && (
        <div className="flex min-h-full flex-col gap-5 px-6 pb-8 pt-20">
          <button
            onClick={onBack}
            className="self-start font-display text-xs font-bold tracking-[0.25em] text-[#c9a84c] transition-colors hover:text-[#f0d080]"
          >
            ← BACK TO GALAXY
          </button>

          <header>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/35">
              {shown.designation}
            </div>
            <h2 className="mt-1 font-display text-3xl font-black leading-tight text-[#f0d080]">
              {shown.name}
            </h2>
            <div className="mt-1 text-sm tracking-wide text-cyan-300/90">
              {shown.starType}
            </div>
          </header>

          <section>
            <Stat label="Star Type" value={shown.starType} />
            <Stat label="Planets" value={String(shown.planets)} />
            <Stat label="Anomalies" value={String(shown.anomalies)} />
            <Stat label="Distance from Core" value={shown.distance} />
          </section>

          <section>
            <h3 className="mb-2 font-display text-xs font-bold tracking-[0.25em] text-[#c9a84c]">
              AUREATE CHAIN PRESENCE
            </h3>
            <div
              className="text-sm font-semibold tracking-wider"
              style={{ color: chainStyle?.color, opacity: chainStyle?.opacity }}
            >
              ⛓ {shown.chain.level}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-white/65">
              {shown.chain.detail}
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-display text-xs font-bold tracking-[0.25em] text-[#c9a84c]">
              CELESTIAL BODIES
            </h3>
            <ul className="flex flex-col gap-2.5">
              {shown.bodies.map((body) => (
                <li key={body.name} className="flex gap-2.5">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: body.color,
                      boxShadow: `0 0 6px ${body.color}`,
                    }}
                  />
                  <div>
                    <span className="text-sm font-semibold text-white/90">
                      {body.name}
                      {body.highlight && (
                        <span className="ml-1 text-[#f0d080]">★</span>
                      )}
                    </span>
                    <p className="text-[13px] italic leading-snug text-white/55">
                      {body.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex items-center gap-3">
            <h3 className="font-display text-xs font-bold tracking-[0.25em] text-[#c9a84c]">
              THREAT ASSESSMENT
            </h3>
            {threat && (
              <span
                className="rounded border px-2.5 py-0.5 text-xs font-bold tracking-[0.2em]"
                style={{
                  color: threat.color,
                  borderColor: threat.color,
                  backgroundColor: threat.bg,
                }}
              >
                {shown.threat}
              </span>
            )}
          </section>

          <section>
            <h3 className="mb-2 font-display text-xs font-bold tracking-[0.25em] text-[#c9a84c]">
              NAVIGATOR&apos;S NOTES
            </h3>
            <blockquote className="border-l-2 border-[#c9a84c] pl-3 text-sm italic leading-relaxed text-white/70">
              &ldquo;{shown.lore}&rdquo;
            </blockquote>
          </section>
        </div>
      )}
    </aside>
  );
}
