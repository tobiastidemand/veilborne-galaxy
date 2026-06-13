# Veilborn Ship Combat — Rules Draft v0.3 · "The Chain"

> **Status:** design draft for playtesting. This is the *tabletop* subsystem —
> runnable with dice, a ship sheet, and a few tokens. The companion app
> implements these rules; it does not define them.
>
> v0.3 is a ground-up redesign. The old labels (Momentum, a separate Reaction
> phase, per-officer power pools) are gone. The whole system is now built around
> one idea: **the crew acts as a chain.** Deltas from the current app are at the
> end.

---

## 1. Design pillars

1. **One crew, one ship, one chain.** A round is not five separate turns. It's a
   *combo* the bridge builds together: one officer sets up the next, who sets up
   the next, until the last officer cashes it in. A lone good roll is weak; a
   well-ordered chain is devastating.
2. **The order is the decision.** Every round the table asks: *who opens, who
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
| **Hull** | The ship's life. 0 = crippled (GM mercy table), not auto-destroyed. | Hard to restore mid-fight; the Engineer's Brace finish is the main way. |
| **Shields** | Damage buffer. Regenerates a little each round; can be over-charged. | Weapon types interact differently (see §6). |
| **Tier** | Ship/crew rank (1–5). The flat bonus added to rolls. | The campaign progression axis. |
| **Sync** | A streak counter: successful chains in a row. At **5**, the Commander banks an **Epic Chain** (§4). | Resets when a Finisher fails. The crew's teamwork meter. |
| **Heat** *(optional)* | Builds from overcharging / extending chains; vents each round. Too much = a system falters. | A push-your-luck knob; safe to ignore for a first game. |

That's the whole sheet. There is **no Momentum pool and no Power pool** to track —
the "fuel" for a big play is simply *how long a chain the crew built before the
Finisher acts.* (Ship-building, a separate layer, adds mountable systems and a
power budget that tune these numbers — but combat itself stays this light.)

Conditions are tracked per ship (see §6).

---

## 3. The round

Four beats. The bridge talks freely throughout — that's the point.

1. **Spool Up** — Shields regenerate a little; clear last round's round-scoped
   effects; tick "start of round" durations.
2. **Strike Chain** — the crew's offense. The Commander opens; the crew links a
   combo; the last officer Finishes. (See §4.)
3. **Brace Chain** — the enemy acts, and the crew links a response to weather
   it: evade, screen, repair, or counter. The Commander opens this one too. (See
   §4.)
4. **Cool Down** — resolve durations (Burning, etc.), vent Heat, count down
   conditions, check enemy morale/retreat.

> **Why this shape:** Strike = "we hit them, together." Brace = "we take the
> return, together." Two short chains per round keeps everyone engaged the whole
> time and keeps the pace fast — nobody sits idle waiting for "their turn."

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

### Length is flexible — the Commander shapes it

The chain has **as many links as you have officers** — typically 3–5, sometimes 2
or 6. The **Commander (conductor)** can bend it, once per chain:

- **Extend** — insert an extra link: one officer acts a *second* time (great for a
  longer build, but see Heat / GM discretion).
- **Cut** — skip the remaining links and go straight to a Finisher *now* for a
  fast, smaller payoff (when speed beats size — e.g. finish a fleeing enemy, or
  brace *right now* against a killing blow).

> A short chain is fast and safe; a long chain is big but commits the whole crew
> to one play (and leaves less flexibility in the *other* chain that round). That
> tension — build big or stay nimble — is the recurring decision.

### Sync and the Epic Chain (the Commander's payoff)

The Commander never Finishes — their reward is getting the *whole crew* firing as
one. That's tracked by **Sync**:

- A chain is **successful** when its **Finisher succeeds** (lands its attack or
  achieves its effect). Each successful chain — Strike or Brace — ticks **Sync
  +1.**
