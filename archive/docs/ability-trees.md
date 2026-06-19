# Veilborn Ability Trees — Module Skill Trees (draft)

> Companion to `ship-combat.md` and `ship-building.md`. Each module is a **5-tier
> skill tree** (T5 = Legendary). **Tier 1** hands the officer a foundation; **every
> level-up** grants the **Standard** unlock(s) automatically **plus a Choice** of
> one of two branch abilities. A role's roll bonus = **Crew Tier + Module Tier +
> chain** (`ship-building.md` §3).
>
> **Two structures.** The **Commander always opens the chain**, so his abilities
> are **Commands** (he never finishes). **Every other role** has **Line moves**
> (played mid-chain to set up an ally) and **Finisher moves** (the payoff, if they
> go last). A small *(Action)* / *(Reaction)* tag shows which chain a move suits —
> the crew runs one or the other each turn, so you play the move that fits.
>
> **Shared mechanics used below**
> - **Advantage / Disadvantage** — roll **2d20**, keep higher / lower; one step
>   only, and one of each cancels.
> - **Damage Reduction (DR)** — flat **−X** to incoming damage for the round;
>   sources **stack**.
> - **Disable a system** — the target station/module goes offline until repaired
>   (the *Disabled* condition).
> - **Extra damage dice** come only from specific abilities, never auto per-link.
> - **Power costs** — a **(⚡N)** tag spends **N Power** from the ship's **shared
>   Reactor pool** (any officer's costed ability draws it, so the Engineer keeps it
>   fed for everyone). Unmarked abilities are free.
> - **No 1/battle abilities** — the powerful plays are gated by **Power cost**, not a
>   once-per-fight limit: spend big, then run lean. The Commander's *basic* Commands
>   are free; his *powerful* ones cost Power like anyone's.
>
> **Where damage comes from.** The chain wins through *teamwork* — **not every seat
> deals damage.** The **Gunner** is the firepower; the **Engineer's Lance** cracks
> shields; the **Navigator** can **ram** (mass, not guns). The **Commander** and
> **Sensor** deal little to none — they *enable* the kill (orders, targeting, EW)
> and shield the ship. A Finisher need not be an attack: it can be a jam, a repair,
> an escape, or a disable.
>
> Status: **Commander, Navigator & Engineer — confirmed.** Sensor — *proposed,
> awaiting sign-off.* Gunner to follow.

---

## Commander — Bridge *(the Conductor)*

**Role.** Gives the final orders and keeps track of all stations — monitors the
battlefield from the bridge and deploys tactics for the crew to execute.

**Core mechanics.**
- After the crew debates the chain, **the Commander makes the final call** on its
  order, then **opens** it with a **Command**. He never finishes and deals no damage
  of his own — he shapes the crew's.
- **Sync (kept):** +1 per successful chain; a failed Finisher resets it. At **3** →
  an **Epic Command** next turn, which lets **all crew use finishers on the same
  turn.**

**Commands — three types.** Every chain, the Commander opens with **one Command of
his choice** from three types:
- **Boost** *(morale)* — buff the crew.
- **Trash Talk** *(psy-ops)* — debuff the enemy.
- **War Cry** *(rally)* — add damage to the crew's strike.

He gains **one new Command of each type every Tier** (they add, never replace). Like
every officer he **also has a two-branch skill tree** — *Tactician* (control &
tempo) or *Warlord* (aggression & momentum) — choosing one branch ability per Tier.
In the moment, he also picks *which Command the turn needs* (War Cry helps only on
an Action chain; Boost and Trash Talk fit either).

### Tier 1
- **Boost · Inspire** — the next officer acts with **advantage**.
- **Trash Talk · Taunt** — the enemy's attack this turn is at **−2 to hit**.
- **War Cry · Charge** — the crew's finisher this turn deals **+1d6**.

