export type DashboardResultType =
  | "simulation"
  | "comparison"
  | "sensitivity"
  | "monte_carlo"
  | "dispatch";

export interface DashboardStoredResult {
  id: string;
  type: DashboardResultType;
  title: string;
  createdAt: string;

  lcos_per_mwh?: number;
  delivered_energy_kwh?: number;
  rte?: number;
  capex?: number;
}