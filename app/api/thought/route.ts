import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateInitialMockGraph,
  generateInitialVerticalWorld,
  generateMockVerticalExpansion,
  generateMockVerticalNode,
} from "@/lib/ai/mock-generator";
import { buildExpandPrompt, buildInitialPrompt } from "@/lib/ai/prompt-builders";
import { getProviderConfig } from "@/lib/ai/provider-config";
import {
  CREATIVE_VERTICALS,
  type CreativeMode,
  type CreativeVertical,
  type GenerationMode,
  type NodeContent,
  type PerspectiveType,
  type ThoughtGraphMeta,
  type ThoughtGraphResponse,
  type ThoughtRequestMode,
  type ThoughtStatusMeta,
} from "@/types/thought";

const creativeVerticalSchema = z.enum(CREATIVE_VERTICALS);
const perspectiveTypeSchema = z.enum(["user", "business", "ethical", "technical", "creative"]);
const legacyInteractionSchema = z.enum(["expands", "challenges", "reframes"]);
const modeSchema = z.enum(["initial", "expand", "challenge", "perspective", "direction"]);
const creativeModeSchema = z.enum(["concept", "visual", "emotional"]);

const nearbyNodeSchema = z.object({
  label: z.string(),
  kind: z.string().optional(),
  vertical: creativeVerticalSchema.nullable().optional(),
  perspective: perspectiveTypeSchema.nullable().optional(),
});

const requestSchema = z.union([
  z.object({
    mode: modeSchema,
    seed: z.string().optional(),
    label: z.string().optional(),
    vertical: creativeVerticalSchema.optional(),
    nearbyNodes: z.array(nearbyNodeSchema).optional(),
    creativeMode: creativeModeSchema.optional(),
  }),
  z.object({
    mode: z.literal("seed"),
    seed: z.string(),
    nearbyNodes: z.array(nearbyNodeSchema).optional(),
    creativeMode: creativeModeSchema.optional(),
  }),
  z.object({
    mode: z.literal("interaction"),
    interaction: legacyInteractionSchema,
    label: z.string(),
    vertical: creativeVerticalSchema.optional(),
    nearbyNodes: z.array(nearbyNodeSchema).optional(),
    creativeMode: creativeModeSchema.optional(),
  }),
]);

const initialNodeOutputSchema = z.object({
  vertical: creativeVerticalSchema,
  label: z.string(),
  description: z.string(),
});

const expandNodeOutputSchema = z.object({
  label: z.string(),
  description: z.string(),
});

const initialOutputSchema = z.object({
  nodes: z.array(initialNodeOutputSchema).min(7).max(10),
});

const expandOutputSchema = z.object({
  nodes: z.array(expandNodeOutputSchema).min(4).max(8),
});

type ApiInitialResponse = {
  mode: "initial";
  nodes: NodeContent[];
  graph: ThoughtGraphResponse;
  status: ThoughtStatusMeta;
  meta: ThoughtGraphMeta;
};

type ApiExpandResponse = {
  mode: Exclude<ThoughtRequestMode, "initial">;
  nodes: NodeContent[];
  node: NodeContent;
  vertical: CreativeVertical;
  status: ThoughtStatusMeta;
  meta: ThoughtGraphMeta;
};

type ApiSuccessResponse = ApiInitialResponse | ApiExpandResponse;

type ErrorResponse = {
  error: string;
  message?: string;
  details?: unknown;
};

type ProviderConfig = NonNullable<ReturnType<typeof getProviderConfig>>;

type NearbyNode = z.infer<typeof nearbyNodeSchema>;

type NormalizedRequest = {
  mode: ThoughtRequestMode;
  seed?: string;
  selectedLabel?: string;
  selectedVertical?: CreativeVertical;
  nearbyNodes?: NearbyNode[];
  creativeMode?: CreativeMode;
};

function toGenerationMode(fallbackUsed: boolean): GenerationMode {
  return fallbackUsed ? "fallback" : "provider";
}

function createStatus(
  mode: ThoughtRequestMode,
  providerUsed: string | null,
  fallbackUsed: boolean,
): ThoughtStatusMeta {
  return {
    providerUsed,
    fallbackUsed,
    mode,
  };
}

function toMeta(status: ThoughtStatusMeta): ThoughtGraphMeta {
  return {
    generationMode: toGenerationMode(status.fallbackUsed),
    provider: status.providerUsed,
    fallback: status.fallbackUsed,
  };
}

