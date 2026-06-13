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
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-[#03020a] px-6 text-center">
      <h1 className="font-title text-2xl font-black tracking-[0.16em] text-[#f0d080]">
        The Veilborn Galaxy
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-[#e9e2d0]/70">
        {lost
          ? "The astral projection collapsed — the graphics context was lost."
          : "This vessel's instruments can't render the star chart. A browser with WebGL enabled is required to view the Veilborn Galaxy."}
      </p>
      {lost && (
        <button
          onClick={() => window.location.reload()}
          className="border border-[#c9a84c]/50 px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#c9a84c] transition-colors hover:text-[#f0d080]"
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

const LEGEND_CHAIN = [
  { label: "Administrative HQ", color: "#f0d080", opacity: 1 },
  { label: "Dominant", color: "#f0d080", opacity: 0.8 },
  { label: "Active", color: "#7fff9f", opacity: 0.65 },
  { label: "Covert / Limited", color: "#ff9f40", opacity: 0.55 },
  { label: "Classified", color: "#e84daa", opacity: 0.65 },
  { label: "Unknown", color: "#ffffff", opacity: 0.35 },
];

function Divider() {
  return (
    <div className="tome-divider my-2.5">
      <span>✦</span>
    </div>
  );
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
      className={`tome-panel tome-frame pointer-events-auto fixed bottom-3 left-3 z-40 w-[262px] max-w-[calc(100vw-1.5rem)] rounded-sm border border-[#c9a84c]/40 sm:bottom-5 sm:left-5 sm:block ${
        hideOnMobile ? "hidden" : ""
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:text-[#f0d080]"
        aria-expanded={open}
      >
        <span className="whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#f0d080]">
          Cartographer&apos;s Key
        </span>
        <span className="flex items-center gap-2">
          <span className="font-display text-[10px] font-bold tracking-[0.12em] text-[#c9a84c]/70">
            {charted}/{total}
          </span>
          <span
            className={`text-xs text-[#c9a84c] transition-transform duration-300 ${
              open ? "" : "-rotate-90"
            }`}
          >
            ▾
          </span>
        </span>
      </button>

      <div
        className="overflow-hidden px-4 transition-[max-height,opacity] duration-300 ease-out"
        style={{ maxHeight: open ? 360 : 0, opacity: open ? 1 : 0 }}
      >
        <div>
          <div className="pb-4 pt-1">
            <div className="mb-2 font-display text-[9px] font-bold uppercase tracking-[0.3em] text-[#c9a84c]/70">
              Stellar Bodies
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
              {SYSTEMS.map((s) => {
                const dot = s.kind === "blackhole" ? "#e84daa" : s.color;
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: dot, boxShadow: `0 0 5px ${dot}` }}
                    />
                    <span className="text-[11px] leading-tight text-[#e9e2d0]/65">
                      {s.starType}
                    </span>
                  </div>
                );
              })}
            </div>

            <Divider />

            <div className="mb-1.5 font-display text-[9px] font-bold uppercase tracking-[0.3em] text-[#c9a84c]/70">
              Aureate Chain
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-1">
              {LEGEND_CHAIN.map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <span
                    className="shrink-0 text-[13px] leading-none"
                    style={{ color: c.color, opacity: c.opacity }}
                  >
                    ⛓
                  </span>
                  <span className="text-[11px] leading-tight text-[#e9e2d0]/65">
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
    <div className="tome-panel tome-scroll pointer-events-auto fixed left-3 top-[4.6rem] z-[46] max-h-[80vh] w-[272px] overflow-y-auto rounded-sm border border-[#7fe0ff]/45">
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <span className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#7fe0ff]">
          DM Console
          {(() => {
            const status = campaign.denied
              ? { dot: "bg-[#e84daa]", label: "DENIED", title: "Writes rejected — append ?key=<token> to the URL" }
              : campaign.shared
                ? { dot: "bg-[#7fff9f]", label: "LIVE", title: "Live — changes sync to players" }
                : { dot: "bg-[#ff9f40]", label: "LOCAL", title: "Local only — players won't see changes" };
            return (
              <>
                <span title={status.title} className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                <span className="text-[8px] font-normal tracking-[0.18em] text-[#e9e2d0]/40">
                  {status.label}
                </span>
              </>
            );
          })()}
        </span>
        <button
          onClick={onClose}
          aria-label="Close DM console"
          className="text-sm text-[#7fe0ff]/70 transition-colors hover:text-[#7fe0ff]"
        >
          ✕
        </button>
      </div>
      <div className="px-4 pb-4">
        <div className="mb-2 font-display text-[9px] font-bold uppercase tracking-[0.28em] text-[#c9a84c]/60">
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
                  className="flex-1 truncate text-left text-[12px] text-[#e9e2d0]/80 transition-colors hover:text-[#f0d080]"
                >
                  {s.name}
                </button>
                <button
                  onClick={() => campaign.toggleDiscovered(s.id)}
                  title={shown ? "Hide from players" : "Reveal to players"}
                  className={`rounded border px-1.5 py-0.5 font-display text-[8px] font-bold uppercase tracking-[0.12em] transition-colors ${
                    shown
                      ? "border-[#7fff9f]/40 text-[#7fff9f] hover:bg-[#7fff9f]/10"
                      : "border-[#ff9f40]/40 text-[#ff9f40] hover:bg-[#ff9f40]/10"
                  }`}
                >
                  {shown ? "Shown" : "Hidden"}
                </button>
                <button
                  onClick={() => campaign.setParty(s.id)}
                  title="Set party here"
                  className={`px-1 text-[12px] leading-none transition-colors ${
                    isParty
                      ? "text-[#7fe0ff]"
                      : "text-white/25 hover:text-[#7fe0ff]"
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
            className="rounded border border-[#ff9f40]/40 px-2.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.18em] text-[#ff9f40]/80 transition-colors hover:text-[#ff9f40]"
          >
            ↺ Reset
          </button>
          <button
            onClick={campaign.exitDm}
            className="rounded border border-[#c9a84c]/40 px-2.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.18em] text-[#c9a84c] transition-colors hover:text-[#f0d080]"
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
      setView({ mode: "system", systemId: id });
      setFlightNonce((n) => n + 1);
    },
    [dmMode, isDiscovered]
  );

  const selectPlanet = useCallback((systemId: string, bodyName: string) => {
    // Camera stays parked on the system; swapping panels is all that happens.
    setView({ mode: "planet", systemId, bodyName });
  }, []);

  const goToGalaxy = useCallback(() => {
    setSystemArrived(false);
    setView({ mode: "galaxy" });
    setFlightNonce((n) => n + 1);
  }, []);

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
  const systemPanelOpen = view.mode === "system" && systemArrived;

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
  const accent = panelSystem?.color ?? "#c9a84c";

  if (sceneFailed) return <SceneFallback lost={sceneFailed === "lost"} />;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#03020a] font-body text-white">
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

      {/* scanlines (vignette handled in the postprocessing pass) */}
      <div className="scanlines pointer-events-none fixed inset-0 z-50" />

      {/* header cartouche */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
        <div className="flex items-start justify-between gap-4 border-b border-[#c9a84c]/35 bg-gradient-to-b from-[#0b0820]/92 to-[#0b0820]/45 px-6 py-3 backdrop-blur-sm">
          <div>
            <h1 className="font-title text-lg font-black tracking-[0.14em] text-[#f0d080] drop-shadow-[0_0_18px_rgba(240,208,128,0.25)] sm:text-2xl sm:tracking-[0.16em]">
              The Veilborn Galaxy
              {dmMode && (
                <button
                  onClick={() => setDmConsoleOpen((o) => !o)}
                  className="pointer-events-auto ml-2 align-middle rounded border border-[#7fe0ff]/50 px-1.5 py-0.5 font-display text-[9px] font-bold tracking-[0.22em] text-[#7fe0ff] transition-colors hover:bg-[#7fe0ff]/10"
                >
                  ⌖ DM CONSOLE
                </button>
              )}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] uppercase tracking-[0.18em] text-[#c9a84c]/70 sm:text-[11px] sm:tracking-[0.22em]">
              <span>Sector Omega-9</span>
              <span className="text-[#c9a84c]/40">✦</span>
              <span>Uncharted Territory</span>
              <span className="text-[#c9a84c]/40">✦</span>
              <span>Arcane Survey Incomplete</span>
            </p>
          </div>
          {/* Chart byline — hidden while a panel is open so it never sits
              over the right-hand survey panel. */}
          <div
            className={`hidden text-right font-display text-[10px] uppercase leading-relaxed tracking-[0.16em] text-[#c9a84c]/55 ${
              focusSystemId ? "" : "sm:block"
            }`}
          >
            <div>Galactic Chart № 7 of ∞</div>
            <div>Survey Vessel · Astral Cartographer</div>
            <div>
              Status · <span className="text-[#ff9f40]">⚠ Unmapped</span>
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#c9a84c]/45 to-transparent" />
      </header>

      {/* back to galaxy */}
      {focusSystemId && (
        <button
          ref={backRef}
          onClick={goToGalaxy}
          className="tome-panel pointer-events-auto fixed left-6 top-[4.75rem] z-40 px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#c9a84c] transition-colors hover:text-[#f0d080]"
        >
          ‹ Back to Galaxy
        </button>
      )}

      <Legend
        hideOnMobile={focusSystemId !== null}
        charted={charted}
        total={SYSTEMS.length}
      />

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
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.24em] text-[#c9a84c]/55 sm:tracking-[0.28em]">
            Select a system to survey
          </p>
          <p className="mt-0.5 text-[11px] italic tracking-wide text-[#e9e2d0]/35 sm:text-[12px]">
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
        onBack={goToGalaxy}
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
