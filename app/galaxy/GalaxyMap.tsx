"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";

import GalaxyScene from "./GalaxyScene";
import SystemPanel from "./SystemPanel";
import PlanetPanel from "./PlanetPanel";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";
import { usePrefersReducedMotion } from "./useReducedMotion";
import { useCampaign } from "./useCampaign";
import { SYSTEMS, getSystemBodies, systemById } from "./data";
import { HOME_CAMERA } from "./useCameraFly";
import { HudCorner, HudSlashes, HudReticle } from "./Hud";
import { HudSettings } from "./HudSettings";

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

function SceneFallback({ lost }: { lost: boolean }) {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <h1 className="font-display text-2xl font-bold tracking-[0.04em] text-fg">
        The Veilborn Galaxy
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        {lost
          ? "The astral projection collapsed — the graphics context was lost."
          : "This vessel's instruments can't render the star chart. A browser with WebGL enabled is required to view the Veilborn Galaxy."}
      </p>
      {lost && (
        <button
          onClick={() => window.location.reload()}
          className="rounded-sm border border-accent/50 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent transition-colors hover:border-accent hover:text-accent-bright"
        >
          Re-chart the Veil
        </button>
      )}
    </div>
  );
}

/**
 * Single source of truth for what the chart is showing. Every panel's
 * open/closed state and the camera focus derive from this one value, which
 * keeps the toolbars from ever desyncing.
 */
type View =
  | { mode: "galaxy" }
  | { mode: "system"; systemId: string }
  | { mode: "planet"; systemId: string; bodyName: string };

/** Parse a shareable URL (?system=…&body=…) into the initial view. */
function readViewFromURL(): View {
  const params = new URLSearchParams(window.location.search);
  const systemId = params.get("system");
  if (!systemId) return { mode: "galaxy" };
  const system = SYSTEMS.find((s) => s.id === systemId);
  if (!system) return { mode: "galaxy" };
  const bodyName = params.get("body");
  if (bodyName && getSystemBodies(system).some((b) => b.name === bodyName)) {
    return { mode: "planet", systemId, bodyName };
  }
  return { mode: "system", systemId };
}

