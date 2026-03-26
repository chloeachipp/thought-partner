import type { ReactNode } from "react";

interface SeedLoadingNodeProps {
  label: string;
  isGenerating: boolean;
  generationPhase?: "related" | "challenge" | "perspective" | "complete";
}

export default function SeedLoadingNode({
  label,
  isGenerating,
  generationPhase = "related",
}: SeedLoadingNodeProps) {
  const statusText = isGenerating
    ? generationPhase === "related"
      ? "Forming perspectives…"
      : generationPhase === "challenge"
        ? "Exploring tensions…"
        : generationPhase === "perspective"
          ? "Synthesizing viewpoints…"
          : "Structuring space…"
    : undefined;

  return (
    <div
      className="seed-loading-node"
      data-state={isGenerating ? "breathing" : "ready"}
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 50,
      }}
    >
      {/* Main node container with breathing animation */}
      <div className="seed-node-container">
        <div className="seed-node-glow" />
        <div className="seed-node-card">
          <div className="seed-node-content">
            <div className="seed-node-label">{label}</div>
          </div>
        </div>
      </div>

      {/* Status text below node */}
      {statusText && (
        <div className="seed-status-text" style={{ opacity: isGenerating ? 1 : 0 }}>
          {statusText}
        </div>
      )}
    </div>
  );
}
