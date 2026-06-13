import * as THREE from "three";

/**
 * Soft radial gradient disc — used for star coronas, nebula plumes and halos.
 * Client-only (uses a canvas element).
 */
export function makeRadialTexture(
  color: string,
  innerAlpha = 1,
  size = 256
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  const c = new THREE.Color(color);
  const rgb = `${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(
    c.b * 255
  )}`;
  grad.addColorStop(0, `rgba(${rgb},${innerAlpha})`);
  grad.addColorStop(0.25, `rgba(${rgb},${innerAlpha * 0.45})`);
  grad.addColorStop(0.6, `rgba(${rgb},${innerAlpha * 0.12})`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* ------------------------------------------------------------------ */
/* Procedural planet surfaces                                         */
/* ------------------------------------------------------------------ */

export type PlanetStyle = "terran" | "rocky" | "gas" | "ice";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable integer seed from a string (so each body's surface is deterministic). */
export function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Upscale a low-res random-noise canvas with smoothing → soft fbm-like blotches. */
function stampNoise(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  cells: number,
  alpha: number,
  op: GlobalCompositeOperation
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const nW = cells;
  const nH = Math.max(2, Math.floor(cells / 2));
  const nc = document.createElement("canvas");
  nc.width = nW;
  nc.height = nH;
  const nx = nc.getContext("2d")!;
  const img = nx.createImageData(nW, nH);
  for (let i = 0; i < nW * nH; i++) {
    const v = Math.floor(rand() * 255);
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  nx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = op;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(nc, 0, 0, w, h);
  ctx.restore();
}

/**
 * Equirectangular surface map for a small planet. The base colour comes from
 * the body data; layered value-noise plus style-specific features (bands,
 * craters, ice caps) give it a believable, varied surface.
 */
export function makePlanetTexture(
  color: string,
  seed: number,
  style: PlanetStyle
): THREE.CanvasTexture {
  const W = 256;
  const H = 128;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const rand = mulberry32(seed);

  const base = new THREE.Color(color);
  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, W, H);

  // Broad continents / cloud masses down to fine mottling.
  stampNoise(ctx, rand, 8, 0.55, "overlay");
  stampNoise(ctx, rand, 20, 0.4, "overlay");
  stampNoise(ctx, rand, 56, 0.22, "soft-light");

  if (style === "gas") {
    const bands = 7 + Math.floor(rand() * 6);
    for (let i = 0; i < bands; i++) {
      const y = (i / bands) * H;
      const lighten = rand() > 0.5;
      ctx.save();
      ctx.globalCompositeOperation = "soft-light";
      ctx.globalAlpha = 0.35 + rand() * 0.3;
      ctx.fillStyle = lighten ? "#ffffff" : "#000000";
      ctx.fillRect(0, y, W, (H / bands) * (0.7 + rand() * 0.5));
      ctx.restore();
    }
    // turbulent swirl on top of the bands
    stampNoise(ctx, rand, 90, 0.12, "overlay");
  }

  if (style === "ice") {
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H * (0.12 + rand() * 0.08));
    ctx.fillRect(0, H * (0.82 - rand() * 0.08), W, H);
    ctx.restore();
    stampNoise(ctx, rand, 40, 0.15, "overlay");
  }

  if (style === "rocky") {
    const craters = 14 + Math.floor(rand() * 18);
    for (let i = 0; i < craters; i++) {
      const x = rand() * W;
      const y = rand() * H;
      const r = 1.5 + rand() * 5;
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Sparse white cloud wisps on a transparent backdrop, for the overlay shell of
 * habitable worlds.
 */
export function makeCloudTexture(seed: number): THREE.CanvasTexture {
  const W = 256;
  const H = 128;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const rand = mulberry32(seed);

  const puffs = 26 + Math.floor(rand() * 16);
  for (let i = 0; i < puffs; i++) {
    const x = rand() * W;
    const y = H * (0.12 + rand() * 0.76);
    const r = 6 + rand() * 22;
    const a = 0.12 + rand() * 0.25;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(255,255,255,${a})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Lengthwise gradient for a pulsar beam: bright at the base (the star) and
 * fading to nothing toward the tip, so a cone reads as a soft tapering ray.
 */
export function makeBeamTexture(color: string): THREE.CanvasTexture {
  const w = 4;
  const h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const c = new THREE.Color(color);
  const rgb = `${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(
    c.b * 255
  )}`;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  // canvas bottom maps to v=0 (the cone base / star end) with flipY
  grad.addColorStop(0, `rgba(${rgb},0)`); // tip — transparent
  grad.addColorStop(0.4, `rgba(${rgb},0.22)`);
  grad.addColorStop(1, `rgba(${rgb},0.95)`); // base — bright
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Hollow ring gradient — the lens-distortion style halo around the black hole.
 */
export function makeRingTexture(color: string, size = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  const c = new THREE.Color(color);
  const rgb = `${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(
    c.b * 255
  )}`;
  grad.addColorStop(0, `rgba(${rgb},0)`);
  grad.addColorStop(0.38, `rgba(${rgb},0)`);
  grad.addColorStop(0.5, `rgba(${rgb},0.55)`);
  grad.addColorStop(0.62, `rgba(${rgb},0.12)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
