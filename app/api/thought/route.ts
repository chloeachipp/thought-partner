import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateMockCreativeDirection, generateMockSectionExpand } from "@/lib/ai/mock-generator";
import { buildInitialPrompt, buildExpandPrompt } from "@/lib/ai/prompt-builders";
import { getProviderConfig } from "@/lib/ai/provider-config";
import type {
  CoreThesisContent,
  NarrativesContent,
  VisualWorldContent,
  SpatialWorldContent,
  SoundWorldContent,
  ContentSystemContent,
  ExecutionContent,
  SectionId,
  CreativeMode,
} from "@/types/thought";

// ── Zod schemas ─────────────────────────────────────────────────────────────

const creativeModeSchema = z.enum(["concept", "visual", "emotional"]);

const sectionIdSchema = z.enum([
  "core", "narratives", "visual", "spatial", "sound", "content", "execution",
]);

const requestSchema = z.union([
  z.object({
    mode: z.literal("initial"),
    seed: z.string().min(1),
    creativeMode: creativeModeSchema.optional(),
  }),
  z.object({
    mode: z.literal("expand"),
    sectionId: sectionIdSchema,
    seed: z.string().min(1),
    existingContext: z.string(),
    creativeMode: creativeModeSchema.optional(),
  }),
]);

// ── Output schemas for generateObject ───────────────────────────────────────

const coreSchema = z.object({
  thesis: z.string(),
  mood: z.string(),
});

const narrativeSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  resonance: z.string(),
});

const narrativesSchema = z.object({
  directions: z.array(narrativeSchema).min(1).max(5),
});

const visualSchema = z.object({
  palette: z.array(z.string()).min(3),
  textures: z.array(z.string()).min(2),
  lighting: z.string(),
  framing: z.string(),
});

const spatialSchema = z.object({
  environments: z.array(z.string()).min(2),
  mood: z.string(),
  symbolism: z.string(),
});

const soundSchema = z.object({
  genres: z.array(z.string()).min(2),
  textures: z.array(z.string()).min(2),
  references: z.array(z.string()).min(1),
});

const contentSchema = z.object({
  formats: z.array(z.string()).min(2),
  povPrompts: z.array(z.string()).min(2),
  ideas: z.array(z.string()).min(2),
  storytelling: z.array(z.string()).min(1),
});

const executionSchema = z.object({
  campaigns: z.array(z.string()).min(1),
  shootConcepts: z.array(z.string()).min(1),
  assetTypes: z.array(z.string()).min(2),
});

const fullDeckSchema = z.object({
  core: coreSchema,
  narratives: narrativesSchema,
  visual: visualSchema,
  spatial: spatialSchema,
  sound: soundSchema,
  content: contentSchema,
  execution: executionSchema,
});

// Map section IDs to their schemas for expand calls
const SECTION_SCHEMAS: Record<SectionId, z.ZodType> = {
  core: coreSchema,
  narratives: narrativesSchema,
  visual: visualSchema,
  spatial: spatialSchema,
  sound: soundSchema,
  content: contentSchema,
  execution: executionSchema,
};

// ── Response types ──────────────────────────────────────────────────────────

interface CreativeDirectionDeck {
  core: CoreThesisContent;
  narratives: NarrativesContent;
  visual: VisualWorldContent;
  spatial: SpatialWorldContent;
  sound: SoundWorldContent;
  content: ContentSystemContent;
  execution: ExecutionContent;
}

type ApiInitialResponse = {
  mode: "initial";
  deck: CreativeDirectionDeck;
  meta: { provider: string | null; fallback: boolean };
};

type ApiExpandResponse = {
  mode: "expand";
  sectionId: SectionId;
  data: unknown;
  meta: { provider: string | null; fallback: boolean };
};

type ApiSuccessResponse = ApiInitialResponse | ApiExpandResponse;
type ErrorResponse = { error: string; message?: string; details?: unknown };

type ProviderConfig = NonNullable<ReturnType<typeof getProviderConfig>>;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 24;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __thoughtRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

function getRateLimitStore(): Map<string, RateLimitEntry> {
  if (!globalThis.__thoughtRateLimitStore) {
    globalThis.__thoughtRateLimitStore = new Map<string, RateLimitEntry>();
  }
  return globalThis.__thoughtRateLimitStore;
}

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

function checkRateLimit(request: Request): NextResponse<ErrorResponse> | null {
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  const now = Date.now();
  const store = getRateLimitStore();

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }

  const clientKey = getClientKey(request);
  const current = store.get(clientKey);

  if (!current || current.resetAt <= now) {
    store.set(clientKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return null;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json<ErrorResponse>(
      {
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again shortly.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
        },
      },
    );
  }

  current.count += 1;
  store.set(clientKey, current);
  return null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function isRecoverableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const text = `${error.name} ${error.message}`.toLowerCase();
  return [
    "timeout", "timed out", "rate", "429", "network",
    "503", "502", "504", "overloaded", "temporarily",
    "unavailable", "noobjectgenerated",
  ].some((t) => text.includes(t));
}

// ── Generation ──────────────────────────────────────────────────────────────

async function generateFullDeck(
  config: ProviderConfig,
  seed: string,
  creativeMode?: CreativeMode,
): Promise<ApiInitialResponse> {
  const { object } = await generateObject({
    model: config.model,
    schema: fullDeckSchema,
    temperature: 0.72,
    prompt: buildInitialPrompt(seed, creativeMode),
  });

  return {
    mode: "initial",
    deck: object as CreativeDirectionDeck,
    meta: { provider: `${config.provider}:${config.modelName}`, fallback: false },
  };
}

async function generateSectionExpand(
  config: ProviderConfig,
  sectionId: SectionId,
  seed: string,
  existingContext: string,
  creativeMode?: CreativeMode,
): Promise<ApiExpandResponse> {
  const schema = SECTION_SCHEMAS[sectionId];

  const { object } = await generateObject({
    model: config.model,
    schema,
    temperature: 0.72,
    prompt: buildExpandPrompt(sectionId, seed, existingContext, creativeMode),
  });

  return {
    mode: "expand",
    sectionId,
    data: object,
    meta: { provider: `${config.provider}:${config.modelName}`, fallback: false },
  };
}

// ── POST handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const rateLimitResponse = checkRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ErrorResponse>(
        { error: "Invalid request payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const config = getProviderConfig();

    if (parsed.data.mode === "initial") {
      const { seed, creativeMode } = parsed.data;

      if (config) {
        try {
          const response = await generateFullDeck(config, seed, creativeMode);
          return NextResponse.json<ApiSuccessResponse>(response);
        } catch (err) {
          if (!isRecoverableError(err)) throw err;
        }
      }

      // Fallback
      const deck = generateMockCreativeDirection(seed);
      return NextResponse.json<ApiSuccessResponse>({
        mode: "initial",
        deck,
        meta: { provider: null, fallback: true },
      });
    }

    // Expand mode
    const { sectionId, seed, existingContext, creativeMode } = parsed.data;

    if (config) {
      try {
        const response = await generateSectionExpand(config, sectionId, seed, existingContext, creativeMode);
        return NextResponse.json<ApiSuccessResponse>(response);
      } catch (err) {
        if (!isRecoverableError(err)) throw err;
      }
    }

    // Fallback
    const data = generateMockSectionExpand(sectionId, seed);
    return NextResponse.json<ApiSuccessResponse>({
      mode: "expand",
      sectionId,
      data,
      meta: { provider: null, fallback: true },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json<ErrorResponse>(
      { error: "Generation failed", message },
      { status: 500 },
    );
  }
}
