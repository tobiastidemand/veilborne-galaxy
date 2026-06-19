"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

import { HudCorner } from "./Hud";

/**
 * HUD palette switcher. Each scheme overrides the themeable CSS tokens on the
 * document root; because the Tailwind theme is var-based (not inlined), every
 * `text-accent` / `border-accent` / `var(--accent)` usage re-colours live.
 */
type Scheme = {
  name: string;
  vars: Record<string, string>;
};

const SCHEMES: Record<string, Scheme> = {
  blue: {
    name: "Veil Blue",
    vars: {
      "--color-accent": "#4da3ff",
      "--color-accent-bright": "#8cc6ff",
      "--color-accent-dim": "#2e6fb0",
      "--color-cyan": "#4fe3d6",
      "--color-fg": "#e6e9f0",
      "--glow": "rgba(77,163,255,0.5)",
      "--hairline": "rgba(255,255,255,0.09)",
    },
  },
  amber: {
    name: "Solar Red",
    vars: {
      "--color-accent": "#ff5560",
      "--color-accent-bright": "#ff97a0",
      "--color-accent-dim": "#b53038",
      "--color-cyan": "#ffcf6a",
      "--color-fg": "#f4e9e7",
      "--glow": "rgba(255,85,96,0.5)",
      "--hairline": "rgba(255,170,160,0.12)",
    },
  },
  violet: {
    name: "Nebula Violet",
    vars: {
      "--color-accent": "#b18cff",
      "--color-accent-bright": "#d6c2ff",
      "--color-accent-dim": "#6f4fb0",
      "--color-cyan": "#6be0ff",
      "--color-fg": "#ece6ff",
      "--glow": "rgba(177,140,255,0.5)",
      "--hairline": "rgba(210,190,255,0.12)",
    },
  },
  green: {
    name: "Quantum Green",
    vars: {
      "--color-accent": "#45e0a0",
      "--color-accent-bright": "#8cffcf",
      "--color-accent-dim": "#2a9d6f",
      "--color-cyan": "#6be0c0",
      "--color-fg": "#e3f0ea",
      "--glow": "rgba(69,224,160,0.5)",
      "--hairline": "rgba(150,255,210,0.10)",
    },
  },
};

const STORAGE_KEY = "veilborn.hudTheme";

function applyScheme(key: string) {
  const scheme = SCHEMES[key];
  if (!scheme || typeof document === "undefined") return;
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(scheme.vars)) {
    root.style.setProperty(prop, value);
  }
}

// Read the saved palette once (safe: this component is client-only).
function initialTheme(): string {
  if (typeof window === "undefined") return "blue";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SCHEMES[saved]) return saved;
  } catch {
    /* ignore */
  }
  return "blue";
}

export function HudSettings({ dm }: { dm?: ReactNode }) {
  const [theme, setThemeState] = useState(initialTheme);
  // Default open when DM controls are present, so they're visible at a glance.
  const [open, setOpen] = useState(() => Boolean(dm));

  // Apply on mount and whenever the choice changes.
  useEffect(() => {
    applyScheme(theme);
  }, [theme]);

  const choose = useCallback((key: string) => {
    setThemeState(key);
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="panel panel-grid pointer-events-auto fixed bottom-3 left-[288px] z-40 hidden w-[224px] overflow-hidden rounded-md bg-gradient-to-b from-bg/90 to-bg/30 sm:bottom-5 sm:left-[300px] sm:block">
      {/* HUD corner accents + fading top/bottom border lines */}
      <div className="pointer-events-none absolute inset-0 z-[2] text-accent">
        <HudCorner corner="tl" size={15} className="absolute left-1 top-1" />
        <HudCorner corner="br" size={15} className="absolute bottom-1 right-1" />
        <span
          className="absolute left-6 right-6 top-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, var(--glow), transparent)" }}
        />
        <span
          className="absolute left-6 right-6 bottom-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, var(--glow), transparent)" }}
        />
      </div>

      <div className="relative z-[1]">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="group flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2.5">
            <span className="index-marker">⚙</span>
            <span className="font-display text-[12px] font-medium tracking-[0.02em] text-fg">
              Settings
            </span>
          </span>
          <span
            className={`text-[10px] text-muted transition-transform duration-300 ${
              open ? "" : "-rotate-90"
            }`}
          >
            ▾
          </span>
        </button>

        <div
          className={`px-4 transition-[max-height,opacity] duration-300 ease-out ${
            open ? "scroll-thin overflow-y-auto" : "overflow-hidden"
          }`}
          style={{ maxHeight: open ? "min(72vh, 620px)" : 0, opacity: open ? 1 : 0 }}
        >
          <div className="pb-4 pt-1">
            <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.24em] text-faint">
              Colour Palette
            </div>
            <div className="flex flex-col gap-1">
              {Object.entries(SCHEMES).map(([key, scheme]) => {
                const active = theme === key;
                return (
                  <button
                    key={key}
                    onClick={() => choose(key)}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded px-2 py-1.5 transition-colors ${
                      active ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="flex gap-1">
                        {[
                          scheme.vars["--color-fg"],
                          scheme.vars["--color-accent"],
                          scheme.vars["--color-accent-dim"],
                        ].map((c, i) => (
                          <span
                            key={i}
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: c, boxShadow: `0 0 5px ${c}` }}
                          />
                        ))}
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.03em] text-fg">
                        {scheme.name}
                      </span>
                    </span>
                    {active && <span className="text-[9px] text-accent">●</span>}
                  </button>
                );
              })}
            </div>

            <div className="hairline my-3" />

            <Link
              href="/ki-hologram"
              className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-fg transition-colors hover:bg-white/[0.04] hover:text-accent"
            >
              <span className="index-marker">KI</span>
              <span className="font-mono text-[11px] tracking-[0.03em]">
                Talk to KI
              </span>
            </Link>

            {dm && (
              <>
                <div className="hairline my-3" />
                <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.24em] text-faint">
                  Dungeon Master
                </div>
                {dm}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
