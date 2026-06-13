"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import {
  CHAIN_MARKER,
  THREAT_STYLE,
  getSystemBodies,
  type StarSystemData,
} from "./data";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ledger-row py-1.5">
      <span className="text-[11px] uppercase tracking-[0.18em] text-[#c9a84c]/65">
        {label}
      </span>
      <span className="leader" />
      <span className="text-right text-sm text-[#e9e2d0]/90">{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#c9a84c]">
      <span className="text-[#c9a84c]/50">❖</span>
      {children}
    </h3>
  );
}

function Divider() {
  return (
    <div className="tome-divider">
      <span>✦</span>
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
  const uncharted = shown
    ? getSystemBodies(shown).filter((b) => b.synthetic).length
    : 0;

  return (
    <aside
      ref={panelRef}
      className="tome-panel tome-scroll fixed right-0 top-0 z-30 h-full w-[348px] overflow-y-auto border-l-2 border-[#c9a84c]/55 backdrop-blur-md"
    >
      {shown && (
        <div className="flex min-h-full flex-col gap-4 px-6 pb-10 pt-[4.75rem]">
          <button
            onClick={onBack}
            className="self-start font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#c9a84c] transition-colors hover:text-[#f0d080]"
          >
            ‹ Back to Galaxy
          </button>

          <header>
            <div className="text-[10px] uppercase tracking-[0.32em] text-[#c9a84c]/45">
              {shown.designation}
            </div>
            <h2 className="mt-1.5 font-title text-[2rem] font-black leading-[1.05] text-[#f0d080] drop-shadow-[0_0_16px_rgba(240,208,128,0.25)]">
              {shown.name}
            </h2>
            <div className="mt-1.5 text-sm italic tracking-wide text-cyan-200/85">
              {shown.starType}
            </div>
          </header>

          <Divider />

          <section>
            <Stat label="Star Type" value={shown.starType} />
            <Stat label="Planets" value={String(shown.planets)} />
            <Stat label="Anomalies" value={String(shown.anomalies)} />
            <Stat label="Distance from Core" value={shown.distance} />
          </section>

          <Divider />

          <section>
            <SectionTitle>Aureate Chain Presence</SectionTitle>
            <div
              className="text-sm font-semibold uppercase tracking-[0.12em]"
              style={{ color: chainStyle?.color, opacity: chainStyle?.opacity }}
            >
              ⛓ {shown.chain.level}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[#e9e2d0]/65">
              {shown.chain.detail}
            </p>
          </section>

          <Divider />

          <section>
            <SectionTitle>Charted Bodies</SectionTitle>
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
                    <span className="text-sm font-semibold tracking-wide text-[#e9e2d0]/90">
                      {body.name}
                      {body.highlight && (
                        <span className="ml-1 text-[#f0d080]">★</span>
                      )}
                    </span>
                    <p className="text-[13px] italic leading-snug text-[#e9e2d0]/55">
                      {body.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            {uncharted > 0 && (
              <p className="mt-3 text-[11px] italic leading-snug text-[#c9a84c]/40">
                + {uncharted} uncharted{" "}
                {uncharted === 1 ? "body" : "bodies"} detected · survey pending
              </p>
            )}
          </section>

          <Divider />

          <section className="flex items-center justify-between gap-3">
            <SectionTitle>Threat</SectionTitle>
            {threat && (
              <span
                className="rounded-sm border px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{
                  color: threat.color,
                  borderColor: threat.color,
                  backgroundColor: threat.bg,
                  boxShadow: `inset 0 0 12px ${threat.bg}, 0 0 10px ${threat.bg}`,
                }}
              >
                {shown.threat}
              </span>
            )}
          </section>

          <Divider />

          <section>
            <SectionTitle>Navigator&apos;s Notes</SectionTitle>
            <blockquote className="dropcap border-l-2 border-[#c9a84c]/70 pl-3.5 text-sm italic leading-relaxed text-[#e9e2d0]/75">
              {shown.lore}
            </blockquote>
          </section>
        </div>
      )}
    </aside>
  );
}
