"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import HeroState from "./HeroState";
import Sidebar from "./Sidebar";
import CorePanel from "./CorePanel";
import SectionPanel from "./SectionPanel";
import ExportDirectionModal from "./ExportDirectionModal";
import { useCreativeDirection } from "@/hooks/useCreativeDirection";
import {
  createSnapshot,
  hasDirectionContent,
  duplicateSnapshot,
  type CreativeDirectionSnapshot,
} from "@/lib/export/direction-export";
import { duplicateDraft, getLatestDraft, saveDraft } from "@/lib/export/session-drafts";

const AmbientBackground = dynamic(() => import("./AmbientBackground"), {
  ssr: false,
});

export default function CreativeDirectionView() {
  const {
    phase,
    aiProvider,
    seed,
    activeSection,
    sections,
    generationMode,
    provider,
    isGenerating,
    setAiProvider,
    setActiveSection,
    submitSeed,
    expandSection,
    restoreSnapshot,
    reset,
  } = useCreativeDirection();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [latestDraft, setLatestDraft] = useState<CreativeDirectionSnapshot | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHero = phase === "hero";
  const isLoading = phase === "loading";
  const isWorkspace = phase === "workspace";
  const canExport = isWorkspace && hasDirectionContent(sections);

  const sectionData = sections[activeSection] ?? {
    content: null,
    loading: false,
  };

  const exportSnapshot = useMemo(() => ({
    version: 1 as const,
    id: `live-${seed || "direction"}`,
    seed,
    aiProvider,
    activeSection,
    generationMode,
    provider,
    sections,
    savedAt: new Date().toISOString(),
    duplicatedFrom: null,
  }), [activeSection, aiProvider, generationMode, provider, sections, seed]);

  useEffect(() => {
    setLatestDraft(getLatestDraft());
  }, []);

  useEffect(() => {
    if (!isWorkspace) {
      setIsMobileMenuOpen(false);
    }
  }, [isWorkspace]);

  const handleSelectSection = (id: typeof activeSection) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
  };

  const handleReset = () => {
    reset();
    setIsMobileMenuOpen(false);
  };

  const handleSaveDraft = () => {
    const snapshot = createSnapshot({
      seed,
      aiProvider,
      activeSection,
      generationMode,
      provider,
      sections,
    });
    const drafts = saveDraft(snapshot);
    setLatestDraft(drafts[0] ?? null);
  };

  const handleDuplicateWorld = () => {
    const snapshot = duplicateSnapshot(createSnapshot({
      seed,
      aiProvider,
      activeSection,
      generationMode,
      provider,
      sections,
    }));
    const drafts = duplicateDraft(snapshot);
    setLatestDraft(drafts[0] ?? null);
  };

  const handleRestoreDraft = () => {
    const draft = getLatestDraft();
    if (!draft) return;
    restoreSnapshot(draft);
    setLatestDraft(draft);
    setIsExportOpen(false);
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
        <HeroState
          onSubmit={(text) => submitSeed(text)}
          aiProvider={aiProvider}
          onProviderChange={setAiProvider}
        />
      </div>

      {/* ── Workspace (3-column layout) ──────────────────── */}
      <div
        className="cd-workspace-layer"
        style={{
          opacity: isWorkspace ? 1 : 0,
          pointerEvents: isWorkspace ? "auto" : "none",
        }}
      >
        {canExport && (
          <div className="cd-workspace-actions">
            <button
              type="button"
              className="btn-pill btn-pill-accent cd-export-trigger"
              onClick={() => setIsExportOpen(true)}
            >
              Export Direction
            </button>
          </div>
        )}

        <button
          type="button"
          className="btn-pill cd-mobile-menu-trigger"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open section menu"
        >
          Sections
        </button>

        <div
          className={`cd-mobile-sidebar-layer${isMobileMenuOpen ? " cd-mobile-sidebar-layer-open" : ""}`}
          aria-hidden={!isMobileMenuOpen}
        >
          <button
            type="button"
            className="cd-mobile-sidebar-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close section menu"
          />
          <div className="cd-mobile-sidebar-panel">
            <Sidebar
              activeSection={activeSection}
              sections={sections}
              generationMode={generationMode}
              provider={provider}
              onSelect={handleSelectSection}
              onReset={handleReset}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>

        {/* Left sidebar */}
        <div className="cd-sidebar-desktop">
          <Sidebar
            activeSection={activeSection}
            sections={sections}
            generationMode={generationMode}
            provider={provider}
            onSelect={handleSelectSection}
            onReset={handleReset}
          />
        </div>

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

      {canExport && (
        <ExportDirectionModal
          isOpen={isExportOpen}
          snapshot={exportSnapshot}
          latestDraft={latestDraft}
          onClose={() => setIsExportOpen(false)}
          onSaveDraft={handleSaveDraft}
          onDuplicateWorld={handleDuplicateWorld}
          onRestoreDraft={handleRestoreDraft}
        />
      )}

      {/* Hero footer */}
      {isHero && (
        <div className="cd-hero-footer">
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
      )}
    </div>
  );
}
