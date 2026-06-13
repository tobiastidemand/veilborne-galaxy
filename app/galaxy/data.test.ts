import { describe, expect, it } from "vitest";

import {
  CHAIN_MARKER,
  JUMP_LANES,
  SYSTEMS,
  THREAT_STYLE,
  getSystemBodies,
} from "./data";

const ids = new Set(SYSTEMS.map((s) => s.id));

describe("system data", () => {
  it("has unique system ids", () => {
    expect(ids.size).toBe(SYSTEMS.length);
  });

  it("every jump lane connects two real, distinct systems", () => {
    for (const [a, b] of JUMP_LANES) {
      expect(ids.has(a)).toBe(true);
      expect(ids.has(b)).toBe(true);
      expect(a).not.toBe(b);
    }
  });

  it("every system's chain level has a marker entry and a threat style", () => {
    for (const s of SYSTEMS) {
      expect(s.chain.level in CHAIN_MARKER).toBe(true);
      expect(THREAT_STYLE[s.threat]).toBeDefined();
    }
  });

  it("every named body has a name, colour and description", () => {
    for (const s of SYSTEMS) {
      for (const b of s.bodies) {
        expect(b.name.length).toBeGreaterThan(0);
        expect(b.color).toMatch(/^#[0-9a-fA-F]{3,8}$/);
        expect(b.description.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("getSystemBodies padding", () => {
  it("pads each system to exactly its stated planet and anomaly counts", () => {
    for (const s of SYSTEMS) {
      const bodies = getSystemBodies(s);
      const planets = bodies.filter((b) => (b.kind ?? "planet") === "planet");
      const anomalies = bodies.filter(
        (b) => b.kind && b.kind !== "planet"
      );
      expect(planets.length, `${s.name} planets`).toBe(s.planets);
      expect(anomalies.length, `${s.name} anomalies`).toBe(s.anomalies);
    }
  });

  it("never drops a named body and only ever adds synthetic filler", () => {
    for (const s of SYSTEMS) {
      const bodies = getSystemBodies(s);
      // every named body is present and real
      for (const named of s.bodies) {
        expect(bodies).toContain(named);
      }
      // the extras beyond the named ones are all synthetic
      for (const b of bodies) {
        if (!s.bodies.includes(b)) expect(b.synthetic).toBe(true);
      }
    }
  });

  it("returns a stable, cached reference per system", () => {
    for (const s of SYSTEMS) {
      expect(getSystemBodies(s)).toBe(getSystemBodies(s));
    }
  });

  it("has unique body names within each system (so URL lookups resolve)", () => {
    for (const s of SYSTEMS) {
      const names = getSystemBodies(s).map((b) => b.name);
      expect(new Set(names).size, `${s.name} body names`).toBe(names.length);
    }
  });
});
