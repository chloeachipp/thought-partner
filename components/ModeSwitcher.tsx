"use client";

import type { CreativeMode } from "@/types/thought";

interface Props {
  value: CreativeMode;
  onChange: (mode: CreativeMode) => void;
}

const MODES: Array<{ value: CreativeMode; label: string; title: string }> = [
  { value: "concept",   label: "Concept", title: "Abstract ideas, themes, symbolic relationships" },
  { value: "visual",    label: "Visual",  title: "Imagery, textures, aesthetics, form" },
  { value: "emotional", label: "Feeling", title: "Mood, tone, atmosphere, resonance" },
];

// Per-mode active colour palette
const ACTIVE: Record<CreativeMode, { bg: string; border: string; color: string }> = {
  concept:   {
    bg:     "rgba(134, 137, 233, 0.14)",
    border: "rgba(134, 137, 233, 0.30)",
    color:  "rgba(162, 165, 242, 1.00)",
  },
  visual:    {
    bg:     "rgba(212, 168, 80,  0.13)",
    border: "rgba(212, 168, 80,  0.28)",
    color:  "rgba(212, 168, 80,  0.95)",
  },
  emotional: {
    bg:     "rgba(175, 112, 190, 0.13)",
    border: "rgba(175, 112, 190, 0.28)",
    color:  "rgba(195, 140, 210, 0.95)",
  },
};

export default function ModeSwitcher({ value, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Creative mode"
      style={{ display: "flex", alignItems: "center", gap: 3 }}
    >
      {MODES.map((mode) => {
        const active = value === mode.value;
        const s = ACTIVE[mode.value];

        return (
          <button
            key={mode.value}
            className="btn-pill"
            onClick={() => onChange(mode.value)}
            aria-pressed={active}
            title={mode.title}
            style={{
              padding: "5px 10px",
              fontSize: "0.65625rem",
              letterSpacing: "0.05em",
              background:  active ? s.bg     : "transparent",
              borderColor: active ? s.border : "transparent",
              color:       active ? s.color  : "var(--text-ghost)",
              transition:
                "background 0.28s ease, border-color 0.28s ease, color 0.24s ease, transform var(--t-fast) var(--ease-out)",
            }}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
