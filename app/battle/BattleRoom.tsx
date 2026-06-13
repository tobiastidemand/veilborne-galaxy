"use client";

import Link from "next/link";
import { useState } from "react";

import { Station } from "./Station";
import { useBattle } from "./useBattle";
import { damageShip, type ActionCtx } from "./battleActions";
import { defaultBattle, STATIONS, type BattleState, type StationId } from "./types";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

function Bar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? clamp((value / max) * 100, 0, 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[10px] uppercase tracking-[0.18em] text-[#c9a84c]/70">
        <span>{label}</span>
        <span className="text-[#e9e2d0]/80">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
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
  const [enemyHp, setEnemyHp] = useState(60);

  const saveCrew = (name: string) => {
    setCrew(name);
    try {
      localStorage.setItem("veilborn.crew", name);
    } catch {
      /* ignore */
    }
  };

  const runAction = (
    run: (s: BattleState, ctx: ActionCtx) => BattleState,
    ctx: ActionCtx
  ) => update((s) => run(s, ctx));

  const setStation = (id: StationId, slot: Partial<BattleState["stations"][StationId]>) =>
    update((s) => ({ ...s, stations: { ...s.stations, [id]: { ...s.stations[id], ...slot } } }));

  const status = configured
    ? connected
      ? { dot: "bg-[#7fff9f]", label: "LIVE" }
      : { dot: "bg-[#ff9f40]", label: "CONNECTING" }
    : { dot: "bg-[#ff9f40]", label: "LOCAL PREVIEW" };

  return (
    <div className="min-h-dvh w-full bg-[#03020a] font-body text-[#e9e2d0]">
      <div className="scanlines pointer-events-none fixed inset-0 z-50" />

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        {/* header */}
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#c9a84c]/35 pb-3">
          <div>
            <h1 className="font-title text-2xl font-black tracking-[0.14em] text-[#f0d080] drop-shadow-[0_0_18px_rgba(240,208,128,0.25)]">
              Battle Stations
            </h1>
            <p className="mt-0.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#c9a84c]/70">
              <span>Astral Cartographer</span>
              <span className="text-[#c9a84c]/40">✦</span>
              <span>
                Round {state.round} · {state.turn === "players" ? "Crew turn" : "Hostile turn"}
              </span>
              {dm && (
                <span className="rounded border border-[#7fe0ff]/50 px-1.5 py-0.5 text-[9px] font-bold text-[#7fe0ff]">
                  DM
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#e9e2d0]/45">
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <Link
              href="/"
              className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a84c] transition-colors hover:text-[#f0d080]"
            >
              ‹ Chart
            </Link>
          </div>
        </header>

        {!configured && (
          <div className="mb-5 rounded-sm border border-[#ff9f40]/40 bg-[#ff9f40]/5 px-4 py-2.5 text-[12px] text-[#ffd2a0]/90">
            Multiplayer is offline — running a local preview. Add your Supabase
            URL + anon key to <code className="text-[#f0d080]">.env.local</code> to
            sync all crew screens in realtime.
          </div>
        )}

        {/* crew identity */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <label className="text-[11px] uppercase tracking-[0.2em] text-[#c9a84c]/70">
            Crew name
          </label>
          <input
            value={crew}
            onChange={(e) => saveCrew(e.target.value)}
            placeholder="name your officer…"
            className="rounded border border-[#c9a84c]/40 bg-[#0b0820]/60 px-3 py-1 text-sm text-[#e9e2d0] outline-none placeholder:text-white/25 focus:border-[#f0d080]"
          />
          {!crew && (
            <span className="text-[11px] italic text-white/35">
              enter a name to claim a station
            </span>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* left: ship + stations */}
          <div className="flex flex-col gap-5">
            <section className="tome-panel tome-frame rounded-sm border border-[#c9a84c]/30 p-4">
              <div className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#c9a84c]">
                Survey Vessel
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Bar label="Hull" value={state.ship.hull} max={state.ship.maxHull} color="#ff8855" />
                <Bar label="Shields" value={state.ship.shields} max={state.ship.maxShields} color="#7fe0ff" />
                <Bar label="Power" value={state.ship.power} max={state.ship.maxPower} color="#f0d080" />
              </div>
              {state.ship.hull <= 0 && (
                <div className="mt-3 text-center font-display text-sm font-bold uppercase tracking-[0.2em] text-[#ff6b6b]">
                  ☠ Hull breached — the vessel is lost
                </div>
              )}
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              {STATIONS.map((s) => (
                <Station
                  key={s.id}
                  id={s.id}
                  state={state}
                  crewName={crew}
                  onClaim={() => setStation(s.id, { claimedBy: crew })}
                  onRelease={() => setStation(s.id, { claimedBy: null, ready: false })}
                  onToggleReady={() =>
                    setStation(s.id, { ready: !state.stations[s.id].ready })
                  }
                  onAction={runAction}
                />
              ))}
            </section>
          </div>

          {/* right: enemies + log */}
          <div className="flex flex-col gap-5">
            <section className="tome-panel tome-frame rounded-sm border border-[#ff6b6b]/30 p-4">
              <div className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#ff6b6b]/80">
                Hostiles
              </div>
              {state.enemies.length === 0 ? (
                <p className="text-[12px] italic text-white/35">No contacts.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {state.enemies.map((e) => (
                    <li key={e.id}>
                      <Bar label={e.name} value={e.hp} max={e.maxHp} color="#ff6b6b" />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="tome-panel tome-frame tome-scroll max-h-[40vh] overflow-y-auto rounded-sm border border-[#c9a84c]/30 p-4">
              <div className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#c9a84c]">
                Combat Log
              </div>
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
            <div className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#7fe0ff]">
              Dungeon Master
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {!state.active ? (
                <DmButton onClick={() => update((s) => ({ ...defaultBattle(), ...s, active: true, round: 1, turn: "players", ship: { ...s.ship, power: s.ship.maxPower }, log: [...s.log, "[R1] Battle commences — crew to stations!"] }))}>
                  ⚔ Commence battle
                </DmButton>
              ) : (
                <>
                  <DmButton
                    onClick={() =>
                      update((s) => {
                        const reset = Object.fromEntries(
                          (Object.keys(s.stations) as StationId[]).map((k) => [
                            k,
                            { ...s.stations[k], ready: false },
                          ])
                        ) as BattleState["stations"];
                        return {
                          ...s,
                          round: s.round + 1,
                          turn: "players",
                          stations: reset,
                          ship: { ...s.ship, power: s.ship.maxPower },
                          log: [...s.log, `[R${s.round + 1}] A new round begins. Power restored.`],
                        };
                      })
                    }
                  >
                    ⏭ Advance round
                  </DmButton>
                  <DmButton
                    onClick={() =>
                      update((s) => ({
                        ...s,
                        turn: s.turn === "players" ? "dm" : "players",
                        log: [...s.log, `[R${s.round}] Turn passes to ${s.turn === "players" ? "the hostiles" : "the crew"}.`],
                      }))
                    }
                  >
                    ⇄ Pass turn
                  </DmButton>
                  <DmButton
                    onClick={() =>
                      update((s) =>
                        damageShip(s, Math.max(8, s.enemies.length * 12), "Enemy fire")
                      )
                    }
                  >
                    ✦ Enemies fire
                  </DmButton>
                  <DmButton
                    onClick={() =>
                      update((s) => ({ ...s, active: false, log: [...s.log, `[R${s.round}] The engagement ends.`] }))
                    }
                  >
                    ✕ End battle
                  </DmButton>
                </>
              )}
            </div>

            {/* spawn enemy */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                value={enemyName}
                onChange={(e) => setEnemyName(e.target.value)}
                className="w-36 rounded border border-[#7fe0ff]/30 bg-[#0b0820]/60 px-2 py-1 text-sm outline-none focus:border-[#7fe0ff]"
              />
              <input
                type="number"
                value={enemyHp}
                onChange={(e) => setEnemyHp(Number(e.target.value) || 0)}
                className="w-20 rounded border border-[#7fe0ff]/30 bg-[#0b0820]/60 px-2 py-1 text-sm outline-none focus:border-[#7fe0ff]"
              />
              <DmButton
                onClick={() =>
                  update((s) => ({
                    ...s,
                    enemies: [
                      ...s.enemies,
                      {
                        id: crypto.randomUUID(),
                        name: enemyName || "Hostile",
                        hp: enemyHp,
                        maxHp: enemyHp,
                      },
                    ],
                    log: [...s.log, `[R${s.round}] ${enemyName || "A hostile"} enters the fray (${enemyHp} hp).`],
                  }))
                }
              >
                + Spawn hostile
              </DmButton>
            </div>

            {/* per-enemy + ship tweaks */}
            {state.enemies.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {state.enemies.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 text-[12px]">
                    <span className="flex-1 truncate text-[#e9e2d0]/80">
                      {e.name} — {e.hp}/{e.maxHp}
                    </span>
                    <DmMini onClick={() => update((s) => ({ ...s, enemies: s.enemies.map((x) => (x.id === e.id ? { ...x, hp: Math.max(0, x.hp - 10) } : x)) }))}>
                      −10
                    </DmMini>
                    <DmMini onClick={() => update((s) => ({ ...s, enemies: s.enemies.map((x) => (x.id === e.id ? { ...x, hp: Math.min(x.maxHp, x.hp + 10) } : x)) }))}>
                      +10
                    </DmMini>
                    <DmMini onClick={() => update((s) => ({ ...s, enemies: s.enemies.filter((x) => x.id !== e.id) }))}>
                      ✕
                    </DmMini>
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

function DmButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded border border-[#7fe0ff]/40 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[#7fe0ff] transition-colors hover:bg-[#7fe0ff]/10"
    >
      {children}
    </button>
  );
}

function DmMini({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded border border-white/15 px-2 py-0.5 text-[11px] text-white/60 transition-colors hover:text-white"
    >
      {children}
    </button>
  );
}
