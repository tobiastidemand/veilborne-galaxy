import {
  BEATS,
  CHAIN_CAP,
  CUT_BONUS,
  DAMAGE_BASE,
  DAMAGE_LABEL,
  DEGREE_STEP,
  PER_LINK_HEAVY,
  PER_LINK_LIGHT,
  RANGES,
  SHIELD_OVERCAP,
  SHIP_BY_TIER,
  SHIP_DEFENCE_BASE,
  SYNC_FOR_EPIC,
  freshChain,
  type BattleState,
  type ChainKind,
  type Condition,
  type ConditionKind,
  type DamageType,
  type RoleId,
} from "./types";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const d20 = () => 1 + Math.floor(Math.random() * 20);
const degrees = (total: number, tn: number) => Math.max(0, Math.floor((total - tn) / DEGREE_STEP));

const log = (s: BattleState, line: string): BattleState => ({
  ...s,
  log: [...s.log, `[R${s.round}] ${line}`].slice(-120),
});

const hasCond = (list: Condition[], kind: ConditionKind) => list.some((c) => c.kind === kind);
const addCond = (list: Condition[], kind: ConditionKind, rounds: number): Condition[] => [
  ...list.filter((c) => c.kind !== kind),
  { kind, rounds },
];
const shieldCap = (s: BattleState) => s.ship.maxShields + SHIELD_OVERCAP;

