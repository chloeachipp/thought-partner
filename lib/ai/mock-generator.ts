import {
  CREATIVE_VERTICALS,
  type CreativeVertical,
  type NodeContent,
  type PerspectiveType,
  type ThoughtGraphResponse,
  type SectionId,
  type CoreThesisContent,
  type NarrativesContent,
  type VisualWorldContent,
  type SpatialWorldContent,
  type SoundWorldContent,
  type ContentSystemContent,
  type ExecutionContent,
} from "@/types/thought";

// ── Creative fragment pools ───────────────────────────────────────────────────
// Organised by loose thematic territory. Used when no AI provider is configured.

type Fragment = [label: string, description: string];

type VerticalPool = Record<CreativeVertical, Fragment[]>;

const GENERIC_VERTICAL_POOLS: VerticalPool = {
  Culture: [
    ["rituals of belonging", "shared codes, quiet entry"],
    ["borrowed folklore", "memory passed hand to hand"],
    ["domestic myth", "the ordinary made sacred"],
    ["codes of closeness", "affection taught by habit"],
    ["collective residue", "what a scene leaves behind"],
    ["social weather", "how a room teaches behavior"],
  ],
  Visual: [
    ["soft layered tones", "colour held in haze"],
    ["faded edge light", "shapes dissolving at the rim"],
    ["scuffed gloss", "beauty marked by use"],
    ["blurred symmetry", "order slipping into feeling"],
    ["velvet contrast", "darkness with a pulse"],
    ["powdered neon", "glow softened by distance"],
  ],
  Sound: [
    ["shared nostalgia loops", "memory caught in repetition"],
    ["hiss in the walls", "static carrying the scene"],
    ["half-heard chorus", "voices blur into texture"],
    ["distant interior hum", "machines sounding like comfort"],
    ["breath before speech", "silence with intention"],
    ["tape-warp warmth", "time audible in the signal"],
  ],
  Space: [
    ["intimate dim environments", "closeness shaped by shadow"],
    ["threshold rooms", "spaces caught between states"],
    ["soft industrial corners", "tenderness inside hard materials"],
    ["low ceiling hush", "a room that lowers the voice"],
    ["open private distance", "solitude inside a crowd"],
    ["after-hours glow", "space held by residual light"],
  ],
  Digital: [
    ["visible invisible bonds", "connection hiding in systems"],
    ["ghosted interfaces", "presence lingering after contact"],
    ["soft surveillance", "care expressed as tracking"],
    ["glitch affection", "attachment breaking through noise"],
    ["latent archives", "emotion stored in fragments"],
    ["ambient feeds", "identity shaped by signals"],
  ],
  Emotion: [
    ["quiet loyalty", "care without spectacle"],
    ["tender unease", "comfort laced with doubt"],
    ["held grief", "loss carried without collapse"],
    ["protective softness", "warmth with an edge"],
    ["slow trust", "closeness earned over time"],
    ["private ache", "feeling kept below language"],
  ],
  Narrative: [
    ["growing apart together", "distance inside devotion"],
    ["the return arc", "coming back changed"],
    ["after the promise", "what survives the vow"],
    ["parallel longing", "two lives leaning inward"],
    ["small betrayals", "the fracture arrives quietly"],
    ["unfinished reunion", "closeness interrupted by time"],
  ],
};

const KEYWORD_POOLS: Record<string, Partial<VerticalPool>> = {
  friendship: {
    Culture: [
      ["rituals of belonging", "loyalty made visible"],
      ["chosen kinship", "family built by repetition"],
    ],
    Sound: [
      ["shared nostalgia loops", "old songs, same ache"],
      ["laughter in static", "memory through interference"],
    ],
    Emotion: [
      ["quiet loyalty", "care that never announces itself"],
      ["protected softness", "trust held with caution"],
    ],
    Narrative: [
      ["growing apart together", "distance without severing"],
      ["staying through change", "love reshaped by time"],
    ],
  },
  memory: {
    Visual: [
      ["faded contrast", "what survives is already edited"],
      ["light-burn residue", "time printed into the frame"],
    ],
    Sound: [
      ["tape-warp warmth", "the past audible in drag"],
      ["echo after speech", "memory arriving late"],
    ],
    Digital: [
      ["unreliable archive", "every save changes the truth"],
      ["corrupted recall", "loss hidden in the file"],
    ],
    Emotion: [
      ["grief as texture", "the past leaves residue"],
      ["the smell of before", "the body remembers first"],
    ],
  },
  identity: {
    Culture: [
      ["performed belonging", "selfhood shaped by the room"],
      ["borrowed selves", "identity learned by imitation"],
    ],
    Visual: [
      ["digital masks", "faces built for the feed"],
      ["mirrored realities", "self seen through others"],
    ],
    Digital: [
      ["feed-shaped selves", "the profile directing the person"],
      ["latent avatars", "alternate selves awaiting use"],
    ],
    Narrative: [
      ["becoming the role", "performance outlasting intent"],
      ["no fixed self", "identity rewritten by scene"],
    ],
  },
};

