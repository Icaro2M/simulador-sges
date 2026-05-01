import type { DispatchResultItem } from "../../types/dispatch";
import { normalizeDispatchResults } from "../../utils/dispatchResult";

interface Props {
  data: DispatchResultItem[];
}

function formatNumber(value: number, digits = 2) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function DispatchTable({ data }: Props) {
  const normalizedData = normalizeDispatchResults(data);

  return (
    <section className="result-section">
      <h3>Tabela de dispatch</h3>

      <div className="table-wrapper">
        <table className="result-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Preço</th>
              <th>Ação</th>
              <th>Carga kWh</th>
              <th>Descarga kWh</th>
              <th>SOC kWh</th>
              <th>Receita</th>
              <th>Custo</th>
              <th>Fluxo líquido</th>
            </tr>
          </thead>

          <tbody>
            {normalizedData.map((item, index) => (
              <tr key={`${item.hour}-${index}`}>
                <td>{item.hour}</td>
                <td>{formatNumber(item.price)}</td>
                <td>{item.action}</td>
                <td>{formatNumber(item.charged_energy_kwh)}</td>
                <td>{formatNumber(item.discharged_energy_kwh)}</td>
                <td>{formatNumber(item.soc_kwh)}</td>
                <td>{formatNumber(item.revenue)}</td>
                <td>{formatNumber(item.cost)}</td>
                <td>{formatNumber(item.net_cashflow)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}