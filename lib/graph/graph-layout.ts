/**
 * Mind-map layout engine using recursive subtree measurement.
 *
 * Algorithm:
 *  1. Build a tree (parent -> children) from the flat node list.
 *  2. Assign each depth-1 node a unique branch direction (evenly spaced angles).
 *  3. Measure each subtree's perpendicular span bottom-up.
 *  4. Layout each subtree top-down:
 *     - advance forward along the branch direction per depth level
 *     - distribute siblings along the perpendicular axis using measured spans
 *  5. No radial rings, no random offsets, no force-directed physics.
 */

import type {
  CanvasNode,
  EdgeRelation,
  GenerationMode,
  NodeKind,
  PerspectiveType,
  ThoughtEdge,
  ThoughtGraphResponse,
  ThoughtNode,
} from "@/types/thought";

type Point = { x: number; y: number };
type BoundingBox = { minX: number; minY: number; maxX: number; maxY: number };

type LayoutOptions = {
  depth?: number;
  delayStart?: number;
  delayStep?: number;
  existingNodes?: CanvasNode[];
  center?: Point;
};

// ── Layout constants ─────────────────────────────────────────────────────────

export const NODE_WIDTH = 248;
export const NODE_HEIGHT = 170;
const NODE_PADDING = 20;

/** Perpendicular space reserved for a single leaf node (widest dimension). */
const NODE_SLOT_SIZE = NODE_WIDTH; // 248 px

/** Gap between adjacent sibling subtree bounding boxes (perpendicular axis). */
const SIBLING_GAP = 32;

/** Forward distance between a node center and its children centers. */
const LEVEL_DISTANCE = 290;

/** Preferred distance from center to depth-1 node centers (may be increased by the root safe zone). */
const BRANCH_START_DIST = 290;

/**
 * Padding added to every side of the seed node bounding box to form the
 * root safe zone.  No depth-1 branch origin — and therefore no edge anchor —
 * may start inside this box.  Enforced before any subtree layout runs.
 */
const ROOT_SAFE_PADDING = 80;

// ── Tree structure ────────────────────────────────────────────────────────────

interface TreeEntry {
  id: string;
  children: string[];
}

function buildTreeFromNodes(nodes: CanvasNode[]): Map<string, TreeEntry> {
  const tree = new Map<string, TreeEntry>();
  for (const n of nodes) tree.set(n.id, { id: n.id, children: [] });
  for (const n of nodes) {
    if (n.parentId && tree.has(n.parentId)) {
      tree.get(n.parentId)!.children.push(n.id);
    }
  }
  return tree;
}

/** Returns children of nodeId sorted deterministically: kind -> label -> id. */
function sortedChildren(
  nodeId: string,
  tree: Map<string, TreeEntry>,
  byId: Map<string, CanvasNode>,
): string[] {
  const entry = tree.get(nodeId);
  if (!entry) return [];
  return [...entry.children].sort((a, b) => {
    const na = byId.get(a);
    const nb = byId.get(b);
    if (!na || !nb) return 0;
    const kindCmp = na.kind.localeCompare(nb.kind);
    if (kindCmp !== 0) return kindCmp;
    const labelCmp = na.label.localeCompare(nb.label);
    if (labelCmp !== 0) return labelCmp;
    return na.id.localeCompare(nb.id);
  });
}

// ── Subtree measurement ───────────────────────────────────────────────────────

/**
 * Returns the perpendicular span (px) required by the subtree rooted at nodeId.
 *
 * Leaf   -> NODE_SLOT_SIZE
 * Parent -> sum(childSpans) + (n-1)*SIBLING_GAP  (minimum NODE_SLOT_SIZE)
 */
function measureSubtreeSpan(
  nodeId: string,
  tree: Map<string, TreeEntry>,
  byId: Map<string, CanvasNode>,
): number {
  const children = sortedChildren(nodeId, tree, byId);
  if (children.length === 0) return NODE_SLOT_SIZE;
  const childSpans = children.map((c) => measureSubtreeSpan(c, tree, byId));
  const total =
    childSpans.reduce((sum, s) => sum + s, 0) + (children.length - 1) * SIBLING_GAP;
  return Math.max(total, NODE_SLOT_SIZE);
}

// ── Direction utilities ───────────────────────────────────────────────────────

