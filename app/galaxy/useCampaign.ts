"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SYSTEMS } from "./data";

const DISCOVERED_KEY = "veilborn.discovered";
const PARTY_KEY = "veilborn.party";
const TRAIL_KEY = "veilborn.trail";
const DM_KEY = "veilborn.dm";

const API = "/api/campaign";
const POLL_MS = 4000;

interface SharedState {
  discovered: string[];
  party: string | null;
  trail: string[];
  updatedAt: number;
}

// Canonical serialization so we can tell "changed vs last sync" cheaply.
const snapshot = (d: Set<string>, p: string | null, t: string[]) =>
  JSON.stringify({ d: [...d].sort(), p, t });

function readDmFlag(): boolean {
  const flag = new URLSearchParams(window.location.search).get("dm");
  if (flag === "1") return true;
  if (flag === "0") return false;
  try {
    return localStorage.getItem(DM_KEY) === "1";
  } catch {
    return false;
  }
}

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
  /** True once the shared server store has been reached at least once. */
  shared: boolean;
}

/**
 * Fog-of-war / campaign state, persisted to localStorage. DM controls are
 * gated behind a `?dm=1` URL flag so shared player links stay spoiler-safe.
 */
export function useCampaign(): Campaign {
  // Enter DM mode with ?dm=1 (or ?dm=0 to leave); it then persists on this
  // device so the DM doesn't have to keep the flag in the URL.
  const [dmMode, setDmMode] = useState(readDmFlag);
  const [discovered, setDiscovered] = useState<Set<string>>(loadSet);
  const [party, setPartyState] = useState<string | null>(() =>
    loadString(PARTY_KEY)
  );
  const [trail, setTrail] = useState<string[]>(loadTrail);
  // DM gates pushing until it has reconciled with the server once.
  const [hydrated, setHydrated] = useState(() => !readDmFlag());
  const [shared, setShared] = useState(false);

  // Tracks the last state we synced (sent or received) so we don't echo it.
  const remoteSnapRef = useRef("");
  // Newest server timestamp a player has applied.
  const appliedAtRef = useRef(0);

  const applyShared = useCallback((data: SharedState) => {
    const d = new Set<string>([...(data.discovered ?? []), "solara-prime"]);
    const p = data.party ?? null;
    const t = data.trail ?? [];
    setDiscovered(d);
    setPartyState(p);
    setTrail(t);
    remoteSnapRef.current = snapshot(d, p, t);
    appliedAtRef.current = data.updatedAt;
  }, []);

  // DM: reconcile with the shared store once on mount, then push thereafter.
  useEffect(() => {
    if (!dmMode) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API);
        const data = res.ok ? ((await res.json()) as SharedState) : null;
        if (!cancelled && data) {
          setShared(true);
          if (data.updatedAt > 0) applyShared(data);
        }
      } catch {
        /* offline — fall back to local only */
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [dmMode, applyShared]);

  // DM: push local changes to the shared store (debounced).
  useEffect(() => {
    if (!dmMode || !hydrated) return;
    const snap = snapshot(discovered, party, trail);
    if (snap === remoteSnapRef.current) return;
    const id = setTimeout(async () => {
      try {
        const res = await fetch(API, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ discovered: [...discovered], party, trail }),
        });
        if (res.ok) {
          remoteSnapRef.current = snap;
          setShared(true);
        }
      } catch {
        /* offline */
      }
    }, 400);
    return () => clearTimeout(id);
  }, [dmMode, hydrated, discovered, party, trail]);

  // Players: poll the shared store and apply anything newer.
  useEffect(() => {
    if (dmMode) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(API);
        if (!res.ok) return;
        const data = (await res.json()) as SharedState;
        if (cancelled) return;
        setShared(true);
        if (data.updatedAt > appliedAtRef.current) applyShared(data);
      } catch {
        /* offline */
      }
    };
    poll();
    const iv = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [dmMode, applyShared]);

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
    shared,
  };
}
