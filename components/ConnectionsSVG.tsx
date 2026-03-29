"use client";

import { getBezierPath } from "@/lib/graph/graph-layout";
import type { NodeData, ThoughtEdge } from "@/types/thought";

interface Props {
  seedId: string;
  /** World-space coordinate to use as the seed anchor when drawing edges.
   * When the world container is panned, pass `{ x: -pan.x, y: -pan.y }` so
   * edges originate from the seed's true viewport-center position. */
  seedPosition?: { x: number; y: number };
  nodes: NodeData[];
  edges: ThoughtEdge[];
  visible: boolean;
  emphasizeConnections?: boolean;
  selectedNodeId?: string | null;
  activeSourceNodeId?: string | null;
  generationActive?: boolean;
  /**
   * IDs of child nodes that were just added via an Expand / Challenge / Shift
   * perspective action. Edges whose target is in this set are drawn with no
   * delay so lines visibly emerge from the parent before children fade in.
   * Cleared by ThoughtCanvas after the reveal window (~1400 ms).
   */
  revealTargetIds?: ReadonlySet<string>;
}

// Module-level empty set — used as the default for the revealTargetIds prop.
const EMPTY_SET = new Set<string>();

// ── Edge colour palette ───────────────────────────────────────────────────────
// Each value is an RGB triplet (no alpha — opacity is controlled separately).

const RELATION_RGB: Record<ThoughtEdge["relation"], string> = {
  expands:    "168, 180, 255",  // soft blue-violet
  challenges: "215,  88,  84",  // warm red
  reframes:   "134, 137, 233",  // accent purple
};

// ── Ancestry / branch utilities ───────────────────────────────────────────────

/**
 * Walks parentId from `nodeId` all the way to the seed, returning every id
 * encountered (including seed, even though it is not in nodeMap).
 */
function buildAncestorSet(
  nodeId: string | null,
  nodeMap: Map<string, NodeData>,
  seedId: string,
): Set<string> {
  const set = new Set<string>();
  if (!nodeId) return set;

  let id: string | null = nodeId;
  while (id) {
    set.add(id);
    const node = nodeMap.get(id);
    if (!node) break;
    if (!node.parentId) break;

    if (!nodeMap.has(node.parentId)) {
      // The next parent is the seed (not stored in nodeMap) — include it.
      set.add(node.parentId);
      break;
    }
    id = node.parentId;
  }
  return set;
}

/**
 * Returns the depth-1 ancestor id of `nodeId`, or null if the node is
 * already depth-0/1 or its ancestry can't be resolved.
 */
