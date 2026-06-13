"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";

import GalaxyScene from "./GalaxyScene";
import SystemPanel from "./SystemPanel";
import PlanetPanel from "./PlanetPanel";
import { SYSTEMS, getSystemBodies, systemById } from "./data";
import { HOME_CAMERA } from "./useCameraFly";

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

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#03020a] font-body text-white">
      <Canvas
        camera={{ position: HOME_CAMERA, fov: 50, near: 0.1, far: 400 }}
        dpr={[1, 2]}
        className="absolute inset-0"
      >
        <GalaxyScene
          focusSystemId={focusSystemId}
          selectedPlanet={selectedPlanet}
          flightNonce={flightNonce}
          onSelectSystem={selectSystem}
          onSelectPlanet={selectPlanet}
          onArrive={handleArrive}
        />
      </Canvas>

      {/* scanlines */}
      <div className="scanlines pointer-events-none fixed inset-0 z-50" />

      {/* header */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-40 flex items-start justify-between border-b border-[#c9a84c]/40 bg-[#07051a]/70 px-6 py-3 backdrop-blur-sm">
        <div>
          <h1 className="font-display text-xl font-black tracking-[0.3em] text-[#f0d080]">
            THE VEILBORN GALAXY
          </h1>
          <p className="mt-0.5 text-xs tracking-[0.2em] text-white/45">
            Sector Omega-9 · Uncharted Territory · Arcane Survey Incomplete
          </p>
        </div>
        <div className="hidden text-right text-[11px] leading-relaxed tracking-wider text-white/40 sm:block">
          <div>Galactic Chart No. 7 of ∞</div>
          <div>Survey Vessel: Astral Cartographer</div>
          <div>
            Status: <span className="text-[#ff9f40]">⚠ UNMAPPED</span>
          </div>
        </div>
      </header>

      {/* back to galaxy */}
      {focusSystemId && (
        <button
          ref={backRef}
          onClick={goToGalaxy}
          className="fixed left-6 top-20 z-40 border border-[#c9a84c]/50 bg-[#07051a]/80 px-4 py-2 font-display text-xs font-bold tracking-[0.25em] text-[#c9a84c] backdrop-blur-sm transition-colors hover:border-[#f0d080] hover:text-[#f0d080]"
        >
          ← BACK TO GALAXY
        </button>
      )}

      {/* legend */}
      <div className="pointer-events-none fixed bottom-4 left-4 z-40 hidden rounded border border-white/10 bg-[#07051a]/75 px-4 py-3 backdrop-blur-sm md:block">
        <div className="mb-2 font-display text-[10px] font-bold tracking-[0.3em] text-[#c9a84c]">
          STELLAR LEGEND
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          {SYSTEMS.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: s.kind === "blackhole" ? "#e84daa" : s.color,
                  boxShadow: `0 0 5px ${
                    s.kind === "blackhole" ? "#e84daa" : s.color
                  }`,
                }}
              />
              <span className="text-[11px] text-white/60">{s.starType}</span>
            </div>
          ))}
        </div>
        <div className="mt-2.5 border-t border-white/10 pt-2">
          <div className="mb-1.5 font-display text-[10px] font-bold tracking-[0.3em] text-[#c9a84c]">
            CHAIN PRESENCE
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
            {LEGEND_CHAIN.map((c) => (
              <div key={c.label} className="flex items-center gap-2">
                <span style={{ color: c.color, opacity: c.opacity }}>⛓</span>
                <span className="text-[11px] text-white/60">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* instructions */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-40 text-right text-[11px] leading-relaxed tracking-wider text-white/30">
        <div>Click a system to survey</div>
        <div>Drag to orbit · Scroll to zoom</div>
      </div>

      <SystemPanel
        system={panelSystem}
        open={systemPanelOpen}
        onBack={goToGalaxy}
      />
      <PlanetPanel
        body={planetBody}
        systemName={planetSystemName}
        open={planetPanelOpen}
        onBack={backToSystem}
      />
    </div>
  );
}
