# Veilborn Ship Building — Rules Draft v0.2 · "Modules & the Crew's Ship"

> **Status:** design draft. The companion layer to `ship-combat.md` — where a crew
> *builds, loots, and maintains the ship they fight in.* Combat is the verb;
> building is the noun. They share one rank axis (**Tier 1–4**, matching the crew
> level cap) and one currency (**Power**, supplied by the Reactor) so a part found
> in the wreckage of a Devourer-killed cruiser is felt on the bridge next fight.
>
> The big shift from v0.1: a ship is no longer a frame + a flat list of bolt-ons.
> It is a **class** (its identity) made of **modules** (its upgradable organs) —
> and **each officer owns one module.** Upgrading the ship is upgrading *your*
> station, found as loot, installed at the drydock, felt in your chain.

---

## 1. Design pillars

1. **Every officer owns a part of the ship.** The Commander tends the Bridge, the
   Navigator the Engine, the Gunner the Weaponry, the Sensor the Optics, the
   Engineer the Reactor. Your module *is* your character's stake in the vessel —
   you find its upgrades, you maintain it, you decide what it specialises in.
2. **Loot is two-layered.** Salvage isn't just gear for your character — it's
   **ship modules and parts.** A fight can drop a Tier-3 Weaponry core; the Gunner
   lights up. Everyone has something to hunt for.
3. **Modules drive combat directly.** A module's **Tier is its owner's effective
   Tier** for their chain — and each Tier unlocks new abilities and scaling. This
   is where the combat ability ladder lives (see `ship-combat.md` §6).
4. **Maintenance is a scene, not bookkeeping.** Between fights the crew patches,
   tunes, and overclocks. Strain and repair are diegetic beats — the ship is a
   character that gets hurt and healed with you.
5. **Arcane, not industrial.** The Engine doesn't burn fuel; it channels the
   **Veil** — a singular arcane force. Reactors are cores of bound aether, not
   fission piles. Keep the flavour strange.
6. **Table-first.** One ship sheet: class at the top, a row per module (name, Tier,
   its one ability, its stat). Readable at a glance.

---

## 2. The shape of a ship

A ship is **one Class** + **a set of Modules**.

- **Class** = the chassis and identity. It sets the ship's size band, how many crew
  it seats, how many **module slots** it has, and a single **signature trait**.
- **Modules** = the organs. Four are **required** on every ship; the rest fill the
  class's slots. Every module has its own **Tier (1–4)** and a **unique ability**
  that grows each Tier.

```
  CLASS  ── identity, slots, signature trait
   ├─ Hull        (required)  → HP · Armour Class · Size      [ship-wide]
   ├─ Bridge      (required)  → command & Sync                 [Commander]
   ├─ Reactor     (required)  → Shields · Power budget         [Engineer]
   ├─ Engine      (required)  → Speed                          [Navigator]
   ├─ Weaponry    (slot)      → weapons & damage               [Gunner]
   ├─ Optics      (slot)      → intel & EW                     [Sensor]
   ├─ Cargo       (slot)      → salvage hold, consumables      [ship-wide]
   └─ Utility     (slot)      → a wildcard system              [any]
```

---

## 3. Two Tiers, and how they stack on the dice

There are **two independent Tier tracks**, and they *add together* on a roll
(alongside the chain's hand-offs). This is the core number of the whole game:

```
  d20  +  Crew Tier  +  Module Tier  +  chain bonuses   vs   the target
```

- **Crew Tier (1–4)** — the party's level, shared by all officers. It rises at
  story milestones and is a flat bonus on *every* officer's rolls. (Your character
  growing.)
- **Module Tier (1–4+)** — the Tier of the module the acting officer owns. Raised
  individually with loot + drydock work (§10). **There is no crew-level cap:** a
  lucky salvage can hand you a module above your Crew Tier, and you run it proudly.
  (Your *ship* growing.)
- **Chain bonuses** — the hand-offs the rest of the crew built this turn (§ combat
  rules). (Your *crew* growing the moment.)

> **Example.** A Crew-Tier-3 Navigator with a Tier-3 Veil Drive, set up by 3
> points of chain hand-offs, rolls **d20 + 3 + 3 + 3 = d20 + 9.** Character, ship,
> and crew all show up in one number.

Because Module Tier is uncapped and per-officer, an officer who invests in their
module pulls ahead *in their lane* — and a neglected station is a visible weak
point the table feels. Lopsided ships (a Tier-4 Reactor beside a Tier-1 Optics)
are a feature, not a bug.

