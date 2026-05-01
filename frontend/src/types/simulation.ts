export type TechnologyType = "tower" | "shaft";

export interface SimulationRequest {
  name: string;
  technology_type: TechnologyType;

  mass_kg: number;
  height_m: number;
  nominal_power_kw: number;

  motor_efficiency: number;
  generator_efficiency: number;
  mechanical_efficiency: number;
  auxiliary_efficiency: number;

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
  delivered_energy_kwh: number;
  round_trip_efficiency: number;
  nominal_power_kw: number;
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
  initial_capex: number;
  annual_opex: number;
  annual_discharged_energy_mwh: number;
  lcos_result: LcosResult;
}

export interface SimulationResponse {
  success: boolean;
  scenario_name: string;
  result: SimulationResultData;
}