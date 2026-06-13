"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

import { type StarSystemData } from "../data";
import {
  makeBeamTexture,
  makeCoronaTexture,
  makeRingTexture,
} from "../textures";
import { useReducedMotion } from "../useReducedMotion";
import { NO_RAYCAST } from "./shared";
import { OrbitingPlanets } from "./bodies";
import { StarMesh } from "./StarMesh";

function CoronaSprite({
  color,
  scale,
  opacity = 0.8,
}: {
  color: string;
  scale: number;
  opacity?: number;
}) {
  const map = useMemo(() => makeCoronaTexture(color), [color]);
  return (
    <sprite scale={[scale, scale, 1]} raycast={NO_RAYCAST}>
      <spriteMaterial
        map={map}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}

function BlackHoleCore({ system }: { system: StarSystemData }) {
  const discRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const haloMap = useMemo(() => makeRingTexture("#e84daa"), []);
  const reduced = useReducedMotion();

  useFrame((_, delta) => {
    if (reduced) return;
    if (discRef.current) discRef.current.rotation.z += delta * 0.8;
    if (outerRef.current) outerRef.current.rotation.z -= delta * 0.35;
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[system.size * 0.75, 48, 48]} />
        <meshBasicMaterial color="#050008" />
      </mesh>
      <mesh ref={discRef} rotation={[Math.PI / 2.25, 0, 0]}>
        <torusGeometry args={[system.size * 1.45, 0.22, 16, 96]} />
        <meshBasicMaterial
          color="#e84daa"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={outerRef} rotation={[Math.PI / 2.25, 0, 0]}>
        <torusGeometry args={[system.size * 1.95, 0.1, 12, 96]} />
        <meshBasicMaterial
          color="#7722aa"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* lens-distortion style halo instead of a corona */}
      <sprite
        scale={[system.size * 6.5, system.size * 6.5, 1]}
        raycast={NO_RAYCAST}
      >
        <spriteMaterial
          map={haloMap}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      {/* bright photon ring hugging the event horizon */}
      <sprite
        scale={[system.size * 2.7, system.size * 2.7, 1]}
        raycast={NO_RAYCAST}
      >
        <spriteMaterial
          map={haloMap}
          color="#ffd9f4"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <pointLight color="#cc44ff" intensity={18} distance={26} />
    </group>
  );
}

// Two opposed cones sharing the texture, bright at the star and tapering /
// fading to a point at each tip.
function BeamCones({
  radius,
  length,
  opacity,
  map,
}: {
  radius: number;
  length: number;
  opacity: number;
  map: THREE.Texture;
}) {
  const material = (
    <meshBasicMaterial
      map={map}
      transparent
      opacity={opacity}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
      side={THREE.DoubleSide}
    />
  );
  return (
    <>
      <mesh position={[0, length / 2, 0]}>
        <coneGeometry args={[radius, length, 16, 1, true]} />
        {material}
      </mesh>
      <mesh position={[0, -length / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[radius, length, 16, 1, true]} />
        {material}
      </mesh>
    </>
  );
}

function PulsarBeam({ system }: { system: StarSystemData }) {
  const beamRef = useRef<THREE.Group>(null);
  const beamMap = useMemo(() => makeBeamTexture(system.color), [system.color]);
  const reduced = useReducedMotion();

  useEffect(() => () => beamMap.dispose(), [beamMap]);

  useFrame(({ clock }) => {
    if (reduced) return;
    if (beamRef.current) beamRef.current.rotation.y = clock.elapsedTime * 0.7;
  });

  const length = 5.5;
  return (
    <group ref={beamRef} rotation={[0.25, 0, 0.18]}>
      <BeamCones radius={0.13} length={length} opacity={0.55} map={beamMap} />
      <BeamCones radius={0.4} length={length} opacity={0.16} map={beamMap} />
    </group>
  );
}

function BinaryPair({ system }: { system: StarSystemData }) {
  const aRef = useRef<THREE.Group>(null);
  const bRef = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();

  useFrame(({ clock }) => {
    const a = (reduced ? 0 : clock.elapsedTime) * 0.5;
    const r = system.size * 0.75;
    aRef.current?.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    bRef.current?.position.set(-Math.cos(a) * r, 0, -Math.sin(a) * r);
  });

  return (
    <group>
      <group ref={aRef}>
        <StarMesh color="#ffaa44" radius={system.size * 0.55} />
      </group>
      <group ref={bRef}>
        <StarMesh color="#ff8855" radius={system.size * 0.42} />
      </group>
    </group>
  );
}

export function StarSystem({
  system,
  focused,
  selectedPlanet,
  onSelectSystem,
  onSelectPlanet,
}: {
  system: StarSystemData;
  focused: boolean;
  selectedPlanet: string | null;
  onSelectSystem: (id: string) => void;
  onSelectPlanet: (systemId: string, bodyName: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion();
  const phase = useMemo(
    () => system.position[0] * 1.3 + system.position[2],
    [system]
  );

  const isBlackHole = system.kind === "blackhole";

  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime;
    const g = groupRef.current;
    if (g) {
      g.position.y = system.position[1] + Math.sin(t * 0.4 + phase) * 0.35;
      g.rotation.y = t * 0.08 + phase;
    }
    if (lightRef.current) {
      lightRef.current.intensity =
        system.size * 14 * (1 + Math.sin(t * 1.6 + phase) * 0.25);
    }
  });

  useEffect(() => {
    if (!coreRef.current) return;
    const s = hovered ? 1.2 : 1;
    gsap.to(coreRef.current.scale, {
      x: s,
      y: s,
      z: s,
      duration: reduced ? 0 : 0.2,
    });
  }, [hovered, reduced]);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  return (
    <group ref={groupRef} position={system.position}>
      <group
        ref={coreRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelectSystem(system.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        {isBlackHole ? (
          <BlackHoleCore system={system} />
        ) : (
          <>
            {system.kind === "binary" ? (
              <BinaryPair system={system} />
            ) : (
              <StarMesh color={system.color} radius={system.size * 0.65} />
            )}
            <CoronaSprite color={system.color} scale={system.size * 5.5} />
            {system.kind === "pulsar" && <PulsarBeam system={system} />}
            <pointLight
              ref={lightRef}
              color={system.color}
              intensity={system.size * 14}
              distance={30}
              decay={1.8}
            />
          </>
        )}
        {/* generous transparent hit target so small stars are easy to click */}
        <mesh>
          <sphereGeometry args={[Math.max(system.size * 1.4, 1.4), 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {hovered && !focused && (
        <Html
          center
          position={[0, system.size * 1.4 + 2.2, 0]}
          zIndexRange={[20, 0]}
        >
          <div className="pointer-events-none select-none whitespace-nowrap rounded border border-[#c9a84c]/40 bg-[#07051a]/90 px-3 py-1.5 backdrop-blur-sm">
            <span className="font-display text-sm font-bold tracking-[0.2em] text-[#f0d080]">
              {system.name.toUpperCase()}
            </span>
          </div>
        </Html>
      )}

      {focused && (
        <OrbitingPlanets
          system={system}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={onSelectPlanet}
        />
      )}
    </group>
  );
}
