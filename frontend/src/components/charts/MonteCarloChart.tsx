import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SectionCard } from "../ui/SectionCard";
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
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return (
      <SectionCard title="Distribuição de Monte Carlo">
        <p>Nenhum dado numérico encontrado para a métrica {metricLabels[metric]}.</p>
      </SectionCard>
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
    <SectionCard title={`Distribuição de ${metricLabels[metric]}`}>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={histogram}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name="Frequência" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}