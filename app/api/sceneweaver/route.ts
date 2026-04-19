import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildSceneWeaverPrompt } from "@/lib/ai/sceneweaver-prompts";
import { generateMockSceneWeaver } from "@/lib/ai/sceneweaver-mock";
import {
  sceneWeaverOutputSchema,
  normalizeSceneWeaverResult,
} from "@/lib/ai/sceneweaver-schema";
import { getProviderConfig } from "@/lib/ai/provider-config";
import type { RefinementAction } from "@/types/sceneweaver";
import type { SupportedProvider } from "@/lib/ai/provider-config";

// ── Request validation ──────────────────────────────────────────────────────

const refinementSchema = z.enum([
  "darker",
  "more-intimate",
  "more-surreal",
  "adapt-music-video",
  "adapt-short-film",
  "reweave",
]);

const providerSchema = z.enum(["openai", "anthropic"]);

const requestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  refinement: refinementSchema.optional(),
  existingContext: z.string().optional(),
  provider: providerSchema.optional(),
});

// ── Rate limiting (shared pattern with thought route) ───────────────────────

type RateLimitEntry = { count: number; resetAt: number };

declare global {
  // eslint-disable-next-line no-var
  var __sceneweaverRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

function getRateLimitStore(): Map<string, RateLimitEntry> {
  if (!globalThis.__sceneweaverRateLimitStore) {
    globalThis.__sceneweaverRateLimitStore = new Map();
  }
  return globalThis.__sceneweaverRateLimitStore;
}

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip;
  }
  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}

function checkRateLimit(request: Request): NextResponse | null {
  if (process.env.NODE_ENV === "development") return null;

  const now = Date.now();
  const store = getRateLimitStore();

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key);
  }

  const clientKey = getClientKey(request);
  const current = store.get(clientKey);

  if (!current || current.resetAt <= now) {
    store.set(clientKey, { count: 1, resetAt: now + 60_000 });
    return null;
  }

  if (current.count >= 16) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Rate limit exceeded", message: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  current.count += 1;
  return null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function isRecoverableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const text = `${error.name} ${error.message}`.toLowerCase();
  return ["timeout", "rate", "429", "network", "503", "502", "504", "overloaded", "unavailable", "noobjectgenerated"]
    .some((t) => text.includes(t));
}

// ── POST handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const rateLimitResponse = checkRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { prompt, refinement, existingContext, provider: requestedProvider } = parsed.data;
    const config = getProviderConfig(requestedProvider as SupportedProvider | undefined);

    if (config) {
      try {
        const aiPrompt = buildSceneWeaverPrompt(
          prompt,
          refinement as RefinementAction | undefined,
          existingContext,
        );

        const { object } = await generateObject({
          model: config.model,
          schema: sceneWeaverOutputSchema,
          temperature: 0.76,
          prompt: aiPrompt,
        });

        const result = normalizeSceneWeaverResult(object, prompt);

        return NextResponse.json({
          result,
          meta: { provider: `${config.provider}:${config.modelName}`, fallback: false },
        });
      } catch (err) {
        if (!isRecoverableError(err)) throw err;
        // Fall through to mock
      }
    }

    // Fallback to mock data
    const mock = generateMockSceneWeaver(
      prompt,
      refinement as RefinementAction | undefined,
      existingContext,
    );
    return NextResponse.json({
      result: { prompt, ...mock },
      meta: { provider: null, fallback: true },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Generation failed", message },
      { status: 500 },
    );
  }
}
