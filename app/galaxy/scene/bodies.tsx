"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

import {
  getSystemBodies,
  type BodyKind,
  type StarSystemData,
} from "../data";
import {
  hashSeed,
  makeCloudTexture,
  makePlanetTexture,
  makeRadialTexture,
  type PlanetStyle,
} from "../textures";
import { useReducedMotion } from "../useReducedMotion";
import { mulberry32, NO_RAYCAST } from "./shared";

const PLANET_STYLES: PlanetStyle[] = [
  "terran",
  "rocky",
  "gas",
  "ice",
  "rocky",
  "gas",
  "terran",
];

export interface BodyConfig {
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

// Built once per system and kept for the session — revisiting a system reuses
// its body configs (and their canvas textures) instead of rebuilding them.
const bodyConfigCache = new Map<string, BodyConfig[]>();

function buildBodies(system: StarSystemData): BodyConfig[] {
  const cached = bodyConfigCache.get(system.id);
  if (cached) return cached;

  const bodies = getSystemBodies(system);
  const n = bodies.length;
  // Spread bodies across a fixed shell regardless of count, so a crowded
  // system still frames within the focused camera distance.
  const inner = system.size * 1.6 + 1.1;
  const span = 5.0;

  const configs = bodies.map((body, i) => {
    const kind = body.kind ?? "planet";
    const style = PLANET_STYLES[i % PLANET_STYLES.length];
    const seed = hashSeed(system.id + ":" + body.name);
    const rand = (k: number) => ((seed >>> (k * 3)) % 1000) / 1000;
    const planet = kind === "planet";
    const atmosphere = new THREE.Color(body.color)
      .lerp(new THREE.Color("#ffffff"), 0.5)
      .getStyle();
    const frac = n > 1 ? i / (n - 1) : 0;
    return {
      body,
      kind,
      seed,
      style,
      atmosphere,
      map: planet ? makePlanetTexture(body.color, seed, style) : null,
      clouds:
        planet && style === "terran" ? makeCloudTexture(seed + 17) : null,
      size: (body.synthetic ? 0.19 : 0.24) + (i % 3) * 0.06,
      radius: inner + frac * span + (rand(4) - 0.5) * 0.3,
      speed: 0.4 / (1 + i * 0.32),
      phase: i * 1.7,
      bob: (i % 2 === 0 ? 1 : -1) * (0.12 + (i % 3) * 0.08),
      spin: 0.12 + rand(1) * 0.25,
      axialTilt: (rand(2) - 0.5) * 0.7,
      ring: planet && style === "gas" && rand(3) > 0.45,
    };
  });

  bodyConfigCache.set(system.id, configs);
  return configs;
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
  const reduced = useReducedMotion();

  useEffect(() => () => glow.dispose(), [glow]);

  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime;
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

/** A single orbiting body: orbit motion, hover/select, label and hit target. */
function OrbitingBody({
  cfg,
  systemId,
  selected,
  isParty = false,
  onSelectPlanet,
}: {
  cfg: BodyConfig;
  systemId: string;
  selected: boolean;
  isParty?: boolean;
  onSelectPlanet: (systemId: string, bodyName: string) => void;
}) {
  const posRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const scaleRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion();

  const reach = cfg.size * BODY_REACH[cfg.kind];

  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime;
    const a = t * cfg.speed + cfg.phase;
    posRef.current?.position.set(
      Math.cos(a) * cfg.radius,
      Math.sin(a * 0.7) * cfg.bob,
      Math.sin(a) * cfg.radius
    );
    if (spinRef.current) spinRef.current.rotation.y = t * cfg.spin + cfg.phase;
    if (ringRef.current) {
      const pulse = reduced ? 1 : 1 + Math.sin(t * 3) * 0.06;
      ringRef.current.scale.setScalar(pulse);
    }
  });

  useEffect(() => {
    if (!scaleRef.current) return;
    const s = hovered || selected ? 1.28 : 1;
    gsap.to(scaleRef.current.scale, {
      x: s,
      y: s,
      z: s,
      duration: reduced ? 0 : 0.2,
    });
  }, [hovered, selected, reduced]);

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
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
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

      {isParty && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[reach * 1.5, reach * 1.78, 48]} />
            <meshBasicMaterial
              color="#7fe0ff"
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <Html center position={[0, reach + 1.15, 0]} zIndexRange={[24, 0]}>
            <div className="pointer-events-none select-none whitespace-nowrap rounded-full border border-cyan/60 bg-bg/85 px-2.5 py-0.5 backdrop-blur-sm">
              <span className="font-mono text-[10px] font-medium tracking-[0.2em] text-cyan">
                ◆ THE PARTY
              </span>
            </div>
          </Html>
        </>
      )}

      {(hovered || selected) && (
        <Html center position={[0, reach + 0.6, 0]} zIndexRange={[20, 0]}>
          <div
            className="pointer-events-none select-none whitespace-nowrap rounded border border-accent/40 bg-bg/85 px-2 py-1 backdrop-blur-sm"
            style={{ boxShadow: "0 0 10px var(--glow)" }}
          >
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
              {cfg.body.name.toUpperCase()}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

export function OrbitingPlanets({
  system,
  selectedPlanet,
  partyBody,
  onSelectPlanet,
}: {
  system: StarSystemData;
  selectedPlanet: string | null;
  partyBody?: string | null;
  onSelectPlanet: (systemId: string, bodyName: string) => void;
}) {
  // Cached per system (see buildBodies) so textures persist and aren't
  // rebuilt each time the system is revisited.
  const planets = useMemo(() => buildBodies(system), [system]);

  return (
    <group>
      {/* faint orbital paths — reads as a cartographer's diagram */}
      {planets.map((cfg) => (
        <mesh key={cfg.body.name + "-orbit"} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[cfg.radius - 0.012, cfg.radius + 0.012, 128]} />
          <meshBasicMaterial
            color="#c9a84c"
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}

      {planets.map((cfg) => (
        <OrbitingBody
          key={cfg.body.name}
          cfg={cfg}
          systemId={system.id}
          selected={selectedPlanet === cfg.body.name}
          isParty={partyBody === cfg.body.name}
          onSelectPlanet={onSelectPlanet}
        />
      ))}
    </group>
  );
}
