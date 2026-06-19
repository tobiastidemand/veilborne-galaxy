export type ChainLevel =
  | "ADMINISTRATIVE HQ"
  | "DOMINANT"
  | "ACTIVE"
  | "COVERT"
  | "LIMITED"
  | "CLASSIFIED"
  | "UNKNOWN"
  | "MINIMAL";

export type Threat = "LOW" | "MODERATE" | "HIGH";

export type StarKind = "star" | "blackhole" | "pulsar" | "binary" | "arcane";

/**
 * Visual archetype for a celestial body. Most are natural worlds (`planet`);
 * the rest are artificial or exotic and get their own 3D models.
 */
export type BodyKind =
  | "planet"
  | "station"
  | "derelict"
  | "fragment"
  | "mirror"
  | "anomaly";

/** Breathability classification for a body's air, surfaced in the survey panel. */
export type AtmosphereStatus = "breathable" | "marginal" | "hostile" | "none";

export interface Atmosphere {
  status: AtmosphereStatus;
  detail: string;
}

export interface Location {
  name: string;
  note?: string;
  /** Dossier blurb shown when the location is opened from the body panel. */
  description?: string;
}

export interface CelestialBody {
  name: string;
  description: string;
  color: string;
  highlight?: boolean;
  kind?: BodyKind;
  /** Air quality / breathability, shown in the planet survey panel. */
  atmosphere?: Atmosphere;
  /** Known (public) faction presence on this body — present factions only. */
  factions?: SystemFaction[];
  /** Discovered native species, if any. Undefined shows as "None discovered". */
  homeSpecies?: string;
  /** Population note; shown only when present. */
  population?: string;
  /** Notable locations on this body, listed under Population. */
  locations?: Location[];
  /** True for generated "uncharted" bodies that pad a system to its stated counts. */
  synthetic?: boolean;
}

/** Known (public) faction presence in a system, for the survey panel. */
export type FactionPresence = "full" | "some" | "none";

export interface SystemFaction {
  name: string;
  presence: FactionPresence;
  note?: string;
}

export interface StarSystemData {
  id: string;
  name: string;
  designation: string;
  starType: string;
  kind: StarKind;
  color: string;
  size: number;
  position: [number, number, number];
  planets: number;
  anomalies: number;
  distance: string;
  chain: { level: ChainLevel; detail: string };
  /** Known (public) faction presence, shown in the survey panel. Hidden factions are never listed. */
  factions?: SystemFaction[];
  threat: Threat;
  bodies: CelestialBody[];
  lore: string;
}

export const CHAIN_MARKER: Record<
  ChainLevel,
  { color: string; opacity: number } | null
> = {
  "ADMINISTRATIVE HQ": { color: "#f0d080", opacity: 1 },
  DOMINANT: { color: "#f0d080", opacity: 0.8 },
  ACTIVE: { color: "#7fff9f", opacity: 0.65 },
  COVERT: { color: "#ff9f40", opacity: 0.55 },
  LIMITED: { color: "#ff9f40", opacity: 0.55 },
  CLASSIFIED: { color: "#e84daa", opacity: 0.65 },
  UNKNOWN: { color: "#ffffff", opacity: 0.35 },
  MINIMAL: null,
};

export const THREAT_STYLE: Record<Threat, { color: string; bg: string }> = {
  LOW: { color: "#7fff9f", bg: "rgba(127,255,159,0.12)" },
  MODERATE: { color: "#ff9f40", bg: "rgba(255,159,64,0.12)" },
  HIGH: { color: "#e84daa", bg: "rgba(232,77,170,0.12)" },
};

export const PRESENCE_STYLE: Record<
  FactionPresence,
  { color: string; label: string }
> = {
  full: { color: "#5fd38a", label: "Full presence" },
  some: { color: "#e0b84a", label: "Some presence" },
  none: { color: "#e0644a", label: "No presence" },
};

