"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import type { CelestialBody } from "./data";

type Shown = { body: CelestialBody; systemName: string };

/**
 * Right-hand toolbar for a single celestial body. Shares the slide-in slot
 * with <SystemPanel>; only one of the two is ever `open` at a time.
 */
export default function PlanetPanel({
  body,
  systemName,
  open,
  reducedMotion = false,
  onBack,
}: {
  body: CelestialBody | null;
  systemName: string;
  open: boolean;
  reducedMotion?: boolean;
  onBack: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const swapRef = useRef<gsap.core.Timeline | null>(null);
  // Tracks the previous render's `open` so we can tell "switching planets while
  // open" (animate) apart from "opening the panel" (the slide-in is enough).
  const wasOpenRef = useRef(open);

  // Keep the last body rendered while the panel slides out.
  const [shown, setShown] = useState<Shown | null>(null);

  // Populate immediately on first open so the slide-in is never empty.
  if (body && shown === null) setShown({ body, systemName });

  useLayoutEffect(() => {
    if (panelRef.current) gsap.set(panelRef.current, { xPercent: 100 });
  }, []);

  // Panel slide (open / close).
  useEffect(() => {
    if (!panelRef.current) return;
    gsap.to(panelRef.current, {
      xPercent: open ? 0 : 100,
      duration: reducedMotion ? 0 : 0.6,
      ease: "power3.out",
    });
  }, [open, reducedMotion]);

  // Cross-fade the inner content when switching to a different body.
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;

    if (!body || shown === null || shown.body === body) return;

    const el = contentRef.current;
    // Only animate when switching planets on an already-open panel; otherwise
    // the panel's own slide-in carries the transition.
    if (!el || !open || !wasOpen || reducedMotion) {
      setShown({ body, systemName });
      return;
    }

    swapRef.current?.kill();
    swapRef.current = gsap
      .timeline()
      .to(el, { opacity: 0, x: 20, duration: 0.16, ease: "power2.in" })
      .add(() => setShown({ body, systemName }))
      .fromTo(
        el,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.32, ease: "power3.out" }
      );
  }, [body, systemName, open, shown, reducedMotion]);

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-label={shown ? `${shown.body.name} survey` : "Body survey"}
      aria-hidden={!open}
      className="tome-panel tome-scroll fixed right-0 top-0 z-30 h-full w-[min(360px,92vw)] overflow-y-auto border-l-2 border-[#c9a84c]/55 backdrop-blur-md"
    >
      {shown && (
        <div
          ref={contentRef}
          className="flex min-h-full flex-col gap-4 px-6 pb-10 pt-[4.75rem]"
        >
          <button
            onClick={onBack}
            className="self-start font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#c9a84c] transition-colors hover:text-[#f0d080]"
          >
            ‹ Back to {shown.systemName}
          </button>

          <header>
            <div className="text-[10px] uppercase tracking-[0.32em] text-[#c9a84c]/45">
              {shown.systemName} · Celestial Body
            </div>
            <h2 className="mt-1.5 font-title text-[2rem] font-black leading-[1.05] text-[#f0d080] drop-shadow-[0_0_16px_rgba(240,208,128,0.25)]">
              {shown.body.name}
              {shown.body.highlight && (
                <span className="ml-2 text-[#f0d080]">★</span>
              )}
            </h2>
          </header>

          <div className="flex items-center gap-2.5">
            <span
              className="h-3 w-3 shrink-0 rotate-45"
              style={{
                backgroundColor: shown.body.color,
                boxShadow: `0 0 8px ${shown.body.color}`,
              }}
            />
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#c9a84c]/55">
              Surveyed Body
            </span>
          </div>

          <div className="tome-divider">
            <span>✦</span>
          </div>

          <section>
            <h3 className="mb-2 flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#c9a84c]">
              <span className="text-[#c9a84c]/50">❖</span>
              Survey Notes
            </h3>
            <p className="dropcap text-sm italic leading-relaxed text-[#e9e2d0]/80">
              {shown.body.description}
            </p>
          </section>

          <section className="mt-auto pt-4">
            <div className="tome-divider mb-3">
              <span>✦</span>
            </div>
            <p className="text-[11px] italic leading-relaxed tracking-wide text-[#c9a84c]/40">
              Survey data cross-referenced against {shown.systemName} system
              records. Anomalous readings flagged for the Arcane Survey.
            </p>
          </section>
        </div>
      )}
    </aside>
  );
}
