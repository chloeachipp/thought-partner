"use client";

import type {
  SectionData,
  SectionId,
  CoreThesisContent,
  NarrativesContent,
  VisualWorldContent,
  SpatialWorldContent,
  SoundWorldContent,
  ContentSystemContent,
  ExecutionContent,
} from "@/types/thought";
import { DIRECTION_SECTIONS } from "@/types/thought";

// Per-section accent
const SECTION_ACCENT: Record<string, { text: string; glow: string; border: string }> = {
  core:       { text: "var(--accent-bright)", glow: "rgba(134,137,233,0.12)", border: "rgba(134,137,233,0.20)" },
  narratives: { text: "rgba(189,179,255,0.95)", glow: "rgba(189,179,255,0.10)", border: "rgba(189,179,255,0.18)" },
  visual:     { text: "rgba(133,182,236,0.95)", glow: "rgba(133,182,236,0.10)", border: "rgba(133,182,236,0.18)" },
  spatial:    { text: "rgba(120,204,187,0.95)", glow: "rgba(120,204,187,0.10)", border: "rgba(120,204,187,0.18)" },
  sound:      { text: "rgba(216,152,214,0.95)", glow: "rgba(216,152,214,0.10)", border: "rgba(216,152,214,0.18)" },
  content:    { text: "rgba(160,170,255,0.95)", glow: "rgba(160,170,255,0.10)", border: "rgba(160,170,255,0.18)" },
  execution:  { text: "rgba(221,176,98,0.95)",  glow: "rgba(221,176,98,0.10)",  border: "rgba(221,176,98,0.18)" },
};

interface Props {
  sectionId: SectionId;
  data: SectionData;
  seed: string;
  onExpand: () => void;
}

function LoadingState() {
  return (
    <div className="section-loading">
      <div className="section-loading-bar" />
      <span className="type-caption" style={{ color: "var(--text-ghost)" }}>
        Generating directions…
      </span>
    </div>
  );
}

/* ── Section-specific renderers ──────────────────────────────────────────── */

function CoreSection({ data }: { data: CoreThesisContent }) {
  return (
    <div className="section-panel-body">
      <div className="section-summary glass" style={{ borderColor: "rgba(134,137,233,0.20)" }}>
        <blockquote className="section-summary-label" style={{ fontStyle: "italic", margin: 0 }}>
          &ldquo;{data.thesis}&rdquo;
        </blockquote>
        <p className="section-summary-desc type-body-sm" style={{ marginTop: 12 }}>
          Mood: {data.mood}
        </p>
      </div>
    </div>
  );
}