export function getDirectionVector(angle: number): Point {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

/** Rotates forward 90 degrees counter-clockwise to obtain the perpendicular. */
function getPerpendicularVector(forward: Point): Point {
  return { x: -forward.y, y: forward.x };
}

/**
 * Evenly-spaced branch angles starting from the top (-PI/2), going clockwise,
 * with a small per-branch offset to break perfect radial symmetry.
 * Offsets are index-derived (not Math.random) so the layout is stable.
 */
function getBranchAngles(count: number): number[] {
  // Max ±0.055 rad ≈ ±3.2° — subtle enough not to cause inter-branch crowding
  // at typical node counts (4-8 branches), visible enough to break the compass-rose look.
  const JITTER = [0.055, -0.048, 0.038, -0.055, 0.044, -0.036, 0.052, -0.042];
  return Array.from(
    { length: count },
    (_, i) => -Math.PI / 2 + (2 * Math.PI * i) / count + (JITTER[i % JITTER.length] ?? 0),
  );
}

export function getPositionFromAngle(radius: number, angle: number, center: Point): Point {
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}

// ── Recursive subtree placement ───────────────────────────────────────────────

/**
 * Places nodeId at nodePos then recursively places its entire subtree.
 *
 * Each child is:
 *  - stepped LEVEL_DISTANCE forward along `forward`
 *  - offset along `perp` by an amount derived from measured subtree spans,
 *    so siblings never overlap each other
 */
function layoutSubtreeAt(
  nodeId: string,
  nodePos: Point,
  forward: Point,
  perp: Point,
  tree: Map<string, TreeEntry>,
  byId: Map<string, CanvasNode>,
  positionMap: Map<string, Point>,
): void {
  positionMap.set(nodeId, nodePos);

  const children = sortedChildren(nodeId, tree, byId);
  if (children.length === 0) return;

  const childSpans = children.map((c) => measureSubtreeSpan(c, tree, byId));
  const totalSpan =
    childSpans.reduce((sum, s) => sum + s, 0) + (children.length - 1) * SIBLING_GAP;

  // Distribute children symmetrically around the parent's perpendicular coordinate.
  let currentPerp = -totalSpan / 2;

  for (let i = 0; i < children.length; i++) {
    const childPerpCenter = currentPerp + childSpans[i] / 2;
    const childPos: Point = {
      x: nodePos.x + forward.x * LEVEL_DISTANCE + perp.x * childPerpCenter,
      y: nodePos.y + forward.y * LEVEL_DISTANCE + perp.y * childPerpCenter,
    };
    layoutSubtreeAt(children[i], childPos, forward, perp, tree, byId, positionMap);
    currentPerp += childSpans[i] + SIBLING_GAP;
  }
}

// ── Root safe zone (rectangular) ─────────────────────────────────────────────

/**
 * Returns the rectangular root safe zone: the seed node bounding box expanded
 * by ROOT_SAFE_PADDING on every side.
 * No depth-1 branch origin (and therefore no edge anchor) may start inside
 * this box.  Computed once and passed into pre-layout checks.
 */
function getRootSafeBox(center: Point): BoundingBox {
  const hw = NODE_WIDTH / 2 + ROOT_SAFE_PADDING;
  const hh = NODE_HEIGHT / 2 + ROOT_SAFE_PADDING;
  return {
    minX: center.x - hw,
    minY: center.y - hh,
    maxX: center.x + hw,
    maxY: center.y + hh,
  };
}

function isInsideBox(point: Point, box: BoundingBox): boolean {
  return (
    point.x > box.minX &&
    point.x < box.maxX &&
    point.y > box.minY &&
    point.y < box.maxY
  );
}

/**
 * Returns the distance from `center` along `forward` at which the ray first
 * exits `box`, then adds EXIT_MARGIN so the branch origin is comfortably
 * outside.  If `preferredDist` already clears the box it is returned
 * unchanged, so this never moves a branch closer to the center.
 *
 * Called once per depth-1 branch BEFORE layoutSubtreeAt runs.
 */
const EXIT_MARGIN = 20;

function safeBranchStartDist(
  forward: Point,
  center: Point,
  box: BoundingBox,
  preferredDist: number,
): number {
  const probe: Point = {
    x: center.x + forward.x * preferredDist,
    y: center.y + forward.y * preferredDist,
  };

  if (!isInsideBox(probe, box)) return preferredDist;

  // Half-extents of the box relative to center.
  const hw = (box.maxX - box.minX) / 2;
  const hh = (box.maxY - box.minY) / 2;

  // The ray exits the box on whichever face it hits first (minimum t).
  // A point (t*dx, t*dy) is inside when |t*dx| < hw AND |t*dy| < hh.
  // It escapes when |t*dx| >= hw OR |t*dy| >= hh → t = min(hw/|dx|, hh/|dy|).
  let tExit = Infinity;
  if (Math.abs(forward.x) > 0.0001) tExit = Math.min(tExit, hw / Math.abs(forward.x));
  if (Math.abs(forward.y) > 0.0001) tExit = Math.min(tExit, hh / Math.abs(forward.y));

  return tExit + EXIT_MARGIN;
}

/**
 * Post-layout safety net: push any non-seed node that landed inside the root
 * safe box outward along its ray from center.  The main algorithm should not
 * produce such nodes; this only catches degenerate edge cases.
 */
function enforceRootSafeBox(
  nodes: CanvasNode[],
  center: Point,
  box: BoundingBox,
  positionMap: Map<string, Point>,
): void {
  const hw = (box.maxX - box.minX) / 2;
  const hh = (box.maxY - box.minY) / 2;

  for (const node of nodes) {
    if (node.depth === 0) continue;
    const pos = positionMap.get(node.id);
    if (!pos || !isInsideBox(pos, box)) continue;

    const dx = pos.x - center.x;
    const dy = pos.y - center.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.001) continue; // exactly on center — push straight right

    const fx = len > 0.001 ? dx / len : 1;
    const fy = len > 0.001 ? dy / len : 0;

    // Project along the ray until the point exits the box, then add margin.
    let tExit = Infinity;
    if (Math.abs(fx) > 0.0001) tExit = Math.min(tExit, hw / Math.abs(fx));
    if (Math.abs(fy) > 0.0001) tExit = Math.min(tExit, hh / Math.abs(fy));

    positionMap.set(node.id, {
      x: center.x + fx * (tExit + EXIT_MARGIN),
      y: center.y + fy * (tExit + EXIT_MARGIN),
    });
  }
}

