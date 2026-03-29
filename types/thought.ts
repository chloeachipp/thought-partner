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