### Tier 2
- **Boost · Hold Fast** — the ship gains **+2 AC** this turn.
- **Trash Talk · Psych Out** — the enemy gains **no chain bonuses** this turn.
- **War Cry · Press** — the finisher deals **+1d8**.
- **Choice** ▸ ◯ **Cold Read** *(Tactician)* — once this turn the crew may **re-roll
  one missed attack**. / ◯ **Bloodlust** *(Warlord)* — the crew's finisher this turn
  **crits on 19–20**.

### Tier 3
- **Boost · Rally** — the ship gains **+2 DR** and restores **1d6 shields**.
- **Trash Talk · Rattle** — the enemy's attack is at **disadvantage** this turn.
- **War Cry · Onslaught** — the finisher deals **+1d10**. **(⚡2)**
- **Choice** ▸ ◯ **Tactical Foresight** *(Tactician)* — **+3 to the crew's next
  Initiative roll**. / ◯ **Press the Advantage** *(Warlord)* — **⚡2**: when the crew
  lands a finisher this turn, grant one officer a **free extra Link**.

### Tier 4
- **Boost · Coordinate** — **two** officers act with **advantage** this turn. **(⚡2)**
- **Trash Talk · Demoralize** — the enemy is **−4 to hit** and gains **no chain
  bonuses**. **(⚡2)**
- **War Cry · Devastate** — the finisher deals **+2d10**. **(⚡3)**
- **Choice** ▸ ◯ **Grand Strategist** *(Tactician)* — **⚡4: override Initiative** —
  choose to Act or React this turn regardless of the roll. / ◯ **Battle Fury**
  *(Warlord)* — your **War Cry** Commands add **+1 die** (Charge → +2d6, and so on).

### Tier 5
- **Boost · Perfect Order** — the **whole crew** acts at **advantage** this turn. **(⚡4)**
- **Trash Talk · Break Them** — the enemy's attack is at **disadvantage**, **−4 to
  hit**, and deals **−1d10**. **(⚡4)**
- **War Cry · Unleash** — the finisher deals **+3d10**. **(⚡5)**
- **Choice** ▸ ◯ **Fleet Admiral ★** *(Tactician)* — the crew banks an **Epic Command
  at Sync 2** (not 3), and the Epic turn grants the **whole crew advantage**. / ◯
  **Unbroken ★** *(Warlord)* — **⚡5: Decisive Order** — one officer may **act twice**
  in the chain this turn.

> **The two branches.** *Tactician* (Cold Read → Tactical Foresight → Grand
> Strategist → Fleet Admiral) is control and tempo; *Warlord* (Bloodlust → Press the
> Advantage → Battle Fury → Unbroken) is aggression and momentum. And every turn he
> opens with the Command the moment needs — **Boost**, **Trash Talk**, or **War
> Cry** — never dealing damage himself; his climax is the **Epic Command** from Sync.

---

## Navigator — Engine (Veil Drive)

**Role.** Flies the ship — position, range, initiative, and the **Veil Drive**. The
guns are the *Gunner's*; the Navigator's job is to **put the crew in the perfect
spot to use them**, control *who Acts and who Reacts* (Speed), and keep the ship
alive and able to run. It rarely deals damage directly — its only offense is
**ramming** (mass, not weapons), and above all **setting up the kill**.

**Structure.** Line moves (set up an ally / reposition) + Finisher moves (maneuver,
escape, or a ramming pass), *(Action)* / *(Reaction)* tagged.

### Tier 1 · Foundation *(start with all four)*
**Line moves**
- **Attack Vector** *(Action)* — line up the angle: the next officer gains **+2 to
  hit**.
- **Evasive Maneuvers** *(Reaction)* — jink hard: the ship gains **+2 AC** this round.