// ── Core layout entry point ───────────────────────────────────────────────────

/**
 * Full mind-map layout.
 *
 * Process (for every node in `nodes`, including newly-expanded children):
 *
 *   1. MEASURE — `measureSubtreeSpan` walks each subtree bottom-up and returns
 *      the total perpendicular space it needs. Leaf = NODE_SLOT_SIZE. Parent =
 *      sum(childSpans) + (n-1)*SIBLING_GAP. This happens before any node is
 *      placed.
 *
 *   2. CENTRE — the total span of all children is centred symmetrically around
 *      the parent's perpendicular coordinate:
 *        currentPerp = -totalSpan / 2
 *
 *   3. ASSIGN — each child receives a unique offset:
 *        childPerpCenter = currentPerp + childSpans[i] / 2
 *      then:
 *        currentPerp += childSpans[i] + SIBLING_GAP
 *      No two siblings share the same offset. The further-right siblings
 *      cannot "inherit" the parent origin because they each advance by the
 *      full span of all preceding siblings.
 *
 *   4. RECURSE — `layoutSubtreeAt` repeats steps 1-3 for every child, so the
 *      invariant holds at every depth level.
 *
 * Seed handling: ThoughtCanvas never stores the seed node in the `nodes[]`
 * state, and `mapGraphResponseToGraph` passes only depth-1 nodes to this
 * function. Finding no seed would cause an early return and leave all nodes
 * stacked at the origin. To prevent this, when no seed is present, a virtual
 * root is synthesised from the shared parentId of the shallowest nodes
 * (always "seed-root" in practice), used internally, and stripped from the
 * output.
 */