- A **failed Finisher resets Sync to 0.** (A **Cut** chain neither builds nor
  resets — going nimble is safe, it just doesn't count toward the streak.)
- When **Sync hits 5**, the Commander **banks an Epic Chain.** Sync resets to 0,
  and the crew starts building the next streak.

Because a round has two chains, the streak takes at least five successful chains
to fill — so the **earliest an Epic Chain lands is round 3.** That cadence keeps
it a genuine high point rather than a routine button.

**The Epic Chain — "All as One":** the Commander spends a banked Epic Chain on
*one* chain of their choice — an **Epic Strike** or an **Epic Brace.** For that
chain, **position dissolves.** Every officer, simultaneously and in any order,
**chooses any one of their abilities (Link *or* Finish) and resolves it at full
power** — Finish actions scale as if the chain were the *entire crew*, and every
hand-off is treated as active. For one chain the bridge isn't a sequence; it's a
single weapon — either an overwhelming all-guns alpha strike, or a wall the enemy
breaks against. (Then the streak begins again from zero.)

> This is the campaign's signature beat: five chains of disciplined teamwork earn
> one chain where the whole crew is the Finisher. It's the Commander's trophy and
> everyone's spotlight at once — and the Commander still chooses *when* (which
> round) and *which way* (strike or brace) to unleash it.

---

## 5. Resolution

Most Link actions just **work** (maneuver, route power, give an order) — no roll,
keeps the chain snappy. Roll only for **attacks and contests** — usually a
Finish, occasionally a Link:

```
d20 + Tier + situational modifiers  vs  the target's TN (Target Number)
```

- **Hit:** meet or beat the TN.
- **Degrees of success:** every full **4 over** the TN adds a *bonus effect* —
  +damage, apply a condition, knock out a system. Big rolls *do* something.
- **Natural 20:** critical — maximum effect plus a free condition.
- **Natural 1:** complication — the GM gets a free enemy escalation, or a station
  briefly falters. (Optional, for swing.)

Modifiers come almost entirely from **the links before you** — the angle the
Navigator won, the lock the Sensor set, the suppression the Gunner laid down.
That's the design: your roll is good because the crew made it good.

---

## 6. The crew — the ability matrix

Each role has a **Link** and a **Finish** for *each* chain (Strike / Brace).
You use **Finish** if you're the last officer in the chain; otherwise you use
**Link**. The **Commander** is the conductor: they always Open, and they never
Finish.

> Numbers below are first-pass and meant to be tuned. "+Tier" scales with rank;
> "per link" means it grows with Chain Length.

### Commander — *the conductor* (always Opens; never Finishes)

- **Conductor (passive):** sets the chain order each beat and takes the first
  position. Once per chain may **Extend** (an officer acts twice) or **Cut**
  (jump to a Finisher now). Tracks **Sync**, and spends the banked **Epic Chain**
  when the crew has earned it (§4).
- **Open · Strike — "Call the Shot":** name the target and the chain's goal. The
  next officer gains **+Tier** to its action, and the whole chain treats the
  target's relevant defense as **1 lower**.
- **Open · Brace — "All Hands":** read the incoming threat. The next officer
  gains **+Tier** to its defensive action; if the enemy's hit would disable a
  station, the Commander may redirect it to a station of their choice (spread the
  pain).

### Navigator — *position*

- **Link · Strike — "Attack Vector":** swing to a clean firing line. *The next
  officer gains advantage / +2 to hit* (improved arc).
- **Finish · Strike — "Strafing Run":** a fast pass dealing damage **+1 per
  link**, and you may split it across two targets — the mobile, multi-target
  finish.
- **Link · Brace — "Evasive":** pull out of the kill zone. *The next officer is
  harder to hit (enemy −2)* and is out of the enemy's best arc.
- **Finish · Brace — "Break Contact":** disengage to a safe range, **ending the
  enemy's attack run.** With a long chain, the break is clean (reset the
  engagement); short, it's a partial withdrawal.

### Engineer — *power & integrity*