function chainLevelToPresence(level: ChainLevel): FactionPresence {
  if (level === "ADMINISTRATIVE HQ" || level === "DOMINANT") return "full";
  if (level === "ACTIVE" || level === "COVERT" || level === "LIMITED")
    return "some";
  return "none";
}

/**
 * Public faction presence for a system: the explicit authored list if present,
 * else a Chain-only fallback derived from the legacy `chain` field.
 */
export function systemFactions(s: StarSystemData): SystemFaction[] {
  if (s.factions) return s.factions;
  return [
    {
      name: "Aureate Chain",
      presence: chainLevelToPresence(s.chain.level),
      note: s.chain.detail,
    },
  ];
}

export const SYSTEMS: StarSystemData[] = [
  {
    id: "solara-prime",
    name: "Solara Prime",
    designation: "VB-001 · CORE SYSTEM",
    starType: "Main Sequence G-type",
    kind: "star",
    color: "#f0d080",
    size: 1.6,
    position: [0, 0, 0],
    planets: 4,
    anomalies: 3,
    distance: "0.0 ly (Core)",
    chain: {
      level: "ADMINISTRATIVE HQ",
      detail:
        "Administrative HQ: the City of Pearls (Caelum), under Chain-Lord Lotus Silverblood. The Chain works every world here — Aethon's mines, Glacius's water, Verdania's drug-licensing.",
    },
    factions: [
      {
        name: "Aureate Chain",
        presence: "full",
        note: "Administrative HQ — the City of Pearls.",
      },
      {
        name: "The Ayvenni",
        presence: "full",
        note: "Sovereign of Caelum's drifting sky-cities.",
      },
      {
        name: "Gnomlin Cartels",
        presence: "some",
        note: "Hold Verdania and the Klonga trade.",
      },
      {
        name: "Arcane Survey",
        presence: "full",
        note: "The great library-station, the Cartographer; Shimmerview University.",
      },
      {
        name: "Faith of the Stargiver",
        presence: "some",
        note: "The rising Aureate Collective, at the Star Garden.",
      },
      { name: "Ascendant Throne", presence: "none" },
    ],
    threat: "LOW",
    bodies: [
      {
        name: "Aethon",
        factions: [{ name: "Aureate Chain", presence: "full" }],
        population: "Chain work-camps — debt-labour and convicts (the Wasteland).",
        locations: [
          {
            name: "The Wasteland",
            note: "Chain work-camp / prison",
            description:
              "The Chain's great work-camp on Aethon, a prison in all but name — where you go when you can't pay the Chain back and still want to live. Debt-labour and convicts work the magma mines for silver, gold, and obsidian, holding off the fire elementals with hydro-blasters.",
          },
        ],
        description:
          "Scorched volcanic inner world of magma rivers, rich in silver, gold, and obsidian. A Chain company-world run on debt-labour and the indentured, centred on the 'Wasteland' work-camp; fire elementals haunt the deep mines, held off with hydro-blasters.",
        color: "#ff7744",
        atmosphere: {
          status: "hostile",
          detail:
            "Choked with soot and carbon dioxide — rebreathers are mandatory.",
        },
      },
      {
        name: "Verdania",
        factions: [
          { name: "Gnomlin Cartels", presence: "full" },
          { name: "Aureate Chain", presence: "some" },
          { name: "Arcane Survey", presence: "some" },
        ],
        homeSpecies: "The Gnomlins",
        population: "Scattered Gnomlin jungle-enclaves; transient harvesters.",
        locations: [
          {
            name: "Klonga Landing",
            note: "the cartels' river-port",
            description:
              "The one enclave the Gnomlin cartels keep open to outsiders — a seething river-market where the galaxy's drug money changes hands. It greets every ship that enters the system with the same eternal, misspelled hail: \"WE SELL KONGA.\"",
          },
        ],
        description:
          "The one living world: a lethal rainforest-and-marsh of oversized horrors and the ancient apex 'the Old Quiet' — and the galaxy's botanical treasury, source of the drug Klonga. Run by the Gnomlin cartels, and dotted with ancient Keth'aal ruins.",
        color: "#66cc66",
        atmosphere: {
          status: "marginal",
          detail:
            "The air breathes fine; the spores, toxins, and horrors do not — every breath is a gamble.",
        },
      },
      {
        name: "Caelum",
        factions: [
          { name: "Aureate Chain", presence: "full" },
          { name: "The Ayvenni", presence: "full" },
        ],
        homeSpecies: "The Ayvenni",
        population: "~12 million in the City of Pearls, plus the Ayvenni sky-cities.",
        locations: [
          {
            name: "The City of Pearls",
            note: "the Chain's floating capital",
            description:
              "The largest sky-city the Ayvenni ever raised, and the Aureate Chain's administrative seat — a fixed beacon of iridescent void-glass towers adrift in Caelum's amber storms. Twelve million live across its districts, from the Spires to the Underdocks, and Chain-Lord Lotus Silverblood rules it all. The gilded heart of the galaxy.",
          },
        ],
        description:
          "Not a gas giant but a cloud-world: endless amber storms over a Veil-touched core that breathes 'veil gas' (crystallised into all void-glass). Home of the Ayvenni cloudwalkers — and of the City of Pearls, the Chain's floating capital under Chain-Lord Lotus Silverblood.",
        color: "#f0d080",
        highlight: true,
        atmosphere: {
          status: "marginal",
          detail:
            "Its shimmering veil gas is, strangely, harmless to breathe — but endless storms and a bottomless fall make Caelum no place to go unsheltered.",
        },
      },
      {
        name: "Motel Prime",
        population: "One family and the travellers passing through.",
        description:
          "A small, family-run waystation in the middle of the system — a fuel stop, motel rooms with a real space view, and a bar-bistro where travellers from every world rest between Skips. Run with great heart and greater eccentricity by one man, his wife, and their two kids.",
        color: "#ffb347",
        kind: "station",
        atmosphere: {
          status: "breathable",
          detail:
            "A cosy, lived-in station habitat: warm air, good food, and a view of the void.",
        },
      },
      {
        name: "Glacius",
        factions: [{ name: "Aureate Chain", presence: "full" }],
        population:
          "Chain water-works and the Cold Lock prison; scattered ice-fishing camps.",
        locations: [
          {
            name: "The Cold Lock",
            note: "Chain prison-camp",
            description:
              "The Chain's prison-camp at the Glacius water-works, whose inmates work the pumps and lines in killing cold — Aethon's icy mirror, and a slow death sentence in all but name. Many run; the escapees scatter into the ice-fishing camps out on the floes.",
          },
        ],
        description:
          "A frozen, breathable world: a dead surface of Chain water-works and fisheries, the 'Cold Lock' prison, and escapee ice-fishing camps, stalked by the ice-shark Rimemaw. Its pipelines suffer endless, baffling sabotage from the deep — and older things may stir beneath the ice.",
        color: "#aaddff",
        atmosphere: {
          status: "marginal",
          detail:
            "Breathable air, but lethal cold — exposed flesh freezes fast and the storms kill.",
        },
      },
      {
        name: "The Star Garden",
        factions: [{ name: "Faith of the Stargiver", presence: "some" }],
        population: "The Aureate Collective — a small but growing congregation.",
        description:
          "A vast, self-sufficient living space station — hydroponics, meat-vats, recycled water — and home of the Aureate Collective, a rising missionary sect that welcomes all strays into its fold.",
        color: "#c9b86a",
        kind: "station",
        atmosphere: {
          status: "breathable",
          detail:
            "A sealed, self-sufficient habitat: clean grown air, warm and lived-in.",
        },
      },
      {
        name: "The Cartographer",
        factions: [{ name: "Arcane Survey", presence: "full" }],
        population: "Survey scholars, archivists, and visiting crews.",
        description:
          "The Arcane Survey's great library and cartographic station, adrift in the gilded core — the Great Chart, relic-research labs, and Tier-locked vaults. Chain-funded; the order's older founding HQ sits on Sanctaris, in Twin Embers.",
        color: "#aa8855",
        kind: "station",
        atmosphere: {
          status: "breathable",
          detail:
            "A sealed station habitat: clean, controlled, standard air held against the void.",
        },
      },
    ],
    lore: "The gilded core: VB-001, the system every chart is measured from, and the throne of the Aureate Chain. The City of Pearls floats in Caelum's amber storms — void-glass towers catching the yellow sun — while Aethon burns, Verdania devours, and Glacius freezes around it. The civilised heart of the galaxy, and the place that quietly sets the price of reaching it.",
  },
  {
    id: "crimson-maw",
    name: "Crimson Maw",
    designation: "VB-002 · RED GIANT SYSTEM",
    starType: "Red Giant M-type, aging",
    kind: "star",
    color: "#ff4444",
    size: 2.4,
    position: [-24, 7, -12],
    planets: 3,
    anomalies: 3,
    distance: "2.4 ly",
    chain: { level: "MINIMAL", detail: "Hostile conditions." },
    threat: "HIGH",
    bodies: [
      {
        name: "Ashveil",
        description:
          "Half-consumed by dying star; rivers of magma; fire-cult zealots.",
        color: "#ff6644",
      },
      {
        name: "The Wound",
        description:
          "Tear in space-time; ships that approach do not always return — or return changed.",
        color: "#cc44ff",
        kind: "anomaly",
      },
      {
        name: "Char Moons I–IV",
        description:
          "Four charred moons in decaying orbits; ruins of evacuated civilization.",
        color: "#775555",
      },
    ],
    lore: "The star is dying — and it knows. Astronomers give it three hundred years before it collapses. The creatures that live here worship the death, calling it the Great Returning. They are not welcoming to those who disagree.",
  },
  {
    id: "azuran-deep",
    name: "Azuran Deep",
    designation: "VB-003 · HYPERGIANT SYSTEM",
    starType: "Blue Hypergiant O-type",
    kind: "star",
    color: "#88ccff",
    size: 2.3,
    position: [21, 9, -14],
    planets: 4,
    anomalies: 2,
    distance: "3.1 ly",
    chain: { level: "ACTIVE", detail: "Trading post on Cobalt Station." },
    threat: "MODERATE",
    bodies: [
      {
        name: "Ionara",
        description:
          "Storm-wracked gas giant; pocket dimension in its eye discovered by the Arcane Survey.",
        color: "#88ccff",
      },
      {
        name: "Stillwater",
        description: "Ocean world 40 km deep; something sings at the bottom.",
        color: "#4488cc",
      },
      {
        name: "Cobalt Station",
        description:
          "Neutral trading port built into a captured asteroid; lawless and essential.",
        color: "#7799aa",
        kind: "station",
      },
      {
        name: "The Mirror",
        description:
          "Perfectly reflective sphere; not a planet; origins and nature completely unknown.",
        color: "#ddddee",
        kind: "mirror",
      },
    ],
    lore: "The blue giant bathes this system in intense ultraviolet radiation. Only the shielded and the mutated survive here unprotected. The Cobalt Station traders have adapted in... interesting ways.",
  },
  {
    id: "pale-cipher",
    name: "Pale Cipher",
    designation: "VB-004 · WHITE DWARF SYSTEM",
    starType: "White Dwarf DA-type, dense",
    kind: "star",
    color: "#ddddff",
    size: 0.7,
    position: [9, -3, 7],
    planets: 5,
    anomalies: 2,
    distance: "1.8 ly",
    chain: {
      level: "COVERT",
      detail:
        "Purchasing Ossuary hulks; undisclosed acquisitions agent on Luminos.",
    },
    threat: "MODERATE",
    bodies: [
      {
        name: "Ashen Relic",
        description:
          "Dead world of crystallized atmosphere; every crystal hums with arcane memory.",
        color: "#ccccdd",
      },
      {
        name: "Luminos",
        description:
          "Artificially lit world; the Luminos Accord meets here — a council of fallen empires.",
        color: "#ffeeaa",
      },
      {
        name: "Vex Minor",
        description:
          "Tiny but extremely dense moon; home to the Gravemind, a psionic collective.",
        color: "#aa88cc",
      },
      {
        name: "The Ossuary",
        description:
          "Graveyard of thousands of ancient starships frozen in silent orbit.",
        color: "#778899",
        kind: "derelict",
      },
    ],
    lore: "Once this star was a colossus. Now it whispers. The Pale Cipher system is considered safe by most standards — no warlords, no active threats. The danger here is subtler: things that were buried are starting to wake up.",
  },
  {
    id: "the-devourer",
    name: "The Devourer",
    designation: "VB-005 · BLACK HOLE SYSTEM",
    starType: "Stellar Black Hole remnant",
    kind: "blackhole",
    color: "#220022",
    size: 1.7,
    position: [-19, -7, 11],
    planets: 2,
    anomalies: 5,
    distance: "4.0 ly",
    chain: { level: "UNKNOWN", detail: "Courier dispatched, unconfirmed." },
    threat: "HIGH",
    bodies: [
      {
        name: "Event Fragment",
        description:
          "Fragment of destroyed planet in eternal decay orbit; time moves strangely here.",
        color: "#9944aa",
        kind: "fragment",
      },
      {
        name: "The Chorus",
        description:
          "Cloud of dark energy emitting thousands of voices all saying the same word.",
        color: "#e84daa",
        kind: "anomaly",
      },
    ],
    lore: "The navigation charts mark it in red and say only: DO NOT APPROACH UNSHIELDED. The Devourer eats light, eats ships, eats memory. Those who orbit too close return not knowing their own names. Whatever is at its center — the Arcane Survey refuses to speculate.",
  },
  {
    id: "the-great-lighthouse",
    name: "The Great Lighthouse",
    designation: "VB-006 · PULSAR SYSTEM",
    starType: "Millisecond Pulsar, exotic",
    kind: "pulsar",
    color: "#7fff9f",
    size: 1.1,
    position: [33, 1, 3],
    planets: 3,
    anomalies: 4,
    distance: "2.9 ly",
    chain: {
      level: "LIMITED",
      detail:
        "Strained relations with Rhythm theocracy; small relay on Dead Note (unofficial).",
    },
    threat: "MODERATE",
    bodies: [
      {
        name: "Rhythm",
        description:
          "Planet locked to pulsar's beat; entire civilization built around the pulse.",
        color: "#7fff9f",
      },
      {
        name: "Dead Note",
        description:
          "World shielded from pulsar beam by ancient arcane technology of unknown origin.",
        color: "#557755",
      },
      {
        name: "The Beacon",
        description:
          "Artificial construct orbiting the pulsar; still broadcasting; signal undecoded.",
        color: "#ccffcc",
        kind: "station",
      },
    ],
    lore: "Every 3.7 milliseconds, the Great Lighthouse sweeps its deadly beam across the system. The inhabitants of Rhythm have evolved around this — their biology, architecture, and religion all built to the pulse. They consider it sacred. They consider strangers who don't bow to it... impolite.",
  },
  {
    id: "twin-embers",
    name: "Twin Embers",
    designation: "VB-007 · BINARY SYSTEM",
    starType: "Two dim red ember-suns (binary)",
    kind: "binary",
    color: "#cf4a28",
    size: 1.6,
    position: [-3, -8, 15],
    planets: 5,
    anomalies: 0,
    distance: "2.1 ly",
    chain: {
      level: "ACTIVE",
      detail:
        "Commercial heartland — vast but slipping, as the Ascendant Throne draws the devout back to its own networks. Key sites: Twinreach Exchange · Twinreach Counting House · the Iron Ledger (Aureate Fleet base, unlisted).",
    },
    factions: [
      {
        name: "Ascendant Throne",
        presence: "full",
        note: "Sovereign of the heartland.",
      },
      {
        name: "Faith of the Stargiver",
        presence: "full",
        note: "Its holy see, at Ember's Rest.",
      },
      {
        name: "Arcane Survey",
        presence: "full",
        note: "Its founding HQ — the oldest in the order — stands on Sanctaris.",
      },
      {
        name: "Aureate Chain",
        presence: "some",
        note: "Vast but slipping, year by pious year.",
      },
    ],
    threat: "LOW",
    bodies: [
      {
        name: "Vanthis",
        factions: [
          { name: "Ascendant Throne", presence: "full" },
          { name: "Aureate Chain", presence: "some" },
        ],
        homeSpecies: "Humans (Vanthi)",
        population: "Hard-bitten mining towns and the capital, the Kiln.",
        locations: [
          {
            name: "The Kiln",
            note: "the dusty capital",
            description:
              "The dusty frontier capital of the desert ore-world, baking under the close embers at the heart of the Throne's mining operations — proud, aggrieved, and fed entirely from the Chain's ledger.",
          },
        ],
        description:
          "The system's one hot world, riding closest to the twin embers: a sun-scorched desert of ore-derricks and mining towns under its dusty capital, the Kiln. The Ascendant Throne digs and the Aureate Chain banks — and ships in the water — while the squeezed Vanthi work the gap between them.",
        color: "#ddaa66",
        atmosphere: {
          status: "marginal",
          detail:
            "Thin but breathable — and brutal: furnace-hot by day, scoured by dust and the bare UV of the close embers. Outside the towns, rebreathers and shade are wise.",
        },
      },
      {
        name: "Ember's Rest",
        factions: [
          { name: "Ascendant Throne", presence: "full" },
          { name: "Faith of the Stargiver", presence: "full" },
          { name: "Arcane Survey", presence: "some" },
        ],
        homeSpecies: "Humans (Sanctine) — humanity's cradle",
        population: "Most of the system; the cathedral-capital Sanctaris.",
        locations: [
          {
            name: "Sanctaris",
            note: "the cathedral-capital; the empty throne",
            description:
              "The cathedral-capital of the Ascendant Throne and the holy see of the Faith — seat of the First Light and the empty throne of the Ascended One. Its cathedral-foundries are the grandest in the galaxy, where work is worship and the fires never rest but on Ascension night.",
          },
          {
            name: "Arcane Survey HQ",
            note: "the order's founding seat",
            description:
              "The Arcane Survey's founding headquarters, standing in Sanctaris — the oldest and proudest seat in the whole order, raised before the Stargiver ever came, and the wellspring of knowledge he drew on to set off the Quickening. An old and proud institution; its great library-station, the Cartographer, now hangs in Solara Prime.",
          },
        ],
        description:
          "Humanity's one cradle and the holy capital. Home to Sanctaris, the cathedral-city — seat of the First Light and the empty throne of the Ascended One — where most of the system's people live and the grandest temple-foundries burn.",
        color: "#ffcc88",
        atmosphere: {
          status: "breathable",
          detail:
            "Humanity's native air: cool, dim, and low in UV — the one sky a Twin Embers human was made to breathe.",
        },
      },
      {
        name: "Twinreach",
        factions: [
          { name: "Aureate Chain", presence: "full" },
          { name: "Ascendant Throne", presence: "some" },
        ],
        homeSpecies: "Humans (Brasshaven) + a dozen alien peoples",
        population: "Brasshaven — the galaxy's busiest human crossroads.",
        locations: [
          {
            name: "Brasshaven",
            note: "the great neon port",
            description:
              "The galaxy's busiest human crossroads: a neon dock-megacity of a hundred tongues, free-wheeling and cosmopolitan, home to the Veilborn's largest black market. As the locals say: \"Brasshaven isn't the Ascendancy; Brasshaven is Brasshaven.\"",
          },
        ],
        description:
          "The system's great port and busiest dock — a Chain company-world on Throne soil. Its neon megacity Brasshaven is the galaxy's busiest human crossroads: cosmopolitan, free-wheeling, and home to the Veilborn's largest black market. The Ironbound's Aureate Fleet rides overhead — flagship the Debt Collector, based on the floating platform Iron Ledger, from which Chain-Lady Mirreth commands.",
        color: "#ffaa44",
        atmosphere: {
          status: "breathable",
          detail:
            "Breathable everywhere, dense and humid in the dock-sprawl; the lower levels hang thick with industrial smog.",
        },
      },
      {
        name: "King Casabian",
        factions: [{ name: "Ascendant Throne", presence: "some" }],
        population: "Throne gas-extraction platform crews.",
        description:
          "The system's largest world: a banded gas giant named for the last king to rule Ember's Rest before the Stargiver came. Its deep atmosphere is rich in hydrogen, helium, nitrogen and rarer gases, drawn off by Ascendant Throne platforms that hover in the upper clouds. No surface, no ground, no life.",
        color: "#b58f5e",
        atmosphere: {
          status: "hostile",
          detail:
            "A bottomless hydrogen–helium–nitrogen envelope with no surface — crushing pressure, killing cold, and toxic gases below the cloud-platforms. Survivable only inside a sealed rig.",
        },
      },
      {
        name: "Wellspring",
        factions: [{ name: "Aureate Chain", presence: "full" }],
        population: "Chain extraction-and-bottling crews.",
        description:
          "A frozen, lifeless outer world of ice and slush-seas — the system's water. The Aureate Chain works it on an industrial scale: vast extraction-and-bottling plants draw the ice, bottle it on-world, and ship Wellspring water across the galaxy.",
        color: "#a9c4d2",
        atmosphere: {
          status: "none",
          detail:
            "Frozen and all but airless — a breath of vapour over the ice. Lifeless; every lungful is supplied and sealed.",
        },
      },
    ],
    lore: "The beating heart of the modern galaxy: a binary of two dim red ember-suns, and humanity's one cradle — the most populous, productive, and devout system in the Veilborn. Here the Ascendant Throne keeps the empty chair of its martyred god, the Faith its holy see, the Aureate Chain its richest (and slowly slipping) market, and the Arcane Survey its founding HQ on Sanctaris. The galaxy's brightest civilisation, lit beneath its dimmest sky.",
  },
  {
    id: "voidmother",
    name: "The Voidmother",
    designation: "VB-008 · ANOMALY SYSTEM",
    starType: "Unknown/Arcane Origin",
    kind: "arcane",
    color: "#cc44ff",
    size: 1.1,
    position: [3, 8, -7],
    planets: 4,
    anomalies: 7,
    distance: "1.3 ly",
    chain: {
      level: "CLASSIFIED",
      detail: "Deep extraction operation (denied); location withheld.",
    },
    threat: "HIGH",
    bodies: [
      {
        name: "Hereafter",
        description:
          "Exists in two planes simultaneously; what you see and what is there are different things.",
        color: "#cc44ff",
        kind: "anomaly",
      },
      {
        name: "The Loom",
        description:
          "Ley-lines of raw magical energy woven between these coordinates; no physical form.",
        color: "#8866ff",
        kind: "anomaly",
      },
      {
        name: "Cradle of Ending",
        description:
          "A world where things go to die — and then, occasionally, come back changed.",
        color: "#aa4488",
      },
      {
        name: "Null",
        description:
          "Does not appear on most instruments; surveyors report feeling watched when they search for it.",
        color: "#443355",
        kind: "anomaly",
      },
    ],
    lore: "The Voidmother resists categorization. The star at its center emits no known spectrum of light, yet the worlds orbit happily. The Arcane Survey has classified it as a Level-7 Metaphysical Anomaly and strongly recommends leaving it alone. Adventurers, naturally, do not listen.",
  },
  {
    id: "the-sable-reach",
    name: "The Sable Reach",
    designation: "VB-009 · FRONTIER SYSTEM",
    starType: "Dim red dwarf, far out",
    kind: "star",
    color: "#a85a5a",
    size: 0.9,
    position: [5, 14, -12],
    planets: 2,
    anomalies: 1,
    distance: "9.4 ly",
    chain: {
      level: "MINIMAL",
      detail: "Beyond the Chain's reach.",
    },
    threat: "MODERATE",
    bodies: [
      {
        name: "Greythorne",
        description:
          "A cold, wind-scoured world on the galaxy's last shore — about the furthest place anyone has set boots.",
        color: "#5b6173",
      },
    ],
    lore: "Past the Voidmother the charts thin to rumour. The Sable Reach is one of the last lights the Arcane Survey has marked in the deep dark beyond her region — a dim red ember of a star, barely surveyed and barely reached. The frontier of the known galaxy.",
  },
  {
    id: "the-outer-dark",
    name: "The Outer Dark",
    designation: "VB-010 · UNCHARTED SYSTEM",
    starType: "Uncharted — deep void",
    kind: "arcane",
    color: "#6a5f88",
    size: 0.8,
    position: [9, 18, -16],
    planets: 1,
    anomalies: 2,
    distance: "13.1 ly",
    chain: {
      level: "UNKNOWN",
      detail: "Uncharted; no recorded approach.",
    },
    threat: "HIGH",
    bodies: [],
    lore: "The furthest point on any chart — the edge of the known galaxy, plotted from afar and never sailed to. Beyond the Voidmother, beyond the Survey's deepest reach, the Outer Dark is a faint smudge on the long-range scans and a question no expedition has yet answered.",
  },
];

