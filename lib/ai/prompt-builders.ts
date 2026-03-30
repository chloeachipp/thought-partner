import type { CreativeMode, SectionId } from "@/types/thought";

export interface NearbyNodeContext {
  label: string;
  kind?: string;
  vertical?: string | null;
  perspective?: string | null;
}

const MODE_FRAMING: Record<CreativeMode, string> = {
  concept:   "Register: abstract and conceptual. Think in themes, patterns, ideas, and symbolic relationships.",
  visual:    "Register: imagistic and sensory. Think in textures, materials, visual metaphors, aesthetic qualities, light, form, and colour.",
  emotional: "Register: felt and atmospheric. Think in moods, emotional textures, tone, resonance, and psychological atmosphere.",
};

const PERSONA = [
  "You are a senior creative director at a world-class agency.",
  "You build creative worlds for campaigns — not strategies, not frameworks.",
  "You think in images, moods, tensions, textures, and cultural cues.",
  "Every output should feel like a page from a premium creative direction deck.",
  "",
  "Rules:",
  "- No corporate language: never use optimize, leverage, framework, stakeholder, impact, efficiency, strategy, solution, KPI, ROI",
  "- No full sentences in list items unless explicitly requested",
  "- Write like a creative director, not a strategist or consultant",
  "- Every section must build the same world — they are facets of one vision, not disconnected lists",
  "- Be specific and evocative. Avoid generic outputs that could apply to any concept.",
].join("\n");

// ── INITIAL: Full creative direction deck ────────────────────────────────────

export function buildInitialPrompt(
  seed: string,
  creativeMode?: CreativeMode,
): string {
  return [
    PERSONA,
    "",
    ...(creativeMode ? [MODE_FRAMING[creativeMode], ""] : []),
    `Input concept: "${seed}"`,
    "",
    "Generate a complete creative direction deck for this concept.",
    "Return JSON only, matching the schema exactly.",
    "",
    "Sections:",
    "",
    "1. core — the emotional centre",
    "   - thesis: 1–2 sentences. The emotional and cultural heart of the concept. Not a definition — a creative position.",
    "   - mood: 2–4 words. The feeling of the world (e.g. 'quiet defiance', 'tender unease', 'electric stillness').",
    "",
    "2. narratives — max 3 narrative directions",
    "   Each with:",
    "   - title: 2–4 words, evocative fragment",
    "   - explanation: 1–2 sentences. What this narrative explores.",
    "   - resonance: 1 sentence. Why this resonates culturally or emotionally right now.",
    "",
    "3. visual — the visual world",
    "   - palette: 4–6 colour descriptors (not hex). e.g. 'bruised plum', 'bleached concrete', 'gold cigarette light'",
    "   - textures: 3–5 material/surface descriptors. e.g. 'worn leather', 'fogged glass', 'crumpled silk'",
    "   - lighting: 1–2 sentences describing the lighting style",
    "   - framing: 1–2 sentences describing camera/framing approach",
    "",
    "4. spatial — environments and spaces",
    "   - environments: 3–5 specific locations/environments. e.g. 'abandoned petrol station at dusk', not just 'urban space'",
    "   - mood: 1–2 sentences. The spatial mood / atmosphere.",
    "   - symbolism: 1–2 sentences. What these spaces symbolise in the world.",
    "",
    "5. sound — the sonic world",
    "   - genres: 3–5 music genres, moods, or sonic references. Be specific — not just 'electronic' but 'lo-fi dub techno with tape hiss'",
    "   - textures: 3–4 sonic textures. e.g. 'vinyl crackle', 'submerged bass hum', 'distant choir reverb'",
    "   - references: 2–4 ambient or cultural sound references. e.g. 'late-night radio static', 'a crowd dispersing after a concert'",
    "",
    "6. content — content system for social/digital",
    "   - formats: 3–4 TikTok/social content formats. e.g. 'silent POV walk-throughs', 'split-screen before/after mood boards'",
    "   - povPrompts: 3–4 POV-style prompts. e.g. 'POV: you find a letter you wrote to yourself at 16'",
    "   - ideas: 3–4 specific content ideas",
    "   - storytelling: 2–3 storytelling formats. e.g. 'confessional monologue over b-roll', 'slow-reveal photo essay'",
    "",
    "7. execution — campaign outputs",
    "   - campaigns: 2–3 campaign ideas with a title and one-line description each",
    "   - shootConcepts: 2–3 shoot concepts. Be specific about location, talent, mood.",
    "   - assetTypes: 4–6 asset types. e.g. '16:9 hero film', 'lo-fi BTS reel', 'editorial stills series', 'zine-format lookbook'",
    "",
    "Remember: all 7 sections must feel like parts of the same creative world.",
    "Be bold, specific, and culturally aware. No filler. No generic outputs.",
  ].join("\n");
}

