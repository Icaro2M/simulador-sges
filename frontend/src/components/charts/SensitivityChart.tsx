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

function formatMetricValue(value: number | null, metric: SensitivityMetric) {
  if (value === null) {
    return "Indefinido";
  }

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
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-950">
          {metricLabels[metric]} em função do parâmetro
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Parâmetro analisado: {parameter}
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />

            <XAxis
              dataKey="value"
              tick={{ fill: "#475569", fontSize: 12 }}
              tickFormatter={(value) => formatNumber(value, 0)}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#475569", fontSize: 12 }}
              tickFormatter={(value) => formatNumber(value, 0)}
              tickLine={false}
            />

            <Tooltip
              formatter={(value) =>
                formatMetricValue(
                  typeof value === "number" ? value : null,
                  metric,
                )
              }
              labelFormatter={(label) => `${parameter}: ${formatNumber(label)}`}
            />

            <Line
              type="monotone"
              dataKey={metric}
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4, fill: "#2563eb" }}
              activeDot={{ r: 6 }}
              name={metricLabels[metric]}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
