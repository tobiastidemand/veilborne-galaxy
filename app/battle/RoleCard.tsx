"use client";

import { useState } from "react";

import {
  ROLE_ACTIONS,
  actionCost,
  canAfford,
  type ActionCtx,
  type ActionDef,
} from "./engine";
import {
  DAMAGE_LABEL,
  ROLES,
  WEAPON_POWER,
  type BattleState,
  type DamageType,
  type RoleId,
} from "./types";

const WEAPONS: DamageType[] = ["balanced", "laser", "missile", "ap"];

function cost(a: ActionDef, weapon?: DamageType) {
  const c = actionCost(a, weapon);
  const parts: string[] = [];
  if (c.power) parts.push(`${c.power}⚡`);
  if (c.momentum) parts.push(`${c.momentum}◆`);
  return parts.join(" ");
}

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
  onAct: (action: ActionDef, ctx: Partial<ActionCtx>) => void;
}) {
  const meta = ROLES.find((r) => r.id === id)!;
  const slot = state.roles[id];
  const mine = !!crewName && slot.claimedBy === crewName;
  const actable = state.active && state.phase === "action" && mine && !slot.acted;
  const [weapon, setWeapon] = useState<DamageType>("balanced");

  return (
    <div
      className="tome-panel tome-frame flex flex-col gap-2 rounded-sm border p-3"
      style={{ borderColor: `${meta.accent}55` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className="font-display text-sm font-bold uppercase tracking-[0.18em]"
            style={{ color: meta.accent }}
          >
            {meta.name}
          </span>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[#c9a84c]/50">
            {meta.blurb}
          </div>
        </div>
        {slot.acted && state.active && (
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
          <button
            onClick={onRelease}
            className="rounded border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/55 hover:text-white"
          >
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

      <div className="flex flex-col gap-1.5">
        {ROLE_ACTIONS[id].map((action) => {
          if (action.weapon) {
            return (
              <div key={action.id} className="flex flex-col gap-1.5">
                <div className="flex flex-wrap gap-1">
                  {WEAPONS.map((w) => (
                    <button
                      key={w}
                      onClick={() => setWeapon(w)}
                      className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                        weapon === w
                          ? "border-[#ff6b6b] text-[#ff6b6b]"
                          : "border-white/15 text-white/45 hover:text-white/80"
                      }`}
                      title={`${WEAPON_POWER[w]}⚡`}
                    >
                      {DAMAGE_LABEL[w]}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#c9a84c]/55">
                  Fire {DAMAGE_LABEL[weapon]} ({cost(action, weapon) || "free"}) →
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {state.enemies.length === 0 && (
                    <span className="text-[11px] italic text-white/30">no targets</span>
                  )}
                  {state.enemies.map((e) => (
                    <button
                      key={e.id}
                      disabled={!actable || !canAfford(state, action, weapon)}
                      onClick={() => onAct(action, { targetId: e.id, weapon })}
                      className="rounded border border-[#ff6b6b]/45 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ff6b6b] transition-colors hover:bg-[#ff6b6b]/10 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ✦ {e.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          if (action.needsTarget) {
            return (
              <div key={action.id} className="flex flex-col gap-1">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#c9a84c]/55">
                  {action.label} {cost(action) && `(${cost(action)})`} → {action.hint}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {state.enemies.length === 0 && (
                    <span className="text-[11px] italic text-white/30">no targets</span>
                  )}
                  {state.enemies.map((e) => (
                    <button
                      key={e.id}
                      disabled={!actable || !canAfford(state, action)}
                      onClick={() => onAct(action, { targetId: e.id })}
                      className="rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                      style={{ borderColor: `${meta.accent}55`, color: meta.accent }}
                    >
                      {e.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <button
              key={action.id}
              disabled={!actable || !canAfford(state, action)}
              onClick={() => onAct(action, {})}
              className="flex items-center justify-between gap-2 rounded border border-[#c9a84c]/30 px-2.5 py-1.5 text-left transition-colors hover:border-[#c9a84c]/60 hover:bg-[#c9a84c]/5 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span className="text-[11px] font-semibold text-[#e9e2d0]/85">
                {action.label}
              </span>
              <span className="text-[10px] text-[#c9a84c]/60">{cost(action)}</span>
            </button>
          );
        })}
        <p className="text-[10px] italic leading-snug text-white/30">
          {ROLE_ACTIONS[id].find((a) => !a.needsTarget && !a.weapon)?.hint ?? ""}
        </p>
      </div>
    </div>
  );
}
