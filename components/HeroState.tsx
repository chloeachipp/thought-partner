"use client";

import { useRef, useEffect, KeyboardEvent, useState } from "react";
import type { AIProviderChoice } from "@/types/thought";

interface Props {
  onSubmit: (thought: string) => void;
  aiProvider: AIProviderChoice;
  onProviderChange: (provider: AIProviderChoice) => void;
}

const OUTPUT_PREVIEW = [
  "Late-night city energy after a breakup",
  "Digital identity vs real self",
  "Escapism in a hyper-connected world",
  "Romeo & Juliet in a modern city",
];

export default function HeroState({ onSubmit, aiProvider, onProviderChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const hasText = value.trim().length > 0;
  const isActive = focused || hasText;

  useEffect(() => {
    // Slight delay so entrance animation completes before autofocus
    const t = setTimeout(() => textareaRef.current?.focus(), 900);
    return () => clearTimeout(t);
  }, []);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
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

  const handlePromptClick = (prompt: string) => {
    setValue(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div
      className="hero-shell"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
      }}
    >
      {/* ── AI Provider Switch ──────────────────── */}
      <div 
        className="hero-provider-switch-wrap anim-fade-down" 
        style={{ animationDelay: "0.08s" }}
      >
        <div className="hero-provider-switch" role="group" aria-label="AI provider selection">
          <button
            type="button"
            className="hero-provider-track"
            role="switch"
            aria-checked={aiProvider === "anthropic"}
            aria-label={`AI provider: currently ${aiProvider}`}
            onClick={() => onProviderChange(aiProvider === "openai" ? "anthropic" : "openai")}
          >
            {/* Track background */}
            <span className="hero-provider-track-bg" />
            
            {/* Sliding knob */}
            <span className="hero-provider-knob" data-provider={aiProvider} />
            
            {/* Label text */}
            <span className="hero-provider-labels">
              <span className="hero-provider-label hero-provider-label-left">OpenAI</span>
              <span className="hero-provider-label hero-provider-label-right">Anthropic</span>
            </span>
          </button>
        </div>
      </div>

      <div
        className="anim-fade-down"
        style={{ animationDelay: "0.1s", textAlign: "center", marginBottom: 14 }}
      >
        <span
          className="type-wordmark"
          style={{
            fontSize: "0.625rem",
            letterSpacing: "0.28em",
            color: "var(--accent-dim)",
          }}
        >
          Creative Direction Engine
        </span>
      </div>

      {/* ── Headline ──────────────────────────── */}
      <div
        className="anim-fade-up hero-copy"
        style={{ animationDelay: "0.22s", textAlign: "center", marginBottom: 50 }}
      >
        <h1
          className="hero-title"
          style={{
            fontSize: "clamp(2.2rem, 4.8vw, 3.6rem)",
            fontWeight: 200,
            lineHeight: 1.18,
            letterSpacing: "-0.036em",
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          Build the world behind the idea.
        </h1>
        <p
          className="type-body hero-subtitle"
          style={{
            margin: "16px auto 0",
            maxWidth: 760,
            color: "var(--text-secondary)",
          }}
        >
          Turn a single concept into a complete creative direction across visuals, sound, space, and story.
        </p>
      </div>

      {/* ── Input container ───────────────────── */}
      <div
        className="anim-fade-up hero-input-wrap"
        style={{
          animationDelay: "0.38s",
          width: "100%",
          maxWidth: "620px",
          position: "relative",
        }}
      >
        {/* Ambient glow — intensifies on focus */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-60px -80px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(134,137,233,0.08) 0%, transparent 68%)",
            opacity: isActive ? 1 : 0.3,
            transition: "opacity 0.7s ease",
            pointerEvents: "none",
          }}
        />

        {/* Input card */}
        <div
          className="hero-input-card"
          style={{
            position: "relative",
            borderRadius: "var(--r-xl)",
            overflow: "hidden",
            transition:
              "box-shadow var(--t-slow) var(--ease-smooth)",
            boxShadow: isActive
              ? "0 0 0 1.5px rgba(134,137,233,0.55), 0 0 0 4px rgba(134,137,233,0.07), 0 20px 48px rgba(0,0,0,0.44)"
              : "0 0 0 1.5px rgba(255,255,255,0.12), 0 10px 32px rgba(0,0,0,0.30)",
            background: "rgba(11, 12, 20, 0.90)",
            backdropFilter: "blur(var(--blur-xl)) saturate(1.4)",
            WebkitBackdropFilter: "blur(var(--blur-xl)) saturate(1.4)",
          }}
        >
          {/* Top border line */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background: isActive
                ? "rgba(134,137,233,0.45)"
                : "rgba(255,255,255,0.10)",
              transition: "background 0.4s ease",
            }}
          />

          {/* Textarea */}
          <textarea
            className="hero-textarea"
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={1}
            spellCheck={false}
            autoComplete="off"
            placeholder={"Enter a concept, theme, or mood...\nWe'll build the full creative direction around it."}
            aria-label="Enter an idea"
            style={{
              display: "block",
              width: "100%",
              resize: "none",
              background: "transparent",
              border: "none",
              outline: "none",
              padding: "24px 24px 20px",
              fontSize: "clamp(1rem, 1.7vw, 1.2rem)",
              fontWeight: 300,
              lineHeight: 1.56,
              letterSpacing: "-0.015em",
              color: "var(--text-primary)",
              caretColor: "var(--accent-bright)",
              fontFamily: "inherit",
              minHeight: "82px",
              overflow: "hidden",
              // Placeholder color via CSS
            }}
          />

          {/* Bottom action bar */}
          <div
            className="hero-action-row"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px 14px",
              gap: 12,
            }}
          >
            <span
              className="type-caption hero-hint"
              style={{
                color: "var(--text-ghost)",
                opacity: isActive ? 1 : 0,
                transform: isActive ? "none" : "translateX(-4px)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
                letterSpacing: "0.07em",
              }}
            >
              Shift+Enter for new line
            </span>

            <button
              onClick={handleSubmit}
              disabled={!hasText}
              className="btn-pill hero-cta"
              style={{
                opacity: hasText ? 1 : 0,
                transform: hasText ? "none" : "translateY(4px)",
                transition:
                  "opacity 0.3s ease, transform 0.3s var(--ease-out), background var(--t-fast) var(--ease-smooth), border-color var(--t-fast) var(--ease-smooth), color var(--t-fast) var(--ease-smooth)",
                background: "rgba(134,137,233,0.20)",
                borderColor: "rgba(134,137,233,0.52)",
                color: "var(--accent-bright)",
                padding: "8px 20px",
                letterSpacing: "0.04em",
                fontWeight: 500,
              }}
              aria-label="Begin exploring"
            >
              Build World →
            </button>
          </div>
        </div>
      </div>

      {/* ── Curated prompt suggestions ─────────── */}
      <div
        className="anim-fade-up hero-prompt-zone"
        style={{
          animationDelay: "0.55s",
          marginTop: 28,
          width: "100%",
          maxWidth: "760px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          opacity: hasText ? 0 : 1,
          transform: hasText ? "translateY(4px)" : "none",
          transition: "opacity 0.35s ease, transform 0.35s ease",
          pointerEvents: hasText ? "none" : "auto",
        }}
      >
        <span className="type-label hero-prompt-label">Try a direction like:</span>

        <div className="hero-prompt-chips" role="list" aria-label="Curated creative direction prompts">
        {OUTPUT_PREVIEW.map((item) => (
          <button
            key={item}
            type="button"
            role="listitem"
            className="hero-prompt-chip"
            onClick={() => handlePromptClick(item)}
          >
            {item}
          </button>
        ))}
        </div>
      </div>
    </div>
  );
}
