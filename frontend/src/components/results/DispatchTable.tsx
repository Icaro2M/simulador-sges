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
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-950">
          Tabela de dispatch
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Série temporal retornada pelo backend para cada hora simulada.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="px-6 py-3 font-semibold text-slate-500">Hora</th>
              <th className="px-6 py-3 font-semibold text-slate-500">Preço</th>
              <th className="px-6 py-3 font-semibold text-slate-500">Ação</th>
              <th className="px-6 py-3 font-semibold text-slate-500">
                Carga kWh
              </th>
              <th className="px-6 py-3 font-semibold text-slate-500">
                Descarga kWh
              </th>
              <th className="px-6 py-3 font-semibold text-slate-500">SOC kWh</th>
              <th className="px-6 py-3 font-semibold text-slate-500">Receita</th>
              <th className="px-6 py-3 font-semibold text-slate-500">Custo</th>
              <th className="px-6 py-3 font-semibold text-slate-500">
                Fluxo líquido
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {normalizedData.map((item, index) => (
              <tr key={`${item.hour}-${index}`}>
                <td className="px-6 py-4 text-slate-950">{item.hour}</td>
                <td className="px-6 py-4 text-slate-950">
                  {formatNumber(item.price)}
                </td>
                <td className="px-6 py-4 text-slate-950">{item.action}</td>
                <td className="px-6 py-4 text-slate-950">
                  {formatNumber(item.charged_energy_kwh)}
                </td>
                <td className="px-6 py-4 text-slate-950">
                  {formatNumber(item.discharged_energy_kwh)}
                </td>
                <td className="px-6 py-4 text-slate-950">
                  {formatNumber(item.soc_kwh)}
                </td>
                <td className="px-6 py-4 text-slate-950">
                  {formatNumber(item.revenue)}
                </td>
                <td className="px-6 py-4 text-slate-950">
                  {formatNumber(item.cost)}
                </td>
                <td className="px-6 py-4 text-slate-950">
                  {formatNumber(item.net_cashflow)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
