export type RoleId =
  | "commander"
  | "navigator"
  | "engineer"
  | "sensor"
  | "gunner";

export type Phase = "start" | "action" | "reaction" | "end";
export type DamageType = "balanced" | "laser" | "missile" | "ap";
export type Range = "close" | "long";
export type ConditionKind = "marked" | "breached" | "burning";

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
  tn: number; // target number to hit it
  tier: number;
  atk: number; // base attack damage
  conditions: Condition[];
}

export interface RoleSlot {
  claimedBy: string | null;
  acted: boolean;
}

export interface BattleState {
  active: boolean;
  round: number;
  phase: Phase;
  range: Range;
  ship: {
    hull: number;
    maxHull: number;
    shields: number;
    maxShields: number;
    power: number;
    maxPower: number;
    momentum: number;
    maxMomentum: number;
    tier: number;
    evasion: number; // round-scoped, raises defence
    conditions: Condition[];
  };
  // round-scoped tactical buffs from the Commander / Engineer
  buffs: { attackMod: number; nextHitBonus: number };
  roles: Record<RoleId, RoleSlot>;
  enemies: Enemy[];
  log: string[];
  updatedAt: number;
}

/* --- tuning (small & tactical scale) ------------------------------ */
export const SHIELD_OVERCAP = 5; // shields may exceed max by this much
export const MOMENTUM_PER_ROUND = 1;
export const POWER_PER_ROUND = 3; // restored — the +2 economy bit too hard once enemies got dangerous
export const SHIP_DEFENCE_BASE = 10; // enemy attacks roll vs this + evasion
export const MOOK_DAMAGE = 2; // default enemy attack (+ degrees of success); elites set higher
// A hit that clears the TN by this much deals +1 damage (per step).
export const DEGREE_STEP = 4;

export const DAMAGE_BASE: Record<DamageType, number> = {
  balanced: 2,
  laser: 2,
  missile: 3,
  ap: 1,
};

export const WEAPON_POWER: Record<DamageType, number> = {
  balanced: 0,
  laser: 1,
  missile: 2,
  ap: 2,
};

export const DAMAGE_LABEL: Record<DamageType, string> = {
  balanced: "Balanced",
  laser: "Laser",
  missile: "Missile",
  ap: "AP",
};

export const ROLES: {
  id: RoleId;
  name: string;
  blurb: string;
  accent: string;
}[] = [
  { id: "commander", name: "Commander", blurb: "Momentum & tactical orders", accent: "#f0d080" },
  { id: "navigator", name: "Navigator", blurb: "Positioning & zone control", accent: "#7fe0ff" },
  { id: "engineer", name: "Engineer", blurb: "Power & ship systems", accent: "#7fff9f" },
  { id: "sensor", name: "Sensor Officer", blurb: "Scan, hack, reveal", accent: "#cc88ff" },
  { id: "gunner", name: "Gunner", blurb: "Weapons & damage", accent: "#ff6b6b" },
];

export function defaultBattle(): BattleState {
  return {
    active: false,
    round: 0,
    phase: "start",
    range: "close",
    ship: {
      hull: 16,
      maxHull: 16,
      shields: 6,
      maxShields: 6,
      power: 4,
      maxPower: 6,
      momentum: 0,
      maxMomentum: 6,
      tier: 1,
      evasion: 0,
      conditions: [],
    },
    buffs: { attackMod: 0, nextHitBonus: 0 },
    roles: {
      commander: { claimedBy: null, acted: false },
      navigator: { claimedBy: null, acted: false },
      engineer: { claimedBy: null, acted: false },
      sensor: { claimedBy: null, acted: false },
      gunner: { claimedBy: null, acted: false },
    },
    enemies: [],
    log: ["Battle stations standing by. The DM will commence the engagement."],
    updatedAt: 0,
  };
}

export function makeEnemy(name: string, hull: number): Enemy {
  return {
    id: crypto.randomUUID(),
    name,
    hull,
    maxHull: hull,
    shields: Math.max(0, Math.round(hull / 4)),
    tn: 10,
    tier: 1,
    atk: MOOK_DAMAGE,
    conditions: [],
  };
}