**Ship Rating** (for the GM's threat budget) = the **Crew Tier**. Encounters scale
to that; a crew that has out-looted its level is simply punching above its weight.

---

## Resources — Power & Aether

Two resources fuel the ship, on two timescales.

**Power — tactical (combat runs on Power alone).** The Reactor's working energy.
- **Max Power** = the Reactor's rating (T1 6 → T4 12); starts each battle full.
- **Regenerates partially each turn — +(Tier + 1)** (T1 +2 … T4 +5), up to max.
  You never fully refill mid-fight, so blowing your whole pool leaves you lean for
  several turns. Managing it is the Engineer's tactical game.
- **Spent on** big abilities (overcharges, the Lance, a combat Veil-Jump escape).
- **Reallocated to Shields, 1-for-1** (up to Max Shields). Shields have **no
  passive regen** — they're just Power you banked as armour. Offense vs. survival,
  every turn.

**Aether — strategic (the map).** The arcane fuel the ship burns to *travel*.
- Tracked **abstractly** as a tank ("fuel: N jumps"); refuelled at ports, mined
  from nebulae, or looted.
- **Veil Jumps across systems cost Aether scaled to distance** — deep runs are a
  fuel gamble; run dry and you're **stranded**.
- **Combat never spends Aether** (one fight is a rounding error). The combat
  Veil-Jump *escape* is a **Power** cost, not Aether.

**Veil Jump, two faces.** A **combat escape** (≈ half Max Power) vs a **map jump**
(Aether by distance) — same drive, different scale.

**System-agnostic magic.** The Veil Drive is arcane; Aether is crystallised
Veil-stuff. Default: track Aether as fuel. On a magic system, a caster may instead
**expend spell slots / mana** to charge a jump in a pinch.

---

## 4. Ship classes

Classes span three size bands. "Slots" = optional modules beyond the four
required. Numbers are starting points to tune.

| Class | Band | Crew | Slots | Signature trait |
|---|---|---|---|---|
| **Interceptor** | Fighter | 1–2 | 2 | A *cockpit*, not a bridge: one pilot fills several stations; +2 Speed, but Hull is capped one Tier below crew level. |
| **Cutter** | Light | 3–5 | 4 | The versatile default (the *Astral Cartographer*). +1 Utility slot. |
| **Wraith** | Light | 3–4 | 4 | Veil-shrouded: starts each battle Concealed; +1 Speed; Hull runs a Tier low. |
| **Warden** | Medium | 4–6 | 5 | Armoured brawler: Hull ignores the first 1 damage per hit; −1 Speed. |
| **Lancer** | Medium | 4–5 | 4 | Built around a spinal weapon: heavy Weaponry finishes deal +1/link; thin Hull. |
| **Leviathan** | Heavy | 6+ | 6 | Capital hull: may mount **two** Weaponry or Optics modules; slow to win Initiative. |

> A class nudges a play-style without locking it. Bigger classes carry more
> modules (more officers with a station to own), which is also how the system
> scales to table size.

---

## 5. Modules — ownership & overview

| Module | Owner | Sets | Required? |
|---|---|---|---|
| **Hull** | ship-wide (Engineer assists) | HP, Armour Class, Size | yes |
| **Bridge / Cockpit** | Commander | command capacity, Sync rate, Epic | yes |
| **Reactor** | Engineer | Shields, regen, **Power budget** | yes |
| **Engine (Veil Drive)** | Navigator | Speed (Initiative) | yes |
| **Weaponry** | Gunner | mounted weapon types, damage | slot |
| **Optics** | Sensor | detection, electronic warfare | slot |
| **Cargo** | ship-wide | salvage hold, consumable slots | slot |
| **Utility** | any | one wildcard system | slot |

**Power.** The Reactor produces a Power budget; every *active* module draws Power
to run. A build is legal when running modules ≤ Reactor Power. In combat the
Engineer reallocates Power (Overcharge / Reroute) — the same number, both layers.

---

## 6. The required modules

Each required module sets a core stat by Tier and grants its owner an ability that
deepens each Tier. (Ability numbers are first-pass; the combat ladder is tuned at
build time.)

### Hull — *HP · Armour Class · Size* (ship-wide)

| Tier | HP | Armour Class | Size |
|---|---|---|---|
| 1 | 16 | 10 | Small |
| 2 | 22 | 11 | Medium |
| 3 | 30 | 12 | Large |
| 4 | 40 | 13 | Huge |

- Armour Class is the base the enemy's attack is rolled against (raised further by
  the Reaction chain). Size affects boarding, some weapon bands, and how many modules
  a class can physically carry.
