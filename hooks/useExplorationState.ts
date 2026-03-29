"use client";

import { useCallback, useRef, useState } from "react";
import type {
  CreativeMode,
  CreativeVertical,
  NodeContent,
  NodeKind,
  PerspectiveType,
} from "@/types/thought";
import {
  generateInitialVerticalWorld,
  generateMockVerticalExpansion,
} from "@/lib/ai/mock-generator";

export interface ExplorationNode {
  id: string;
  label: string;
  description: string;
  kind: NodeKind;
  vertical: CreativeVertical | null;
  perspective: PerspectiveType | null;
}

interface ExplorationSnapshot {
  currentNode: ExplorationNode;
  orbitNodes: ExplorationNode[];
}

export interface ExplorationState {
  currentNode: ExplorationNode;
  parentPath: ExplorationNode[];
  orbitNodes: ExplorationNode[];
  history: ExplorationSnapshot[];
  generationMode: "fallback" | "provider";
  provider: string | null;
}

type Phase = "hero" | "submitting" | "canvas";

export interface UseExplorationReturn {
  phase: Phase;
  state: ExplorationState | null;
  isGenerating: boolean;
  generationMode: "fallback" | "provider";
  provider: string | null;
  submitSeed: (text: string, creativeMode?: CreativeMode) => Promise<void>;
  navigateTo: (node: ExplorationNode, creativeMode?: CreativeMode) => Promise<void>;
  navigateBack: () => void;
  reset: () => void;
  transitioning: boolean;
  transitionDir: "forward" | "back";
}

let idCounter = 0;
function uid(prefix = "node"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Date.now().toString(36)}`;
}

function contentToNode(content: NodeContent): ExplorationNode {
  return {
    id: uid(content.vertical ?? content.kind),
    label: content.label,
    description: content.description,
    kind: content.kind,
    vertical: content.vertical ?? null,
    perspective: content.perspective,
  };
}

function createSeedNode(text: string): ExplorationNode {
  return {
    id: uid("seed"),
    label: text.trim(),
    description: "",
    kind: "seed",
    vertical: null,
    perspective: null,
  };
}

async function fetchOrbitNodes(
  mode: "initial" | "expand",
  payload: Record<string, unknown>,
): Promise<{ nodes: NodeContent[]; fallback: boolean; provider: string | null }> {
  try {
    const response = await fetch("/api/thought", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const meta = data.meta ?? data.status ?? {};

    return {
      nodes: Array.isArray(data.nodes) ? (data.nodes as NodeContent[]) : [],
      fallback: Boolean(meta.fallbackUsed ?? meta.fallback ?? true),
      provider: meta.providerUsed ?? meta.provider ?? null,
    };
  } catch {
    return {
      nodes: [],
      fallback: true,
      provider: null,
    };
  }
}

function buildInitialOrbit(seed: string): NodeContent[] {
  return generateInitialVerticalWorld(seed);
}

function buildExpandOrbit(label: string, vertical: CreativeVertical): NodeContent[] {
  return generateMockVerticalExpansion(label, vertical, 6);
}

export function useExplorationState(): UseExplorationReturn {
  const [phase, setPhase] = useState<Phase>("hero");
  const [state, setState] = useState<ExplorationState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionDir, setTransitionDir] = useState<"forward" | "back">("forward");
  const [generationMode, setGenerationMode] = useState<"fallback" | "provider">("fallback");
  const [provider, setProvider] = useState<string | null>(null);

  const pendingRef = useRef(false);

  const doTransition = useCallback((dir: "forward" | "back", updater: () => void) => {
    setTransitionDir(dir);
    setTransitioning(true);
    setTimeout(() => {
      updater();
      setTransitioning(false);
    }, 320);
  }, []);

  const submitSeed = useCallback(async (text: string, creativeMode?: CreativeMode) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPhase("submitting");
    setIsGenerating(true);

    try {
      const { nodes: fetched, fallback, provider: providerUsed } = await fetchOrbitNodes("initial", {
        mode: "initial",
        seed: text,
        nearbyNodes: [],
        creativeMode,
      });

      const orbitContents = fetched.length > 0 ? fetched.slice(0, 7) : buildInitialOrbit(text);
      const currentNode = createSeedNode(text);
      const orbitNodes = orbitContents.map(contentToNode);

      setGenerationMode(fallback ? "fallback" : "provider");
      setProvider(fallback ? null : providerUsed);
      setTransitionDir("forward");
      setTransitioning(false);
      setState({
        currentNode,
        parentPath: [],
        orbitNodes,
        history: [],
        generationMode: fallback ? "fallback" : "provider",
        provider: fallback ? null : providerUsed,
      });
      setPhase("canvas");
    } finally {
      setIsGenerating(false);
      pendingRef.current = false;
    }
  }, []);

  const navigateTo = useCallback(async (node: ExplorationNode, creativeMode?: CreativeMode) => {
    if (pendingRef.current || !state || !node.vertical) return;
    pendingRef.current = true;
    setTransitioning(true);
    setTransitionDir("forward");
    setIsGenerating(true);

    try {
      const nearbyNodes = state.orbitNodes.map((orbitNode) => ({
        label: orbitNode.label,
        kind: orbitNode.kind,
        vertical: orbitNode.vertical,
        perspective: orbitNode.perspective,
      }));

      const { nodes: fetched, fallback, provider: providerUsed } = await fetchOrbitNodes("expand", {
        mode: "expand",
        label: node.label,
        vertical: node.vertical,
        nearbyNodes,
        creativeMode,
      });

      const orbitContents = fetched.length >= 4
        ? fetched.slice(0, 6)
        : buildExpandOrbit(node.label, node.vertical);
      const orbitNodes = orbitContents.map(contentToNode);

      setGenerationMode(fallback ? "fallback" : "provider");
      setProvider(fallback ? null : providerUsed);

      setTimeout(() => {
        setState((current) => {
          if (!current) return current;
          return {
            currentNode: node,
            parentPath: [...current.parentPath, current.currentNode],
            orbitNodes,
            history: [...current.history, {
              currentNode: current.currentNode,
              orbitNodes: current.orbitNodes,
            }],
            generationMode: fallback ? "fallback" : "provider",
            provider: fallback ? null : providerUsed,
          };
        });
        setTransitioning(false);
        setIsGenerating(false);
        pendingRef.current = false;
      }, 320);
    } catch {
      setTransitioning(false);
      setIsGenerating(false);
      pendingRef.current = false;
    }
  }, [state]);

  const navigateBack = useCallback(() => {
    if (!state || state.history.length === 0) return;

    doTransition("back", () => {
      setState((current) => {
        if (!current || current.history.length === 0) return current;
        const history = [...current.history];
        const previous = history.pop();
        if (!previous) return current;

        return {
          ...current,
          currentNode: previous.currentNode,
          orbitNodes: previous.orbitNodes,
          parentPath: current.parentPath.slice(0, -1),
          history,
        };
      });
    });
  }, [doTransition, state]);

  const reset = useCallback(() => {
    doTransition("back", () => {
      setState(null);
      setPhase("hero");
      setIsGenerating(false);
      setGenerationMode("fallback");
      setProvider(null);
    });
  }, [doTransition]);

  return {
    phase,
    state,
    isGenerating,
    generationMode,
    provider,
    submitSeed,
    navigateTo,
    navigateBack,
    reset,
    transitioning,
    transitionDir,
  };
}
