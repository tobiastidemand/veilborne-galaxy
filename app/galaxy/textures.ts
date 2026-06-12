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
