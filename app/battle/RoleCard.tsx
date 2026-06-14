"use client";

import { useState } from "react";

import { availableAbilities, type ActionCtx, type Ability } from "./engine";
import { loadoutOf } from "./shipBuilding";
import { DAMAGE_LABEL, ROLES, type BattleState, type DamageType, type RoleId } from "./types";

const KIND_BADGE: Record<Ability["kind"], { label: string; cls: string }> = {
  open: { label: "Open", cls: "border-[#f0d080]/60 text-[#f0d080]" },
  link: { label: "Link", cls: "border-white/25 text-white/60" },
  finish: { label: "Finish", cls: "border-[#ff6b6b]/60 text-[#ff6b6b]" },
};

export function RoleCard({
  id,
  state,
  crewName,
  onClaim,
  onRelease,
  onAct,
}: {
  id: RoleId;
  state: BattleState;
  crewName: string;
  onClaim: () => void;
  onRelease: () => void;
  onAct: (ability: Ability, ctx: Partial<ActionCtx>) => void;
}) {
  const meta = ROLES.find((r) => r.id === id)!;
  const slot = state.roles[id];
  const mine = !!crewName && slot.claimedBy === crewName;
  const abilities = availableAbilities(state, id);
  const weaponTypes = loadoutOf(state).weaponTypes;
  const [weapon, setWeapon] = useState<DamageType>("balanced");
  const activeWeapon = weaponTypes.includes(weapon) ? weapon : weaponTypes[0];

  const canAct = state.active && mine;

  return (
    <div className="tome-panel tome-frame flex flex-col gap-2 rounded-sm border p-3" style={{ borderColor: `${meta.accent}55` }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-display text-sm font-bold uppercase tracking-[0.18em]" style={{ color: meta.accent }}>
            {meta.name}
          </span>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[#c9a84c]/50">{meta.blurb}</div>
        </div>
        {state.active && state.chain.acted.includes(id) && (
          <span className="rounded border border-white/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/45">
            Acted
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-y border-white/5 py-1.5 text-[12px]">
        <span className="text-[#e9e2d0]/70">
          {slot.claimedBy ? (
            <span style={{ color: meta.accent }}>{slot.claimedBy}</span>
          ) : (
            <span className="text-white/30">Unclaimed</span>
          )}
        </span>
        {mine ? (
          <button onClick={onRelease} className="rounded border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/55 hover:text-white">
            Release
          </button>
        ) : !slot.claimedBy ? (
          <button
            onClick={onClaim}
            disabled={!crewName}
            className="rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider disabled:opacity-30"
            style={{ borderColor: `${meta.accent}66`, color: meta.accent }}
          >
            Claim
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        {!canAct && abilities.length === 0 && (
          <p className="text-[11px] italic leading-snug text-white/30">
            {state.active ? "Standing by — nothing to do this beat." : "Awaiting battle stations."}
          </p>
        )}
        {canAct &&
          abilities.map((a) => {
            const badge = KIND_BADGE[a.kind];
            const header = (
              <div className="flex items-center gap-1.5">
                <span className={`rounded border px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider ${badge.cls}`}>{badge.label}</span>
                <span className="text-[11px] font-semibold text-[#e9e2d0]/90">{a.label}</span>
              </div>
            );

            // Gunner Killing Blow — pick a weapon type, then a target.
            if (a.weapon) {
              return (
                <div key={a.id} className="flex flex-col gap-1.5 rounded border border-white/10 p-2">
                  {header}
                  <p className="text-[10px] italic leading-snug text-white/35">{a.hint}</p>
                  <div className="flex flex-wrap gap-1">
                    {weaponTypes.map((w) => (
                      <button
                        key={w}
                        onClick={() => setWeapon(w)}
                        className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                          activeWeapon === w ? "border-[#ff6b6b] text-[#ff6b6b]" : "border-white/15 text-white/45 hover:text-white/80"
                        }`}
                      >
                        {DAMAGE_LABEL[w]}
                      </button>
                    ))}
                  </div>
                  <TargetRow state={state} accent="#ff6b6b" onPick={(targetId) => onAct(a, { targetId, weapon: activeWeapon })} />
                </div>
              );
            }

            // Engineer Damage Control — pick Hull or Shields.
            if (a.repairChoice) {
              return (
                <div key={a.id} className="flex flex-col gap-1.5 rounded border border-white/10 p-2">
                  {header}
                  <p className="text-[10px] italic leading-snug text-white/35">{a.hint}</p>
                  <div className="flex gap-1.5">
                    <button onClick={() => onAct(a, { repair: "hull" })} className="flex-1 rounded border border-[#7fff9f]/45 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7fff9f] hover:bg-[#7fff9f]/10">
                      Hull
                    </button>
                    <button onClick={() => onAct(a, { repair: "shield" })} className="flex-1 rounded border border-[#7fe0ff]/45 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7fe0ff] hover:bg-[#7fe0ff]/10">
                      Shields
                    </button>
                  </div>
                </div>
              );
            }

            // Targeted ability — pick a target.
            if (a.needsTarget) {
              return (
                <div key={a.id} className="flex flex-col gap-1.5 rounded border border-white/10 p-2">
                  {header}
                  <p className="text-[10px] italic leading-snug text-white/35">{a.hint}</p>
                  <TargetRow state={state} accent={meta.accent} onPick={(targetId) => onAct(a, { targetId })} />
                </div>
              );
            }

            // Self / no-target ability.
            return (
              <button
                key={a.id}
                onClick={() => onAct(a, {})}
                className="flex flex-col gap-1 rounded border border-white/10 p-2 text-left transition-colors hover:border-white/30 hover:bg-white/5"
              >
                {header}
                <p className="text-[10px] italic leading-snug text-white/35">{a.hint}</p>
              </button>
            );
          })}
      </div>
    </div>
  );
}

function TargetRow({ state, accent, onPick }: { state: BattleState; accent: string; onPick: (id: string) => void }) {
  if (state.enemies.length === 0) return <span className="text-[11px] italic text-white/30">no targets</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {state.enemies.map((e) => (
        <button
          key={e.id}
          onClick={() => onPick(e.id)}
          className="rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-white/5"
          style={{ borderColor: `${accent}55`, color: accent }}
        >
          ✦ {e.name}
        </button>
      ))}
    </div>
  );
}
