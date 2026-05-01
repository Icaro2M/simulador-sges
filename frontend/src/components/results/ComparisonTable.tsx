import type { ComparisonResultItem } from "../../types/analysis";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "../../utils/formatters";

interface Props {
  data: ComparisonResultItem[];
}

export function ComparisonTable({ data }: Props) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-950">
          Comparação de cenários
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Resumo dos principais indicadores de cada cenário executado.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="px-6 py-3 font-semibold text-slate-500">Métrica</th>
              {data.map((item) => (
                <th
                  className="px-6 py-3 font-semibold text-slate-950"
                  key={item.scenario_name}
                >
                  {item.scenario_name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-6 py-4 font-medium text-slate-500">
                Tecnologia
              </td>
              {data.map((item) => (
                <td className="px-6 py-4 text-slate-950" key={item.scenario_name}>
                  {item.technology_name}
                </td>
              ))}
            </tr>

            <tr>
              <td className="px-6 py-4 font-medium text-slate-500">
                Energia entregue
              </td>
              {data.map((item) => (
                <td className="px-6 py-4 text-slate-950" key={item.scenario_name}>
                  {formatNumber(item.delivered_energy_kwh)} kWh
                </td>
              ))}
            </tr>

            <tr>
              <td className="px-6 py-4 font-medium text-slate-500">
                Eficiência round-trip
              </td>
              {data.map((item) => (
                <td className="px-6 py-4 text-slate-950" key={item.scenario_name}>
                  {formatPercent(item.round_trip_efficiency)}
                </td>
              ))}
            </tr>

            <tr>
              <td className="px-6 py-4 font-medium text-slate-500">
                CAPEX inicial
              </td>
              {data.map((item) => (
                <td className="px-6 py-4 text-slate-950" key={item.scenario_name}>
                  {formatCurrency(item.initial_capex)}
                </td>
              ))}
            </tr>

            <tr>
              <td className="px-6 py-4 font-medium text-slate-500">LCOS</td>
              {data.map((item) => (
                <td className="px-6 py-4 text-slate-950" key={item.scenario_name}>
                  {formatCurrency(item.lcos_per_mwh)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
