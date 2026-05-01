import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { formatCurrency } from "../../utils/formatters";

interface Props {
  capex: number;
  opex: number;
}

export function SimulationCostChart({ capex, opex }: Props) {
  const data = [
    { name: "CAPEX", value: capex },
    { name: "OPEX (acumulado)", value: opex },
  ];

  return (
    <section className="chart-card">
      <div className="chart-card-header">
        <h3>Distribuição de custos</h3>
        <p>Comparação entre investimento inicial e custos operacionais.</p>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              label
            >
              <Cell />
              <Cell />
            </Pie>

            <Tooltip
              formatter={(value) => formatCurrency(value)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}