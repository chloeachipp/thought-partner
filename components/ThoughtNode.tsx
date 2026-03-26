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
}

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
  seed: "The originating thought",
  related: "Adjacent concept worth exploring",
  challenge:   "Push back — what if the opposite is true?",
  perspective: "A different vantage point",
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
          left: `${node.x}px`,
          top: `${node.y}px`,
          transform: visible
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.84)",
          width,
          transition: `opacity 0.5s ease ${node.delay}s, transform 0.55s var(--ease-spring) ${node.delay}s`,
          animation: visible ? `pop-in 0.48s var(--ease-out) ${node.delay}s both` : "none",
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
          style={{ borderRadius: "var(--r-lg)", padding: "16px 16px 14px" }}
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
                  {node.perspective ?? node.kind}
                </span>
              </span>
              <span className="node-depth">Depth {node.depth}</span>
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
              Expand
            </button>
            <button
              type="button"
              className="node-action node-action-danger"
              disabled={generating}
              onClick={(event) => stopAndRun(event, onChallenge)}
            >
              Challenge
            </button>
            <button
              type="button"
              className="node-action node-action-perspective"
              disabled={generating}
              onClick={(event) => stopAndRun(event, onShiftPerspective)}
            >
              Shift perspective
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
