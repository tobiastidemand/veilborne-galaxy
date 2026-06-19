# Archive — scrapped ship-combat system (v0.4)

This folder holds the **scrapped** ship-combat / ship-building / ability-tree design
and the old `/battle` prototype app. It was set aside in June 2026 for a ground-up
redesign. Kept for reference and salvage; **not** part of the build (excluded in
`tsconfig.json` and `.vercelignore`).

- `docs/` — `ship-combat.md` (v0.4 "Initiative & the Chain"), `ship-building.md`
  (module ships), `ability-trees.md` (per-role skill trees).
- `battle/` — the old `/battle` co-op app. The combat logic is tied to the scrapped
  design, but two pieces are **system-agnostic and reusable** if the redesign wants
  a digital companion:
  - `useBattle.ts` — realtime shared crew-state sync (Supabase, with local
    fallback).
  - `supabaseClient.ts` — the Supabase client setup.

The live `/battle` route is now a stub placeholder.
