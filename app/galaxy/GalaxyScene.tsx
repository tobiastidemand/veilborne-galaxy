"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, OrbitControls, Stars } from "@react-three/drei";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { SYSTEMS, systemById } from "./data";
import { MotionContext } from "./useReducedMotion";
import { partyBodyName, partySystem } from "./useCampaign";
import { useCameraFly } from "./useCameraFly";
import { NebulaGlow, StarfieldExtra } from "./scene/Background";
import { StarSystem } from "./scene/StarSystem";

const IDLE_RESUME_MS = 5000;

export default function GalaxyScene({
  focusSystemId,
  selectedPlanet,
  flightNonce,
  reducedMotion,
  discovered,
  party,
  trail,
  dmMode,
  onSelectSystem,
  onSelectPlanet,
  onArrive,
}: {
  focusSystemId: string | null;
  selectedPlanet: string | null;
  flightNonce: number;
  reducedMotion: boolean;
  discovered: Set<string>;
  party: string | null;
  trail: string[];
  dmMode: boolean;
  onSelectSystem: (id: string) => void;
  onSelectPlanet: (systemId: string, bodyName: string) => void;
  onArrive: (id: string) => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const lastInteraction = useRef(0);
  const { flyTo, flyHome } = useCameraFly(controlsRef, reducedMotion);
  const firstFlight = useRef(true);

  // Drive the camera off `flightNonce` so re-selecting the same system still
  // re-flies (and re-opens its panel). `focusSystemId` only ever changes in
  // lockstep with the nonce, so including it never triggers a stray flight.
  useEffect(() => {
    if (firstFlight.current) {
      firstFlight.current = false;
      // Deep-linked straight to a system (?system=…): fly there on first mount.
      if (focusSystemId) {
        const system = systemById(focusSystemId);
        flyTo(system.position, system.size, () => onArrive(system.id));
      }
      return;
    }
    if (focusSystemId) {
      const system = systemById(focusSystemId);
      flyTo(system.position, system.size, () => onArrive(system.id));
    } else {
      flyHome();
    }
  }, [flightNonce, focusSystemId, flyTo, flyHome, onArrive]);

  useFrame((state) => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.autoRotate =
      !reducedMotion &&
      !focusSystemId &&
      performance.now() - lastInteraction.current > IDLE_RESUME_MS;

    // Widen the field of view on narrow viewports so the galaxy stays framed.
    const persp = state.camera as THREE.PerspectiveCamera;
    const fov = state.size.width < 768 ? 64 : 50;
    if (persp.fov !== fov) {
      persp.fov = fov;
      persp.updateProjectionMatrix();
    }
  });

  const caOffset = useMemo(() => new THREE.Vector2(0.0006, 0.0006), []);

  // The party's travelled route, through systems they've actually visited.
  const trailPoints = useMemo(
    () =>
      trail
        .map((id) => SYSTEMS.find((s) => s.id === id)?.position)
        .filter((p): p is [number, number, number] => !!p),
    [trail]
  );

  return (
    <MotionContext.Provider value={reducedMotion}>
      <color attach="background" args={["#03020a"]} />
      <fog attach="fog" args={["#03020a", 80, 220]} />
      <ambientLight intensity={0.12} />

      <Stars
        radius={210}
        depth={80}
        count={3000}
        factor={3}
        saturation={0}
        fade
        speed={0.3}
      />
      <StarfieldExtra />
      <NebulaGlow />

      {/* the party's travelled route */}
      {trailPoints.length >= 2 && (
        <Line
          points={trailPoints}
          color="#7fe0ff"
          lineWidth={1.5}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      )}

      {SYSTEMS.map((system) => (
        <StarSystem
          key={system.id}
          system={system}
          focused={focusSystemId === system.id}
          selectedPlanet={selectedPlanet}
          discovered={discovered.has(system.id)}
          isParty={partySystem(party) === system.id}
          partyBody={
            partySystem(party) === system.id ? partyBodyName(party) : null
          }
          dmMode={dmMode}
          onSelectSystem={onSelectSystem}
          onSelectPlanet={onSelectPlanet}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        enablePan={false}
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={95}
        minPolarAngle={Math.PI * 0.12}
        maxPolarAngle={Math.PI * 0.82}
        autoRotateSpeed={0.45}
        onStart={() => {
          lastInteraction.current = performance.now();
          if (controlsRef.current) controlsRef.current.autoRotate = false;
        }}
        onEnd={() => {
          lastInteraction.current = performance.now();
        }}
      />

      {/* additive glow + a touch of old-chart film treatment */}
      <EffectComposer>
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.18}
          luminanceSmoothing={0.5}
          mipmapBlur
          radius={0.7}
        />
        <ChromaticAberration offset={caOffset} radialModulation={false} modulationOffset={0} />
        <Vignette eskil={false} offset={0.32} darkness={0.72} />
        <Noise opacity={0.04} premultiply />
      </EffectComposer>
    </MotionContext.Provider>
  );
}