- **Link · Strike — "Overcharge":** route reactor power into the next officer's
  system. *The next officer's action gains +1 step of effect* (extra damage /
  stronger condition). (Optionally: take **+1 Heat**.)
- **Finish · Strike — "Reactor Lance":** dump the built-up charge into one
  system-frying blow: damage **+2 per link**, and on a hit it **Disables** a
  random enemy system — the heavy single-target finish.
- **Link · Brace — "Reroute":** shunt power to the next station. *The next
  officer's defensive action is stronger (+1 step).*
- **Finish · Brace — "Damage Control":** restore **Shields or Hull, +1 per
  link** — the recovery finish. The longer the crew screened you, the more you
  patch.

### Sensor Officer — *intel & electronic warfare*

- **Link · Strike — "Target Lock":** paint a weak point (**Marked**). *The next
  officer ignores the target's shields, or treats its TN as 2 lower.*
- **Finish · Strike — "Killbox":** turn all the setup into certainty — the Finish
  **auto-applies Breach** and crits on **19–20**, scaling its window **+1 per
  link**. The precision finish (best with a long build).
- **Link · Brace — "Blur":** hack enemy optics. *The next officer is concealed —
  incoming attacks against the crew take −2 this beat.*
- **Finish · Brace — "Ghost":** spoof the enemy entirely — **negate one incoming
  hit, +1 negated per two links**, or end a condition on the ship. The evasion
  finish.

### Gunner — *firepower*

- **Link · Strike — "Suppressing Volley":** pin the enemy with fire. *The next
  officer can't be interrupted*, and the enemy's TN drops by 2 (plus chip
  damage).
- **Finish · Strike — "Killing Blow":** the classic payoff — damage **+2 per
  link**. The biggest single-target finish; choose a weapon type vs the target's
  defenses (§7).
- **Link · Brace — "Point Defense":** shoot down incoming ordnance, **or** lay
  suppressive fire so *the next officer can act without drawing the enemy's fire*
  (your example chain).
- **Finish · Brace — "Counter-Volley":** turn defense into offense — a retaliatory
  strike on the attacker, damage **+1 per link.** The crew braced so well it
  punishes the enemy for swinging.

> **Read the matrix as a toolkit, not a script.** Every role contributes to both
> offense and defense; every role can finish either chain. What changes round to
> round is *the order* — and that's the game.

---

## 7. Damage, defenses & conditions

**Weapon types** (your ship-building choices determine which you mount):

| Type | Vs shields | Vs hull | Niche |
|---|---|---|---|
| **Balanced** | normal | normal | reliable, accurate |
| **Laser** | strong (+) | normal | shred shields |
| **Missile** | weak (−) | strong (+) | finish hulls; can be shot down |
| **AP / Lance** | bypasses | low + **Breach** | crack armoured / shielded foes |

**Conditions** (small, named, with durations):

- **Marked** — attackers get a bonus vs this target.
- **Breached** — defenses cracked; extra damage / bypasses shields.
- **Burning** — loses Hull at Cool Down.
- **Disabled** — a system (or the ship) skips its next chain.
- **Crippled** — a specific system knocked out until repaired.

**Defenses:** TN (how hard to hit) is raised by evasion/position, lowered by
Marked/Breached. Armour reduces damage; shields buffer it.

---

## 8. Positioning — zones, not a grid

Track range as **zones**: *Boarding · Close · Medium · Long* (plus simple
flank/arc tags). Weapons and tactics prefer different bands (missiles love Long,
lances love Close, point-defense matters up close). The Navigator's Link actions
move the ship between bands — fast to run, meaningful to fight over, no minis
required.

---

## 9. GM section

- **Enemy statblocks** — Hull, Shields, TN, Tier, weapons, 1–2 special moves, and
  a morale/retreat trigger.
- **Stat-by-Tier table** — baseline numbers per Tier so the GM can stat a foe in
  seconds.
