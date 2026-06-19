# Veilborn Ship Combat — Rules Draft v0.4 · "Initiative & the Chain"

> **Status:** design draft for playtesting. This is the *tabletop* subsystem —
> runnable with dice, a ship sheet, and a few tokens. The companion app
> implements these rules; it does not define them.
>
> v0.4 keeps the crew-as-a-chain core but reshapes the turn around **Initiative**:
> each turn one ship **Acts** and the other **Reacts** — decided by **Speed** —
> and the two chains are revealed against each other. The crew no longer runs both
> chains a turn; winning (or stealing) the initiative is now a real decision, which
> gives the Navigator a job beyond positioning. Deltas from the current app are at
> the end.

---

## 1. Design pillars

1. **One crew, one ship, one chain.** A turn is not five separate moves. It's a
   *combo* the bridge builds together: one officer sets up the next, who sets up
   the next, until the last officer cashes it in. A lone good roll is weak; a
   well-ordered chain is devastating.
2. **The order is the decision.** Every turn the table asks: *who opens, who
   links, who finishes, and in what order?* Re-ordering the same five people
   produces a completely different outcome. That choice is the heart of play.
3. **Every seat can be the hero.** Every role can be the Finisher, and every
   Finisher's payoff scales with the chain the crew built. The spotlight rotates
   by situation, not by class. Setting up the killing blow feels as good as
   throwing it.
4. **Equal weight.** No role is a support sink. Each link is a real, flavorful
   contribution; the crew literally cannot reach a big finish without the links.
5. **Table-first.** Tiny, trackable numbers. The chain is just the turn order,
   written down. No screen required; no currency to bank.

---

## 2. The ship sheet (what the table tracks)

