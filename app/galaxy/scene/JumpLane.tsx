"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Line2 } from "three-stdlib";

import type { StarSystemData } from "../data";
import { useReducedMotion } from "../useReducedMotion";

export function JumpLane({
  from,
  to,
}: {
  from: StarSystemData;
  to: StarSystemData;
}) {
  const ref = useRef<Line2>(null);
  const reduced = useReducedMotion();

  useFrame((_, delta) => {
    if (reduced) return;
    const material = ref.current?.material as
      | { dashOffset: number }
      | undefined;
    if (material) material.dashOffset -= delta * 0.6;
  });

  return (
    <Line
      ref={ref}
      points={[from.position, to.position]}
      color="#c9a84c"
      lineWidth={1}
      dashed
      dashSize={0.55}
      gapSize={0.4}
      transparent
      opacity={0.15}
      depthWrite={false}
    />
  );
}
