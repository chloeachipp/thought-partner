import type { BriefSection, CreativeDirectionSnapshot } from "@/lib/export/direction-export";

interface Props {
  snapshot: CreativeDirectionSnapshot;
  sections: BriefSection[];
  variant?: "screen" | "print";
}

export default function BriefPreview({ snapshot, sections, variant = "screen" }: Props) {
  const exportedAt = new Date(snapshot.savedAt).toLocaleString();
  const isPrint = variant === "print";

  return (
    <article className={`brief-preview brief-preview-${variant}`}>
      <header className="brief-preview-header">
        <span className="brief-preview-kicker">Creative Direction Brief</span>
        <h2 className="brief-preview-title">{snapshot.seed}</h2>
        <div className="brief-preview-meta">
          <span>Exported {exportedAt}</span>
          <span>{snapshot.provider ?? snapshot.aiProvider}</span>
        </div>
      </header>

      <div className="brief-preview-body">
        {sections.map((section) => (
          <section key={section.title} className="brief-preview-section">
            <h3 className="brief-preview-section-title">{section.title}</h3>
            <div className="brief-preview-section-copy">
              {section.body.map((paragraph, index) => (
                <p
                  key={`${section.title}-${index}`}
                  className={paragraph.startsWith("-") ? "brief-preview-bullet" : "brief-preview-paragraph"}
                >
                  {paragraph.startsWith("-") ? paragraph.slice(2) : paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {!isPrint && (
        <footer className="brief-preview-footer">
          <span>Structured for teams, decks, and downstream creative workflows.</span>
        </footer>
      )}
    </article>
  );
}