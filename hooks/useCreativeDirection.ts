"use client";

import { useCallback, useRef, useState } from "react";
import type {
  CreativeMode,
  SectionData,
  SectionId,
  StructuredSectionContent,
  CoreThesisContent,
  NarrativesContent,
  VisualWorldContent,
  SpatialWorldContent,
  SoundWorldContent,
  ContentSystemContent,
  ExecutionContent,
} from "@/types/thought";
import { DIRECTION_SECTIONS } from "@/types/thought";
import { generateMockCreativeDirection } from "@/lib/ai/mock-generator";

type Phase = "hero" | "loading" | "workspace";

export interface UseCreativeDirectionReturn {
  phase: Phase;
  seed: string;
  activeSection: SectionId;
  sections: Record<SectionId, SectionData>;
  generationMode: "fallback" | "provider";
  provider: string | null;
  isGenerating: boolean;
  setActiveSection: (id: SectionId) => void;
  submitSeed: (text: string, creativeMode?: CreativeMode) => Promise<void>;
  expandSection: (sectionId: SectionId, creativeMode?: CreativeMode) => Promise<void>;
  reset: () => void;
}

function emptySections(): Record<SectionId, SectionData> {
  const map = {} as Record<SectionId, SectionData>;
  for (const s of DIRECTION_SECTIONS) {
    map[s.id] = { content: null, loading: false };
  }
  return map;
}

function serializeContext(secs: Record<SectionId, SectionData>): string {
  const parts: string[] = [];
  for (const sec of DIRECTION_SECTIONS) {
    const data = secs[sec.id];
    if (data?.content) {
      parts.push(`${sec.label}: ${JSON.stringify(data.content.data)}`);
    }
  }
  return parts.join("\n\n");
}

export function useCreativeDirection(): UseCreativeDirectionReturn {
  const [phase, setPhase] = useState<Phase>("hero");
  const [seed, setSeed] = useState("");
  const [activeSection, setActiveSection] = useState<SectionId>("core");
  const [sections, setSections] = useState<Record<SectionId, SectionData>>(emptySections);
  const [generationMode, setGenerationMode] = useState<"fallback" | "provider">("fallback");
  const [provider, setProvider] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const pendingRef = useRef(false);

  const submitSeed = useCallback(async (text: string, creativeMode?: CreativeMode) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setSeed(text.trim());
    setPhase("loading");
    setIsGenerating(true);

    try {
      let deck: {
        core: CoreThesisContent;
        narratives: NarrativesContent;
        visual: VisualWorldContent;
        spatial: SpatialWorldContent;
        sound: SoundWorldContent;
        content: ContentSystemContent;
        execution: ExecutionContent;
      };
      let fallback = true;
      let providerUsed: string | null = null;

      try {
        const response = await fetch("/api/thought", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "initial", seed: text, creativeMode }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.deck) {
            deck = data.deck;
            fallback = data.meta?.fallback ?? true;
            providerUsed = data.meta?.provider ?? null;
          } else {
            deck = generateMockCreativeDirection(text);
          }
        } else {
          deck = generateMockCreativeDirection(text);
        }
      } catch {
        deck = generateMockCreativeDirection(text);
      }

      setGenerationMode(fallback ? "fallback" : "provider");
      setProvider(fallback ? null : providerUsed);

      const next = {} as Record<SectionId, SectionData>;
      next.core = { content: { type: "core", data: deck.core }, loading: false };
      next.narratives = { content: { type: "narratives", data: deck.narratives }, loading: false };
      next.visual = { content: { type: "visual", data: deck.visual }, loading: false };
      next.spatial = { content: { type: "spatial", data: deck.spatial }, loading: false };
      next.sound = { content: { type: "sound", data: deck.sound }, loading: false };
      next.content = { content: { type: "content", data: deck.content }, loading: false };
      next.execution = { content: { type: "execution", data: deck.execution }, loading: false };

      setSections(next);
      setActiveSection("core");
      setPhase("workspace");
    } finally {
      setIsGenerating(false);
      pendingRef.current = false;
    }
  }, []);

  const expandSection = useCallback(async (sectionId: SectionId, creativeMode?: CreativeMode) => {
    const current = sections[sectionId];
    if (current?.loading) return;

    setSections((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], loading: true },
    }));

    try {
      const existingContext = serializeContext(sections);

      const response = await fetch("/api/thought", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "expand",
          sectionId,
          seed,
          existingContext,
          creativeMode,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          const fb = result.meta?.fallback ?? true;
          const prov = result.meta?.provider ?? null;
          setGenerationMode(fb ? "fallback" : "provider");
          setProvider(fb ? null : prov);

          setSections((prev) => ({
            ...prev,
            [sectionId]: {
              content: { type: sectionId, data: result.data } as StructuredSectionContent,
              loading: false,
            },
          }));
          return;
        }
      }

      setSections((prev) => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], loading: false },
      }));
    } catch {
      setSections((prev) => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], loading: false },
      }));
    }
  }, [sections, seed]);

  const reset = useCallback(() => {
    setPhase("hero");
    setSeed("");
    setActiveSection("core");
    setSections(emptySections());
    setGenerationMode("fallback");
    setProvider(null);
    setIsGenerating(false);
    pendingRef.current = false;
  }, []);

  return {
    phase,
    seed,
    activeSection,
    sections,
    generationMode,
    provider,
    isGenerating,
    setActiveSection,
    submitSeed,
    expandSection,
    reset,
  };
}
