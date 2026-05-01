import { SimulationForm } from "../components/forms/SimulationForm";
import { SimulationResult } from "../components/results/SimulationResult";
import { PageContainer } from "../components/ui/PageContainer";
import { useSimulation } from "../hooks/useSimulation";
import { saveDashboardResult } from "../utils/localResults";

export function SimulationPage() {
  const {
    result,
    isLoading,
    errorMessage,
    runSimulation,
    clearResult,
  } = useSimulation();

  async function handleSubmit(data: Parameters<typeof runSimulation>[0]) {
    const response = await runSimulation(data);

    if (!response) {
      return;
    }

    saveDashboardResult({
      id: crypto.randomUUID(),
      type: "simulation",
      title: response.scenario_name ?? response.result.scenario_name ?? "Simulação SGES",
      createdAt: new Date().toISOString(),
      lcos_per_mwh: response.result.lcos_result.lcos_per_mwh,
      delivered_energy_kwh: response.result.technology_result.delivered_energy_kwh,
      rte: response.result.technology_result.round_trip_efficiency,
      capex: response.result.initial_capex,
    });
  }

  return (
    <PageContainer
      title="Simulação SGES"
      subtitle="Configure um cenário técnico-econômico e execute a simulação individual."
    >
      <SimulationForm onSubmit={handleSubmit} isLoading={isLoading} />

      {errorMessage && <div className="error-alert">{errorMessage}</div>}

      {result && (
        <>
          <SimulationResult response={result} />

          <div className="result-actions">
            <button className="secondary-button" type="button" onClick={clearResult}>
              Limpar resultado
            </button>
          </div>
        </>
      )}
    </PageContainer>
  );
}