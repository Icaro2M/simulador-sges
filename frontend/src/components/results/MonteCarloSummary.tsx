import type { MonteCarloResultItem } from "../../types/analysis";

type MonteCarloMetric =
  | "lcos"
  | "capex"
  | "annual_energy_mwh"
  | "round_trip_efficiency";

interface Props {
  results: MonteCarloResultItem[];
  metric: MonteCarloMetric;
}

const metricLabels: Record<MonteCarloMetric, string> = {
  lcos: "LCOS",
  capex: "CAPEX",
  annual_energy_mwh: "Energia anual",
  round_trip_efficiency: "Eficiência",
};

function calculateMean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateStandardDeviation(values: number[], mean: number) {
  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    values.length;

  return Math.sqrt(variance);
}

function formatValue(value: number, metric: MonteCarloMetric) {
  if (metric === "round_trip_efficiency") {
    return `${(value * 100).toFixed(2)}%`;
  }

  if (metric === "lcos") {
    return `${value.toFixed(2)} $/MWh`;
  }

  if (metric === "capex") {
    return `$ ${value.toFixed(2)}`;
  }

  return `${value.toFixed(2)} MWh`;
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <span className="block text-sm font-medium text-slate-500">{title}</span>
      <strong className="mt-2 block text-2xl font-semibold text-slate-950">
        {value}
      </strong>
    </article>
  );
}

export function MonteCarloSummary({ results, metric }: Props) {
  const values = results
    .map((item) => item[metric])
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return null;
  }

  const mean = calculateMean(values);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const standardDeviation = calculateStandardDeviation(values, mean);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title={`${metricLabels[metric]} médio`}
        value={formatValue(mean, metric)}
      />

      <SummaryCard
        title={`${metricLabels[metric]} mínimo`}
        value={formatValue(min, metric)}
      />

      <SummaryCard
        title={`${metricLabels[metric]} máximo`}
        value={formatValue(max, metric)}
      />

      <SummaryCard
        title="Desvio padrão"
        value={formatValue(standardDeviation, metric)}
      />
    </section>
  );
}