export function layoutNodesAsMindMap(
  nodes: CanvasNode[],
  options: { center?: Point } = {},
): CanvasNode[] {
  if (nodes.length === 0) return [];

  const center = options.center ?? { x: 0, y: 0 };

  // ── Step 0: resolve seed ──────────────────────────────────────────────────
  //
  // Prefer an explicit seed in the array. If none exists (the common case
  // in ThoughtCanvas), create a virtual one whose id matches the shared
  // parentId of the shallowest nodes so the tree links up correctly.

  let allNodes: CanvasNode[] = nodes;
  let seed = nodes.find((n) => n.depth === 0 || n.parentId === null);

  if (!seed) {
    const minDepth = Math.min(...nodes.map((n) => n.depth));
    const sharedParentId =
      nodes
        .filter((n) => n.depth === minDepth)
        .map((n) => n.parentId)
        .find(Boolean) ?? "__virtual_root__";

    seed = {
      id: sharedParentId,
      label: "",
      description: "",
      kind: "seed",
      perspective: null,
      x: center.x,
      y: center.y,
      parentId: null,
      depth: 0,
      delay: 0,
    };

    // Prepend virtual seed so buildTreeFromNodes can wire it to its children.
    allNodes = [seed, ...nodes];
  }

  // ── Step 1: build tree ────────────────────────────────────────────────────

  const byId = new Map(allNodes.map((n) => [n.id, n]));
  const tree = buildTreeFromNodes(allNodes);

  // ── Step 2: compute root safe box (before any branch placement) ─────────
  //
  // The seed bounding box expanded by ROOT_SAFE_PADDING on all sides.
  // No depth-1 branch origin may land inside this box.
  // safeBranchStartDist() guarantees this per-direction before layout runs.

  const rootSafeBox = getRootSafeBox(center);

  // ── Steps 3–5: measure → centre → assign → recurse (per branch) ──────────

  const positionMap = new Map<string, Point>();
  positionMap.set(seed.id, center);

  const depth1Ids = sortedChildren(seed.id, tree, byId);

  if (depth1Ids.length > 0) {
    const branchAngles = getBranchAngles(depth1Ids.length);

    for (let i = 0; i < depth1Ids.length; i++) {
      const angle = branchAngles[i];
      const forward = getDirectionVector(angle);
      const perp = getPerpendicularVector(forward);

      // Enforce the root safe zone BEFORE placing the first node of this branch.
      // safeBranchStartDist returns BRANCH_START_DIST if it already clears the
      // box, or a larger value computed from the box geometry otherwise.
      const startDist = safeBranchStartDist(forward, center, rootSafeBox, BRANCH_START_DIST);

      const branchOrigin: Point = {
        x: center.x + forward.x * startDist,
        y: center.y + forward.y * startDist,
      };

      // layoutSubtreeAt measures the full subtree span before placing any
      // child, so every descendant gets a unique perpendicular offset.
      layoutSubtreeAt(depth1Ids[i], branchOrigin, forward, perp, tree, byId, positionMap);
    }
  }

  // Post-placement safety net using the same rectangular box.
  enforceRootSafeBox(allNodes, center, rootSafeBox, positionMap);

  // Return only the original `nodes` (not the virtual seed) with positions applied.
  //
  // A small deterministic position nudge is applied per node to break the
  // perfectly perpendicular sibling alignment that makes the layout feel
  // grid-like.  Values are derived from the node id string so the same node
  // always lands in the same place across renders.  Nudge is bounded at ±9px
  // (X) and ±7px (Y) — small relative to NODE_WIDTH (248) and LEVEL_DISTANCE
  // (290), so no sibling overlap can occur even in worst-case configurations.
  function idNudge(id: string, salt = 0): number {
    let h = salt ^ 0x5f3759df;
    for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
    return (((h >>> 0) % 20001) / 10000) - 1; // maps to [-1, 1]
  }

  return nodes.map((node) => {
    if (node.id === seed!.id) return { ...node, x: center.x, y: center.y };
    const pos = positionMap.get(node.id);
    if (!pos) return node;
    // Small deterministic nudge to break perfect perpendicular sibling alignment.
    // Bounded at ±8px (X) and ±6px (Y) — enough to feel organic without pulling
    // nodes visibly off their spoke center lines.
    const nx = idNudge(node.id, 0) * 8;
    const ny = idNudge(node.id, 1) * 6;
    return { ...node, x: pos.x + nx, y: pos.y + ny };
  });
}

/** Compatibility alias — all ThoughtCanvas call sites use this name. */
export function layoutNodesByDepth(
  nodes: CanvasNode[],
  options: { center?: Point } = {},
): CanvasNode[] {
  return layoutNodesAsMindMap(nodes, options);
}

// ── layoutChildNodes — provisional node builder ───────────────────────────────

