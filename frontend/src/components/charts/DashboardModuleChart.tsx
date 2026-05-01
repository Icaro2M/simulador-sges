import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardModuleChartProps {
  data: {
    module: string;
    count: number;
  }[];
}

export function DashboardModuleChart({ data }: DashboardModuleChartProps) {
  return (
    <div className="dashboard-chart">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="module" />
          <YAxis allowDecimals={false} />

          <Tooltip
            formatter={(value) => [
              `${value} execução(ões)`,
              "Quantidade",
            ]}
          />

          <Bar dataKey="count" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}