**Finisher moves**
- **Ramming Speed** *(Action)* — throw the hull itself at them: **2d6 collision**
  (ignores shields — it's mass, not fire); the ship takes **1d6** back. The pilot's
  risky offense, no weapons needed.
- **Break Contact** *(Reaction)* — disengage to a safer band: the enemy's attack
  this turn is at **disadvantage**.

### Tier 2
**Standard**
- *Line* · **Slip Step** *(either)* — the Veil Drive flickers: **+5 to the crew's
  next Initiative roll**. **(⚡2)**
- *Finisher* · **Veil Jump** *(Reaction)* — slip the Veil and break off: **disengage
  entirely** (escape a fight you can't win), or reset to Long range and re-roll
  Initiative. **(half Max Power)** The crew's escape hatch.

**Choice**
- ◯ **Throttle Up** *(Ace line)* — your **Attack Vector** also grants the next
  attacker **+1d6 damage** (you set up a harder hit).
- ◯ **Evasive Pattern** *(Dogfighter line)* — Evasive Maneuvers also grants **+1 DR**.

### Tier 3
**Standard**
- *Line* · **Power Dive** *(Action)* — commit to the run: the next attacker gains
  **advantage**; the ship takes **−1 AC** this round.
- *Finisher* · **Crash Dive** *(Reaction)* — hard burn: the enemy's attack this turn
  deals **half damage**; reposition a band.

**Choice**
- ◯ **Flyby** *(Ace)* — Ramming Speed deals **+1d6** and you take **no** return
  damage.
- ◯ **Untouchable** *(Dogfighter)* — buffs **Break Contact**: also **−2 enemy
  damage** and **+2 AC until your next turn**.

### Tier 4
**Standard**
- *Line* · **Flank** *(Action)* — slip to the blind side: the chain's finisher this
  turn **ignores the target's evasion/cover** and treats its **AC as 2 lower**.
- *Finisher* · **Veil Static** *(Reaction)* — wreathe the ship in Veil-static: the
  enemy's attack this turn is at **−3 to hit** and deals **−1d6** if it lands. **(⚡2)**

**Choice**
- ◯ **Ace Pilot** *(Ace)* — passive: while the crew is Acting, the chain's finisher
  always **ignores range and the target's cover**.
- ◯ **Master Dogfighter** *(Dogfighter)* — when the crew *loses* Initiative,
  **steal it** (the crew Acts instead this turn). **(⚡3)**

### Tier 5 · Legendary ★
**Standard**
- *Line* · **Phase Shift** — phase part-way into the Veil: the next officer's attack
  **ignores the enemy's entire Reaction** (no AC bonus, DR, evasion, or intercept
  applies). **(⚡4)**
- *Finisher* · **Lightspeed Pass** *(Action)* — a Veil-accelerated ramming run that
  **auto-hits for 4d6 collision** (ignores shields). The pilot's signature — still
  mass, not guns. **(⚡4)**

**Choice**
- ◯ **Slipstream ★** *(Ace)* — **⚡4**: seize the moment — the crew **takes the
  Initiative next turn automatically** and **Acts at advantage** that turn (tempo,
  not damage).
- ◯ **Veil Phantom ★** *(Dogfighter)* — **⚡5**: phase into the Veil — for a full turn
  the enemy attacks the ship at **disadvantage** and deals it **half damage** (all
  but untouchable).

> **The two branch lines.** *Ace Pilot* (Throttle Up → Flyby → Ace Pilot →
> Slipstream) is aggressive piloting that sets up the kill (and the occasional
> ram); *Master Dogfighter* (Evasive Pattern → Untouchable → Master Dogfighter →
> Veil Phantom) is evasion and tempo control. **The Navigator's damage is only ever
> ramming — the weapons stay with the Gunner.**

---

## Engineer — Reactor (Aether Core)

**Role.** Tends the bound-aether core: powers the ship, channels surplus into
weapons or shields, patches battle damage, and can dump the core into a
shield-cracking **Lance**. The Reactor's Tier sets **Max Power, Power regen, and
Max Shields** — and the Lance abilities here are how AP/Breach enters a chain.

**Structure.** Line moves + Finisher moves, *(Action)* / *(Reaction)* tagged.
Engineer abilities **spend Power** from the Reactor pool (the regenerating combat
resource — see `ship-building.md` *Resources*); costs are noted where set, others
tuned in play. *Heat* is the optional push-your-luck track (overcharging builds it;
too much falters a system).

### Tier 1 · Foundation *(start with all four)*
**Line moves**
- **Overcharge** *(Action)* — route surplus power: the next officer's attack adds
  **+1d6** damage. **(⚡2)**
- **Reroute** *(Reaction)* — reallocate the core: **spend Power to restore Shields
  1-for-1** (up to Max Shields). The Engineer's basic Power→Shields conversion.

**Finisher moves**
- **Reactor Lance** *(Action)* — dump the core into a shield-cracking lance: an
  attack rolling **2d8 that ignores shields/armour** and **disables a system** on
  hit. **(⚡3)** *(This is the Lance.)*
- **Damage Control** *(Reaction)* — emergency repair: restore **2d6**, split as you
  like between **Hull and Shields**. **(⚡2)**

### Tier 2
**Standard**
- *Line* · **Channel the Core** *(either)* — overdraw the reactor to **generate
  +1d4 Power** now, to fund a big play this turn (the Engineer's active income).
- *Finisher* · **Vent Plasma** *(Reaction)* — vent the core defensively: **+2 DR**
  this round, and any enemy at Close takes **1d6**. **(⚡2)**

**Choice**
- ◯ **Reactor Tap** *(Overclocker)* — Overcharge gives **+1d6 more** (2d6 total).
- ◯ **Field Mechanic** *(Custodian)* — your Power→Shields conversion becomes
  **2-for-1**, and Reroute may restore **Hull** instead of Shields.

### Tier 3
**Standard**
- *Line* · **Overload Coils** *(Action)* — supercharge weapons: the next finisher
  adds **+1d10**, but the ship takes **1 Heat** (−1 to its next defensive roll). **(⚡3)**
- *Finisher* · **Damage Control Bay** *(Reaction)* — major repair: restore **2d8**
  Hull or Shields. **(⚡3)**

**Choice**
- ◯ **Meltdown Protocol** *(Overclocker)* — Reactor Lance also deals **+1d8** and
  applies **Breach**.
- ◯ **Reinforced Core** *(Custodian)* — passive: the ship gains **+1 DR** and
  **Power regen +1**.

### Tier 4
**Standard**
- *Line* · **Aether Conduit** *(either)* — perfect flow: the next move adds **+1d8**
  damage *or* the ship gains **+3 shields**. **(⚡2)**
- *Finisher* · **Singularity Lance** *(Action)* — the Lance evolves: **3d8** ignore
  shields/armour, **disable a system**, and on a crit **Cripple** it (knocked out
  until repaired). **(⚡5)**

**Choice**
- ◯ **Overclocker** *(Overclocker)* — **⚡4**: **double the dice** of one ability you
  fuel this turn.
- ◯ **Guardian Core** *(Custodian)* — **⚡3**: grant the ship **+4 DR** for a turn.

### Tier 5 · Legendary ★
**Standard**
- *Line* · **Veil Capacitor** *(either)* — **⚡3**: store the Veil — the next finisher
  **can't roll below half its max** *or* **fully recharge Shields**.
- *Finisher* · **Singularity Vent** *(Reaction)* — **⚡5**: vent the core — **fully
  restore Shields** and **clear all conditions** on the ship.

**Choice**
- ◯ **Reactor Overlord ★** *(Overclocker)* — **⚡5 Overdrive**: every ability you fuel
  this turn adds **+1d10**, but the ship takes **2 Heat**.
- ◯ **Aegis Eternal ★** *(Custodian)* — **⚡5**: the last-stand aegis — the ship takes
  **half damage** and gains **+3 DR** for a full turn.

> **The two branch lines.** *Overclocker* (Reactor Tap → Meltdown Protocol →
> Overclocker → Reactor Overlord) pushes the core for raw power and the Lance;
> *Custodian* (Field Mechanic → Reinforced Core → Guardian Core → Aegis Eternal) is
> shields, repair, and protection.

---

## Sensor Officer — Optics *(proposed)*

**Role.** The crew's eyes and electronic-warfare suite. It **doesn't kill — it makes
the crew's kill certain and blinds the enemy's.** Two core lines do the work and you
**specialise** them: **Lock On** (targeting assist) and **Blur** (jamming defence).
Every tier also adds two **powerful hacks** — one Action, one Reaction.

**The two directions.** Each level-up you pick a flat bonus to **Lock On** *or* to
**Blur**. Stack one side and you commit to it; weave for balance. **No 1/battle
gimmicks** — the strong hacks are gated by **Power**.

**Core lines** *(you always have both; your picks deepen them)*
- **Lock On** *(Action)* — designate the target as **Locked On**: the chain treats
  its **AC as 2 lower**. The Sensor's signature.
- **Blur** *(Reaction)* — jam their optics: the enemy's attack this turn is at
  **−2 to hit**.

### Tier 1 · Foundation
**Hacks**
- *Action* · **Hack** — breach a system and **disable** it; the overload deals **1d6**.
- *Reaction* · **Ghost** — feed them a phantom: the enemy's attack is at **disadvantage**.

### Tier 2
**Hacks**
- *Action* · **Optics Burn** — fry their sensors: the enemy is **blinded** (−4 to hit,
  can't crit) for **1d4 rounds**. **(⚡2)**
- *Reaction* · **Scramble** — jam fire control: the enemy's attack gains **no chain
  bonuses** and is at **−2 to hit**. **(⚡1)**

**Choice**
- ◯ **Marksman** *(Lock On)* — the Locked On target takes **+1d6 damage** from the
  chain's attacks.
- ◯ **Static Field** *(Blur)* — Blur also grants the ship **+1 DR**.

### Tier 3
**Hacks**
- *Action* · **System Shock** — **disable two systems** (or disable one and
  **Cripple** it); deals **2d6**. **(⚡2)**
- *Reaction* · **Feedback Loop** — turn their targeting on themselves: the enemy's
  attack is at **disadvantage**, and if it misses the enemy **takes 2d6**. **(⚡2)**

**Choice**
- ◯ **Predator** *(Lock On)* — the chain **crits on 19–20** against the Locked On
  target, and it takes **+1d6** more.
- ◯ **Ghostwalker** *(Blur)* — the ship gains a **passive +2 AC**.

### Tier 4
**Hacks**
- *Action* · **Meltdown** — **Cripple a system** and deal **3d6**; the enemy is **−2
  to hit** until its next turn. **(⚡3)**
- *Reaction* · **Blackout** — total jam: the enemy's attack is at **disadvantage and
  half damage** and **can't Breach or disable**. **(⚡3)**

**Choice**
- ◯ **Hunter** *(Lock On)* — crit range vs the Locked On target widens to **18–20**
  (stacks with Predator) and it takes **+1d6** more.
- ◯ **Deep Static** *(Blur)* — Blur is **−3 to hit** and also grants **+2 DR**.

### Tier 5
**Hacks**
- *Action* · **Total Hack** — seize their network: **disable every enemy system** for
  a turn; deals **3d6**. **(⚡4)**
- *Reaction* · **Null Field** — the enemy's attack is at **disadvantage, half damage,
  and −1d10**; you may also **clear one condition** on the ship. **(⚡4)**

**Choice**
- ◯ **Apex Predator** *(Lock On)* — crit range vs the Locked On target widens to
  **17–20**, and it takes **+2d6** total.
- ◯ **Veilshroud** *(Blur)* — Blur also imposes **disadvantage** on the enemy's
  attack and grants **+3 DR**.

> **Two directions.** Pick **Lock On** every tier and your locks turn the Gunner
> into a crit-machine (19–20 → 18–20 → 17–20, +damage); pick **Blur** every tier and
> the ship becomes nearly unhittable (−hit, DR, AC, disadvantage). The hacks are
> shared either way. **The Sensor never deals real damage — it makes the crew's
> land and the enemy's miss.**

---

*Next module to spec: Gunner (Weaponry).*
