"use client";

import type { ExplorationNode } from "@/hooks/useExplorationState";
import type { CreativeVertical, NodeKind } from "@/types/thought";

// ── Colour tokens per kind ─────────────────────────────────────────────────────

const KIND_ACCENT: Record<NodeKind, { text: string; glow: string; border: string; dot: string }> = {
  seed: {
    text: "var(--accent-bright)",
    glow: "rgba(134, 137, 233, 0.15)",
    border: "rgba(134, 137, 233, 0.22)",
    dot: "var(--accent-bright)",
  },
  related: {
    text: "rgba(80, 156, 214, 0.90)",
    glow: "rgba(80, 156, 214, 0.10)",
    border: "rgba(80, 156, 214, 0.18)",
    dot: "rgba(80, 156, 214, 0.80)",
  },
  challenge: {
    text: "rgba(215, 88, 84, 0.92)",
    glow: "rgba(215, 88, 84, 0.12)",
    border: "rgba(215, 88, 84, 0.22)",
    dot: "rgba(215, 88, 84, 0.80)",
  },
  perspective: {
    text: "var(--accent-bright)",
    glow: "var(--accent-glow)",
    border: "var(--accent-border)",
    dot: "var(--accent-bright)",
  },
};

const VERTICAL_ACCENT: Record<CreativeVertical, { text: string; glow: string; border: string; dot: string }> = {
  Culture: {
    text: "rgba(221, 176, 98, 0.95)",
    glow: "rgba(221, 176, 98, 0.13)",
    border: "rgba(221, 176, 98, 0.20)",
    dot: "rgba(221, 176, 98, 0.90)",
  },
  Visual: {
    text: "rgba(133, 182, 236, 0.95)",
    glow: "rgba(133, 182, 236, 0.13)",
    border: "rgba(133, 182, 236, 0.20)",
    dot: "rgba(133, 182, 236, 0.90)",
  },
  Sound: {
    text: "rgba(216, 152, 214, 0.95)",
    glow: "rgba(216, 152, 214, 0.12)",
    border: "rgba(216, 152, 214, 0.20)",
    dot: "rgba(216, 152, 214, 0.90)",
  },
  Space: {
    text: "rgba(120, 204, 187, 0.95)",
    glow: "rgba(120, 204, 187, 0.12)",
    border: "rgba(120, 204, 187, 0.20)",
    dot: "rgba(120, 204, 187, 0.90)",
  },
  Digital: {
    text: "rgba(160, 170, 255, 0.95)",
    glow: "rgba(160, 170, 255, 0.14)",
    border: "rgba(160, 170, 255, 0.22)",
    dot: "rgba(160, 170, 255, 0.92)",
  },
  Emotion: {
    text: "rgba(231, 132, 130, 0.95)",
    glow: "rgba(231, 132, 130, 0.13)",
    border: "rgba(231, 132, 130, 0.21)",
    dot: "rgba(231, 132, 130, 0.92)",
  },
  Narrative: {
    text: "rgba(189, 179, 255, 0.95)",
    glow: "rgba(189, 179, 255, 0.13)",
    border: "rgba(189, 179, 255, 0.21)",
    dot: "rgba(189, 179, 255, 0.92)",
  },
};

function getNodeAccent(node: ExplorationNode) {
  return node.vertical ? VERTICAL_ACCENT[node.vertical] : KIND_ACCENT[node.kind];
}

function getNodeLabel(node: ExplorationNode) {
  return node.vertical ?? "Origin";
}

interface Props {
  node: ExplorationNode;
  isGenerating?: boolean;
}

export default function FocusNode({ node, isGenerating = false }: Props) {
  const accent = getNodeAccent(node);

  return (
    <div
      className={`focus-node${isGenerating ? " node-generating" : ""}`}
      style={{
        position: "relative",
        width: "min(420px, calc(100vw - 56px))",
        textAlign: "center",
      }}
    >
      {/* Ambient halo */}
      <div
        aria-hidden="true"
        className="focus-node-halo"
        style={{ background: `radial-gradient(ellipse at center, ${accent.glow} 0%, transparent 68%)` }}
      />

      {/* Pulse rings */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: -48,
          borderRadius: "50%",
          border: `1px solid ${accent.border}`,
          opacity: 0.38,
          animation: "pulse-ring 6s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: -80,
          borderRadius: "50%",
          border: `1px solid ${accent.border}`,
          opacity: 0.16,
          animation: "pulse-ring 6s ease-in-out 1.5s infinite",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        className="focus-node-card glass-deep"
        style={{
          borderRadius: "var(--r-xl)",
          padding: "28px 32px 24px",
          borderColor: accent.border,
          boxShadow: `0 0 80px ${accent.glow}, 0 16px 48px rgba(0,0,0,0.52)`,
        }}
      >
        {/* Vertical badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: accent.dot,
              opacity: 0.7,
              flexShrink: 0,
            }}
          />
          <span className="type-label" style={{ color: accent.text, opacity: 1 }}>
            {getNodeLabel(node)}
          </span>
        </div>

        {/* Label */}
        <h2
          style={{
            margin: "0 0 10px",
            fontSize: "clamp(1.25rem, 2.8vw, 1.75rem)",
            fontWeight: 300,
            lineHeight: 1.28,
            letterSpacing: "-0.026em",
            color: "var(--text-primary)",
            fontStyle: node.vertical === "Narrative" ? "italic" : "normal",
          }}
        >
          {node.label}
        </h2>

        {/* Description */}
        {node.description && (
          <p
            className="type-body-sm"
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              fontStyle: "normal",
              lineHeight: 1.62,
            }}
          >
            {node.description}
          </p>
        )}
      </div>
    </div>
  );
}
