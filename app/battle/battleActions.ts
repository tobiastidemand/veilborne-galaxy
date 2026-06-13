import type { BattleState, StationId } from "./types";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const log = (s: BattleState, line: string): BattleState => ({
  ...s,
  log: [...s.log, `[R${s.round}] ${line}`].slice(-80),
});

const spend = (s: BattleState, cost: number): BattleState => ({
  ...s,
  ship: { ...s.ship, power: Math.max(0, s.ship.power - cost) },
});

/** Apply incoming damage to the ship: shields soak first, the rest hits hull. */
export function damageShip(s: BattleState, amount: number, source: string): BattleState {
  const absorbed = Math.min(s.ship.shields, amount);
  const hullHit = amount - absorbed;
  const next = {
    ...s,
    ship: {
      ...s.ship,
      shields: s.ship.shields - absorbed,
      hull: clamp(s.ship.hull - hullHit, 0, s.ship.maxHull),
    },
  };
  return log(
    next,
    `${source} strikes the ship — ${absorbed} to shields, ${hullHit} to hull.`
  );
}

export interface ActionCtx {
  actor: string;
  targetId?: string;
}

export interface BattleAction {
  id: string;
  label: string;
  cost: number;
  /** Weapons targeting: render a fire button per enemy. */
  targeted?: boolean;
  run: (s: BattleState, ctx: ActionCtx) => BattleState;
}

export const STATION_ACTIONS: Record<StationId, BattleAction[]> = {
  helm: [
    {
      id: "evade",
      label: "Evasive maneuvers",
      cost: 1,
      run: (s, c) => {
        const next = spend(s, 1);
        return log(
          {
            ...next,
            ship: {
              ...next.ship,
              shields: clamp(next.ship.shields + 10, 0, next.ship.maxShields),
            },
          },
          `${c.actor} flies evasive — +10 shields.`
        );
      },
    },
    {
      id: "close",
      label: "Close distance",
      cost: 1,
      run: (s, c) =>
        log(spend(s, 1), `${c.actor} closes to optimal weapons range.`),
    },
  ],
  weapons: [
    {
      id: "fire",
      label: "Fire",
      cost: 2,
      targeted: true,
      run: (s, c) => {
        const dmg = 20;
        let next = spend(s, 2);
        const enemy = next.enemies.find((e) => e.id === c.targetId);
        if (!enemy) return log(next, `${c.actor} fires — but has no target.`);
        const hp = Math.max(0, enemy.hp - dmg);
        next = {
          ...next,
          enemies: next.enemies
            .map((e) => (e.id === enemy.id ? { ...e, hp } : e))
            .filter((e) => e.hp > 0),
        };
        return log(
          next,
          hp > 0
            ? `${c.actor} fires on ${enemy.name} for ${dmg} (${hp} hp left).`
            : `${c.actor} destroys ${enemy.name}!`
        );
      },
    },
  ],
  engineering: [
    {
      id: "repair",
      label: "Repair hull",
      cost: 2,
      run: (s, c) => {
        const next = spend(s, 2);
        return log(
          {
            ...next,
            ship: {
              ...next.ship,
              hull: clamp(next.ship.hull + 12, 0, next.ship.maxHull),
            },
          },
          `${c.actor} patches the hull — +12 hull.`
        );
      },
    },
    {
      id: "shields",
      label: "Reinforce shields",
      cost: 2,
      run: (s, c) => {
        const next = spend(s, 2);
        return log(
          {
            ...next,
            ship: {
              ...next.ship,
              shields: clamp(next.ship.shields + 15, 0, next.ship.maxShields),
            },
          },
          `${c.actor} reroutes power — +15 shields.`
        );
      },
    },
  ],
  captain: [
    {
      id: "scan",
      label: "Scan enemies",
      cost: 1,
      run: (s, c) => {
        const report = s.enemies.length
          ? s.enemies.map((e) => `${e.name} ${e.hp}/${e.maxHp}`).join(", ")
          : "no contacts";
        return log(spend(s, 1), `${c.actor} scans: ${report}.`);
      },
    },
    {
      id: "rally",
      label: "Rally the crew",
      cost: 2,
      run: (s, c) => {
        const next = spend(s, 2);
        return log(
          {
            ...next,
            ship: {
              ...next.ship,
              hull: clamp(next.ship.hull + 5, 0, next.ship.maxHull),
            },
          },
          `${c.actor} rallies the crew — morale holds (+5 hull).`
        );
      },
    },
  ],
};
