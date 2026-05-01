import {
  Area,
  AreaChart,
  CartesianGrid,
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

const accent = "#0f766e";

export function DashboardEvolutionChart({
  data,
  metric,
}: DashboardEvolutionChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 8, right: 16, top: 12, bottom: 8 }}>
          <defs>
            <linearGradient id="dashboardMetricFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.24} />
              <stop offset="70%" stopColor={accent} stopOpacity={0.06} />
              <stop offset="100%" stopColor={accent} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 6" vertical={false} />

          <XAxis
            dataKey="execution"
            tick={{ fill: "#475569", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: "#475569", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              border: "1px solid #ccfbf1",
              borderRadius: 8,
              boxShadow: "0 10px 25px rgba(15, 118, 110, 0.10)",
            }}
            formatter={(value) => [
              `${Number(value).toLocaleString("pt-BR", {
                maximumFractionDigits: 2,
              })} ${metricUnits[metric]}`,
              metricLabels[metric],
            ]}
            labelFormatter={(label) => `Execução ${label}`}
          />

          <Area
            type="monotone"
            dataKey={metric}
            stroke={accent}
            fill="url(#dashboardMetricFill)"
            strokeWidth={3}
            dot={{ r: 4, fill: accent, strokeWidth: 2, stroke: "#ffffff" }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
