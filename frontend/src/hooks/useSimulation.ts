import { useState } from "react";
import { isAxiosError } from "axios";

import { simulateScenario } from "../api/simulationApi";
import type {
  SimulationRequest,
  SimulationResponse,
} from "../types/simulation";

export function useSimulation() {
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runSimulation(data: SimulationRequest) {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await simulateScenario(data);
      setResult(response);
      return response;
    } catch (error) {
      console.error(error);
      const detail = isAxiosError(error) ? error.response?.data?.detail : null;

      if (typeof detail === "string") {
        setErrorMessage(detail);
        return null;
      }

      setErrorMessage(
        "Não foi possível executar a simulação. Verifique se a API está rodando."
      );

      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function clearResult() {
    setResult(null);
    setErrorMessage(null);
  }

  return {
    result,
    isLoading,
    errorMessage,
    runSimulation,
    clearResult,
  };
}
