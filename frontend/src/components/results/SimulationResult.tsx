import type { SimulationResponse } from "../../types/simulation";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "../../utils/formatters";
import { MetricCard } from "./MetricCard";
import { ResultTable } from "./ResultTable";
import { SimulationEnergyChart } from "../charts/SimulationEnergyChart";
import { SimulationCostChart } from "../charts/SimulationCostChart";

interface SimulationResultProps {
  response: SimulationResponse;
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
      label: "Energia entregue",
      value: formatNumber(technology.delivered_energy_kwh),
      unit: "kWh",
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
      label: "LCOS",
      value: formatCurrency(lcos.lcos_per_mwh),
    },
    {
      label: "Custo descontado",
      value: formatCurrency(lcos.discounted_cost),
    },
    {
      label: "Energia descontada",
      value: formatNumber(lcos.discounted_energy_mwh),
      unit: "MWh",
    },
  ];

  return (
    <section className="simulation-result">
      <div className="result-header">
        <div>
          <h2>Resultado da simulação</h2>
          <p>Cenário: {response.scenario_name}</p>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Energia entregue"
          value={formatNumber(technology.delivered_energy_kwh)}
          unit="kWh"
        />

        <MetricCard
          title="Eficiência round-trip"
          value={formatPercent(technology.round_trip_efficiency)}
        />

        <MetricCard
          title="CAPEX inicial"
          value={formatCurrency(result.initial_capex)}
        />

        <MetricCard
          title="LCOS"
          value={formatCurrency(lcos.lcos_per_mwh)}
          unit="/MWh"
        />

      </div>

      <SimulationEnergyChart data={technology} />

      <SimulationCostChart
        capex={result.initial_capex}
        opex={result.annual_opex}
      />

      <div className="result-tables-grid">
        <ResultTable title="Resultados técnicos" rows={technicalRows} />
        <ResultTable title="Resultados econômicos" rows={economicRows} />
      </div>

      <details className="raw-result">
        <summary>Ver resposta completa da API</summary>
        <pre>{JSON.stringify(response, null, 2)}</pre>
      </details>
    </section>
  );
}