| Track | What it is | Notes |
|---|---|---|
| **Hull** | The ship's life. 0 = crippled (GM mercy table), not auto-destroyed. | Hard to restore mid-fight; the Engineer's Reaction finish is the main way. |
| **Shields** | Damage buffer. **No passive regen** — restored by reallocating **Power** (1-for-1). Can be over-charged. | Max set by the Reactor. |
| **Power** | The Reactor's tactical energy. Spent on big abilities; **reallocated to Shields**. **Regens +(Tier+1) each turn** (partial, never a full refill); starts full. | Max & regen set by the Reactor. Aether (travel fuel) is a campaign-sheet resource, not tracked in a fight. |
| **Tier** | Two tracks that **add on every roll**: **Crew Tier** (party level 1–4, shared) **+ Module Tier** (the acting officer's own module, uncapped). See `ship-building.md` §3. | The campaign progression axis. |
| **Speed** | How nimble the ship is. Drives **Initiative** — who Acts and who Reacts (§3). | Set by frame; the Navigator can boost it. |
| **Sync** | A streak counter: successful chains in a row. At **3**, the Commander banks an **Epic Chain** (§4). | Resets when a Finisher fails. The crew's teamwork meter. |
| **Heat** *(optional)* | Builds from overcharging; vents each turn. Too much = a system falters. | A push-your-luck knob; safe to ignore for a first game. |

That's the whole sheet. There is **no Momentum pool and no Power pool** to track —
the "fuel" for a big play is simply *how long a chain the crew built before the
Finisher acts.* (Ship-building, a separate layer, adds mountable systems and a
power budget that tune these numbers — but combat itself stays this light.)

Conditions are tracked per ship (see §6).

---

## 3. The turn

A turn is a **duel of two chains**: one ship Acts, the other Reacts. Four
beats. The bridge talks freely throughout — that's the point.

1. **Initiative** — both ships roll **`d20 + Speed`**. The winner takes the
   initiative: **they Act, the loser Reacts** this turn. (Ties → the higher
   Tier wins; still tied → re-roll.) Initiative is re-rolled every turn, so a slow
   ship can still seize a moment — and the Navigator's chain can tip it.
2. **Action Chain** — the turn's *offensive* phase, built by whoever holds the
   initiative (the crew if they won; otherwise the GM's ship). The Commander opens,
   the crew links, the last officer Finishes. (See §4.)
3. **Reaction Chain** — the turn's *defensive* phase, built by the other side. Same
   structure: Open → Links → Finish. (See §4.)
4. **Rolls** — the Action chain is revealed against the Reaction chain. Each applies
   the bonuses its links built, and rolls for whatever its Finisher produces — the
   attack against the reaction's defence. The GM resolves damage and conditions. Then
   the turn ends and a new **Initiative** is rolled.

> **Why this shape:** you don't get to both hit *and* turtle every turn. If you
> lose the initiative you are Bracing — so the crew has to play defence well, and
> *winning* the initiative (Speed, the Navigator's tricks) becomes a prize worth
> fighting for. One chain per side per turn keeps the whole bridge engaged and the
> pace sharp.

> **Both chains are built blind-ish, then revealed.** The fun tension: you're
> ordering your chain knowing whether you're the hammer or the anvil this turn, but
> not exactly how hard the other side committed. Tables that prefer it fully open
> can just build in view of each other — it still works.

---

## 4. How a Chain works

A Chain is just **the order the crew acts in, this beat.** It has three kinds of
position:

- **Open** — *always the Commander.* They set the chain's goal and hand the first
  link a boost. The Commander is the conductor; they don't Finish.
- **Link** — every officer between the Open and the Finish. Each takes their Link
  action, which (a) does its job and (b) **hands the next officer a specific
  boost.** This hand-off is automatic — no roll, no token.
- **Finish** — the *last* officer in the chain. They take their Finish action,
  the payoff, which is **amplified by how many links preceded it.**

### The hand-off (the "complement")

Each Link ability is written as "*…and the next officer gains ___.*" That's the
whole interaction — local and immediate. The crew's puzzle is to **order the
links so each hand-off is useful to the next person.** (Don't hand "a clean
firing angle" to someone who's about to repair; hand it to the Gunner.)

### The Finisher scales with the chain

A Finish action's size depends on **Chain Length** — the number of officers who
acted before the Finisher (Open + Links). More build-up = bigger finish. This is
why the crew *wants* to chain, and it's how a 3-player crew and a 6-player crew
both work: the finish simply scales to the table.

> Rule of thumb: a Finish gains **+1 step of effect (≈ +2 damage, or one extra
> condition stack) per link** that preceded it. Tune in playtest.

### Length is flexible — it's just your crew

The chain has **as many links as you have officers** — typically 3–5, sometimes 2
or 6. The Finisher scales to that length, so any table size works without
bookkeeping. Every officer present takes one position; the Commander always opens,
everyone else links or finishes.

### Sync and the Epic Chain (the Commander's payoff)

The Commander never Finishes — their reward is getting the *whole crew* firing as
one. That's tracked by **Sync**:

- A chain is **successful** when its **Finisher succeeds** (lands its attack or
  achieves its effect). Each successful chain the crew runs — Action *or* Reaction —
  ticks **Sync +1.**
- A **failed Finisher resets Sync to 0.**
- When **Sync hits 3**, the Commander **banks an Epic Chain.** Sync resets to 0,
  and the crew starts building the next streak.

Because the crew now runs only **one chain per turn** (Action or Reaction, depending
on the initiative), three successful chains take at least three turns — so the
**earliest an Epic Chain lands is turn 3.** Rebalanced down to 3 specifically for
the initiative turn; it keeps the payoff a genuine high point without making it
rare.

**The Epic Chain — "All as One":** the Commander spends a banked Epic Chain on
*one* chain of their choice — an **Epic Action** or an **Epic Reaction.** For that
chain, **position dissolves.** Every officer, simultaneously and in any order,
**chooses any one of their abilities (Link *or* Finish) and resolves it at full
power** — Finish actions scale as if the chain were the *entire crew*, and every
hand-off is treated as active. For one chain the bridge isn't a sequence; it's a
single weapon — either an overwhelming all-guns alpha strike, or a wall the enemy
breaks against. (Then the streak begins again from zero.)

> This is the campaign's signature beat: three chains of disciplined teamwork earn
> one chain where the whole crew is the Finisher. It's the Commander's trophy and
> everyone's spotlight at once — and the Commander still chooses *when* and *which
> way* (action or reaction) to unleash it.

---

## 5. Resolution

Most Link actions just **work** (maneuver, route power, give an order) — no roll,
keeps the chain snappy. Roll only for **attacks and contests** — usually a
Finish, occasionally a Link:

```
d20 + Crew Tier + Module Tier + chain bonuses  vs  the target's AC
```

Three things add: your **character** (Crew Tier), your **ship** (the acting
officer's Module Tier), and your **crew** (the chain's hand-offs). E.g. a Crew-3
Navigator with a Tier-3 Veil Drive and 3 chain bonuses rolls **d20 + 9**.

- **Hit:** meet or beat the AC.
- **Degrees of success:** every full **4 over** the AC adds a *bonus effect* —
  +damage, apply a condition, knock out a system. Big rolls *do* something.
- **Natural 20:** critical — maximum effect plus a free condition.
- **Natural 1:** complication — the GM gets a free enemy escalation, or a station
  briefly falters. (Optional, for swing.)
- **Advantage / Disadvantage:** roll **2d20** and keep the **higher** (advantage)
  or **lower** (disadvantage). Granted by Commands and abilities; they don't stack
  past one step (you have it or you don't), and one of each cancels out.

Modifiers come almost entirely from **the links before you** — the angle the
Navigator won, the lock the Sensor set, the suppression the Gunner laid down.
That's the design: your roll is good because the crew made it good.

**Opposed at reveal.** In the Rolls beat the **Action** chain's attack is rolled
against the **Reaction** chain's defence: the reaction's links and Finisher raise the
defender's AC, add intercepts/evasion, or repair pre-emptively, and the action's
links and Finisher push the attack the other way. The GM reads the two stacks
together and calls the result.

---

## 6. The crew — the ability matrix

Each role has a **Link** and a **Finish** for *each* chain (Action / Reaction).
You use **Finish** if you're the last officer in the chain; otherwise you use
**Link**. The **Commander** is the conductor: they always Open, and they never
Finish.

> Numbers below are first-pass and meant to be tuned. "+Tier" scales with rank;
> "per link" means it grows with Chain Length.

### Commander — *the conductor* (always Opens; never Finishes)

The Commander is the **first position in every chain** and the only **pure-support**
seat — they never throw the punch, they *shape* it. Their authority is built in:
after the crew debates the order, **the Commander has final say.** That gives the
player real command-chair weight (and ends table arguments fast).

- **Conductor (passive):** sets the chain order, takes the Open slot, tracks
  **Sync**, and spends the banked **Epic Chain** (§4).
- **Open · Action — "Call the Shot":** name the target and the chain's goal. The
  next officer gains **+Tier** to its action, and the chain treats the target's
  relevant defence as **1 lower**.
- **Open · Reaction — "All Hands":** read the incoming threat. The next officer gains
  **+Tier** to its defensive action.

**The Commander's role-mirroring kit (lives in the Bridge module —
`ship-building.md` §6).** Rather than a fixed toolbox, the Commander *unlocks one
ability that echoes each of the five seats* as the **Bridge** rises in Tier
(additive — new tiers add options, they never replace old ones), reaching all five
seats by **Tier 4** (the Bridge's *One Mind*). Each is a support play that sets up
that seat's moment. Example seed:

- *Tier 1 — Switch Weapon Systems (Gunner-facing):* the Commander orders a
  swap of weapon/ammunition type — ideal right before a Gunner Finisher, letting
  the crew pick the right damage type for the target.

This whole tiered layer waits on the ship-building system, because hull upgrades
will feed the final number-crunching and which abilities exist — see §6 note
below.

### Navigator — *position*

- **Link · Action — "Attack Vector":** swing to a clean firing line. *The next
  officer gains advantage / +2 to hit* (improved arc).
- **Finish · Action — "Strafing Run":** a fast pass dealing damage **+1 per
  link**, and you may split it across two targets — the mobile, multi-target
  finish.
- **Link · Reaction — "Evasive":** pull out of the kill zone. *The next officer is
  harder to hit (enemy −2)* and is out of the enemy's best arc.
- **Finish · Reaction — "Break Contact":** disengage to a safe range, **ending the
  enemy's attack run.** With a long chain, the break is clean (reset the
  engagement); short, it's a partial withdrawal.

### Engineer — *power & integrity*

- **Link · Action — "Overcharge":** route reactor power into the next officer's
  system. *The next officer's action gains +1 step of effect* (extra damage /
  stronger condition). (Optionally: take **+1 Heat**.)
- **Finish · Action — "Reactor Lance":** dump the built-up charge into one
  system-frying blow: damage **+2 per link**, and on a hit it **Disables** a
  random enemy system — the heavy single-target finish.
- **Link · Reaction — "Reroute":** shunt power to the next station. *The next
  officer's defensive action is stronger (+1 step).*
- **Finish · Reaction — "Damage Control":** restore **Shields or Hull, +1 per
  link** — the recovery finish. The longer the crew screened you, the more you
  patch.

### Sensor Officer — *intel & electronic warfare*

- **Link · Action — "Lock On":** designate the target as **Locked On**. *The chain
  treats its **AC as 2 lower**.* The Sensor's signature assist.
- **Link · Reaction — "Blur":** jam their optics. *The enemy's attack this turn is
  at **−2 to hit**.*
- **Finish · Action — "Hack":** breach a system and **disable** it (the overload
  deals **1d6**).
- **Finish · Reaction — "Ghost":** spoof the enemy: its attack this turn is at
  **disadvantage**. *(Mitigation — it misses, it doesn't negate.)*

> The Sensor deals **no real damage** — its Lines *assist* the chain and its
> Finishes are *electronic warfare*. Full ladder in `ability-trees.md`.

### Gunner — *firepower*

- **Link · Action — "Suppressing Volley":** pin the enemy with fire. *The next
  officer can't be interrupted*, and the enemy's AC drops by 2 (plus chip
  damage).
- **Finish · Action — "Killing Blow":** the classic payoff — damage **+2 per
  link**. The biggest single-target finish; choose a weapon type vs the target's
  defenses (§7).
- **Link · Reaction — "Point Defense":** shoot down incoming ordnance, **or** lay
  suppressive fire so *the next officer can act without drawing the enemy's fire*
  (your example chain).
- **Finish · Reaction — "Counter-Volley":** turn defense into offense — a retaliatory
  shot on the attacker, damage **+1 per link.** The crew reacted so well it
  punishes the enemy for swinging.

> **Read the matrix as a toolkit, not a script.** Every role contributes to both
> offense and defense; every role can finish either chain. What changes turn to
> turn is *the order* — and that's the game.

> **The full ability ladder is its own document — `ability-trees.md`.** The matrix
> above is each seat's **Tier-1 base**; each module is a **5-tier skill tree**
> (T5 = Legendary) where every level-up grants a Standard unlock + a branch Choice.
> A role's `+Tier` on rolls is *their module's* Tier (atop Crew Tier + chain).

---

## 7. Damage, defenses & conditions

**Munitions** (mounted in the Weaponry module; the Gunner picks one when firing).
Damage is rolled in dice — extra dice come from specific chain abilities, not
automatically per link.

| Munition | Damage | Vs shields | Vs hull | Niche |
|---|---|---|---|---|
| **Pulse** | **1d8** | normal | normal | reliable all-rounder |
| **Beam / Laser** | **1d6** | **×2** | normal | shreds shields |
| **Missile** | **2d6** | **×½** | **×2** | guts hulls; can be shot down |

> **The Lance (AP / Breach) is not a mounted munition — it's a *targeting effect*
> delivered through chain abilities** (e.g. the Engineer's Reactor Lance, the
> Sensor's lock). The "lance" is something the crew *sets up*, not a gun you bolt
> on. Shields/armour subtract from the rolled total.
>
> *Other special munitions (EMP rounds, flak, scatter, etc.) are a planned
> expansion — to spec after the core ability ladder is done.*

**Conditions** (small, named, with durations):

- **Locked On** — the Sensor's lock: the chain treats the target's **AC as lower**
  and unlocks the Sensor's Lock On bonuses. *(Replaces the old "Marked".)*
- **Breached** — defenses cracked; extra damage / bypasses shields.
- **Burning** — loses Hull at Cool Down.
- **Disabled** — a system goes offline **briefly** (skips its next use), then
  reboots on its own. The *temporary* shutdown.
- **Crippled** — a system is wrecked and stays offline **until repaired** (an
  Engineer action or downtime). The *lasting* version of Disabled.

**Defenses:** AC (how hard to hit) is raised by evasion/position, lowered by
Locked On/Breached. Armour reduces damage; shields buffer it. **Damage Reduction
(DR)** is a flat **−X to incoming damage** for the round granted by some abilities
(e.g. Brace for Impact, Rally); **multiple DR sources stack.**

> **One attack per turn → mitigate, don't negate.** The Acting side lands a single
> finisher each turn — one attack, its damage rolled from the chain. So a Reaction
> chain *reduces* the hit (miss it via AC, impose disadvantage, halve or DR the
> damage, or repair after) rather than cancelling it outright. **Full negation is a
> rare 1/battle legendary effect, never a cheap ability.** (Multi-enemy fights: the
> GM may run more than one attacker — defences still mitigate per hit.)

---

## 8. Positioning — zones, not a grid

Track range as **zones**: *Boarding · Close · Medium · Long* (plus simple
flank/arc tags). Weapons and tactics prefer different bands (missiles love Long,
lances love Close, point-defense matters up close). The Navigator's Link actions
move the ship between bands — fast to run, meaningful to fight over, no minis
required.

---

## 9. GM section

- **Enemy statblocks** — Hull, Shields, AC, Tier, weapons, 1–2 special moves, and
  a morale/retreat trigger.
- **Stat-by-Tier table** — baseline numbers per Tier so the GM can stat a foe in
  seconds.
- **Enemy ships have Speed** and roll Initiative like the crew. When the GM's ship
  **wins** the initiative it builds the **Action** chain (keep it to an Open +
  Finish for speed); when it **loses**, it builds the **Reaction** chain. Give each
  foe a simple priority ("focus the Locked On ship," "close to Boarding," "always
  juke when Bracing").
- **Threat budget** — build an encounter to a budget for the crew's Tier and size
  (e.g. *Threat ≈ crew Tier × 4*; a swarm spends it on many cheap hulls, a duel
  on one elite). Note: a bigger crew builds *longer chains*, so scale enemy
  durability to crew size, not just Tier.
- **Roster** — ~8–12 sample foes raider → capital, plus hazards (asteroid field,
  nebula EW, station guns, the Devourer's gravity).

---

## 10. Worked example (two turns)

*The Astral Cartographer (Tier 1, 5 officers) vs a Cobalt Reaver (frigate,
AC 12, Speed 2).*

### Turn 1 — Initiative

Both roll `d20 + Speed`. The Cartographer (Speed 3) rolls 14 → **17**; the Reaver
rolls 9 → **11**. The crew wins the initiative: **the crew Acts, the Reaver
Reacts.**

**Action Chain (crew):** the Commander builds toward a Gunner finish.
1. **Open · Commander "Call the Shot"** → names the Reaver; chain +1 to hit, its
   defence treated as 1 lower.
2. **Link · Sensor "Lock On"** → Locks it; the chain treats its AC as 2 lower.
3. **Link · Navigator "Attack Vector"** → +2 to hit.
4. **Finish · Gunner "Killing Blow"** (Lance/AP) → Chain Length 3 → **+6 damage**.

**Reaction Chain (Reaver):** the GM keeps it simple — the frigate juke (+2 defence).

**Rolls:** the Gunner's attack `d20(13)+Tier(1)+toHit(3)=17` vs the Reaver's
reaction AC `12 − 2 (lock) − 1 (call) + 2 (juke) = 11` → hit by 6 (one degree) →
**Breach** (the Engineer's Lance cracked it) plus heavy damage. The Reaver is
gutted. **Sync 1.**

### Turn 2 — Initiative

Re-roll. The wounded Reaver burns hard (Speed 2) and rolls **18**; the crew rolls
**12**. The Reaver takes the initiative: **the Reaver Acts, the crew Reacts.**

**Action Chain (Reaver):** the GM swings its cannons (a Tier-1 attack).

**Reaction Chain (crew):** the Commander builds a defensive chain.
1. **Open · Commander "All Hands"** → +1 ship defence.
2. **Link · Gunner "Point Defense"** → an intercept banked.
3. **Link · Sensor "Blur"** → incoming −2.
4. **Finish · Engineer "Damage Control"** → Chain Length 3 → restores **Shields
   +6**.

**Rolls:** the Reaver's cannon `d20+Tier` is rolled against the reacting ship —
defence raised, incoming −2 from the Blur; what little gets through is soaked by
the freshly restored shields. **Sync 2.** One more clean chain and the Commander
banks an **Epic Chain.**

> The whole fight now pivots on the initiative: win it and you press the attack,
> lose it and you'd better have reacted well — which is exactly the defensive
> pressure the new turn is meant to create.

---

## 11. Numbers (v0.4 playtest defaults)

These are the concrete values the companion app targets, so paper and screen
agree. All are first-pass and meant to be tuned in play.

### Core dials

| Dial | Value | Note |
|---|---|---|
| **Initiative** | `d20 + Speed` per ship; high wins | winner Acts, loser Reacts; ties → higher Tier. |
| **Attack roll** | `d20 + Crew Tier + Module Tier + chain vs AC` | character + ship + crew; AC is raised by the Reaction chain at reveal. |
| **Degree of success** | every **4** over the AC | each degree = a bonus effect (+1 damage or a condition). |
| **Critical** | natural **20** (some abilities widen the range) | doubles damage, applies a condition. |
| **Heavy finish scaling** | **+2 damage per link** | Killing Blow, Reactor Lance. |
| **Light finish scaling** | **+1 per link** | lighter finishes (ram, counter, repair, etc.). |
| **Chain Length cap** | **4** | scaling stops counting past 4 links. |
| **Action economy** | **one chain per turn** | the crew Acts *or* Reacts, set by the initiative. |
| **Sync → Epic** | **3** successful chains | earliest payoff = turn 3. |
| **Epic Chain** | every officer Finishes once, scaled at **Chain Length 4** | the cap keeps an Epic Action from one-shotting a capital ship. |
| **Commanderless** | any one officer takes the Open | generic Open = +Tier hand-off; they hold the captaincy that chain. |

### Munition damage (base dice; chain abilities add more dice)

| Munition | Damage | Vs shields | Vs hull | Power to mount |
|---|---|---|---|---|
| **Pulse** | 1d8 | normal | normal | 1 |
| **Beam / Laser** | 1d6 | ×2 | normal | 2 |
| **Missile** | 2d6 | ×½ | ×2 | 2 |

AP / **Breach** (the "Lance") is delivered by chain abilities, not mounted (§7).

### Player ship baselines by module Tier (1–4)

Each stat comes from its **module** at that Tier (`ship-building.md` §6). A ship
with all modules at the same Tier reads like a row below; mixed builds mix rows.
`Module +` is just that module's Tier — the **roll bonus on top is Crew Tier +
Module Tier + chain** (§5).

| Module Tier | Module + | Hull (Hull mod) | Shields (Reactor) | Regen | Speed (Engine) | AC |
|---|---|---|---|---|---|---|
| 1 | +1 | 16 | 6 | 2 | 3 | 10 |
| 2 | +2 | 22 | 8 | 2 | 4 | 11 |
| 3 | +3 | 30 | 10 | 3 | 5 | 12 |
| 4 | +4 | 40 | 12 | 3 | 6 | 13 |

Class traits shift Speed/Hull (a Wraith is faster, a Warden tougher and slower).

### Enemy stat-by-Tier (1–4, Line size = ×1)

| Tier | Hull | Shields | AC | Attack |
|---|---|---|---|---|
| 1 | 12 | 3 | 12 | 3 |
| 2 | 18 | 4 | 13 | 4 |
| 3 | 24 | 6 | 14 | 5 |
| 4 | 32 | 8 | 15 | 6 |

Enemy **Speed** defaults to its Tier + 1 (a Skirmisher is +2 faster, an Elite
−1 slower) — so light foes tend to win the initiative and press, heavies tend to
react and grind.

**Size modifiers:** *Skirmisher* — ½ Hull, −2 AC, +2 Speed, breaks early. *Line* —
as above. *Elite* — ×2 Hull, +2 AC, +1 Attack, −1 Speed, a special move, holds
morale.

### Threat budget

Build an encounter to **Threat ≈ crew Tier × crew size.** Spend it:

| Foe | Cost |
|---|---|
| Skirmisher | 1 × its Tier |
| Line | 2 × its Tier |
| Elite | 4 × its Tier |

A bigger crew builds longer chains *and* gets more budget — so it faces more or
tougher hulls, not just bigger numbers.

### Still genuinely open (decide in play)

- **Initiative swinginess** — is `d20 + Speed` too random (a slow ship wins too
  often), or is that volatility the point? Alternative: best-of or Speed as a flat
  tiebreaker with a smaller die.
- **Losing the initiative every turn** — does a much faster enemy that keeps
  Acting feel oppressive? May need a catch-up rule (e.g. the Reacting side banks a
  small bonus toward next turn's initiative).
- **Chain Length cap of 4** — right at a 6-player table, or raise to 5?
- **Navigator initiative boosts** — how much should a Navigator chain be able to
  tip next turn's roll? (Part of the on-hold tiered-ability work.)

---

## 12. Deltas — v0.3 → v0.4, and the app

The app (`/battle`) currently implements **v0.3** (both chains every round,
Sync 5, no Speed/Initiative). v0.4 changes:

- **Turn, not round** → new **Initiative / Action / Reaction / Rolls** turn. Both
  ships roll `d20 + Speed`; the winner Acts and the loser Reacts. The crew runs
  **one** chain per turn, not both.
- **Speed stat added** to the sheet; drives Initiative.
- **Extend / Cut removed** (the Commander no longer bends chain length).
- **Sync → Epic lowered to 3** (rebalanced for one-chain-per-turn).
- **Resolution is opposed** — Action chain vs Reaction chain, revealed and rolled
  together in the Rolls beat.
- **Commander reframed** — first position, pure-support, final say on the order;
  gains a role-mirroring kit that lives in the **Bridge module** (`ship-building.md`).
- **Tier cap is now 4** (matches the crew level cap) and **per-module** — a role's
  `+Tier` is *their* module's Tier.
- **Role matrix expansion** — the ability ladder (≥2 Link / ≥2 Finish per seat,
  one new option + scaling per Tier) is now defined by the **module system**
  (`ship-building.md` §6–7), not a flat crew Tier.

**App status:** the engine runs the **v0.4 initiative turn** (initiative, Speed,
one chain per turn, Sync 3). Still **not built in the app:** the **module/ship
system** and the **per-module ability ladder** (and the Tier-5→4 trim). Those are
the next big build now that both systems are fleshed out on paper.
