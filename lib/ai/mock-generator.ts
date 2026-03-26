import type { ThoughtGraphResponse, PerspectiveType, NodeContent } from "@/types/thought";

const CONCEPT_RELATIONSHIPS: Record<string, { related: string[]; challenges: string[] }> = {
  learning: {
    related: [
      "Feedback timing",
      "Practice cadence",
      "Peer mirrors",
      "Scaffold fadeout",
      "Reflection habit",
      "Transfer checkpoints",
    ],
    challenges: [
      "Tool dependency",
      "Motivation drift",
      "Access gap",
      "One-size model",
      "Attention fatigue",
      "Cost barrier",
    ],
  },
  ai: {
    related: [
      "Decision handoff",
      "Signal quality",
      "Human oversight",
      "Data drift",
      "Trust calibration",
    ],
    challenges: [
      "Bias amplification",
      "Opaque reasoning",
      "Skill atrophy",
      "Power concentration",
      "Energy burden",
    ],
  },
  business: {
    related: [
      "Incentive alignment",
      "Adoption friction",
      "Decision latency",
      "Value capture",
      "Coordination load",
    ],
    challenges: [
      "Short-term pressure",
      "Trust debt",
      "Execution drag",
      "Margin squeeze",
      "Regulatory lag",
    ],
  },
  design: {
    related: [
      "Intent clarity",
      "Choice architecture",
      "Error recovery",
      "Emotional tone",
      "Context fit",
    ],
    challenges: [
      "Novelty tax",
      "Cognitive overload",
      "Accessibility gap",
      "Polish trap",
      "Ambiguity cost",
    ],
  },
  technology: {
    related: [
      "System boundaries",
      "Dependency risk",
      "Failure visibility",
      "Interoperability",
      "Maintenance horizon",
    ],
    challenges: [
      "Complexity creep",
      "Security debt",
      "Platform lock-in",
      "Latency spikes",
      "Reliability ceiling",
    ],
  },
};

const GENERIC_RELATED = [
  "Stakeholder mismatch",
  "Constraint surface",
  "Timing window",
  "Second-order effects",
  "Adoption signals",
];

const GENERIC_CHALLENGES = [
  "Hidden trade-off",
  "Scale fragility",
  "Maintenance burden",
  "Context mismatch",
  "Incentive conflict",
];

const CHALLENGE_EXTENSIONS: Record<PerspectiveType, string[]> = {
  user: [
    "with onboarding friction often blocking early confidence",
    "when over-anticipation quietly reduces user agency",
    "if people cannot inspect why the system made a suggestion",
  ],
  business: [
    "if support costs rise before value is felt",
    "when success metrics reward speed over quality",
    "as dependency risk grows around one vendor direction",
  ],
  ethical: [
    "when benefits concentrate with already advantaged groups",
    "if defaults encode values users never chose",
    "as accountability blurs across human and model decisions",
  ],
  technical: [
    "when edge cases dominate long-term maintenance",
    "as model behavior drifts faster than governance updates",
    "if integrations expand the failure surface unexpectedly",
  ],
  creative: [
    "when defaults flatten stylistic diversity",
    "if fast drafts reduce deliberate judgment",
    "as convenience narrows creative exploration depth",
  ],
};

const PERSPECTIVE_LENSES: Record<PerspectiveType, string> = {
  user: "Daily use reveals where confidence is gained or lost.",
  business: "Incentives decide which behaviors the system truly rewards.",
  ethical: "Value is shaped by who benefits first and who absorbs risk.",
  technical: "System limits determine what can be trusted at scale.",
  creative: "The tool changes not only output, but what creators attempt.",
};

const PERSPECTIVE_LABELS: Record<PerspectiveType, string[]> = {
  user: ["User confidence curve", "Adoption anxiety signal", "Trust at first use"],
  business: ["Incentive reality check", "Cost of consistency", "Value capture tension"],
  ethical: ["Who bears the risk", "Fairness under defaults", "Power distribution"],
  technical: ["Failure surface", "Reliability boundary", "System constraints"],
  creative: ["Taste formation", "Exploration depth", "Originality pressure"],
};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return Object.keys(CONCEPT_RELATIONSHIPS).filter((keyword) => lower.includes(keyword));
}

