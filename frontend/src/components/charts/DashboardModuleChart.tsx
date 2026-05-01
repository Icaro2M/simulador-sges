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
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />

          <XAxis
            dataKey="module"
            tick={{ fill: "#475569", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#475569", fontSize: 12 }}
            tickLine={false}
          />

          <Tooltip
            formatter={(value) => [`${value} execução(ões)`, "Quantidade"]}
          />

          <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
