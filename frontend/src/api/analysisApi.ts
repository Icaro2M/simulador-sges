import { apiClient } from "./client";

import type { SimulationRequest } from "../types/simulation";
import type {
  ComparisonResponse,
  MonteCarloRequest,
  MonteCarloResponse,
  SensitivityRequest,
  SensitivityResponse,
} from "../types/analysis";

export async function compareScenarios(
  scenarios: SimulationRequest[]
): Promise<ComparisonResponse> {
  const response = await apiClient.post<ComparisonResponse>("/compare", {
    scenarios,
  });

  return response.data;
}

export async function runSensitivityAnalysis(
  data: SensitivityRequest
): Promise<SensitivityResponse> {
  const response = await apiClient.post<SensitivityResponse>(
    "/sensitivity",
    data
  );

  return response.data;
}

export async function runMonteCarlo(
  request: MonteCarloRequest
): Promise<MonteCarloResponse> {
  const response = await apiClient.post<MonteCarloResponse>(
    "/monte-carlo",
    request
  );

  return response.data;
}