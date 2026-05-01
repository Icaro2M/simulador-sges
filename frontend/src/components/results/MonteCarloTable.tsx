import { SectionCard } from "../ui/SectionCard";
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
    <SectionCard title="Resultados da Simulação Monte Carlo">
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{columnLabels[column]}</th>
              ))}
              <th>Valores amostrados</th>
            </tr>
          </thead>

          <tbody>
            {results.map((row) => (
              <tr key={row.iteration}>
                {columns.map((column) => {
                  const value = row[column];

                  return (
                    <td key={column}>
                      {typeof value === "number" ? value.toFixed(4) : value}
                    </td>
                  );
                })}

                <td>
                  {Object.entries(row.sampled_values)
                    .map(([key, value]) => `${key}: ${value.toFixed(4)}`)
                    .join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}