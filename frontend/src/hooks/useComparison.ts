import { useState } from "react";
import { compareScenarios } from "../api/analysisApi";
import type { SimulationRequest } from "../types/simulation";
import type { ComparisonResultItem } from "../types/analysis";

export function useComparison() {
  const [results, setResults] = useState<ComparisonResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runComparison(scenarios: SimulationRequest[]) {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await compareScenarios(scenarios);
      setResults(response.results);

      return response.results;
    } catch (err) {
      console.error(err);
      setErrorMessage("Erro ao executar comparação de cenários.");

      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    results,
    isLoading,
    errorMessage,
    runComparison,
  };
}