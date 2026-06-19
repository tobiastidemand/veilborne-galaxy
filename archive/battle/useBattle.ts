"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { supabase, supabaseConfigured } from "./supabaseClient";
import { defaultBattle, type BattleState } from "./types";

const ROW_ID = "current";

/**
 * Shared battle state. With Supabase configured this is realtime (instant push
 * to every connected screen); without it, it falls back to a local in-memory
 * preview so the page is still usable/buildable.
 */
export function useBattle() {
  const [state, setState] = useState<BattleState>(defaultBattle);
  const [connected, setConnected] = useState(false);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
    let cancelled = false;

    sb
      .from("battle")
      .select("state")
      .eq("id", ROW_ID)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data?.state) setState(data.state as BattleState);
      });

    const channel = sb
      .channel("battle-room")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "battle",
          filter: `id=eq.${ROW_ID}`,
        },
        (payload) => {
          const next = (payload.new as { state?: BattleState })?.state;
          if (next) setState(next);
        }
      )
      .subscribe((status) => {
        if (!cancelled) setConnected(status === "SUBSCRIBED");
      });

    return () => {
      cancelled = true;
      sb.removeChannel(channel);
    };
  }, []);

  // Apply a transform to the current state and broadcast it.
  const update = useCallback(
    (transform: (prev: BattleState) => BattleState) => {
      const next = { ...transform(stateRef.current), updatedAt: Date.now() };
      // Keep the ref current synchronously so several update() calls in the same
      // tick chain off fresh state instead of all reading the stale committed one.
      stateRef.current = next;
      setState(next); // optimistic / local
      const sb = supabase;
      if (sb) {
        sb
          .from("battle")
          .upsert({ id: ROW_ID, state: next, updated_at: new Date().toISOString() })
          .then(({ error }) => {
            if (error) console.error("battle sync failed", error.message);
          });
      }
    },
    []
  );

  return { state, update, configured: supabaseConfigured, connected };
}
