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
  charging_energy_cost_per_mwh: number;

  project_lifetime_years: number;
  discount_rate: number;
  cycles_per_year: number;
  availability_factor: number;
}

export interface TechnologySimulationResult {
  technology_name: string;
  max_potential_energy_kwh: number;
  input_energy_kwh: number;
  stored_energy_kwh: number;
  required_charge_energy_kwh: number;
  technical_delivered_energy_kwh: number;
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
  discounted_opex: number;
  discounted_charging_energy_cost: number;
  discounted_replacement_cost: number;
  discounted_end_of_life_cost: number;
}

export interface SimulationResultData {
  scenario_name: string;
  technology_result: TechnologySimulationResult;
  available_energy_kwh: number;
  gross_delivered_energy_kwh: number;
  effective_delivered_energy_kwh: number;
  standby_output_loss_per_cycle_kwh: number;
  fractional_cycle_loss_per_cycle_kwh: number;
  fixed_cycle_loss_per_cycle_kwh: number;
  cycle_loss_per_cycle_kwh: number;
  total_loss_per_cycle_kwh: number;
  effective_round_trip_efficiency: number;
  standby_hours_per_cycle: number;
  standby_loss_per_cycle_kwh: number;
  annual_standby_loss_kwh: number;
  status: string;
  warnings: string[];
  initial_capex: number;
  availability_factor: number;
  annual_discharged_energy_before_availability_mwh: number;
  annual_opex: number;
  annual_discharged_energy_mwh: number;
  annual_charging_energy_mwh?: number;
  annual_charging_energy_cost?: number;
  annual_lcos_cost?: number;
  lcos_result: LcosResult | null;
}

export interface SimulationResponse {
  success: boolean;
  scenario_name: string;
  result: SimulationResultData;
}
