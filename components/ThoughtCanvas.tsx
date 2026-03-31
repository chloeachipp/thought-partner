"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import HeroState from "./HeroState";
import ModeSwitcher from "./ModeSwitcher";
import SeedLoadingNode from "./SeedLoadingNode";
import FocusNode from "./FocusNode";
import OrbitRing from "./OrbitRing";
import ExplorationBreadcrumbs from "./ExplorationBreadcrumbs";
import { useExplorationState } from "@/hooks/useExplorationState";
import type { CreativeMode } from "@/types/thought";

const AmbientBackground = dynamic(() => import("./AmbientBackground"), {
  ssr: false,
});

export default function ThoughtCanvas() {
  const {
    phase,
    state,
    isGenerating,
    generationMode,
    provider,
    submitSeed,
    navigateTo,
    navigateBack,
    reset,
    transitioning,
  } = useExplorationState();

  const [creativeMode, setCreativeMode] = useState<CreativeMode>("concept");
  const [modeShifting, setModeShifting] = useState(false);
  const modeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHero = phase === "hero";
  const isLoading = phase === "submitting";
  const isCanvas = phase === "canvas";
  const isFallback = generationMode === "fallback";

  const handleModeChange = useCallback((mode: CreativeMode) => {
    setCreativeMode(mode);
    setModeShifting(true);
    if (modeTimeoutRef.current) clearTimeout(modeTimeoutRef.current);
    modeTimeoutRef.current = setTimeout(() => setModeShifting(false), 650);
  }, []);

  const providerDisplay = (() => {
    if (isFallback || !provider) return "Local";
    const v = provider.toLowerCase();
    if (v.includes("anthropic")) return "Anthropic";
    if (v.includes("openai")) return "OpenAI";
    return "AI provider";
  })();

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <AmbientBackground phase={phase} />

      {isLoading && (
        <SeedLoadingNode label="" isGenerating={true} generationPhase="related" />
      )}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          opacity: isHero ? 1 : 0,
          transform: isHero ? "none" : "translateY(-20px)",
          filter: isHero ? "none" : "blur(5px)",
          transition:
            "opacity 0.55s var(--ease-in), transform 0.55s var(--ease-in), filter 0.55s var(--ease-in)",
          pointerEvents: isHero ? "auto" : "none",
        }}
      >
        <HeroState onSubmit={(text) => submitSeed(text, creativeMode)} />
      </div>

      {/* ── Canvas ───────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 30,
          opacity: isCanvas ? 1 : 0,
          transition: "opacity 0.55s ease 0.1s",
          pointerEvents: isCanvas ? "auto" : "none",
        }}
      >
        {/* Top bar */}
        <div
          className="glass-raised"
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 60,
            width: "min(900px, calc(100vw - 36px))",
            borderRadius: "var(--r-pill)",
            padding: "9px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="type-wordmark" style={{ marginRight: 6 }}>Creative Direction Engine</span>
            <button className="btn-pill btn-pill-ghost" onClick={reset}>
              New thought
            </button>
            <span
              aria-hidden="true"
              style={{
                width: 1,
                height: 14,
                background: "var(--border-faint)",
                margin: "0 4px",
                flexShrink: 0,
              }}
            />
            <ModeSwitcher value={creativeMode} onChange={handleModeChange} />
          </div>

          <div
            className="glass"
            style={{
              borderRadius: "var(--r-pill)",
              padding: "6px 11px",
              display: "flex",
              alignItems: "center",
              gap: 9,
              flexShrink: 0,
            }}
          >
            {isGenerating && (
              <span className="status-chip">
                <span className="status-chip-dot" />
                Thinking
              </span>
            )}
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: isFallback ? "rgba(215, 88, 84, 0.9)" : "var(--accent)",
                opacity: isGenerating ? 1 : 0.72,
                animation: isGenerating
                  ? "pulse-dot 1.8s ease-in-out infinite"
                  : "none",
              }}
            />
            <span
              className="type-caption"
              style={{ color: "var(--text-secondary)", letterSpacing: "0.06em" }}
            >
              {providerDisplay}
            </span>
            {isFallback && (
              <>
                <span className="type-caption" style={{ color: "var(--text-ghost)" }}>
                  •
                </span>
                <span
                  className="type-caption"
                  style={{ color: "var(--text-tertiary)", letterSpacing: "0.06em" }}
                >
                  Local mode
                </span>
              </>
            )}
          </div>
        </div>

        {/* Orbit viewport */}
        {state && (
          <div
            className={modeShifting ? "nodes-mode-shifting" : undefined}
            style={{ position: "absolute", inset: 0 }}
          >
            <OrbitRing
              nodes={state.orbitNodes}
              isExiting={transitioning}
              onSelect={(node) => navigateTo(node, creativeMode)}
            />

            {/* Focus node — always centered */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 20,
              }}
            >
              <div
                className={
                  transitioning ? "focus-node-transitioning" : "focus-node-entering"
                }
              >
                <FocusNode node={state.currentNode} isGenerating={isGenerating} />
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumbs */}
        {state && state.parentPath.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 56,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 60,
              opacity: isCanvas ? 1 : 0,
              transition: "opacity 0.4s ease 0.3s",
            }}
          >
            <ExplorationBreadcrumbs
              path={state.parentPath}
              onNavigateBack={navigateBack}
            />
          </div>
        )}

        {/* Depth trail */}
        {state && (
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 60,
              display: "flex",
              alignItems: "center",
              gap: 5,
              opacity: isCanvas ? 1 : 0,
              transition: "opacity 0.5s ease 0.4s",
            }}
          >
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "var(--accent-dim)",
                opacity: 0.45,
                flexShrink: 0,
              }}
            />
            {state.parentPath.map((_, i) => (
              <span
                key={i}
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: "var(--accent-dim)",
                  opacity:
                    0.28 + (i / Math.max(state.parentPath.length, 1)) * 0.32,
                  flexShrink: 0,
                  transition: "all 0.35s ease",
                }}
              />
            ))}
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--accent)",
                opacity: 0.9,
                flexShrink: 0,
                boxShadow: "0 0 7px var(--accent-glow)",
              }}
            />
          </div>
        )}
      </div>

      {/* Hero footer */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 50,
          opacity: isHero ? 1 : 0,
          transition: "opacity 0.4s ease",
          animation: "fade-in 1.6s ease 1.2s both",
        }}
      >
        <div
          className="type-caption"
          style={{
            color: "var(--text-ghost)",
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <span style={{ fontStyle: "italic", opacity: 0.6 }}>
            ideas, one layer at a time
          </span>
        </div>
      </div>
    </div>
  );
}
