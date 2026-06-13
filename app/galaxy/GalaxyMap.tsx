"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";

import GalaxyScene from "./GalaxyScene";
import SystemPanel from "./SystemPanel";
import PlanetPanel from "./PlanetPanel";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";
import { usePrefersReducedMotion } from "./useReducedMotion";
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
function Legend() {
  const [open, setOpen] = useState(true);

  return (
    <div className="tome-panel tome-frame pointer-events-auto fixed bottom-5 left-5 z-40 hidden w-[262px] rounded-sm border border-[#c9a84c]/40 md:block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:text-[#f0d080]"
        aria-expanded={open}
      >
        <span className="whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#f0d080]">
          Cartographer&apos;s Key
        </span>
        <span
          className={`text-xs text-[#c9a84c] transition-transform duration-300 ${
            open ? "" : "-rotate-90"
          }`}
        >
          ▾
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

export default function GalaxyMap() {
  const [view, setView] = useState<View>({ mode: "galaxy" });
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

  const focusSystemId = view.mode === "galaxy" ? null : view.systemId;

  const selectSystem = useCallback((id: string) => {
    setSystemArrived(false);
    setView({ mode: "system", systemId: id });
    setFlightNonce((n) => n + 1);
  }, []);

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

  const reducedMotion = usePrefersReducedMotion();
  // Lazy init is safe here: GalaxyMap is dynamically imported with ssr:false,
  // so this only ever runs in the browser.
  const [sceneFailed, setSceneFailed] = useState<"unsupported" | "lost" | null>(
    () => (hasWebGL() ? null : "unsupported")
  );

  // Esc / Backspace steps back: planet → system → galaxy.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" && e.key !== "Backspace") return;
      const v = viewRef.current;
      if (v.mode === "planet") backToSystem();
      else if (v.mode === "system") goToGalaxy();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [backToSystem, goToGalaxy]);

  useEffect(() => {
    if (focusSystemId && backRef.current) {
      gsap.fromTo(
        backRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.4 }
      );
    }
  }, [focusSystemId]);

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

  if (sceneFailed) return <SceneFallback lost={sceneFailed === "lost"} />;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#03020a] font-body text-white">
      <CanvasErrorBoundary onError={() => setSceneFailed("unsupported")}>
        <Canvas
          camera={{ position: HOME_CAMERA, fov: 50, near: 0.1, far: 400 }}
          dpr={[1, 2]}
          className="absolute inset-0"
          aria-label="Interactive 3D star chart of the Veilborn Galaxy"
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
            onSelectSystem={selectSystem}
            onSelectPlanet={selectPlanet}
            onArrive={handleArrive}
          />
        </Canvas>
      </CanvasErrorBoundary>

      {/* lamplight vignette + scanlines */}
      <div className="vignette pointer-events-none fixed inset-0 z-20" />
      <div className="scanlines pointer-events-none fixed inset-0 z-50" />

      {/* header cartouche */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
        <div className="flex items-start justify-between gap-4 border-b border-[#c9a84c]/35 bg-gradient-to-b from-[#0b0820]/92 to-[#0b0820]/45 px-6 py-3 backdrop-blur-sm">
          <div>
            <h1 className="font-title text-2xl font-black tracking-[0.16em] text-[#f0d080] drop-shadow-[0_0_18px_rgba(240,208,128,0.25)]">
              The Veilborn Galaxy
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]/70">
              <span>Sector Omega-9</span>
              <span className="text-[#c9a84c]/40">✦</span>
              <span>Uncharted Territory</span>
              <span className="text-[#c9a84c]/40">✦</span>
              <span>Arcane Survey Incomplete</span>
            </p>
          </div>
          <div className="hidden text-right font-display text-[10px] uppercase leading-relaxed tracking-[0.16em] text-[#c9a84c]/55 sm:block">
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

      <Legend />

      {/* instructions */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-40 text-right">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-[#c9a84c]/55">
          Click a system to survey
        </p>
        <p className="mt-0.5 text-[12px] italic tracking-wide text-[#e9e2d0]/35">
          Drag to orbit · scroll to draw nearer
        </p>
      </div>

      <SystemPanel
        system={panelSystem}
        open={systemPanelOpen}
        reducedMotion={reducedMotion}
        onBack={goToGalaxy}
      />
      <PlanetPanel
        body={planetBody}
        systemName={planetSystemName}
        open={planetPanelOpen}
        reducedMotion={reducedMotion}
        onBack={backToSystem}
      />
    </div>
  );
}