function getRelatedConcepts(seed: string): string[] {
  const keywords = extractKeywords(seed);
  const relatedSet = new Set<string>();

  if (keywords.length > 0) {
    keywords.forEach((keyword) => {
      CONCEPT_RELATIONSHIPS[keyword]?.related.forEach((item) => relatedSet.add(item));
    });
    return Array.from(relatedSet).sort(() => Math.random() - 0.5).slice(0, 3);
  }

  return [...GENERIC_RELATED].sort(() => Math.random() - 0.5).slice(0, 3);
}

function getChallengeConcept(seed: string): string {
  const keywords = extractKeywords(seed);

  if (keywords.length > 0) {
    return pickRandom(CONCEPT_RELATIONSHIPS[keywords[0]]?.challenges ?? GENERIC_CHALLENGES);
  }

  return pickRandom(GENERIC_CHALLENGES);
}

function describeRelated(label: string): string {
  return `This angle matters because ${label.toLowerCase()} can shift outcomes over time.`;
}

function describeChallenge(label: string): string {
  return `${label} may weaken this direction unless addressed deliberately in the design.`;
}

export function generateInitialMockGraph(seed: string): ThoughtGraphResponse {
  const relatedConcepts = getRelatedConcepts(seed);
  const challengeConcept = getChallengeConcept(seed);
  const perspectives = ["user", "business", "ethical", "technical", "creative"] as PerspectiveType[];

  const randomTone = pickRandom(["thoughtful", "analytical", "exploratory", "grounded", "reflective"]);
  const randomConfidence = pickRandom(["low", "medium", "high"] as const);

  return {
    seed: {
      label: seed,
      description: "This framing opens practical, social, and strategic consequences worth mapping.",
      kind: "seed",
      perspective: null,
    },
    related: relatedConcepts.map((concept) => ({
      label: concept,
      description: describeRelated(concept),
      kind: "related",
      perspective: null,
    })),
    challenge: {
      label: challengeConcept,
      description: describeChallenge(challengeConcept),
      kind: "challenge",
      perspective: null,
    },
    perspectives: perspectives.map((perspective) => ({
      label: pickRandom(PERSPECTIVE_LABELS[perspective]),
      description: PERSPECTIVE_LENSES[perspective],
      kind: "perspective",
      perspective,
    })),
    aiMeta: {
      tone: randomTone,
      confidence: randomConfidence,
    },
  };
}

export function generateMockExpansion(label: string): NodeContent {
  const keywords = extractKeywords(label);
  const expansionLabel =
    keywords.length > 0
      ? pickRandom(CONCEPT_RELATIONSHIPS[keywords[0]]?.related ?? GENERIC_RELATED)
      : pickRandom(GENERIC_RELATED);

  return {
    label: expansionLabel,
    description: describeRelated(expansionLabel),
    kind: "related",
    perspective: null,
  };
}

export function generateMockChallenge(label: string): NodeContent {
  const challengeLabel = getChallengeConcept(label);

  return {
    label: challengeLabel,
    description: describeChallenge(challengeLabel),
    kind: "challenge",
    perspective: null,
  };
}

export function generateMockPerspective(label: string): NodeContent {
  const perspectives = ["user", "business", "ethical", "technical", "creative"] as PerspectiveType[];
  const perspective = pickRandom(perspectives);
  const labelChoice = pickRandom(PERSPECTIVE_LABELS[perspective]);
  const extension = pickRandom(CHALLENGE_EXTENSIONS[perspective]);

  return {
    label: labelChoice,
    description: `${PERSPECTIVE_LENSES[perspective].replace(/\.$/, "")} ${extension}.`,
    kind: "perspective",
    perspective,
  };
}
