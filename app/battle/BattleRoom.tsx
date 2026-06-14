"use client";

import Link from "next/link";
import { useState } from "react";

import { RoleCard } from "./RoleCard";
import { useBattle } from "./useBattle";
import {
  advanceBeat,
  applyAbility,
  commence,
  endBattle,
  enemiesFire,
  unleashEpic,
  type Ability,
  type ActionCtx,
} from "./engine";
import { FRAMES, SYSTEMS, WEAPONS, computeLoadout } from "./shipBuilding";
import {
  BEATS,
  ROLES,
  makeEnemy,
  type Beat,
  type BattleState,
  type Condition,
  type EnemySize,
  type FrameId,
  type RoleId,
  type SystemId,
  type WeaponId,
} from "./types";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const BEAT_LABEL: Record<Beat, string> = {
  spool: "Spool Up",
  strike: "Strike Chain",
  brace: "Brace Chain",
  cooldown: "Cool Down",
};

function Bar({ label, value, max, color, soft }: { label: string; value: number; max: number; color: string; soft?: number }) {
  const pct = max > 0 ? clamp((value / max) * 100, 0, 100) : 0;
  const softPct = soft && max > 0 ? clamp((soft / max) * 100, 0, 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[10px] uppercase tracking-[0.16em] text-[#c9a84c]/70">
        <span>{label}</span>
        <span className="text-[#e9e2d0]/80">
          {value} / {soft ?? max}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
        {softPct > 0 && <div className="absolute inset-y-0 left-0 bg-white/10" style={{ width: `${softPct}%` }} />}
        <div className="relative h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function condTag(c: Condition) {
  const styles: Record<string, string> = {
    marked: "border-[#cc88ff]/50 text-[#cc88ff]",
    breached: "border-[#ff9f40]/50 text-[#ff9f40]",
    burning: "border-[#ff6b6b]/50 text-[#ff6b6b]",
    disabled: "border-[#7fe0ff]/50 text-[#7fe0ff]",
  };
  return (
    <span key={c.kind} className={`rounded border px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider ${styles[c.kind]}`}>
      {c.kind} {c.rounds}
    </span>
  );
}

function readDm(): boolean {
  const flag = new URLSearchParams(window.location.search).get("dm");
  if (flag === "1") return true;
  if (flag === "0") return false;
  try {
    return localStorage.getItem("veilborn.dm") === "1";
  } catch {
    return false;
  }
}

export default function BattleRoom() {
  const { state, update, configured, connected } = useBattle();
  const [dm] = useState(readDm);
  const [crew, setCrew] = useState(() => {
    try {
      return localStorage.getItem("veilborn.crew") ?? "";
    } catch {
      return "";
    }
  });
  const [enemyName, setEnemyName] = useState("Cobalt Reaver");
  const [enemyTier, setEnemyTier] = useState(1);
  const [enemySize, setEnemySize] = useState<EnemySize>("line");

  const saveCrew = (name: string) => {
    setCrew(name);
    try {
      localStorage.setItem("veilborn.crew", name);
    } catch {
      /* ignore */
    }
  };

  const act = (roleId: RoleId, ability: Ability, ctx: Partial<ActionCtx>) =>
    update((s) => applyAbility(s, roleId, ability.id, { actor: crew || "Someone", ...ctx }));

  const setClaim = (id: RoleId, claimedBy: string | null) =>
    update((s) => ({ ...s, roles: { ...s.roles, [id]: { ...s.roles[id], claimedBy } } }));

  const ch = state.chain;
  const loadout = computeLoadout(state.build, state.ship.tier);
  const iAmCommander = state.roles.commander.claimedBy === crew && !!crew;
  const canUnleash = state.ship.epicBanked && (state.beat === "strike" || state.beat === "brace") && !ch.open;

  const status = configured
    ? connected
      ? { dot: "bg-[#7fff9f]", label: "LIVE" }
      : { dot: "bg-[#ff9f40]", label: "CONNECTING" }
    : { dot: "bg-[#ff9f40]", label: "LOCAL PREVIEW" };

  return (
    <div className="min-h-dvh w-full bg-[#03020a] font-body text-[#e9e2d0]">
      <div className="scanlines pointer-events-none fixed inset-0 z-50" />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        {/* header */}
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[#c9a84c]/35 pb-3">
          <div>
            <h1 className="font-title text-2xl font-black tracking-[0.14em] text-[#f0d080] drop-shadow-[0_0_18px_rgba(240,208,128,0.25)]">
              Battle Stations
            </h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#c9a84c]/70">
              <span>Round {state.round}</span>
              <span className="text-[#c9a84c]/40">·</span>
              <span>Tier {state.ship.tier}</span>
              <span className="text-[#c9a84c]/40">·</span>
              <span>{state.range} range</span>
              {dm && <span className="rounded border border-[#7fe0ff]/50 px-1.5 py-0.5 text-[9px] font-bold text-[#7fe0ff]">DM</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#e9e2d0]/45">
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <Link href="/" className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a84c] transition-colors hover:text-[#f0d080]">
              ‹ Chart
            </Link>
          </div>
        </header>

        {/* beat tracker */}
        <div className="mb-4 flex items-center gap-2">
          {BEATS.map((b) => (
            <span
              key={b}
              className={`flex-1 rounded-sm border px-2 py-1 text-center font-display text-[10px] font-bold uppercase tracking-[0.14em] ${
                state.beat === b && state.active ? "border-[#f0d080] bg-[#f0d080]/10 text-[#f0d080]" : "border-white/10 text-white/35"
              }`}
            >
              {BEAT_LABEL[b]}
            </span>
          ))}
        </div>

        {!configured && (
          <div className="mb-4 rounded-sm border border-[#ff9f40]/40 bg-[#ff9f40]/5 px-4 py-2 text-[12px] text-[#ffd2a0]/90">
            Local preview — add Supabase env to sync all crew screens. Combat logic runs fully here for testing.
          </div>
        )}

        {/* Epic banner */}
        {canUnleash && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[#f0d080]/60 bg-[#f0d080]/10 px-4 py-2">
            <span className="font-display text-[12px] font-bold uppercase tracking-[0.2em] text-[#f0d080]">
              ★ Epic Chain ready — the crew is in perfect sync
            </span>
            {(iAmCommander || dm) && (
              <button
                onClick={() => update(unleashEpic)}
                className="rounded border border-[#f0d080] px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[#f0d080] hover:bg-[#f0d080]/20"
              >
                Unleash Epic {state.beat === "strike" ? "Strike" : "Brace"}
              </button>
            )}
          </div>
        )}

        {/* crew identity */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-[11px] uppercase tracking-[0.2em] text-[#c9a84c]/70">Crew name</label>
          <input
            value={crew}
            onChange={(e) => saveCrew(e.target.value)}
            placeholder="name your officer…"
            className="rounded border border-[#c9a84c]/40 bg-[#0b0820]/60 px-3 py-1 text-sm outline-none placeholder:text-white/25 focus:border-[#f0d080]"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-4">
            {/* ship */}
            <section className="tome-panel tome-frame rounded-sm border border-[#c9a84c]/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#c9a84c]">Survey Vessel</span>
                <div className="flex flex-wrap items-center gap-1 text-[9px] uppercase tracking-wider">
                  {state.ship.evasion > 0 && <span className="rounded border border-[#7fe0ff]/40 px-1 py-0.5 text-[#7fe0ff]">+{state.ship.evasion} def</span>}
                  {state.ship.conceal > 0 && <span className="rounded border border-[#cc88ff]/40 px-1 py-0.5 text-[#cc88ff]">−{state.ship.conceal} incoming</span>}
                  {state.ship.negate > 0 && <span className="rounded border border-[#7fff9f]/40 px-1 py-0.5 text-[#7fff9f]">{state.ship.negate} intercept</span>}
                  {state.ship.conditions.map(condTag)}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Bar label="Hull" value={state.ship.hull} max={state.ship.maxHull} color="#ff8855" />
                <Bar label="Shields" value={state.ship.shields} max={state.ship.maxShields + loadout.overcap} soft={state.ship.maxShields} color="#7fe0ff" />
              </div>

              {/* sync meter */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#c9a84c]/70">Sync</span>
                <div className="flex gap-1">
                  {Array.from({ length: loadout.syncNeeded }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 w-5 rounded-sm border ${
                        i < state.ship.sync ? "border-[#f0d080] bg-[#f0d080]/70" : "border-white/15 bg-white/5"
                      }`}
                    />
                  ))}
                </div>
                {state.ship.epicBanked && <span className="text-[10px] font-bold uppercase tracking-wider text-[#f0d080]">★ Epic banked</span>}
              </div>

              {state.ship.hull <= 0 && (
                <div className="mt-3 text-center font-display text-sm font-bold uppercase tracking-[0.2em] text-[#ff6b6b]">
                  ☠ Hull breached — the vessel is crippled
                </div>
              )}
            </section>

            {/* drydock */}
            <Drydock state={state} update={update} />

            {/* chain status */}
            {state.active && (state.beat === "strike" || state.beat === "brace") && (
              <section className={`rounded-sm border p-3 ${ch.epic ? "border-[#f0d080]/60 bg-[#f0d080]/5" : "border-white/15"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a84c]">
                    {ch.epic ? "★ Epic " : ""}
                    {state.beat === "strike" ? "Strike" : "Brace"} Chain
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/45">
                    {!ch.open
                      ? "Awaiting the Open"
                      : ch.done
                      ? "Chain complete — GM advances"
                      : `Length ${ch.length}${ch.epic ? " (full)" : ""}`}
                  </span>
                </div>
                {ch.open && (
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-[9px] uppercase tracking-wider">
                    {ch.acted.map((r) => (
                      <span key={r} className="rounded border border-[#c9a84c]/40 px-1 py-0.5 text-[#e9e2d0]/70">
                        {ROLES.find((x) => x.id === r)?.name ?? r}
                      </span>
                    ))}
                    {ch.handoff.toHit > 0 && <Hand>+{ch.handoff.toHit} hit</Hand>}
                    {ch.handoff.effectStep > 0 && <Hand>+{ch.handoff.effectStep} effect</Hand>}
                    {ch.handoff.tnDown > 0 && <Hand>TN −{ch.handoff.tnDown}</Hand>}
                    {ch.handoff.ignoreShields && <Hand>bypass shields</Hand>}
                  </div>
                )}
                {!ch.open && (
                  <p className="mt-1.5 text-[10px] italic text-white/35">
                    {state.beat === "strike"
                      ? "The Commander opens with Call the Shot, then the crew links toward a Finisher."
                      : "The GM declares the enemy's move; the Commander opens with All Hands, then the crew braces."}
                  </p>
                )}
              </section>
            )}

            {/* roles */}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {ROLES.map((r) => (
                <RoleCard
                  key={r.id}
                  id={r.id}
                  state={state}
                  crewName={crew}
                  onClaim={() => setClaim(r.id, crew)}
                  onRelease={() => setClaim(r.id, null)}
                  onAct={(ability, ctx) => act(r.id, ability, ctx)}
                />
              ))}
            </section>
          </div>

          {/* enemies + log */}
          <div className="flex flex-col gap-4">
            <section className="tome-panel tome-frame rounded-sm border border-[#ff6b6b]/30 p-4">
              <div className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#ff6b6b]/80">Hostiles</div>
              {state.enemies.length === 0 ? (
                <p className="text-[12px] italic text-white/35">No contacts.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {state.enemies.map((e) => (
                    <li key={e.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] text-[#e9e2d0]/70">
                        <span>{e.name}</span>
                        <span className="text-white/40">TN {e.tn} · T{e.tier}</span>
                      </div>
                      <Bar label="Hull" value={e.hull} max={e.maxHull} color="#ff6b6b" />
                      {e.maxShields > 0 && <Bar label="Shields" value={e.shields} max={e.maxShields} color="#7fe0ff" />}
                      {e.conditions.length > 0 && <div className="flex flex-wrap gap-1">{e.conditions.map(condTag)}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="tome-panel tome-frame tome-scroll max-h-[44vh] overflow-y-auto rounded-sm border border-[#c9a84c]/30 p-4">
              <div className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#c9a84c]">Combat Log</div>
              <ul className="flex flex-col gap-1 text-[12px] leading-snug text-[#e9e2d0]/70">
                {[...state.log].reverse().map((line, i) => (
                  <li key={state.log.length - i} className="border-b border-white/5 pb-1">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* DM controls */}
        {dm && (
          <section className="mt-6 rounded-sm border border-[#7fe0ff]/40 bg-[#7fe0ff]/5 p-4">
            <div className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#7fe0ff]">Dungeon Master</div>
            <div className="mb-4 flex flex-wrap gap-2">
              {!state.active ? (
                <Dm onClick={() => update(commence)} disabled={!loadout.valid}>
                  ⚔ Commence battle{loadout.valid ? "" : " (fix build)"}
                </Dm>
              ) : (
                <>
                  <Dm onClick={() => update(advanceBeat)}>▶ Next beat</Dm>
                  {state.beat === "brace" && <Dm onClick={() => update(enemiesFire)}>✦ Enemies fire</Dm>}
                  {canUnleash && <Dm onClick={() => update(unleashEpic)}>★ Unleash Epic</Dm>}
                  <Dm onClick={() => update(endBattle)}>✕ End battle</Dm>
                </>
              )}
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <input
                value={enemyName}
                onChange={(e) => setEnemyName(e.target.value)}
                className="w-40 rounded border border-[#7fe0ff]/30 bg-[#0b0820]/60 px-2 py-1 text-sm outline-none focus:border-[#7fe0ff]"
              />
              <select
                value={enemyTier}
                onChange={(e) => setEnemyTier(Number(e.target.value))}
                className="rounded border border-[#7fe0ff]/30 bg-[#0b0820]/60 px-2 py-1 text-sm outline-none focus:border-[#7fe0ff]"
              >
                {[1, 2, 3, 4, 5].map((t) => (
                  <option key={t} value={t} className="bg-[#0b0820]">
                    Tier {t}
                  </option>
                ))}
              </select>
              <select
                value={enemySize}
                onChange={(e) => setEnemySize(e.target.value as EnemySize)}
                className="rounded border border-[#7fe0ff]/30 bg-[#0b0820]/60 px-2 py-1 text-sm outline-none focus:border-[#7fe0ff]"
              >
                <option value="skirmisher" className="bg-[#0b0820]">Skirmisher</option>
                <option value="line" className="bg-[#0b0820]">Line</option>
                <option value="elite" className="bg-[#0b0820]">Elite</option>
              </select>
              <Dm
                onClick={() =>
                  update((s) => {
                    const e = makeEnemy(enemyName || "Hostile", enemyTier, enemySize);
                    return { ...s, enemies: [...s.enemies, e], log: [...s.log, `[R${s.round}] ${e.name} enters the fray (${e.hull} hull, TN ${e.tn}).`] };
                  })
                }
              >
                + Spawn hostile
              </Dm>
            </div>

            {state.enemies.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {state.enemies.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 text-[12px]">
                    <span className="flex-1 truncate text-[#e9e2d0]/80">
                      {e.name} — {e.hull}/{e.maxHull} hull · {e.shields} shd
                    </span>
                    <Mini onClick={() => update((s) => ({ ...s, enemies: s.enemies.map((x) => (x.id === e.id ? { ...x, hull: Math.max(0, x.hull - 3) } : x)) }))}>−3</Mini>
                    <Mini onClick={() => update((s) => ({ ...s, enemies: s.enemies.map((x) => (x.id === e.id ? { ...x, hull: Math.min(x.maxHull, x.hull + 3) } : x)) }))}>+3</Mini>
                    <Mini onClick={() => update((s) => ({ ...s, enemies: s.enemies.filter((x) => x.id !== e.id) }))}>✕</Mini>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function Hand({ children }: { children: React.ReactNode }) {
  return <span className="rounded border border-[#f0d080]/40 px-1 py-0.5 text-[#f0d080]">{children}</span>;
}

function Drydock({ state, update }: { state: BattleState; update: (t: (s: BattleState) => BattleState) => void }) {
  const editable = !state.active;
  const lo = computeLoadout(state.build, state.ship.tier);
  const build = state.build;

  const setFrame = (frame: FrameId) => update((s) => ({ ...s, build: { ...s.build, frame } }));
  const toggleWeapon = (id: WeaponId) =>
    update((s) => {
      const has = s.build.weapons.includes(id);
      return { ...s, build: { ...s.build, weapons: has ? s.build.weapons.filter((w) => w !== id) : [...s.build.weapons, id] } };
    });
  const toggleSystem = (id: SystemId) =>
    update((s) => {
      const has = s.build.systems.includes(id);
      return { ...s, build: { ...s.build, systems: has ? s.build.systems.filter((w) => w !== id) : [...s.build.systems, id] } };
    });

  return (
    <section className={`rounded-sm border p-3 ${lo.valid ? "border-[#7fff9f]/30" : "border-[#ff6b6b]/50"}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-[#7fff9f]/90">Drydock</span>
        <span className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider">
          <Pip ok={lo.powerUsed <= lo.power}>Power {lo.powerUsed}/{lo.power}</Pip>
          <Pip ok={build.weapons.length <= lo.weaponSlots}>Wpn {build.weapons.length}/{lo.weaponSlots}</Pip>
          <Pip ok={build.systems.length <= lo.systemSlots}>Sys {build.systems.length}/{lo.systemSlots}</Pip>
          <span className="text-white/40">Hull {lo.maxHull} · Shd {lo.maxShields}</span>
        </span>
      </div>

      {!editable && <p className="mb-2 text-[10px] italic text-white/35">Battle underway — refit at the next downtime.</p>}

      {/* frames */}
      <div className="mb-2 flex flex-wrap gap-1">
        {(Object.values(FRAMES)).map((f) => (
          <button
            key={f.id}
            disabled={!editable}
            onClick={() => setFrame(f.id)}
            title={f.trait}
            className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
              build.frame === f.id ? "border-[#7fff9f] text-[#7fff9f]" : "border-white/15 text-white/45 hover:text-white/80"
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>
      <p className="mb-2 text-[10px] italic leading-snug text-white/40">{FRAMES[build.frame].trait}</p>

      {/* weapons */}
      <div className="mb-1 text-[9px] uppercase tracking-[0.18em] text-[#c9a84c]/60">Weapons</div>
      <div className="mb-2 flex flex-wrap gap-1">
        {Object.values(WEAPONS).map((w) => {
          const on = build.weapons.includes(w.id);
          return (
            <button
              key={w.id}
              disabled={!editable}
              onClick={() => toggleWeapon(w.id)}
              title={w.note}
              className={`rounded border px-2 py-0.5 text-[10px] tracking-wider transition-colors disabled:opacity-50 ${
                on ? "border-[#ff6b6b]/70 bg-[#ff6b6b]/10 text-[#ff6b6b]" : "border-white/15 text-white/45 hover:text-white/80"
              }`}
            >
              {w.name} <span className="text-[#f0d080]/80">{w.cost}⚡</span>
            </button>
          );
        })}
      </div>

      {/* systems */}
      <div className="mb-1 text-[9px] uppercase tracking-[0.18em] text-[#c9a84c]/60">Systems</div>
      <div className="flex flex-wrap gap-1">
        {Object.values(SYSTEMS).map((sys) => {
          const on = build.systems.includes(sys.id);
          return (
            <button
              key={sys.id}
              disabled={!editable}
              onClick={() => toggleSystem(sys.id)}
              title={`${sys.seat} — ${sys.note}`}
              className={`rounded border px-2 py-0.5 text-[10px] tracking-wider transition-colors disabled:opacity-50 ${
                on ? "border-[#7fe0ff]/70 bg-[#7fe0ff]/10 text-[#7fe0ff]" : "border-white/15 text-white/45 hover:text-white/80"
              }`}
            >
              {sys.name} <span className="text-[#f0d080]/80">{sys.cost}⚡</span>
            </button>
          );
        })}
      </div>

      {!lo.valid && <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#ff6b6b]">Over budget: {lo.reasons.join(" · ")}</p>}
    </section>
  );
}

function Pip({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <span className={`rounded border px-1 py-0.5 ${ok ? "border-white/20 text-white/55" : "border-[#ff6b6b]/60 text-[#ff6b6b]"}`}>{children}</span>;
}

function Dm({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded border border-[#7fe0ff]/40 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[#7fe0ff] transition-colors hover:bg-[#7fe0ff]/10 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function Mini({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded border border-white/15 px-2 py-0.5 text-[11px] text-white/60 transition-colors hover:text-white">
      {children}
    </button>
  );
}
