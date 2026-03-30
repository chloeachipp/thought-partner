"use client";

import dynamic from "next/dynamic";
import HeroState from "./HeroState";
import Sidebar from "./Sidebar";
import CorePanel from "./CorePanel";
import SectionPanel from "./SectionPanel";
import { useCreativeDirection } from "@/hooks/useCreativeDirection";

const AmbientBackground = dynamic(() => import("./AmbientBackground"), {
  ssr: false,
});

export default function CreativeDirectionView() {
  const {
    phase,
    seed,
    activeSection,
    sections,
    generationMode,
    provider,
    isGenerating,
    setActiveSection,
    submitSeed,
    expandSection,
    reset,
  } = useCreativeDirection();

  const isHero = phase === "hero";
  const isLoading = phase === "loading";
  const isWorkspace = phase === "workspace";

  const sectionData = sections[activeSection] ?? {
    content: null,
    loading: false,
  };

  return (
    <div className="cd-root">
      <AmbientBackground phase={isWorkspace ? "canvas" : phase} />

      {/* ── Loading overlay ──────────────────────────────── */}
      {isLoading && (
        <div className="cd-loading-overlay">
          <div className="cd-loading-spinner" />
          <span className="type-body-sm" style={{ color: "var(--text-tertiary)", marginTop: 16 }}>
            Building creative world…
          </span>
        </div>
      )}

      {/* ── Hero state ───────────────────────────────────── */}
      <div
        className="cd-hero-layer"
        style={{
          opacity: isHero ? 1 : 0,
          pointerEvents: isHero ? "auto" : "none",
          transform: isHero ? "none" : "translateY(-20px)",
          filter: isHero ? "none" : "blur(5px)",
        }}
      >
        <HeroState onSubmit={(text) => submitSeed(text)} />
      </div>

      {/* ── Workspace (3-column layout) ──────────────────── */}
      <div
        className="cd-workspace-layer"
        style={{
          opacity: isWorkspace ? 1 : 0,
          pointerEvents: isWorkspace ? "auto" : "none",
        }}
      >
        {/* Left sidebar */}
        <Sidebar
          activeSection={activeSection}
          sections={sections}
          generationMode={generationMode}
          provider={provider}
          onSelect={(id) => {
            setActiveSection(id);
          }}
          onReset={reset}
        />

        {/* Center panel */}
        <main className="cd-center">
          <CorePanel seed={seed} sections={sections} />
        </main>

        {/* Right panel */}
        <div className="cd-right">
          <div className="cd-right-inner" key={activeSection}>
            <SectionPanel
              sectionId={activeSection}
              data={sectionData}
              seed={seed}
              onExpand={() => expandSection(activeSection)}
            />
          </div>
        </div>
      </div>

      {/* Hero footer */}
      <div
        className="cd-hero-footer"
        style={{
          opacity: isHero ? 1 : 0,
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
            creative direction, structured
          </span>
        </div>
      </div>
    </div>
  );
}