export const JUMP_LANES: [string, string][] = [
  ["solara-prime", "twin-embers"],
  ["solara-prime", "pale-cipher"],
  ["solara-prime", "voidmother"],
  ["solara-prime", "azuran-deep"],
  ["voidmother", "azuran-deep"],
  ["voidmother", "crimson-maw"],
  ["pale-cipher", "the-devourer"],
  ["twin-embers", "pale-cipher"],
  ["azuran-deep", "the-great-lighthouse"],
  ["the-great-lighthouse", "pale-cipher"],
];

export const systemById = (id: string) =>
  SYSTEMS.find((s) => s.id === id)!;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const FILLER_WORLD_COLORS = ["#6b7a8c", "#7c6f63", "#5e7a6e", "#84766b", "#6a6a82"];
const FILLER_ANOMALY_COLORS = ["#9a5fb0", "#5f7fb0", "#7a5fa0", "#8a6f9a"];

// Built once per system; identities stay stable so panels don't thrash.
const bodyCache = new Map<string, CelestialBody[]>();

const isPlanet = (b: CelestialBody) => (b.kind ?? "planet") === "planet";

/**
 * The full body list for a system: the named, notable bodies plus generated
 * "uncharted" filler so the count of planets and anomalies on screen matches
 * the system's stated `planets` / `anomalies` figures. Named non-planet bodies
 * (stations, derelicts, the black-hole fragments, etc.) count as anomalies.
 */