const PERSPECTIVE_LENSES: Record<PerspectiveType, { labels: string[][]; } > = {
  user: {
    labels: [
      ["the body's first response", "before the mind catches up"],
      ["feeling before thinking", "the gut as compass"],
      ["lived texture", "how it feels from inside"],
    ],
  },
  business: {
    labels: [
      ["what gets exchanged", "the hidden currency"],
      ["who absorbs the cost", "visible value, invisible burden"],
      ["the trade beneath", "every deal has a shadow deal"],
    ],
  },
  ethical: {
    labels: [
      ["who is excluded", "the edge the centre ignores"],
      ["power in the default", "the choice that was never offered"],
      ["the invisible harm", "what good intentions overlook"],
    ],
  },
  technical: {
    labels: [
      ["restraint as form", "what the medium won't allow"],
      ["the constraint speaks", "limitation as creative force"],
      ["material resistance", "when the medium pushes back"],
    ],
  },
  creative: {
    labels: [
      ["the piece as question", "no answer, only opening"],
      ["what it refuses to say", "the deliberate silence"],
      ["risk as method", "the work that could fail"],
    ],
  },
};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return Object.keys(KEYWORD_POOLS).filter((keyword) => lower.includes(keyword));
}

function buildVerticalPool(seed: string, vertical: CreativeVertical): Fragment[] {
  const keywords = extractKeywords(seed);
  const pool: Fragment[] = [];

  for (const keyword of keywords) {
    pool.push(...(KEYWORD_POOLS[keyword]?.[vertical] ?? []));
  }

  pool.push(...GENERIC_VERTICAL_POOLS[vertical]);
  return shuffle(pool);
}

function toVerticalNode(
  label: string,
  description: string,
  vertical: CreativeVertical,
): NodeContent {
  return {
    label,
    description,
    kind: "related",
    vertical,
    perspective: null,
  };
}

export function generateMockVerticalNode(
  seed: string,
  vertical: CreativeVertical,
  usedLabels: Set<string> = new Set(),
): NodeContent {
  const pool = buildVerticalPool(seed, vertical);
  const candidate = pool.find(([label]) => !usedLabels.has(label.toLowerCase())) ?? pool[0];
  const [label, description] = candidate ?? [`${vertical.toLowerCase()} trace`, "world detail"];
  usedLabels.add(label.toLowerCase());
  return toVerticalNode(label, description, vertical);
}

export function generateMockVerticalExpansion(
  label: string,
  vertical: CreativeVertical,
  count = 6,
): NodeContent[] {
  const used = new Set<string>();
  const pool = buildVerticalPool(label, vertical);
  const nodes: NodeContent[] = [];

  for (const [fragLabel, description] of pool) {
    if (nodes.length >= count) break;
    if (used.has(fragLabel.toLowerCase())) continue;
    used.add(fragLabel.toLowerCase());
    nodes.push(toVerticalNode(fragLabel, description, vertical));
  }

  while (nodes.length < count) {
    const suffix = nodes.length + 1;
    nodes.push(
      toVerticalNode(`${vertical.toLowerCase()} echo ${suffix}`, "deeper into the same world", vertical),
    );
  }

  return nodes;
}

export function generateInitialVerticalWorld(seed: string): NodeContent[] {
  const used = new Set<string>();
  return CREATIVE_VERTICALS.map((vertical) => generateMockVerticalNode(seed, vertical, used));
}

