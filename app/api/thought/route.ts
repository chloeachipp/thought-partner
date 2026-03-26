import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateInitialMockGraph,
  generateMockChallenge,
  generateMockExpansion,
  generateMockPerspective,
} from "@/lib/ai/mock-generator";
import {
  buildChallengePrompt,
  buildExpandPrompt,
  buildInitialPrompt,
  buildPerspectivePrompt,
} from "@/lib/ai/prompt-builders";
import { getProviderConfig } from "@/lib/ai/provider-config";
import type {
  AIMetadata,
  GenerationMode,
  NodeContent,
  PerspectiveType,
  ThoughtGraphResponse,
  ThoughtGraphMeta,
  ThoughtRequestMode,
  ThoughtStatusMeta,
} from "@/types/thought";

const perspectiveTypeSchema = z.enum(["user", "business", "ethical", "technical", "creative"]);
const nodeKindSchema = z.enum(["seed", "related", "challenge", "perspective"]);
const confidenceSchema = z.enum(["low", "medium", "high"]);
const modeSchema = z.enum(["initial", "expand", "challenge", "perspective"]);

// Legacy aliases to keep existing clients working while the new contract rolls out.
const legacyInteractionSchema = z.enum(["expands", "challenges", "reframes"]);

const nearbyNodeSchema = z.object({
  label: z.string(),
  kind: z.string().optional(),
  perspective: perspectiveTypeSchema.nullable().optional(),
});

const requestSchema = z.union([
  z.object({
    mode: modeSchema,
    seed: z.string().optional(),
    label: z.string().optional(),
    nearbyNodes: z.array(nearbyNodeSchema).optional(),
  }),
  z.object({
    mode: z.literal("seed"),
    seed: z.string(),
    nearbyNodes: z.array(nearbyNodeSchema).optional(),
  }),
  z.object({
    mode: z.literal("interaction"),
    interaction: legacyInteractionSchema,
    label: z.string(),
    nearbyNodes: z.array(nearbyNodeSchema).optional(),
  }),
]);

const aiMetadataSchema = z.object({
  tone: z.string(),
  confidence: confidenceSchema,
});

const seedNodeOutputSchema = z.object({
  label: z.string(),
  description: z.string(),
});

const relatedNodeOutputSchema = z.object({
  label: z.string(),
  description: z.string(),
});

const challengeNodeOutputSchema = z.object({
  label: z.string(),
  description: z.string(),
});

const perspectiveNodeOutputSchema = z.object({
  type: perspectiveTypeSchema,
  label: z.string(),
  description: z.string(),
});

const initialOutputSchema = z.object({
  seed: seedNodeOutputSchema,
  related: z.array(relatedNodeOutputSchema),
  challenge: challengeNodeOutputSchema,
  perspectives: z.array(perspectiveNodeOutputSchema),
});

const expandOutputSchema = z.object({
  related: z.array(relatedNodeOutputSchema),
});

const challengeOutputSchema = z.object({
  challenge: challengeNodeOutputSchema,
});

const perspectiveOutputSchema = z.object({
  perspectives: z.array(perspectiveNodeOutputSchema),
});

type InitialSuccessResponse = {
  mode: "initial";
  graph: ThoughtGraphResponse;
  status: ThoughtStatusMeta;
};

type ExpandSuccessResponse = {
  mode: "expand";
  nodes: NodeContent[];
  aiMeta?: AIMetadata;
  status: ThoughtStatusMeta;
  meta: ThoughtGraphMeta;
  // Kept for legacy compatibility with current client.
  node?: NodeContent;
};

type ChallengeSuccessResponse = {
  mode: "challenge";
  node: NodeContent;
  aiMeta?: AIMetadata;
  status: ThoughtStatusMeta;
  meta: ThoughtGraphMeta;
};

type PerspectiveSuccessResponse = {
  mode: "perspective";
  nodes: NodeContent[];
  aiMeta?: AIMetadata;
  status: ThoughtStatusMeta;
  meta: ThoughtGraphMeta;
  // Kept for legacy compatibility with current client.
  node?: NodeContent;
};

type ErrorResponse = {
  error: string;
  message?: string;
  details?: unknown;
};

type ApiSuccessResponse =
  | InitialSuccessResponse
  | ExpandSuccessResponse
  | ChallengeSuccessResponse
  | PerspectiveSuccessResponse;

type ProviderConfig = NonNullable<ReturnType<typeof getProviderConfig>>;

