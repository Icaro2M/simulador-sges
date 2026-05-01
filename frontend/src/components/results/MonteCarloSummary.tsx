import { MetricCard } from "./MetricCard";
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
    <div className="metrics-grid">
      <MetricCard
        title={`${metricLabels[metric]} médio`}
        value={formatValue(mean, metric)}
      />

      <MetricCard
        title={`${metricLabels[metric]} mínimo`}
        value={formatValue(min, metric)}
      />

      <MetricCard
        title={`${metricLabels[metric]} máximo`}
        value={formatValue(max, metric)}
      />

      <MetricCard
        title="Desvio padrão"
        value={formatValue(standardDeviation, metric)}
      />
    </div>
  );
}