function toNodeContent(
  input: { label: string; description?: string },
  vertical: CreativeVertical | null,
): NodeContent {
  return {
    label: input.label.trim(),
    description: (input.description ?? "").trim(),
    kind: "related",
    vertical,
    perspective: null,
  };
}

function toLegacyGraph(seed: string, nodes: NodeContent[], meta?: ThoughtGraphMeta): ThoughtGraphResponse {
  return {
    seed: {
      label: seed.trim(),
      description: "starting point",
      kind: "seed",
      vertical: null,
      perspective: null,
    },
    related: nodes.slice(0, 3).map((node) => ({ ...node, kind: "related" })),
    challenge: {
      ...(nodes[3] ?? nodes[0] ?? generateMockVerticalNode(seed, "Emotion")),
      kind: "challenge",
      perspective: null,
    },
    perspectives: nodes.slice(4, 7).map((node) => ({
      ...node,
      kind: "perspective",
      perspective: null,
    })),
    meta,
  };
}

function normalizeRequest(parsed: z.infer<typeof requestSchema>): NormalizedRequest {
  if (parsed.mode === "seed") {
    return {
      mode: "initial",
      seed: parsed.seed,
      nearbyNodes: parsed.nearbyNodes,
      creativeMode: parsed.creativeMode,
    };
  }

  if (parsed.mode === "interaction") {
    return {
      mode: parsed.interaction === "expands"
        ? "expand"
        : parsed.interaction === "challenges"
          ? "challenge"
          : "perspective",
      selectedLabel: parsed.label,
      selectedVertical: parsed.vertical,
      nearbyNodes: parsed.nearbyNodes,
      creativeMode: parsed.creativeMode,
    };
  }

  return {
    mode: parsed.mode,
    seed: parsed.seed,
    selectedLabel: parsed.label,
    selectedVertical: parsed.vertical,
    nearbyNodes: parsed.nearbyNodes,
    creativeMode: parsed.creativeMode,
  };
}

function validateNormalizedRequest(normalized: NormalizedRequest): string | null {
  if (normalized.mode === "initial" && !normalized.seed?.trim()) {
    return "mode 'initial' requires a non-empty seed.";
  }

  if (normalized.mode !== "initial" && !normalized.selectedLabel?.trim()) {
    return `mode '${normalized.mode}' requires a selected node label.`;
  }

  return null;
}

function resolveVertical(normalized: NormalizedRequest): CreativeVertical {
  if (normalized.selectedVertical) {
    return normalized.selectedVertical;
  }

  const nearbyMatch = normalized.nearbyNodes?.find(
    (node) => node.label === normalized.selectedLabel && node.vertical,
  );

  return nearbyMatch?.vertical ?? "Narrative";
}

function normalizeInitialNodes(seed: string, rawNodes: Array<z.infer<typeof initialNodeOutputSchema>>): NodeContent[] {
  const usedLabels = new Set<string>();
  const byVertical = new Map<CreativeVertical, NodeContent>();

  for (const node of rawNodes) {
    if (byVertical.has(node.vertical)) continue;
    const label = node.label.trim();
    if (!label || usedLabels.has(label.toLowerCase())) continue;
    usedLabels.add(label.toLowerCase());
    byVertical.set(node.vertical, toNodeContent(node, node.vertical));
  }

  return CREATIVE_VERTICALS.map((vertical) => {
    const existing = byVertical.get(vertical);
    return existing ?? generateMockVerticalNode(seed, vertical, usedLabels);
  });
}

function normalizeExpandNodes(
  label: string,
  vertical: CreativeVertical,
  rawNodes: Array<z.infer<typeof expandNodeOutputSchema>>,
  count = 6,
): NodeContent[] {
  const usedLabels = new Set<string>();
  const nodes: NodeContent[] = [];

  for (const rawNode of rawNodes) {
    const trimmed = rawNode.label.trim();
    if (!trimmed || usedLabels.has(trimmed.toLowerCase())) continue;
    usedLabels.add(trimmed.toLowerCase());
    nodes.push(toNodeContent(rawNode, vertical));
    if (nodes.length >= count) break;
  }

  const fallback = generateMockVerticalExpansion(label, vertical, count);
  for (const node of fallback) {
    if (nodes.length >= count) break;
    const key = node.label.toLowerCase();
    if (usedLabels.has(key)) continue;
    usedLabels.add(key);
    nodes.push(node);
  }

  return nodes.slice(0, count);
}