- **The enemy's turn = the Brace trigger.** In the Brace Chain the GM declares the
  enemy's action(s) first; *then* the crew links its response. Give each foe a
  simple priority ("focus the Marked ship," "close to Boarding," "vent on 2+
  Breach").
- **Threat budget** — build an encounter to a budget for the crew's Tier and size
  (e.g. *Threat ≈ crew Tier × 4*; a swarm spends it on many cheap hulls, a duel
  on one elite). Note: a bigger crew builds *longer chains*, so scale enemy
  durability to crew size, not just Tier.
- **Roster** — ~8–12 sample foes raider → capital, plus hazards (asteroid field,
  nebula EW, station guns, the Devourer's gravity).

---

## 10. Worked example (one full round)

*The Astral Cartographer (Tier 1, 4 officers: Commander, Sensor, Engineer,
Gunner, Navigator) vs a Cobalt Reaver (frigate, TN 12) and a Lance Cutter
(TN 14, missile boat).*

### Strike Chain — the crew goes for the Cutter

The Commander wants the missile boat dead. They build a long chain to a Gunner
finish:

1. **Open · Commander "Call the Shot"** → names the Lance Cutter; treats its
   defense as 1 lower; hands the next link +Tier.
2. **Link · Sensor "Target Lock"** → Marks the Cutter; *hands the Gunner: ignore
   its shields.* (But the Gunner isn't next — the Navigator is. The crew ordered
   it so the Navigator's hand-off, not the Sensor's, lands on the Gunner. They
   re-order on the fly: Sensor's lock is a standing **Marked** condition, so it
   still helps; the immediate hand-off goes to whoever's next.)
3. **Link · Navigator "Attack Vector"** → wins the firing line; *hands the
   Gunner +2 to hit.*
4. **Finish · Gunner "Killing Blow"** with a Lance (AP) → Chain Length 3, so
   **+6 damage**; Marked + bypass-shields + the angle. Rolls `d20(14)+Tier(1)+
   Marked(2)+angle(2) = 19` vs TN 14 → hit, +5 over = a degree → **Breach** on top
   of the heavy AP damage. The Cutter is gutted.

> Note how nearly every modifier on that final roll came from a teammate. Solo,
> the Gunner rolls `d20+1`. Chained, they roll `d20+5` *and* deal +6.

### Brace Chain — the Reaver and the wounded Cutter return fire

The GM declares: the Reaver fires cannons; the Cutter (Breached, desperate)
launches its last missile. The crew braces — your defensive example, run as a
chain to an Engineer recovery finish:

1. **Open · Commander "All Hands"** → reads the volley; hands the next +Tier
   defense.
2. **Link · Gunner "Point Defense / Suppressive Fire"** → shoots down the
   Cutter's missile, *and* suppresses the Reaver so *the next officer can move
   safely.*
3. **Link · Navigator "Evasive"** → repositions to a safe band; *the next officer
   is concealed-adjacent and the enemy is at −2.*
4. **Link · Sensor "Blur"** → hacks the Reaver's optics; *the next officer works
   unseen (incoming −2).*
5. **Finish · Engineer "Damage Control"** → Chain Length 4, so restores
   **Shields/Hull +4**, safely, because the whole crew screened the work.

The Reaver's cannon shot, fired into the blur at −2 and a repositioned target,
glances off the freshly restored shields. The bridge weathered it **together.**

### Cool Down

Breach persists on the Cutter; no Burning. The Reaver checks morale — with its
escort gutted, it begins to disengage.

---

## 11. Numbers (v0.3 playtest defaults)

These are the concrete values the companion app uses, so paper and screen agree.
All are first-pass and meant to be tuned in play.

### Core dials

| Dial | Value | Note |
|---|---|---|
| **Attack roll** | `d20 + Tier + hand-offs vs TN` | Tier is the flat rank bonus. |
| **Degree of success** | every **4** over the TN | each degree = a bonus effect (+1 damage or a condition). |
| **Critical** | natural **20** (Killbox: **19–20**) | doubles damage, applies a condition. |
| **Heavy finish scaling** | **+2 damage per link** | Killing Blow, Reactor Lance. |
| **Light finish scaling** | **+1 per link** | Strafing Run, Counter-Volley, Killbox, Damage Control, Ghost. |
| **Chain Length cap** | **4** | scaling stops counting past 4 links — keeps long chains from spiking. |
| **Action economy** | once per chain → **twice per round** | each officer may act in both the Strike and the Brace chain. |
| **Extend** | **once per battle** (free; +1 Heat if using Heat) | the conductor's "act twice." |
| **Cut** | Finisher gets **+2** to its roll | rewards going nimble. |
| **Sync → Epic** | **5** successful chains | earliest payoff = round 3. |
| **Epic Chain** | every officer Finishes once, scaled at **Chain Length 4** | the cap keeps an Epic Strike from one-shotting a capital ship. |
| **Commanderless** | any one officer takes the Open | generic Open = +Tier hand-off; they hold the captaincy that chain. |

### Weapon base damage (before scaling & hand-offs)

| Type | Base | Vs shields | Vs hull | Power to mount |
|---|---|---|---|---|
| **Balanced** | 2 | normal | normal | 1 |
| **Laser** | 2 | +1 | normal | 2 |
| **Missile** | 3 | −1 | +1, can be shot down | 2 |
| **AP / Lance** | 2 | bypasses | applies **Breach** | 3 |

### Player ship by Tier

| Tier | +bonus | Hull | Shields | Shield regen / round |
|---|---|---|---|---|
| 1 | +1 | 16 | 6 | 2 |
| 2 | +2 | 22 | 8 | 2 |
| 3 | +3 | 28 | 10 | 3 |
| 4 | +4 | 36 | 12 | 3 |
| 5 | +5 | 44 | 14 | 4 |

(Ship-building redistributes these around the same totals — see `ship-building.md`.)

### Enemy stat-by-Tier (Line size = ×1)

| Tier | Hull | Shields | TN | Attack |
|---|---|---|---|---|
| 1 | 12 | 3 | 12 | 3 |
| 2 | 18 | 4 | 13 | 4 |
| 3 | 24 | 6 | 14 | 5 |
| 4 | 32 | 8 | 15 | 6 |
| 5 | 40 | 10 | 16 | 7 |

**Size modifiers:** *Skirmisher* — ½ Hull, −2 TN, breaks early. *Line* — as above.
*Elite* — ×2 Hull, +2 TN, +1 Attack, a special move, holds morale.

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

- Does the Chain Length cap of 4 feel right at a 6-player table, or should it rise
  to 5?
- Should **Cut** also bank Sync (currently it's neutral — neither builds nor
  breaks the streak)?
- Is "once per battle" the right rate for **Extend**, or once per *Epic* cycle?

---

## 12. Deltas from the current app prototype

The app (`/battle`) implements the older v1 system. v0.3 changes:

- **Round shape** → from Start/Action/Reaction/End to **Spool Up / Strike Chain /
  Brace Chain / Cool Down**, both chains crew-ordered.
- **Momentum & Power pools** → *removed.* The "fuel" is Chain Length. The sheet
  shrinks to Hull / Shields / Tier (+ optional Heat).
- **Turn order** → from "each officer acts once in any order" to an explicit,
  Commander-led **chain with hand-offs and a scaling Finisher.**
- **Reactions** → no longer a separate paid resource; the **Brace Chain** is the
  defensive counterpart of the Strike Chain, with its own Link/Finish abilities.
- **Role abilities** → re-authored as the Link/Finish matrix in §6.
- **Variable crew size** → first-class: chain length and Finisher scaling absorb
  3–6 player tables.
- **Ship-building** → still a future layer (separate doc) feeding weapons/systems
  and a power budget into these rules.

Once this draft plays well on paper, the app gets rebuilt to match.
