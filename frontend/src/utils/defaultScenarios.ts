import type { SimulationRequest } from "../types/simulation";

export function createDefaultScenario(
  overrides: Partial<SimulationRequest> = {}
): SimulationRequest {
  return {
    name: "Cenário SGES",
    technology_type: "tower",

    mass_kg: 10000,
    height_m: 100,
    nominal_power_kw: 500,
    charge_power_kw: 500,
    discharge_power_kw: 500,

    charge_efficiency: 0.9,
    discharge_efficiency: 0.9,

    cycle_loss_fraction: 0.02,
    fixed_cycle_loss_kwh: 0,
    standby_loss_kwh_per_hour: 0,

    cost_per_kw: 800,
    cost_per_kwh: 100,
    fixed_capex: 50000,
    fixed_annual_opex: 10000,
    variable_opex_per_mwh: 5,
    charging_energy_cost_per_mwh: 0,

    project_lifetime_years: 20,
    discount_rate: 0.08,
    cycles_per_year: 300,

    ...overrides,
  };
}

export function createDefaultComparisonScenarios(): SimulationRequest[] {
  return [
    createDefaultScenario({
      name: "Tower",
      technology_type: "tower",
      mass_kg: 10000,
      height_m: 100,
      nominal_power_kw: 500,
      charge_power_kw: 500,
      discharge_power_kw: 500,
      cost_per_kw: 800,
      cost_per_kwh: 100,
      fixed_capex: 50000,
      fixed_annual_opex: 10000,
      variable_opex_per_mwh: 5,
    }),

    createDefaultScenario({
      name: "Shaft",
      technology_type: "shaft",
      mass_kg: 12000,
      height_m: 120,
      nominal_power_kw: 700,
      charge_power_kw: 700,
      discharge_power_kw: 700,
      charge_efficiency: 0.88,
      discharge_efficiency: 0.9,
      cost_per_kw: 900,
      cost_per_kwh: 120,
      fixed_capex: 60000,
      fixed_annual_opex: 12000,
      variable_opex_per_mwh: 6,
      cycle_loss_fraction: 0.03,
    }),
  ];
}
