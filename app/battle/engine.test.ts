import { afterEach, describe, expect, it, vi } from "vitest";

import { applyAbility, advanceBeat, commence, enemiesFire, unleashEpic } from "./engine";
import { defaultBattle, freshChain, makeEnemy, type BattleState, type RoleId } from "./types";

/** A battle that is live, fully crewed, with one Line enemy in play. */
function setup(): { s: BattleState; enemyId: string } {
  let s = defaultBattle();
  (Object.keys(s.roles) as RoleId[]).forEach((r) => {
    s.roles[r].claimedBy = "Crew";
  });
  s = commence(s);
  const enemy = makeEnemy("Cobalt Reaver", 1, "line");
  s = { ...s, enemies: [enemy] };
  return { s, enemyId: enemy.id };
}

// Force every d20 to a chosen face.
function rollAlways(face: number) {
  // d20 = 1 + floor(rand * 20)  →  rand for `face` is (face - 1) / 20
  vi.spyOn(Math, "random").mockReturnValue((face - 1) / 20 + 0.001);
}

afterEach(() => vi.restoreAllMocks());

describe("the Strike chain", () => {
  it("opens, accumulates hand-offs link by link, and the Finisher scales", () => {
    rollAlways(20); // crit — the finish always lands
    const init = setup();
    const enemyId = init.enemyId;
    let s = init.s;

    s = applyAbility(s, "commander", "call-the-shot", { actor: "Cap", targetId: enemyId });
    expect(s.chain.open).toBe(true);
    expect(s.chain.kind).toBe("strike");
    expect(s.chain.length).toBe(1);
    expect(s.chain.handoff.toHit).toBe(1); // +Tier
    expect(s.chain.handoff.tnDown).toBe(1);

    s = applyAbility(s, "navigator", "attack-vector", { actor: "Nav" });
    expect(s.chain.length).toBe(2);
    expect(s.chain.handoff.toHit).toBe(3); // +2

    s = applyAbility(s, "engineer", "overcharge", { actor: "Eng" });
    expect(s.chain.length).toBe(3);
    expect(s.chain.handoff.effectStep).toBe(1);

    const before = s.enemies[0]?.hull ?? 0;
    s = applyAbility(s, "gunner", "killing-blow", { actor: "Gun", targetId: enemyId, weapon: "balanced" });
    expect(s.chain.done).toBe(true);
    expect(s.ship.sync).toBe(1); // a clean chain ticks Sync
    // the enemy was hit hard (damaged or destroyed/removed)
    const after = s.enemies[0]?.hull ?? 0;
    expect(after).toBeLessThan(before || Infinity);
  });

  it("resets Sync when a Finisher misses", () => {
    rollAlways(2); // a 2 — well under any TN
    const init = setup();
    const enemyId = init.enemyId;
    let s = init.s;
    s = { ...s, ship: { ...s.ship, sync: 3 } };
    s = applyAbility(s, "commander", "call-the-shot", { actor: "Cap", targetId: enemyId });
    s = applyAbility(s, "gunner", "killing-blow", { actor: "Gun", targetId: enemyId, weapon: "balanced" });
    expect(s.chain.done).toBe(true);
    expect(s.ship.sync).toBe(0);
  });
});

describe("Sync → Epic", () => {
  it("banks an Epic Chain on the 5th successful chain", () => {
    rollAlways(20);
    let { s } = setup();
    // Brace damage-control finishes always succeed — clean way to build the streak.
    for (let i = 1; i <= 5; i++) {
      s = { ...s, beat: "brace", chain: freshChain() };
      s = applyAbility(s, "commander", "all-hands", { actor: "Cap" });
      s = applyAbility(s, "engineer", "damage-control", { actor: "Eng", repair: "hull" });
      if (i < 5) {
        expect(s.ship.sync).toBe(i);
        expect(s.ship.epicBanked).toBe(false);
      }
    }
    expect(s.ship.epicBanked).toBe(true);
    expect(s.ship.sync).toBe(0);
  });

  it("unleashes an Epic chain where every officer finishes at full scale", () => {
    rollAlways(20);
    const init = setup();
    const enemyId = init.enemyId;
    let s = init.s;
    s = { ...s, beat: "strike", chain: freshChain(), ship: { ...s.ship, epicBanked: true } };
    s = unleashEpic(s);
    expect(s.chain.epic).toBe(true);
    expect(s.chain.length).toBe(4); // scales at the cap
    expect(s.ship.epicBanked).toBe(false);
    // multiple officers can each Finish without closing the chain
    s = applyAbility(s, "gunner", "killing-blow", { actor: "Gun", targetId: enemyId, weapon: "balanced" });
    expect(s.chain.done).toBe(false);
  });
});

describe("beats", () => {
  it("cycles strike → brace → cooldown → spool(+round)", () => {
    let { s } = setup();
    expect(s.beat).toBe("strike");
    s = advanceBeat(s); // → brace
    expect(s.beat).toBe("brace");
    s = advanceBeat(s); // → cooldown
    expect(s.beat).toBe("cooldown");
    const round = s.round;
    s = advanceBeat(s); // → spool, new round
    expect(s.beat).toBe("spool");
    expect(s.round).toBe(round + 1);
  });
});

describe("the Brace chain defends the ship", () => {
  it("point-defense / ghost negate intercepts incoming fire", () => {
    rollAlways(20); // enemy would otherwise crit
    const init = setup();
    const enemyId = init.enemyId;
    let s = init.s;
    const hull = s.ship.hull;
    s = { ...s, ship: { ...s.ship, negate: 1 } }; // a banked intercept
    s = enemiesFire(s);
    expect(s.ship.hull).toBe(hull); // intercepted — no damage
    expect(s.ship.negate).toBe(0);
    expect(s.enemies.find((e) => e.id === enemyId)).toBeDefined();
  });
});
