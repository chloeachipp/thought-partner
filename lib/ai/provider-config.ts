import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type SupportedProvider = "openai" | "anthropic";

export interface ProviderConfigResult {
  model: LanguageModel;
  provider: SupportedProvider;
  modelName: string;
}

function normalizeProvider(value: string | undefined): SupportedProvider {
  return value?.toLowerCase() === "anthropic" ? "anthropic" : "openai";
}

export function getProviderConfig(preferredProvider?: SupportedProvider): ProviderConfigResult | null {
  const provider = preferredProvider ?? normalizeProvider(process.env.AI_PROVIDER);

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const modelName = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest";

    if (!apiKey) {
      return null;
    }

    const anthropic = createAnthropic({ apiKey });
    return {
      model: anthropic(modelName),
      provider,
      modelName,
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const modelName = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    return null;
  }

  const openai = createOpenAI({ apiKey });
  return {
    model: openai(modelName),
    provider,
    modelName,
  };
}
