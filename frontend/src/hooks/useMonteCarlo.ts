import { useState } from "react";
import { runMonteCarlo } from "../api/analysisApi";
import type {
  MonteCarloRequest,
  MonteCarloResponse,
} from "../types/analysis";

export function useMonteCarlo() {
  const [data, setData] = useState<MonteCarloResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function executeMonteCarlo(request: MonteCarloRequest) {
    try {
      setLoading(true);
      setError(null);

      const result = await runMonteCarlo(request);
      setData(result);

      return result;
    } catch (err) {
      setError("Erro ao executar análise de Monte Carlo.");
      console.error(err);

      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    data,
    loading,
    error,
    executeMonteCarlo,
  };
}