/** Keep the URL in sync with the current view so it can be bookmarked/shared. */
function writeViewToURL(view: View) {
  const params = new URLSearchParams();
  if (view.mode !== "galaxy") params.set("system", view.systemId);
  if (view.mode === "planet") params.set("body", view.bodyName);
  const qs = params.toString();
  window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

// Space-tech palette — varied hues that still read like HUD/terminal signals.
const LEGEND_CHAIN = [
  { label: "Administrative HQ", color: "#8cc6ff", opacity: 1 },
  { label: "Dominant", color: "#4da3ff", opacity: 0.95 },
  { label: "Active", color: "#5cd6a0", opacity: 0.9 },
  { label: "Covert / Limited", color: "#e5c26a", opacity: 0.9 },
  { label: "Classified", color: "#b18cff", opacity: 0.9 },
  { label: "Unknown", color: "#5b6173", opacity: 0.7 },
];

function Divider() {
  return <div className="hairline my-3" />;
}

/** Collapsible cartographer's key. Self-contained so toggling never re-renders the scene. */
function Legend({
  hideOnMobile,
  charted,
  total,
}: {
  hideOnMobile: boolean;
  charted: number;
  total: number;
}) {
  // Open by default on desktop, collapsed on phones to stay out of the way.
  const [open, setOpen] = useState(
    () => window.matchMedia("(min-width: 768px)").matches
  );

  return (
    <div
      className={`panel panel-grid pointer-events-auto fixed bottom-3 left-3 z-40 w-[268px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-md bg-gradient-to-b from-bg/90 to-bg/30 sm:bottom-5 sm:left-5 sm:block ${
        hideOnMobile ? "hidden" : ""
      }`}
    >
      {/* HUD corner accents + fading top/bottom border lines */}
      <div className="pointer-events-none absolute inset-0 z-[2] text-accent">
        <HudCorner corner="tl" size={15} className="absolute left-1 top-1" />
        <HudCorner corner="br" size={15} className="absolute bottom-1 right-1" />
        <span
          className="absolute left-6 right-6 top-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--glow), transparent)",
          }}
        />
        <span
          className="absolute left-6 right-6 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--glow), transparent)",
          }}
        />
      </div>

      <div className="relative z-[1]">
        <button
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2.5">
            <span className="index-marker">KEY</span>
            <span className="whitespace-nowrap font-display text-[12px] font-medium tracking-[0.02em] text-fg">
              Cartographer&apos;s Key
            </span>
          </span>
          <span className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] tracking-[0.08em] text-accent/80">
              {charted}/{total}
            </span>
            <span
              className={`text-[10px] text-muted transition-transform duration-300 ${
                open ? "" : "-rotate-90"
              }`}
            >
              ▾
            </span>
          </span>
        </button>

        <div
          className="overflow-hidden px-4 transition-[max-height,opacity] duration-300 ease-out"
          style={{ maxHeight: open ? 420 : 0, opacity: open ? 1 : 0 }}
        >
          <div className="pb-5 pt-1.5">
            <div className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.24em] text-faint">
              Stellar Bodies
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
              {SYSTEMS.map((s) => {
                const dot = s.kind === "blackhole" ? "#e84daa" : s.color;
                return (
                  <div key={s.id} className="flex items-center gap-2.5">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: dot, boxShadow: `0 0 5px ${dot}` }}
                    />
                    <span className="text-[11px] leading-tight text-muted">
                      {s.starType}
                    </span>
                  </div>
                );
              })}
            </div>

            <Divider />

            <div className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.24em] text-faint">
              Aureate Chain
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              {LEGEND_CHAIN.map((c) => (
                <div key={c.label} className="flex items-center gap-2.5">
                  <span
                    className="shrink-0 text-[13px] leading-none"
                    style={{ color: c.color, opacity: c.opacity }}
                  >
                    ⛓
                  </span>
                  <span className="text-[11px] leading-tight text-muted">
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** One-stop DM remote: reveal/hide every system, set the party, reset, exit. */
function DMConsole({
  campaign,
  charted,
  onFly,
  onReset,
  onClose,
}: {
  campaign: ReturnType<typeof useCampaign>;
  charted: number;
  onFly: (id: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="panel panel-grid scroll-thin pointer-events-auto fixed left-3 top-[4.6rem] z-[46] max-h-[80vh] w-[272px] overflow-y-auto rounded-md border border-white/10 bg-gradient-to-b from-bg/90 to-bg/30 [&>*]:relative [&>*]:z-[1]">
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <span className="flex items-center gap-2">
          <span className="index-marker">DM</span>
          <span className="font-display text-[12px] font-medium tracking-[0.02em] text-fg">
            Console
          </span>
          <span
            title={
              campaign.shared
                ? "Live — changes sync to players"
                : "Local only — players won't see changes"
            }
            className={`h-1.5 w-1.5 rounded-full ${
              campaign.shared ? "bg-[#5cd6a0]" : "bg-[#ffab5c]"
            }`}
          />
          <span className="font-mono text-[8px] tracking-[0.16em] text-faint">
            {campaign.shared ? "LIVE" : "LOCAL"}
          </span>
        </span>
        <button
          onClick={onClose}
          aria-label="Close DM console"
          className="text-sm text-muted transition-colors hover:text-fg"
        >
          ✕
        </button>
      </div>
      <div className="px-4 pb-4">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
          {charted} / {SYSTEMS.length} charted
        </div>

        <ul className="flex flex-col gap-1.5">
          {SYSTEMS.map((s) => {
            const shown = campaign.isDiscovered(s.id);
            const isParty = campaign.party === s.id;
            const dot = s.kind === "blackhole" ? "#e84daa" : s.color;
            return (
              <li key={s.id} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: dot, boxShadow: `0 0 5px ${dot}` }}
                />
                <button
                  onClick={() => onFly(s.id)}
                  className="flex-1 truncate text-left text-[12px] text-fg/85 transition-colors hover:text-accent"
                >
                  {s.name}
                </button>
                <button
                  onClick={() => campaign.toggleDiscovered(s.id)}
                  title={shown ? "Hide from players" : "Reveal to players"}
                  className={`rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] transition-colors ${
                    shown
                      ? "border-[#5cd6a0]/40 text-[#5cd6a0] hover:bg-[#5cd6a0]/10"
                      : "border-[#ffab5c]/40 text-[#ffab5c] hover:bg-[#ffab5c]/10"
                  }`}
                >
                  {shown ? "Shown" : "Hidden"}
                </button>
                <button
                  onClick={() => campaign.setParty(s.id)}
                  title="Set party here"
                  className={`px-1 text-[12px] leading-none transition-colors ${
                    isParty
                      ? "text-accent"
                      : "text-white/25 hover:text-accent"
                  }`}
                >
                  ◆
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
          <button
            onClick={onReset}
            className="rounded border border-[#ffab5c]/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#ffab5c]/80 transition-colors hover:text-[#ffab5c]"
          >
            ↺ Reset
          </button>
          <button
            onClick={campaign.exitDm}
            className="rounded border border-accent/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-accent transition-colors hover:border-accent hover:text-accent-bright"
          >
            Exit DM
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GalaxyMap() {
  // Lazy init from the URL (client-only — GalaxyMap is dynamically ssr:false).
  const [view, setView] = useState<View>(readViewFromURL);
  // Bumped on every camera-flight request. Lets re-selecting the same system
  // re-trigger the flight even though `focusSystemId` is unchanged.
  const [flightNonce, setFlightNonce] = useState(0);
  // True once the camera has settled on the focused system.
  const [systemArrived, setSystemArrived] = useState(false);
  // The system toolbar can be closed without leaving the system — the camera
  // stays parked. Re-selecting a system/planet clears this so it reopens.
  const [panelDismissed, setPanelDismissed] = useState(false);

  // Mirror of `view` for callbacks that must read the latest value without
  // being re-created (keeps the GalaxyScene effect deps stable).
  const viewRef = useRef<View>(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const backRef = useRef<HTMLButtonElement>(null);

  const campaign = useCampaign();
  const { dmMode, isDiscovered } = campaign;
  const [dmConsoleOpen, setDmConsoleOpen] = useState(true);

  const focusSystemId = view.mode === "galaxy" ? null : view.systemId;

  const selectSystem = useCallback(
    (id: string) => {
      // Players can only survey charted systems; DMs can survey anything.
      if (!dmMode && !isDiscovered(id)) return;
      setSystemArrived(false);
      setPanelDismissed(false);
      setView({ mode: "system", systemId: id });
      setFlightNonce((n) => n + 1);
    },
    [dmMode, isDiscovered]
  );

  const selectPlanet = useCallback((systemId: string, bodyName: string) => {
    // Camera stays parked on the system; swapping panels is all that happens.
    setPanelDismissed(false);
    setView({ mode: "planet", systemId, bodyName });
  }, []);

  const goToGalaxy = useCallback(() => {
    setSystemArrived(false);
    setPanelDismissed(false);
    setView({ mode: "galaxy" });
    setFlightNonce((n) => n + 1);
  }, []);

  // Close the toolbar but stay zoomed on the system (no camera flight).
  const dismissPanel = useCallback(() => setPanelDismissed(true), []);

  const backToSystem = useCallback(() => {
    const v = viewRef.current;
    if (v.mode === "planet") setView({ mode: "system", systemId: v.systemId });
  }, []);

  const handleArrive = useCallback((id: string) => {
    const v = viewRef.current;
    if (v.mode !== "galaxy" && v.systemId === id) setSystemArrived(true);
  }, []);

  // One step back: planet → system → galaxy. Shared by Esc and void-clicks.
  const stepBack = useCallback(() => {
    const v = viewRef.current;
    if (v.mode === "planet") backToSystem();
    else if (v.mode === "system") goToGalaxy();
  }, [backToSystem, goToGalaxy]);

  // Mirror the current view into the URL so it can be shared/bookmarked.
  useEffect(() => {
    writeViewToURL(view);
  }, [view]);

  const reducedMotion = usePrefersReducedMotion();
  // Lazy init is safe here: GalaxyMap is dynamically imported with ssr:false,
  // so this only ever runs in the browser.
  const [sceneFailed, setSceneFailed] = useState<"unsupported" | "lost" | null>(
    () => (hasWebGL() ? null : "unsupported")
  );

  // Esc / Backspace steps back: planet → system → galaxy.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Backspace") stepBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepBack]);

  useEffect(() => {
    if (focusSystemId && backRef.current) {
      gsap.fromTo(
        backRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.4 }
      );
    }
  }, [focusSystemId]);

  const charted = SYSTEMS.filter((s) => campaign.discovered.has(s.id)).length;

  const handleReset = useCallback(() => {
    if (
      window.confirm(
        "Reset campaign? This clears all charted systems, the party location and its route."
      )
    ) {
      campaign.reset();
      goToGalaxy();
    }
  }, [campaign, goToGalaxy]);

  const panelSystem = focusSystemId ? systemById(focusSystemId) : null;
  const systemPanelOpen = view.mode === "system" && systemArrived && !panelDismissed;

  const selectedPlanet = view.mode === "planet" ? view.bodyName : null;
  const planetBody =
    view.mode === "planet"
      ? getSystemBodies(systemById(view.systemId)).find(
          (b) => b.name === view.bodyName
        ) ?? null
      : null;
  const planetSystemName =
    view.mode === "planet" ? systemById(view.systemId).name : "";
  const planetPanelOpen = view.mode === "planet";
  const accent = panelSystem?.color ?? "#4da3ff";

  if (sceneFailed) return <SceneFallback lost={sceneFailed === "lost"} />;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg font-body text-fg">
      <CanvasErrorBoundary onError={() => setSceneFailed("unsupported")}>
        <Canvas
          camera={{ position: HOME_CAMERA, fov: 50, near: 0.1, far: 400 }}
          dpr={[1, 2]}
          className="absolute inset-0"
          aria-label="Interactive 3D star chart of the Veilborn Galaxy"
          onPointerMissed={stepBack}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener(
              "webglcontextlost",
              (e) => {
                e.preventDefault();
                setSceneFailed("lost");
              },
              { once: true }
            );
          }}
        >
          <GalaxyScene
            focusSystemId={focusSystemId}
            selectedPlanet={selectedPlanet}
            flightNonce={flightNonce}
            reducedMotion={reducedMotion}
            discovered={campaign.discovered}
            party={campaign.party}
            trail={campaign.trail}
            dmMode={dmMode}
            onSelectSystem={selectSystem}
            onSelectPlanet={selectPlanet}
            onArrive={handleArrive}
          />
        </Canvas>
      </CanvasErrorBoundary>

      {/* header toolbar */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
        <div className="relative flex items-start justify-between gap-4 bg-gradient-to-b from-bg/90 to-bg/30 px-6 py-[17px] backdrop-blur-md">
          {/* holographic HUD decorations */}
          <div className="pointer-events-none absolute inset-0 text-accent">
            <HudCorner corner="tl" className="absolute left-1.5 top-1.5" />
            <HudCorner corner="tr" className="absolute right-1.5 top-1.5" />
            <HudCorner corner="bl" className="absolute bottom-1.5 left-1.5" />
            <HudCorner corner="br" className="absolute bottom-1.5 right-1.5" />
            <HudReticle
              size={56}
              className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 opacity-[0.14] md:block"
            />
            <HudSlashes
              count={4}
              className="absolute left-[41%] top-3 hidden -translate-x-1/2 opacity-50 sm:block"
            />
            <HudSlashes
              count={4}
              className="absolute right-[41%] top-3 hidden translate-x-1/2 rotate-180 opacity-50 sm:block"
            />
            {/* bottom HUD rule with a centre notch (replaces the old border) */}
            <span
              className="absolute bottom-0 left-12 right-12 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--glow) 10%, var(--glow) 46%, transparent 49%, transparent 51%, var(--glow) 54%, var(--glow) 90%, transparent)",
              }}
            />
            {/* centre node on the bottom rule */}
            <span
              className="absolute bottom-[-3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 border border-accent/80 bg-bg"
              style={{ boxShadow: "0 0 6px var(--accent)" }}
            />
          </div>
          <div className="relative">
            <h1 className="flex items-center gap-2.5 font-display text-lg font-bold tracking-[0.02em] text-fg sm:text-xl">
              <span className="h-4 w-px bg-accent shadow-[0_0_10px_var(--accent)]" />
              The Veilborn Galaxy
              {dmMode && (
                <button
                  onClick={() => setDmConsoleOpen((o) => !o)}
                  className="pointer-events-auto align-middle rounded border border-accent/50 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.16em] text-accent transition-colors hover:bg-accent/10"
                >
                  ⌖ DM CONSOLE
                </button>
              )}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              <span>Sector Omega-9</span>
              <span className="text-faint">/</span>
              <span>Uncharted Territory</span>
              <span className="text-faint">/</span>
              <span>Arcane Survey Incomplete</span>
            </p>
          </div>
          {/* Chart byline — hidden while a panel is open so it never sits
              over the right-hand survey panel. */}
          <div
            className={`relative hidden text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-faint ${
              focusSystemId ? "" : "sm:block"
            }`}
          >
            <div>Galactic Chart № 7 of ∞</div>
            <div>Survey Vessel · Astral Cartographer</div>
            <div>
              Status · <span className="text-[#ffab5c]">⚠ Unmapped</span>
            </div>
          </div>
        </div>
      </header>

      {/* back to galaxy */}
      {focusSystemId && (
        <button
          ref={backRef}
          onClick={goToGalaxy}
          className="panel pointer-events-auto fixed left-6 top-[6.5rem] z-40 cursor-pointer rounded-md border border-accent/30 bg-bg/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent transition-all hover:border-accent hover:text-accent-bright hover:shadow-[0_0_12px_var(--glow)]"
        >
          ‹ Back to Galaxy
        </button>
      )}

      <Legend
        hideOnMobile={focusSystemId !== null}
        charted={charted}
        total={SYSTEMS.length}
      />

      <HudSettings />

      {/* DM remote */}
      {dmMode && dmConsoleOpen && (
        <DMConsole
          campaign={campaign}
          charted={charted}
          onFly={selectSystem}
          onReset={handleReset}
          onClose={() => setDmConsoleOpen(false)}
        />
      )}

      {/* instructions — only in the wide galaxy view */}
      {!focusSystemId && (
        <div className="pointer-events-none fixed bottom-3 right-3 z-40 max-w-[45vw] text-right sm:bottom-5 sm:right-5 sm:max-w-none">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
            Select a system to survey
          </p>
          <p className="mt-0.5 text-[11px] tracking-wide text-faint sm:text-[12px]">
            Drag to orbit · pinch or scroll to draw nearer
          </p>
        </div>
      )}

      <SystemPanel
        system={panelSystem}
        open={systemPanelOpen}
        reducedMotion={reducedMotion}
        accent={accent}
        dmMode={dmMode}
        discovered={focusSystemId ? campaign.isDiscovered(focusSystemId) : false}
        isParty={!!focusSystemId && campaign.party === focusSystemId}
        onToggleDiscovered={() => focusSystemId && campaign.toggleDiscovered(focusSystemId)}
        onSetParty={() => focusSystemId && campaign.setParty(focusSystemId)}
        onBack={dismissPanel}
      />
      <PlanetPanel
        body={planetBody}
        systemName={planetSystemName}
        open={planetPanelOpen}
        reducedMotion={reducedMotion}
        accent={accent}
        onBack={backToSystem}
      />
    </div>
  );
}
