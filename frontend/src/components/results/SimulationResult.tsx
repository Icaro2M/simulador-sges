import type { SimulationResponse } from "../../types/simulation";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "../../utils/formatters";
import { ResultTable } from "./ResultTable";
import { SimulationEnergyChart } from "../charts/SimulationEnergyChart";
import { SimulationCostChart } from "../charts/SimulationCostChart";

interface SimulationResultProps {
  response: SimulationResponse;
}

function SummaryMetric({
  title,
  value,
  unit,
}: {
  title: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-5">
      <span className="block text-sm font-medium text-slate-500">{title}</span>

      <strong className="mt-2 block text-2xl font-semibold text-slate-950">
        {value}
        {unit && <small className="ml-1 text-sm font-medium text-slate-500">{unit}</small>}
      </strong>
    </article>
  );
}

export function SimulationResult({ response }: SimulationResultProps) {
  const result = response.result;
  const technology = result.technology_result;
  const lcos = result.lcos_result;

  const technicalRows = [
    {
      label: "Tecnologia",
      value: technology.technology_name,
    },
    {
      label: "Energia armazenada",
      value: formatNumber(technology.stored_energy_kwh),
      unit: "kWh",
    },
    {
      label: "Energia requerida na carga",
      value: formatNumber(technology.required_charge_energy_kwh),
      unit: "kWh",
    },
    {
      label: "Energia entregue",
      value: formatNumber(technology.delivered_energy_kwh),
      unit: "kWh",
    },
    {
      label: "Energia efetiva entregue",
      value: formatNumber(result.effective_delivered_energy_kwh),
      unit: "kWh",
    },
    {
      label: "Eficiência de carga",
      value: formatPercent(technology.charge_efficiency),
    },
    {
      label: "Eficiência de descarga",
      value: formatPercent(technology.discharge_efficiency),
    },
    {
      label: "Eficiência round-trip",
      value: formatPercent(technology.round_trip_efficiency),
    },
    {
      label: "Potência nominal",
      value: formatNumber(technology.nominal_power_kw),
      unit: "kW",
    },
    {
      label: "Tempo de carga",
      value: formatNumber(technology.charge_time_h, 4),
      unit: "h",
    },
    {
      label: "Tempo de descarga",
      value: formatNumber(technology.discharge_time_h, 4),
      unit: "h",
    },
    {
      label: "Tempo standby por ciclo",
      value: formatNumber(result.standby_hours_per_cycle, 4),
      unit: "h",
    },
    {
      label: "Perda standby por ciclo",
      value: formatNumber(result.standby_loss_per_cycle_kwh),
      unit: "kWh",
    },
  ];

  const economicRows = [
    {
      label: "CAPEX inicial",
      value: formatCurrency(result.initial_capex),
    },
    {
      label: "OPEX anual",
      value: formatCurrency(result.annual_opex),
    },
    {
      label: "Energia anual descarregada",
      value: formatNumber(result.annual_discharged_energy_mwh),
      unit: "MWh",
    },
    {
      label: "Perda standby anual",
      value: formatNumber(result.annual_standby_loss_kwh),
      unit: "kWh",
    },
    {
      label: "LCOS",
      value: lcos ? formatCurrency(lcos.lcos_per_mwh) : "Indefinido",
    },
    {
      label: "Custo descontado",
      value: lcos ? formatCurrency(lcos.discounted_cost) : "-",
    },
    {
      label: "Energia descontada",
      value: lcos ? formatNumber(lcos.discounted_energy_mwh) : "-",
      unit: "MWh",
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-950">
          Resultado da simulação
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Cenário: {response.scenario_name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric
          title="Energia efetiva"
          value={formatNumber(result.effective_delivered_energy_kwh)}
          unit="kWh"
        />

        <SummaryMetric
          title="Eficiência round-trip"
          value={formatPercent(technology.round_trip_efficiency)}
        />

        <SummaryMetric
          title="CAPEX inicial"
          value={formatCurrency(result.initial_capex)}
        />

        <SummaryMetric
          title="LCOS"
          value={lcos ? formatCurrency(lcos.lcos_per_mwh) : "Indefinido"}
          unit="/MWh"
        />
      </div>

      {result.warnings.length > 0 && (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {result.warnings.join(" ")}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <SimulationEnergyChart data={result} />

        <SimulationCostChart
          capex={result.initial_capex}
          opex={result.annual_opex}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ResultTable title="Resultados técnicos" rows={technicalRows} />
        <ResultTable title="Resultados econômicos" rows={economicRows} />
      </div>

      <details className="mt-6 rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm text-white">
        <summary className="cursor-pointer font-semibold">
          Ver resposta completa da API
        </summary>
        <pre className="mt-4 overflow-x-auto text-xs leading-6 text-slate-100">
          {JSON.stringify(response, null, 2)}
        </pre>
      </details>
    </section>
  );
}
