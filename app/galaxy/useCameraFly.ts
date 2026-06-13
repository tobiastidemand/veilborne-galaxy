"use client";

import { useCallback, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export const HOME_CAMERA: [number, number, number] = [0, 20, 48];
export const HOME_TARGET: [number, number, number] = [0, 0, 0];

/**
 * GSAP-driven camera flights between the wide galaxy view and individual
 * systems. Tweens both the camera position and the OrbitControls target.
 * When `reducedMotion` is set, flights snap instantly.
 */
export function useCameraFly(
  controlsRef: React.RefObject<OrbitControlsImpl | null>,
  reducedMotion = false
) {
  const camera = useThree((state) => state.camera);
  const tweensRef = useRef<gsap.core.Tween[]>([]);
  const FLY = {
    duration: reducedMotion ? 0 : 1.8,
    ease: "power3.inOut",
  } as const;

  const kill = () => {
    tweensRef.current.forEach((t) => t.kill());
    tweensRef.current = [];
  };

  const flyTo = useCallback(
    (position: [number, number, number], size: number, onArrive?: () => void) => {
      const controls = controlsRef.current;
      if (!controls) return;
      kill();

      const target = new THREE.Vector3(...position);
      // Far enough to frame a system's full (possibly crowded) body shell.
      const distance = Math.min(15, Math.max(10.5, size * 4 + 7.5));
      const dir = camera.position.clone().sub(target);
      if (dir.lengthSq() < 0.001) dir.set(0, 0.4, 1);
      dir.normalize();
      const end = target
        .clone()
        .add(dir.multiplyScalar(distance))
        .add(new THREE.Vector3(0, distance * 0.22, 0));

      tweensRef.current = [
        gsap.to(camera.position, {
          x: end.x,
          y: end.y,
          z: end.z,
          ...FLY,
          onUpdate: () => controls.update(),
          onComplete: onArrive,
        }),
        gsap.to(controls.target, { x: target.x, y: target.y, z: target.z, ...FLY }),
      ];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [camera, controlsRef, reducedMotion]
  );

  const flyHome = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    kill();
    tweensRef.current = [
      gsap.to(camera.position, {
        x: HOME_CAMERA[0],
        y: HOME_CAMERA[1],
        z: HOME_CAMERA[2],
        ...FLY,
        onUpdate: () => controls.update(),
      }),
      gsap.to(controls.target, {
        x: HOME_TARGET[0],
        y: HOME_TARGET[1],
        z: HOME_TARGET[2],
        ...FLY,
      }),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, controlsRef, reducedMotion]);

  return { flyTo, flyHome };
}
