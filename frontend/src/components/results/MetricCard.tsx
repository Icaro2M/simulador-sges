interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
}

export function MetricCard({ title, value, unit }: MetricCardProps) {
  return (
    <article className="metric-card">
      <span className="metric-card-title">{title}</span>

      <strong className="metric-card-value">
        {value}
        {unit && <small> {unit}</small>}
      </strong>
    </article>
  );
}