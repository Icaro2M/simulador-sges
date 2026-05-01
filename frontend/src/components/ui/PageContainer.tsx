import type { ReactNode } from "react";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function PageContainer({ title, subtitle, children }: PageContainerProps) {
  return (
    <main className="page-container">
      <div className="page-header">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {children}
    </main>
  );
}