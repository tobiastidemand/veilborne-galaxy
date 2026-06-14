# Veilborn Ship Building — Rules Draft v0.1

> **Status:** design draft. This is the companion layer to `ship-combat.md` —
> it's where a crew *builds the ship they fight in.* Combat is the verb; building
> is the noun. The two share one currency (**Power**) and one rank axis (**Tier**)
> so a choice made at the drydock is felt on the bridge.
>
> Like the combat rules, this is system-agnostic: it produces a one-page **ship
> sheet** the table tracks with dice and tokens.

---

## 1. Design pillars

1. **Every build is a crew identity.** A glass-cannon lance-boat, a shielded
   brawler, an EW ghost — the build should change *which chains the crew wants to
   run*, not just the numbers.
2. **The hard choice is Power.** You can't mount everything. Power is the budget
   at build time *and* the Engineer's dial in combat — the same resource, felt in
   both layers.
3. **Slots map to seats.** Most modules upgrade a *role's* chain abilities, so a
   build literally decides whose hand-offs hit hardest. No seat is left without
   something to buy.
4. **Tiers are milestones, not treadmills.** Going up a Tier is a story beat (a
   refit, a salvaged core) that grants real new options, not a flat stat bump.
5. **Table-first.** One sheet. Pick a frame, spend Power, note your slots. Done in
   ten minutes.

---

## 2. The build budget

A ship is defined by three things, all keyed to **Tier**:

| Resource | What it does | By Tier (1→5) |
|---|---|---|
| **Power** | Spent to mount weapons & systems; the Engineer reallocates it in combat. | 6 / 8 / 10 / 12 / 14 |
| **Weapon slots** | How many weapons you can mount. | 2 / 2 / 3 / 3 / 4 |
| **System slots** | How many systems (defensive/utility/role) you can mount. | 2 / 3 / 3 / 4 / 5 |

A frame also sets the ship's **base Hull & Shields** (the §11 combat table is the
*balanced* frame; other frames trade the same totals around — see §3).

> **Power in two layers.** At build time, the sum of your mounted gear's Power
> cost can't exceed your Tier's Power. In combat, the Engineer's hand-offs
> (Overcharge / Reroute) temporarily shift that Power between systems — so a build
> with a little Power *headroom* is more flexible mid-fight.

---

## 3. Frames (pick one)

A frame is the chassis. All frames share the Tier's Power/slot budget; they
differ in how Hull/Shields are split and a single signature trait. (Numbers shown
at **Tier 1**; they scale on the §11 curve.)

| Frame | Hull | Shields | Speed | Signature trait |
|---|---|---|---|---|
| **Survey Cutter** *(balanced)* | 16 | 6 | 3 | +1 System slot. The versatile default. |
| **Bulwark** *(brawler)* | 22 | 4 | 2 | Armour: the first 1 damage from each hit is ignored. |
| **Aegis** *(shield-tank)* | 12 | 10 | 2 | Shields regen +1/round and may over-charge further. |
| **Wraith** *(EW/skirmisher)* | 12 | 4 | 5 | Starts each battle Concealed (incoming −2 turn 1); +1 Weapon slot but −2 Power. |
| **Lance Runner** *(glass cannon)* | 14 | 4 | 4 | Heavy finishes deal **+1 per link** more; −2 Hull. |

> A frame nudges the crew toward a play-style without locking it: a Wraith *can*
> brawl, it's just better at ghosting. **Speed** drives Initiative (`ship-combat.md`
> §3) — a fast frame wins the right to Strike more often; a slow brawler expects to
> Brace and grind.

---

## 4. Weapons (fill weapon slots)

Weapons are what your **Gunner finish (Killing Blow)** and **Strafing / Counter**
finishes fire. You choose the *type* when you fire, from what you've mounted.

| Weapon | Power | Type | Best band | Notes |
|---|---|---|---|---|
| **Pulse Cannon** | 1 | Balanced | any | reliable, +accuracy. |
| **Beam Laser** | 2 | Laser | Close | shreds shields (+1 vs shields). |
| **Torpedo Rack** | 2 | Missile | Long | big vs hull (+1), but can be shot down by Point Defense. |
| **Spinal Lance** | 3 | AP | Close | bypasses shields, applies **Breach**; the Reactor-Lance enabler. |
| **Flak Battery** | 1 | — | any | not a finisher; grants the Gunner **+1 Point Defense** (Brace). |