function isRecoverableProviderError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const text = `${error.name} ${error.message}`.toLowerCase();
  return [
    "timeout",
    "timed out",
    "rate",
    "429",
    "network",
    "503",
    "502",
    "504",
    "overloaded",
    "temporarily",
    "unavailable",
    "noobjectgenerated",
  ].some((token) => text.includes(token));
}

function fallbackInitial(seed: string): ApiInitialResponse {
  const nodes = generateInitialVerticalWorld(seed);
  const status = createStatus("initial", null, true);
  const meta = toMeta(status);

  return {
    mode: "initial",
    nodes,
    graph: toLegacyGraph(seed, nodes, meta),
    status,
    meta,
  };
}

function fallbackExpand(mode: Exclude<ThoughtRequestMode, "initial">, label: string, vertical: CreativeVertical): ApiExpandResponse {
  const nodes = generateMockVerticalExpansion(label, vertical, 6);
  const status = createStatus(mode, null, true);

  return {
    mode,
    nodes,
    node: nodes[0]!,
    vertical,
    status,
    meta: toMeta(status),
  };
}

function fallbackByMode(normalized: NormalizedRequest): ApiSuccessResponse {
  if (normalized.mode === "initial") {
    return fallbackInitial(normalized.seed ?? "");
  }

  return fallbackExpand(
    normalized.mode,
    normalized.selectedLabel ?? "",
    resolveVertical(normalized),
  );
}

async function generateInitial(
  providerConfig: ProviderConfig,
  seed: string,
  nearbyNodes?: NearbyNode[],
  creativeMode?: CreativeMode,
): Promise<ApiInitialResponse> {
  const { object } = await generateObject({
    model: providerConfig.model,
    schema: initialOutputSchema,
    temperature: 0.68,
    prompt: buildInitialPrompt(seed, nearbyNodes, creativeMode),
  });

  const nodes = normalizeInitialNodes(seed, object.nodes);
  const providerUsed = `${providerConfig.provider}:${providerConfig.modelName}`;
  const status = createStatus("initial", providerUsed, false);
  const meta = toMeta(status);

  return {
    mode: "initial",
    nodes,
    graph: toLegacyGraph(seed, nodes, meta),
    status,
    meta,
  };
}

async function generateExpand(
  providerConfig: ProviderConfig,
  mode: Exclude<ThoughtRequestMode, "initial">,
  selectedLabel: string,
  selectedVertical: CreativeVertical,
  nearbyNodes?: NearbyNode[],
  creativeMode?: CreativeMode,
): Promise<ApiExpandResponse> {
  const { object } = await generateObject({
    model: providerConfig.model,
    schema: expandOutputSchema,
    temperature: 0.72,
    prompt: buildExpandPrompt(selectedLabel, selectedVertical, nearbyNodes, creativeMode),
  });

  const nodes = normalizeExpandNodes(selectedLabel, selectedVertical, object.nodes, 6);
  const providerUsed = `${providerConfig.provider}:${providerConfig.modelName}`;
  const status = createStatus(mode, providerUsed, false);

  return {
    mode,
    nodes,
    node: nodes[0]!,
    vertical: selectedVertical,
    status,
    meta: toMeta(status),
  };
}

async function generateWithProvider(
  providerConfig: ProviderConfig,
  normalized: NormalizedRequest,
): Promise<ApiSuccessResponse> {
  if (normalized.mode === "initial") {
    return generateInitial(
      providerConfig,
      normalized.seed ?? "",
      normalized.nearbyNodes,
      normalized.creativeMode,
    );
  }

  return generateExpand(
    providerConfig,
    normalized.mode,
    normalized.selectedLabel ?? "",
    resolveVertical(normalized),
    normalized.nearbyNodes,
    normalized.creativeMode,
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const normalized = normalizeRequest(parsed.data);
    const requestError = validateNormalizedRequest(normalized);

    if (requestError) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Invalid request payload",
          message: requestError,
        },
        { status: 400 },
      );
    }

    const providerConfig = getProviderConfig();

    if (!providerConfig) {
      return NextResponse.json<ApiSuccessResponse>(fallbackByMode(normalized));
    }

    try {
      const response = await generateWithProvider(providerConfig, normalized);
      return NextResponse.json<ApiSuccessResponse>(response);
    } catch (providerError) {
      if (isRecoverableProviderError(providerError)) {
        return NextResponse.json<ApiSuccessResponse>(fallbackByMode(normalized));
      }
      throw providerError;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json<ErrorResponse>(
      {
        error: "Generation failed",
        message,
      },
      { status: 500 },
    );
  }
}
