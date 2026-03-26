"use client";

import { useRef, useEffect, KeyboardEvent } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export default function ThoughtInput({ value, onChange, onSubmit }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasText = value.trim().length > 0;

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "600px",
        padding: "0 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "28px",
        animation: "fade-up 0.9s ease both",
      }}
    >
      {/* ── Service label ── */}
      <p
        className="type-label"
        style={{
          color: "var(--accent-dim)",
          letterSpacing: "0.22em",
          opacity: 0.8,
        }}
      >
        Thought Partner
      </p>

      {/* ── Input surface ── */}
      <div style={{ position: "relative", width: "100%" }}>
        {/* Ambient halo when typing */}
        <div
          style={{
            position: "absolute",
            inset: "-50px -80px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(134, 137, 233, 0.07) 0%, transparent 68%)",
            opacity: hasText ? 1 : 0,
            transition: "opacity 0.8s ease",
            pointerEvents: "none",
          }}
        />

        {/* Ghost placeholder */}
        {!hasText && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <span
              className="type-thought"
              style={{ color: "var(--text-ghost)", fontStyle: "italic" }}
            >
              What&rsquo;s on your mind?
            </span>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          spellCheck={false}
          autoComplete="off"
          className="type-thought"
          style={{
            display: "block",
            width: "100%",
            resize: "none",
            background: "transparent",
            outline: "none",
            border: "none",
            color: "var(--text-primary)",
            caretColor: "var(--accent-bright)",
            minHeight: "48px",
            overflow: "hidden",
          }}
          aria-label="Enter your thought"
        />

        {/* Separator line */}
        <div
          style={{
            height: "1px",
            marginTop: "14px",
            background:
              "linear-gradient(to right, transparent, var(--border-subtle) 18%, var(--border-subtle) 82%, transparent)",
            opacity: hasText ? 1 : 0.38,
            transition: "opacity 0.4s ease",
          }}
        />
      </div>

      {/* ── Submit hint ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          opacity: hasText ? 1 : 0,
          transform: hasText ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
          pointerEvents: hasText ? "auto" : "none",
        }}
      >
        <span className="type-caption" style={{ color: "var(--text-tertiary)" }}>
          Press Enter to expand
        </span>
        <kbd
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "26px",
            height: "22px",
            borderRadius: "var(--r-xs)",
            border: "1px solid var(--border-subtle)",
            background: "var(--surface-1)",
            color: "var(--text-tertiary)",
            fontSize: "12px",
            fontFamily: "inherit",
          }}
        >
          ↵
        </kbd>
      </div>
    </div>
  );
}
