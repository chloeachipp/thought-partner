"use client";

import type { SectionData, SectionId } from "@/types/thought";
import { DIRECTION_SECTIONS } from "@/types/thought";

interface Props {
  seed: string;
  sections: Record<SectionId, SectionData>;
}

/** Pull a short summary string from a section's structured content. */
function sectionSummary(data: SectionData | undefined): string | null {
  if (!data?.content) return null;
  const { type, data: d } = data.content;
  switch (type) {
    case "core": return d.mood;
    case "narratives": return d.directions[0]?.title ?? null;
    case "visual": return d.palette.slice(0, 3).join(", ");
    case "spatial": return d.environments[0] ?? null;
    case "sound": return d.genres.slice(0, 2).join(", ");
    case "content": return d.formats[0] ?? null;
    case "execution": return d.campaigns[0] ?? null;
    default: return null;
  }
}

export default function CorePanel({ seed, sections }: Props) {
  const coreContent = sections.core?.content?.type === "core" ? sections.core.content.data : null;

  // Collect section summaries for the overview grid
  const summaries = DIRECTION_SECTIONS
    .filter((s) => s.id !== "core")
    .map((s) => ({ label: s.label, id: s.id, summary: sectionSummary(sections[s.id]) }))
    .filter((s) => s.summary !== null);

  return (
    <div className="core-panel">
      {/* Main theme card */}
      <div className="core-card glass-deep">
        <div className="core-card-shimmer" aria-hidden="true" />

        {coreContent && (
          <div className="core-mood">
            <span className="core-mood-dot" />
            <span className="core-mood-text">{coreContent.mood}</span>
          </div>
        )}

        <h1 className="core-title">{seed}</h1>

        {coreContent?.thesis && (
          <p className="core-thesis">{coreContent.thesis}</p>
        )}
      </div>

      {/* Section overview grid */}
      {summaries.length > 0 && (
        <div className="core-overview">
          <span className="core-overview-label type-label">Direction overview</span>
          <div className="core-overview-grid">
            {summaries.map((s) => (
              <div key={s.id} className="core-overview-item">
                <span className="core-overview-item-section type-caption">
                  {s.label}
                </span>
                <span className="core-overview-item-label">
                  {s.summary}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
