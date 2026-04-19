import { z } from "zod";
import type { SceneWeaverResult } from "@/types/sceneweaver";

// ── SceneWeaver — Zod Output Schema + Normalisation ───────────────────────
// Single source of truth for the AI output shape.
// Used by the API route with `generateObject` and for runtime validation.

// ── Section schemas ─────────────────────────────────────────────────────────

const sceneSummarySchema = z.object({
  logline: z.string(),
  emotionalCore: z.string(),
  worldIn2Words: z.string(),
});

const emotionalArcSchema = z.object({
  opening: z.string(),
  tension: z.string(),
  peak: z.string(),
  resolution: z.string(),
});

const narrativeTensionSchema = z.object({
  centralConflict: z.string(),
  subtext: z.string(),
  stakes: z.string(),
});

const visualLanguageSchema = z.object({
  dominantImagery: z.array(z.string()).min(1),
  motionQuality: z.string(),
  textureNotes: z.string(),
});

const cameraDirectionSchema = z.object({
  style: z.string(),
  keyShots: z.array(z.string()).min(1),
  movement: z.string(),
});

const lightingAndColourSchema = z.object({
  mood: z.string(),
  keyLightSources: z.array(z.string()).min(1),
  contrast: z.string(),
  palette: z.array(z.string()).min(1),
  temperature: z.string(),
  grade: z.string(),
});

const soundTextureSchema = z.object({
  ambience: z.array(z.string()).min(1),
  musicDirection: z.string(),
  silenceNotes: z.string(),
});

const pacingAndRhythmSchema = z.object({
  overallTempo: z.string(),
  editStyle: z.string(),
  breathingRoom: z.string(),
});

const motifsAndSymbolismSchema = z.object({
  motifs: z.array(z.string()).min(1),
  symbolism: z.string(),
  recurringElements: z.string(),
});

const dialogueToneSchema = z.object({
  style: z.string(),
  sampleLine: z.string(),
  silenceVsDialogue: z.string(),
});

const alternateDirectionSchema = z.object({
  title: z.string(),
  angle: z.string(),
  shift: z.string(),
});

const adaptationModeSchema = z.object({
  format: z.string(),
  description: z.string(),
  twist: z.string(),
});

// ── Full result schema (what the AI model returns) ──────────────────────────

export const sceneWeaverOutputSchema = z.object({
  title: z.string(),
  sceneSummary: sceneSummarySchema,
  emotionalArc: emotionalArcSchema,
  narrativeTension: narrativeTensionSchema,
  visualLanguage: visualLanguageSchema,
  cameraDirection: cameraDirectionSchema,
  lightingAndColour: lightingAndColourSchema,
  soundTexture: soundTextureSchema,
  pacingAndRhythm: pacingAndRhythmSchema,
  motifsAndSymbolism: motifsAndSymbolismSchema,
  dialogueTone: dialogueToneSchema,
  alternateDirections: z.array(alternateDirectionSchema).min(1),
  adaptationModes: z.array(adaptationModeSchema).min(1),
  tags: z.array(z.string()).min(1),
  followUpPrompts: z.array(z.string()).min(1),
});

export type SceneWeaverOutput = z.infer<typeof sceneWeaverOutputSchema>;

// ── Normalisation ───────────────────────────────────────────────────────────
// Ensures defensive defaults so the UI never crashes on a partial response.

function ensureStrings<T extends Record<string, unknown>>(
  obj: T | undefined,
  keys: (keyof T)[],
): T {
  const result = { ...(obj ?? {}) } as T;
  for (const key of keys) {
    if (typeof result[key] !== "string") {
      (result as Record<string, unknown>)[key as string] = "";
    }
  }
  return result;
}

function ensureStringArray(arr: unknown, min = 1): string[] {
  if (Array.isArray(arr) && arr.length >= min) return arr.map(String);
  return Array.from({ length: min }, () => "");
}

export function normalizeSceneWeaverResult(
  raw: SceneWeaverOutput,
  prompt: string,
): SceneWeaverResult {
  return {
    prompt,
    title: raw.title || "Untitled Scene",

    sceneSummary: ensureStrings(raw.sceneSummary, [
      "logline",
      "emotionalCore",
      "worldIn2Words",
    ]),

    emotionalArc: ensureStrings(raw.emotionalArc, [
      "opening",
      "tension",
      "peak",
      "resolution",
    ]),

    narrativeTension: ensureStrings(raw.narrativeTension, [
      "centralConflict",
      "subtext",
      "stakes",
    ]),

    visualLanguage: {
      dominantImagery: ensureStringArray(raw.visualLanguage?.dominantImagery, 1),
      motionQuality: raw.visualLanguage?.motionQuality ?? "",
      textureNotes: raw.visualLanguage?.textureNotes ?? "",
    },

    cameraDirection: {
      style: raw.cameraDirection?.style ?? "",
      keyShots: ensureStringArray(raw.cameraDirection?.keyShots, 1),
      movement: raw.cameraDirection?.movement ?? "",
    },

    lightingAndColour: {
      mood: raw.lightingAndColour?.mood ?? "",
      keyLightSources: ensureStringArray(raw.lightingAndColour?.keyLightSources, 1),
      contrast: raw.lightingAndColour?.contrast ?? "",
      palette: ensureStringArray(raw.lightingAndColour?.palette, 1),
      temperature: raw.lightingAndColour?.temperature ?? "",
      grade: raw.lightingAndColour?.grade ?? "",
    },

    soundTexture: {
      ambience: ensureStringArray(raw.soundTexture?.ambience, 1),
      musicDirection: raw.soundTexture?.musicDirection ?? "",
      silenceNotes: raw.soundTexture?.silenceNotes ?? "",
    },

    pacingAndRhythm: ensureStrings(raw.pacingAndRhythm, [
      "overallTempo",
      "editStyle",
      "breathingRoom",
    ]),

    motifsAndSymbolism: {
      motifs: ensureStringArray(raw.motifsAndSymbolism?.motifs, 1),
      symbolism: raw.motifsAndSymbolism?.symbolism ?? "",
      recurringElements: raw.motifsAndSymbolism?.recurringElements ?? "",
    },

    dialogueTone: ensureStrings(raw.dialogueTone, [
      "style",
      "sampleLine",
      "silenceVsDialogue",
    ]),

    alternateDirections: (raw.alternateDirections ?? []).map((d) => ({
      title: d.title ?? "",
      angle: d.angle ?? "",
      shift: d.shift ?? "",
    })),

    adaptationModes: (raw.adaptationModes ?? []).map((m) => ({
      format: m.format ?? "",
      description: m.description ?? "",
      twist: m.twist ?? "",
    })),

    tags: ensureStringArray(raw.tags, 1),
    followUpPrompts: ensureStringArray(raw.followUpPrompts, 1),
  };
}
