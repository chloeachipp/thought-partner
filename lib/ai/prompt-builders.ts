import type { PerspectiveType } from "@/types/thought";

export interface NearbyNodeContext {
  label: string;
  kind?: string;
  perspective?: PerspectiveType | null;
}

function renderNearbyContext(nearbyNodes?: NearbyNodeContext[]): string {
  if (!nearbyNodes || nearbyNodes.length === 0) {
    return "No nearby context provided.";
  }

  return nearbyNodes
    .slice(0, 8)
    .map((node) => {
      const kind = node.kind ?? "unknown";
      const perspective = node.perspective ? `, perspective: ${node.perspective}` : "";
      return `- ${node.label} (kind: ${kind}${perspective})`;
    })
    .join("\n");
}

export function buildInitialPrompt(seed: string, nearbyNodes?: NearbyNodeContext[]): string {
  return [
    "You are a strategic thinking partner for a visual thought graph.",
    "Expand the seed into a compact, high-signal map.",
    "",
    "Return JSON only.",
    "",
    "Output exactly:",
    "- seed: 1 reframed core idea",
    "- related: 3 adjacent ideas",
    "- challenge: 1 productive tension",
    "- perspectives: 3 distinct types from user/business/ethical/technical/creative",
    "",
    "Quality constraints:",
    "- labels: 2-6 words, <= 34 chars",
    "- descriptions: one short sentence, <= 20 words",
    "- no buzzwords, no hype, no vague filler",
    "- do not invent facts, numbers, or citations",
    "- avoid repeating nearby node wording",
    "",
    "Perspective quality:",
    "- each perspective should change what matters, not just rephrase",
    "- use concrete viewpoint logic (incentives, constraints, risks, values)",
    "",
    "Challenge quality:",
    "- surface a real trade-off or blind spot",
    "- tension should be useful, not cynical",
    "",
    "Mini examples:",
    "- strong label: 'Invisible onboarding friction'",
    "- weak label: 'Improving user experience with innovation'",
    "- strong challenge: 'Early convenience may reduce long-term skill formation.'",
    "",
    `Seed: ${seed}`,
    "Nearby nodes to avoid repeating:",
    renderNearbyContext(nearbyNodes),
  ].join("\n");
}

export function buildExpandPrompt(selectedLabel: string, nearbyNodes?: NearbyNodeContext[]): string {
  return [
    "You are a strategic thinking partner.",
    "Generate 2-3 adjacent ideas that deepen or extend the selected node.",
    "",
    "Return JSON only.",
    "",
    "Quality constraints:",
    "- labels: 2-6 words, <= 34 chars",
    "- descriptions: one short sentence, <= 20 words",
    "- each idea should add a new dimension (constraint, dependency, second-order effect, or opportunity)",
    "- avoid paraphrasing the selected label",
    "- avoid factual claims you cannot verify",
    "",
    "Mini example:",
    "- selected: 'AI writing tutor'",
    "- good adjacent idea: 'Feedback timing shapes confidence'",
    "- bad adjacent idea: 'Better AI writing tutor features'",
    "",
    "Return only JSON matching the requested schema.",
    "",
    `Selected node: ${selectedLabel}`,
    "Nearby nodes to avoid repeating:",
    renderNearbyContext(nearbyNodes),
  ].join("\n");
}

export function buildChallengePrompt(selectedLabel: string, nearbyNodes?: NearbyNodeContext[]): string {
  return [
    "You are a strategic thinking partner.",
    "Generate 1 counterpoint that productively tests the selected node.",
    "",
    "Return JSON only.",
    "",
    "Quality constraints:",
    "- label: 2-6 words, <= 34 chars",
    "- description: one short sentence, <= 20 words",
    "- challenge must introduce a real trade-off, hidden cost, or failure mode",
    "- avoid negativity for its own sake",
    "- avoid repeating original wording",
    "- avoid unsupported factual claims",
    "",
    "Mini example:",
    "- weak: 'This might not work.'",
    "- strong: 'Automation speed may hide errors users no longer know how to detect.'",
    "",
    "Return only JSON matching the requested schema.",
    "",
    `Selected node: ${selectedLabel}`,
    "Nearby nodes to avoid repeating:",
    renderNearbyContext(nearbyNodes),
  ].join("\n");
}

export function buildPerspectivePrompt(selectedLabel: string, nearbyNodes?: NearbyNodeContext[]): string {
  return [
    "You are a strategic thinking partner.",
    "Generate 3 reframings from distinct viewpoint types chosen from: user, business, ethical, technical, creative.",
    "",
    "Return JSON only.",
    "",
    "Quality constraints:",
    "- pick 3 different perspective types",
    "- each perspective must change decision criteria, not wording",
    "- labels: 2-6 words, <= 34 chars",
    "- descriptions: one short sentence, <= 20 words",
    "- avoid generic role-play language",
    "- avoid unsupported factual claims",
    "",
    "Mini example:",
    "- user: 'Cognitive load during first use'",
    "- business: 'Who pays for long-term guidance'",
    "- ethical: 'Who is excluded by default settings'",
    "",
    "Return only JSON matching the requested schema.",
    "",
    `Selected node: ${selectedLabel}`,
    "Nearby nodes to avoid repeating:",
    renderNearbyContext(nearbyNodes),
  ].join("\n");
}
