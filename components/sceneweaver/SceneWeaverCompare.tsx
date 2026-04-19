"use client";

import type { SceneWeaverResult } from "@/types/sceneweaver";

interface Props {
  current: SceneWeaverResult;
  previous: SceneWeaverResult;
  onExit: () => void;
}

export default function SceneWeaverCompare({ current, previous, onExit }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        overflow: "auto",
        padding: "0 24px 80px",
      }}
    >
      <div style={{ maxWidth: 1140, margin: "0 auto", paddingTop: 56 }}>
        <header className="sw-anim-sink" style={{ marginBottom: 44, textAlign: "center" }}>
          <span className="sw-wordmark" style={{ display: "block", marginBottom: 14 }}>
            Compare Directions
          </span>
          <h1
            className="sw-headline"
            style={{ margin: "0 0 24px", fontStyle: "italic", fontWeight: 200 }}
          >
            &ldquo;{current.prompt}&rdquo;
          </h1>
          <button type="button" className="sw-btn sw-btn-ghost" onClick={onExit}>
            ← Back to result
          </button>
        </header>

        <div
          className="sw-compare-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          <CompareColumn label="Previous" result={previous} isCurrent={false} />
          <CompareColumn label="Current" result={current} isCurrent={true} />
        </div>
      </div>
    </div>
  );
}

function CompareColumn({
  label,
  result,
  isCurrent,
}: {
  label: string;
  result: SceneWeaverResult;
  isCurrent: boolean;
}) {

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        className="sw-compare-col-header"
        style={{
          borderLeft: isCurrent
            ? "2px solid var(--sw-accent-muted)"
            : "2px solid var(--text-ghost)",
        }}
      >
        <span
          style={{
            fontSize: "0.5625rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            color: isCurrent ? "var(--sw-accent-muted)" : "var(--text-tertiary)",
          }}
        >
          {label}
        </span>
      </div>

      <div className="sw-compare-card">
        <span className="sw-label">Scene Summary</span>
        <p className="sw-body-lg" style={{ margin: "8px 0 14px" }}>
          {result.sceneSummary.logline}
        </p>
        <span className="sw-label">World</span>
        <p
          className="sw-body"
          style={{
            margin: 0,
            fontStyle: "italic",
            color: isCurrent ? "var(--sw-accent-muted)" : "var(--text-secondary)",
          }}
        >
          {result.sceneSummary.worldIn2Words}
        </p>
      </div>

      <div className="sw-compare-card">
        <span className="sw-label" style={{ marginBottom: 12 }}>Emotional Arc</span>
        {(["opening", "tension", "peak", "resolution"] as const).map((k) => (
          <div key={k} style={{ marginBottom: 10 }}>
            <span className="sw-label">{k}</span>
            <p className="sw-body" style={{ margin: 0 }}>{result.emotionalArc[k]}</p>
          </div>
        ))}
      </div>

      <div className="sw-compare-card">
        <span className="sw-label" style={{ marginBottom: 12 }}>Visual Language</span>
        <ul className="sw-list">
          {result.visualLanguage.dominantImagery.map((img, i) => (
            <li key={i} className="sw-list-item">{img}</li>
          ))}
        </ul>
      </div>

      <div className="sw-compare-card">
        <span className="sw-label" style={{ marginBottom: 12 }}>Colour Palette</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {result.lightingAndColour.palette.map((c, i) => (
            <span key={i} className="sw-chip" style={{ fontSize: "0.6875rem" }}>{c}</span>
          ))}
        </div>
      </div>

      <div className="sw-compare-card">
        <span className="sw-label" style={{ marginBottom: 8 }}>Sound — Music Direction</span>
        <p className="sw-body" style={{ margin: 0 }}>{result.soundTexture.musicDirection}</p>
      </div>

      <div className="sw-compare-card">
        <span className="sw-label" style={{ marginBottom: 8 }}>Dialogue Tone</span>
        <p className="sw-body sw-blockquote" style={{ margin: 0 }}>
          {result.dialogueTone.sampleLine}
        </p>
      </div>
    </div>
  );
}
