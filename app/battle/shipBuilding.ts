import {
  SHIELD_OVERCAP,
  SHIP_BY_TIER,
  SYNC_FOR_EPIC,
  type BuildState,
  type DamageType,
  type FrameId,
  type SystemId,
  type WeaponId,
} from "./types";

/* --- catalog (mirrors docs/ship-building.md) ----------------------------- */

export interface Frame {
  id: FrameId;
  name: string;
  trait: string;
  hullDelta: number;
  shieldDelta: number;
  regenDelta: number;
  powerDelta: number;
  weaponSlotDelta: number;
  systemSlotDelta: number;
  overcapDelta: number;
  armour: number;
  concealStart: number;
  heavyPerLink: number;
  speed: number; // drives Initiative
}

export const FRAMES: Record<FrameId, Frame> = {
  survey: {
    id: "survey",
    name: "Survey Cutter",
    trait: "Versatile — +1 System slot.",
    hullDelta: 0, shieldDelta: 0, regenDelta: 0, powerDelta: 0,
    weaponSlotDelta: 0, systemSlotDelta: 1, overcapDelta: 0, armour: 0, concealStart: 0, heavyPerLink: 0, speed: 3,
  },
  bulwark: {
    id: "bulwark",
    name: "Bulwark",
    trait: "Armour — ignore the first 1 damage from each hit.",
    hullDelta: 6, shieldDelta: -2, regenDelta: 0, powerDelta: 0,
    weaponSlotDelta: 0, systemSlotDelta: 0, overcapDelta: 0, armour: 1, concealStart: 0, heavyPerLink: 0, speed: 2,
  },
  aegis: {
    id: "aegis",
    name: "Aegis",
    trait: "Shield-tank — +1 regen, deeper over-charge.",
    hullDelta: -4, shieldDelta: 4, regenDelta: 1, powerDelta: 0,
    weaponSlotDelta: 0, systemSlotDelta: 0, overcapDelta: 3, armour: 0, concealStart: 0, heavyPerLink: 0, speed: 2,
  },
  wraith: {
    id: "wraith",
    name: "Wraith",
    trait: "EW skirmisher — starts Concealed; +1 Weapon slot, −2 Power.",
    hullDelta: -4, shieldDelta: -2, regenDelta: 0, powerDelta: -2,
    weaponSlotDelta: 1, systemSlotDelta: 0, overcapDelta: 0, armour: 0, concealStart: 2, heavyPerLink: 0, speed: 5,
  },
  lance: {
    id: "lance",
    name: "Lance Runner",
    trait: "Glass cannon — heavy finishes +1 per link; −2 Hull.",
    hullDelta: -2, shieldDelta: -2, regenDelta: 0, powerDelta: 0,
    weaponSlotDelta: 0, systemSlotDelta: 0, overcapDelta: 0, armour: 0, concealStart: 0, heavyPerLink: 1, speed: 4,
  },
};

export interface Weapon {
  id: WeaponId;
  name: string;
  cost: number;
  type: DamageType | null; // null = utility (Flak)
  note: string;
}

export const WEAPONS: Record<WeaponId, Weapon> = {
  pulse: { id: "pulse", name: "Pulse Cannon", cost: 1, type: "balanced", note: "reliable, accurate" },
  beam: { id: "beam", name: "Beam Laser", cost: 2, type: "laser", note: "shreds shields" },
  torpedo: { id: "torpedo", name: "Torpedo Rack", cost: 2, type: "missile", note: "big vs hull; can be shot down" },
  lance: { id: "lance", name: "Spinal Lance", cost: 3, type: "ap", note: "bypasses shields, Breaches" },
  flak: { id: "flak", name: "Flak Battery", cost: 1, type: null, note: "+1 Point Defense" },
};

export interface SystemDef {
  id: SystemId;
  name: string;
  cost: number;
  seat: string;
  note: string;
}

export const SYSTEMS: Record<SystemId, SystemDef> = {
  "command-suite": { id: "command-suite", name: "Command Suite", cost: 1, seat: "Commander", note: "Open +1; Extend twice/battle" },
  "battle-choir": { id: "battle-choir", name: "Battle Choir", cost: 2, seat: "Commander", note: "Epic one Sync sooner" },
  maneuver: { id: "maneuver", name: "Maneuver Thrusters", cost: 1, seat: "Navigator", note: "Attack Vector / Evasive +1" },
  "slip-drive": { id: "slip-drive", name: "Slip Drive", cost: 2, seat: "Navigator", note: "Break Contact also clears a condition" },
  "reactor-tap": { id: "reactor-tap", name: "Reactor Tap", cost: 1, seat: "Engineer", note: "Overcharge / Reroute +1" },
  "dc-bay": { id: "dc-bay", name: "Damage Control Bay", cost: 2, seat: "Engineer", note: "Damage Control +2 flat" },
  targeting: { id: "targeting", name: "Targeting Array", cost: 1, seat: "Sensor", note: "Target Lock also +1 to hit" },
  spectre: { id: "spectre", name: "Spectre Array", cost: 2, seat: "Sensor", note: "Blur −3; Ghost negates +1" },
  autoloader: { id: "autoloader", name: "Autoloader", cost: 1, seat: "Gunner", note: "Killing Blow +1 per link" },
  "pd-net": { id: "pd-net", name: "Point-Defense Net", cost: 1, seat: "Gunner", note: "Point Defense negates +1" },
  plating: { id: "plating", name: "Reinforced Plating", cost: 1, seat: "—", note: "+4 Hull" },
  capacitor: { id: "capacitor", name: "Capacitor Bank", cost: 1, seat: "—", note: "+3 max Shields, deeper over-charge" },
};

