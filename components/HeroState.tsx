"use client";

import { useRef, useEffect, KeyboardEvent, useState } from "react";

interface Props {
  onSubmit: (thought: string) => void;
}

const OUTPUT_PREVIEW = [
  "Narratives",
  "Visual World",
  "Spatial Direction",
  "Sound & Tone",
  "Content System",
  "Execution Ideas",
];

export default function HeroState({ onSubmit }: Props) {
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

  return (
    <div
      className="hero-shell"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        zIndex: 10,
      }}
    >
      {/* ── Product name ──────────────────────── */}
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
          Thought Partner
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
        {/* Faint floating labels around the input */}
        <span className="hero-floating-label" style={{ top: -30, left: 6, animationDelay: "0.2s" }}>
          Visual
        </span>
        <span className="hero-floating-label" style={{ top: -34, right: 18, animationDelay: "1.2s" }}>
          Sound
        </span>
        <span className="hero-floating-label" style={{ bottom: -28, left: 24, animationDelay: "0.8s" }}>
          Space
        </span>
        <span className="hero-floating-label" style={{ bottom: -30, right: 12, animationDelay: "1.6s" }}>
          Narrative
        </span>

        {/* Ambient glow — intensifies on focus */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-50px -60px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(134,137,233,0.10) 0%, transparent 65%)",
            opacity: isActive ? 1 : 0,
            transition: "opacity 0.7s ease",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-90px -110px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(80,156,214,0.07) 0%, rgba(180,140,60,0.04) 35%, transparent 72%)",
            opacity: isActive ? 0.9 : 0.45,
            transition: "opacity 0.8s ease",
            pointerEvents: "none",
            filter: "blur(8px)",
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
              "box-shadow var(--t-slow) var(--ease-smooth), border-color var(--t-slow) var(--ease-smooth)",
            boxShadow: isActive
              ? "0 0 0 1px rgba(134,137,233,0.16), 0 20px 58px rgba(0,0,0,0.42), inset 0 0.5px 0 rgba(255,255,255,0.055)"
              : "0 0 0 1px var(--border-subtle), 0 10px 32px rgba(0,0,0,0.29), inset 0 0.5px 0 rgba(255,255,255,0.035)",
            background: "rgba(12, 12, 22, 0.72)",
            backdropFilter: "blur(var(--blur-xl)) saturate(1.6)",
            WebkitBackdropFilter: "blur(var(--blur-xl)) saturate(1.6)",
          }}
        >
          {/* Top shimmer */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background:
                "linear-gradient(to right, transparent, rgba(134,137,233,0.18) 28%, rgba(255,255,255,0.08) 50%, rgba(134,137,233,0.18) 72%, transparent)",
              opacity: isActive ? 1 : 0.35,
              transition: "opacity 0.6s ease",
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
                background: hasText
                  ? "rgba(134,137,233,0.14)"
                  : "var(--surface-2)",
                borderColor: hasText
                  ? "var(--accent-border)"
                  : "var(--border-subtle)",
                color: hasText ? "var(--accent-bright)" : "var(--text-secondary)",
                padding: "7px 18px",
                letterSpacing: "0.05em",
              }}
              aria-label="Begin exploring"
            >
              Build World -&gt;
            </button>
          </div>
        </div>
      </div>

      {/* ── Structured output preview ─────────── */}
      <div
        className="anim-fade-up hero-output-preview"
        style={{
          animationDelay: "0.55s",
          marginTop: 28,
          display: "flex",
          flexWrap: "wrap",
          gap: "14px 22px",
          justifyContent: "center",
          maxWidth: "760px",
          opacity: hasText ? 0 : 1,
          transform: hasText ? "translateY(4px)" : "none",
          transition: "opacity 0.35s ease, transform 0.35s ease",
          pointerEvents: hasText ? "none" : "auto",
        }}
      >
        {OUTPUT_PREVIEW.map((item) => (
          <span
            key={item}
            className="type-label hero-output-label"
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              color: "var(--text-ghost)",
              opacity: 0.72,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
