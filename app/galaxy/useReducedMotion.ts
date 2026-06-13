"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

/**
 * Tracks the user's `prefers-reduced-motion` setting. Call at the top of the
 * tree; thread the result down (and via MotionContext into the 3D scene).
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}

/** Carries the reduced-motion flag to components inside the R3F canvas. */
export const MotionContext = createContext(false);

export const useReducedMotion = () => useContext(MotionContext);