// ── EXPAND: Deeper detail for a single section ───────────────────────────────

const SECTION_EXPAND_INSTRUCTIONS: Record<SectionId, string> = {
  core: [
    "Expand the core thesis into a deeper creative brief.",
    "Return:",
    "- thesis: a richer, more layered 2–3 sentence creative position",
    "- mood: a more nuanced 3–5 word mood descriptor",
  ].join("\n"),

  narratives: [
    "Generate 3 more narrative directions that go deeper into the same world.",
    "Each with: title (2–4 words), explanation (1–2 sentences), resonance (1 sentence).",
    "These should feel like they come from the same campaign but explore different emotional or cultural angles.",
  ].join("\n"),

  visual: [
    "Expand the visual world with more specificity.",
    "Return:",
    "- palette: 6–8 colour descriptors, more specific and layered",
    "- textures: 5–7 textures with more material detail",
    "- lighting: a richer 2–3 sentence lighting direction",
    "- framing: a richer 2–3 sentence framing/camera direction",
  ].join("\n"),

  spatial: [
    "Expand the spatial world with deeper location detail.",
    "Return:",
    "- environments: 5–7 specific locations, each described with mood detail",
    "- mood: 2–3 sentences on spatial atmosphere",
    "- symbolism: 2–3 sentences on the symbolic meaning of these spaces",
  ].join("\n"),

  sound: [
    "Expand the sound world with deeper sonic detail.",
    "Return:",
    "- genres: 5–7 more specific genre/mood references",
    "- textures: 5–6 sonic textures",
    "- references: 4–6 ambient/cultural sound references",
  ].join("\n"),

  content: [
    "Expand the content system with more ideas and formats.",
    "Return:",
    "- formats: 5–6 social content formats",
    "- povPrompts: 5–6 POV prompts",
    "- ideas: 5–6 specific content ideas",
    "- storytelling: 4–5 storytelling formats",
  ].join("\n"),

  execution: [
    "Expand the execution plan with more campaign detail.",
    "Return:",
    "- campaigns: 4–5 campaign ideas (title + one-line description each)",
    "- shootConcepts: 4–5 shoot concepts with location, talent, mood detail",
    "- assetTypes: 6–8 specific asset types",
  ].join("\n"),
};

export function buildExpandPrompt(
  sectionId: SectionId,
  seed: string,
  existingContext: string,
  creativeMode?: CreativeMode,
): string {
  const instructions = SECTION_EXPAND_INSTRUCTIONS[sectionId];

  return [
    PERSONA,
    "",
    ...(creativeMode ? [MODE_FRAMING[creativeMode], ""] : []),
    `Original concept: "${seed}"`,
    "",
    "Here is the existing creative direction for context — stay in this world:",
    existingContext,
    "",
    "Now go deeper on this section.",
    "",
    instructions,
    "",
    "Return JSON only, matching the schema exactly.",
    "Stay in the same world. Be more specific, not more generic.",
    "No corporate language. No filler. Every item should feel crafted.",
  ].join("\n");
}