/**
 * Creates CanvasNode objects for incremental expansion.
 * Positions are provisional — ThoughtCanvas calls layoutNodesByDepth
 * immediately after, which recomputes all positions from the full tree.
 */
export function layoutChildNodes(
  parent: Pick<ThoughtNode, "id" | "x" | "y" | "depth">,
  children: Array<Pick<ThoughtNode, "label" | "description" | "kind" | "perspective">>,
  options: LayoutOptions = {},
): CanvasNode[] {
  const depth = options.depth ?? parent.depth + 1;
  const delayStart = options.delayStart ?? 0.08;
  const delayStep = options.delayStep ?? 0.1;

  return children.map((child, index) => ({
    id: generateId(child.kind),
    label: child.label,
    description: child.description,
    kind: child.kind,
    perspective: child.perspective,
    x: parent.x,
    y: parent.y,
    parentId: parent.id,
    depth,
    delay: delayStart + delayStep * index,
  }));
}

// ── Node bounding box ─────────────────────────────────────────────────────────

export function getNodeBounds(node: { x: number; y: number }): BoundingBox {
  return {
    minX: node.x - NODE_WIDTH / 2 - NODE_PADDING,
    minY: node.y - NODE_HEIGHT / 2 - NODE_PADDING,
    maxX: node.x + NODE_WIDTH / 2 + NODE_PADDING,
    maxY: node.y + NODE_HEIGHT / 2 + NODE_PADDING,
  };
}

export function rectanglesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}

// ── Shared utilities ──────────────────────────────────────────────────────────

export function generateId(prefix = "node"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

export function relationFromNodeKind(kind: NodeKind): EdgeRelation {
  switch (kind) {
    case "challenge":
      return "challenges";
    case "perspective":
      return "reframes";
    case "seed":
    case "related":
    default:
      return "expands";
  }
}

export function getCurvedEdgePath(source: Point, target: Point): string {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx ** 2 + dy ** 2);
  const tension = Math.min(Math.max(dist * 0.32, 48), 140);
  const vBias = dy >= 0 ? 1 : -1;
  const c1x = source.x + dx * 0.22;
  const c1y = source.y + dy * 0.08 + tension * vBias;
  const c2x = source.x + dx * 0.78;
  const c2y = target.y - dy * 0.08 - tension * vBias;
  return `M ${source.x} ${source.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${target.x} ${target.y}`;
}

/**
 * Approximate half-dimensions of the seed display card at the canvas origin.
 * Used by getNodeAnchorPoint to clip seed edges to the card boundary.
 * The seed card renders at maxWidth 440px with 32px horizontal padding;
 * at typical text lengths the card is ~340–380px wide — use 190px half-width.
 */
const SEED_HALF_W = 190;
const SEED_HALF_H = 44;

/**
 * Returns the point on the bounding-box edge of `node` in the given
 * `direction` (does not need to be normalised).
 *
 * For the seed node (depth 0) the pill card's half-dimensions are used.
 * For all other nodes the standard NODE_WIDTH / NODE_HEIGHT box is used.
 */
export function getNodeAnchorPoint(
  node: { x: number; y: number; depth?: number },
  direction: { x: number; y: number },
): Point {
  const isSeed = (node.depth ?? 1) === 0;
  const hw = isSeed ? SEED_HALF_W : NODE_WIDTH / 2;
  const hh = isSeed ? SEED_HALF_H : NODE_HEIGHT / 2;

  const { x: dx, y: dy } = direction;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx < 0.0001 && absDy < 0.0001) return { x: node.x, y: node.y };

  const t =
    absDx < 0.0001 ? hh / absDy
    : absDy < 0.0001 ? hw / absDx
    : Math.min(hw / absDx, hh / absDy);

  return { x: node.x + dx * t, y: node.y + dy * t };
}

/**
 * Builds a cubic bezier path whose endpoints sit on the bounding-box edges of
 * `source` and `target` rather than their centers.
 *
 * Control points follow the source → target unit vector, keeping the curve
 * tangent to the branch direction at both ends for an organic, smooth look.
 */
