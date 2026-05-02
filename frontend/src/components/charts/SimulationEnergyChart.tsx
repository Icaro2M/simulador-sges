import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SimulationResultData } from "../../types/simulation";
import { formatNumber } from "../../utils/formatters";

interface Props {
  data: SimulationResultData;
}

export function SimulationEnergyChart({ data }: Props) {
  const technology = data.technology_result;

  const chartData = [
    {
      name: "Entrada",
      energy: technology.input_energy_kwh ?? technology.required_charge_energy_kwh,
    },
    {
      name: "Potencial",
      energy: technology.max_potential_energy_kwh ?? technology.stored_energy_kwh,
    },
    {
      name: "Disponivel",
      energy: data.available_energy_kwh ?? technology.stored_energy_kwh,
    },
    {
      name: "Antes perdas",
      energy: data.gross_delivered_energy_kwh ?? technology.delivered_energy_kwh,
    },
    {
      name: "Efetiva",
      energy: data.effective_delivered_energy_kwh,
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-950">
          Fluxo energético operacional
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Compara entrada elétrica, potencial armazenado, perdas e entrega efetiva.
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
