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

const accent = "#0f766e";

export function DashboardModuleChart({ data }: DashboardModuleChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 6" vertical={false} />

          <XAxis
            dataKey="module"
            tick={{ fill: "#475569", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
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
            formatter={(value) => [`${value} execução(ões)`, "Quantidade"]}
          />

          <Bar dataKey="count" fill={accent} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