export function getBezierPath(
  source: { x: number; y: number; depth?: number },
  target: { x: number; y: number; depth?: number },
): string {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 1) return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;

  const ux = dx / dist;
  const uy = dy / dist;

  const srcAnchor = getNodeAnchorPoint(source, { x: ux, y: uy });
  const tgtAnchor = getNodeAnchorPoint(target, { x: -ux, y: -uy });

  // Tension scales with distance but is capped so long edges stay readable.
  const tension = Math.min(Math.max(dist * 0.32, 50), 160);

  // Lateral bow: each edge has its own gentle curve personality.
  // Derived from anchor positions so the same pair of nodes always produces
  // the same bow — no jitter on re-render, fully deterministic.
  // Perpendicular direction relative to the edge.
  const px = -uy;
  const py =  ux;
  // High-frequency sinusoidal hash maps the edge's geometric fingerprint to [-1, 1].
  const s = Math.sin(srcAnchor.x * 0.00137 + (srcAnchor.y + tgtAnchor.y * 0.3) * 0.00173) * 43758.5453;
  const bow = ((s - Math.floor(s)) * 2 - 1) * tension * 0.22; // ±22% of tension

  // Both control points bow the same direction → simple arc, not S-curve.
  // The bow magnitude tops out at ±22px for the longest edges — subtle.
  const c1x = srcAnchor.x + ux * tension + px * bow;
  const c1y = srcAnchor.y + uy * tension + py * bow;
  const c2x = tgtAnchor.x - ux * tension + px * bow;
  const c2y = tgtAnchor.y - uy * tension + py * bow;

  // Round all coordinates to 3 decimal places so SSR and client emit
  // byte-identical path strings regardless of floating-point precision.
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return (
    `M ${r(srcAnchor.x)} ${r(srcAnchor.y)} ` +
    `C ${r(c1x)} ${r(c1y)}, ${r(c2x)} ${r(c2y)}, ` +
    `${r(tgtAnchor.x)} ${r(tgtAnchor.y)}`
  );
}

export function createThoughtNode(
  input: {
    label: string;
    description: string;
    kind: NodeKind;
    perspective?: PerspectiveType | null;
  },
  position: Point,
  parentId: string | null,
  depth: number,
  delay = 0.08,
): CanvasNode {
  return {
    id: generateId(input.kind),
    label: input.label,
    description: input.description,
    kind: input.kind,
    perspective: input.perspective ?? null,
    x: position.x,
    y: position.y,
    parentId,
    depth,
    delay,
  };
}

// ── mapGraphResponseToGraph ───────────────────────────────────────────────────

type GraphElements = {
  nodes: CanvasNode[];
  edges: ThoughtEdge[];
};

function buildEdges(seed: ThoughtNode, nodes: ThoughtNode[]): ThoughtEdge[] {
  return nodes.map((node) => ({
    id: generateId("edge"),
    source: node.parentId ?? seed.id,
    target: node.id,
    relation: relationFromNodeKind(node.kind),
  }));
}

export function mapGraphResponseToGraph(
  response: ThoughtGraphResponse,
  options: {
    center?: Point;
    radius?: number;
    generationMode?: GenerationMode;
  } = {},
): GraphElements {
  const center = options.center ?? { x: 0, y: 0 };

  const seed: ThoughtNode = {
    id: "seed-root",
    ...response.seed,
    x: center.x,
    y: center.y,
    depth: 0,
    parentId: null,
  };

  // Provisional positions — overwritten by layoutNodesAsMindMap below.
  const depth1Nodes: CanvasNode[] = [
    ...response.related.map((node, index) => ({
      id: generateId("related"),
      label: node.label,
      description: node.description,
      kind: "related" as const,
      perspective: null,
      x: center.x,
      y: center.y,
      parentId: seed.id,
      depth: 1,
      delay: 0.08 + index * 0.06,
    })),
    {
      id: generateId("challenge"),
      label: response.challenge.label,
      description: response.challenge.description,
      kind: "challenge" as const,
      perspective: null,
      x: center.x,
      y: center.y,
      parentId: seed.id,
      depth: 1,
      delay: 0.24,
    },
    ...response.perspectives.map((node, index) => ({
      id: generateId("perspective"),
      label: node.label,
      description: node.description,
      kind: "perspective" as const,
      perspective: node.perspective,
      x: center.x,
      y: center.y,
      parentId: seed.id,
      depth: 1,
      delay: 0.32 + index * 0.08,
    })),
  ];

  const laidOut = layoutNodesAsMindMap(depth1Nodes, { center });

  return {
    nodes: laidOut,
    edges: buildEdges(seed, laidOut),
  };
}
