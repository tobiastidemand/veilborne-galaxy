"use client";

import { useCallback, useEffect, useState } from "react";

import { SYSTEMS } from "./data";

const DISCOVERED_KEY = "veilborn.discovered";
const PARTY_KEY = "veilborn.party";
const TRAIL_KEY = "veilborn.trail";
const DM_KEY = "veilborn.dm";

// Solara Prime is the Core — the known starting point of all expeditions.
const SEED_DISCOVERED = ["solara-prime"];

const isRealSystem = (id: string) => SYSTEMS.some((s) => s.id === id);

function loadSet(): Set<string> {
  const set = new Set(SEED_DISCOVERED);
  try {
    const raw = localStorage.getItem(DISCOVERED_KEY);
    if (raw) for (const id of JSON.parse(raw) as string[]) set.add(id);
  } catch {
    /* ignore malformed storage */
  }
  // A deep-linked system is an intentional pointer — reveal it.
  const linked = new URLSearchParams(window.location.search).get("system");
  if (linked && isRealSystem(linked)) set.add(linked);
  return set;
}

function loadString(key: string): string | null {
  try {
    const v = localStorage.getItem(key);
    return v && isRealSystem(v) ? v : null;
  } catch {
    return null;
  }
}

function loadTrail(): string[] {
  try {
    const raw = localStorage.getItem(TRAIL_KEY);
    if (raw) return (JSON.parse(raw) as string[]).filter(isRealSystem);
  } catch {
    /* ignore */
  }
  return [];
}

export interface Campaign {
  dmMode: boolean;
  discovered: Set<string>;
  party: string | null;
  trail: string[];
  isDiscovered: (id: string) => boolean;
  toggleDiscovered: (id: string) => void;
  setParty: (id: string) => void;
  reset: () => void;
  exitDm: () => void;
}

/**
 * Fog-of-war / campaign state, persisted to localStorage. DM controls are
 * gated behind a `?dm=1` URL flag so shared player links stay spoiler-safe.
 */
export function useCampaign(): Campaign {
  // Enter DM mode with ?dm=1 (or ?dm=0 to leave); it then persists on this
  // device so the DM doesn't have to keep the flag in the URL.
  const [dmMode, setDmMode] = useState(() => {
    const flag = new URLSearchParams(window.location.search).get("dm");
    if (flag === "1") return true;
    if (flag === "0") return false;
    try {
      return localStorage.getItem(DM_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [discovered, setDiscovered] = useState<Set<string>>(loadSet);
  const [party, setPartyState] = useState<string | null>(() =>
    loadString(PARTY_KEY)
  );
  const [trail, setTrail] = useState<string[]>(loadTrail);

  useEffect(() => {
    try {
      localStorage.setItem(DISCOVERED_KEY, JSON.stringify([...discovered]));
    } catch {
      /* ignore */
    }
  }, [discovered]);

  useEffect(() => {
    try {
      if (party) localStorage.setItem(PARTY_KEY, party);
      else localStorage.removeItem(PARTY_KEY);
    } catch {
      /* ignore */
    }
  }, [party]);

  useEffect(() => {
    try {
      localStorage.setItem(TRAIL_KEY, JSON.stringify(trail));
    } catch {
      /* ignore */
    }
  }, [trail]);

  useEffect(() => {
    try {
      if (dmMode) localStorage.setItem(DM_KEY, "1");
      else localStorage.removeItem(DM_KEY);
    } catch {
      /* ignore */
    }
  }, [dmMode]);

  const isDiscovered = useCallback((id: string) => discovered.has(id), [
    discovered,
  ]);

  const toggleDiscovered = useCallback((id: string) => {
    setDiscovered((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Moving the party to a system "visits" it: reveal it and extend the trail.
  const setParty = useCallback((id: string) => {
    setPartyState(id);
    setDiscovered((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    setTrail((prev) => (prev[prev.length - 1] === id ? prev : [...prev, id]));
  }, []);

  // Wipe progress back to the seeded starting state.
  const reset = useCallback(() => {
    setDiscovered(new Set(SEED_DISCOVERED));
    setPartyState(null);
    setTrail([]);
  }, []);

  const exitDm = useCallback(() => setDmMode(false), []);

  return {
    dmMode,
    discovered,
    party,
    trail,
    isDiscovered,
    toggleDiscovered,
    setParty,
    reset,
    exitDm,
  };
}
