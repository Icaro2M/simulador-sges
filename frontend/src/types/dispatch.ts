import type { SimulationRequest } from "./simulation";

export interface DispatchPricePoint {
  hour: number;
  price: number;
}

export interface DispatchRequest {
  scenario: SimulationRequest;
  price_profile: DispatchPricePoint[];

  low_price_threshold: number;
  high_price_threshold: number;
  initial_soc_kwh: number;
}

export interface DispatchResultItem {
  [key: string]: unknown;
}

export interface DispatchSummary {
  [key: string]: unknown;
}

export interface DispatchResponse {
  success: boolean;
  results: DispatchResultItem[];
  summary?: DispatchSummary;
}