type NormalizedRequest = {
  mode: ThoughtRequestMode;
  seed?: string;
  selectedLabel?: string;
  nearbyNodes?: Array<z.infer<typeof nearbyNodeSchema>>;
};

function toGraphNode(
  input: { label: string; description: string },
  kind: "seed" | "related" | "challenge",
): NodeContent {
  return {
    label: input.label.trim(),
    description: input.description.trim(),
    kind,
    perspective: null,
  };
}

function toPerspectiveNode(input: z.infer<typeof perspectiveNodeOutputSchema>): NodeContent {
  return {
    label: input.label.trim(),
    description: input.description.trim(),
    kind: "perspective",
    perspective: input.type,
  };
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

function toGenerationMode(fallbackUsed: boolean): GenerationMode {
  return fallbackUsed ? "fallback" : "provider";
}

function withRuntimeMeta(
  graph: ThoughtGraphResponse,
  mode: ThoughtRequestMode,
  providerUsed: string | null,
  fallbackUsed: boolean,
): ThoughtGraphResponse {
  return {
    ...graph,
    meta: {
      generationMode: toGenerationMode(fallbackUsed),
      provider: providerUsed,
      fallback: fallbackUsed,
    },
    aiMeta: graph.aiMeta,
  };
}

function toLegacyMeta(status: ThoughtStatusMeta): ThoughtGraphMeta {
  return {
    generationMode: toGenerationMode(status.fallbackUsed),
    provider: status.providerUsed,
    fallback: status.fallbackUsed,
  };
}

function normalizeRequest(parsed: z.infer<typeof requestSchema>): NormalizedRequest {
  if (parsed.mode === "seed") {
    return {
      mode: "initial",
      seed: parsed.seed,
      nearbyNodes: parsed.nearbyNodes,
    };
  }

  if (parsed.mode === "interaction") {
    const modeMap: Record<z.infer<typeof legacyInteractionSchema>, ThoughtRequestMode> = {
      expands: "expand",
      challenges: "challenge",
      reframes: "perspective",
    };

    return {
      mode: modeMap[parsed.interaction],
      selectedLabel: parsed.label,
      nearbyNodes: parsed.nearbyNodes,
    };
  }

  return {
    mode: parsed.mode,
    seed: parsed.seed,
    selectedLabel: parsed.label,
    nearbyNodes: parsed.nearbyNodes,
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

function mockExpandNodes(selectedLabel: string, count = 3): NodeContent[] {
  const nodes: NodeContent[] = [];

  for (let i = 0; i < count; i += 1) {
    nodes.push(generateMockExpansion(`${selectedLabel} ${i + 1}`));
  }

  return nodes;
}

function mockPerspectiveNodes(selectedLabel: string, count = 3): NodeContent[] {
  const nodes: NodeContent[] = [];
  const seen = new Set<PerspectiveType>();
  let attempts = 0;

  while (nodes.length < count && attempts < 16) {
    const node = generateMockPerspective(selectedLabel);
    attempts += 1;

    if (!node.perspective || seen.has(node.perspective)) {
      continue;
    }

    seen.add(node.perspective);
    nodes.push(node);
  }

  while (nodes.length < count) {
    nodes.push(generateMockPerspective(selectedLabel));
  }

  return nodes;
}

function fallbackInitial(seed: string): InitialSuccessResponse {
  const graph = generateInitialMockGraph(seed);
  const status = createStatus("initial", null, true);

  return {
    mode: "initial",
    graph: withRuntimeMeta(graph, "initial", null, true),
    status,
  };
}

function fallbackExpand(selectedLabel: string): ExpandSuccessResponse {
  const nodes = mockExpandNodes(selectedLabel, 3);
  const status = createStatus("expand", null, true);

  return {
    mode: "expand",
    nodes,
    node: nodes[0],
    status,
    meta: toLegacyMeta(status),
  };
}

function fallbackChallenge(selectedLabel: string): ChallengeSuccessResponse {
  const status = createStatus("challenge", null, true);

  return {
    mode: "challenge",
    node: generateMockChallenge(selectedLabel),
    status,
    meta: toLegacyMeta(status),
  };
}

function fallbackPerspective(selectedLabel: string): PerspectiveSuccessResponse {
  const nodes = mockPerspectiveNodes(selectedLabel, 3);
  const status = createStatus("perspective", null, true);

  return {
    mode: "perspective",
    nodes,
    node: nodes[0],
    status,
    meta: toLegacyMeta(status),
  };
}

function fallbackByMode(normalized: NormalizedRequest): ApiSuccessResponse {
  if (normalized.mode === "initial") {
    return fallbackInitial(normalized.seed ?? "");
  }

  if (normalized.mode === "expand") {
    return fallbackExpand(normalized.selectedLabel ?? "");
  }

  if (normalized.mode === "challenge") {
    return fallbackChallenge(normalized.selectedLabel ?? "");
  }

  return fallbackPerspective(normalized.selectedLabel ?? "");
}

async function generateInitial(
  providerConfig: ProviderConfig,
  seed: string,
  nearbyNodes?: Array<z.infer<typeof nearbyNodeSchema>>,
): Promise<InitialSuccessResponse> {
  const { object } = await generateObject({
    model: providerConfig.model,
    schema: initialOutputSchema,
    temperature: 0.6,
    prompt: buildInitialPrompt(seed, nearbyNodes),
  });

  const graph: ThoughtGraphResponse = {
    seed: toGraphNode(object.seed, "seed"),
    related: object.related.slice(0, 3).map((node) => toGraphNode(node, "related")),
    challenge: toGraphNode(object.challenge, "challenge"),
    perspectives: object.perspectives.slice(0, 3).map(toPerspectiveNode),
  };

  const providerUsed = `${providerConfig.provider}:${providerConfig.modelName}`;

  return {
    mode: "initial",
    graph: withRuntimeMeta(graph, "initial", providerUsed, false),
    status: createStatus("initial", providerUsed, false),
  };
}

async function generateExpand(
  providerConfig: ProviderConfig,
  selectedLabel: string,
  nearbyNodes?: Array<z.infer<typeof nearbyNodeSchema>>,
): Promise<ExpandSuccessResponse> {
  const { object } = await generateObject({
    model: providerConfig.model,
    schema: expandOutputSchema,
    temperature: 0.65,
    prompt: buildExpandPrompt(selectedLabel, nearbyNodes),
  });

  const nodes = object.related.slice(0, 3).map((node) => toGraphNode(node, "related"));
  const providerUsed = `${providerConfig.provider}:${providerConfig.modelName}`;
  const status = createStatus("expand", providerUsed, false);

  return {
    mode: "expand",
    nodes,
    node: nodes[0],
    status,
    meta: toLegacyMeta(status),
  };
}

async function generateChallenge(
  providerConfig: ProviderConfig,
  selectedLabel: string,
  nearbyNodes?: Array<z.infer<typeof nearbyNodeSchema>>,
): Promise<ChallengeSuccessResponse> {
  const { object } = await generateObject({
    model: providerConfig.model,
    schema: challengeOutputSchema,
    temperature: 0.6,
    prompt: buildChallengePrompt(selectedLabel, nearbyNodes),
  });

  const providerUsed = `${providerConfig.provider}:${providerConfig.modelName}`;
  const status = createStatus("challenge", providerUsed, false);

  return {
    mode: "challenge",
    node: toGraphNode(object.challenge, "challenge"),
    status,
    meta: toLegacyMeta(status),
  };
}

async function generatePerspective(
  providerConfig: ProviderConfig,
  selectedLabel: string,
  nearbyNodes?: Array<z.infer<typeof nearbyNodeSchema>>,
): Promise<PerspectiveSuccessResponse> {
  const { object } = await generateObject({
    model: providerConfig.model,
    schema: perspectiveOutputSchema,
    temperature: 0.7,
    prompt: buildPerspectivePrompt(selectedLabel, nearbyNodes),
  });

  const nodes = object.perspectives.slice(0, 3).map(toPerspectiveNode);
  const providerUsed = `${providerConfig.provider}:${providerConfig.modelName}`;
  const status = createStatus("perspective", providerUsed, false);

  return {
    mode: "perspective",
    nodes,
    node: nodes[0],
    status,
    meta: toLegacyMeta(status),
  };
}

async function generateWithProvider(
  providerConfig: ProviderConfig,
  normalized: NormalizedRequest,
): Promise<ApiSuccessResponse> {
  if (normalized.mode === "initial") {
    return generateInitial(providerConfig, normalized.seed ?? "", normalized.nearbyNodes);
  }

  if (normalized.mode === "expand") {
    return generateExpand(providerConfig, normalized.selectedLabel ?? "", normalized.nearbyNodes);
  }

  if (normalized.mode === "challenge") {
    return generateChallenge(providerConfig, normalized.selectedLabel ?? "", normalized.nearbyNodes);
  }

  return generatePerspective(providerConfig, normalized.selectedLabel ?? "", normalized.nearbyNodes);
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