/** Build budget by Tier (docs/ship-building.md §2). */
const BUDGET: Record<number, { power: number; weaponSlots: number; systemSlots: number }> = {
  1: { power: 6, weaponSlots: 2, systemSlots: 2 },
  2: { power: 8, weaponSlots: 2, systemSlots: 3 },
  3: { power: 10, weaponSlots: 3, systemSlots: 3 },
  4: { power: 12, weaponSlots: 3, systemSlots: 4 },
  5: { power: 14, weaponSlots: 4, systemSlots: 5 },
};

/* --- derived loadout (what combat actually reads) ------------------------ */

export interface Loadout {
  // sheet
  maxHull: number;
  maxShields: number;
  shieldRegen: number;
  overcap: number; // total shield over-charge headroom above maxShields
  armour: number;
  concealStart: number;
  speed: number;
  // budget
  power: number;
  weaponSlots: number;
  systemSlots: number;
  powerUsed: number;
  valid: boolean;
  reasons: string[];
  // armament
  weaponTypes: DamageType[];
  hasFlak: boolean;
  // chain ability modifiers
  syncNeeded: number;
  openBonus: number;
  extendUses: number;
  navLinkBonus: number;
  engineerLinkBonus: number;
  damageControlFlat: number;
  targetLockToHit: number;
  blurBonus: number;
  ghostBonus: number;
  killingBlowPerLink: number;
  heavyPerLink: number;
  pdNegate: number;
  breakContactCleanse: boolean;
}

export function computeLoadout(build: BuildState, tier: number): Loadout {
  const base = SHIP_BY_TIER[tier] ?? SHIP_BY_TIER[1];
  const budget = BUDGET[tier] ?? BUDGET[1];
  const frame = FRAMES[build.frame] ?? FRAMES.survey;
  const has = (id: SystemId) => build.systems.includes(id);

  const powerUsed =
    build.weapons.reduce((n, w) => n + (WEAPONS[w]?.cost ?? 0), 0) +
    build.systems.reduce((n, sId) => n + (SYSTEMS[sId]?.cost ?? 0), 0);

  const power = budget.power + frame.powerDelta;
  const weaponSlots = budget.weaponSlots + frame.weaponSlotDelta;
  const systemSlots = budget.systemSlots + frame.systemSlotDelta;

  const reasons: string[] = [];
  if (powerUsed > power) reasons.push(`Power ${powerUsed}/${power}`);
  if (build.weapons.length > weaponSlots) reasons.push(`Weapons ${build.weapons.length}/${weaponSlots}`);
  if (build.systems.length > systemSlots) reasons.push(`Systems ${build.systems.length}/${systemSlots}`);

  const weaponTypes = Array.from(
    new Set(build.weapons.map((w) => WEAPONS[w]?.type).filter((t): t is DamageType => !!t))
  );
  const hasFlak = build.weapons.includes("flak");

  return {
    maxHull: base.hull + frame.hullDelta + (has("plating") ? 4 : 0),
    maxShields: base.shields + frame.shieldDelta + (has("capacitor") ? 3 : 0),
    shieldRegen: base.regen + frame.regenDelta,
    overcap: SHIELD_OVERCAP + frame.overcapDelta + (has("capacitor") ? 1 : 0),
    armour: frame.armour,
    concealStart: frame.concealStart,
    speed: frame.speed,
    power,
    weaponSlots,
    systemSlots,
    powerUsed,
    valid: reasons.length === 0,
    reasons,
    weaponTypes: weaponTypes.length ? weaponTypes : ["balanced"],
    hasFlak,
    syncNeeded: has("battle-choir") ? Math.max(2, SYNC_FOR_EPIC - 1) : SYNC_FOR_EPIC,
    openBonus: has("command-suite") ? 1 : 0,
    extendUses: 1 + (has("command-suite") ? 1 : 0),
    navLinkBonus: has("maneuver") ? 1 : 0,
    engineerLinkBonus: has("reactor-tap") ? 1 : 0,
    damageControlFlat: has("dc-bay") ? 2 : 0,
    targetLockToHit: has("targeting") ? 1 : 0,
    blurBonus: has("spectre") ? 1 : 0,
    ghostBonus: has("spectre") ? 1 : 0,
    killingBlowPerLink: has("autoloader") ? 1 : 0,
    heavyPerLink: frame.heavyPerLink,
    pdNegate: 1 + (hasFlak ? 1 : 0) + (has("pd-net") ? 1 : 0),
    breakContactCleanse: has("slip-drive"),
  };
}

export const loadoutOf = (s: { build: BuildState; ship: { tier: number } }): Loadout =>
  computeLoadout(s.build, s.ship.tier);
