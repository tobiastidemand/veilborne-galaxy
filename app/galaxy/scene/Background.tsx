"use client";

import { useMemo } from "react";
import * as THREE from "three";

import { makeRadialTexture } from "../textures";
import { mulberry32, NO_RAYCAST } from "./shared";

export function StarfieldExtra() {
  // Three layers of points for brightness variety on top of <Stars>. They live
  // on a far shell (well beyond the max zoom-out distance) and use a constant
  // pixel size, so they never resolve into chunky foreground blobs.
  const layers = useMemo(() => {
    const rand = mulberry32(0x7e11b04e);
    const make = (count: number, rMin: number, rMax: number) => {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const v = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5)
          .normalize()
          .multiplyScalar(rMin + rand() * (rMax - rMin));
        positions.set([v.x, v.y, v.z], i * 3);
      }
      return positions;
    };
    return [
      { positions: make(1600, 200, 420), size: 1.1, opacity: 0.5, color: "#aab4ff" },
      { positions: make(800, 200, 360), size: 1.7, opacity: 0.7, color: "#ffffff" },
      { positions: make(260, 200, 320), size: 2.6, opacity: 0.95, color: "#fff3d6" },
    ];
  }, []);

  return (
    <>
      {layers.map((layer, i) => (
        <points key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[layer.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={layer.size}
            color={layer.color}
            transparent
            opacity={layer.opacity}
            sizeAttenuation={false}
            depthWrite={false}
            fog={false}
          />
        </points>
      ))}
    </>
  );
}

export function NebulaGlow() {
  const textures = useMemo(
    () => ({
      purple: makeRadialTexture("#1a0533", 1),
      blue: makeRadialTexture("#0d1f3c", 1),
      magenta: makeRadialTexture("#4d0e3c", 1),
    }),
    []
  );

  const plumes: {
    map: THREE.Texture;
    position: [number, number, number];
    scale: number;
    opacity: number;
  }[] = [
    { map: textures.purple, position: [0, -4, -55], scale: 130, opacity: 0.55 },
    { map: textures.blue, position: [-30, 10, -65], scale: 95, opacity: 0.5 },
    { map: textures.magenta, position: [28, -8, -60], scale: 90, opacity: 0.45 },
    { map: textures.purple, position: [18, 14, -70], scale: 75, opacity: 0.4 },
    { map: textures.blue, position: [12, -16, -50], scale: 60, opacity: 0.35 },
    { map: textures.magenta, position: [-22, -2, -48], scale: 55, opacity: 0.3 },
  ];

  return (
    <>
      {plumes.map((p, i) => (
        <sprite
          key={i}
          position={p.position}
          scale={[p.scale, p.scale, 1]}
          raycast={NO_RAYCAST}
        >
          <spriteMaterial
            map={p.map}
            transparent
            opacity={p.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </>
  );
}
