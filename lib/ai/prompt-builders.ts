import {
  CREATIVE_VERTICALS,
  type CreativeMode,
  type CreativeVertical,
  type PerspectiveType,
} from "@/types/thought";

export interface NearbyNodeContext {
  label: string;
  kind?: string;
  vertical?: CreativeVertical | null;
  perspective?: PerspectiveType | null;
}

// Per-mode register framing injected into every prompt.
// Placed immediately after the persona line so the model
// calibrates its output style before reading the task.
const MODE_FRAMING: Record<CreativeMode, string> = {
  concept:   "Register: abstract and conceptual. Think in themes, patterns, ideas, and symbolic relationships.",
  visual:    "Register: imagistic and sensory. Think in textures, materials, visual metaphors, aesthetic qualities, light, form, and colour.",
  emotional: "Register: felt and atmospheric. Think in moods, emotional textures, tone, resonance, and psychological atmosphere.",
};

function renderNearbyContext(nearbyNodes?: NearbyNodeContext[]): string {
  if (!nearbyNodes || nearbyNodes.length === 0) {
    return "No nearby context provided.";
  }

  return nearbyNodes
    .slice(0, 8)
    .map((node) => {
      const kind = node.kind ?? "unknown";
      const vertical = node.vertical ? `, vertical: ${node.vertical}` : "";
      const perspective = node.perspective ? `, perspective: ${node.perspective}` : "";
      return `- ${node.label} (kind: ${kind}${vertical}${perspective})`;
    })
    .join("\n");
}

export function buildInitialPrompt(seed: string, nearbyNodes?: NearbyNodeContext[], creativeMode?: CreativeMode): string {
  return [
    "You are a creative director and visual thinker.",
    ...(creativeMode ? [MODE_FRAMING[creativeMode], ""] : []),
    "You think in worlds, disciplines, atmospheres, and symbolic systems — not frameworks or strategies.",
    "Open the seed into a creative world board made of seven distinct verticals.",
    "",
    "Return JSON only.",
    "",
    "Output exactly:",
    "- nodes: exactly 7 items",
    "- one item for each vertical, using each of these exactly once:",
    `  ${CREATIVE_VERTICALS.join(" / ")}`,
    "",
    "Output style — the most important rule:",
    "- label: 2–4 words max. Fragment, not sentence. Evocative, image-forward, no corporate language.",
    "- description: always include the field. Use a 1 short line cue, 2–8 words, or an empty string if you want no descriptor.",
    "- forbidden words: optimize, efficiency, impact, cost, user, strategy, leverage, framework, solution, stakeholder",
    "- no full sentences in descriptions. No analytical framing. No structured-thinking language.",
    "- every vertical must interpret the same concept through a different discipline",
    "- no repetition across verticals. Each node must contribute a distinct piece of the world.",
    "- write like a creative director building a world, not a consultant making a list",
    "",
    "What good looks like:",
    "  Input: 'friendship'",
    "  → Culture: 'rituals of belonging'",
    "  → Visual: 'soft layered tones'",
    "  → Sound: 'shared nostalgia loops'",
    "  → Space: 'intimate dim environments'",
    "  → Digital: 'visible invisible bonds'",
    "  → Emotion: 'quiet loyalty'",
    "  → Narrative: 'growing apart, staying close'",
    "",
    "What bad looks like:",
    "  → label: 'Audience segmentation strategy'  description: 'Evaluating how different groups respond to brand messaging'",
    "  → label: 'Authentic storytelling approach'  description: 'Building narrative frameworks that resonate with target users'",
    "",
    `Seed: ${seed}`,
    "Nearby ideas to avoid repeating:",
    renderNearbyContext(nearbyNodes),
  ].join("\n");
}

export function buildExpandPrompt(
  selectedLabel: string,
  selectedVertical: CreativeVertical,
  nearbyNodes?: NearbyNodeContext[],
  creativeMode?: CreativeMode,
): string {
  return [
    "You are a creative director.",
    ...(creativeMode ? [MODE_FRAMING[creativeMode], ""] : []),
    `Generate deeper directions inside the ${selectedVertical} vertical only.`,
    "",
    "Return JSON only.",
    "",
    "Output exactly:",
    "- nodes: 6 items",
    "",
    "Think in: images, moods, textures, material cues, tensions, symbolic details.",
    `Every node must stay inside the ${selectedVertical} lens.`,
    "Do not jump to other verticals.",
    "Each direction should feel like a deeper facet of the same world, not a new category.",
    "",
    "Output style:",
    "- labels: 2–4 words. Fragment, not sentence.",
    "- descriptions: always include the field. Use 1 short line only, 2–8 words, or an empty string if you want no descriptor.",
    "- no corporate language, no analytical framing",
    "- avoid restating the selected idea",
    "- keep thematic consistency with the selected node",
    `- all 6 nodes must clearly belong to ${selectedVertical}`,
    "",
    `Examples for ${selectedVertical}:`,
    selectedVertical === "Sound"
      ? "  → label: 'hiss in the walls'  description: 'memory caught in static'"
      : "  → label: 'threshold detail'  description: 'a world revealed by fragments'",
    "",
    "Return only JSON matching the requested schema.",
    "",
    `Selected idea: ${selectedLabel}`,
    `Selected vertical: ${selectedVertical}`,
    "Nearby ideas to avoid repeating:",
    renderNearbyContext(nearbyNodes),
  ].join("\n");
}

export function buildDirectionPrompt(
  selectedLabel: string,
  selectedVertical: CreativeVertical,
  nearbyNodes?: NearbyNodeContext[],
  creativeMode?: CreativeMode,
): string {
  return buildExpandPrompt(selectedLabel, selectedVertical, nearbyNodes, creativeMode);
}

export function buildChallengePrompt(
  selectedLabel: string,
  selectedVertical: CreativeVertical,
  nearbyNodes?: NearbyNodeContext[],
  creativeMode?: CreativeMode,
): string {
  return buildExpandPrompt(selectedLabel, selectedVertical, nearbyNodes, creativeMode);
}

export function buildPerspectivePrompt(
  selectedLabel: string,
  selectedVertical: CreativeVertical,
  nearbyNodes?: NearbyNodeContext[],
  creativeMode?: CreativeMode,
): string {
  return buildExpandPrompt(selectedLabel, selectedVertical, nearbyNodes, creativeMode);
}
