import { apiClient } from "./client";

import type {
  DispatchRequest,
  DispatchResponse,
} from "../types/dispatch";
import { buildTechnologyScenarioPayload } from "../utils/technologyModel";

export async function runDispatch(
  request: DispatchRequest
): Promise<DispatchResponse> {
  const response = await apiClient.post<DispatchResponse>("/dispatch", {
    ...request,
    scenario: buildTechnologyScenarioPayload(request.scenario),
  });
  return response.data;
}
