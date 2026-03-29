"use client";

import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { useState } from "react";
import type { NodeData, ThoughtNodeType } from "@/types/thought";

export interface ThoughtNodeProps {
  node: NodeData;
  selected?: boolean;
  generating?: boolean;
  dimmed?: boolean;
  visible?: boolean;
  showLabels?: boolean;
  width?: number | string;
  className?: string;
  style?: CSSProperties;
  onSelect?: (node: NodeData) => void;
  onFocus?: (node: NodeData) => void;
  onExpand?: (node: NodeData) => void;
  onChallenge?: (node: NodeData) => void;
  onShiftPerspective?: (node: NodeData) => void;
  onDirectionExpand?: (node: NodeData) => void;
}

// Entry animations per node kind — each interaction mode has its own cinematic register
const ENTRY_ANIM: Record<ThoughtNodeType, { name: string; dur: string; ease: string }> = {
  seed:        { name: "pop-in",           dur: "0.56s", ease: "var(--ease-out)"    },
  related:     { name: "node-explore-in",  dur: "0.72s", ease: "var(--ease-smooth)" },
  challenge:   { name: "node-disrupt-in",  dur: "0.56s", ease: "var(--ease-out)"    },
  perspective: { name: "node-reframe-in",  dur: "0.88s", ease: "var(--ease-smooth)" },
};

// Maps to CSS token names defined in globals.css
const TYPE_TEXT_VAR: Record<ThoughtNodeType, string> = {
  seed: "var(--accent-bright)",
  related: "var(--node-related-text)",
  challenge:   "var(--node-challenge-text)",
  perspective: "var(--node-perspective-text)",
};

const TYPE_DOT_VAR: Record<ThoughtNodeType, string> = {
  seed: "var(--accent-bright)",
  related: "var(--node-related-text)",
  challenge:   "var(--node-challenge-text)",
  perspective: "var(--node-perspective-text)",
};

const TYPE_TOOLTIPS: Record<ThoughtNodeType, string> = {
  seed: "The originating idea",
  related: "A direction worth following",
  challenge:   "A productive friction — what if this is wrong?",
  perspective: "A different lens on the same idea",
};

// Display labels for node kinds
const KIND_LABEL: Record<string, string> = {
  seed: "Origin",
  related: "Direction",
  challenge: "Tension",
  perspective: "Reframe",
};

// Display labels for perspective subtypes
const PERSPECTIVE_LABEL: Record<string, string> = {
  user: "Mood",
  business: "Context",
  ethical: "Question",
  technical: "Visual direction",
  creative: "Concept",
};

export default function ThoughtNode({
  node,
  selected = false,
  generating = false,
  dimmed = false,
  visible = true,
  showLabels = true,
  width = 248,
  className,
  style,
  onSelect,
  onFocus,
  onExpand,
  onChallenge,
  onShiftPerspective,
  onDirectionExpand,
}: ThoughtNodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSelect = () => {
    onSelect?.(node);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  const stopAndRun = (
    event: MouseEvent<HTMLButtonElement>,
    handler?: (node: NodeData) => void,
  ) => {
    event.stopPropagation();
    handler?.(node);
  };

  return (
    <>
      {/* ── Node card ── */}
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={handleSelect}
        onDoubleClick={() => onFocus?.(node)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onKeyDown={handleKeyDown}
        className={className}
        style={{
          position: "absolute",
          left: `${Math.round(node.x * 1000) / 1000}px`,
          top: `${Math.round(node.y * 1000) / 1000}px`,
          transform: visible
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.84)",
          width,
          transition: `opacity 0.5s ease ${node.delay}s, transform 0.55s var(--ease-spring) ${node.delay}s`,
          animation: visible ? `${ENTRY_ANIM[node.kind].name} ${ENTRY_ANIM[node.kind].dur} ${ENTRY_ANIM[node.kind].ease} ${node.delay}s both` : "none",
          pointerEvents: visible ? "auto" : "none",
          zIndex: 5,
          opacity: visible ? (dimmed ? 0.34 : 1) : 0,
          filter: dimmed ? "saturate(0.75) brightness(0.82)" : "none",
          ...style,
        }}
      >
        <div
          className={[
            "node-surface",
            `node-${node.kind}`,
            selected ? "node-selected" : "",
            generating ? "node-generating" : "",
          ].join(" ")}
          style={{ borderRadius: "var(--r-xl)", padding: "16px 18px 14px" }}
        >
          {/* Type row */}
          {showLabels ? (
            <div
              className="node-meta-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                <span
                  className="node-type-dot"
                  style={{ background: TYPE_DOT_VAR[node.kind] }}
                />
                <span
                  className="type-label"
                  style={{ color: TYPE_TEXT_VAR[node.kind] }}
                >
                  {PERSPECTIVE_LABEL[node.perspective ?? ""] ?? KIND_LABEL[node.kind] ?? node.kind}
                </span>
              </span>
            </div>
          ) : null}

          <div className="node-copy">
            <h3 className="node-title">{node.label}</h3>
            {node.description ? (
              <p className="node-description type-body-sm">{node.description}</p>
            ) : null}
          </div>

          <div className="node-actions">
            <button
              type="button"
              className="node-action node-action-primary"
              disabled={generating}
              onClick={(event) => stopAndRun(event, onExpand)}
            >
              Explore
            </button>
            <button
              type="button"
              className="node-action node-action-danger"
              disabled={generating}
              onClick={(event) => stopAndRun(event, onChallenge)}
            >
              Disrupt
            </button>
            <button
              type="button"
              className="node-action node-action-perspective"
              disabled={generating}
              onClick={(event) => stopAndRun(event, onShiftPerspective)}
            >
              Reframe
            </button>
            <button
              type="button"
              className="node-action node-action-direction"
              disabled={generating}
              onClick={(event) => stopAndRun(event, onDirectionExpand)}
            >
              Dive in
            </button>
          </div>
        </div>

        {/* Tooltip */}
        <div
          className={`tooltip${showTooltip ? " visible" : ""}`}
          data-side="top"
          style={{
            bottom: "calc(100% + 10px)",
            left: "50%",
            transform: showTooltip
              ? "translateX(-50%) translateY(0) scale(1)"
              : "translateX(-50%) translateY(4px) scale(0.97)",
          }}
        >
          {TYPE_TOOLTIPS[node.kind]}
        </div>
      </div>
    </>
  );
}
