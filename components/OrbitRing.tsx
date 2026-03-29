"use client";

import OrbitNode from "./OrbitNode";
import type { ExplorationNode } from "@/hooks/useExplorationState";

interface Props {
  nodes: ExplorationNode[];
  isExiting: boolean;
  onSelect: (node: ExplorationNode) => void;
}

/**
 * Places orbit nodes in a CSS grid that loosely forms an oval around the
 * center focus node. We use a two-column centre-aligned grid with rows
 * distributed above and below rather than absolute polar math, which keeps
 * the layout fluid across breakpoints without any position drift.
 *
 * Layout for n nodes (max 6):
 *
 *   1 node  → single centre column
 *   2 nodes → one row, two columns
 *   3 nodes → top row 1 col, bottom row 2 col (or vice versa)
 *   4 nodes → 2×2 grid
 *   5 nodes → top row 2, bottom row 3 (or 3+2)
 *   6 nodes → 2 rows × 3 columns
 */
export default function OrbitRing({ nodes, isExiting, onSelect }: Props) {
  if (nodes.length === 0) return null;

  // Split nodes evenly across two rows
  const topCount = Math.ceil(nodes.length / 2);
  const topNodes = nodes.slice(0, topCount);
  const bottomNodes = nodes.slice(topCount);

  const ROW_GAP = 14;  // vertical gap between rows
  const COL_GAP = 12;  // horizontal gap between columns
  const ORBIT_OFFSET = 220; // vertical distance from center to each row

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Top row */}
      {topNodes.length > 0 && (
        <div
          className={isExiting ? "orbit-row-exit" : "orbit-row-enter"}
          style={{
            position: "absolute",
            top: `calc(50% - ${ORBIT_OFFSET}px)`,
            transform: "translateY(-50%)",
            display: "flex",
            gap: COL_GAP,
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
          }}
        >
          {topNodes.map((node, i) => (
            <OrbitNode
              key={node.id}
              node={node}
              delay={isExiting ? 0 : i * 0.07}
              isExiting={isExiting}
              onClick={onSelect}
            />
          ))}
        </div>
      )}

      {/* Bottom row */}
      {bottomNodes.length > 0 && (
        <div
          className={isExiting ? "orbit-row-exit" : "orbit-row-enter"}
          style={{
            position: "absolute",
            top: `calc(50% + ${ORBIT_OFFSET}px)`,
            transform: "translateY(-50%)",
            display: "flex",
            gap: COL_GAP,
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
          }}
        >
          {bottomNodes.map((node, i) => (
            <OrbitNode
              key={node.id}
              node={node}
              delay={isExiting ? 0 : (topNodes.length + i) * 0.07}
              isExiting={isExiting}
              onClick={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
