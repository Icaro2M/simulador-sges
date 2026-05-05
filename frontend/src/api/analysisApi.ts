import { apiClient } from "./client";

import type { SimulationRequest } from "../types/simulation";
import type {
  ComparisonResponse,
  MonteCarloRequest,
  MonteCarloResponse,
  SensitivityRequest,
  SensitivityResponse,
} from "../types/analysis";
import { buildTechnologyScenarioPayload } from "../utils/technologyModel";

export async function compareScenarios(
  scenarios: SimulationRequest[]
): Promise<ComparisonResponse> {
  const response = await apiClient.post<ComparisonResponse>("/compare", {
    scenarios: scenarios.map(buildTechnologyScenarioPayload),
  });

  return response.data;
}

export async function runSensitivityAnalysis(
  data: SensitivityRequest
): Promise<SensitivityResponse> {
  const response = await apiClient.post<SensitivityResponse>(
    "/sensitivity",
    {
      ...data,
      base_scenario: buildTechnologyScenarioPayload(data.base_scenario),
    }
  );

  return response.data;
}

export async function runMonteCarlo(
  request: MonteCarloRequest
): Promise<MonteCarloResponse> {
  const response = await apiClient.post<MonteCarloResponse>(
    "/monte-carlo",
    {
      ...request,
      base_scenario: buildTechnologyScenarioPayload(request.base_scenario),
    }
  );

  return response.data;
}
