"use client";

import Link from "next/link";
import { useState } from "react";

import { RoleCard } from "./RoleCard";
import { useBattle } from "./useBattle";
import {
  advancePhase,
  enemiesFire,
  type ActionCtx,
  type ActionDef,
} from "./engine";
import {
  MOMENTUM_PER_ROUND,
  POWER_PER_ROUND,
  ROLES,
  SHIELD_OVERCAP,
  makeEnemy,
  type Condition,
  type Phase,
  type RoleId,
} from "./types";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
const PHASES: Phase[] = ["start", "action", "reaction", "end"];

function Bar({ label, value, max, color, soft }: { label: string; value: number; max: number; color: string; soft?: number }) {
  const pct = max > 0 ? clamp((value / max) * 100, 0, 100) : 0;
  const softPct = soft && max > 0 ? clamp((soft / max) * 100, 0, 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[10px] uppercase tracking-[0.16em] text-[#c9a84c]/70">
        <span>{label}</span>
        <span className="text-[#e9e2d0]/80">{value} / {soft ?? max}</span>
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
  const [enemyName, setEnemyName] = useState("Raider");
  const [enemyHull, setEnemyHull] = useState(10);

  const saveCrew = (name: string) => {
    setCrew(name);
    try {
      localStorage.setItem("veilborn.crew", name);
    } catch {
      /* ignore */
    }
  };

  const act = (roleId: RoleId, action: ActionDef, ctx: Partial<ActionCtx>) =>
    update((s) => {
      if (!s.active || s.phase !== "action" || s.roles[roleId].acted) return s;
      const ns = action.run(s, { actor: crew, ...ctx });
      return { ...ns, roles: { ...ns.roles, [roleId]: { ...ns.roles[roleId], acted: true } } };
    });

  const setClaim = (id: RoleId, claimedBy: string | null) =>
    update((s) => ({ ...s, roles: { ...s.roles, [id]: { ...s.roles[id], claimedBy } } }));

  const nextPhase = PHASES[(PHASES.indexOf(state.phase) + 1) % PHASES.length];
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

        {/* phase tracker */}
        <div className="mb-4 flex items-center gap-2">
          {PHASES.map((p) => (
            <span
              key={p}
              className={`flex-1 rounded-sm border px-2 py-1 text-center font-display text-[10px] font-bold uppercase tracking-[0.18em] ${
                state.phase === p && state.active
                  ? "border-[#f0d080] bg-[#f0d080]/10 text-[#f0d080]"
                  : "border-white/10 text-white/35"
              }`}
            >
              {p}
            </span>
          ))}
        </div>

        {!configured && (
          <div className="mb-4 rounded-sm border border-[#ff9f40]/40 bg-[#ff9f40]/5 px-4 py-2 text-[12px] text-[#ffd2a0]/90">
            Local preview — add Supabase env to sync all crew screens. Combat
            logic runs fully here for testing.
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
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#c9a84c]/50">
                  {state.ship.evasion > 0 && `+${state.ship.evasion} def · `}
                  {state.buffs.attackMod > 0 && `+${state.buffs.attackMod} atk · `}
                  {state.buffs.dmgMod > 0 && `+${state.buffs.dmgMod} dmg`}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <Bar label="Hull" value={state.ship.hull} max={state.ship.maxHull} color="#ff8855" />
                <Bar label="Shields" value={state.ship.shields} max={state.ship.maxShields + SHIELD_OVERCAP} soft={state.ship.maxShields} color="#7fe0ff" />
                <Bar label="Power" value={state.ship.power} max={state.ship.maxPower} color="#f0d080" />
                <Bar label="Momentum" value={state.ship.momentum} max={state.ship.maxMomentum} color="#cc88ff" />
              </div>
              {state.ship.hull <= 0 && (
                <div className="mt-3 text-center font-display text-sm font-bold uppercase tracking-[0.2em] text-[#ff6b6b]">☠ Hull breached — the vessel is lost</div>
              )}
            </section>

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
                  onAct={(action, ctx) => act(r.id, action, ctx)}
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
                        <span className="text-white/40">TN {e.tn}</span>
                      </div>
                      <Bar label="Hull" value={e.hull} max={e.maxHull} color="#ff6b6b" />
                      {e.shields > 0 && <Bar label="Shields" value={e.shields} max={e.shields} color="#7fe0ff" />}
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
                  <li key={state.log.length - i} className="border-b border-white/5 pb-1">{line}</li>
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
                <Dm onClick={() => update((s) => ({
                  ...s,
                  active: true,
                  round: 1,
                  phase: "action",
                  ship: {
                    ...s.ship,
                    momentum: clamp(s.ship.momentum + MOMENTUM_PER_ROUND, 0, s.ship.maxMomentum),
                    power: clamp(s.ship.power + POWER_PER_ROUND, 0, s.ship.maxPower),
                  },
                  log: [...s.log, "[R1] Battle commences — crew to stations! (Action phase)"],
                }))}>
                  ⚔ Commence battle
                </Dm>
              ) : (
                <>
                  <Dm onClick={() => update(advancePhase)}>▶ {nextPhase}</Dm>
                  <Dm onClick={() => update(enemiesFire)}>✦ Enemies fire</Dm>
                  <Dm onClick={() => update((s) => ({ ...s, active: false, log: [...s.log, `[R${s.round}] The engagement ends.`] }))}>✕ End battle</Dm>
                </>
              )}
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <input value={enemyName} onChange={(e) => setEnemyName(e.target.value)} className="w-36 rounded border border-[#7fe0ff]/30 bg-[#0b0820]/60 px-2 py-1 text-sm outline-none focus:border-[#7fe0ff]" />
              <input type="number" value={enemyHull} onChange={(e) => setEnemyHull(Number(e.target.value) || 0)} className="w-20 rounded border border-[#7fe0ff]/30 bg-[#0b0820]/60 px-2 py-1 text-sm outline-none focus:border-[#7fe0ff]" />
              <Dm onClick={() => update((s) => ({ ...s, enemies: [...s.enemies, makeEnemy(enemyName || "Hostile", enemyHull)], log: [...s.log, `[R${s.round}] ${enemyName || "A hostile"} enters the fray (${enemyHull} hull).`] }))}>
                + Spawn hostile
              </Dm>
            </div>

            {state.enemies.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {state.enemies.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 text-[12px]">
                    <span className="flex-1 truncate text-[#e9e2d0]/80">{e.name} — {e.hull}/{e.maxHull} hull · {e.shields} shd</span>
                    <Mini onClick={() => update((s) => ({ ...s, enemies: s.enemies.map((x) => x.id === e.id ? { ...x, hull: Math.max(0, x.hull - 3) } : x) }))}>−3</Mini>
                    <Mini onClick={() => update((s) => ({ ...s, enemies: s.enemies.map((x) => x.id === e.id ? { ...x, hull: Math.min(x.maxHull, x.hull + 3) } : x) }))}>+3</Mini>
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

function Dm({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded border border-[#7fe0ff]/40 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[#7fe0ff] transition-colors hover:bg-[#7fe0ff]/10">
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
