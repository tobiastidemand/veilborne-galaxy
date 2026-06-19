"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import { PRESENCE_STYLE, type AtmosphereStatus, type CelestialBody } from "./data";
import { PanelHudFrame } from "./Hud";

type Shown = { body: CelestialBody; systemName: string };
type OpenLocation = { bodyName: string; name: string };

const ATMOSPHERE_META: Record<
  AtmosphereStatus,
  { label: string; color: string }
> = {
  breathable: { label: "Breathable", color: "#5fd38a" },
  marginal: { label: "Marginal", color: "#e0b84a" },
  hostile: { label: "Hostile", color: "#e0644a" },
  none: { label: "None", color: "#8a93a3" },
};

function Reading({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <span className="text-right text-sm text-fg/90">{value}</span>
    </div>
  );
}

function SectionTitle({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-2 flex items-center gap-2 font-display text-[12px] font-medium tracking-[0.02em] text-fg">
      <span className="index-marker">{index}</span>
      {children}
    </h3>
  );
}

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
  dmMode = false,
  isParty = false,
  onSetParty,
  onBack,
}: {
  body: CelestialBody | null;
  systemName: string;
  open: boolean;
  reducedMotion?: boolean;
  accent?: string;
  dmMode?: boolean;
  isParty?: boolean;
  onSetParty?: () => void;
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
  // Which location's dossier is open (a stylized in-panel card overlay).
  const [openLocation, setOpenLocation] = useState<OpenLocation | null>(null);

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

  const atmo = shown?.body.atmosphere;
  const presentFactions =
    shown?.body.factions?.filter((f) => f.presence !== "none") ?? [];
  const selectedLocation = openLocation;
  const locationOpen =
    selectedLocation && selectedLocation.bodyName === shown?.body.name
      ? (shown?.body.locations?.find((c) => c.name === selectedLocation.name) ??
        null)
      : null;

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

          {dmMode && (
            <div className="flex flex-col gap-2 rounded-md border border-accent/35 bg-accent/5 p-2.5">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent/80">
                Dungeon Master
              </div>
              <button
                onClick={onSetParty}
                className="self-start rounded border border-accent/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-accent transition-colors hover:bg-accent/10"
              >
                {isParty ? "◆ Party is here — clear" : "Set party here"}
              </button>
            </div>
          )}

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

          {/* Factions — present only, color-coded. */}
          {presentFactions.length > 0 && (
            <>
              <section>
                <SectionTitle index="01">Factions Present</SectionTitle>
                <ul className="flex flex-col gap-2">
                  {presentFactions.map((f) => {
                    const st = PRESENCE_STYLE[f.presence];
                    return (
                      <li key={f.name} className="flex items-center gap-2.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor: st.color,
                            boxShadow: `0 0 6px ${st.color}`,
                          }}
                        />
                        <span
                          className="text-sm font-semibold tracking-wide"
                          style={{ color: st.color }}
                        >
                          {f.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
              <div className="hairline" />
            </>
          )}

          {/* Population & people. */}
          <section>
            <Reading
              label="Home Species"
              value={shown.body.homeSpecies ?? "None discovered"}
            />
            {shown.body.population && (
              <Reading label="Population" value={shown.body.population} />
            )}
            {shown.body.locations && shown.body.locations.length > 0 && (
              <div className="pt-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Locations
                </span>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {shown.body.locations.map((c) => (
                    <li key={c.name}>
                      <button
                        onClick={() =>
                          setOpenLocation({
                            bodyName: shown.body.name,
                            name: c.name,
                          })
                        }
                        className="group flex w-full gap-2 text-left text-sm text-fg/90 transition-colors hover:text-accent-bright"
                      >
                        <span className="mt-[2px] text-accent/70 transition-transform group-hover:translate-x-0.5">
                          ▸
                        </span>
                        <span>
                          {c.name}
                          {c.note && (
                            <span className="text-faint"> — {c.note}</span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Atmosphere. */}
          {atmo && (
            <>
              <div className="hairline" />
              <section>
                <SectionTitle index="02">Atmosphere</SectionTitle>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: ATMOSPHERE_META[atmo.status].color,
                      boxShadow: `0 0 8px ${ATMOSPHERE_META[atmo.status].color}`,
                    }}
                  />
                  <span
                    className="font-mono text-[11px] uppercase tracking-[0.18em]"
                    style={{ color: ATMOSPHERE_META[atmo.status].color }}
                  >
                    {ATMOSPHERE_META[atmo.status].label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  {atmo.detail}
                </p>
              </section>
            </>
          )}

          {/* Survey notes — at the bottom. */}
          <div className="hairline" />
          <section>
            <SectionTitle index="03">Survey Notes</SectionTitle>
            <p className="text-sm leading-relaxed text-muted">
              {shown.body.description}
            </p>
          </section>
        </div>
      )}

      {/* Location dossier — a stylized card overlaying the body panel. */}
      {shown && locationOpen && (
        <div className="absolute inset-0 z-[2] bg-bg/95 backdrop-blur-sm">
          <div className="scroll-thin relative flex h-full flex-col gap-4 overflow-y-auto px-6 pb-10 pt-6">
            <button
              onClick={() => setOpenLocation(null)}
              className="self-start font-mono text-[11px] uppercase tracking-[0.2em] text-accent transition-colors hover:text-accent-bright"
            >
              ‹ Back to {shown.body.name}
            </button>

            <header>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">
                {shown.systemName} · {shown.body.name} · Location Dossier
              </div>
              <h2
                className="mt-1.5 font-display text-[1.9rem] font-bold leading-[1.05] text-fg"
                style={{ textShadow: `0 0 22px ${accent}55` }}
              >
                {locationOpen.name}
              </h2>
              {locationOpen.note && (
                <div className="mt-1.5 text-sm tracking-wide text-cyan">
                  {locationOpen.note}
                </div>
              )}
            </header>

            <div className="hairline" />

            <p className="text-sm leading-relaxed text-muted">
              {locationOpen.description ?? "No further survey data on record."}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
