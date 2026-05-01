import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import type { ComparisonResultItem } from "../../types/analysis";
import { formatCurrency, formatNumber, formatPercent } from "../../utils/formatters";

export type ComparisonMetric =
  | "lcos_per_mwh"
  | "delivered_energy_kwh"
  | "round_trip_efficiency"
  | "initial_capex";

interface Props {
  data: ComparisonResultItem[];
  metric?: ComparisonMetric;
}

const metricLabels: Record<ComparisonMetric, string> = {
  lcos_per_mwh: "LCOS",
  delivered_energy_kwh: "Energia entregue",
  round_trip_efficiency: "Eficiência round-trip",
  initial_capex: "CAPEX inicial",
};

function formatMetricValue(value: number, metric: ComparisonMetric) {
  if (metric === "lcos_per_mwh" || metric === "initial_capex") {
    return formatCurrency(value);
  }

  if (metric === "round_trip_efficiency") {
    return formatPercent(value);
  }

  return `${formatNumber(value)} kWh`;
}

export function ComparisonChart({
  data,
  metric = "lcos_per_mwh",
}: Props) {
  const chartData = data.map((item) => ({
    name: item.scenario_name,
    value: item[metric],
  }));

  return (
    <section className="chart-card">
      <div className="chart-card-header">
        <h3>Comparação de {metricLabels[metric]}</h3>
        <p>Métrica comparada entre os cenários simulados.</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => formatNumber(Number(value), 0)} />
          <Tooltip
            formatter={(value) =>
              formatMetricValue(Number(value), metric)
            }
          />
          <Bar dataKey="value" name={metricLabels[metric]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}