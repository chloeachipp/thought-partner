import type { ExportPrompt } from "@/lib/export/direction-export";

interface Props {
  prompts: ExportPrompt[];
  onCopyPrompt: (prompt: ExportPrompt) => void;
  onCopyAll: () => void;
}

export default function PromptExportPanel({ prompts, onCopyPrompt, onCopyAll }: Props) {
  return (
    <div className="export-panel-stack">
      <div className="export-panel-header-row">
        <div>
          <span className="type-label export-panel-eyebrow">Production Prompts</span>
          <h3 className="export-panel-title">Tool-ready prompts built from this world</h3>
        </div>
        <button type="button" className="btn-pill btn-pill-accent" onClick={onCopyAll}>
          Copy Prompts
        </button>
      </div>

      <div className="export-prompt-grid">
        {prompts.map((prompt) => (
          <article key={prompt.id} className="export-prompt-card glass">
            <div className="export-prompt-card-head">
              <div>
                <span className="type-caption export-prompt-category">{prompt.category}</span>
                <h4 className="export-prompt-name">{prompt.title}</h4>
              </div>
              <button type="button" className="btn-pill" onClick={() => onCopyPrompt(prompt)}>
                Copy
              </button>
            </div>

            <p className="export-prompt-copy">{prompt.prompt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}