export type RoleId =
  | "commander"
  | "navigator"
  | "engineer"
  | "sensor"
  | "gunner";

/** The four beats of a turn (v0.4 — "Initiative & the Chain"). */
export type Beat = "initiative" | "strike" | "brace" | "rolls";
export type ChainKind = "strike" | "brace";
export type DamageType = "balanced" | "laser" | "missile" | "ap";
export type Range = "boarding" | "close" | "medium" | "long";
export type ConditionKind = "marked" | "breached" | "burning" | "disabled";

export interface Condition {
  kind: ConditionKind;
  rounds: number;
}

export interface Enemy {
  id: string;
  name: string;
  hull: number;
  maxHull: number;
  shields: number;
  maxShields: number;
  tn: number;
  tier: number;
  atk: number;
  speed: number; // drives Initiative
  conditions: Condition[];
}

/**
 * The accumulating boost a chain builds, link by link. Each officer's action
 * adds to it; everyone after benefits, and the Finisher cashes the full sum.
 * Reset whenever a new chain opens.
 */
export interface Handoff {
  toHit: number; // + to attack rolls (Navigator angle, Commander open, Targeting)
  effectStep: number; // + damage/effect steps (Engineer overcharge)
  tnDown: number; // lowers the target's effective TN (Sensor lock, Gunner suppress)
  ignoreShields: boolean; // Sensor lock
  defense: number; // Brace: raises ship defence (Commander all-hands, set on ship)
}

export const NO_HANDOFF: Handoff = {
  toHit: 0,
  effectStep: 0,
  tnDown: 0,
  ignoreShields: false,
  defense: 0,
};

/* --- ship building (see docs/ship-building.md) --------------------------- */
export type FrameId = "survey" | "bulwark" | "aegis" | "wraith" | "lance";
export type WeaponId = "pulse" | "beam" | "torpedo" | "lance" | "flak";
export type SystemId =
  | "command-suite"
  | "battle-choir"
  | "maneuver"
  | "slip-drive"
  | "reactor-tap"
  | "dc-bay"
  | "targeting"
  | "spectre"
  | "autoloader"
  | "pd-net"
  | "plating"
  | "capacitor";

export interface BuildState {
  frame: FrameId;
  weapons: WeaponId[];
  systems: SystemId[];
}

/** The campaign's survey ship — a legal Tier-1 Survey Cutter build. */
export const DEFAULT_BUILD: BuildState = {
  frame: "survey",
  weapons: ["pulse", "lance"],
  systems: ["targeting", "reactor-tap"],
};

export interface ChainState {
  kind: ChainKind | null; // null = not yet opened this beat
  open: boolean; // the Commander (or stand-in) has opened
  opener: RoleId | null;
  acted: RoleId[]; // officers who have acted this chain
  length: number; // officers acted, including the opener (the scaling driver)
  handoff: Handoff; // accumulating boost for whoever acts next
  epic: boolean; // this chain is an Epic Chain (position dissolves)
  done: boolean; // a Finisher has resolved (non-epic) — chain is closed
  targetId: string | null; // the chain's declared target (Commander's Call the Shot)
}

export function freshChain(): ChainState {
  return {
    kind: null,
    open: false,
    opener: null,
    acted: [],
    length: 0,
    handoff: { ...NO_HANDOFF },
    epic: false,
    done: false,
    targetId: null,
  };
}

export interface BattleState {
  active: boolean;
  round: number;
  beat: Beat;
  range: Range;
  ship: {
    hull: number;
    maxHull: number;
    shields: number;
    maxShields: number;
    shieldRegen: number;
    tier: number;
    speed: number; // drives Initiative
    sync: number; // streak of successful chains; at SYNC_FOR_EPIC → bank an Epic
    epicBanked: boolean; // the Commander holds an Epic Chain, ready to unleash
    // turn-scoped Brace defences (set during Brace, consumed when enemies fire)
    evasion: number; // raises ship defence
    conceal: number; // penalty to incoming enemy rolls
    negate: number; // incoming hits the crew shoots down outright
    conditions: Condition[];
  };
  // this turn's initiative: true = crew Strikes (enemy braces); false = crew Braces (enemy strikes)
  crewHasInitiative: boolean;
  initiativeRoll: { crew: number; enemy: number } | null; // last roll, for display
  chain: ChainState;
  build: BuildState;
  roles: Record<RoleId, { claimedBy: string | null }>;
  enemies: Enemy[];
  log: string[];
  updatedAt: number;
}

