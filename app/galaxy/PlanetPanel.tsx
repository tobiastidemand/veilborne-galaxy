"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import type { CelestialBody } from "./data";
import { PanelHudFrame } from "./Hud";

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
  accent = "#4da3ff",
  onBack,
}: {
  body: CelestialBody | null;
  systemName: string;
  open: boolean;
  reducedMotion?: boolean;
  accent?: string;
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
      className="panel panel-grid panel-clip fixed right-0 top-[86px] z-[45] h-[calc(100vh-98px)] w-[min(360px,92vw)] overflow-hidden bg-gradient-to-b from-bg/90 to-bg/30"
    >
      <PanelHudFrame />
      {shown && (
        <div
          ref={contentRef}
          className="scroll-thin relative z-[1] flex h-full flex-col gap-4 overflow-y-auto px-6 pb-10 pt-6"
        >
          <button
            onClick={onBack}
            className="self-start font-mono text-[11px] uppercase tracking-[0.2em] text-accent transition-colors hover:text-accent-bright"
          >
            ‹ Back to {shown.systemName}
          </button>

          <header>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">
              {shown.systemName} · Celestial Body
            </div>
            <h2
              className="mt-1.5 font-display text-[1.9rem] font-bold leading-[1.05] text-fg"
              style={{ textShadow: `0 0 22px ${accent}55` }}
            >
              {shown.body.name}
              {shown.body.highlight && (
                <span className="ml-2 text-accent">★</span>
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
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              Surveyed Body
            </span>
          </div>

          <div className="hairline" />

          <section>
            <h3 className="mb-2 flex items-center gap-2 font-display text-[12px] font-medium tracking-[0.02em] text-fg">
              <span className="index-marker">01</span>
              Survey Notes
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              {shown.body.description}
            </p>
          </section>

          <section className="mt-auto pt-4">
            <div className="hairline mb-3" />
            <p className="font-mono text-[11px] leading-relaxed tracking-wide text-faint/70">
              Survey data cross-referenced against {shown.systemName} system
              records. Anomalous readings flagged for the Arcane Survey.
            </p>
          </section>
        </div>
      )}
    </aside>
  );
}
