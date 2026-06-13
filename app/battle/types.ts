export type StationId = "helm" | "weapons" | "engineering" | "captain";

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
}

export interface StationSlot {
  claimedBy: string | null;
  ready: boolean;
}

export interface BattleState {
  active: boolean;
  round: number;
  turn: "players" | "dm";
  ship: { hull: number; maxHull: number; shields: number; maxShields: number; power: number; maxPower: number };
  stations: Record<StationId, StationSlot>;
  enemies: Enemy[];
  log: string[];
  updatedAt: number;
}

export const STATIONS: {
  id: StationId;
  name: string;
  role: string;
  icon: string;
  blurb: string;
  accent: string;
}[] = [
  { id: "helm", name: "Helm", role: "Pilot", icon: "⛭", blurb: "Move, evade, set range", accent: "#7fe0ff" },
  { id: "weapons", name: "Weapons", role: "Gunner", icon: "✦", blurb: "Fire on the marked targets", accent: "#ff6b6b" },
  { id: "engineering", name: "Engineering", role: "Shields", icon: "⚙", blurb: "Power, repairs, shields", accent: "#7fff9f" },
  { id: "captain", name: "Captain", role: "Sensors", icon: "★", blurb: "Scan, rally, special orders", accent: "#f0d080" },
];

export function defaultBattle(): BattleState {
  return {
    active: false,
    round: 0,
    turn: "players",
    ship: {
      hull: 100,
      maxHull: 100,
      shields: 60,
      maxShields: 60,
      power: 6,
      maxPower: 6,
    },
    stations: {
      helm: { claimedBy: null, ready: false },
      weapons: { claimedBy: null, ready: false },
      engineering: { claimedBy: null, ready: false },
      captain: { claimedBy: null, ready: false },
    },
    enemies: [],
    log: ["Battle stations standing by. The DM will commence the engagement."],
    updatedAt: 0,
  };
}
