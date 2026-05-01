import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "../../utils/formatters";

interface Props {
  capex: number;
  opex: number;
}

const colors = ["#2563eb", "#16a34a"];

export function SimulationCostChart({ capex, opex }: Props) {
  const data = [
    { name: "CAPEX", value: capex },
    { name: "OPEX (acumulado)", value: opex },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-950">
          Distribuição de custos
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Comparação entre investimento inicial e custos operacionais.
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={96}
              label
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index]} />
              ))}
            </Pie>

            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