export function generateInitialMockGraph(seed: string): ThoughtGraphResponse {
  const world = generateInitialVerticalWorld(seed);

  // Reframe the seed as a creative fragment
  const seedReframes = [
    `${seed.split(" ").slice(0, 3).join(" ")} as feeling`,
    `the ${seed.toLowerCase().trim()}`,
    `what ${seed.toLowerCase().split(" ")[0]} holds`,
  ];

  return {
    seed: {
      label: pickRandom(seedReframes),
      description: "the idea before it was named",
      kind: "seed",
      vertical: null,
      perspective: null,
    },
    related: world.slice(0, 3),
    challenge: {
      ...(world[3] ?? generateMockVerticalNode(seed, "Emotion")),
      kind: "challenge",
      perspective: null,
    },
    perspectives: world.slice(4, 7).map((node) => ({
      ...node,
      kind: "perspective",
      perspective: null,
    })),
    aiMeta: {
      tone: pickRandom(["evocative", "textural", "fragmentary", "charged", "open"]),
      confidence: pickRandom(["low", "medium", "high"] as const),
    },
  };
}

export function generateMockExpansion(label: string, vertical: CreativeVertical = "Narrative"): NodeContent {
  return generateMockVerticalExpansion(label, vertical, 1)[0]!;
}

export function generateMockChallenge(label: string, vertical: CreativeVertical = "Emotion"): NodeContent {
  return {
    ...generateMockVerticalExpansion(label, vertical, 1)[0]!,
    kind: "challenge",
  };
}

export function generateMockPerspective(label: string): NodeContent {
  const perspectives = ["user", "business", "ethical", "technical", "creative"] as PerspectiveType[];
  const perspective = pickRandom(perspectives);
  const [fragmentLabel, description] = pickRandom(PERSPECTIVE_LENSES[perspective].labels);
  return {
    label: fragmentLabel,
    description,
    kind: "perspective",
    vertical: "Narrative",
    perspective,
  };
}

/**
 * Generates a tight cluster of 4 creative fragments that feel like facets
 * of the same idea — used by the “Dive in” / direction-cluster interaction.
 */
export function generateMockDirectionCluster(label: string): NodeContent[] {
  return generateMockVerticalExpansion(label, "Narrative", 4);
}

// ── Structured Creative Direction mocks ──────────────────────────────────────

type FullDeck = {
  core: CoreThesisContent;
  narratives: NarrativesContent;
  visual: VisualWorldContent;
  spatial: SpatialWorldContent;
  sound: SoundWorldContent;
  content: ContentSystemContent;
  execution: ExecutionContent;
};

const MOOD_POOL = [
  "quiet defiance", "tender unease", "held grief", "slow trust",
  "protective softness", "private ache", "wistful resolve", "charged stillness",
];

const THESIS_TEMPLATES = [
  (seed: string) => `"${seed}" lives in the space between longing and arrival — a feeling that refuses to resolve.`,
  (seed: string) => `At its core, "${seed}" is about what we carry when no one is watching.`,
  (seed: string) => `"${seed}" is the tension between what we show and what we hold back — tenderness armoured in restraint.`,
];

const PALETTE_POOL = ["washed indigo", "bone white", "bruised plum", "oxidised copper", "smoke grey", "faded terracotta", "muted sage", "dusty rose", "charcoal blue", "warm ivory", "deep ochre", "slate violet"];
const TEXTURE_POOL = ["raw linen", "cracked leather", "fogged glass", "wet concrete", "brushed aluminium", "worn velvet", "sun-bleached wood", "frosted steel", "aged paper", "polished stone", "soft rubber", "woven jute"];
const LIGHTING_POOL = ["golden hour side-light with deep shadows", "overcast diffused — flat but intimate", "harsh overhead fluorescent creating clinical distance"];
const FRAMING_POOL = ["close macro details — skin, thread, surface", "wide symmetrical compositions with negative space", "handheld intimate — slightly off-axis, breathing"];

const ENVIRONMENT_POOL = ["empty rooftop at dusk", "abandoned laundromat", "hotel corridor", "rain-fogged bus shelter", "dimly lit stairwell", "kitchen table at 2am", "half-lit parking structure", "overgrown courtyard", "train platform between cities", "bathroom mirror"];
const SPATIAL_MOOD_POOL = ["liminal stillness — between arrival and departure", "domestic tension held in ordinary architecture", "urban solitude wrapped in ambient noise"];
const SPATIAL_SYMBOLISM_POOL = ["thresholds representing inner transitions", "enclosed spaces as emotional compression", "open horizons as unresolved possibility"];

