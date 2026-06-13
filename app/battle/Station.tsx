"use client";

import { STATION_ACTIONS, type ActionCtx } from "./battleActions";
import type { BattleState, StationId } from "./types";
import { STATIONS } from "./types";

export function Station({
  id,
  state,
  crewName,
  onClaim,
  onRelease,
  onToggleReady,
  onAction,
}: {
  id: StationId;
  state: BattleState;
  crewName: string;
  onClaim: () => void;
  onRelease: () => void;
  onToggleReady: () => void;
  onAction: (run: (s: BattleState, ctx: ActionCtx) => BattleState, ctx: ActionCtx) => void;
}) {
  const meta = STATIONS.find((s) => s.id === id)!;
  const slot = state.stations[id];
  const mine = !!crewName && slot.claimedBy === crewName;
  const canAct = state.active && state.turn === "players" && mine;

  return (
    <div
      className="tome-panel tome-frame flex flex-col gap-2 rounded-sm border p-3"
      style={{ borderColor: `${meta.accent}55` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span style={{ color: meta.accent }}>{meta.icon}</span>
            <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-[#f0d080]">
              {meta.name}
            </span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#c9a84c]/50">
            {meta.role} · {meta.blurb}
          </div>
        </div>
        {slot.ready && (
          <span className="rounded border border-[#7fff9f]/50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#7fff9f]">
            Ready
          </span>
        )}
      </div>

      {/* crew slot */}
      <div className="flex items-center justify-between gap-2 border-y border-white/5 py-1.5">
        <span className="text-[12px] text-[#e9e2d0]/70">
          {slot.claimedBy ? (
            <>
              Crewed by{" "}
              <span style={{ color: meta.accent }}>{slot.claimedBy}</span>
            </>
          ) : (
            <span className="text-white/35">Unclaimed</span>
          )}
        </span>
        {mine ? (
          <button
            onClick={onRelease}
            className="rounded border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60 hover:text-white"
          >
            Release
          </button>
        ) : !slot.claimedBy ? (
          <button
            onClick={onClaim}
            disabled={!crewName}
            className="rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-30"
            style={{ borderColor: `${meta.accent}66`, color: meta.accent }}
          >
            Claim
          </button>
        ) : null}
      </div>

      {/* actions */}
      <div className="flex flex-col gap-1.5">
        {STATION_ACTIONS[id].map((action) =>
          action.targeted ? (
            <div key={action.id}>
              <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#c9a84c]/60">
                {action.label} — choose target ({action.cost}⚡)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {state.enemies.length === 0 && (
                  <span className="text-[11px] italic text-white/30">
                    no targets
                  </span>
                )}
                {state.enemies.map((e) => (
                  <button
                    key={e.id}
                    disabled={!canAct || state.ship.power < action.cost}
                    onClick={() =>
                      onAction(action.run, { actor: crewName, targetId: e.id })
                    }
                    className="rounded border border-[#ff6b6b]/45 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ff6b6b] transition-colors hover:bg-[#ff6b6b]/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ✦ {e.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              key={action.id}
              disabled={!canAct || state.ship.power < action.cost}
              onClick={() => onAction(action.run, { actor: crewName })}
              className="flex items-center justify-between rounded border border-[#c9a84c]/30 px-2.5 py-1.5 text-left text-[11px] font-semibold text-[#e9e2d0]/85 transition-colors hover:border-[#c9a84c]/60 hover:bg-[#c9a84c]/5 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span>{action.label}</span>
              <span className="text-[10px] text-[#c9a84c]/60">{action.cost}⚡</span>
            </button>
          )
        )}
      </div>

      {mine && state.active && (
        <button
          onClick={onToggleReady}
          className={`mt-1 rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
            slot.ready
              ? "border-[#7fff9f]/50 text-[#7fff9f]"
              : "border-white/20 text-white/50 hover:text-white"
          }`}
        >
          {slot.ready ? "Stand down" : "Mark ready"}
        </button>
      )}
    </div>
  );
}
