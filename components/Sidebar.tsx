"use client";

import { DIRECTION_SECTIONS } from "@/types/thought";
import type { SectionData, SectionId } from "@/types/thought";

// Per-section accent colour
const SECTION_ACCENT: Record<string, string> = {
  core:       "var(--accent-bright)",
  narratives: "rgba(189, 179, 255, 0.95)",
  visual:     "rgba(133, 182, 236, 0.95)",
  spatial:    "rgba(120, 204, 187, 0.95)",
  sound:      "rgba(216, 152, 214, 0.95)",
  content:    "rgba(160, 170, 255, 0.95)",
  execution:  "rgba(221, 176, 98, 0.95)",
};

const SECTION_ICON: Record<string, string> = {
  core:       "◆",
  narratives: "◇",
  visual:     "◈",
  spatial:    "▣",
  sound:      "◎",
  content:    "⬡",
  execution:  "▲",
};

interface Props {
  activeSection: SectionId;
  sections: Record<SectionId, SectionData>;
  generationMode: "fallback" | "provider";
  provider: string | null;
  onSelect: (id: SectionId) => void;
  onReset: () => void;
}

export default function Sidebar({
  activeSection,
  sections,
  generationMode,
  provider,
  onSelect,
  onReset,
}: Props) {
  const isFallback = generationMode === "fallback";

  const providerDisplay = (() => {
    if (isFallback || !provider) return "Local";
    const v = provider.toLowerCase();
    if (v.includes("anthropic")) return "Anthropic";
    if (v.includes("openai")) return "OpenAI";
    return "AI";
  })();

  return (
    <aside className="sidebar">
      {/* Wordmark */}
      <div className="sidebar-header">
        <span className="type-wordmark" style={{ color: "var(--accent-dim)" }}>
          Thought Partner
        </span>
        <button className="sidebar-reset" onClick={onReset} title="New direction">
          New
        </button>
      </div>

      {/* Section navigation */}
      <nav className="sidebar-nav">
        {DIRECTION_SECTIONS.map((sec) => {
          const active = activeSection === sec.id;
          const accent = SECTION_ACCENT[sec.id] ?? "var(--text-tertiary)";
          const icon = SECTION_ICON[sec.id] ?? "●";
          const data = sections[sec.id];
          const hasContent = !!data?.content;
          const isExpanded = hasContent;

          return (
            <button
              key={sec.id}
              className={`sidebar-item${active ? " sidebar-item-active" : ""}`}
              onClick={() => onSelect(sec.id)}
              style={{
                "--section-accent": accent,
              } as React.CSSProperties}
            >
              <span className="sidebar-item-icon" style={{ color: active ? accent : "var(--text-ghost)" }}>
                {icon}
              </span>
              <span className="sidebar-item-label">{sec.label}</span>
              {hasContent && (
                <span
                  className="sidebar-item-dot"
                  style={{
                    background: isExpanded ? accent : "var(--text-ghost)",
                    opacity: isExpanded ? 0.8 : 0.3,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Provider badge */}
      <div className="sidebar-footer">
        <div className="sidebar-provider">
          <span
            className="sidebar-provider-dot"
            style={{
              background: isFallback ? "rgba(215, 88, 84, 0.9)" : "var(--accent)",
            }}
          />
          <span className="type-caption" style={{ color: "var(--text-secondary)" }}>
            {providerDisplay}
          </span>
          {isFallback && (
            <span className="type-caption" style={{ color: "var(--text-ghost)", marginLeft: 4 }}>
              Local mode
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
