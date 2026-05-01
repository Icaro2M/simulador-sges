import type { MonteCarloResultItem } from "../../types/analysis";

type MonteCarloColumn = keyof Omit<MonteCarloResultItem, "sampled_values">;

interface Props {
  results: MonteCarloResultItem[];
}

const columns: MonteCarloColumn[] = [
  "iteration",
  "lcos",
  "capex",
  "annual_energy_mwh",
  "round_trip_efficiency",
];

const columnLabels: Record<MonteCarloColumn, string> = {
  iteration: "Iteração",
  lcos: "LCOS",
  capex: "CAPEX",
  annual_energy_mwh: "Energia anual (MWh)",
  round_trip_efficiency: "Eficiência round-trip",
};

export function MonteCarloTable({ results }: Props) {
  if (results.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-950">
          Resultados da Simulação Monte Carlo
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Amostras geradas e valores calculados em cada iteração.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              {columns.map((column) => (
                <th className="px-6 py-3 font-semibold text-slate-500" key={column}>
                  {columnLabels[column]}
                </th>
              ))}
              <th className="px-6 py-3 font-semibold text-slate-500">
                Valores amostrados
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {results.map((row) => (
              <tr key={row.iteration}>
                {columns.map((column) => {
                  const value = row[column];

                  return (
                    <td className="px-6 py-4 text-slate-950" key={column}>
                      {typeof value === "number" ? value.toFixed(4) : value}
                    </td>
                  );
                })}

                <td className="px-6 py-4 text-slate-950">
                  {Object.entries(row.sampled_values)
                    .map(([key, value]) => `${key}: ${value.toFixed(4)}`)
                    .join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
