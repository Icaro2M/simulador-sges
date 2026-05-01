import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ComparisonResultItem } from "../../types/analysis";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "../../utils/formatters";

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

function formatMetricValue(value: number | null, metric: ComparisonMetric) {
  if (value === null) {
    return "Indefinido";
  }

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
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-950">
          Comparação de {metricLabels[metric]}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Métrica comparada entre os cenários simulados.
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#475569", fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#475569", fontSize: 12 }}
              tickFormatter={(value) => formatNumber(Number(value), 0)}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) =>
                formatMetricValue(
                  typeof value === "number" ? value : null,
                  metric,
                )
              }
            />
            <Bar
              dataKey="value"
              fill="#2563eb"
              name={metricLabels[metric]}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
