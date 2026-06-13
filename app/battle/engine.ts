import {
  DAMAGE_BASE,
  DAMAGE_LABEL,
  MOMENTUM_PER_ROUND,
  POWER_PER_ROUND,
  SHIELD_OVERCAP,
  SHIP_DEFENCE_BASE,
  WEAPON_POWER,
  type BattleState,
  type Condition,
  type ConditionKind,
  type DamageType,
  type RoleId,
} from "./types";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
const d20 = () => 1 + Math.floor(Math.random() * 20);

const log = (s: BattleState, line: string): BattleState => ({
  ...s,
  log: [...s.log, `[R${s.round}] ${line}`].slice(-100),
});

const hasCond = (list: Condition[], kind: ConditionKind) =>
  list.some((c) => c.kind === kind);

const addCond = (list: Condition[], kind: ConditionKind, rounds: number): Condition[] => {
  const rest = list.filter((c) => c.kind !== kind);
  return [...rest, { kind, rounds }];
};

const shieldCap = (s: BattleState) => s.ship.maxShields + SHIELD_OVERCAP;

/** Resolve typed damage against a shields/hull pair. Returns the new values. */
function resolveDamage(
  shields: number,
  hull: number,
  type: DamageType,
  dmg: number,
  breached: boolean
): { shields: number; hull: number; note: string } {
  // AP and breached targets bypass shields entirely.
  if (type === "ap" || breached) {
    return { shields, hull: Math.max(0, hull - dmg), note: `${dmg} to hull` };
  }
  let effective = dmg;
  if (shields > 0) {
    if (type === "laser") effective += 1; // strong vs shields
    if (type === "missile") effective = Math.max(1, effective - 1); // weak vs shields
  }
  const absorbed = Math.min(shields, effective);
  const hullHit = effective - absorbed;
  return {
    shields: shields - absorbed,
    hull: Math.max(0, hull - hullHit),
    note: `${absorbed} to shields, ${hullHit} to hull`,
  };
}

export interface ActionCtx {
  actor: string;
  targetId?: string;
  weapon?: DamageType;
}

export interface ActionDef {
  id: string;
  label: string;
  power?: number;
  momentum?: number;
  needsTarget?: boolean;
  weapon?: boolean; // gunner: pick a damage type + target
  hint: string;
  run: (s: BattleState, ctx: ActionCtx) => BattleState;
}

const spend = (s: BattleState, power = 0, momentum = 0): BattleState => ({
  ...s,
  ship: {
    ...s.ship,
    power: Math.max(0, s.ship.power - power),
    momentum: Math.max(0, s.ship.momentum - momentum),
  },
});

export function actionCost(a: ActionDef, weapon?: DamageType): { power: number; momentum: number } {
  return {
    power: a.weapon && weapon ? WEAPON_POWER[weapon] : a.power ?? 0,
    momentum: a.momentum ?? 0,
  };
}

export function canAfford(s: BattleState, a: ActionDef, weapon?: DamageType): boolean {
  const c = actionCost(a, weapon);
  return s.ship.power >= c.power && s.ship.momentum >= c.momentum;
}

/* --- role action menus -------------------------------------------- */

