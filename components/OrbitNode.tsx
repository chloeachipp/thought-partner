"use client";

import { useState } from "react";
import type { ExplorationNode } from "@/hooks/useExplorationState";
import type { CreativeVertical, NodeKind } from "@/types/thought";

const KIND_ACCENT: Record<NodeKind, { text: string; border: string; borderHover: string; glow: string }> = {
  seed: {
    text: "var(--accent-bright)",
    border: "rgba(134, 137, 233, 0.16)",
    borderHover: "rgba(134, 137, 233, 0.36)",
    glow: "rgba(134, 137, 233, 0.14)",
  },
  related: {
    text: "rgba(80, 156, 214, 0.90)",
    border: "rgba(80, 156, 214, 0.13)",
    borderHover: "rgba(80, 156, 214, 0.32)",
    glow: "rgba(80, 156, 214, 0.10)",
  },
  challenge: {
    text: "rgba(215, 88, 84, 0.90)",
    border: "rgba(215, 88, 84, 0.14)",
    borderHover: "rgba(215, 88, 84, 0.34)",
    glow: "rgba(215, 88, 84, 0.10)",
  },
  perspective: {
    text: "var(--accent-bright)",
    border: "var(--accent-border)",
    borderHover: "rgba(134, 137, 233, 0.38)",
    glow: "rgba(134, 137, 233, 0.10)",
  },
};

const VERTICAL_ACCENT: Record<CreativeVertical, { text: string; border: string; borderHover: string; glow: string }> = {
  Culture: {
    text: "rgba(221, 176, 98, 0.95)",
    border: "rgba(221, 176, 98, 0.14)",
    borderHover: "rgba(221, 176, 98, 0.30)",
    glow: "rgba(221, 176, 98, 0.11)",
  },
  Visual: {
    text: "rgba(133, 182, 236, 0.95)",
    border: "rgba(133, 182, 236, 0.14)",
    borderHover: "rgba(133, 182, 236, 0.32)",
    glow: "rgba(133, 182, 236, 0.11)",
  },
  Sound: {
    text: "rgba(216, 152, 214, 0.95)",
    border: "rgba(216, 152, 214, 0.14)",
    borderHover: "rgba(216, 152, 214, 0.31)",
    glow: "rgba(216, 152, 214, 0.11)",
  },
  Space: {
    text: "rgba(120, 204, 187, 0.95)",
    border: "rgba(120, 204, 187, 0.14)",
    borderHover: "rgba(120, 204, 187, 0.30)",
    glow: "rgba(120, 204, 187, 0.11)",
  },
  Digital: {
    text: "rgba(160, 170, 255, 0.95)",
    border: "rgba(160, 170, 255, 0.15)",
    borderHover: "rgba(160, 170, 255, 0.34)",
    glow: "rgba(160, 170, 255, 0.12)",
  },
  Emotion: {
    text: "rgba(231, 132, 130, 0.95)",
    border: "rgba(231, 132, 130, 0.15)",
    borderHover: "rgba(231, 132, 130, 0.34)",
    glow: "rgba(231, 132, 130, 0.11)",
  },
  Narrative: {
    text: "rgba(189, 179, 255, 0.95)",
    border: "rgba(189, 179, 255, 0.15)",
    borderHover: "rgba(189, 179, 255, 0.34)",
    glow: "rgba(189, 179, 255, 0.12)",
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
  /** visual delay for staggered entry */
  delay?: number;
  /** whether this is in the exit phase */
  isExiting?: boolean;
  onClick: (node: ExplorationNode) => void;
}

export default function OrbitNode({ node, delay = 0, isExiting = false, onClick }: Props) {
  const [hovered, setHovered] = useState(false);
  const accent = getNodeAccent(node);

  return (
    <button
      type="button"
      onClick={() => onClick(node)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`orbit-node${isExiting ? " orbit-node-exit" : ""}`}
      style={{
        /* layout: 100% of the container cell, centered */
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: "min(188px, calc(44vw))",
        padding: "14px 16px 12px",
        borderRadius: "var(--r-xl)",
        background: hovered ? "rgba(16, 17, 28, 0.72)" : "rgba(12, 13, 22, 0.52)",
        border: `1px solid ${hovered ? accent.borderHover : accent.border}`,
        backdropFilter: "blur(var(--blur-xl)) saturate(1.7)",
        WebkitBackdropFilter: "blur(var(--blur-xl)) saturate(1.7)",
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.30), 0 0 28px ${accent.glow}`
          : `0 4px 20px rgba(0,0,0,0.22)`,
        cursor: "pointer",
        textAlign: "left",
        transform: hovered ? "scale(1.04) translateY(-2px)" : "scale(1) translateY(0)",
        transition: [
          "background 0.28s ease",
          "border-color 0.28s ease",
          "box-shadow 0.28s ease",
          "transform 0.28s var(--ease-out)",
          `opacity 0.52s var(--ease-out) ${delay}s`,
          `filter 0.52s var(--ease-out) ${delay}s`,
        ].join(", "),
        animationDelay: `${delay}s`,
        color: "inherit",
        userSelect: "none",
      }}
    >
      {/* Vertical dot + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: accent.text,
            opacity: 0.6,
            flexShrink: 0,
          }}
        />
        <span className="type-label" style={{ color: accent.text, opacity: 1 }}>
          {getNodeLabel(node)}
        </span>
      </div>

      {/* Label */}
      <p
        style={{
          margin: 0,
          fontSize: "0.8375rem",
          fontWeight: 420,
          lineHeight: 1.3,
          letterSpacing: "-0.016em",
          color: "var(--text-primary)",
          fontStyle: node.vertical === "Narrative" ? "italic" : "normal",
        }}
      >
        {node.label}
      </p>

      {/* Description */}
      {node.description && (
        <p
          style={{
            margin: 0,
            fontSize: "0.72rem",
            fontWeight: 300,
            lineHeight: 1.52,
            color: "var(--text-secondary)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {node.description}
        </p>
      )}

      {/* Hover arrow */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 2,
          opacity: hovered ? 0.6 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-4px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          color: accent.text,
          fontSize: "0.7rem",
          letterSpacing: "0.05em",
        }}
      >
        Explore →
      </div>
    </button>
  );
}