const GENRE_POOL = ["ambient", "slowcore", "trip-hop", "shoegaze", "neo-soul", "lo-fi RnB", "post-punk", "chamber pop"];
const SONIC_TEXTURE_POOL = ["tape hiss", "detuned piano", "vinyl crackle", "sub-bass hum", "reversed reverb", "muted strings", "distant radio", "breath loops"];
const SOUND_REF_POOL = ["rain on glass", "crowd murmur from another room", "elevator hum", "wind through an open window", "static between stations", "footsteps on wet pavement", "muffled conversation", "clock ticking in an empty room"];

const FORMAT_POOL = ["POV short film", "photo essay carousel", "audio diary series", "split-screen duality", "long-form documentary reel", "minimalist typography post"];
const POV_POOL = ["POV: you kept the voicemail", "POV: the last photo in the camera roll", "POV: returning to a place that moved on without you", "POV: the silence after the door closes", "POV: rereading old messages at 3am", "POV: finding their handwriting in an old book"];
const IDEA_POOL = ["A day-in-the-life of an emotion", "Objects left behind as character portraits", "The space between 'I'm fine' and the truth", "What your spotify wrapped would feel like as a film", "Soundtracking the drive home", "The aesthetics of waiting"];
const STORYTELLING_POOL = ["before/after without the event", "voiceover monologue over mundane footage", "parallel timelines converging", "one continuous shot, no cuts", "text on screen as inner dialogue", "found footage recontextualised"];

const CAMPAIGN_POOL = ["The Quiet Collection — intimate product drops tied to emotional states", "After Hours — content series releasing between midnight and 4am", "Held Objects — merch line where every item tells a micro-story", "The Space Between — experiential pop-up in transitional architecture", "Soft Archive — curated user submissions as brand storytelling"];
const SHOOT_POOL = ["Golden hour rooftop session — one model, one outfit, natural light only", "Laundromat at closing — fluorescent, intimate, documentary feel", "Rain-fogged windows — interior perspective, shallow depth of field", "Empty hotel corridor — symmetry, solitude, cinematic stillness", "Kitchen table 2am — overhead, warm tones, objects as characters"];
const ASSET_POOL = ["hero campaign film (90s)", "social cutdowns (15s / 30s)", "behind-the-scenes docu-reel", "photo series (6-8 stills)", "audio mood tape", "typography posters", "zine layout", "playlist curation"];

export function generateMockCreativeDirection(seed: string): FullDeck {
  const s = shuffle;
  return {
    core: {
      thesis: pickRandom(THESIS_TEMPLATES)(seed),
      mood: pickRandom(MOOD_POOL),
    },
    narratives: {
      directions: s(GENERIC_VERTICAL_POOLS.Narrative).slice(0, 3).map(([title, desc]) => ({
        title,
        explanation: desc,
        resonance: pickRandom(GENERIC_VERTICAL_POOLS.Emotion)[1],
      })),
    },
    visual: {
      palette: s(PALETTE_POOL).slice(0, 5),
      textures: s(TEXTURE_POOL).slice(0, 4),
      lighting: pickRandom(LIGHTING_POOL),
      framing: pickRandom(FRAMING_POOL),
    },
    spatial: {
      environments: s(ENVIRONMENT_POOL).slice(0, 4),
      mood: pickRandom(SPATIAL_MOOD_POOL),
      symbolism: pickRandom(SPATIAL_SYMBOLISM_POOL),
    },
    sound: {
      genres: s(GENRE_POOL).slice(0, 3),
      textures: s(SONIC_TEXTURE_POOL).slice(0, 4),
      references: s(SOUND_REF_POOL).slice(0, 3),
    },
    content: {
      formats: s(FORMAT_POOL).slice(0, 3),
      povPrompts: s(POV_POOL).slice(0, 3),
      ideas: s(IDEA_POOL).slice(0, 3),
      storytelling: s(STORYTELLING_POOL).slice(0, 3),
    },
    execution: {
      campaigns: s(CAMPAIGN_POOL).slice(0, 3),
      shootConcepts: s(SHOOT_POOL).slice(0, 3),
      assetTypes: s(ASSET_POOL).slice(0, 4),
    },
  };
}

export function generateMockSectionExpand(sectionId: SectionId, seed: string): unknown {
  const deck = generateMockCreativeDirection(seed);
  // Return only the requested section's data
  return deck[sectionId as keyof FullDeck];
}
