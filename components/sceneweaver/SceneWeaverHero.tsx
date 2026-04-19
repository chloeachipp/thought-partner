"use client";

import { useRef, useEffect, useState, type KeyboardEvent } from "react";
import type { AIProviderChoice } from "@/types/thought";

interface Props {
  onSubmit: (prompt: string) => void;
  aiProvider: AIProviderChoice;
  onProviderChange: (provider: AIProviderChoice) => void;
}

const EXAMPLE_PROMPTS = [
  {
    text: "A late-night train station goodbye that feels emotionally numb rather than dramatic.",
    tag: "departure",
  },
  {
    text: "Two strangers share a cigarette on a fire escape during a blackout.",
    tag: "strangers",
  },
  {
    text: "A dancer rehearses alone in a warehouse — the choreography keeps breaking down at the same moment.",
    tag: "repetition",
  },
  {
    text: "A couple drives through fog at 4am. Nobody has spoken for twenty minutes.",
    tag: "silence",
  },
  {
    text: "Someone returns to their hometown after ten years and sits in a diner they used to know.",
    tag: "return",
  },
];

const OUTPUT_PREVIEW_SECTIONS = [
  "Emotional Arc",
  "Visual Language",
  "Camera Direction",
  "Lighting & Colour",
  "Sound Texture",
  "Pacing & Rhythm",
  "Motifs & Symbolism",
  "Alternate Directions",
  "Dialogue Tone",
  "Adaptation Modes",
];

export default function SceneWeaverHero({
  onSubmit,
  aiProvider,
  onProviderChange,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const hasText = value.trim().length > 0;
  const isActive = focused || hasText;

  // Subtle reveal sequencing
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Auto-focus
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 1200);
    return () => clearTimeout(t);
  }, []);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
  };

  return (
    <div className="sw-landing">
      <div className="sw-landing-scroll">

        {/* ═══════════════════════════════════════════════════════
            TOP: Cinematic hero zone
         ═══════════════════════════════════════════════════════ */}
        <div className="sw-landing-hero">

          {/* Provider toggle — top right, discreet */}
          <div className="sw-landing-provider sw-landing-anim-fade" style={{ animationDelay: "0.45s" }}>
            <div className="sw-provider-toggle">
              <button
                type="button"
                className="sw-provider-opt"
                data-active={aiProvider === "openai"}
                onClick={() => onProviderChange("openai")}
              >
                OpenAI
              </button>
              <button
                type="button"
                className="sw-provider-opt"
                data-active={aiProvider === "anthropic"}
                onClick={() => onProviderChange("anthropic")}
              >
                Anthropic
              </button>
            </div>
          </div>

          {/* Wordmark */}
          <div
            className="sw-landing-anim-sink"
            style={{ animationDelay: "0.18s", textAlign: "center" }}
          >
            <span className="sw-wordmark">SceneWeaver</span>
          </div>

          {/* Hero headline */}
          <div
            className="sw-landing-anim-rise"
            style={{ animationDelay: "0.28s", textAlign: "center", marginTop: 12 }}
          >
            <h1 className="sw-landing-headline">
              Shape a scene
              <br />
              <span className="sw-landing-headline-accent">before it exists.</span>
            </h1>
          </div>

          {/* Supporting copy */}
          <p
            className="sw-landing-sub sw-landing-anim-rise"
            style={{ animationDelay: "0.36s" }}
          >
            Turn a rough feeling into filmable direction — emotional arc,
            visual language, camera notes, sound design, colour grade.
            AI-native scene development for filmmakers and visual storytellers.
          </p>

          {/* ── Input area ── */}
          <div
            className="sw-landing-input-zone sw-landing-anim-rise"
            style={{ animationDelay: "0.5s" }}
          >
            {/* Glow */}
            <div
              aria-hidden="true"
              className="sw-landing-input-glow"
              data-active={isActive}
            />

            <div className="sw-input-shell" data-active={isActive}>
              <textarea
                ref={textareaRef}
                className="sw-textarea"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={handleKey}
                placeholder="A rooftop at dusk. Two old friends. One of them is about to say something that changes everything..."
                rows={3}
              />
              <div className="sw-landing-input-footer">
                <span className="sw-meta">↵ Enter to weave</span>
                <button
                  type="button"
                  className={`sw-btn ${hasText ? "sw-btn-primary" : "sw-btn-ghost"}`}
                  onClick={handleSubmit}
                  disabled={!hasText}
                >
                  Weave Scene
                </button>
              </div>
            </div>
          </div>

          {/* ── Example prompts ── */}
          <div
            className="sw-landing-prompts sw-landing-anim-rise"
            style={{ animationDelay: "0.62s" }}
          >
            <span className="sw-label" style={{ textAlign: "center", letterSpacing: "0.2em" }}>
              Or start from a scene
            </span>
            <div className="sw-landing-prompt-grid">
              {EXAMPLE_PROMPTS.map(({ text, tag }) => (
                <button
                  key={tag}
                  type="button"
                  className="sw-landing-prompt-card"
                  onClick={() => {
                    setValue(text);
                    textareaRef.current?.focus();
                  }}
                >
                  <span className="sw-landing-prompt-tag">{tag}</span>
                  <span className="sw-landing-prompt-text">{text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            BELOW FOLD: Output preview hint
         ═══════════════════════════════════════════════════════ */}
        <div
          className={`sw-landing-preview ${revealed ? "sw-landing-preview--visible" : ""}`}
        >
          <div className="sw-landing-preview-inner">
            <div className="sw-section-header" style={{ justifyContent: "center" }}>
              <span className="sw-section-header-label">What you&apos;ll get</span>
            </div>

            <p className="sw-landing-preview-body">
              Every prompt generates a complete scene interpretation —
              not a script, but the creative DNA of a filmable moment.
            </p>

            <div className="sw-landing-preview-grid">
              {OUTPUT_PREVIEW_SECTIONS.map((section) => (
                <div key={section} className="sw-landing-preview-tile">
                  <span className="sw-landing-preview-tile-label">{section}</span>
                </div>
              ))}
            </div>

            <p className="sw-landing-preview-footnote">
              Refine endlessly. Compare versions. Adapt across formats.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
