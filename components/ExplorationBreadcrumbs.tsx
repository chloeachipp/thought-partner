"use client";

import type { ExplorationNode } from "@/hooks/useExplorationState";

interface Props {
  /** The nodes in exploration order, not including the current focus */
  path: ExplorationNode[];
  /** Called when user clicks a crumb to navigate back */
  onNavigateBack: () => void;
}

export default function ExplorationBreadcrumbs({ path, onNavigateBack }: Props) {
  if (path.length === 0) return null;

  return (
    <nav
      aria-label="Exploration path"
      className="exploration-breadcrumbs"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        maxWidth: "min(640px, calc(100vw - 48px))",
        overflow: "hidden",
      }}
    >
      {path.map((node, i) => (
        <span
          key={node.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            minWidth: 0,
            // Older crumbs fade out more
            opacity: 0.28 + (i / Math.max(path.length - 1, 1)) * 0.44,
          }}
        >
          {i > 0 && (
            <span
              aria-hidden="true"
              style={{
                color: "var(--text-ghost)",
                fontSize: "0.6rem",
                margin: "0 5px",
                flexShrink: 0,
              }}
            >
              →
            </span>
          )}
          <span
            className="type-caption"
            style={{
              color: "var(--text-tertiary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "120px",
              fontSize: "0.625rem",
              letterSpacing: "0.04em",
            }}
            title={node.label}
          >
            {node.label}
          </span>
        </span>
      ))}

      {/* Separator before back button */}
      {path.length > 0 && (
        <span
          aria-hidden="true"
          style={{
            color: "var(--text-ghost)",
            fontSize: "0.6rem",
            margin: "0 5px",
            flexShrink: 0,
            opacity: 0.5,
          }}
        >
          →
        </span>
      )}

      {/* Back button */}
      <button
        type="button"
        onClick={onNavigateBack}
        className="btn-pill btn-pill-ghost"
        style={{
          padding: "3px 9px",
          fontSize: "0.625rem",
          letterSpacing: "0.05em",
          flexShrink: 0,
          height: "auto",
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
        aria-label="Navigate back"
      >
        ← Back
      </button>
    </nav>
  );
}