- **Strain:** when Hull hits 0 the ship is **crippled** (GM mercy table), and
  individual modules can be **knocked out** by Breach/critical hits until repaired
  — a downed module silences that officer's station (see combat conditions).

### Bridge / Cockpit — *command & Sync* (Commander)

Sets how well the crew acts as one. (A **Cockpit** is the Interceptor's tiny
single-seat variant — same track, lower ceiling.)

| Tier | Ability |
|---|---|
| 1 | **Call the Shot / All Hands** — the base Opens (+Tier hand-off). |
| 2 | **Steady Hand** — once per battle, re-roll a failed Initiative. |
| 3 | **Battle Choir** — Epic Chain banks one Sync sooner. |
| 4 | **One Mind** — the Commander's role-mirroring kit reaches all five seats (the Tier-4 capstone of `ship-combat.md` §6). |

### Reactor (Aether Core) — *Power · Shields* (Engineer)

Sets **Max Power**, **Power regen/turn**, and **Max Shields**. Shields are restored
by **reallocating Power** (no passive regen) — see *Resources*. The Engineer's
ability ladder is in `ability-trees.md`.

| Tier | Max Power | Power regen / turn | Max Shields |
|---|---|---|---|
| 1 | 6 | +2 | 6 |
| 2 | 8 | +3 | 8 |
| 3 | 10 | +4 | 10 |
| 4 | 12 | +5 | 12 |

### Engine (Veil Drive) — *Speed* (Navigator)

The arcane drive: it doesn't thrust, it *slips* the ship through the Veil.

| Tier | Speed | Ability |
|---|---|---|
| 1 | 3 | **Attack Vector / Evasive** (base). |
| 2 | 4 | **Slip Step** — +2 to the crew's Initiative roll. |
| 3 | 5 | **Maneuver Thrusters** — Attack Vector / Evasive give +1 more. |
| 4 | 6 | **Veil Jump** — Break Contact can fully disengage (end the encounter or reset range and Initiative). |

---

## 7. The role modules (slots)

### Weaponry — *weapons & damage* (Gunner)

Mounts weapon **types**; the Gunner picks one when firing. Higher Tier = more
mounts and bigger finishes.

| Tier | Mounts | Ability |
|---|---|---|
| 1 | 1 | **Killing Blow / Suppressing Volley** (base). |
| 2 | 2 | **Autoloader** — Killing Blow +1/link. |
| 3 | 2 | **Point-Defense Net** — Point Defense intercepts +1. |
| 4 | 3 | **Spinal Overload** — once per battle, a Killing Blow that auto-Breaches and can't be reduced below 1 damage by a Reaction. |

*Munitions* (mount into Weaponry slots): **Pulse** (1d8, 1 Power) · **Beam**
(1d6, ×2 vs shields, 2) · **Torpedo** (Missile 2d6, ×½ shields / ×2 hull, 2) ·
**Flak** (utility, +Point Defense, 1). The **Lance (AP/Breach)** is *not* mounted
— it's a targeting effect delivered through chain abilities (Reactor Lance,
Killbox, Sensor lock).

### Optics — *intel & electronic warfare* (Sensor)

| Tier | Ability |
|---|---|
| 1 | **Target Lock / Blur** (base). |
| 2 | **Targeting Array** — Target Lock also +1 to hit down the chain. |
| 3 | **Spectre Array** — Blur is −3; Ghost negates +1. |
| 4 | **Deep Scan** — at battle start, reveal an enemy's full statblock and bank one free Target Lock. |

---

## 8. Shared modules

### Cargo — *salvage & consumables* (ship-wide)

Sets how much loot the ship can haul and how many **consumables** it can carry
(one-shot combat items: patch kits, aether charges, chaff). Higher Tier = bigger
hold + more consumable slots. The crew's interface to the loot economy.

### Utility — *a wildcard system* (any officer)

One flex module, chosen from a growing list, e.g.: **Cloak** (skip a turn of
being targeted), **Tractor** (pull a target a band closer), **Repair Drones**
(passive Hull regen), **Veil Anchor** (deny the enemy a Veil Jump), **Med-Bay**
(stabilise downed crew). Utility is where a ship gets its *quirk*.

---

## 9. Stat mapping (summary)

