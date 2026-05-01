import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="section-card">
      <div className="section-card-header">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      <div className="section-card-content">{children}</div>
    </section>
  );
}