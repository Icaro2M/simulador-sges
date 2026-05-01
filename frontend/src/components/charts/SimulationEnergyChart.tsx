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
    <section className="chart-card">
      <div className="chart-card-header">
        <h3>Energia armazenada vs. entregue</h3>
        <p>Comparação entre energia potencial armazenada e energia útil entregue.</p>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => [`${formatNumber(value)} kWh`, "Energia"]}
            />
            <Bar dataKey="energy" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}