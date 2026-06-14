import { afterEach, describe, expect, it, vi } from "vitest";

import { applyAbility, commence, enemiesFire, resolveTurn, startTurn, unleashEpic } from "./engine";
import { computeLoadout } from "./shipBuilding";
import { defaultBattle, freshChain, makeEnemy, type BattleState, type RoleId } from "./types";

/**
 * A battle that is live, fully crewed, one Line enemy in play. Uses a vanilla
 * build (no systems) so the base chain mechanics are tested without modifiers;
 * the ship-building tests set their own builds.
 */
function setup(): { s: BattleState; enemyId: string } {
  let s = defaultBattle();
  s = { ...s, build: { frame: "survey", weapons: ["pulse", "lance"], systems: [] } };
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
  it("banks an Epic Chain on the 3rd successful chain", () => {
    rollAlways(20);
    let { s } = setup();
    // Brace damage-control finishes always succeed — clean way to build the streak.
    for (let i = 1; i <= 3; i++) {
      s = { ...s, beat: "brace", chain: freshChain() };
      s = applyAbility(s, "commander", "all-hands", { actor: "Cap" });
      s = applyAbility(s, "engineer", "damage-control", { actor: "Eng", repair: "hull" });
      if (i < 3) {
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

describe("the turn (initiative)", () => {
  it("runs one chain per turn: chain → Rolls → next turn re-rolls initiative", () => {
    let { s } = setup();
    expect(s.active).toBe(true);
    expect(["strike", "brace"]).toContain(s.beat);
    s = resolveTurn(s);
    expect(s.beat).toBe("rolls");
    const round = s.round;
    s = startTurn(s);
    expect(s.round).toBe(round + 1);
    expect(["strike", "brace"]).toContain(s.beat);
    expect(s.initiativeRoll).not.toBeNull();
  });

  it("Speed decides initiative — fast crew Strikes, slow crew Braces", () => {
    let fast = defaultBattle();
    fast = { ...fast, ship: { ...fast.ship, speed: 50 }, enemies: [makeEnemy("X", 1, "line")] };
    fast = startTurn(fast);
    expect(fast.crewHasInitiative).toBe(true);
    expect(fast.beat).toBe("strike");

    let slow = defaultBattle();
    slow = { ...slow, ship: { ...slow.ship, speed: 0 }, enemies: [{ ...makeEnemy("Y", 1, "line"), speed: 50 }] };
    slow = startTurn(slow);
    expect(slow.crewHasInitiative).toBe(false);
    expect(slow.beat).toBe("brace");
  });

  it("the enemy only fires on a turn the crew Braced", () => {
    rollAlways(20); // any incoming would crit if it fired
    let s = defaultBattle();
    s = { ...s, enemies: [makeEnemy("Z", 1, "line")], ship: { ...s.ship, shields: 0 } };
    // crew has the initiative → resolve should NOT let the enemy fire
    const struck = resolveTurn({ ...s, beat: "strike", crewHasInitiative: true });
    expect(struck.ship.hull).toBe(s.ship.hull);
    // crew braced → enemy fires
    const braced = resolveTurn({ ...s, beat: "brace", crewHasInitiative: false });
    expect(braced.ship.hull).toBeLessThan(s.ship.hull);
  });
});

describe("ship building", () => {
  it("computes budget, stats and ability mods per build", () => {
    const survey = computeLoadout(
      { frame: "survey", weapons: ["pulse", "lance"], systems: ["targeting", "reactor-tap"] },
      1
    );
    expect(survey.valid).toBe(true);
    expect(survey.powerUsed).toBe(6);
    expect(survey.maxHull).toBe(16);
    expect(survey.weaponTypes).toEqual(["balanced", "ap"]);
    expect(survey.targetLockToHit).toBe(1); // Targeting Array
    expect(survey.engineerLinkBonus).toBe(1); // Reactor Tap

    expect(computeLoadout({ frame: "bulwark", weapons: [], systems: [] }, 1).maxHull).toBe(22);
    expect(computeLoadout({ frame: "bulwark", weapons: [], systems: [] }, 1).armour).toBe(1);
    expect(computeLoadout({ frame: "survey", weapons: [], systems: ["battle-choir"] }, 1).syncNeeded).toBe(2);
    expect(computeLoadout({ frame: "lance", weapons: [], systems: [] }, 1).heavyPerLink).toBe(1);

    // three Spinal Lances (9 power) blows the Tier-1 budget of 6
    expect(computeLoadout({ frame: "survey", weapons: ["lance", "lance", "lance"], systems: [] }, 1).valid).toBe(false);
  });

  it("applies the build to the sheet on commence", () => {
    let s = defaultBattle();
    s = { ...s, build: { frame: "bulwark", weapons: ["pulse"], systems: [] } };
    s = commence(s);
    expect(s.ship.maxHull).toBe(22);
    expect(s.ship.hull).toBe(22);
  });

  it("Bulwark armour shaves 1 off each incoming hit", () => {
    rollAlways(11); // a modest, non-crit hit that clears defence 10
    const damageTaken = (frame: "survey" | "bulwark") => {
      let s = defaultBattle();
      s = { ...s, build: { frame, weapons: ["pulse"], systems: [] } };
      s = commence(s);
      const max = s.ship.maxHull;
      s = { ...s, enemies: [makeEnemy("X", 1, "line")], ship: { ...s.ship, shields: 0 } };
      return max - enemiesFire(s).ship.hull;
    };
    expect(damageTaken("bulwark")).toBe(Math.max(0, damageTaken("survey") - 1));
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
