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
  type StarSystemData,
} from "./data";
import { makeRadialTexture, makeRingTexture } from "./textures";
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
  // Three layers of points for size/brightness variety on top of <Stars>.
  const layers = useMemo(() => {
    const rand = mulberry32(0x7e11b04e);
    const make = (count: number, radius: number) => {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const v = new THREE.Vector3(
          (rand() - 0.5) * 2,
          (rand() - 0.5) * 2,
          (rand() - 0.5) * 2
        )
          .normalize()
          .multiplyScalar(radius * (0.5 + rand() * 0.5));
        positions.set([v.x, v.y, v.z], i * 3);
      }
      return positions;
    };
    return [
      { positions: make(1400, 170), size: 0.32, opacity: 0.35, color: "#aab4ff" },
      { positions: make(700, 150), size: 0.55, opacity: 0.55, color: "#ffffff" },
      { positions: make(220, 130), size: 0.95, opacity: 0.85, color: "#fff3d6" },
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
            sizeAttenuation
            depthWrite={false}
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

function OrbitingPlanets({
  system,
  selectedPlanet,
  onSelectPlanet,
}: {
  system: StarSystemData;
  selectedPlanet: string | null;
  onSelectPlanet: (systemId: string, bodyName: string) => void;
}) {
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const orbits = useMemo(
    () =>
      system.bodies.slice(0, 7).map((body, i) => ({
        body,
        radius: system.size * 2.1 + 1.1 + i * 1.15,
        speed: 0.45 / (1 + i * 0.35),
        phase: i * 1.7,
        tilt: (i % 2 === 0 ? 1 : -1) * 0.12 * i,
        size: 0.16 + (i % 3) * 0.08,
      })),
    [system]
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    orbits.forEach((o, i) => {
      const g = groupRefs.current[i];
      if (!g) return;
      const a = t * o.speed + o.phase;
      g.position.set(
        Math.cos(a) * o.radius,
        Math.sin(a * 0.7) * o.tilt,
        Math.sin(a) * o.radius
      );
    });
  });

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  return (
    <group>
      {orbits.map((o, i) => {
        const isSelected = selectedPlanet === o.body.name;
        const isHovered = hovered === o.body.name;
        const enter = (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          setHovered(o.body.name);
        };
        const leave = () =>
          setHovered((prev) => (prev === o.body.name ? null : prev));
        const select = (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          onSelectPlanet(system.id, o.body.name);
        };
        return (
          <group
            key={o.body.name}
            ref={(el) => {
              groupRefs.current[i] = el;
            }}
          >
            <mesh scale={isSelected || isHovered ? 1.5 : 1}>
              <sphereGeometry args={[o.size, 16, 16]} />
              <meshStandardMaterial
                color={o.body.color}
                emissive={o.body.color}
                emissiveIntensity={isSelected ? 0.8 : isHovered ? 0.5 : 0.25}
                roughness={0.7}
              />
            </mesh>

            {/* generous transparent hit target — planets are small on screen */}
            <mesh
              onClick={select}
              onPointerOver={enter}
              onPointerOut={leave}
            >
              <sphereGeometry args={[Math.max(o.size * 2.6, 0.55), 12, 12]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {isSelected && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[o.size * 1.7, o.size * 2.05, 40]} />
                <meshBasicMaterial
                  color="#f0d080"
                  transparent
                  opacity={0.85}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                />
              </mesh>
            )}

            {(isHovered || isSelected) && (
              <Html
                center
                position={[0, Math.max(o.size, 0.3) + 0.55, 0]}
                zIndexRange={[20, 0]}
              >
                <div className="pointer-events-none select-none whitespace-nowrap rounded border border-[#c9a84c]/40 bg-[#07051a]/90 px-2 py-1 backdrop-blur-sm">
                  <span className="font-display text-[11px] font-bold tracking-[0.18em] text-[#f0d080]">
                    {o.body.name.toUpperCase()}
                  </span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
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
        radius={120}
        depth={60}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={0.4}
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
