"use client";

import { useMemo } from "react";
import * as THREE from "three";

import { makeNebulaTexture } from "../textures";
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
      purple: makeNebulaTexture("#2a0b52", 0x51a1),
      blue: makeNebulaTexture("#0d2a52", 0x9c2f),
      magenta: makeNebulaTexture("#5a103f", 0x33b7),
      band: makeNebulaTexture("#241046", 0x7e10),
    }),
    []
  );

  const plumes: {
    map: THREE.Texture;
    position: [number, number, number];
    scale: [number, number];
    opacity: number;
  }[] = [
    { map: textures.purple, position: [0, -4, -55], scale: [150, 150], opacity: 0.6 },
    { map: textures.blue, position: [-32, 10, -68], scale: [110, 110], opacity: 0.55 },
    { map: textures.magenta, position: [30, -8, -62], scale: [100, 100], opacity: 0.5 },
    { map: textures.purple, position: [20, 16, -74], scale: [86, 86], opacity: 0.42 },
    { map: textures.blue, position: [14, -18, -50], scale: [66, 66], opacity: 0.4 },
    { map: textures.magenta, position: [-24, -2, -46], scale: [60, 60], opacity: 0.34 },
  ];

  return (
    <>
      {/* far galaxy band, stretched across the void for depth */}
      <sprite
        position={[6, -6, -120]}
        scale={[420, 150, 1]}
        rotation={[0, 0, -0.32]}
        raycast={NO_RAYCAST}
      >
        <spriteMaterial
          map={textures.band}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {plumes.map((p, i) => (
        <sprite
          key={i}
          position={p.position}
          scale={[p.scale[0], p.scale[1], 1]}
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
