"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { Line2 } from "three-stdlib";

import type { StarSystemData } from "../data";
import { makeRadialTexture } from "../textures";
import { useReducedMotion } from "../useReducedMotion";
import { NO_RAYCAST } from "./shared";

export function JumpLane({
  from,
  to,
}: {
  from: StarSystemData;
  to: StarSystemData;
}) {
  const ref = useRef<Line2>(null);
  const pulseRef = useRef<THREE.Sprite>(null);
  const reduced = useReducedMotion();

  const a = useMemo(() => new THREE.Vector3(...from.position), [from]);
  const b = useMemo(() => new THREE.Vector3(...to.position), [to]);
  const pulseMap = useMemo(() => makeRadialTexture("#ffe6a0", 1), []);
  // Stagger pulses so they don't all travel in lockstep.
  const phase = useMemo(
    () => ((from.position[0] + to.position[2]) * 0.13 + 1) % 1,
    [from, to]
  );

  useFrame(({ clock }) => {
    if (!reduced) {
      const material = ref.current?.material as
        | { dashOffset: number }
        | undefined;
      if (material) material.dashOffset -= 0.6 * 0.016;
    }
    if (pulseRef.current) {
      const frac = reduced ? 0.5 : (clock.elapsedTime * 0.12 + phase) % 1;
      pulseRef.current.position.lerpVectors(a, b, frac);
    }
  });

  return (
    <group>
      <Line
        ref={ref}
        points={[from.position, to.position]}
        color="#d8b65e"
        lineWidth={1}
        dashed
        dashSize={0.55}
        gapSize={0.4}
        transparent
        opacity={0.2}
        depthWrite={false}
      />
      {/* travelling "signal" pulse — bloom makes it glow */}
      <sprite ref={pulseRef} scale={[0.7, 0.7, 1]} raycast={NO_RAYCAST}>
        <spriteMaterial
          map={pulseMap}
          color="#ffe6a0"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
}