| Stat (combat) | Comes from |
|---|---|
| **Hull / HP** | Hull module Tier |
| **Armour Class** (defence base) | Hull module Tier |
| **Size** | Hull module |
| **Shields** + regen | Reactor module Tier |
| **Power budget** | Reactor module Tier |
| **Speed** (Initiative) | Engine module Tier (+ class) |
| **Attack rolls & damage** | Weaponry Tier (the Gunner's effective Tier) |
| **Sensor effects** | Optics Tier |
| **Command / Sync / Epic** | Bridge Tier |
| **Each officer's chain abilities** | *their* module's Tier |

> A role's d20 roll = **Crew Tier + their Module Tier + chain bonuses** (§3), and
> their available chain abilities are whatever that module has unlocked. The old
> single "Tier" is now this stack.

---

## 10. Loot & maintenance — the immersive loop

**Salvage.** Defeated ships, derelicts, stations, and faction rewards drop
**module cores** and **parts**. A core is a whole module at a Tier (a "Tier-2
Reactor core"); parts are the currency to *upgrade* a module you already own.

**Install at the drydock.** Between arcs, at a port or a safe drift, the crew:
- slots new cores (respecting class slots — there's **no crew-level cap**, so a
  high-Tier core found early is yours to run),
- spends parts to raise a module a Tier,
- swaps weapon types / Utility, re-chooses what the ship specialises in.

**Maintenance & strain.** A hard fight leaves **strain** on modules (knocked-out
or damaged organs from combat). Downtime repairs them; ignored strain means a
module runs a Tier low until fixed. This is the diegetic upkeep — roll it into
downtime scenes, not spreadsheets.

**Why it's fun:** every officer has a personal upgrade track tied to their
identity. The Gunner *wants* that Weaponry core; the Engineer eyes a fat Reactor;
the Navigator hunts a faster Veil Drive. Loot becomes shared anticipation, and the
ship grows into a character the whole table is invested in.

---

## 11. How modules feed combat

- **Your roll = Crew Tier + your Module Tier + chain bonuses** (§3). Gunner attack
  uses Weaponry Tier; Engineer repair uses Reactor Tier; the Navigator's Engine
  sets Speed (Initiative); the Commander's Bridge sets Sync/Epic.
- **Your abilities are what your module has unlocked.** This *is* the deferred
  ability ladder of `ship-combat.md` §6 — each module Tier adds an option and/or
  scaling, so by Tier 4 each seat has the full ≥2-Link / ≥2-Finish kit.
- **Damaged modules silence stations.** A Breach/critical can knock out a module;
  that officer loses their station until the Engineer repairs it — so the crew
  must cover for a downed seat, exactly the interdependence combat is built on.

This closes the loop: **find a part → install it → your chain hits harder → the
fight changes.**

---

## 12. Worked ship — *The Astral Cartographer* (crew level 2)

- **Class:** Cutter (Light, 3–5 crew, 4 slots, +1 Utility).
- **Required modules:** Hull T2 (HP 22, AC 11, Medium) · Bridge T1 · Reactor T2
  (Shields 8, Power 8) · Engine T2 (Speed 4).
- **Slots:** Weaponry T2 (mounts Pulse + Beam) · Optics T2 (Targeting Array) ·
  Cargo T1 · Utility: Repair Drones.
- **Power check:** Reactor budget 8; running Weaponry (Pulse 1 + Beam 2 = 3) +
  Optics (1) + Utility (1) = 5 ≤ 8. Legal, with headroom for the Engineer to
  Overcharge mid-fight.

The result: a balanced explorer whose Sensor (Targeting Array) sets up the Gunner's
shot — and, when the chain calls for it, the Engineer's Reactor **Lance** to crack
shields — kept alive by a solid Reactor and passive Repair Drones. Every officer
has an obvious next upgrade to chase (Bridge is lagging at T1; the Commander wants
a core).

---

## 13. Progression

- **Level up Crew Tier (1→4)** at story milestones — a flat bonus to every
  officer's rolls (your characters growing).
- **Find & install** module cores and parts as loot — the independent, uncapped
  axis; the drydock scene is where the *ship* visibly grows.
- **Re-spec freely** at a drydock — builds aren't permanent; the *story* gates
  change, not bookkeeping.
- **Named ships** earn a **quirk** (a free minor Utility-like trait) after
  surviving an arc — the vessel becomes a character.

---

## 14. Open questions

- **Roll-stack ceiling** — `Crew Tier + Module Tier + chain` can reach `+9`–`+11`
  at high end; do enemy ACs scale to match (Tier 4 AC ~15), or does the stack
  outrun the d20 and make high-Tier crews near-auto-hit? May need AC growth or a
  cap on stacked chain bonuses.
- **Power as build-only vs live dial** — keep the Engineer's in-combat Power
  reallocation, or simplify Power to a build-time check?
- **Module knock-outs** — how punishing should a silenced station be (skip the
  station entirely, or run at Tier 1)?
- **Class count** — six classes enough across the four Tiers, or do we want a
  dedicated support/carrier and a dedicated EW class too?
