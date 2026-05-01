import type { ComparisonResultItem } from "../../types/analysis";
import { formatCurrency, formatNumber, formatPercent } from "../../utils/formatters";

interface Props {
  data: ComparisonResultItem[];
}

export function ComparisonTable({ data }: Props) {
  return (
    <section className="result-table">
      <h3>Comparação de cenários</h3>

      <table>
        <thead>
          <tr>
            <th>Métrica</th>
            {data.map((item) => (
              <th key={item.scenario_name}>{item.scenario_name}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Tecnologia</td>
            {data.map((item) => (
              <td key={item.scenario_name}>{item.technology_name}</td>
            ))}
          </tr>

          <tr>
            <td>Energia entregue</td>
            {data.map((item) => (
              <td key={item.scenario_name}>
                {formatNumber(item.delivered_energy_kwh)} kWh
              </td>
            ))}
          </tr>

          <tr>
            <td>Eficiência round-trip</td>
            {data.map((item) => (
              <td key={item.scenario_name}>
                {formatPercent(item.round_trip_efficiency)}
              </td>
            ))}
          </tr>

          <tr>
            <td>CAPEX inicial</td>
            {data.map((item) => (
              <td key={item.scenario_name}>
                {formatCurrency(item.initial_capex)}
              </td>
            ))}
          </tr>

          <tr>
            <td>LCOS</td>
            {data.map((item) => (
              <td key={item.scenario_name}>
                {formatCurrency(item.lcos_per_mwh)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </section>
  );
}