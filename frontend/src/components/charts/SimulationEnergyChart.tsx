import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TechnologySimulationResult } from "../../types/simulation";
import { formatNumber } from "../../utils/formatters";

interface Props {
  data: TechnologySimulationResult;
}

export function SimulationEnergyChart({ data }: Props) {
  const chartData = [
    {
      name: "Armazenada",
      energy: data.stored_energy_kwh,
    },
    {
      name: "Entregue",
      energy: data.delivered_energy_kwh,
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-950">
          Energia armazenada vs. entregue
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Comparação entre energia potencial armazenada e energia útil entregue.
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`${formatNumber(value)} kWh`, "Energia"]}
            />
            <Bar dataKey="energy" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
