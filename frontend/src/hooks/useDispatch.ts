import { useState } from "react";

import { runDispatch } from "../api/dispatchApi";
import type { DispatchRequest, DispatchResponse } from "../types/dispatch";

export function useDispatch() {
  const [data, setData] = useState<DispatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function executeDispatch(request: DispatchRequest) {
    try {
      setLoading(true);
      setError(null);

      const result = await runDispatch(request);
      setData(result);
    } catch (err) {
      setError("Erro ao executar análise de dispatch.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return {
    data,
    loading,
    error,
    executeDispatch,
  };
}