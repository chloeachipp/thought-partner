"use client";

import type { SceneWeaverResult, RefinementAction } from "@/types/sceneweaver";
import { useState, useRef, useEffect, type KeyboardEvent } from "react";

interface Props {
  result: SceneWeaverResult;
  isLoading: boolean;
  canCompare: boolean;
  onRefine: (action: RefinementAction) => void;
  onCompare: () => void;
  onNewScene: () => void;
  meta: { provider: string | null; fallback: boolean } | null;
  activeRefinement: RefinementAction | null;
  pendingRefinement: RefinementAction | null;
  resultVersion: number;
}

const REFINEMENT_CONTROLS: { action: RefinementAction; label: string; icon: string }[] = [
  { action: "darker", label: "Make it darker", icon: "◐" },
  { action: "more-intimate", label: "Make it more intimate", icon: "◉" },
  { action: "more-surreal", label: "Make it more surreal", icon: "◎" },
  { action: "adapt-music-video", label: "Adapt for music video", icon: "▸" },
  { action: "adapt-short-film", label: "Adapt for short film", icon: "▣" },
  { action: "reweave", label: "Reweave", icon: "↻" },
];

export default function SceneWeaverResult({
  result,
  isLoading,
  canCompare,
  onRefine,
  onCompare,
  onNewScene,
  meta,
  activeRefinement,
  pendingRefinement,
  resultVersion,
}: Props) {
  const pendingLabel = REFINEMENT_CONTROLS.find(
    (ctrl) => ctrl.action === pendingRefinement,
  )?.label;

  return (
    <div className="sw-result-page">
      {isLoading && (
        <div className="sw-result-loading">
          <span className="sw-result-loading-dot" />
          <span className="sw-result-loading-text">
            Reweaving scene{pendingLabel ? `: ${pendingLabel}` : "..."}
          </span>
        </div>
      )}

      <div key={resultVersion} className="sw-result-inner sw-result-refresh">

        {/* ═══ 1. HERO PANEL ═══ */}
        <section className="sw-result-hero sw-anim-rise">
          <div className="sw-result-hero-inner">
            <span className="sw-wordmark">SceneWeaver</span>
            <h1 className="sw-result-title">{result.title}</h1>
            <p className="sw-result-prompt">&ldquo;{result.prompt}&rdquo;</p>
            <div className="sw-result-tags">
              {result.tags.map((tag, i) => (
                <span key={i} className="sw-chip">{tag}</span>
              ))}
            </div>
            {meta && (
              <span className="sw-badge" style={{ marginTop: 20 }}>
                {meta.fallback ? "mock data" : meta.provider}
              </span>
            )}
          </div>
        </section>

        {/* ═══ 2. SCENE SUMMARY ═══ */}
        <section className="sw-anim-rise" style={{ animationDelay: "0.08s" }}>
          <div className="sw-hero-card sw-result-summary">
            <div className="sw-result-summary-grid">
              <div className="sw-result-summary-main">
                <span className="sw-section-label">◎ Scene Summary</span>
                <p className="sw-pullquote" style={{ margin: "20px 0 0" }}>
                  {result.sceneSummary.logline}
                </p>
              </div>
              <div className="sw-result-summary-meta">
                <div>
                  <span className="sw-label">Emotional Core</span>
                  <p className="sw-body">{result.sceneSummary.emotionalCore}</p>
                </div>
                <div className="sw-result-world">
                  <span className="sw-label">World</span>
                  <p className="sw-result-world-text">{result.sceneSummary.worldIn2Words}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 3. EMOTIONAL ARC — horizontal timeline ═══ */}
        <section className="sw-anim-rise" style={{ animationDelay: "0.12s" }}>
          <SectionHeader icon="◐" label="Emotional Arc" />
          <div className="sw-arc-track">
            {(["opening", "tension", "peak", "resolution"] as const).map((k, i) => (
              <div key={k} className="sw-arc-beat" data-beat={k}>
                <span className="sw-arc-marker">{i + 1}</span>
                <span className="sw-label sw-label-accent">{k}</span>
                <p className="sw-body">{result.emotionalArc[k]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ 4. NARRATIVE TENSION ═══ */}
        <section className="sw-anim-rise" style={{ animationDelay: "0.16s" }}>
          <SectionHeader icon="⧖" label="Narrative Tension" />
          <div className="sw-tension-grid">
            <div className="sw-section-card" data-expanded="true">
              <span className="sw-section-label sw-label-accent">Central Conflict</span>
              <p className="sw-body" style={{ marginTop: 12 }}>{result.narrativeTension.centralConflict}</p>
            </div>
            <div className="sw-section-card" data-expanded="true">
              <span className="sw-section-label sw-label-accent">Subtext</span>
              <p className="sw-body" style={{ marginTop: 12 }}>{result.narrativeTension.subtext}</p>
            </div>
            <div className="sw-section-card" data-expanded="true">
              <span className="sw-section-label sw-label-accent">Stakes</span>
              <p className="sw-body" style={{ marginTop: 12 }}>{result.narrativeTension.stakes}</p>
            </div>
          </div>
        </section>

        {/* ═══ 5. VISUAL LANGUAGE ═══ */}
        <section className="sw-anim-rise" style={{ animationDelay: "0.20s" }}>
          <SectionHeader icon="◈" label="Visual Language" />
          <ImageryScrollStrip items={result.visualLanguage.dominantImagery} />
          <div className="sw-two-col" style={{ marginTop: 24 }}>
            <div>
              <span className="sw-label">Motion Quality</span>
              <p className="sw-body">{result.visualLanguage.motionQuality}</p>
            </div>
            <div>
              <span className="sw-label">Texture Notes</span>
              <p className="sw-body">{result.visualLanguage.textureNotes}</p>
            </div>
          </div>
        </section>

        {/* ═══ 6. CAMERA DIRECTION ═══ */}
        <section className="sw-anim-rise" style={{ animationDelay: "0.24s" }}>
          <SectionHeader icon="▣" label="Camera Direction" />
          <div className="sw-camera-layout">
            <div className="sw-camera-philosophy">
              <span className="sw-label">Style</span>
              <p className="sw-body-lg">{result.cameraDirection.style}</p>
              <div style={{ marginTop: 20 }}>
                <span className="sw-label">Movement</span>
                <p className="sw-body">{result.cameraDirection.movement}</p>
              </div>
            </div>
            <div className="sw-shot-list">
              <span className="sw-label">Key Shots</span>
              <ol className="sw-shot-items">
                {result.cameraDirection.keyShots.map((shot, i) => (
                  <li key={i} className="sw-shot-item">
                    <span className="sw-shot-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="sw-body">{shot}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ═══ 7. LIGHTING & COLOUR ═══ */}
        <section className="sw-anim-rise" style={{ animationDelay: "0.28s" }}>
          <SectionHeader icon="◑" label="Lighting & Colour" />
          <div className="sw-hero-card">
            <div className="sw-palette-strip">
              {result.lightingAndColour.palette.map((colour, i) => (
                <span key={i} className="sw-palette-swatch">{colour}</span>
              ))}
            </div>
            <div className="sw-light-grid" style={{ marginTop: 28 }}>
              <div>
                <span className="sw-label">Mood</span>
                <p className="sw-body">{result.lightingAndColour.mood}</p>
              </div>
              <div>
                <span className="sw-label">Contrast</span>
                <p className="sw-body">{result.lightingAndColour.contrast}</p>
              </div>
              <div>
                <span className="sw-label">Temperature</span>
                <p className="sw-body">{result.lightingAndColour.temperature}</p>
              </div>
              <div>
                <span className="sw-label">Grade</span>
                <p className="sw-body">{result.lightingAndColour.grade}</p>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <span className="sw-label">Key Light Sources</span>
              <ul className="sw-list">
                {result.lightingAndColour.keyLightSources.map((src, i) => (
                  <li key={i} className="sw-list-item">{src}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ═══ 8. SOUND TEXTURE ═══ */}
        <section className="sw-anim-rise" style={{ animationDelay: "0.32s" }}>
          <SectionHeader icon="≈" label="Sound Texture" />
          <div className="sw-sound-layout">
            <div className="sw-sound-ambience">
              <span className="sw-label">Ambience</span>
              <ul className="sw-list">
                {result.soundTexture.ambience.map((item, i) => (
                  <li key={i} className="sw-list-item">{item}</li>
                ))}
              </ul>
            </div>
            <div className="sw-sound-meta">
              <div className="sw-inner-panel" style={{ marginBottom: 16 }}>
                <span className="sw-label">Music Direction</span>
                <p className="sw-body" style={{ marginTop: 8 }}>{result.soundTexture.musicDirection}</p>
              </div>
              <div className="sw-inner-panel">
                <span className="sw-label">Silence</span>
                <p className="sw-body" style={{ marginTop: 8 }}>{result.soundTexture.silenceNotes}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 9. PACING + DIALOGUE — side by side ═══ */}
        <section className="sw-anim-rise" style={{ animationDelay: "0.36s" }}>
          <div className="sw-dual-section">
            <div>
              <SectionHeader icon="⏤" label="Pacing & Rhythm" />
              <div className="sw-section-card" data-expanded="true">
                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <span className="sw-label">Overall Tempo</span>
                    <p className="sw-body">{result.pacingAndRhythm.overallTempo}</p>
                  </div>
                  <div>
                    <span className="sw-label">Edit Style</span>
                    <p className="sw-body">{result.pacingAndRhythm.editStyle}</p>
                  </div>
                  <div>
                    <span className="sw-label">Breathing Room</span>
                    <p className="sw-body">{result.pacingAndRhythm.breathingRoom}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <SectionHeader icon="❝" label="Dialogue Tone" />
              <div className="sw-section-card" data-expanded="true">
                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <span className="sw-label">Style</span>
                    <p className="sw-body">{result.dialogueTone.style}</p>
                  </div>
                  <div className="sw-blockquote">{result.dialogueTone.sampleLine}</div>
                  <div>
                    <span className="sw-label">Silence vs Dialogue</span>
                    <p className="sw-body">{result.dialogueTone.silenceVsDialogue}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 10. MOTIFS & SYMBOLISM ═══ */}
        <section className="sw-anim-rise" style={{ animationDelay: "0.40s" }}>
          <SectionHeader icon="⊘" label="Motifs & Symbolism" />
          <div className="sw-hero-card">
            <div className="sw-motif-pills">
              {result.motifsAndSymbolism.motifs.map((motif, i) => (
                <span key={i} className="sw-motif-pill">{motif}</span>
              ))}
            </div>
            <div className="sw-two-col" style={{ marginTop: 24 }}>
              <div>
                <span className="sw-label">Symbolism</span>
                <p className="sw-body">{result.motifsAndSymbolism.symbolism}</p>
              </div>
              <div>
                <span className="sw-label">Recurring Elements</span>
                <p className="sw-body">{result.motifsAndSymbolism.recurringElements}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 11. ALTERNATE DIRECTIONS — scroll strip ═══ */}
        <section className="sw-anim-rise" style={{ animationDelay: "0.44s" }}>
          <SectionHeader icon="⊷" label="Alternate Directions" />
          <div className="sw-alt-scroll">
            {result.alternateDirections.map((alt, i) => (
              <div key={i} className="sw-alt-card">
                <span className="sw-alt-num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="sw-alt-title">{alt.title}</h3>
                <p className="sw-body" style={{ marginBottom: 12 }}>{alt.angle}</p>
                <span className="sw-label">Key Shift</span>
                <p className="sw-body sw-label-accent">{alt.shift}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ 12. ADAPTATION MODES ═══ */}
        <section className="sw-anim-rise" style={{ animationDelay: "0.48s" }}>
          <SectionHeader icon="⊞" label="Adaptation Modes" />
          <div className="sw-adapt-grid">
            {result.adaptationModes.map((mode, i) => (
              <div key={i} className="sw-adapt-card">
                <span className="sw-tag">{mode.format}</span>
                <p className="sw-body" style={{ margin: "14px 0 12px" }}>{mode.description}</p>
                <div className="sw-adapt-twist">
                  <span className="sw-label">The Twist</span>
                  <p className="sw-body sw-label-accent">{mode.twist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ 13. FOLLOW-UP PROMPTS ═══ */}
        {result.followUpPrompts.length > 0 && (
          <section className="sw-anim-rise" style={{ animationDelay: "0.52s" }}>
            <SectionHeader icon="→" label="Explore Further" />
            <div className="sw-followup-grid">
              {result.followUpPrompts.map((fp, i) => (
                <button
                  key={i}
                  type="button"
                  className="sw-followup-card"
                  onClick={() => onRefine("reweave")}
                  disabled={isLoading}
                >
                  <span className="sw-followup-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="sw-body">{fp}</span>
                  <span className="sw-followup-arrow">→</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ═══ TOOLBAR ═══ */}
        <div className="sw-result-toolbar-wrap">
          <div className="sw-toolbar">
            {REFINEMENT_CONTROLS.map((ctrl) => (
              <button
                key={ctrl.action}
                type="button"
                className={`sw-btn ${activeRefinement === ctrl.action ? "sw-btn-accent" : ""}`}
                data-active={activeRefinement === ctrl.action}
                data-pending={pendingRefinement === ctrl.action}
                onClick={() => onRefine(ctrl.action)}
                disabled={isLoading}
                title={ctrl.label}
              >
                <span className="sw-btn-icon">{ctrl.icon}</span>
                {ctrl.label}
              </button>
            ))}
            <div className="sw-toolbar-divider" />
            {canCompare && (
              <button
                type="button"
                className="sw-btn sw-btn-accent"
                onClick={onCompare}
                disabled={isLoading}
              >
                Compare
              </button>
            )}
            <button
              type="button"
              className="sw-btn sw-btn-ghost"
              onClick={onNewScene}
              disabled={isLoading}
            >
              New Scene
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="sw-section-header">
      <span className="sw-section-header-icon">{icon}</span>
      <span className="sw-section-header-label">{label}</span>
      <div className="sw-section-header-line" />
    </div>
  );
}

function ImageryScrollStrip({ items }: { items: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="sw-imagery-wrap">
      {canScrollLeft && (
        <button className="sw-imagery-arrow sw-imagery-arrow-left" onClick={() => scroll(-1)} type="button" aria-label="Scroll left">‹</button>
      )}
      <div ref={scrollRef} className="sw-imagery-scroll">
        {items.map((item, i) => (
          <div key={i} className="sw-imagery-card">
            <span className="sw-imagery-num">{String(i + 1).padStart(2, "0")}</span>
            <p className="sw-body">{item}</p>
          </div>
        ))}
      </div>
      {canScrollRight && (
        <button className="sw-imagery-arrow sw-imagery-arrow-right" onClick={() => scroll(1)} type="button" aria-label="Scroll right">›</button>
      )}
    </div>
  );
}
