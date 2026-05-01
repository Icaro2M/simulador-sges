import type { SimulationRequest } from "./simulation";

export interface ComparisonResultItem {
  scenario_name: string;
  technology_name: string;
  stored_energy_kwh: number;
  delivered_energy_kwh: number;
  round_trip_efficiency: number;
  nominal_power_kw: number;
  initial_capex: number;
  annual_opex: number;
  annual_discharged_energy_mwh: number;
  lcos_per_mwh: number | null;
}

export interface ComparisonResponse {
  success: boolean;
  results: ComparisonResultItem[];
}

export interface SensitivityRequest {
  base_scenario: SimulationRequest;
  parameter_path: string;
  min_val: number;
  max_val: number;
  steps: number;
}

export interface SensitivityResultItem {
  parameter: string;
  value: number;
  lcos: number | null;
  capex: number;
  annual_energy_mwh: number;
}

export interface SensitivityResponse {
  success: boolean;
  parameter: string;
  results: SensitivityResultItem[];
}

export interface MonteCarloRequest {
  base_scenario: SimulationRequest;
  parameter_ranges: Record<string, [number, number]>;
  iterations: number;
  seed?: number | null;
}

export interface MonteCarloResultItem {
  iteration: number;
  sampled_values: Record<string, number>;
  lcos: number | null;
  capex: number;
  annual_energy_mwh: number;
  round_trip_efficiency: number;
}

export interface MonteCarloResponse {
  success: boolean;
  iterations: number;
  results: MonteCarloResultItem[];
}

