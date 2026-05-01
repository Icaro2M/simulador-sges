import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import type { DispatchResultItem } from "../../types/dispatch";
import { normalizeDispatchResults } from "../../utils/dispatchResult";

interface Props {
  data: DispatchResultItem[];
}

export function DispatchChart({ data }: Props) {
  const chartData = normalizeDispatchResults(data);

  return (
    <section className="chart-card">
      <h3>Dispatch temporal</h3>

      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="hour"
              label={{
                value: "Hora",
                position: "insideBottom",
                offset: -5,
              }}
            />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="price"
              name="Preço"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="soc_kwh"
              name="SOC"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="charged_energy_kwh"
              name="Energia carregada"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="discharged_energy_kwh"
              name="Energia descarregada"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="net_cashflow"
              name="Fluxo líquido"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}