> Mounting variety lets the Gunner pick the right type per target (laser into
> shields, missile into a bare hull, lance into armour). A mono-weapon build hits
> a wall against the wrong defenses — that's the trade.

---

## 5. Systems (fill system slots)

Systems mostly **upgrade a role's chain abilities** — so building the ship is
choosing whose hand-offs and finishes get sharper. One or two per seat exist at
Tier 1; more unlock by Tier.

| System | Power | Seat | Effect |
|---|---|---|---|
| **Command Suite** | 1 | Commander | Open hand-off becomes **+Tier +1**; Extend usable twice/battle. |
| **Battle Choir** | 2 | Commander | Sync needed for an Epic Chain drops from 5 to **4**. |
| **Maneuver Thrusters** | 1 | Navigator | Attack Vector / Evasive give **+1** more. |
| **Slip Drive** | 2 | Navigator | Break Contact also ends one enemy condition on the ship. |
| **Reactor Tap** | 1 | Engineer | Overcharge / Reroute give **+1 effect step**. |
| **Damage Control Bay** | 2 | Engineer | Damage Control repairs **+2** flat. |
| **Targeting Array** | 1 | Sensor | Target Lock also grants **+1 to hit** down the chain. |
| **Spectre Array** | 2 | Sensor | Blur is **−3** (was −2); Ghost negates **+1**. |
| **Autoloader** | 1 | Gunner | Killing Blow deals **+1 per link** more. |
| **Point-Defense Net** | 1 | Gunner | Point Defense negates **2** incoming, not 1. |
| **Reinforced Plating** | 1 | — | +4 Hull (defensive, no seat). |
| **Capacitor Bank** | 1 | — | +3 max Shields & +1 over-charge headroom. |

---

## 6. A worked build — *The Astral Cartographer* (Tier 1)

The campaign's survey ship, built for a 5-officer crew that likes long Strike
chains into a Lance finish.

- **Frame:** Survey Cutter — Hull 16, Shields 6, +1 System slot (so 2 weapon /
  3 system slots; Power 6).
- **Weapons (2):** Spinal Lance (3 Power) + Pulse Cannon (1 Power) = 4 Power.
- **Systems (3):** Targeting Array (1) + Reactor Tap (1) + Reinforced Plating
  (1) = 3 Power.
- **Total Power: 7 of 6.** Over budget by 1 — drop Reinforced Plating, or swap
  the Lance for a Beam Laser (2). The crew drops Plating: **6 / 6. Legal.**

The result: a ship whose **Strike chain** wants Sensor → Engineer → Navigator
feeding a **Gunner Lance finish** (Targeting Array + Reactor Tap make every
hand-off bite), with a Pulse Cannon as the flexible second weapon. Lightly
armoured — so the crew leans on the **Brace chain** to survive, not on raw Hull.
A clear identity, straight from the drydock choices.

---

## 7. Progression

- **Refit between arcs** — at a station/downtime, a crew may rebuild freely within
  their current Tier's budget. Builds aren't permanent; the *story* gates change,
  not bookkeeping.
- **Tier up** — a milestone (a salvaged core, a faction reward, a story beat)
  raises Tier: more Power, more slots, higher Hull/Shields on the §11 curve, and
  access to Tier-gated systems. Make it a scene, not a shopping trip.
- **Named ships** — a ship that survives an arc earns a **quirk** (a free minor
  trait: a lucky reactor, a haunted sensor suite). Flavour with light mechanical
  upside — the ship becomes a character.

---

## 8. How this feeds combat

Every build choice resolves to a modifier the combat rules already understand:

- Frames set **Hull / Shields / a trait**.
- Weapons set **which damage types** the Gunner/Navigator finishes can fire.
- Systems **buff specific chain abilities** (hand-offs, finishes, Sync rate, Point
  Defense, repair).
- **Power** is the build-time ceiling *and* the Engineer's in-combat dial.

So the combat doc stays the rules of play, and this doc is the dial-set that
personalises a crew's ship without adding a second resolution system.

---

## 9. Open questions (settle in playtest)

- **Power headroom** — should builds be allowed to leave Power unspent for
  in-combat Engineer flexibility, or is Power purely a build-time ceiling?
- **Slot inflation** — do Tier-5 ships (4 weapon / 5 system slots) get too strong,
  or is that the intended capital-ship power fantasy?
- **Frame balance** — is Lance Runner's +1/link too swingy with Autoloader
  stacking on top? (Cap total per-link bonuses?)
- **Quirks** — fixed table of named-ship quirks, or GM-improvised?
