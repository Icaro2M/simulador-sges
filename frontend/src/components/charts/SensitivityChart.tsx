import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SensitivityResultItem } from "../../types/analysis";
import { formatCurrency, formatNumber } from "../../utils/formatters";

export type SensitivityMetric = "lcos" | "capex" | "annual_energy_mwh";

interface Props {
  data: SensitivityResultItem[];
  parameter: string;
  metric?: SensitivityMetric;
}

const metricLabels: Record<SensitivityMetric, string> = {
  lcos: "LCOS",
  capex: "CAPEX",
  annual_energy_mwh: "Energia anual",
};

function formatMetricValue(value: number, metric: SensitivityMetric) {
  if (metric === "lcos" || metric === "capex") {
    return formatCurrency(value);
  }

  return `${formatNumber(value)} MWh`;
}

export function SensitivityChart({
  data,
  parameter,
  metric = "lcos",
}: Props) {
  return (
    <section className="chart-card">
      <div className="chart-card-header">
        <h3>{metricLabels[metric]} em função do parâmetro</h3>
        <p>Parâmetro analisado: {parameter}</p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="value"
            tickFormatter={(value) => formatNumber(value, 0)}
          />

          <YAxis tickFormatter={(value) => formatNumber(value, 0)} />

          <Tooltip
            formatter={(value) =>
              formatMetricValue(Number(value), metric)
            }
            labelFormatter={(label) => `${parameter}: ${formatNumber(label)}`}
          />

          <Line
            type="monotone"
            dataKey={metric}
            strokeWidth={3}
            dot
            name={metricLabels[metric]}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}