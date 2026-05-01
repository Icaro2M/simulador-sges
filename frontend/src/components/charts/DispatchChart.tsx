import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DispatchResultItem } from "../../types/dispatch";
import { normalizeDispatchResults } from "../../utils/dispatchResult";

interface Props {
  data: DispatchResultItem[];
}

export function DispatchChart({ data }: Props) {
  const chartData = normalizeDispatchResults(data);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-950">
          Dispatch temporal
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Evolução horária de preço, SOC, energia movimentada e fluxo líquido.
        </p>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />

            <XAxis
              dataKey="hour"
              tick={{ fill: "#475569", fontSize: 12 }}
              tickLine={false}
            />

            <YAxis tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="price"
              name="Preço"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="soc_kwh"
              name="SOC"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="charged_energy_kwh"
              name="Energia carregada"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="discharged_energy_kwh"
              name="Energia descarregada"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="net_cashflow"
              name="Fluxo líquido"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