/** Resolve typed damage against a shields/hull pair. */
function resolveDamage(
  shields: number,
  hull: number,
  type: DamageType,
  dmg: number,
  bypassShields: boolean
): { shields: number; hull: number; note: string } {
  if (bypassShields) {
    return { shields, hull: Math.max(0, hull - dmg), note: `${dmg} to hull` };
  }
  let effective = dmg;
  if (shields > 0) {
    if (type === "laser") effective += 1;
    if (type === "missile") effective = Math.max(1, effective - 1);
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
  repair?: "hull" | "shield";
}

interface RunOpts {
  links: number; // chain length driving finish scaling
  cutBonus: number; // +2 if finishing early (a Cut)
}

export interface Ability {
  id: string;
  label: string;
  hint: string;
  role: RoleId;
  chain: ChainKind;
  kind: "open" | "link" | "finish";
  needsTarget?: boolean;
  weapon?: boolean; // gunner: choose a weapon type
  repairChoice?: boolean; // engineer: hull or shield
  run: (s: BattleState, c: ActionCtx, o: RunOpts) => { state: BattleState; success: boolean };
}

/* --- shared attack resolution (every attack finisher routes through here) -- */

function attack(
  s: BattleState,
  c: ActionCtx,
  o: RunOpts,
  type: DamageType,
  perLink: number,
  extra?: { autoBreach?: boolean; critRange?: number; disableOnHit?: boolean }
): { state: BattleState; success: boolean } {
  const enemy = s.enemies.find((e) => e.id === c.targetId);
  if (!enemy) return { state: log(s, `${c.actor} fires — no target.`), success: false };

  const h = s.chain.handoff;
  const die = d20();
  const critRange = extra?.critRange ?? 20;
  const crit = die >= critRange;
  const marked = hasCond(enemy.conditions, "marked");
  const breached = hasCond(enemy.conditions, "breached");
  const total = die + s.ship.tier + h.toHit + (marked ? 2 : 0) + o.cutBonus;
  const tn = enemy.tn - h.tnDown - (breached ? 2 : 0);
  const label = DAMAGE_LABEL[type];

  const writeEnemy = (shields: number, hull: number, conditions: Condition[]) =>
    s.enemies
      .map((e) => (e.id === enemy.id ? { ...e, shields, hull, conditions } : e))
      .filter((e) => e.hull > 0);

  if (!crit && total < tn) {
    if (total >= tn - 2) {
      const res = resolveDamage(enemy.shields, enemy.hull, type, 1, type === "ap" || breached);
      return {
        state: log(
          { ...s, enemies: writeEnemy(res.shields, res.hull, enemy.conditions) },
          `${c.actor} grazes ${enemy.name} (${label}) — ${total} vs ${tn}: ${res.note}.`
        ),
        success: false,
      };
    }
    return {
      state: log(s, `${c.actor} fires ${label} at ${enemy.name} — ${total} vs ${tn}, miss.`),
      success: false,
    };
  }

  const links = Math.min(o.links, CHAIN_CAP);
  let dmg = DAMAGE_BASE[type] + h.effectStep + perLink * links + degrees(total, tn);
  if (crit) dmg *= 2;
  const bypass = h.ignoreShields || type === "ap" || breached || !!extra?.autoBreach;
  const res = resolveDamage(enemy.shields, enemy.hull, type, dmg, bypass);

  let conds = enemy.conditions;
  if (crit) conds = addCond(conds, "burning", 2);
  if (type === "ap" || extra?.autoBreach) conds = addCond(conds, "breached", 2);
  if (extra?.disableOnHit) conds = addCond(conds, "disabled", 1);

  const enemies = writeEnemy(res.shields, res.hull, conds);
  const dead = res.hull <= 0;
  const linkNote = links > 0 ? ` [chain ${links}]` : "";
  return {
    state: log(
      { ...s, enemies },
      dead
        ? `${c.actor} DESTROYS ${enemy.name}! (${label}, ${total}${crit ? " CRIT" : ""}${linkNote})`
        : `${c.actor} hits ${enemy.name} (${label}, ${total}${crit ? " CRIT" : ""}${linkNote}): ${res.note}.`
    ),
    success: true,
  };
}

/* --- handoff / ship mutation helpers ------------------------------------- */

const bumpHandoff = (s: BattleState, patch: Partial<BattleState["chain"]["handoff"]>): BattleState => ({
  ...s,
  chain: { ...s.chain, handoff: { ...s.chain.handoff, ...patch } },
});

const markEnemy = (s: BattleState, id: string | undefined, kind: ConditionKind, rounds: number): BattleState => ({
  ...s,
  enemies: s.enemies.map((e) => (e.id === id ? { ...e, conditions: addCond(e.conditions, kind, rounds) } : e)),
});

/* --- the ability matrix (§6 of docs/ship-combat.md) ---------------------- */

export const ROLE_KIT: Record<RoleId, Ability[]> = {
  commander: [
    {
      id: "call-the-shot",
      label: "Call the Shot",
      hint: "Open the Strike: name a target; the chain gains +Tier to hit and shakes its defence.",
      role: "commander",
      chain: "strike",
      kind: "open",
      needsTarget: true,
      run: (s, c) => {
        const t = s.ship.tier;
        const ns = bumpHandoff(
          { ...s, chain: { ...s.chain, targetId: c.targetId ?? null } },
          { toHit: s.chain.handoff.toHit + t, tnDown: s.chain.handoff.tnDown + 1 }
        );
        return {
          state: log(ns, `${c.actor} calls the shot on ${enemyName(ns, c.targetId)} — chain +${t} to hit.`),
          success: true,
        };
      },
    },
    {
      id: "all-hands",
      label: "All Hands",
      hint: "Open the Brace: read the threat; the ship gains +Tier defence.",
      role: "commander",
      chain: "brace",
      kind: "open",
      run: (s, c) => {
        const t = s.ship.tier;
        const ns = bumpHandoff({ ...s, ship: { ...s.ship, evasion: s.ship.evasion + t } }, {
          defense: s.chain.handoff.defense + t,
        });
        return { state: log(ns, `${c.actor} calls all hands — +${t} ship defence.`), success: true };
      },
    },
  ],
  navigator: [
    {
      id: "attack-vector",
      label: "Attack Vector",
      hint: "Link · Strike: win the firing line. Chain +2 to hit.",
      role: "navigator",
      chain: "strike",
      kind: "link",
      run: (s, c) => ({
        state: log(bumpHandoff(s, { toHit: s.chain.handoff.toHit + 2 }), `${c.actor} swings to a clean vector — chain +2 to hit.`),
        success: true,
      }),
    },
    {
      id: "strafing-run",
      label: "Strafing Run",
      hint: "Finish · Strike: a fast pass. +1 damage per link.",
      role: "navigator",
      chain: "strike",
      kind: "finish",
      needsTarget: true,
      run: (s, c, o) => attack(s, c, o, "balanced", PER_LINK_LIGHT),
    },
    {
      id: "evasive",
      label: "Evasive",
      hint: "Link · Brace: pull from the kill zone. +2 ship defence.",
      role: "navigator",
      chain: "brace",
      kind: "link",
      run: (s, c) => ({
        state: log({ ...s, ship: { ...s.ship, evasion: s.ship.evasion + 2 } }, `${c.actor} flies evasive — +2 defence.`),
        success: true,
      }),
    },
    {
      id: "break-contact",
      label: "Break Contact",
      hint: "Finish · Brace: disengage to a safer band; +2 defence and shoot the gap.",
      role: "navigator",
      chain: "brace",
      kind: "finish",
      run: (s, c, o) => {
        const i = Math.min(RANGES.length - 1, RANGES.indexOf(s.range) + 1);
        const range = RANGES[i];
        const ns = {
          ...s,
          range,
          ship: { ...s.ship, evasion: s.ship.evasion + 2, negate: s.ship.negate + 1 },
        };
        return {
          state: log(ns, `${c.actor} breaks contact to ${range} range — the run is spoiled. [chain ${Math.min(o.links, CHAIN_CAP)}]`),
          success: true,
        };
      },
    },
  ],
  engineer: [
    {
      id: "overcharge",
      label: "Overcharge",
      hint: "Link · Strike: route reactor power. Chain +1 effect step.",
      role: "engineer",
      chain: "strike",
      kind: "link",
      run: (s, c) => ({
        state: log(bumpHandoff(s, { effectStep: s.chain.handoff.effectStep + 1 }), `${c.actor} overcharges the line — chain +1 effect.`),
        success: true,
      }),
    },
    {
      id: "reactor-lance",
      label: "Reactor Lance",
      hint: "Finish · Strike: a system-frying blow. +2 damage per link; bypasses shields and Disables.",
      role: "engineer",
      chain: "strike",
      kind: "finish",
      needsTarget: true,
      run: (s, c, o) => attack(s, c, o, "ap", PER_LINK_HEAVY, { disableOnHit: true }),
    },
    {
      id: "reroute",
      label: "Reroute",
      hint: "Link · Brace: shunt power to shields. +2 shields.",
      role: "engineer",
      chain: "brace",
      kind: "link",
      run: (s, c) => ({
        state: log(
          { ...s, ship: { ...s.ship, shields: clamp(s.ship.shields + 2, 0, shieldCap(s)) } },
          `${c.actor} reroutes to shields — +2.`
        ),
        success: true,
      }),
    },
    {
      id: "damage-control",
      label: "Damage Control",
      hint: "Finish · Brace: restore Hull or Shields. +1 per link.",
      role: "engineer",
      chain: "brace",
      kind: "finish",
      repairChoice: true,
      run: (s, c, o) => {
        const amount = 3 + PER_LINK_LIGHT * Math.min(o.links, CHAIN_CAP);
        if (c.repair === "shield") {
          return {
            state: log(
              { ...s, ship: { ...s.ship, shields: clamp(s.ship.shields + amount, 0, shieldCap(s)) } },
              `${c.actor} runs damage control — +${amount} shields.`
            ),
            success: true,
          };
        }
        return {
          state: log(
            { ...s, ship: { ...s.ship, hull: clamp(s.ship.hull + amount, 0, s.ship.maxHull) } },
            `${c.actor} runs damage control — +${amount} hull.`
          ),
          success: true,
        };
      },
    },
  ],
  sensor: [
    {
      id: "target-lock",
      label: "Target Lock",
      hint: "Link · Strike: paint a weak point. Marks the target; chain ignores its shields and TN −2.",
      role: "sensor",
      chain: "strike",
      kind: "link",
      needsTarget: true,
      run: (s, c) => {
        const ns = bumpHandoff(markEnemy(s, c.targetId, "marked", 2), {
          ignoreShields: true,
          tnDown: s.chain.handoff.tnDown + 2,
        });
        return { state: log(ns, `${c.actor} locks ${enemyName(ns, c.targetId)} — weak points exposed.`), success: true };
      },
    },
    {
      id: "killbox",
      label: "Killbox",
      hint: "Finish · Strike: certainty. Auto-Breach, crits on 19–20. +1 damage per link.",
      role: "sensor",
      chain: "strike",
      kind: "finish",
      needsTarget: true,
      run: (s, c, o) => attack(s, c, o, "balanced", PER_LINK_LIGHT, { autoBreach: true, critRange: 19 }),
    },
    {
      id: "blur",
      label: "Blur",
      hint: "Link · Brace: hack enemy optics. Incoming −2 this beat.",
      role: "sensor",
      chain: "brace",
      kind: "link",
      run: (s, c) => ({
        state: log({ ...s, ship: { ...s.ship, conceal: s.ship.conceal + 2 } }, `${c.actor} blurs the ship — incoming −2.`),
        success: true,
      }),
    },
    {
      id: "ghost",
      label: "Ghost",
      hint: "Finish · Brace: spoof the enemy. Negate one incoming hit, +1 per two links.",
      role: "sensor",
      chain: "brace",
      kind: "finish",
      run: (s, c, o) => {
        const n = 1 + Math.floor(Math.min(o.links, CHAIN_CAP) / 2);
        return {
          state: log({ ...s, ship: { ...s.ship, negate: s.ship.negate + n } }, `${c.actor} ghosts the ship — ${n} incoming hit(s) will miss.`),
          success: true,
        };
      },
    },
  ],
  gunner: [
    {
      id: "suppressing-volley",
      label: "Suppressing Volley",
      hint: "Link · Strike: pin the enemy. Chain TN −2 and chip damage.",
      role: "gunner",
      chain: "strike",
      kind: "link",
      needsTarget: true,
      run: (s, c) => {
        const enemy = s.enemies.find((e) => e.id === c.targetId);
        const chipped = enemy
          ? s.enemies.map((e) => (e.id === enemy.id ? { ...e, hull: Math.max(0, e.hull - 1) } : e)).filter((e) => e.hull > 0)
          : s.enemies;
        const ns = bumpHandoff({ ...s, enemies: chipped }, { tnDown: s.chain.handoff.tnDown + 2 });
        return { state: log(ns, `${c.actor} lays a suppressing volley — chain TN −2.`), success: true };
      },
    },
    {
      id: "killing-blow",
      label: "Killing Blow",
      hint: "Finish · Strike: the payoff. +2 damage per link; choose a weapon type.",
      role: "gunner",
      chain: "strike",
      kind: "finish",
      needsTarget: true,
      weapon: true,
      run: (s, c, o) => attack(s, c, o, c.weapon ?? "balanced", PER_LINK_HEAVY),
    },
    {
      id: "point-defense",
      label: "Point Defense",
      hint: "Link · Brace: shoot down incoming ordnance. Negate one incoming hit.",
      role: "gunner",
      chain: "brace",
      kind: "link",
      run: (s, c) => ({
        state: log({ ...s, ship: { ...s.ship, negate: s.ship.negate + 1 } }, `${c.actor} works point defense — one incoming hit will be intercepted.`),
        success: true,
      }),
    },
    {
      id: "counter-volley",
      label: "Counter-Volley",
      hint: "Finish · Brace: turn defense to offense. +1 damage per link.",
      role: "gunner",
      chain: "brace",
      kind: "finish",
      needsTarget: true,
      run: (s, c, o) => attack(s, c, o, "balanced", PER_LINK_LIGHT),
    },
  ],
};

/** Generic Open for a commanderless table (any officer can take the captaincy). */
const GENERIC_OPEN: Record<ChainKind, Ability> = {
  strike: {
    id: "generic-open-strike",
    label: "Take the Lead",
    hint: "Open the Strike (no Commander): chain +Tier to hit.",
    role: "commander",
    chain: "strike",
    kind: "open",
    run: (s, c) => ({
      state: log(bumpHandoff(s, { toHit: s.chain.handoff.toHit + s.ship.tier }), `${c.actor} takes the lead — chain +${s.ship.tier} to hit.`),
      success: true,
    }),
  },
  brace: {
    id: "generic-open-brace",
    label: "Take the Lead",
    hint: "Open the Brace (no Commander): +Tier ship defence.",
    role: "commander",
    chain: "brace",
    kind: "open",
    run: (s, c) => ({
      state: log({ ...s, ship: { ...s.ship, evasion: s.ship.evasion + s.ship.tier } }, `${c.actor} takes the lead — +${s.ship.tier} defence.`),
      success: true,
    }),
  },
};

function enemyName(s: BattleState, id?: string) {
  return s.enemies.find((e) => e.id === id)?.name ?? "the target";
}

function findAbility(roleId: RoleId, abilityId: string): Ability | undefined {
  if (abilityId === GENERIC_OPEN.strike.id) return GENERIC_OPEN.strike;
  if (abilityId === GENERIC_OPEN.brace.id) return GENERIC_OPEN.brace;
  return ROLE_KIT[roleId].find((a) => a.id === abilityId);
}

/* --- what a given seat may do right now ---------------------------------- */

export function availableAbilities(s: BattleState, roleId: RoleId): Ability[] {
  if (!s.active) return [];
  if (s.beat !== "strike" && s.beat !== "brace") return [];
  const chainKind: ChainKind = s.beat;
  const kit = ROLE_KIT[roleId].filter((a) => a.chain === chainKind);
  const ch = s.chain;
  const acted = ch.acted.includes(roleId);

  // Epic Chain — position dissolves; every officer Finishes once at full scale.
  if (ch.epic) return acted ? [] : kit.filter((a) => a.kind === "finish");

  // Chain not yet opened — someone must Open.
  if (!ch.open) {
    if (roleId === "commander") return kit.filter((a) => a.kind === "open");
    if (!s.roles.commander.claimedBy) return [GENERIC_OPEN[chainKind]]; // commanderless
    return [];
  }

  if (ch.done || acted || roleId === ch.opener) return [];
  return kit.filter((a) => a.kind === "link" || a.kind === "finish");
}

/* --- applying an ability (handles all chain bookkeeping) ----------------- */

export function applyAbility(s: BattleState, roleId: RoleId, abilityId: string, ctx: ActionCtx): BattleState {
  const ability = findAbility(roleId, abilityId);
  if (!ability) return s;
  if (s.beat !== ability.chain) return s;

  // Open
  if (ability.kind === "open") {
    if (s.chain.open) return s;
    const base: BattleState = {
      ...s,
      chain: { ...freshChain(), kind: ability.chain, open: true, opener: roleId, acted: [roleId], length: 1 },
    };
    return ability.run(base, ctx, { links: 0, cutBonus: 0 }).state;
  }

  // Link / Finish require an open chain of the matching kind
  if (!s.chain.open || s.chain.kind !== ability.chain || s.chain.done) return s;
  if (s.chain.acted.includes(roleId) && !s.chain.epic) return s;

  const links = s.chain.epic ? CHAIN_CAP : s.chain.length;

  if (ability.kind === "link") {
    const res = ability.run(s, ctx, { links, cutBonus: 0 });
    return {
      ...res.state,
      chain: { ...res.state.chain, acted: [...res.state.chain.acted, roleId], length: res.state.chain.length + 1 },
    };
  }

  // Finish
  const claimedUnacted = (Object.keys(s.roles) as RoleId[]).filter(
    (r) => s.roles[r].claimedBy && !s.chain.acted.includes(r) && r !== roleId
  ).length;
  const cut = !s.chain.epic && claimedUnacted > 0;
  const res = ability.run(s, ctx, { links, cutBonus: cut ? CUT_BONUS : 0 });
  let ns = {
    ...res.state,
    chain: { ...res.state.chain, acted: [...res.state.chain.acted, roleId], length: res.state.chain.length + 1 },
  };

  if (s.chain.epic) {
    // Epic: many officers finish; the chain stays open until the GM advances.
    return ns;
  }

  // Sync bookkeeping on a normal Finisher.
  ns = { ...ns, chain: { ...ns.chain, done: true } };
  if (res.success) {
    const next = s.ship.sync + 1;
    if (next >= SYNC_FOR_EPIC) {
      ns = log({ ...ns, ship: { ...ns.ship, sync: 0, epicBanked: true } }, `✦ PERFECT SYNC — the crew banks an Epic Chain!`);
    } else {
      ns = log({ ...ns, ship: { ...ns.ship, sync: next } }, `Chain lands — Sync ${next}/${SYNC_FOR_EPIC}.`);
    }
  } else if (s.ship.sync > 0) {
    ns = log({ ...ns, ship: { ...ns.ship, sync: 0 } }, `Finisher fell short — Sync resets.`);
  }
  if (cut) ns = log(ns, `(Cut — finished early for +${CUT_BONUS}.)`);
  return ns;
}

/* --- the Commander unleashes a banked Epic Chain ------------------------- */

export function unleashEpic(s: BattleState): BattleState {
  if (!s.ship.epicBanked || (s.beat !== "strike" && s.beat !== "brace") || s.chain.open) return s;
  const kind: ChainKind = s.beat;
  const ns: BattleState = {
    ...s,
    ship: { ...s.ship, epicBanked: false },
    chain: { ...freshChain(), kind, open: true, opener: null, acted: [], length: CHAIN_CAP, epic: true },
  };
  return log(ns, `★ EPIC ${kind.toUpperCase()} — all stations, as one! Every officer Finishes at full power.`);
}

/* --- beats --------------------------------------------------------------- */

function beatBanner(beat: BattleState["beat"]): string {
  switch (beat) {
    case "strike":
      return "Strike Chain — the Commander opens. Build the combo.";
    case "brace":
      return "Brace Chain — the enemy moves. Weather it together.";
    case "cooldown":
      return "Cool Down — conditions resolve.";
    default:
      return "Spool Up.";
  }
}

function enterSpool(s: BattleState): BattleState {
  const round = s.round + 1;
  const shields = clamp(s.ship.shields + s.ship.shieldRegen, 0, s.ship.maxShields);
  return log(
    {
      ...s,
      round,
      beat: "spool",
      chain: freshChain(),
      ship: { ...s.ship, shields, evasion: 0, conceal: 0, negate: 0 },
    },
    `Round ${round} — Spool Up: shields regen +${s.ship.shieldRegen}.`
  );
}

export function advanceBeat(s: BattleState): BattleState {
  const i = BEATS.indexOf(s.beat);
  const next = BEATS[(i + 1) % BEATS.length];
  if (next === "spool") return enterSpool(s);
  if (next === "cooldown") return resolveCooldown({ ...s, beat: "cooldown" });
  return log({ ...s, beat: next, chain: freshChain() }, beatBanner(next));
}

function resolveCooldown(s: BattleState): BattleState {
  let shipHull = s.ship.hull;
  const shipBurning = hasCond(s.ship.conditions, "burning");
  if (shipBurning) shipHull = Math.max(0, shipHull - 1);
  const shipConditions = s.ship.conditions.map((c) => ({ ...c, rounds: c.rounds - 1 })).filter((c) => c.rounds > 0);

  let burnedEnemy = false;
  const enemies = s.enemies
    .map((e) => {
      let hull = e.hull;
      if (hasCond(e.conditions, "burning")) {
        hull = Math.max(0, hull - 1);
        burnedEnemy = true;
      }
      const conditions = e.conditions.map((c) => ({ ...c, rounds: c.rounds - 1 })).filter((c) => c.rounds > 0);
      return { ...e, hull, conditions };
    })
    .filter((e) => e.hull > 0);

  let state: BattleState = {
    ...s,
    ship: { ...s.ship, hull: shipHull, conditions: shipConditions },
    enemies,
  };
  if (shipBurning || burnedEnemy) state = log(state, "Cool Down: burning takes its toll.");
  return log(state, "Cool Down: conditions tick down.");
}

/* --- GM: the enemy turn (resolved during the Brace beat) ----------------- */

export function enemiesFire(s: BattleState): BattleState {
  let state = s;
  const defence = SHIP_DEFENCE_BASE + state.ship.evasion;
  for (const e of state.enemies) {
    if (hasCond(e.conditions, "disabled")) {
      state = log(state, `${e.name} is disabled — holds fire.`);
      continue;
    }
    const die = d20();
    const total = die + e.tier - state.ship.conceal;
    const crit = die === 20;
    if (!crit && total < defence) {
      state = log(state, `${e.name} fires — ${total} vs ${defence}, miss.`);
      continue;
    }
    if (state.ship.negate > 0) {
      state = log({ ...state, ship: { ...state.ship, negate: state.ship.negate - 1 } }, `${e.name} fires — intercepted! (point defense / ghost)`);
      continue;
    }
    let dmg = e.atk + degrees(total, defence);
    if (crit) dmg *= 2;
    const breached = hasCond(state.ship.conditions, "breached");
    const res = resolveDamage(state.ship.shields, state.ship.hull, "balanced", dmg, breached);
    state = {
      ...state,
      ship: {
        ...state.ship,
        shields: res.shields,
        hull: res.hull,
        conditions: crit ? addCond(state.ship.conditions, "burning", 2) : state.ship.conditions,
      },
    };
    state = log(state, `${e.name} fires — ${total} vs ${defence}${crit ? " CRIT" : ""}: ${res.note}.`);
  }
  return state;
}

/* --- GM: commence / end -------------------------------------------------- */

export function commence(s: BattleState): BattleState {
  const t = SHIP_BY_TIER[s.ship.tier] ?? SHIP_BY_TIER[1];
  return log(
    {
      ...s,
      active: true,
      round: 1,
      beat: "strike",
      chain: freshChain(),
      ship: {
        ...s.ship,
        shields: Math.min(s.ship.maxShields, Math.max(s.ship.shields, t.shields)),
        evasion: 0,
        conceal: 0,
        negate: 0,
        sync: 0,
        epicBanked: false,
        extendUsed: false,
      },
    },
    "Battle commences — crew to stations. Strike Chain: the Commander opens."
  );
}

export function endBattle(s: BattleState): BattleState {
  return log({ ...s, active: false, chain: freshChain() }, "The engagement ends.");
}
