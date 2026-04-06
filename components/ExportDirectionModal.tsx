"use client";

import { useEffect, useMemo, useState } from "react";
import BriefPreview from "./BriefPreview";
import PromptExportPanel from "./PromptExportPanel";
import SessionActionsPanel from "./SessionActionsPanel";
import {
  buildBriefSections,
  buildCreativeBrief,
  buildCreativeBriefMarkdown,
  buildProductionPrompts,
  copyTextToClipboard,
  createMarkdownFilename,
  downloadMarkdown,
  type CreativeDirectionSnapshot,
  type ExportPrompt,
} from "@/lib/export/direction-export";

type ExportTab = "brief" | "prompts" | "session";

interface Props {
  isOpen: boolean;
  snapshot: CreativeDirectionSnapshot;
  latestDraft: CreativeDirectionSnapshot | null;
  onClose: () => void;
  onSaveDraft: () => void;
  onDuplicateWorld: () => void;
  onRestoreDraft: () => void;
}

export default function ExportDirectionModal({
  isOpen,
  snapshot,
  latestDraft,
  onClose,
  onSaveDraft,
  onDuplicateWorld,
  onRestoreDraft,
}: Props) {
  const [activeTab, setActiveTab] = useState<ExportTab>("brief");
  const [feedback, setFeedback] = useState<string | null>(null);

  const briefSections = useMemo(() => buildBriefSections(snapshot), [snapshot]);
  const briefText = useMemo(() => buildCreativeBrief(snapshot), [snapshot]);
  const markdown = useMemo(() => buildCreativeBriefMarkdown(snapshot), [snapshot]);
  const prompts = useMemo(() => buildProductionPrompts(snapshot), [snapshot]);

  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("brief");
    }
  }, [isOpen, snapshot.id]);

  if (!isOpen) return null;

  const handleCopy = async (text: string, message: string) => {
    try {
      await copyTextToClipboard(text);
      setFeedback(message);
    } catch {
      setFeedback("Copy failed on this browser.");
    }
  };

  const handleCopyPrompt = (prompt: ExportPrompt) => {
    void handleCopy(prompt.prompt, `${prompt.title} copied.`);
  };

  const handleCopyAllPrompts = () => {
    const payload = prompts.map((prompt) => `${prompt.title}\n\n${prompt.prompt}`).join("\n\n---\n\n");
    void handleCopy(payload, "All prompts copied.");
  };

  const handleSaveDraft = () => {
    onSaveDraft();
    setFeedback("Draft saved locally.");
  };

  const handleDuplicateWorld = () => {
    onDuplicateWorld();
    setFeedback("Duplicate saved as a new local draft.");
  };

  const handleRestoreDraft = () => {
    onRestoreDraft();
    setFeedback(latestDraft ? "Saved draft restored." : "No saved draft available.");
  };

  const handleDownload = () => {
    downloadMarkdown(createMarkdownFilename(snapshot.seed), markdown);
    setFeedback("Markdown brief downloaded.");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="export-modal-backdrop" onClick={onClose} />
      <div
        className="export-modal-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-direction-title"
        onClick={onClose}
      >
        <div className="export-modal glass-deep" onClick={(event) => event.stopPropagation()}>
          <header className="export-modal-header">
            <div>
              <span className="type-label export-modal-kicker">Export Direction</span>
              <h2 id="export-direction-title" className="export-modal-title">
                Turn this world into usable outputs
              </h2>
            </div>

            <div className="export-modal-header-actions">
              {feedback && <span className="export-modal-feedback">{feedback}</span>}
              <div className="export-modal-close-actions">
                <button
                  type="button"
                  className="btn-pill btn-pill-ghost export-modal-close-icon"
                  onClick={onClose}
                  aria-label="Close export direction"
                  title="Close"
                >
                  ×
                </button>
                <button type="button" className="btn-pill btn-pill-ghost" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </header>

          <div className="export-modal-tabs" role="tablist" aria-label="Export sections">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "brief"}
              className={`export-tab${activeTab === "brief" ? " export-tab-active" : ""}`}
              onClick={() => setActiveTab("brief")}
            >
              Creative Brief
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "prompts"}
              className={`export-tab${activeTab === "prompts" ? " export-tab-active" : ""}`}
              onClick={() => setActiveTab("prompts")}
            >
              Production Prompts
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "session"}
              className={`export-tab${activeTab === "session" ? " export-tab-active" : ""}`}
              onClick={() => setActiveTab("session")}
            >
              Session
            </button>
          </div>

          <div className="export-modal-body">
            {activeTab === "brief" && (
              <div className="export-panel-stack">
                <div className="export-panel-header-row">
                  <div>
                    <span className="type-label export-panel-eyebrow">Creative Brief</span>
                    <h3 className="export-panel-title">A clean direction document for decks and handoff</h3>
                  </div>
                  <div className="export-brief-actions">
                    <button type="button" className="btn-pill" onClick={() => void handleCopy(briefText, "Brief copied.")}>
                      Copy Brief
                    </button>
                    <button type="button" className="btn-pill" onClick={handleDownload}>
                      Download Markdown
                    </button>
                    <button type="button" className="btn-pill btn-pill-accent" onClick={handlePrint}>
                      Print / Save PDF
                    </button>
                  </div>
                </div>

                <BriefPreview snapshot={snapshot} sections={briefSections} />
              </div>
            )}

            {activeTab === "prompts" && (
              <PromptExportPanel
                prompts={prompts}
                onCopyPrompt={handleCopyPrompt}
                onCopyAll={handleCopyAllPrompts}
              />
            )}

            {activeTab === "session" && (
              <SessionActionsPanel
                latestDraft={latestDraft}
                onSaveDraft={handleSaveDraft}
                onDuplicateWorld={handleDuplicateWorld}
                onRestoreDraft={handleRestoreDraft}
              />
            )}
          </div>
        </div>
      </div>

      <div className="export-print-root" aria-hidden="true">
        <BriefPreview snapshot={snapshot} sections={briefSections} variant="print" />
      </div>
    </>
  );
}