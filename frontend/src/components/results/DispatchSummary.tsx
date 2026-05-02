import type {
  DispatchResultItem,
  DispatchSummary as DispatchSummaryData,
} from "../../types/dispatch";
import { normalizeDispatchResults } from "../../utils/dispatchResult";

interface Props {
  data: DispatchResultItem[];
  summary?: DispatchSummaryData;
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

function getSummaryNumber(
  summary: DispatchSummaryData | undefined,
  key: string,
  fallback: number
) {
  const value = summary?.[key];

  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  return fallback;
}

export function DispatchSummary({ data, summary }: Props) {
  const normalizedData = normalizeDispatchResults(data);

  const totalChargedEnergy = normalizedData.reduce(
    (sum, item) => sum + item.charged_energy_kwh,
    0
  );
  const totalStoredEnergy = normalizedData.reduce(
    (sum, item) => sum + item.stored_energy_kwh,
    0
  );
  const totalDischargedEnergy = normalizedData.reduce(
    (sum, item) => sum + item.discharged_energy_kwh,
    0
  );
  const totalStandbyLoss = normalizedData.reduce(
    (sum, item) => sum + item.standby_loss_kwh,
    0
  );
  const totalCost = normalizedData.reduce((sum, item) => sum + item.cost, 0);
  const totalRevenue = normalizedData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const totalNetCashflow = normalizedData.reduce(
    (sum, item) => sum + item.net_cashflow,
    0
  );
  const finalSoc = normalizedData.at(-1)?.soc_final_kwh ?? 0;
  const chargeHours = normalizedData.filter((item) => item.action === "charge")
    .length;
  const dischargeHours = normalizedData.filter(
    (item) => item.action === "discharge"
  ).length;
  const standbyHours = normalizedData.filter((item) => item.action === "standby")
    .length;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Carga da rede"
        value={`${formatNumber(
          getSummaryNumber(
            summary,
            "total_energy_charged_from_grid_kwh",
            totalChargedEnergy
          )
        )} kWh`}
      />

      <SummaryCard
        title="Energia armazenada"
        value={`${formatNumber(
          getSummaryNumber(summary, "total_energy_stored_kwh", totalStoredEnergy)
        )} kWh`}
      />

      <SummaryCard
        title="Energia entregue"
        value={`${formatNumber(
          getSummaryNumber(
            summary,
            "total_energy_discharged_to_grid_kwh",
            totalDischargedEnergy
          )
        )} kWh`}
      />

      <SummaryCard
        title="Perdas standby"
        value={`${formatNumber(
          getSummaryNumber(summary, "total_standby_loss_kwh", totalStandbyLoss)
        )} kWh`}
      />

      <SummaryCard
        title="SOC final"
        value={`${formatNumber(
          getSummaryNumber(summary, "final_soc_kwh", finalSoc)
        )} kWh`}
      />

      <SummaryCard
        title="Receita total"
        value={formatNumber(
          getSummaryNumber(summary, "total_revenue", totalRevenue)
        )}
      />

      <SummaryCard
        title="Custo de carga"
        value={formatNumber(
          getSummaryNumber(summary, "total_charge_cost", totalCost)
        )}
      />

      <SummaryCard
        title="Lucro liquido"
        value={formatNumber(
          getSummaryNumber(summary, "net_profit", totalNetCashflow)
        )}
      />

      <SummaryCard
        title="Horas carregando"
        value={formatNumber(getSummaryNumber(summary, "charge_hours", chargeHours), 0)}
      />

      <SummaryCard
        title="Horas descarregando"
        value={formatNumber(
          getSummaryNumber(summary, "discharge_hours", dischargeHours),
          0
        )}
      />

      <SummaryCard
        title="Horas standby"
        value={formatNumber(
          getSummaryNumber(summary, "standby_hours", standbyHours),
          0
        )}
      />
    </section>
  );
}
