import { apiClient } from "./client";

import type {
  DispatchRequest,
  DispatchResponse,
} from "../types/dispatch";

export async function runDispatch(
  request: DispatchRequest
): Promise<DispatchResponse> {
  const response = await apiClient.post<DispatchResponse>("/dispatch", request);
  return response.data;
}