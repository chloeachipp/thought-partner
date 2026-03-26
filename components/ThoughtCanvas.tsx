"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import AmbientBackground from "./AmbientBackground";
import ConnectionsSVG from "./ConnectionsSVG";
import HeroState from "./HeroState";
import SeedLoadingNode from "./SeedLoadingNode";
import ThoughtNode from "./ThoughtNode";
import {
  generateId,
  layoutChildNodes,
  layoutNodesByDepth,
  mapGraphResponseToGraph,
  relationFromNodeKind,
} from "@/lib/graph/graph-layout";
import {
  generateInitialMockGraph,
  generateMockChallenge,
  generateMockExpansion,
  generateMockPerspective,
} from "@/lib/ai/mock-generator";
import type {
  GenerationMode,
  NodeContent,
  NodeData,
  NodeKind,
  PerspectiveType,
  ThoughtEdge,
} from "@/types/thought";

type Phase = "hero" | "submitting" | "generating" | "canvas" | "transitioning";
type GenerationPhase = "related" | "challenge" | "perspective" | "complete";

type PanPoint = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

const INITIAL_NODES: NodeData[] = [
  {
    id: "node-related-1",
    label: "Hidden premise",
    description: "A quiet assumption may be steering how this idea is framed.",
    kind: "related",
    perspective: null,
    x: -410,
    y: -155,
    parentId: "seed-root",
    depth: 1,
    delay: 0.12,
  },
  {
    id: "node-challenge-1",
    label: "Reversal test",
    description: "If the opposite were true, which part of this plan would fail first?",
    kind: "challenge",
    perspective: null,
    x: 245,
    y: -215,
    parentId: "seed-root",
    depth: 1,
    delay: 0.22,
  },
  {
    id: "node-perspective-user",
    label: "User reality",
    description: "Daily constraints may reshape what seems viable from this vantage point.",
    kind: "perspective",
    perspective: "user",
    x: 385,
    y: 95,
    parentId: "seed-root",
    depth: 1,
    delay: 0.32,
  },
  {
    id: "node-related-2",
    label: "Second-order impact",
    description: "The later consequences could matter more than the immediate gain.",
    kind: "related",
    perspective: null,
    x: 45,
    y: 275,
    parentId: "seed-root",
    depth: 1,
    delay: 0.42,
  },
  {
    id: "node-perspective-ethical",
    label: "Moral trade-off",
    description: "This choice may shift risk toward people with the least margin.",
    kind: "perspective",
    perspective: "ethical",
    x: -375,
    y: 175,
    parentId: "seed-root",
    depth: 1,
    delay: 0.52,
  },
];

const COMPOSER_KINDS: NodeKind[] = ["related", "perspective", "challenge"];
const PERSPECTIVE_ROTATION: PerspectiveType[] = [
  "user",
  "business",
  "ethical",
  "technical",
  "creative",
];

const COMPOSER_OFFSETS: PanPoint[] = [
  { x: 180, y: -48 },
  { x: -210, y: 70 },
  { x: 115, y: 165 },
  { x: -145, y: -165 },
  { x: 265, y: 96 },
  { x: -280, y: -28 },
];

