import { useState } from "react";

import { runSensitivityAnalysis } from "../api/analysisApi";
import type {
  SensitivityRequest,
  SensitivityResponse,
} from "../types/analysis";

export function useSensitivity() {
  const [result, setResult] = useState<SensitivityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runSensitivity(data: SensitivityRequest) {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await runSensitivityAnalysis(data);
      setResult(response);

      return response;
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Não foi possível executar a análise de sensibilidade. Verifique se a API está rodando."
      );

      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    result,
    isLoading,
    errorMessage,
    runSensitivity,
  };
}