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
    <section className="metrics-grid">
      <article className="metric-card">
        <span>Energia carregada</span>
        <strong>{formatNumber(totalChargedEnergy)} kWh</strong>
      </article>

      <article className="metric-card">
        <span>Energia descarregada</span>
        <strong>{formatNumber(totalDischargedEnergy)} kWh</strong>
      </article>

      <article className="metric-card">
        <span>Maior SOC</span>
        <strong>{formatNumber(maxSoc)} kWh</strong>
      </article>

      <article className="metric-card">
        <span>Fluxo líquido total</span>
        <strong>{formatNumber(totalNetCashflow)}</strong>
      </article>
    </section>
  );
}