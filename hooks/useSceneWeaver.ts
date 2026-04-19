"use client";

import { useState, useCallback, useRef } from "react";
import type {
  SceneWeaverPhase,
  SceneWeaverResult,
  RefinementAction,
} from "@/types/sceneweaver";
import type { AIProviderChoice } from "@/types/thought";

export interface SceneWeaverState {
  phase: SceneWeaverPhase;
  result: SceneWeaverResult | null;
  compareResult: SceneWeaverResult | null;
  history: SceneWeaverResult[];
  isLoading: boolean;
  error: string | null;
  provider: AIProviderChoice;
  meta: { provider: string | null; fallback: boolean } | null;
  activeRefinement: RefinementAction | null;
  pendingRefinement: RefinementAction | null;
  resultVersion: number;
}

export function useSceneWeaver() {
  const [phase, setPhase] = useState<SceneWeaverPhase>("hero");
  const [result, setResult] = useState<SceneWeaverResult | null>(null);
  const [compareResult, setCompareResult] = useState<SceneWeaverResult | null>(null);
  const [history, setHistory] = useState<SceneWeaverResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProviderChoice>("openai");
  const [meta, setMeta] = useState<{ provider: string | null; fallback: boolean } | null>(null);
  const [activeRefinement, setActiveRefinement] = useState<RefinementAction | null>(null);
  const [pendingRefinement, setPendingRefinement] = useState<RefinementAction | null>(null);
  const [resultVersion, setResultVersion] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const weaveScene = useCallback(async (prompt: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPhase("weaving");
    setIsLoading(true);
    setError(null);
    setCompareResult(null);
    setPendingRefinement(null);
    setActiveRefinement(null);

    try {
      const res = await fetch("/api/sceneweaver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, provider }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      const newResult = data.result as SceneWeaverResult;
      setResult(newResult);
      setMeta(data.meta);
      setHistory((prev) => [...prev, newResult]);
      setResultVersion((v) => v + 1);
      setPhase("result");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("hero");
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  const refineScene = useCallback(async (refinement: RefinementAction) => {
    if (!result) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    setPendingRefinement(refinement);

    try {
      const res = await fetch("/api/sceneweaver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: result.prompt,
          refinement,
          existingContext: JSON.stringify(result),
          provider,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      const newResult = data.result as SceneWeaverResult;
      setResult(newResult);
      setMeta(data.meta);
      setHistory((prev) => [...prev, newResult]);
      setActiveRefinement(refinement);
      setResultVersion((v) => v + 1);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Refinement failed");
    } finally {
      setPendingRefinement(null);
      setIsLoading(false);
    }
  }, [result, provider]);

  const compareDirections = useCallback(() => {
    if (history.length < 2) return;
    setCompareResult(history[history.length - 2]);
    setPhase("comparing");
  }, [history]);

  const exitCompare = useCallback(() => {
    setCompareResult(null);
    setPhase("result");
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setPhase("hero");
    setResult(null);
    setCompareResult(null);
    setIsLoading(false);
    setError(null);
    setMeta(null);
    setActiveRefinement(null);
    setPendingRefinement(null);
    setResultVersion(0);
  }, []);

  return {
    phase,
    result,
    compareResult,
    history,
    isLoading,
    error,
    provider,
    meta,
    activeRefinement,
    pendingRefinement,
    resultVersion,
    setProvider,
    weaveScene,
    refineScene,
    compareDirections,
    exitCompare,
    reset,
  };
}
