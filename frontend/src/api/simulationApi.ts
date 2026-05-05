import { apiClient } from "./client";
import type {
  SimulationRequest,
  SimulationResponse,
} from "../types/simulation";
import { buildTechnologyScenarioPayload } from "../utils/technologyModel";

export async function simulateScenario(
  data: SimulationRequest
): Promise<SimulationResponse> {
  const response = await apiClient.post<SimulationResponse>(
    "/simulate",
    buildTechnologyScenarioPayload(data)
  );
  return response.data;
}
