import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonteCarloResultItem } from "../../types/analysis";

type MonteCarloMetric =
  | "lcos"
  | "capex"
  | "annual_energy_mwh"
  | "round_trip_efficiency";

interface HistogramBin {
  range: string;
  count: number;
}

interface Props {
  results: MonteCarloResultItem[];
  metric?: MonteCarloMetric;
  bins?: number;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

const metricLabels: Record<MonteCarloMetric, string> = {
  lcos: "LCOS",
  capex: "CAPEX",
  annual_energy_mwh: "Energia anual (MWh)",
  round_trip_efficiency: "Eficiência round-trip",
};

export function MonteCarloChart({
  results,
  metric = "lcos",
  bins = 10,
}: Props) {
  const values = results
    .map((item) => item[metric])
    .filter(isFiniteNumber);

  if (values.length === 0) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-950">
          Distribuição de Monte Carlo
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Nenhum dado numérico encontrado para a métrica {metricLabels[metric]}.
        </p>
      </section>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / bins || 1;

  const histogram: HistogramBin[] = Array.from({ length: bins }, (_, index) => {
    const start = min + index * step;
    const end = start + step;

    return {
      range: `${start.toFixed(2)} - ${end.toFixed(2)}`,
      count: 0,
    };
  });

  values.forEach((value) => {
    const index = Math.min(Math.floor((value - min) / step), bins - 1);
    histogram[index].count += 1;
  });

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-950">
          Distribuição de {metricLabels[metric]}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Frequência dos valores amostrados na simulação de Monte Carlo.
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogram} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis
              dataKey="range"
              tick={{ fill: "#475569", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#475569", fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip />
            <Bar
              dataKey="count"
              fill="#2563eb"
              name="Frequência"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
