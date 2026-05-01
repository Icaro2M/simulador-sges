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
      <div className="space-y-8">
        <SimulationForm onSubmit={handleSubmit} isLoading={isLoading} />

        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <SimulationResult response={result} />

            <div className="flex justify-end">
              <button
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                type="button"
                onClick={clearResult}
              >
                Limpar resultado
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
