import { useState } from "react";
import { isAxiosError } from "axios";

import { simulateScenario } from "../api/simulationApi";
import type {
  SimulationRequest,
  SimulationResponse,
} from "../types/simulation";

function completeChargingCostFields(
  response: SimulationResponse,
  request: SimulationRequest
): SimulationResponse {
  const result = response.result;
  const effectiveRoundTripEfficiency =
    result.effective_round_trip_efficiency ??
    result.technology_result.round_trip_efficiency;
  const annualChargingEnergyMwh =
    result.annual_charging_energy_mwh ??
    (result.annual_discharged_energy_mwh > 0 && effectiveRoundTripEfficiency > 0
      ? result.annual_discharged_energy_mwh / effectiveRoundTripEfficiency
      : 0);
  const annualChargingEnergyCost =
    result.annual_charging_energy_cost ??
    annualChargingEnergyMwh * request.charging_energy_cost_per_mwh;
  const annualLcosCost =
    result.annual_lcos_cost ?? result.annual_opex + annualChargingEnergyCost;

  return {
    ...response,
    result: {
      ...result,
      annual_charging_energy_mwh: annualChargingEnergyMwh,
      annual_charging_energy_cost: annualChargingEnergyCost,
      annual_lcos_cost: annualLcosCost,
    },
  };
}

export function useSimulation() {
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runSimulation(data: SimulationRequest) {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = completeChargingCostFields(
        await simulateScenario(data),
        data
      );
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