function getBranchRootId(nodeId: string, nodeMap: Map<string, NodeData>): string | null {
  const node = nodeMap.get(nodeId);
  if (!node || node.depth <= 1) return node?.depth === 1 ? node.id : null;

  let current: NodeData = node;
  while (current.depth > 1 && current.parentId) {
    const parent = nodeMap.get(current.parentId);
    if (!parent) break;
    current = parent;
  }
  return current.depth === 1 ? current.id : null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ConnectionsSVG({
  seedId,
  seedPosition,
  nodes,
  edges,
  visible,
  emphasizeConnections = false,
  selectedNodeId = null,
  activeSourceNodeId = null,
  generationActive = false,
  revealTargetIds = EMPTY_SET,
}: Props) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Ancestor chain + depth-1 branch root for the selected node.
  const ancestorSet   = buildAncestorSet(selectedNodeId, nodeMap, seedId);
  const selBranchRoot = selectedNodeId ? getBranchRootId(selectedNodeId, nodeMap) : null;

  // Precompute branch root for each node once, outside the render loop.
  const branchRootOf = new Map<string, string | null>();
  for (const n of nodes) branchRootOf.set(n.id, getBranchRootId(n.id, nodeMap));

  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {edges.map((edge) => {
        // Source: seed lives at a fixed viewport-center anchor, not in nodeMap.
        // seedPosition is the world-space coordinate that maps to viewport center
        // given the current pan (i.e. -pan.x, -pan.y). Falls back to (0,0) when
        // no pan is in effect.
        const seedAnchor = seedPosition ?? { x: 0, y: 0 };
        const rawSource =
          edge.source === seedId
            ? { ...seedAnchor, depth: 0 }
            : nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (!rawSource || !targetNode) return null;

        const path  = getBezierPath(rawSource, targetNode);
        const rgb   = RELATION_RGB[edge.relation];
        const depth = targetNode.depth;
        const delay = targetNode.delay ?? 0;

        // Depth weight: depth-1 = full visibility, deeper = progressively lighter.
        const depthMul = depth === 1 ? 1.0 : depth === 2 ? 0.65 : 0.44;

        // ── Edge state relative to current selection ──────────────────────────
        type EdgeState = "ancestor" | "sibling" | "neutral" | "dimmed";
        let state: EdgeState = "neutral";

        if (selectedNodeId) {
          const srcOnChain = ancestorSet.has(edge.source);
          const tgtOnChain = ancestorSet.has(edge.target);

          if (srcOnChain && tgtOnChain) {
            state = "ancestor";
          } else if (
            selBranchRoot &&
            (branchRootOf.get(edge.source) === selBranchRoot ||
              branchRootOf.get(edge.target) === selBranchRoot ||
              edge.source === selBranchRoot ||
              edge.target === selBranchRoot)
          ) {
            state = "sibling";
          } else {
            state = "dimmed";
          }
        }

        const emphasize = emphasizeConnections;

        // ── Visual properties by state ────────────────────────────────────────

        // Main line opacity
        const lineOpacity =
          !visible             ? 0 :
          state === "ancestor" ? 0.78 :
          state === "sibling"  ? 0.30 :
          state === "dimmed"   ? 0.025 :
          emphasize            ? 0.52 * depthMul :
                                 0.32 * depthMul;

        // Soft glow behind the main line — wider and dreamier.
        const glowOpacity =
          !visible             ? 0 :
          state === "ancestor" ? 0.32 :
          state === "sibling"  ? 0.12 :
          state === "dimmed"   ? 0    :
          emphasize            ? 0.22 * depthMul :
                                 0.14 * depthMul;

        // Stroke widths — thinner for a lighter, more fluid feel.
        const lineWidth =
          state === "ancestor" ? 1.40 :
          state === "sibling"  ? 0.90 :
          state === "dimmed"   ? 0.45 :
          depth === 1          ? 1.20 :
          depth === 2          ? 0.90 : 0.68;

        // Wider blur for a softer, more atmospheric glow.
        const glowBlur = state === "ancestor" ? 8 : state === "dimmed" ? 5 : 10;

        // Approximate path length for the draw-on animation.
        // Round to fixed precision so SSR/client emit identical attribute strings.
        const approxLen = Math.hypot(
          targetNode.x - rawSource.x,
          targetNode.y - rawSource.y,
        ) * 1.22;
        const dashLen = (Math.round(approxLen * 1000) / 1000).toFixed(3);

        // Normalise all floating-point SVG attribute values to fixed-precision
        // strings so the server-rendered HTML matches the client exactly.
        const fixN = (n: number, d = 3) => (Math.round(n * 10 ** d) / 10 ** d).toFixed(d);

        const isTracing = generationActive && activeSourceNodeId === edge.source;

        // ── Reveal: edge-first sequence ───────────────────────────────────────
        // When this edge's target was just created by an expansion, draw the
        // line immediately (edgeDrawDelay = 0) and at full brightness so the
        // user sees "line extends from parent → node arrives at tip".
        // revealTargetIds clears after ~1400 ms; the opacity/width then
        // smoothly transitions back to depth-scaled values via CSS.
        const isRevealEdge = revealTargetIds.has(edge.target);
        const edgeDrawDelay  = isRevealEdge ? 0 : delay;
        const finalLineOpacity = isRevealEdge ? Math.max(lineOpacity,  0.70) : lineOpacity;
        const finalGlowOpacity = isRevealEdge ? Math.max(glowOpacity,  0.28) : glowOpacity;
        const finalLineWidth   = isRevealEdge ? Math.max(lineWidth,    1.60) : lineWidth;
        // Narrower glow stroke + tighter blur = refined halo, not diffuse bleed.
        const finalGlowWidth   = finalLineWidth * 5.0;

        return (
          <g key={edge.id}>
            {/* ── Glow layer: soft, blurred duplicate behind the main line ── */}
            <path
              d={path}
              stroke={`rgba(${rgb}, 1)`}
              strokeWidth={fixN(finalGlowWidth, 3)}
              strokeLinecap="round"
              fill="none"
              opacity={fixN(finalGlowOpacity, 4)}
              style={{
                filter: `blur(${glowBlur}px)`,
                transition: `opacity 0.45s ease ${edgeDrawDelay}s, stroke-width 0.35s var(--ease-smooth)`,
              }}
            />

            {/* ── Main line: draws from source anchor to target anchor ── */}
            <path
              d={path}
              stroke={`rgba(${rgb}, 1)`}
              strokeWidth={fixN(finalLineWidth, 3)}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={dashLen}
              strokeDashoffset={visible ? "0" : dashLen}
              opacity={fixN(visible ? finalLineOpacity : 0, 4)}
              style={{
                transition: [
                  `stroke-dashoffset 0.72s var(--ease-out) ${edgeDrawDelay}s`,
                  `opacity 0.38s ease ${edgeDrawDelay}s`,
                  "stroke-width 0.35s var(--ease-smooth)",
                ].join(", "),
              }}
            />

            {/* ── Trace: moving pulse along the edge during active expansion ── */}
            {isTracing ? (
              <path
                d={path}
                stroke={`rgba(${rgb}, 1)`}
                strokeWidth={1.55}
                strokeLinecap="round"
                fill="none"
                strokeDasharray="12 110"
                opacity={visible ? 0.82 : 0}
                style={{
                  filter: `drop-shadow(0 0 5px rgba(${rgb}, 0.35))`,
                  animation: "trace-flow 1.75s linear infinite",
                  animationDelay: `${delay * 0.4}s`,
                  transition: `opacity 0.22s ease ${delay * 0.35}s`,
                }}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
