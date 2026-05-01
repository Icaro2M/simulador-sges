import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardEvolutionChartProps {
  data: {
    execution: number;
    title: string;
    lcos: number | null;
    energy: number | null;
    efficiency: number | null;
  }[];
  metric: "lcos" | "energy" | "efficiency";
}

const metricLabels = {
  lcos: "LCOS",
  energy: "Energia entregue",
  efficiency: "Eficiência",
};

const metricUnits = {
  lcos: "R$/MWh",
  energy: "kWh",
  efficiency: "%",
};

export function DashboardEvolutionChart({
  data,
  metric,
}: DashboardEvolutionChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />

          <XAxis
            dataKey="execution"
            tick={{ fill: "#475569", fontSize: 12 }}
            tickLine={false}
          />

          <YAxis tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} />

          <Tooltip
            formatter={(value) => [
              `${Number(value).toLocaleString("pt-BR", {
                maximumFractionDigits: 2,
              })} ${metricUnits[metric]}`,
              metricLabels[metric],
            ]}
            labelFormatter={(label) => `Execução ${label}`}
          />

          <Line
            type="monotone"
            dataKey={metric}
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4, fill: "#2563eb" }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
