import type {
  AIProviderChoice,
  ContentSystemContent,
  CoreThesisContent,
  ExecutionContent,
  NarrativesContent,
  SectionData,
  SectionId,
  SoundWorldContent,
  SpatialWorldContent,
  VisualWorldContent,
} from "@/types/thought";

export interface CreativeDirectionSnapshot {
  version: 1;
  id: string;
  seed: string;
  aiProvider: AIProviderChoice;
  activeSection: SectionId;
  generationMode: "fallback" | "provider";
  provider: string | null;
  sections: Record<SectionId, SectionData>;
  savedAt: string;
  duplicatedFrom?: string | null;
}

export interface ExportPrompt {
  id: string;
  title: string;
  category: string;
  prompt: string;
}

export interface BriefSection {
  title: string;
  body: string[];
}

function bullet(items: string[]): string[] {
  return items.filter(Boolean).map((item) => `- ${item}`);
}

function sentence(value: string | undefined | null): string {
  return value?.trim() ?? "";
}

function readCore(sections: Record<SectionId, SectionData>): CoreThesisContent | null {
  const content = sections.core?.content;
  return content?.type === "core" ? content.data : null;
}

function readNarratives(sections: Record<SectionId, SectionData>): NarrativesContent | null {
  const content = sections.narratives?.content;
  return content?.type === "narratives" ? content.data : null;
}

function readVisual(sections: Record<SectionId, SectionData>): VisualWorldContent | null {
  const content = sections.visual?.content;
  return content?.type === "visual" ? content.data : null;
}

function readSpatial(sections: Record<SectionId, SectionData>): SpatialWorldContent | null {
  const content = sections.spatial?.content;
  return content?.type === "spatial" ? content.data : null;
}

function readSound(sections: Record<SectionId, SectionData>): SoundWorldContent | null {
  const content = sections.sound?.content;
  return content?.type === "sound" ? content.data : null;
}

function readContent(sections: Record<SectionId, SectionData>): ContentSystemContent | null {
  const content = sections.content?.content;
  return content?.type === "content" ? content.data : null;
}

function readExecution(sections: Record<SectionId, SectionData>): ExecutionContent | null {
  const content = sections.execution?.content;
  return content?.type === "execution" ? content.data : null;
}

function joinList(items: string[]): string {
  return items.filter(Boolean).join(", ");
}

export function hasDirectionContent(sections: Record<SectionId, SectionData>): boolean {
  return Object.values(sections).some((section) => section.content !== null);
}

export function createSnapshot(params: {
  seed: string;
  aiProvider: AIProviderChoice;
  activeSection: SectionId;
  generationMode: "fallback" | "provider";
  provider: string | null;
  sections: Record<SectionId, SectionData>;
  duplicatedFrom?: string | null;
}): CreativeDirectionSnapshot {
  return {
    version: 1,
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
    seed: params.seed,
    aiProvider: params.aiProvider,
    activeSection: params.activeSection,
    generationMode: params.generationMode,
    provider: params.provider,
    sections: params.sections,
    savedAt: new Date().toISOString(),
    duplicatedFrom: params.duplicatedFrom ?? null,
  };
}

export function duplicateSnapshot(snapshot: CreativeDirectionSnapshot): CreativeDirectionSnapshot {
  return {
    ...snapshot,
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
    savedAt: new Date().toISOString(),
    duplicatedFrom: snapshot.id,
  };
}

export function buildBriefSections(snapshot: CreativeDirectionSnapshot): BriefSection[] {
  const core = readCore(snapshot.sections);
  const narratives = readNarratives(snapshot.sections);
  const visual = readVisual(snapshot.sections);
  const spatial = readSpatial(snapshot.sections);
  const sound = readSound(snapshot.sections);
  const content = readContent(snapshot.sections);
  const execution = readExecution(snapshot.sections);

  return [
    {
      title: "Theme / Input Concept",
      body: [snapshot.seed],
    },
    {
      title: "Core Thesis",
      body: core
        ? [sentence(core.thesis), `Mood: ${sentence(core.mood)}`]
        : ["No core thesis has been generated yet."],
    },
    {
      title: "Narrative Directions",
      body: narratives
        ? narratives.directions.flatMap((direction) => [
            `${direction.title}: ${direction.explanation}`,
            `Why it resonates: ${direction.resonance}`,
          ])
        : ["No narrative directions have been generated yet."],
    },
    {
      title: "Visual World",
      body: visual
        ? [
            `Palette: ${joinList(visual.palette)}`,
            `Textures: ${joinList(visual.textures)}`,
            `Lighting: ${sentence(visual.lighting)}`,
            `Framing: ${sentence(visual.framing)}`,
          ]
        : ["No visual world has been generated yet."],
    },
    {
      title: "Spatial World",
      body: spatial
        ? [
            `Environments: ${joinList(spatial.environments)}`,
            `Mood: ${sentence(spatial.mood)}`,
            `Symbolism: ${sentence(spatial.symbolism)}`,
          ]
        : ["No spatial world has been generated yet."],
    },
    {
      title: "Sound World",
      body: sound
        ? [
            `Genres: ${joinList(sound.genres)}`,
            `Textures: ${joinList(sound.textures)}`,
            `References: ${joinList(sound.references)}`,
          ]
        : ["No sound world has been generated yet."],
    },
    {
      title: "Content System",
      body: content
        ? [
            `Formats: ${joinList(content.formats)}`,
            ...bullet(content.povPrompts.map((item) => `POV: ${item}`)),
            ...bullet(content.ideas.map((item) => `Idea: ${item}`)),
            ...bullet(content.storytelling.map((item) => `Storytelling: ${item}`)),
          ]
        : ["No content system has been generated yet."],
    },
    {
      title: "Execution Outputs",
      body: execution
        ? [
            ...bullet(execution.campaigns.map((item) => `Campaign: ${item}`)),
            ...bullet(execution.shootConcepts.map((item) => `Shoot: ${item}`)),
            `Assets: ${joinList(execution.assetTypes)}`,
          ]
        : ["No execution outputs have been generated yet."],
    },
  ];
}

