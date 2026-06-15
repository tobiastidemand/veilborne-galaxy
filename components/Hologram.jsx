"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Passthrough: the plane is authored directly in clip space (-1..1), so the
// camera is irrelevant — we never touch the projection matrix.
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Ported from the Shadertoy effect — logic unchanged. Runs as GLSL1 in R3F,
// so the sampler call in edgeSample uses texture2D().
const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float iTime;
  uniform vec2 iResolution;
  uniform sampler2D iChannel0;

  vec3 rgb2hsv(vec3 rgb)
  {
      float Cmax = max(rgb.r, max(rgb.g, rgb.b));
      float Cmin = min(rgb.r, min(rgb.g, rgb.b));
      float delta = Cmax - Cmin;
      vec3 hsv = vec3(0., 0., Cmax);
      if (Cmax > Cmin)
      {
          hsv.y = delta / Cmax;
          if (rgb.r == Cmax)
              hsv.x = (rgb.g - rgb.b) / delta;
          else
          {
              if (rgb.g == Cmax)
                  hsv.x = 2. + (rgb.b - rgb.r) / delta;
              else
                  hsv.x = 4. + (rgb.r - rgb.g) / delta;
          }
          hsv.x = fract(hsv.x / 6.);
      }
      return hsv;
  }
  float chromaKey(vec3 color)
  {
      vec3 backgroundColor = vec3(0.4706, 0.8235, 0.3922);
      vec3 weights = vec3(4., 1., 2.);
      vec3 hsv = rgb2hsv(color);
      vec3 target = rgb2hsv(backgroundColor);
      float dist = length(weights * (target - hsv));
      return 1. - clamp(3. * dist - 1.5, 0., 1.);
  }
  vec3 Scanline(vec3 color, vec2 uv)
  {
     float scanline = clamp( 0.95 + 0.05 * cos( 3.14 * ( uv.y + 0.008 * iTime ) * 240.0 * 1.0 ), 0.0, 1.0 );
     float grille = 0.85 + 0.15 * clamp( 1.5 * cos( 3.14 * uv.x * 640.0 * 1.0 ), 0.0, 1.0 );
     return color * scanline * grille * 1.2;
  }
  float rand(vec2 seed) {
      float dotResult = dot(seed.xy, vec2(12.9898,78.233));
      float sinv = sin(dotResult) * 43758.5453;
      return fract(sinv);
  }
  vec3 makeBlue(vec3 i)
  {
      return vec3(0.0, 0.0, (i.r + i.g + i.b)/3.0);
  }
  vec3 edgeSample(vec2 uv)
  {
    if(uv.x > 1.0) return vec3(0.0);
    if(uv.x < 0.0) return vec3(0.0);
    if(uv.y > 1.0) return vec3(0.0);
    if(uv.y < 0.0) return vec3(0.0);
    vec3 c = texture2D(iChannel0, clamp(uv,0.0,1.0)).rgb;
    float incrustation = chromaKey(c);
    c = mix(c, vec3(0.0), incrustation);
    return c;
  }
  vec3 a(vec2 uv, float y, vec2 emmitPoint)
  {
     uv -= emmitPoint;
     y -= emmitPoint.y;
     float ym = y;
     vec2 centre = vec2(0.0, y);
     vec2 scale = vec2(2.0, 2.0 * (0.5/y));
     vec2 n = (uv - centre)*scale * vec2(1.0,-1.0);
     vec2 n2 = vec2(n.x * (1.0/(1.0-n.y)), n.y);
     vec2 uv2 = n2 * vec2(1.0,-1.0) / scale + centre;
     uv2 += emmitPoint;
     y += emmitPoint.y;
     uv2.y = y;
     vec3 c = edgeSample(uv2);
     c *= clamp(((ym+0.2)-uv.y)/ym, 0.0, 1.0);
     return c;
  }
  void mainImage( out vec4 fragColor, in vec2 fragCoord )
  {
     vec2 uv = fragCoord.xy / iResolution.xy;
     // No 1.0-uv.y flip: keeps the clip upright AND drops the projection point
     // to the bottom so the beams fan UP from under the figure.
     // 2.14 (= 1.5 / 0.7) renders the hologram ~30% smaller than the original.
     uv = (uv - vec2(0.5,0.0)) * 2.14 + vec2(0.5,-0.5);
     vec2 uvFlicker = uv;
     uvFlicker.x += rand(vec2(0,uv.y)*(iTime)) * 0.005;
     uvFlicker.y += rand(vec2(0,uv.x)*(iTime)) * 0.005;
     vec3 c = vec3(0.0);
     float inc = 0.2;
     vec2 projectionPoint = vec2(0.0,-0.5);
     for(float i=0.0;i<=1.0;i += 0.2){
        c += a(uv, i, projectionPoint) * inc * 3.0;
     }
     c += Scanline(edgeSample(uvFlicker)*1.5, uv);
     fragColor = vec4(makeBlue(c), 1.0);
  }

  // Shadertoy shim: feed pixel coords (vUv * iResolution) into mainImage.
  void main() {
    vec4 col = vec4(0.0);
    mainImage(col, vUv * iResolution);
    gl_FragColor = col;
  }
`;

function HologramPlane({ src }) {
  const materialRef = useRef(null);
  const { size } = useThree();

  // Bare <video> element driving the texture. Muted + playsInline are required
  // for autoplay on mobile Safari.
  const video = useMemo(() => {
    const v = document.createElement("video");
    v.src = src;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.crossOrigin = "anonymous";
    v.preload = "auto";
    return v;
  }, [src]);

  const texture = useMemo(() => {
    const t = new THREE.VideoTexture(video);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  }, [video]);

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
      iChannel0: { value: texture },
    }),
    [texture]
  );

  // Autoplay; pause + dispose on unmount.
  useEffect(() => {
    video.play().catch(() => {});
    return () => {
      video.pause();
      texture.dispose();
    };
  }, [video, texture]);

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.iTime.value += delta;
    mat.uniforms.iResolution.value.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/**
 * Star Wars–style projected hologram: a green-screen clip, chroma-keyed,
 * tinted blue, CRT-scanlined and fanned into a translucent cone.
 *
 * `flat linear` keeps the renderer out of the way (no tone mapping, no colour
 * management) so the ported Shadertoy maths land exactly as written.
 */
export default function Hologram({ src = "/hologram.mp4", className }) {
  return (
    <Canvas flat linear dpr={[1, 2]} className={className}>
      <HologramPlane src={src} />
    </Canvas>
  );
}
