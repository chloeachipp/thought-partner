import type { CreativeDirectionSnapshot } from "@/lib/export/direction-export";

interface Props {
  latestDraft: CreativeDirectionSnapshot | null;
  onSaveDraft: () => void;
  onDuplicateWorld: () => void;
  onRestoreDraft: () => void;
}

export default function SessionActionsPanel({
  latestDraft,
  onSaveDraft,
  onDuplicateWorld,
  onRestoreDraft,
}: Props) {
  return (
    <div className="export-panel-stack">
      <div>
        <span className="type-label export-panel-eyebrow">Session</span>
        <h3 className="export-panel-title">Preserve the current direction for later</h3>
      </div>

      <div className="export-session-grid">
        <article className="export-session-card glass">
          <span className="type-caption export-session-label">Current world</span>
          <h4 className="export-session-title">Save a local draft</h4>
          <p className="export-session-copy">
            Preserve the current concept, all generated sections, and the active model choice in this browser.
          </p>
          <button type="button" className="btn-pill btn-pill-accent" onClick={onSaveDraft}>
            Save Draft
          </button>
        </article>

        <article className="export-session-card glass">
          <span className="type-caption export-session-label">Preserve a copy</span>
          <h4 className="export-session-title">Duplicate current world</h4>
          <p className="export-session-copy">
            Create another saved snapshot so you can branch the direction without losing this version.
          </p>
          <button type="button" className="btn-pill" onClick={onDuplicateWorld}>
            Duplicate Current World
          </button>
        </article>

        <article className="export-session-card glass">
          <span className="type-caption export-session-label">Saved draft</span>
          <h4 className="export-session-title">Restore saved draft</h4>
          <p className="export-session-copy">
            {latestDraft
              ? `Last saved ${new Date(latestDraft.savedAt).toLocaleString()} for “${latestDraft.seed}”.`
              : "No saved draft yet. Save the current world to make it restorable."}
          </p>
          <button
            type="button"
            className="btn-pill"
            onClick={onRestoreDraft}
            disabled={!latestDraft}
          >
            Restore Saved Draft
          </button>
        </article>
      </div>
    </div>
  );
}