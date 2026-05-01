import { apiClient } from "./client";
import type {
  SimulationRequest,
  SimulationResponse,
} from "../types/simulation";

export async function simulateScenario(
  data: SimulationRequest
): Promise<SimulationResponse> {
  const response = await apiClient.post<SimulationResponse>("/simulate", data);
  return response.data;
}