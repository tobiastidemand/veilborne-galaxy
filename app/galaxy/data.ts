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

export interface CelestialBody {
  name: string;
  description: string;
  color: string;
  highlight?: boolean;
  kind?: BodyKind;
  /** True for generated "uncharted" bodies that pad a system to its stated counts. */
  synthetic?: boolean;
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
    planets: 6,
    anomalies: 1,
    distance: "0.0 ly (Core)",
    chain: {
      level: "ADMINISTRATIVE HQ",
      detail:
        "City of Pearls, Caelum, ruled by Chain-Lord Lotus Silverblood.",
    },
    threat: "LOW",
    bodies: [
      {
        name: "Aethon",
        description:
          "Scorched forge-world, Mithralite ore, fire elementals in deep mines.",
        color: "#ff7744",
      },
      {
        name: "Verdania",
        description:
          "Lush jungle moon, primitive civilization, ancient ruins pre-dating recorded history.",
        color: "#66cc66",
      },
      {
        name: "Caelum",
        description:
          "Gas giant with amber storms; City of Pearls floats in cloud bands — administrative seat of the Aureate Chain, ruled by Chain-Lord Lotus Silverblood; iridescent void-glass towers visible from orbit.",
        color: "#f0d080",
        highlight: true,
      },
      {
        name: "Glacius",
        description:
          "Frozen world; vast ocean beneath the ice and something very old.",
        color: "#aaddff",
      },
      {
        name: "The Cradle",
        description:
          "Abandoned space station of enormous size; hull markings in no known language.",
        color: "#999999",
        kind: "station",
      },
    ],
    lore: "The beating heart of the Veilborn — and the seat of the Aureate Chain's power. The City of Pearls drifts through Caelum's amber clouds, its void-glass spires catching the light of the yellow star like a lantern in the deep. Cartographers mark this system as the starting point of all expeditions. Every road in the Veilborn eventually leads back here, and to the Chain.",
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
    id: "lantern-pulse",
    name: "Lantern Pulse",
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
    lore: "Every 3.7 milliseconds, the Lantern Pulse sweeps its deadly beam across the system. The inhabitants of Rhythm have evolved around this — their biology, architecture, and religion all built to the pulse. They consider it sacred. They consider strangers who don't bow to it... impolite.",
  },
  {
    id: "twin-embers",
    name: "Twin Embers",
    designation: "VB-007 · BINARY SYSTEM",
    starType: "Binary G+K type pair",
    kind: "binary",
    color: "#ffaa44",
    size: 1.6,
    position: [-3, -8, 15],
    planets: 7,
    anomalies: 1,
    distance: "2.1 ly",
    chain: {
      level: "DOMINANT",
      detail:
        "Commercial heartland. Key sites: Twinreach Exchange · Ember's Rest Counting House · The Caul · Iron Ledger (military, classified).",
    },
    threat: "LOW",
    bodies: [
      {
        name: "Twinreach",
        description:
          "Perpetual twilight city between both suns; home to the Twinreach Exchange, the Chain's largest trading floor in the Veilborn; Iron Ledger military platform orbits silently above, unlisted on all navigation charts.",
        color: "#ffaa44",
      },
      {
        name: "Ember's Rest",
        description:
          "Most hospitable and populated world in the Veilborn; Chain's Counting House in the walled merchant quarter processing cargo manifests and crew contracts.",
        color: "#ffcc88",
      },
      {
        name: "Vanthis",
        description:
          "Desert world; the Vanthis Cartel controls the water; the Aureate Chain controls what arrives by ship; neither side discusses the arrangement openly.",
        color: "#ddaa66",
      },
      {
        name: "The Caul",
        description:
          "Unnamed on civilian charts; floating Chain station at the gravitational midpoint between the twin suns — for transactions that benefit from occurring beyond any planetary jurisdiction.",
        color: "#aa8855",
        kind: "station",
      },
    ],
    lore: "Twin Embers is the Aureate Chain's commercial heartland. Four trade hubs, a hidden military platform, and over sixty percent of all system commerce passing through Chain-registered intermediaries. Chain-Lady Mirreth commands it all from the Iron Ledger, high above Twinreach. It is the most 'civilized' corner of the Veilborn. That civilization has a price, and the Chain sets it.",
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
  ["azuran-deep", "lantern-pulse"],
  ["lantern-pulse", "pale-cipher"],
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