export const ROLE_ACTIONS: Record<RoleId, ActionDef[]> = {
  commander: [
    {
      id: "inspire",
      label: "Inspire",
      momentum: 2,
      hint: "+2 to all crew attack rolls this round",
      run: (s, c) =>
        log(
          { ...spend(s, 0, 2), buffs: { ...s.buffs, attackMod: s.buffs.attackMod + 2 } },
          `${c.actor} inspires the crew — +2 to attacks this round.`
        ),
    },
    {
      id: "coordinate",
      label: "Coordinated strike",
      momentum: 3,
      hint: "the next weapon hit deals +2 damage",
      run: (s, c) =>
        log(
          { ...spend(s, 0, 3), buffs: { ...s.buffs, nextHitBonus: s.buffs.nextHitBonus + 2 } },
          `${c.actor} calls a coordinated strike — next hit +2 damage.`
        ),
    },
  ],
  navigator: [
    {
      id: "evade",
      label: "Evasive maneuvers",
      power: 1,
      hint: "+3 ship defence this round",
      run: (s, c) =>
        log(
          { ...spend(s, 1), ship: { ...s.ship, evasion: s.ship.evasion + 3 } },
          `${c.actor} flies evasive — +3 defence this round.`
        ),
    },
    {
      id: "range",
      label: "Adjust range",
      hint: "toggle close/long — shifts laser & missile effectiveness",
      run: (s, c) => {
        const range = s.range === "close" ? "long" : "close";
        return log({ ...s, range }, `${c.actor} shifts to ${range} range.`);
      },
    },
  ],
  engineer: [
    {
      id: "shields",
      label: "Reinforce shields",
      power: 2,
      hint: `+3 shields (overcap +${SHIELD_OVERCAP})`,
      run: (s, c) =>
        log(
          {
            ...spend(s, 2),
            ship: { ...s.ship, shields: clamp(s.ship.shields + 3, 0, shieldCap(s)) },
          },
          `${c.actor} reinforces shields (+3).`
        ),
    },
    {
      id: "repair",
      label: "Repair hull",
      power: 3,
      hint: "roll vs TN 12 — +3 hull (crit +6)",
      run: (s, c) => {
        const next = spend(s, 3);
        const die = d20();
        const total = die + next.ship.tier;
        if (die === 20 || total >= 12) {
          const heal = die === 20 ? 6 : 3;
          return log(
            { ...next, ship: { ...next.ship, hull: clamp(next.ship.hull + heal, 0, next.ship.maxHull) } },
            `${c.actor} repairs the hull — rolled ${total}${die === 20 ? " (CRIT)" : ""}, +${heal} hull.`
          );
        }
        return log(next, `${c.actor} attempts repairs — rolled ${total} vs 12, no effect.`);
      },
    },
  ],
  sensor: [
    {
      id: "scan",
      label: "Scan / mark",
      power: 1,
      needsTarget: true,
      hint: "mark a target — crew get +2 to hit it",
      run: (s, c) => {
        const next = spend(s, 1);
        return {
          ...next,
          enemies: next.enemies.map((e) =>
            e.id === c.targetId ? { ...e, conditions: addCond(e.conditions, "marked", 2) } : e
          ),
          log: [...next.log, `[R${s.round}] ${c.actor} marks ${enemyName(next, c.targetId)} — weak points exposed.`].slice(-100),
        };
      },
    },
    {
      id: "hack",
      label: "Hack",
      power: 2,
      needsTarget: true,
      hint: "roll vs target TN — on success, breach its shields (−2 def)",
      run: (s, c) => {
        const next = spend(s, 2);
        const enemy = next.enemies.find((e) => e.id === c.targetId);
        if (!enemy) return log(next, `${c.actor} hacks — no target.`);
        const die = d20();
        const total = die + next.ship.tier;
        if (die === 20 || total >= enemy.tn) {
          return {
            ...next,
            enemies: next.enemies.map((e) =>
              e.id === enemy.id ? { ...e, conditions: addCond(e.conditions, "breached", 2) } : e
            ),
            log: [...next.log, `[R${s.round}] ${c.actor} hacks ${enemy.name} — rolled ${total}, shields breached.`].slice(-100),
          };
        }
        return log(next, `${c.actor} hacks ${enemy.name} — rolled ${total} vs ${enemy.tn}, rebuffed.`);
      },
    },
  ],
  gunner: [
    {
      id: "fire",
      label: "Fire",
      weapon: true,
      needsTarget: true,
      hint: "roll d20 + Tier vs target TN; pick a weapon type",
      run: (s, c) => {
        const type = c.weapon ?? "balanced";
        const next = spend(s, WEAPON_POWER[type]);
        const enemy = next.enemies.find((e) => e.id === c.targetId);
        if (!enemy) return log(next, `${c.actor} fires — no target.`);

        const die = d20();
        const crit = die === 20;
        const marked = hasCond(enemy.conditions, "marked");
        const breached = hasCond(enemy.conditions, "breached");
        const rangeMod = type === "laser" ? (s.range === "close" ? 1 : -1) : type === "missile" ? (s.range === "long" ? 1 : -1) : 0;
        const mods = next.ship.tier + next.buffs.attackMod + (marked ? 2 : 0) + rangeMod;
        const total = die + mods;
        const tn = enemy.tn - (breached ? 2 : 0);

        if (!crit && total < tn) {
          return log(next, `${c.actor} fires ${DAMAGE_LABEL[type]} at ${enemy.name} — rolled ${total} vs ${tn}, miss.`);
        }

        let dmg = DAMAGE_BASE[type] + next.buffs.nextHitBonus;
        if (crit) dmg *= 2;
        const res = resolveDamage(enemy.shields, enemy.hull, type, dmg, breached);

        let enemies = next.enemies.map((e) =>
          e.id === enemy.id
            ? {
                ...e,
                shields: res.shields,
                hull: res.hull,
                // crit ignites the target
                conditions: crit ? addCond(e.conditions, "burning", 2) : e.conditions,
              }
            : e
        );
        const destroyed = res.hull <= 0;
        if (destroyed) enemies = enemies.filter((e) => e.id !== enemy.id);

        return log(
          { ...next, enemies, buffs: { ...next.buffs, nextHitBonus: 0 } },
          destroyed
            ? `${c.actor} destroys ${enemy.name}! (${DAMAGE_LABEL[type]}, rolled ${total}${crit ? " CRIT" : ""})`
            : `${c.actor} hits ${enemy.name} with ${DAMAGE_LABEL[type]} — rolled ${total}${crit ? " CRIT" : ""}: ${res.note}.`
        );
      },
    },
  ],
};