export function getSystemBodies(system: StarSystemData): CelestialBody[] {
  const cached = bodyCache.get(system.id);
  if (cached) return cached;

  const named = system.bodies;
  const namedPlanets = named.filter(isPlanet).length;
  const namedAnomalies = named.length - namedPlanets;
  const fillerPlanets = Math.max(0, system.planets - namedPlanets);
  const fillerAnomalies = Math.max(0, system.anomalies - namedAnomalies);

  const extra: CelestialBody[] = [];
  for (let i = 0; i < fillerPlanets; i++) {
    extra.push({
      name: `Uncharted World ${ROMAN[i] ?? i + 1}`,
      description:
        "Detected on long-range scans; no detailed survey on record.",
      color: FILLER_WORLD_COLORS[i % FILLER_WORLD_COLORS.length],
      kind: "planet",
      synthetic: true,
    });
  }
  for (let i = 0; i < fillerAnomalies; i++) {
    extra.push({
      name: `Unmapped Anomaly ${ROMAN[i] ?? i + 1}`,
      description:
        "Anomalous readings; classification pending Arcane Survey review.",
      color: FILLER_ANOMALY_COLORS[i % FILLER_ANOMALY_COLORS.length],
      kind: "anomaly",
      synthetic: true,
    });
  }

  const result = [...named, ...extra];
  bodyCache.set(system.id, result);
  return result;
}
