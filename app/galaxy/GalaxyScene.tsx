"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Html, Line, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import type { OrbitControls as OrbitControlsImpl, Line2 } from "three-stdlib";

import {
  CHAIN_MARKER,
  JUMP_LANES,
  SYSTEMS,
  systemById,
  type BodyKind,
  type StarSystemData,
} from "./data";
import {
  hashSeed,
  makeCloudTexture,
  makePlanetTexture,
  makeRadialTexture,
  makeRingTexture,
  type PlanetStyle,
} from "./textures";
import { useCameraFly } from "./useCameraFly";

const IDLE_RESUME_MS = 5000;

// Decorative meshes/sprites (coronas, nebula, halos) must never intercept
// pointer events — otherwise they steal clicks meant for stars and planets.
const NO_RAYCAST = () => null;

/* ------------------------------------------------------------------ */
/* Background                                                          */
/* ------------------------------------------------------------------ */

// Deterministic PRNG so the starfield is stable across re-renders.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function StarfieldExtra() {
  // Three layers of points for brightness variety on top of <Stars>. They live
  // on a far shell (well beyond the max zoom-out distance) and use a constant
  // pixel size, so they never resolve into chunky foreground blobs.
  const layers = useMemo(() => {
    const rand = mulberry32(0x7e11b04e);
    const make = (count: number, rMin: number, rMax: number) => {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const v = new THREE.Vector3(
          rand() - 0.5,
          rand() - 0.5,
          rand() - 0.5
        )
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

function NebulaGlow() {
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

/* ------------------------------------------------------------------ */
/* Jump lanes                                                          */
/* ------------------------------------------------------------------ */

function JumpLane({ from, to }: { from: StarSystemData; to: StarSystemData }) {
  const ref = useRef<Line2>(null);

  useFrame((_, delta) => {
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

/* ------------------------------------------------------------------ */
/* Star systems                                                        */
/* ------------------------------------------------------------------ */

const PLANET_STYLES: PlanetStyle[] = [
  "terran",
  "rocky",
  "gas",
  "ice",
  "rocky",
  "gas",
  "terran",
];

interface BodyConfig {
  body: StarSystemData["bodies"][number];
  kind: BodyKind;
  seed: number;
  style: PlanetStyle;
  map: THREE.CanvasTexture | null;
  clouds: THREE.CanvasTexture | null;
  atmosphere: string;
  size: number;
  radius: number;
  speed: number;
  phase: number;
  bob: number;
  spin: number;
  axialTilt: number;
  ring: boolean;
}

// Rough visual radius (in units of cfg.size) per body kind, for sizing the
// hit target, selection ring and label.
const BODY_REACH: Record<BodyKind, number> = {
  planet: 1.2,
  station: 2.0,
  derelict: 1.9,
  fragment: 1.45,
  mirror: 1.2,
  anomaly: 1.35,
};

function buildBodies(system: StarSystemData): BodyConfig[] {
  return system.bodies.slice(0, 7).map((body, i) => {
    const kind = body.kind ?? "planet";
    const style = PLANET_STYLES[i % PLANET_STYLES.length];
    const seed = hashSeed(system.id + ":" + body.name);
    const rand = (n: number) => ((seed >>> (n * 3)) % 1000) / 1000;
    const isPlanet = kind === "planet";
    const atmosphere = new THREE.Color(body.color)
      .lerp(new THREE.Color("#ffffff"), 0.5)
      .getStyle();
    return {
      body,
      kind,
      seed,
      style,
      atmosphere,
      map: isPlanet ? makePlanetTexture(body.color, seed, style) : null,
      clouds:
        isPlanet && style === "terran" ? makeCloudTexture(seed + 17) : null,
      size: 0.24 + (i % 3) * 0.07,
      radius: system.size * 2.1 + 1.4 + i * 1.3,
      speed: 0.4 / (1 + i * 0.32),
      phase: i * 1.7,
      bob: (i % 2 === 0 ? 1 : -1) * 0.12 * i,
      spin: 0.12 + rand(1) * 0.25,
      axialTilt: (rand(2) - 0.5) * 0.7,
      ring: isPlanet && style === "gas" && rand(3) > 0.45,
    };
  });
}

/* --- per-kind 3D models ------------------------------------------- */

function PlanetModel({ cfg }: { cfg: BodyConfig }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[cfg.size, 32, 32]} />
        <meshStandardMaterial
          map={cfg.map}
          emissive={cfg.body.color}
          emissiveIntensity={0.06}
          roughness={cfg.style === "gas" ? 0.95 : 0.85}
          metalness={cfg.style === "ice" ? 0.1 : 0}
        />
      </mesh>

      {cfg.clouds && (
        <mesh scale={1.03}>
          <sphereGeometry args={[cfg.size, 32, 32]} />
          <meshStandardMaterial
            map={cfg.clouds}
            transparent
            opacity={0.85}
            depthWrite={false}
            roughness={1}
          />
        </mesh>
      )}

      {/* atmospheric rim glow (back-side additive shell) */}
      <mesh scale={1.18}>
        <sphereGeometry args={[cfg.size, 24, 24]} />
        <meshBasicMaterial
          color={cfg.atmosphere}
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {cfg.ring && (
        <group rotation={[Math.PI / 2.05, 0, 0]}>
          <mesh>
            <ringGeometry args={[cfg.size * 1.5, cfg.size * 2.35, 56]} />
            <meshBasicMaterial
              color={cfg.atmosphere}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[cfg.size * 1.42, cfg.size * 1.5, 56]} />
            <meshBasicMaterial
              color={cfg.body.color}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** Artificial structure: central hub, habitat ring, solar panels, antenna. */
function StationModel({ cfg }: { cfg: BodyConfig }) {
  const s = cfg.size;
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[s * 0.32, s * 0.32, s * 1.5, 12]} />
        <meshStandardMaterial color="#b9c2cf" metalness={0.85} roughness={0.35} />
      </mesh>
      {/* habitat ring + glowing window band */}
      <mesh>
        <torusGeometry args={[s * 1.05, s * 0.14, 10, 28]} />
        <meshStandardMaterial color="#9aa6b6" metalness={0.85} roughness={0.4} />
      </mesh>
      <mesh>
        <torusGeometry args={[s * 1.05, s * 0.05, 8, 28]} />
        <meshBasicMaterial color={cfg.body.color} />
      </mesh>
      {/* solar panels + strut */}
      {[1, -1].map((dir) => (
        <mesh key={dir} position={[dir * s * 1.5, 0, 0]}>
          <boxGeometry args={[s * 1.1, s * 0.03, s * 0.55]} />
          <meshStandardMaterial
            color="#1e2c46"
            emissive="#2c4a7a"
            emissiveIntensity={0.35}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[s * 0.05, s * 0.05, s * 3, 6]} />
        <meshStandardMaterial color="#8893a3" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* antenna mast + beacon light */}
      <mesh position={[0, s * 0.95, 0]}>
        <cylinderGeometry args={[s * 0.03, s * 0.03, s * 0.7, 6]} />
        <meshStandardMaterial color="#8893a3" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, s * 1.35, 0]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshBasicMaterial color={cfg.body.color} />
      </mesh>
    </group>
  );
}

/** A drifting graveyard of dead ship hulls. */
function DerelictModel({ cfg }: { cfg: BodyConfig }) {
  const hulls = useMemo(() => {
    const rand = mulberry32(cfg.seed + 5);
    return Array.from({ length: 16 }, () => {
      const dir = new THREE.Vector3(
        rand() - 0.5,
        rand() - 0.5,
        rand() - 0.5
      ).normalize();
      const dist = cfg.size * (0.3 + rand() * 1.5);
      return {
        pos: dir.multiplyScalar(dist).toArray() as [number, number, number],
        rot: [rand() * 6.28, rand() * 6.28, rand() * 6.28] as [
          number,
          number,
          number,
        ],
        len: cfg.size * (0.25 + rand() * 0.5),
        w: cfg.size * (0.06 + rand() * 0.1),
        lit: rand() > 0.82,
        shade: 0.35 + rand() * 0.4,
      };
    });
  }, [cfg.seed, cfg.size]);

  return (
    <group>
      {hulls.map((h, i) => (
        <mesh key={i} position={h.pos} rotation={h.rot}>
          <boxGeometry args={[h.w, h.w, h.len]} />
          <meshStandardMaterial
            color={new THREE.Color(0.5, 0.55, 0.62).multiplyScalar(h.shade)}
            metalness={0.6}
            roughness={0.7}
            emissive={h.lit ? "#88bbff" : "#000000"}
            emissiveIntensity={h.lit ? 0.6 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

/** A jagged broken chunk with a faint arcane glow, trailing debris. */
function FragmentModel({ cfg }: { cfg: BodyConfig }) {
  const shards = useMemo(() => {
    const rand = mulberry32(cfg.seed + 9);
    return Array.from({ length: 3 }, () => ({
      pos: [
        (rand() - 0.5) * cfg.size * 2.4,
        (rand() - 0.5) * cfg.size * 2.4,
        (rand() - 0.5) * cfg.size * 2.4,
      ] as [number, number, number],
      rot: [rand() * 6.28, rand() * 6.28, rand() * 6.28] as [
        number,
        number,
        number,
      ],
      r: cfg.size * (0.15 + rand() * 0.22),
    }));
  }, [cfg.seed, cfg.size]);

  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[cfg.size, 0]} />
        <meshStandardMaterial
          color="#3b2d3e"
          flatShading
          roughness={0.95}
          metalness={0.1}
          emissive="#a23fb0"
          emissiveIntensity={0.22}
        />
      </mesh>
      {shards.map((sh, i) => (
        <mesh key={i} position={sh.pos} rotation={sh.rot}>
          <icosahedronGeometry args={[sh.r, 0]} />
          <meshStandardMaterial
            color="#33283a"
            flatShading
            roughness={0.95}
            emissive="#a23fb0"
            emissiveIntensity={0.18}
          />
        </mesh>
      ))}
    </group>
  );
}

/** A polished chrome orb — origins unknown. */
function MirrorModel({ cfg }: { cfg: BodyConfig }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[cfg.size, 48, 48]} />
        <meshStandardMaterial
          color="#e8edf5"
          metalness={1}
          roughness={0.06}
          emissive="#2a3550"
          emissiveIntensity={0.18}
        />
      </mesh>
      <mesh scale={1.12}>
        <sphereGeometry args={[cfg.size, 24, 24]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** A bodiless energy phenomenon — pulsing, additive, no solid surface. */
function AnomalyModel({ cfg }: { cfg: BodyConfig }) {
  const pulseRef = useRef<THREE.Group>(null);
  const glow = useMemo(() => makeRadialTexture(cfg.body.color, 1), [cfg.body.color]);

  useEffect(() => () => glow.dispose(), [glow]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = 1 + Math.sin(t * 1.6 + cfg.phase) * 0.12;
    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(p);
      pulseRef.current.rotation.x = t * 0.4;
    }
  });

  return (
    <group>
      <sprite scale={[cfg.size * 4.2, cfg.size * 4.2, 1]} raycast={NO_RAYCAST}>
        <spriteMaterial
          map={glow}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <group ref={pulseRef}>
        <mesh>
          <icosahedronGeometry args={[cfg.size * 0.85, 1]} />
          <meshBasicMaterial
            color={cfg.body.color}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[cfg.size * 1.08, 1]} />
          <meshBasicMaterial
            color={cfg.body.color}
            wireframe
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

function BodyModel({ cfg }: { cfg: BodyConfig }) {
  switch (cfg.kind) {
    case "station":
      return <StationModel cfg={cfg} />;
    case "derelict":
      return <DerelictModel cfg={cfg} />;
    case "fragment":
      return <FragmentModel cfg={cfg} />;
    case "mirror":
      return <MirrorModel cfg={cfg} />;
    case "anomaly":
      return <AnomalyModel cfg={cfg} />;
    default:
      return <PlanetModel cfg={cfg} />;
  }
}

function Planet({
  cfg,
  systemId,
  selected,
  onSelectPlanet,
}: {
  cfg: BodyConfig;
  systemId: string;
  selected: boolean;
  onSelectPlanet: (systemId: string, bodyName: string) => void;
}) {
  const posRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const scaleRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const reach = cfg.size * BODY_REACH[cfg.kind];

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const a = t * cfg.speed + cfg.phase;
    posRef.current?.position.set(
      Math.cos(a) * cfg.radius,
      Math.sin(a * 0.7) * cfg.bob,
      Math.sin(a) * cfg.radius
    );
    if (spinRef.current) spinRef.current.rotation.y = t * cfg.spin + cfg.phase;
  });

  useEffect(() => {
    if (!scaleRef.current) return;
    const s = hovered || selected ? 1.28 : 1;
    gsap.to(scaleRef.current.scale, { x: s, y: s, z: s, duration: 0.2 });
  }, [hovered, selected]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  return (
    <group ref={posRef}>
      <group ref={scaleRef} rotation={[0, 0, cfg.axialTilt]}>
        <group ref={spinRef}>
          <BodyModel cfg={cfg} />
        </group>
      </group>

      {/* generous transparent hit target — bodies are small on screen */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectPlanet(systemId, cfg.body.name);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[Math.max(reach * 1.3, 0.6), 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[reach * 1.45, reach * 1.7, 48]} />
          <meshBasicMaterial
            color="#f0d080"
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {(hovered || selected) && (
        <Html
          center
          position={[0, reach + 0.6, 0]}
          zIndexRange={[20, 0]}
        >
          <div className="pointer-events-none select-none whitespace-nowrap rounded border border-[#c9a84c]/40 bg-[#07051a]/90 px-2 py-1 backdrop-blur-sm">
            <span className="font-display text-[11px] font-bold tracking-[0.18em] text-[#f0d080]">
              {cfg.body.name.toUpperCase()}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

function OrbitingPlanets({
  system,
  selectedPlanet,
  onSelectPlanet,
}: {
  system: StarSystemData;
  selectedPlanet: string | null;
  onSelectPlanet: (systemId: string, bodyName: string) => void;
}) {
  const planets = useMemo(() => buildBodies(system), [system]);

  // Free the per-body canvas textures when the focused system changes.
  useEffect(
    () => () => {
      planets.forEach((p) => {
        p.map?.dispose();
        p.clouds?.dispose();
      });
    },
    [planets]
  );

  return (
    <group>
      {planets.map((cfg) => (
        <Planet
          key={cfg.body.name}
          cfg={cfg}
          systemId={system.id}
          selected={selectedPlanet === cfg.body.name}
          onSelectPlanet={onSelectPlanet}
        />
      ))}
    </group>
  );
}

function CoronaSprite({
  color,
  scale,
  opacity = 0.8,
}: {
  color: string;
  scale: number;
  opacity?: number;
}) {
  const map = useMemo(() => makeRadialTexture(color, 1), [color]);
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

  useFrame((_, delta) => {
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
      <pointLight color="#cc44ff" intensity={18} distance={26} />
    </group>
  );
}

function PulsarBeam({ system }: { system: StarSystemData }) {
  const beamRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (beamRef.current) beamRef.current.rotation.y = clock.elapsedTime * 0.7;
  });

  return (
    <group ref={beamRef} rotation={[0.25, 0, 0.18]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 34, 8, 1, true]} />
        <meshBasicMaterial
          color={system.color}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 34, 8, 1, true]} />
        <meshBasicMaterial
          color={system.color}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function BinaryPair({ system }: { system: StarSystemData }) {
  const aRef = useRef<THREE.Mesh>(null);
  const bRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const a = clock.elapsedTime * 0.5;
    const r = system.size * 0.75;
    aRef.current?.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    bRef.current?.position.set(-Math.cos(a) * r, 0, -Math.sin(a) * r);
  });

  return (
    <group>
      <mesh ref={aRef}>
        <sphereGeometry args={[system.size * 0.55, 32, 32]} />
        <meshBasicMaterial color="#ffaa44" />
      </mesh>
      <mesh ref={bRef}>
        <sphereGeometry args={[system.size * 0.42, 32, 32]} />
        <meshBasicMaterial color="#ff8855" />
      </mesh>
    </group>
  );
}

function StarSystem({
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
  const phase = useMemo(() => system.position[0] * 1.3 + system.position[2], [system]);

  const marker = CHAIN_MARKER[system.chain.level];
  const isBlackHole = system.kind === "blackhole";

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
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
    gsap.to(coreRef.current.scale, { x: s, y: s, z: s, duration: 0.2 });
  }, [hovered]);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  return (
    <group
      ref={groupRef}
      position={system.position}
    >
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
              <mesh>
                <sphereGeometry args={[system.size * 0.65, 48, 48]} />
                <meshBasicMaterial color={system.color} />
              </mesh>
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

      {marker && (
        <Billboard position={[0, system.size * 1.4 + 1.1, 0]}>
          <Html center transform={false} zIndexRange={[10, 0]}>
            <div
              className="pointer-events-none select-none text-[15px] leading-none drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]"
              style={{ color: marker.color, opacity: marker.opacity }}
              title={`Aureate Chain: ${system.chain.level}`}
            >
              ⛓
            </div>
          </Html>
        </Billboard>
      )}

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

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export default function GalaxyScene({
  focusSystemId,
  selectedPlanet,
  flightNonce,
  onSelectSystem,
  onSelectPlanet,
  onArrive,
}: {
  focusSystemId: string | null;
  selectedPlanet: string | null;
  flightNonce: number;
  onSelectSystem: (id: string) => void;
  onSelectPlanet: (systemId: string, bodyName: string) => void;
  onArrive: (id: string) => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const lastInteraction = useRef(0);
  const { flyTo, flyHome } = useCameraFly(controlsRef);
  const firstFlight = useRef(true);

  // Drive the camera off `flightNonce` so re-selecting the same system still
  // re-flies (and re-opens its panel). `focusSystemId` only ever changes in
  // lockstep with the nonce, so including it never triggers a stray flight.
  useEffect(() => {
    if (firstFlight.current) {
      firstFlight.current = false;
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

  const lanes = useMemo(
    () =>
      JUMP_LANES.map(([a, b]) => ({
        from: systemById(a),
        to: systemById(b),
        key: `${a}->${b}`,
      })),
    []
  );

  return (
    <>
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

      {lanes.map((lane) => (
        <JumpLane key={lane.key} from={lane.from} to={lane.to} />
      ))}

      {SYSTEMS.map((system) => (
        <StarSystem
          key={system.id}
          system={system}
          focused={focusSystemId === system.id}
          selectedPlanet={selectedPlanet}
          onSelectSystem={onSelectSystem}
          onSelectPlanet={onSelectPlanet}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
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
    </>
  );
}