export default function ThoughtCanvas() {
  const [phase, setPhase] = useState<Phase>("hero");
  const [generationPhase, setGenerationPhase] = useState<GenerationPhase>("related");
  const [thought, setThought] = useState("");
  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<ThoughtEdge[]>(() =>
    INITIAL_NODES.map((node) => ({
      id: `edge-seed-root-${node.id}`,
      source: "seed-root",
      target: node.id,
      relation: relationFromNodeKind(node.kind),
    })),
  );
  const [composerValue, setComposerValue] = useState("");
  const [pan, setPan] = useState<PanPoint>({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState(true);
  const [emphasizeConnections, setEmphasizeConnections] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [runtimeMode, setRuntimeMode] = useState<GenerationMode>("fallback");
  const [runtimeProvider, setRuntimeProvider] = useState<string | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(true);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [generationIntent, setGenerationIntent] = useState<"thinking" | "challenge" | "perspective" | null>(null);
  // IDs of child nodes added in the most recent expansion — drives edge-first reveal in ConnectionsSVG.
  const [revealTargetIds, setRevealTargetIds] = useState<ReadonlySet<string>>(new Set());
  const dragStateRef = useRef<DragState | null>(null);
  const isInitialSubmittingRef = useRef(false);
  const pendingNodeActionsRef = useRef<Set<string>>(new Set());
  const revealTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const generationMode: GenerationMode = runtimeMode;
  const isHero = phase === "hero";
  const isCanvas = phase === "canvas";
  const isLoading = phase === "submitting" || phase === "generating";

  const focusedNeighborhood = useMemo(() => {
    if (!focusedNodeId) {
      return null;
    }

    const relatedIds = new Set<string>([focusedNodeId]);

    edges.forEach((edge) => {
      if (edge.source === focusedNodeId) {
        relatedIds.add(edge.target);
      }

      if (edge.target === focusedNodeId) {
        relatedIds.add(edge.source);
      }
    });

    return relatedIds;
  }, [edges, focusedNodeId]);

  const statusLabel = useMemo(() => {
    if (isFallbackMode) {
      return isGenerating ? "Generating locally" : "Fallback mode";
    }

    if (isGenerating) {
      return "Generating";
    }

    if (isPanning) {
      return "Navigating";
    }

    return "Ready";
  }, [isFallbackMode, isGenerating, isPanning]);

  const providerLabel = runtimeProvider ?? "Mock generator";
  const providerDisplay = useMemo(() => {
    const value = (runtimeProvider ?? "").toLowerCase();

    if (isFallbackMode || !value) {
      return "Mock fallback";
    }

    if (value.includes("anthropic")) {
      return "Anthropic";
    }

    if (value.includes("openai")) {
      return "OpenAI";
    }

    return "AI provider";
  }, [isFallbackMode, runtimeProvider]);

  const isPrototypeMode = isFallbackMode;
  const generationChipLabel = useMemo(() => {
    if (!isGenerating || !generationIntent) {
      return null;
    }

    if (generationIntent === "challenge") {
      return "Challenging assumption";
    }

    if (generationIntent === "perspective") {
      return "Reframing perspective";
    }

    return "Thinking";
  }, [generationIntent, isGenerating]);

  const updateRuntimeFromPayload = useCallback((payload: unknown) => {
    const maybePayload = payload as {
      status?: { providerUsed?: string | null; fallbackUsed?: boolean };
      meta?: { provider?: string | null; fallback?: boolean; generationMode?: GenerationMode };
    };

    const providerUsed =
      maybePayload.status?.providerUsed ?? maybePayload.meta?.provider ?? null;
    const fallbackUsed =
      maybePayload.status?.fallbackUsed ?? maybePayload.meta?.fallback ?? true;
    const mode: GenerationMode = fallbackUsed
      ? "fallback"
      : maybePayload.meta?.generationMode ?? "provider";

    setRuntimeProvider(providerUsed);
    setIsFallbackMode(Boolean(fallbackUsed));
    setRuntimeMode(mode);
  }, []);

  const buildNearbyContext = useCallback(
    (parentNode?: NodeData) => {
      const sourceNodes = parentNode
        ? nodes.filter(
            (node) =>
              node.id !== parentNode.id &&
              (node.parentId === parentNode.id || node.parentId === parentNode.parentId),
          )
        : nodes;

      return sourceNodes.slice(0, 8).map((node) => ({
        label: node.label,
        kind: node.kind,
        perspective: node.perspective,
      }));
    },
    [nodes],
  );

  const handleSubmit = useCallback(async (text: string) => {
    if (isInitialSubmittingRef.current || isGenerating) {
      return;
    }

    isInitialSubmittingRef.current = true;
    setThought(text);
    setPhase("submitting");
    setGenerationPhase("related");

    // Brief delay for UI to settle, then move to generating state
    await new Promise((resolve) => setTimeout(resolve, 200));
    setPhase("generating");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/thought", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "initial",
          seed: text,
          nearbyNodes: buildNearbyContext(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const graph = payload.graph;
      const mapped = mapGraphResponseToGraph(graph, { center: { x: 0, y: 0 }, radius: 270 });

      setThought(graph.seed.label);
      
      // Add emergence stagger delays to nodes based on kind
      const enhancedNodes = mapped.nodes.map((node, index) => ({
        ...node,
        // Override delay to create staggered emergence from center
        delay: node.kind === "related" 
          ? 0.12 + index * 0.08
          : node.kind === "challenge"
            ? 0.48 + index * 0.06
            : 0.64 + index * 0.1,
      }));

      // Phase transitions: related → challenge → perspective → complete
      setGenerationPhase("challenge");
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      setGenerationPhase("perspective");
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      setGenerationPhase("complete");

      setNodes(enhancedNodes);
      setEdges(mapped.edges);
      setSelectedNodeId(null);
      updateRuntimeFromPayload(payload);
    } catch {
      const mockGraph = generateInitialMockGraph(text);
      const mapped = mapGraphResponseToGraph(mockGraph, { center: { x: 0, y: 0 }, radius: 270 });

      setThought(mockGraph.seed.label);
      
      const enhancedNodes = mapped.nodes.map((node, index) => ({
        ...node,
        delay: node.kind === "related" 
          ? 0.12 + index * 0.08
          : node.kind === "challenge"
            ? 0.48 + index * 0.06
            : 0.64 + index * 0.1,
      }));

      setGenerationPhase("complete");
      setNodes(enhancedNodes);
      setEdges(mapped.edges);
      setRuntimeMode("fallback");
      setRuntimeProvider(null);
      setIsFallbackMode(true);
    } finally {
      isInitialSubmittingRef.current = false;
    }

    // Transition to canvas phase with staggered node appearance
    window.setTimeout(() => {
      setPhase("canvas");
    }, 1200);

    window.setTimeout(() => {
      setIsGenerating(false);
    }, 1600);
  }, [buildNearbyContext, isGenerating, updateRuntimeFromPayload]);

  const handleNewSession = useCallback(() => {
    setPhase("transitioning");
    setIsGenerating(false);
    setGenerationIntent(null);

    window.setTimeout(() => {
      setThought("");
      setNodes(INITIAL_NODES);
      setEdges(
        INITIAL_NODES.map((node) => ({
          id: `edge-seed-root-${node.id}`,
          source: "seed-root",
          target: node.id,
          relation: relationFromNodeKind(node.kind),
        })),
      );
      setComposerValue("");
      setPan({ x: 0, y: 0 });
      setSelectedNodeId(null);
      setShowLabels(true);
      setEmphasizeConnections(false);
      setRuntimeMode("fallback");
      setRuntimeProvider(null);
      setIsFallbackMode(true);
      setPhase("hero");
    }, 420);
  }, []);

  const handleRecenter = useCallback(() => {
    setPan({ x: 0, y: 0 });
  }, []);

  const handleNodeFocus = useCallback((node: NodeData) => {
    setFocusedNodeId((current) => (current === node.id ? null : node.id));
    setSelectedNodeId(node.id);
    setPan({
      x: -node.x,
      y: -node.y,
    });
  }, []);

  const handleComposerSubmit = useCallback(() => {
    if (isGenerating) {
      return;
    }

    const value = composerValue.trim();

    if (!value) {
      return;
    }

    const kind = COMPOSER_KINDS[nodes.length % COMPOSER_KINDS.length];
    const perspective = kind === "perspective"
      ? PERSPECTIVE_ROTATION[nodes.length % PERSPECTIVE_ROTATION.length]
      : null;
    const layoutNodes = layoutChildNodes(
      {
        id: "seed-root",
        x: -pan.x,
        y: -pan.y,
        depth: 0,
      },
      [
        {
          label: kind === "perspective" ? `${perspective} lens` : "New thread",
          description: value,
          kind,
          perspective,
        },
      ],
      {
        center: { x: 0, y: 0 },
        delayStart: 0.04,
      },
    );
    const nextNode = layoutNodes[0];

    if (!nextNode) {
      return;
    }

    setNodes((currentNodes) => layoutNodesByDepth([...currentNodes, nextNode], { center: { x: 0, y: 0 } }));
    setEdges((currentEdges) => [
      ...currentEdges,
      {
        id: generateId("edge"),
        source: nextNode.parentId ?? "seed-root",
        target: nextNode.id,
        relation: relationFromNodeKind(nextNode.kind),
      },
    ]);
    setComposerValue("");
    setIsGenerating(true);
    setGenerationIntent("thinking");
    window.setTimeout(() => {
      setIsGenerating(false);
      setGenerationIntent(null);
    }, isFallbackMode ? 550 : 950);
  }, [composerValue, isFallbackMode, isGenerating, nodes.length, pan]);

  const resolveInteractionMode = useCallback((kind: NodeKind): "expand" | "challenge" | "perspective" => {
    if (kind === "challenge") {
      return "challenge";
    }

    if (kind === "perspective") {
      return "perspective";
    }

    return "expand";
  }, []);

  const toInteractionNodes = useCallback((kind: NodeKind, payload: unknown): NodeContent[] => {
    const parsed = payload as {
      nodes?: NodeContent[];
      node?: NodeContent;
    };

    if (Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
      return parsed.nodes;
    }

    if (parsed.node) {
      return [parsed.node];
    }

    if (kind === "challenge") {
      return [generateMockChallenge("Generated challenge")];
    }

    if (kind === "perspective") {
      return [generateMockPerspective("Generated perspective")];
    }

    return [generateMockExpansion("Generated expansion")];
  }, []);

  const findParentNodeById = useCallback(
    (nodeId: string): NodeData | null => nodes.find((node) => node.id === nodeId) ?? null,
    [nodes],
  );

  const appendChildNode = useCallback(async (parentNode: NodeData, kind: NodeKind) => {
    const actionMode = resolveInteractionMode(kind);
    const actionKey = `${parentNode.id}:${actionMode}`;

    if (pendingNodeActionsRef.current.has(actionKey)) {
      return;
    }

    pendingNodeActionsRef.current.add(actionKey);

    setIsGenerating(true);
    setActiveNodeId(parentNode.id);
    setSelectedNodeId(parentNode.id);
    setGenerationIntent(
      actionMode === "challenge"
        ? "challenge"
        : actionMode === "perspective"
          ? "perspective"
          : "thinking",
    );

    try {
      const response = await fetch("/api/thought", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: actionMode,
          label: parentNode.label,
          nearbyNodes: buildNearbyContext(parentNode),
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const nextNodeContents = toInteractionNodes(kind, payload)
        .map((node) => ({
          ...node,
          kind,
          perspective: kind === "perspective" ? node.perspective : null,
        }))
        .slice(0, kind === "challenge" ? 1 : kind === "perspective" ? 3 : 3);

      const nextChildren = layoutChildNodes(
        parentNode,
        nextNodeContents,
        {
          depth: parentNode.depth + 1,
          center: { x: 0, y: 0 },
          // Nodes appear 500ms after mount so edges visibly draw out first.
          delayStart: 0.50,
          delayStep: 0.12,
        },
      );

      if (nextChildren.length === 0) {
        setIsGenerating(false);
        setActiveNodeId(null);
        setGenerationIntent(null);
        pendingNodeActionsRef.current.delete(actionKey);
        return;
      }

      // Arm edge-first reveal: ConnectionsSVG will draw these edges at delay 0
      // so lines visibly extend from the parent before children fade in.
      if (revealTimeoutRef.current !== null) window.clearTimeout(revealTimeoutRef.current);
      setRevealTargetIds(new Set(nextChildren.map((c) => c.id)));
      revealTimeoutRef.current = window.setTimeout(() => setRevealTargetIds(new Set()), 1400);

      setNodes((currentNodes) => layoutNodesByDepth([...currentNodes, ...nextChildren], { center: { x: 0, y: 0 } }));
      setEdges((currentEdges) => [
        ...currentEdges,
        ...nextChildren.map((child) => ({
          id: generateId("edge"),
          source: parentNode.id,
          target: child.id,
          relation: relationFromNodeKind(child.kind),
        })),
      ]);
      setSelectedNodeId(nextChildren[0]?.id ?? parentNode.id);
      updateRuntimeFromPayload(payload);
    } catch {
      const fallbackNodes = kind === "challenge"
        ? [generateMockChallenge(parentNode.label)]
        : kind === "perspective"
          ? [generateMockPerspective(parentNode.label), generateMockPerspective(parentNode.label), generateMockPerspective(parentNode.label)]
          : [generateMockExpansion(parentNode.label), generateMockExpansion(parentNode.label), generateMockExpansion(parentNode.label)];

      const nextChildren = layoutChildNodes(
        parentNode,
        fallbackNodes,
        {
          depth: parentNode.depth + 1,
          center: { x: 0, y: 0 },
          delayStart: 0.50,
          delayStep: 0.12,
        },
      );

      if (nextChildren.length > 0) {
        if (revealTimeoutRef.current !== null) window.clearTimeout(revealTimeoutRef.current);
        setRevealTargetIds(new Set(nextChildren.map((c) => c.id)));
        revealTimeoutRef.current = window.setTimeout(() => setRevealTargetIds(new Set()), 1400);

        setNodes((currentNodes) => layoutNodesByDepth([...currentNodes, ...nextChildren], { center: { x: 0, y: 0 } }));
        setEdges((currentEdges) => [
          ...currentEdges,
          ...nextChildren.map((child) => ({
            id: generateId("edge"),
            source: parentNode.id,
            target: child.id,
            relation: relationFromNodeKind(child.kind),
          })),
        ]);
        setSelectedNodeId(nextChildren[0]?.id ?? parentNode.id);
      }

      setRuntimeMode("fallback");
      setRuntimeProvider(null);
      setIsFallbackMode(true);
    } finally {
      setActiveNodeId(null);
      setGenerationIntent(null);
      pendingNodeActionsRef.current.delete(actionKey);
    }

    window.setTimeout(() => setIsGenerating(false), isFallbackMode ? 450 : 800);
  }, [buildNearbyContext, isFallbackMode, nodes, resolveInteractionMode, toInteractionNodes, updateRuntimeFromPayload]);

  const handleStagePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isCanvas || event.target !== event.currentTarget) {
        return;
      }

      setFocusedNodeId(null);

      dragStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: pan.x,
        originY: pan.y,
      };

      event.currentTarget.setPointerCapture(event.pointerId);
      setIsPanning(true);
    },
    [isCanvas, pan.x, pan.y],
  );

  const handleStagePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    setPan({
      x: dragState.originX + (event.clientX - dragState.startX),
      y: dragState.originY + (event.clientY - dragState.startY),
    });
  }, []);

  const handleStagePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    setIsPanning(false);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <AmbientBackground phase={phase} />

      {/* Loading seed node overlay */}
      {isLoading && (
        <SeedLoadingNode
          label={thought}
          isGenerating={phase === "generating"}
          generationPhase={generationPhase}
        />
      )}

      {/* Hero layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          opacity: isHero ? 1 : 0,
          transform: isHero ? "none" : "translateY(-20px)",
          filter: isHero ? "none" : "blur(5px)",
          transition:
            "opacity 0.55s var(--ease-in), transform 0.55s var(--ease-in), filter 0.55s var(--ease-in)",
          pointerEvents: isHero ? "auto" : "none",
        }}
      >
        <HeroState onSubmit={handleSubmit} />
      </div>

      {/* Canvas stage */}
      <div
        onPointerDown={handleStagePointerDown}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handleStagePointerUp}
        onPointerCancel={handleStagePointerUp}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 30,
          opacity: isCanvas ? 1 : 0,
          transition: "opacity 0.55s ease 0.1s",
          pointerEvents: isCanvas ? "auto" : "none",
          cursor: isPanning ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        {/* Floating top bar */}
        <div
          className="glass-raised"
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 60,
            width: "min(1000px, calc(100vw - 36px))",
            borderRadius: "var(--r-pill)",
            padding: "9px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="type-wordmark" style={{ marginRight: 6 }}>Thought Partner</span>
            <button className="btn-pill btn-pill-ghost" onClick={handleNewSession}>
              New session
            </button>
            <button className="btn-pill btn-pill-ghost" onClick={handleRecenter}>
              Re-center
            </button>
            <button
              className={`btn-pill ${showLabels ? "btn-pill-accent" : "btn-pill-ghost"}`}
              onClick={() => setShowLabels((current) => !current)}
            >
              Labels
            </button>
            <button
              className={`btn-pill ${emphasizeConnections ? "btn-pill-accent" : "btn-pill-ghost"}`}
              onClick={() => setEmphasizeConnections((current) => !current)}
            >
              Links
            </button>
          </div>

          <div
            className="glass"
            style={{
              borderRadius: "var(--r-pill)",
              padding: "6px 11px",
              display: "flex",
              alignItems: "center",
              gap: 9,
              flexShrink: 0,
            }}
          >
            {generationChipLabel ? (
              <span className="status-chip">
                <span className="status-chip-dot" />
                {generationChipLabel}
              </span>
            ) : null}
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: isFallbackMode ? "rgba(215, 88, 84, 0.9)" : "var(--accent)",
                opacity: isGenerating ? 1 : 0.72,
                animation: isGenerating ? "pulse-dot 1.8s ease-in-out infinite" : "none",
              }}
            />
            <span className="type-caption" style={{ color: "var(--text-secondary)", letterSpacing: "0.06em" }}>
              Powered by {providerDisplay}
            </span>
            <span className="type-caption" style={{ color: "var(--text-ghost)" }}>•</span>
            <span className="type-caption" style={{ color: "var(--text-secondary)" }}>
              {statusLabel}
            </span>
            {isPrototypeMode ? (
              <>
                <span className="type-caption" style={{ color: "var(--text-ghost)" }}>•</span>
                <span className="type-caption" style={{ color: "var(--text-tertiary)", letterSpacing: "0.06em" }}>
                  Local prototype mode
                </span>
              </>
            ) : null}
          </div>
        </div>

        {/* World-space content */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 0,
            height: 0,
            transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px)`,
            transition: isPanning ? "none" : "transform 0.28s var(--ease-out)",
          }}
        >
          <ConnectionsSVG
            seedId="seed-root"
            nodes={nodes}
            edges={edges}
            visible={isCanvas}
            emphasizeConnections={emphasizeConnections}
            selectedNodeId={selectedNodeId}
            activeSourceNodeId={activeNodeId}
            generationActive={isGenerating && Boolean(activeNodeId)}
            revealTargetIds={revealTargetIds}
          />

          {/* Origin cluster */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: -36,
                borderRadius: "50%",
                border: "1px solid rgba(134, 137, 233, 0.09)",
                opacity: isCanvas ? 1 : 0,
                animation: isCanvas ? "pulse-ring 7s ease-in-out infinite" : "none",
                transition: "opacity 1s ease 0.5s",
                pointerEvents: "none",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: -60,
                borderRadius: "50%",
                border: "1px solid rgba(134, 137, 233, 0.04)",
                opacity: isCanvas ? 1 : 0,
                animation: isCanvas ? "pulse-ring 7s ease-in-out 2s infinite" : "none",
                transition: "opacity 1s ease 0.7s",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                opacity: isCanvas ? 1 : 0,
                transform: isCanvas ? "scale(1)" : "scale(0.86)",
                transition:
                  "opacity 0.55s ease 0.08s, transform 0.6s var(--ease-spring) 0.08s",
              }}
            >
              <div
                className="glass-deep"
                style={{
                  borderRadius: "var(--r-xl)",
                  padding: "18px 32px",
                  maxWidth: "440px",
                  textAlign: "center",
                  borderColor: "rgba(134, 137, 233, 0.16)",
                  boxShadow:
                    "0 0 80px rgba(134, 137, 233, 0.09), 0 16px 48px rgba(0, 0, 0, 0.52)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 300,
                    lineHeight: 1.7,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.012em",
                  }}
                >
                  {thought}
                </p>
              </div>
            </div>
          </div>

          {nodes.map((node) => (
            <ThoughtNode
              key={node.id}
              node={node}
              selected={selectedNodeId === node.id}
              generating={activeNodeId === node.id && isGenerating}
              dimmed={Boolean(focusedNeighborhood && !focusedNeighborhood.has(node.id))}
              visible={isCanvas}
              showLabels={showLabels}
              onSelect={(selectedNode) => setSelectedNodeId(selectedNode.id)}
              onFocus={handleNodeFocus}
              onExpand={(selectedNode) => appendChildNode(selectedNode, "related")}
              onChallenge={(selectedNode) => appendChildNode(selectedNode, "challenge")}
              onShiftPerspective={(selectedNode) => appendChildNode(selectedNode, "perspective")}
            />
          ))}
        </div>

        {/* Bottom composer */}
        <div
          className="glass-raised"
          style={{
            position: "absolute",
            left: "50%",
            bottom: 20,
            transform: "translateX(-50%)",
            zIndex: 60,
            width: "min(720px, calc(100vw - 36px))",
            borderRadius: "var(--r-xl)",
            padding: 11,
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span className="type-caption" style={{ color: "var(--text-tertiary)" }}>
                Add a thought to the space
              </span>
              {isPrototypeMode ? (
                <span className="type-caption" style={{ color: "var(--text-tertiary)", letterSpacing: "0.05em" }}>
                  Local prototype mode
                </span>
              ) : null}
            </div>
            <div
              className="glass-inset"
              style={{
                borderRadius: "var(--r-lg)",
                padding: "0 13px",
                display: "flex",
                alignItems: "center",
                minHeight: 50,
              }}
            >
              <input
                value={composerValue}
                onChange={(event) => setComposerValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleComposerSubmit();
                  }
                }}
                placeholder="Add a new thought, question, or angle..."
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: "0.92rem",
                  fontWeight: 300,
                  lineHeight: 1.46,
                  letterSpacing: "-0.012em",
                }}
              />
            </div>
          </div>

          <button
            className="btn-pill btn-pill-accent"
            onClick={handleComposerSubmit}
            disabled={isGenerating}
            style={{ opacity: isGenerating ? 0.66 : 1 }}
          >
            Add thought
          </button>
        </div>
      </div>

      {/* Hero footer */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 50,
          opacity: isHero ? 1 : 0,
          transition: "opacity 0.4s ease",
          animation: "fade-in 1.6s ease 1.2s both",
        }}
      >
        <div
          className="type-caption"
          style={{
            color: "var(--text-ghost)",
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <span>Spatial thinking interface</span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span style={{ fontStyle: "italic" }}>Portfolio prototype</span>
        </div>
      </div>
    </div>
  );
}