function NarrativesSection({ data }: { data: NarrativesContent }) {
  return (
    <div className="section-panel-body">
      <div className="section-directions">
        <span className="section-directions-label type-label">Narrative Directions</span>
        <div className="section-directions-list">
          {data.directions.map((d, i) => (
            <div key={i} className="direction-card" style={{ animationDelay: `${i * 0.06}s` }}>
              <span className="direction-card-index type-caption">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="direction-card-body">
                <h4 className="direction-card-title">{d.title}</h4>
                <p className="direction-card-desc type-body-sm">{d.explanation}</p>
                <p className="type-caption" style={{ color: "var(--text-ghost)", marginTop: 6 }}>
                  {d.resonance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualSection({ data }: { data: VisualWorldContent }) {
  return (
    <div className="section-panel-body">
      <div className="section-directions">
        <span className="section-directions-label type-label">Palette</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {data.palette.map((c, i) => (
            <span key={i} className="direction-card" style={{ padding: "6px 12px", animationDelay: `${i * 0.04}s` }}>
              {c}
            </span>
          ))}
        </div>

        <span className="section-directions-label type-label">Textures</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {data.textures.map((t, i) => (
            <span key={i} className="direction-card" style={{ padding: "6px 12px", animationDelay: `${i * 0.04}s` }}>
              {t}
            </span>
          ))}
        </div>

        <div className="section-summary glass" style={{ borderColor: "rgba(133,182,236,0.18)", marginBottom: 12 }}>
          <h4 className="section-summary-label">Lighting</h4>
          <p className="section-summary-desc type-body-sm">{data.lighting}</p>
        </div>

        <div className="section-summary glass" style={{ borderColor: "rgba(133,182,236,0.18)" }}>
          <h4 className="section-summary-label">Framing</h4>
          <p className="section-summary-desc type-body-sm">{data.framing}</p>
        </div>
      </div>
    </div>
  );
}

function SpatialSection({ data }: { data: SpatialWorldContent }) {
  return (
    <div className="section-panel-body">
      <div className="section-directions">
        <span className="section-directions-label type-label">Environments</span>
        <div className="section-directions-list">
          {data.environments.map((e, i) => (
            <div key={i} className="direction-card" style={{ padding: "10px 14px", animationDelay: `${i * 0.06}s` }}>
              <span className="direction-card-index type-caption">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="direction-card-body">
                <h4 className="direction-card-title">{e}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="section-summary glass" style={{ borderColor: "rgba(120,204,187,0.18)", marginTop: 16, marginBottom: 12 }}>
          <h4 className="section-summary-label">Mood</h4>
          <p className="section-summary-desc type-body-sm">{data.mood}</p>
        </div>

        <div className="section-summary glass" style={{ borderColor: "rgba(120,204,187,0.18)" }}>
          <h4 className="section-summary-label">Symbolism</h4>
          <p className="section-summary-desc type-body-sm">{data.symbolism}</p>
        </div>
      </div>
    </div>
  );
}

function SoundSection({ data }: { data: SoundWorldContent }) {
  return (
    <div className="section-panel-body">
      <div className="section-directions">
        <span className="section-directions-label type-label">Genres / Moods</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {data.genres.map((g, i) => (
            <span key={i} className="direction-card" style={{ padding: "6px 12px", animationDelay: `${i * 0.04}s` }}>
              {g}
            </span>
          ))}
        </div>

        <span className="section-directions-label type-label">Sonic Textures</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {data.textures.map((t, i) => (
            <span key={i} className="direction-card" style={{ padding: "6px 12px", animationDelay: `${i * 0.04}s` }}>
              {t}
            </span>
          ))}
        </div>

        <span className="section-directions-label type-label">References</span>
        <div className="section-directions-list">
          {data.references.map((r, i) => (
            <div key={i} className="direction-card" style={{ padding: "10px 14px", animationDelay: `${i * 0.06}s` }}>
              <div className="direction-card-body">
                <h4 className="direction-card-title">{r}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentSection({ data }: { data: ContentSystemContent }) {
  return (
    <div className="section-panel-body">
      <div className="section-directions">
        <span className="section-directions-label type-label">Formats</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {data.formats.map((f, i) => (
            <span key={i} className="direction-card" style={{ padding: "6px 12px", animationDelay: `${i * 0.04}s` }}>
              {f}
            </span>
          ))}
        </div>

        <span className="section-directions-label type-label">POV Prompts</span>
        <div className="section-directions-list" style={{ marginBottom: 20 }}>
          {data.povPrompts.map((p, i) => (
            <div key={i} className="direction-card" style={{ padding: "10px 14px", animationDelay: `${i * 0.06}s` }}>
              <div className="direction-card-body">
                <p className="direction-card-desc type-body-sm" style={{ fontStyle: "italic" }}>{p}</p>
              </div>
            </div>
          ))}
        </div>

        <span className="section-directions-label type-label">Ideas</span>
        <div className="section-directions-list" style={{ marginBottom: 20 }}>
          {data.ideas.map((idea, i) => (
            <div key={i} className="direction-card" style={{ padding: "10px 14px", animationDelay: `${i * 0.06}s` }}>
              <div className="direction-card-body">
                <h4 className="direction-card-title">{idea}</h4>
              </div>
            </div>
          ))}
        </div>

        <span className="section-directions-label type-label">Storytelling</span>
        <div className="section-directions-list">
          {data.storytelling.map((s, i) => (
            <div key={i} className="direction-card" style={{ padding: "10px 14px", animationDelay: `${i * 0.06}s` }}>
              <div className="direction-card-body">
                <h4 className="direction-card-title">{s}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExecutionSection({ data }: { data: ExecutionContent }) {
  return (
    <div className="section-panel-body">
      <div className="section-directions">
        <span className="section-directions-label type-label">Campaigns</span>
        <div className="section-directions-list" style={{ marginBottom: 20 }}>
          {data.campaigns.map((c, i) => (
            <div key={i} className="direction-card" style={{ padding: "10px 14px", animationDelay: `${i * 0.06}s` }}>
              <span className="direction-card-index type-caption">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="direction-card-body">
                <h4 className="direction-card-title">{c}</h4>
              </div>
            </div>
          ))}
        </div>

        <span className="section-directions-label type-label">Shoot Concepts</span>
        <div className="section-directions-list" style={{ marginBottom: 20 }}>
          {data.shootConcepts.map((s, i) => (
            <div key={i} className="direction-card" style={{ padding: "10px 14px", animationDelay: `${i * 0.06}s` }}>
              <div className="direction-card-body">
                <h4 className="direction-card-title">{s}</h4>
              </div>
            </div>
          ))}
        </div>

        <span className="section-directions-label type-label">Asset Types</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {data.assetTypes.map((a, i) => (
            <span key={i} className="direction-card" style={{ padding: "6px 12px", animationDelay: `${i * 0.04}s` }}>
              {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main SectionPanel ───────────────────────────────────────────────────── */

export default function SectionPanel({ sectionId, data, seed, onExpand }: Props) {
  const section = DIRECTION_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return null;

  const accent = SECTION_ACCENT[sectionId] ?? SECTION_ACCENT.core;
  const { content, loading } = data;

  return (
    <div className="section-panel">
      <header className="section-panel-header">
        <h2 className="section-panel-title" style={{ color: accent.text }}>
          {section.label}
        </h2>
        <div className="section-panel-rule" style={{ background: accent.border }} />
      </header>

      {loading && <LoadingState />}

      {!content && !loading && (
        <div className="section-panel-body">
          <p className="type-body" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Select a section from the left to explore how <em>&ldquo;{seed}&rdquo;</em> unfolds
            across different creative dimensions.
          </p>
        </div>
      )}

      {content?.type === "core" && <CoreSection data={content.data} />}
      {content?.type === "narratives" && <NarrativesSection data={content.data} />}
      {content?.type === "visual" && <VisualSection data={content.data} />}
      {content?.type === "spatial" && <SpatialSection data={content.data} />}
      {content?.type === "sound" && <SoundSection data={content.data} />}
      {content?.type === "content" && <ContentSection data={content.data} />}
      {content?.type === "execution" && <ExecutionSection data={content.data} />}

      {content && !loading && (
        <div style={{ padding: "0 24px 24px" }}>
          <button className="section-expand-btn" onClick={onExpand}>
            <span className="section-expand-btn-icon">↻</span>
            Regenerate this section
          </button>
        </div>
      )}
    </div>
  );
}
