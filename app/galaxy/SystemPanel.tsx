"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import {
  PRESENCE_STYLE,
  THREAT_STYLE,
  getSystemBodies,
  systemFactions,
  type StarSystemData,
} from "./data";
import { PanelHudFrame } from "./Hud";

function Stat({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <span
        className="text-right text-sm text-fg/90"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </span>
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

function Divider() {
  return <div className="hairline" />;
}

export default function SystemPanel({
  system,
  open,
  reducedMotion = false,
  accent = "#4da3ff",
  dmMode = false,
  discovered = true,
  isParty = false,
  onToggleDiscovered,
  onSetParty,
  onBack,
}: {
  system: StarSystemData | null;
  open: boolean;
  reducedMotion?: boolean;
  accent?: string;
  dmMode?: boolean;
  discovered?: boolean;
  isParty?: boolean;
  onToggleDiscovered?: () => void;
  onSetParty?: () => void;
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
      duration: reducedMotion ? 0 : 0.6,
      ease: "power3.out",
    });
  }, [open, shown, reducedMotion]);

  // Survey readings, derived from the charted bodies. Stations and derelicts
  // are reported separately as "Other"; only natural exotica count as anomalies.
  const bodies = shown ? getSystemBodies(shown) : [];
  const planetCount = bodies.filter((b) => (b.kind ?? "planet") === "planet")
    .length;
  const otherCount = bodies.filter(
    (b) => b.kind === "station" || b.kind === "derelict"
  ).length;
  const anomalyCount = bodies.filter(
    (b) => b.kind === "fragment" || b.kind === "mirror" || b.kind === "anomaly"
  ).length;
  const uncharted = bodies.filter((b) => b.synthetic).length;

  const threat = shown ? THREAT_STYLE[shown.threat] : null;
  const factions = shown ? systemFactions(shown) : [];

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-label={shown ? `${shown.name} system survey` : "System survey"}
      aria-hidden={!open}
      className="panel panel-grid panel-clip fixed right-0 top-[86px] z-[45] h-[calc(100vh-98px)] w-[min(360px,92vw)] overflow-hidden bg-gradient-to-b from-bg/90 to-bg/30"
    >
      <PanelHudFrame />
      {shown && (
        <div className="scroll-thin relative z-[1] flex h-full flex-col gap-4 overflow-y-auto px-6 pb-10 pt-6">
          <button
            onClick={onBack}
            className="flex cursor-pointer items-center gap-1 self-start rounded border border-accent/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent transition-all hover:border-accent hover:text-accent-bright hover:shadow-[0_0_12px_var(--glow)]"
          >
            ✕ Close
          </button>

          {dmMode && (
            <div className="flex flex-col gap-2 rounded-md border border-accent/35 bg-accent/5 p-2.5">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent/80">
                Dungeon Master
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onSetParty}
                  className="rounded border border-accent/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-accent transition-colors hover:bg-accent/10"
                >
                  {isParty ? "◆ Party is here — clear" : "Set party here"}
                </button>
                <button
                  onClick={onToggleDiscovered}
                  className="rounded border border-white/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-fg"
                >
                  {discovered ? "Hide from players" : "Reveal to players"}
                </button>
              </div>
            </div>
          )}

          <header>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">
              {shown.designation}
            </div>
            <h2
              className="mt-1.5 font-display text-[1.9rem] font-bold leading-[1.05] text-fg"
              style={{ textShadow: `0 0 22px ${accent}55` }}
            >
              {shown.name}
            </h2>
            <div className="mt-1.5 text-sm tracking-wide text-cyan">
              {shown.starType}
            </div>
          </header>

          <Divider />

          {/* Survey readings — the first thing the Survey records on a system. */}
          <section>
            <Stat label="Planets" value={String(planetCount)} />
            <Stat label="Anomalies" value={String(anomalyCount)} />
            <Stat label="Other (stations &c.)" value={String(otherCount)} />
            <Stat label="Distance from Core" value={shown.distance} />
            {threat && (
              <div className="flex items-baseline justify-between gap-3 py-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Threat Level
                </span>
                <span
                  className="rounded-sm border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{
                    color: threat.color,
                    borderColor: threat.color,
                    backgroundColor: threat.bg,
                    boxShadow: `inset 0 0 10px ${threat.bg}`,
                  }}
                >
                  {shown.threat}
                </span>
              </div>
            )}
          </section>

          <Divider />

          <section>
            <SectionTitle index="01">Survey Notes</SectionTitle>
            <blockquote className="border-l-2 border-cyan/60 pl-3.5 text-sm italic leading-relaxed text-muted">
              {shown.lore}
            </blockquote>
          </section>

          <Divider />

          <section>
            <SectionTitle index="02">Factions Present</SectionTitle>
            <ul className="flex flex-col gap-2.5">
              {factions.map((f) => {
                const st = PRESENCE_STYLE[f.presence];
                return (
                  <li key={f.name} className="flex gap-2.5">
                    <span
                      className="mt-[6px] h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: st.color,
                        boxShadow: `0 0 6px ${st.color}`,
                      }}
                    />
                    <div>
                      <span
                        className="text-sm font-semibold tracking-wide"
                        style={{ color: st.color }}
                      >
                        {f.name}
                      </span>
                      {f.note && (
                        <p className="text-[13px] leading-snug text-faint">
                          {f.note}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-faint/60">
              ● Full · ● Some · ● None
            </p>
          </section>

          <Divider />

          <section>
            <SectionTitle index="03">Charted Bodies</SectionTitle>
            <ul className="flex flex-col gap-3">
              {shown.bodies.map((body) => (
                <li key={body.name} className="flex gap-2.5">
                  <span
                    className="mt-[7px] h-2 w-2 shrink-0 rotate-45"
                    style={{
                      backgroundColor: body.color,
                      boxShadow: `0 0 6px ${body.color}`,
                    }}
                  />
                  <div>
                    <span className="text-sm font-semibold tracking-wide text-fg/90">
                      {body.name}
                      {body.highlight && (
                        <span className="ml-1 text-accent">★</span>
                      )}
                    </span>
                    <p className="text-[13px] leading-snug text-faint">
                      {body.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            {uncharted > 0 && (
              <p className="mt-3 font-mono text-[11px] leading-snug text-accent/40">
                + {uncharted} uncharted{" "}
                {uncharted === 1 ? "body" : "bodies"} detected · survey pending
              </p>
            )}
          </section>
        </div>
      )}
    </aside>
  );
}