function enemyName(s: BattleState, id?: string) {
  return s.enemies.find((e) => e.id === id)?.name ?? "the target";
}

/* --- phase + DM operations ---------------------------------------- */

export function advancePhase(s: BattleState): BattleState {
  const order: BattleState["phase"][] = ["start", "action", "reaction", "end"];
  const i = order.indexOf(s.phase);
  const nextPhase = order[(i + 1) % order.length];

  if (nextPhase === "start") {
    // new round: gains + clear round-scoped state
    const roles = Object.fromEntries(
      (Object.keys(s.roles) as RoleId[]).map((k) => [k, { ...s.roles[k], acted: false }])
    ) as BattleState["roles"];
    return log(
      {
        ...s,
        round: s.round + 1,
        phase: "start",
        roles,
        buffs: { attackMod: 0, nextHitBonus: 0 },
        ship: {
          ...s.ship,
          evasion: 0,
          momentum: clamp(s.ship.momentum + MOMENTUM_PER_ROUND, 0, s.ship.maxMomentum),
          power: clamp(s.ship.power + POWER_PER_ROUND, 0, s.ship.maxPower),
        },
      },
      `Round ${s.round + 1} — Start: +${MOMENTUM_PER_ROUND} Momentum, +${POWER_PER_ROUND} Power.`
    );
  }

  if (nextPhase === "end") {
    return resolveEnd({ ...s, phase: "end" });
  }

  return log({ ...s, phase: nextPhase }, `Phase: ${nextPhase}.`);
}

/** End phase: tick conditions and resolve durations. */
function resolveEnd(s: BattleState): BattleState {
  let state = s;
  // burning damage to enemies, then decay all enemy conditions
  const enemies = state.enemies
    .map((e) => {
      let hull = e.hull;
      if (hasCond(e.conditions, "burning")) hull = Math.max(0, hull - 1);
      const conditions = e.conditions
        .map((c) => ({ ...c, rounds: c.rounds - 1 }))
        .filter((c) => c.rounds > 0);
      return { ...e, hull, conditions };
    })
    .filter((e) => e.hull > 0);

  const burned = state.enemies.some((e) => hasCond(e.conditions, "burning"));
  state = { ...state, enemies };
  if (burned) state = log(state, "End: burning targets take 1 damage.");
  return log(state, "End: conditions resolved.");
}

/** DM: every enemy rolls an attack against the ship. */
export function enemiesFire(s: BattleState): BattleState {
  let state = s;
  const defence = SHIP_DEFENCE_BASE + state.ship.evasion;
  for (const e of state.enemies) {
    const die = d20();
    const total = die + e.tier;
    if (die === 20 || total >= defence) {
      const crit = die === 20;
      const dmg = 2 + (crit ? 2 : 0);
      const breached = hasCond(state.ship.conditions, "breached");
      const res = resolveDamage(state.ship.shields, state.ship.hull, "balanced", dmg, breached);
      state = {
        ...state,
        ship: { ...state.ship, shields: res.shields, hull: res.hull },
      };
      state = log(state, `${e.name} fires — rolled ${total} vs ${defence}${crit ? " CRIT" : ""}: ${res.note}.`);
    } else {
      state = log(state, `${e.name} fires — rolled ${total} vs ${defence}, miss.`);
    }
  }
  return state;
}
