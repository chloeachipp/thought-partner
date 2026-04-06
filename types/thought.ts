export type PerspectiveType =
  | "user"
  | "business"
  | "ethical"
  | "technical"
  | "creative";

export const CREATIVE_VERTICALS = [
  "Culture",
  "Visual",
  "Sound",
  "Space",
  "Digital",
  "Emotion",
  "Narrative",
] as const;

export type CreativeVertical = (typeof CREATIVE_VERTICALS)[number];

export type NodeKind = "seed" | "related" | "challenge" | "perspective";

export type GenerationMode = "provider" | "fallback" | "manual";

export type ThoughtRequestMode = "initial" | "expand" | "challenge" | "perspective" | "direction";

export type EdgeRelation = "expands" | "challenges" | "reframes";

export type CreativeMode = "concept" | "visual" | "emotional";
export type AIProviderChoice = "openai" | "anthropic";

export interface ThoughtNode {
  id: string;
  label: string;
  description: string;
  kind: NodeKind;
  vertical?: CreativeVertical | null;
  perspective: PerspectiveType | null;
  x: number;
  y: number;
  parentId: string | null;
  depth: number;
}

export interface ThoughtEdge {
  id: string;
  source: string;
  target: string;
  relation: EdgeRelation;
}

export type ConfidenceLevel = "low" | "medium" | "high";

export interface AIMetadata {
  tone: string;
  confidence: ConfidenceLevel;
}

export interface ThoughtGraphMeta {
  generationMode: GenerationMode;
  provider: string | null;
  fallback: boolean;
}

export interface ThoughtStatusMeta {
  providerUsed: string | null;
  fallbackUsed: boolean;
  mode: ThoughtRequestMode;
}

// Content-only nodes (used by mock generator and API responses)
export interface NodeContent {
  label: string;
  description: string;
  kind: NodeKind;
  vertical?: CreativeVertical | null;
  perspective: PerspectiveType | null;
}

export interface ThoughtGraphResponse {
  seed: NodeContent;
  related: NodeContent[];
  challenge: NodeContent;
  perspectives: NodeContent[];
  aiMeta?: AIMetadata;
  meta?: ThoughtGraphMeta;
}

export interface CanvasNode extends ThoughtNode {
  delay: number;
}

export type ThoughtNodeType = NodeKind;
export type NodeData = CanvasNode;
// ── Creative Direction Sections ─────────────────────────────────────────────

export interface DirectionSection {
  id: SectionId;
  label: string;
}

export type SectionId =
  | "core"
  | "narratives"
  | "visual"
  | "spatial"
  | "sound"
  | "content"
  | "execution";

export const DIRECTION_SECTIONS: readonly DirectionSection[] = [
  { id: "core",       label: "Core Thesis" },
  { id: "narratives", label: "Narratives" },
  { id: "visual",     label: "Visual World" },
  { id: "spatial",    label: "Spatial World" },
  { id: "sound",      label: "Sound World" },
  { id: "content",    label: "Content System" },
  { id: "execution",  label: "Execution" },
] as const;

// ── Per-section structured content ──────────────────────────────────────────

export interface CoreThesisContent {
  thesis: string;         // 1–2 sentence emotional summary
  mood: string;           // e.g. "quiet defiance", "tender unease"
}

export interface NarrativeDirection {
  title: string;          // 2–4 words
  explanation: string;    // short paragraph
  resonance: string;      // why it resonates culturally/emotionally
}

export interface NarrativesContent {
  directions: NarrativeDirection[];
}

export interface VisualWorldContent {
  palette: string[];      // colour descriptors
  textures: string[];     // materials, surfaces
  lighting: string;       // lighting style
  framing: string;        // camera / framing style
}

export interface SpatialWorldContent {
  environments: string[]; // locations / environments
  mood: string;           // spatial mood
  symbolism: string;      // symbolic meaning
}

export interface SoundWorldContent {
  genres: string[];       // music genres or moods
  textures: string[];     // sonic textures
  references: string[];   // ambient references
}

export interface ContentSystemContent {
  formats: string[];      // TikTok / social formats
  povPrompts: string[];   // POV prompts
  ideas: string[];        // content ideas
  storytelling: string[]; // storytelling formats
}

export interface ExecutionContent {
  campaigns: string[];    // campaign ideas
  shootConcepts: string[];// shoot concepts
  assetTypes: string[];   // video, stills, etc.
}

export type StructuredSectionContent =
  | { type: "core"; data: CoreThesisContent }
  | { type: "narratives"; data: NarrativesContent }
  | { type: "visual"; data: VisualWorldContent }
  | { type: "spatial"; data: SpatialWorldContent }
  | { type: "sound"; data: SoundWorldContent }
  | { type: "content"; data: ContentSystemContent }
  | { type: "execution"; data: ExecutionContent };

export interface SectionData {
  content: StructuredSectionContent | null;
  loading: boolean;
}