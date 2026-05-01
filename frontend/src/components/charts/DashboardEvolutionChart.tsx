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
    <div className="dashboard-chart">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="execution"
            label={{
              value: "Execução",
              position: "insideBottom",
              offset: -5,
            }}
          />

          <YAxis />

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
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}