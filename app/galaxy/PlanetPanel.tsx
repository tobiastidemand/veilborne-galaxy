"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import type { CelestialBody } from "./data";

/**
 * Right-hand toolbar for a single celestial body. Shares the slide-in slot
 * with <SystemPanel>; only one of the two is ever `open` at a time.
 */
export default function PlanetPanel({
  body,
  systemName,
  open,
  onBack,
}: {
  body: CelestialBody | null;
  systemName: string;
  open: boolean;
  onBack: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Keep the last body rendered while the panel slides out.
  const [shown, setShown] = useState<{
    body: CelestialBody;
    systemName: string;
  } | null>(null);

  if (body && shown?.body !== body) setShown({ body, systemName });

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
            ← BACK TO {shown.systemName.toUpperCase()}
          </button>

          <header>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/35">
              {shown.systemName} · Celestial Body
            </div>
            <h2 className="mt-1 font-display text-3xl font-black leading-tight text-[#f0d080]">
              {shown.body.name}
              {shown.body.highlight && (
                <span className="ml-2 text-[#f0d080]">★</span>
              )}
            </h2>
          </header>

          <div className="flex items-center gap-2.5">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{
                backgroundColor: shown.body.color,
                boxShadow: `0 0 8px ${shown.body.color}`,
              }}
            />
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/45">
              Surveyed Body
            </span>
          </div>

          <section>
            <h3 className="mb-2 font-display text-xs font-bold tracking-[0.25em] text-[#c9a84c]">
              SURVEY NOTES
            </h3>
            <p className="text-sm italic leading-relaxed text-white/75">
              {shown.body.description}
            </p>
          </section>

          <section className="mt-auto border-t border-white/10 pt-4 text-[11px] leading-relaxed tracking-wide text-white/35">
            Survey data cross-referenced against {shown.systemName} system
            records. Anomalous readings flagged for the Arcane Survey.
          </section>
        </div>
      )}
    </aside>
  );
}
