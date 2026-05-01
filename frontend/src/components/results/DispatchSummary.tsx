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

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <span className="block text-sm font-medium text-slate-500">{title}</span>
      <strong className="mt-2 block text-2xl font-semibold text-slate-950">
        {value}
      </strong>
    </article>
  );
}

export function DispatchSummary({ data }: Props) {
  const normalizedData = normalizeDispatchResults(data);

  const totalChargedEnergy = normalizedData.reduce(
    (sum, item) => sum + item.charged_energy_kwh,
    0
  );

  const totalDischargedEnergy = normalizedData.reduce(
    (sum, item) => sum + item.discharged_energy_kwh,
    0
  );

  const maxSoc = normalizedData.reduce(
    (maxValue, item) => Math.max(maxValue, item.soc_kwh),
    0
  );

  const totalNetCashflow = normalizedData.reduce(
    (sum, item) => sum + item.net_cashflow,
    0
  );

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Energia carregada"
        value={`${formatNumber(totalChargedEnergy)} kWh`}
      />

      <SummaryCard
        title="Energia descarregada"
        value={`${formatNumber(totalDischargedEnergy)} kWh`}
      />

      <SummaryCard title="Maior SOC" value={`${formatNumber(maxSoc)} kWh`} />

      <SummaryCard
        title="Fluxo líquido total"
        value={formatNumber(totalNetCashflow)}
      />
    </section>
  );
}
