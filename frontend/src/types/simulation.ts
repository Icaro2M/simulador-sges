export type TechnologyType = "tower" | "shaft";

export interface SimulationRequest {
  name: string;
  technology_type: TechnologyType;

  mass_kg: number;
  height_m: number;
  nominal_power_kw: number;
  charge_power_kw: number;
  discharge_power_kw: number;

  charge_efficiency: number;
  discharge_efficiency: number;

  cycle_loss_fraction: number;
  fixed_cycle_loss_kwh: number;
  standby_loss_kwh_per_hour: number;

  cost_per_kw: number;
  cost_per_kwh: number;
  fixed_capex: number;
  fixed_annual_opex: number;
  variable_opex_per_mwh: number;

  project_lifetime_years: number;
  discount_rate: number;
  cycles_per_year: number;
}

export interface TechnologySimulationResult {
  technology_name: string;
  stored_energy_kwh: number;
  required_charge_energy_kwh: number;
  delivered_energy_kwh: number;
  charge_efficiency: number;
  discharge_efficiency: number;
  round_trip_efficiency: number;
  nominal_power_kw: number;
  charge_power_kw: number;
  discharge_power_kw: number;
  charge_time_h: number;
  discharge_time_h: number;
}

export interface LcosResult {
  lcos_per_mwh: number;
  discounted_cost: number;
  discounted_energy_mwh: number;
}

export interface SimulationResultData {
  scenario_name: string;
  technology_result: TechnologySimulationResult;
  effective_delivered_energy_kwh: number;
  standby_hours_per_cycle: number;
  standby_loss_per_cycle_kwh: number;
  annual_standby_loss_kwh: number;
  status: string;
  warnings: string[];
  initial_capex: number;
  annual_opex: number;
  annual_discharged_energy_mwh: number;
  lcos_result: LcosResult | null;
}

export interface SimulationResponse {
  success: boolean;
  scenario_name: string;
  result: SimulationResultData;
}