export function buildCreativeBrief(snapshot: CreativeDirectionSnapshot): string {
  const sections = buildBriefSections(snapshot);
  return sections
    .map((section) => [section.title.toUpperCase(), ...section.body].join("\n\n"))
    .join("\n\n\n");
}

export function buildCreativeBriefMarkdown(snapshot: CreativeDirectionSnapshot): string {
  const sections = buildBriefSections(snapshot);
  const providerLabel = snapshot.provider ?? snapshot.aiProvider;

  return [
    `# Creative Direction Brief`,
    "",
    `- Concept: ${snapshot.seed}`,
    `- Exported: ${new Date(snapshot.savedAt).toLocaleString()}`,
    `- Model Source: ${providerLabel}`,
    "",
    ...sections.flatMap((section) => [
      `## ${section.title}`,
      "",
      ...section.body,
      "",
    ]),
  ].join("\n");
}

export function buildProductionPrompts(snapshot: CreativeDirectionSnapshot): ExportPrompt[] {
  const core = readCore(snapshot.sections);
  const narratives = readNarratives(snapshot.sections);
  const visual = readVisual(snapshot.sections);
  const spatial = readSpatial(snapshot.sections);
  const sound = readSound(snapshot.sections);
  const content = readContent(snapshot.sections);
  const execution = readExecution(snapshot.sections);

  const narrativeSummary = narratives?.directions
    .map((direction) => `${direction.title}: ${direction.explanation}`)
    .join(" ") ?? "";

  return [
    {
      id: "visual-prompt",
      title: "Visual Prompt",
      category: "Visual generation prompt",
      prompt: [
        `Create a cinematic visual world for \"${snapshot.seed}\".`,
        core ? `Anchor the imagery in the thesis: ${core.thesis}` : "",
        visual ? `Use a palette of ${joinList(visual.palette)} with ${joinList(visual.textures)} textures.` : "",
        visual ? `Lighting should feel ${visual.lighting}. Framing should follow ${visual.framing}.` : "",
        spatial ? `Stage the scenes in ${joinList(spatial.environments)} with a mood of ${spatial.mood}.` : "",
        sound ? `The emotional tempo should feel like ${joinList(sound.genres)} with ${joinList(sound.textures)} sonic cues translated into image rhythm.` : "",
        "Deliver language that is specific, tactile, editorial, and campaign-ready rather than abstract.",
      ].filter(Boolean).join(" "),
    },
    {
      id: "campaign-shoot-prompt",
      title: "Campaign Shoot Prompt",
      category: "Shoot direction prompt",
      prompt: [
        `Develop a campaign shoot direction for \"${snapshot.seed}\".`,
        core ? `The emotional stance is ${core.mood}.` : "",
        execution ? `The shoot should ladder into these campaign ideas: ${joinList(execution.campaigns)}.` : "",
        execution ? `Include the following shoot concepts: ${joinList(execution.shootConcepts)}.` : "",
        visual ? `Art direct wardrobe, styling, color, and framing around ${joinList(visual.palette)} and ${joinList(visual.textures)}.` : "",
        spatial ? `Use environments such as ${joinList(spatial.environments)} and keep the symbolism rooted in ${spatial.symbolism}.` : "",
        "Write as actionable direction for a photographer, stylist, and production designer.",
      ].filter(Boolean).join(" "),
    },
    {
      id: "content-system-prompt",
      title: "Content Prompt",
      category: "Social content prompt",
      prompt: [
        `Turn \"${snapshot.seed}\" into a social-first content system.`,
        content ? `Build around formats including ${joinList(content.formats)}.` : "",
        content ? `Use POV hooks such as ${joinList(content.povPrompts)}.` : "",
        content ? `Translate these ideas into repeatable series: ${joinList(content.ideas)}.` : "",
        content ? `Structure storytelling through ${joinList(content.storytelling)}.` : "",
        core ? `Keep every output aligned to the thesis: ${core.thesis}` : "",
        "Return platform-native creative prompts with clear hooks, camera language, pacing, and CTA logic.",
      ].filter(Boolean).join(" "),
    },
    {
      id: "art-direction-prompt",
      title: "Art Direction Prompt",
      category: "Styling / mood prompt",
      prompt: [
        `Write an art direction brief for \"${snapshot.seed}\".`,
        narrativeSummary ? `Narrative territory: ${narrativeSummary}` : "",
        visual ? `Define styling, set dressing, material choices, and palette using ${joinList(visual.palette)} and ${joinList(visual.textures)}.` : "",
        sound ? `Reference the sonic atmosphere of ${joinList(sound.references)} and ${joinList(sound.genres)} when describing tone.` : "",
        spatial ? `Create a world that feels ${spatial.mood} and symbolically expresses ${spatial.symbolism}.` : "",
        execution ? `Ensure the direction can support deliverables such as ${joinList(execution.assetTypes)}.` : "",
      ].filter(Boolean).join(" "),
    },
  ];
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard is not available in this environment.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function downloadMarkdown(filename: string, content: string): void {
  if (typeof document === "undefined") return;

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function createMarkdownFilename(seed: string): string {
  const slug = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);

  return `${slug || "creative-direction"}-brief.md`;
}