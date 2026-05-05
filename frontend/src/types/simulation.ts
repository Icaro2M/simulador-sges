export type TechnologyType = "tower" | "shaft";

export interface SimulationRequest {
  name: string;
  technology_type: TechnologyType;

  mass_kg: number;
  height_m: number;
  nominal_power_kw: number;
  charge_power_kw: number;
  discharge_power_kw: number;
  block_count?: number | null;
  mass_per_block_kg?: number | null;
  usable_height_fraction?: number;
  structure_cost_per_meter?: number;
  usable_depth_fraction?: number;
  shaft_rehabilitation_cost?: number;
  material_density_kg_m3?: number | null;
  container_volume_m3?: number | null;

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
  replacement_cost?: number;
  replacement_year?: number | null;
  end_of_life_cost?: number;
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
  effective_mass_kg?: number | null;
  usable_height_m?: number | null;
  usable_depth_m?: number | null;
  tower_structure_cost?: number;
  shaft_rehabilitation_cost?: number;
  technology_specific_capex?: number;
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
  base_capex?: number;
  technology_specific_capex?: number;
  tower_structure_cost?: number;
  shaft_rehabilitation_cost?: number;
  availability_factor: number;
  annual_discharged_energy_before_availability_mwh: number;
  replacement_cost: number;
  replacement_year: number | null;
  end_of_life_cost: number;
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
