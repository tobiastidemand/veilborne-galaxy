// Deterministic PRNG so generated layouts and surfaces stay stable across
// re-renders (starfield, derelict clusters, fragment shards, body tuning).
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Decorative meshes/sprites (coronas, nebula, halos) must never intercept
// pointer events — otherwise they steal clicks meant for stars and planets.
export const NO_RAYCAST = () => null;
