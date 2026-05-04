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
  const chargePowerKw = technology.charge_power_kw ?? technology.nominal_power_kw;
  const dischargePowerKw = technology.discharge_power_kw ?? technology.nominal_power_kw;
  const maxPotentialEnergyKwh =
    technology.max_potential_energy_kwh ?? technology.stored_energy_kwh;
  const inputEnergyKwh =
    technology.input_energy_kwh ?? technology.required_charge_energy_kwh;
  const technicalDeliveredEnergyKwh =
    technology.technical_delivered_energy_kwh ?? technology.delivered_energy_kwh;
  const availableEnergyKwh =
    result.available_energy_kwh ??
    Math.max(technology.stored_energy_kwh - result.standby_loss_per_cycle_kwh, 0);
  const grossDeliveredEnergyKwh =
    result.gross_delivered_energy_kwh ??
    availableEnergyKwh * technology.discharge_efficiency;
  const standbyOutputLossPerCycleKwh =
    result.standby_output_loss_per_cycle_kwh ??
    Math.max(technicalDeliveredEnergyKwh - grossDeliveredEnergyKwh, 0);
  const fractionalCycleLossPerCycleKwh =
    result.fractional_cycle_loss_per_cycle_kwh ?? 0;
  const fixedCycleLossPerCycleKwh =
    result.fixed_cycle_loss_per_cycle_kwh ?? 0;
  const cycleLossPerCycleKwh =
    result.cycle_loss_per_cycle_kwh ??
    Math.max(grossDeliveredEnergyKwh - result.effective_delivered_energy_kwh, 0);
  const totalLossPerCycleKwh =
    standbyOutputLossPerCycleKwh + cycleLossPerCycleKwh;
  const effectiveRoundTripEfficiency =
    result.effective_round_trip_efficiency ?? technology.round_trip_efficiency;
  const annualChargingEnergyMwh =
    result.annual_charging_energy_mwh ??
    (result.annual_discharged_energy_mwh > 0 && effectiveRoundTripEfficiency > 0
      ? result.annual_discharged_energy_mwh / effectiveRoundTripEfficiency
      : 0);
  const annualChargingEnergyCost = result.annual_charging_energy_cost ?? 0;
  const annualLcosCost =
    result.annual_lcos_cost ?? result.annual_opex + annualChargingEnergyCost;
  const availabilityFactor = result.availability_factor ?? 1;
  const annualDischargedEnergyBeforeAvailabilityMwh =
    result.annual_discharged_energy_before_availability_mwh ??
    result.annual_discharged_energy_mwh;
  const technologySpecificCapex =
    result.technology_specific_capex ??
    technology.technology_specific_capex ??
    0;
  const towerStructureCost =
    result.tower_structure_cost ?? technology.tower_structure_cost ?? 0;
  const shaftRehabilitationCost =
    result.shaft_rehabilitation_cost ??
    technology.shaft_rehabilitation_cost ??
    0;

  const technicalRows = [
    {
      label: "Tecnologia",
      value: technology.technology_name,
    },
    {
      label: "Massa efetiva usada",
      value: technology.effective_mass_kg
        ? formatNumber(technology.effective_mass_kg)
        : "-",
      unit: technology.effective_mass_kg ? "kg" : undefined,
    },
    {
      label: "Altura util",
      value: technology.usable_height_m
        ? formatNumber(technology.usable_height_m)
        : "-",
      unit: technology.usable_height_m ? "m" : undefined,
    },
    {
      label: "Profundidade util",
      value: technology.usable_depth_m
        ? formatNumber(technology.usable_depth_m)
        : "-",
      unit: technology.usable_depth_m ? "m" : undefined,
    },
    {
      label: "Energia potencial máxima",
      value: formatNumber(maxPotentialEnergyKwh),
      unit: "kWh",
    },
    {
      label: "Energia elétrica de entrada",
      value: formatNumber(inputEnergyKwh),
      unit: "kWh",
    },
    {
      label: "Energia armazenada",
      value: formatNumber(technology.stored_energy_kwh),
      unit: "kWh",
    },
    {
      label: "Energia disponível após standby",
      value: formatNumber(availableEnergyKwh),
      unit: "kWh",
    },
    {
      label: "Energia elétrica antes das perdas",
      value: formatNumber(grossDeliveredEnergyKwh),
      unit: "kWh",
    },
    {
      label: "Energia técnica entregue",
      value: formatNumber(technicalDeliveredEnergyKwh),
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
      label: "Eficiência round-trip técnica",
      value: formatPercent(technology.round_trip_efficiency),
    },
    {
      label: "Eficiência efetiva do ciclo",
      value: formatPercent(effectiveRoundTripEfficiency),
    },
    {
      label: "Potência nominal",
      value: formatNumber(technology.nominal_power_kw),
      unit: "kW",
    },
    {
      label: "Potência de carga",
      value: formatNumber(chargePowerKw),
      unit: "kW",
    },
    {
      label: "Potência de descarga",
      value: formatNumber(dischargePowerKw),
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
    {
      label: "Perda standby equivalente na saída",
      value: formatNumber(standbyOutputLossPerCycleKwh),
      unit: "kWh",
    },
    {
      label: "Perda fracionária de ciclo",
      value: formatNumber(fractionalCycleLossPerCycleKwh),
      unit: "kWh",
    },
    {
      label: "Perda fixa de ciclo aplicada",
      value: formatNumber(fixedCycleLossPerCycleKwh),
      unit: "kWh",
    },
    {
      label: "Perda de ciclo por ciclo",
      value: formatNumber(cycleLossPerCycleKwh),
      unit: "kWh",
    },
    {
      label: "Perdas totais por ciclo",
      value: formatNumber(totalLossPerCycleKwh),
      unit: "kWh",
    },
  ];

  const economicRows = [
    {
      label: "CAPEX base",
      value:
        result.base_capex !== undefined
          ? formatCurrency(result.base_capex)
          : "-",
    },
    {
      label: "CAPEX especifico da tecnologia",
      value: formatCurrency(technologySpecificCapex),
    },
    {
      label: "Custo estrutural da torre",
      value: formatCurrency(towerStructureCost),
    },
    {
      label: "Custo de reabilitacao do poco",
      value: formatCurrency(shaftRehabilitationCost),
    },
    {
      label: "CAPEX inicial",
      value: formatCurrency(result.initial_capex),
    },
    {
      label: "OPEX anual",
      value: formatCurrency(result.annual_opex),
    },
    {
      label: "Energia anual necessaria para carga",
      value: formatNumber(annualChargingEnergyMwh),
      unit: "MWh",
    },
    {
      label: "Custo anual de carregamento",
      value: formatCurrency(annualChargingEnergyCost),
    },
    {
      label: "Custo anual considerado no LCOS",
      value: formatCurrency(annualLcosCost),
    },
    {
      label: "Custo de reposicao nominal",
      value: formatCurrency(result.replacement_cost),
    },
    {
      label: "Ano da reposicao",
      value: result.replacement_year ?? "-",
    },
    {
      label: "Valor presente da reposicao",
      value: lcos ? formatCurrency(lcos.discounted_replacement_cost) : "-",
    },
    {
      label: "Custo de fim de vida nominal",
      value: formatCurrency(result.end_of_life_cost),
    },
    {
      label: "Valor presente do fim de vida",
      value: lcos ? formatCurrency(lcos.discounted_end_of_life_cost) : "-",
    },
    {
      label: "Energia anual bruta sem disponibilidade",
      value: formatNumber(annualDischargedEnergyBeforeAvailabilityMwh),
      unit: "MWh",
    },
    {
      label: "Disponibilidade operacional",
      value: formatPercent(availabilityFactor),
    },
    {
      label: "Energia anual efetiva com disponibilidade",
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
          title="Eficiência efetiva"
          value={formatPercent(effectiveRoundTripEfficiency)}
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
          chargingEnergyCost={annualChargingEnergyCost}
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
