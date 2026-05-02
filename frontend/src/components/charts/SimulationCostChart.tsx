import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "../../utils/formatters";

interface Props {
  capex: number;
  opex: number;
  chargingEnergyCost?: number;
}

const colors = ["#2563eb", "#16a34a", "#f59e0b"];

function formatCostLabel(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function SimulationCostChart({ capex, opex, chargingEnergyCost = 0 }: Props) {
  const data = [
    { name: "CAPEX", value: capex },
    { name: "OPEX anual", value: opex },
    { name: "Custo de carga anual", value: chargingEnergyCost },
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
              outerRadius={90}
              label={({ value }) => formatCostLabel(Number(value))}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index]} />
              ))}
            </Pie>

            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm font-medium text-slate-700">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
