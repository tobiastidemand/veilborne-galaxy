"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useReducedMotion } from "../useReducedMotion";

const VERT = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying vec3 vPos;

  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(dot(hash3(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
                       dot(hash3(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
                   mix(dot(hash3(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
                       dot(hash3(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
               mix(mix(dot(hash3(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
                       dot(hash3(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
                   mix(dot(hash3(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
                       dot(hash3(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.0 + 5.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = normalize(vPos);
    float t = uTime * 0.06;
    float base = fbm(p * 2.2 + vec3(t, t * 0.6, -t));
    float gran = fbm(p * 6.5 - vec3(t * 1.3));
    float h = 0.55 + 0.6 * base + 0.3 * gran;
    vec3 col = mix(uColor * 0.55, uHot, smoothstep(0.35, 1.15, h));
    col *= 1.0 + 0.35 * max(gran, 0.0);
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** A star sphere with an animated procedural plasma/granulation surface. */
export function StarMesh({ color, radius }: { color: string; radius: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const reduced = useReducedMotion();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uHot: { value: new THREE.Color(color).lerp(new THREE.Color("#fff6e8"), 0.65) },
    }),
    [color]
  );

  useFrame((_, delta) => {
    if (!reduced && matRef.current) matRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        toneMapped={false}
      />
    </mesh>
  );
}