/* --- tuning (v0.3 playtest defaults — mirrors docs/ship-combat.md §11) --- */
export const SHIELD_OVERCAP = 5;
export const DEGREE_STEP = 4;
export const SHIP_DEFENCE_BASE = 10;
export const CHAIN_CAP = 4; // finish scaling stops counting past this many links
export const PER_LINK_HEAVY = 2; // Killing Blow, Reactor Lance
export const PER_LINK_LIGHT = 1; // Strafing, Counter, Killbox, Damage Control, Ghost
export const SYNC_FOR_EPIC = 3; // v0.4: rebalanced for one chain per turn
export const SHIP_SPEED_BASE = 3; // default ship Speed (frames adjust it)

export const DAMAGE_BASE: Record<DamageType, number> = {
  balanced: 2,
  laser: 2,
  missile: 3,
  ap: 2,
};

export const DAMAGE_LABEL: Record<DamageType, string> = {
  balanced: "Balanced",
  laser: "Laser",
  missile: "Missile",
  ap: "Lance (AP)",
};

export const BEATS: Beat[] = ["initiative", "strike", "brace", "rolls"];
export const RANGES: Range[] = ["boarding", "close", "medium", "long"];

export const ROLES: {
  id: RoleId;
  name: string;
  blurb: string;
  accent: string;
}[] = [
  { id: "commander", name: "Commander", blurb: "Conductor — opens every chain", accent: "#f0d080" },
  { id: "navigator", name: "Navigator", blurb: "Position & evasion", accent: "#7fe0ff" },
  { id: "engineer", name: "Engineer", blurb: "Power & integrity", accent: "#7fff9f" },
  { id: "sensor", name: "Sensor Officer", blurb: "Intel & electronic warfare", accent: "#cc88ff" },
  { id: "gunner", name: "Gunner", blurb: "Firepower", accent: "#ff6b6b" },
];

/** Player-ship baselines by Tier (docs/ship-combat.md §11). */
export const SHIP_BY_TIER: Record<number, { hull: number; shields: number; regen: number }> = {
  1: { hull: 16, shields: 6, regen: 2 },
  2: { hull: 22, shields: 8, regen: 2 },
  3: { hull: 28, shields: 10, regen: 3 },
  4: { hull: 36, shields: 12, regen: 3 },
  5: { hull: 44, shields: 14, regen: 4 },
};

/** Enemy baselines by Tier, Line size (docs/ship-combat.md §11). */
export const ENEMY_BY_TIER: Record<number, { hull: number; shields: number; tn: number; atk: number }> = {
  1: { hull: 12, shields: 3, tn: 12, atk: 3 },
  2: { hull: 18, shields: 4, tn: 13, atk: 4 },
  3: { hull: 24, shields: 6, tn: 14, atk: 5 },
  4: { hull: 32, shields: 8, tn: 15, atk: 6 },
  5: { hull: 40, shields: 10, tn: 16, atk: 7 },
};

export type EnemySize = "skirmisher" | "line" | "elite";

export function defaultBattle(): BattleState {
  const t = SHIP_BY_TIER[1];
  return {
    active: false,
    round: 0,
    beat: "initiative",
    range: "close",
    ship: {
      hull: t.hull,
      maxHull: t.hull,
      shields: t.shields,
      maxShields: t.shields,
      shieldRegen: t.regen,
      tier: 1,
      speed: SHIP_SPEED_BASE,
      sync: 0,
      epicBanked: false,
      evasion: 0,
      conceal: 0,
      negate: 0,
      conditions: [],
    },
    crewHasInitiative: true,
    initiativeRoll: null,
    chain: freshChain(),
    build: { frame: DEFAULT_BUILD.frame, weapons: [...DEFAULT_BUILD.weapons], systems: [...DEFAULT_BUILD.systems] },
    roles: {
      commander: { claimedBy: null },
      navigator: { claimedBy: null },
      engineer: { claimedBy: null },
      sensor: { claimedBy: null },
      gunner: { claimedBy: null },
    },
    enemies: [],
    log: ["Standing by. The GM will commence the engagement."],
    updatedAt: 0,
  };
}

export function makeEnemy(name: string, tier: number, size: EnemySize): Enemy {
  const base = ENEMY_BY_TIER[tier] ?? ENEMY_BY_TIER[1];
  const { shields } = base;
  let { hull, tn, atk } = base;
  let speed = tier + 1; // baseline: light foes lead the initiative
  if (size === "skirmisher") {
    hull = Math.max(1, Math.round(hull / 2));
    tn -= 2;
    speed += 2;
  } else if (size === "elite") {
    hull *= 2;
    tn += 2;
    atk += 1;
    speed -= 1;
  }
  return {
    id: crypto.randomUUID(),
    name,
    hull,
    maxHull: hull,
    shields,
    maxShields: shields,
    tn,
    tier,
    atk,
    speed,
    conditions: [],
  };
}
