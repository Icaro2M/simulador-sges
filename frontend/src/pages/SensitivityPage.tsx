import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  SensitivityChart,
  type SensitivityMetric,
} from "../components/charts/SensitivityChart";
import { SensitivityForm } from "../components/forms/SensitivityForm";
import { ResultTable } from "../components/results/ResultTable";
import { PageContainer } from "../components/ui/PageContainer";
import { useSensitivity } from "../hooks/useSensitivity";
import type { SensitivityRequest } from "../types/analysis";
import { formatCurrency, formatNumber } from "../utils/formatters";
import { saveDashboardResult } from "../utils/localResults";
import { createDefaultScenario } from "../utils/defaultScenarios";

const defaultValues: SensitivityRequest = {
  parameter_path: "technology.height_m",
  min_val: 50,
  max_val: 300,
  steps: 8,
  base_scenario: createDefaultScenario({
    name: "Cenário base - Sensibilidade",
    technology_type: "tower",
  }),
};

export function SensitivityPage() {
  const { result, isLoading, errorMessage, runSensitivity } = useSensitivity();

  const [metric, setMetric] = useState<SensitivityMetric>("lcos");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SensitivityRequest>({
    defaultValues,
  });

  async function handleRunSensitivity(request: SensitivityRequest) {
    const response = await runSensitivity(request);

    if (!response || response.results.length === 0) {
      return;
    }

    const bestLcosResult = response.results.reduce((best, current) =>
      current.lcos < best.lcos ? current : best
    );

    const bestCapexResult = response.results.reduce((best, current) =>
      current.capex < best.capex ? current : best
    );

    const bestEnergyResult = response.results.reduce((best, current) =>
      current.annual_energy_mwh > best.annual_energy_mwh ? current : best
    );

    saveDashboardResult({
      id: crypto.randomUUID(),
      type: "sensitivity",
      title: `Sensibilidade: ${response.parameter}`,
      createdAt: new Date().toISOString(),
      lcos_per_mwh: bestLcosResult.lcos,
      delivered_energy_kwh: bestEnergyResult.annual_energy_mwh * 1000,
      capex: bestCapexResult.capex,
    });
  }

  function formatMetricValue(value: number) {
    if (metric === "lcos" || metric === "capex") {
      return formatCurrency(value);
    }

    return `${formatNumber(value)} MWh`;
  }

  const rows =
    result?.results.map((item) => ({
      label: formatNumber(item.value),
      value: formatMetricValue(item[metric]),
      unit:
        metric === "lcos"
          ? "LCOS"
          : metric === "capex"
            ? "CAPEX"
            : "Energia anual",
    })) ?? [];

  return (
    <PageContainer
      title="Análise de sensibilidade"
      subtitle="Avalie como a variação de um parâmetro altera os resultados técnico-econômicos."
    >
      <div className="space-y-8">
        <form
          onSubmit={handleSubmit(handleRunSensitivity)}
          className="space-y-6"
        >
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[minmax(240px,360px)_1fr] md:items-end">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Métrica do gráfico
                <select
                  className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  value={metric}
                  onChange={(event) =>
                    setMetric(event.target.value as SensitivityMetric)
                  }
                >
                  <option value="lcos">LCOS</option>
                  <option value="capex">CAPEX</option>
                  <option value="annual_energy_mwh">Energia anual</option>
                </select>
              </label>

              <p className="text-sm text-slate-500">
                Esta métrica será usada no gráfico e na tabela de resultados
                após a execução da análise.
              </p>
            </div>
          </section>

          <SensitivityForm register={register} errors={errors} />

          <div className="flex justify-end border-t border-slate-200 pt-6">
            <button
              className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-400"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Executando..." : "Executar sensibilidade"}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <SensitivityChart
              data={result.results}
              parameter={result.parameter}
              metric={metric}
            />

            <ResultTable title="Resultados da sensibilidade" rows={rows} />

            <details className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm text-white">
              <summary className="cursor-pointer font-semibold">
                Ver resposta completa da API
              </summary>
              <pre className="mt-4 overflow-x-auto text-xs leading-6 text-slate-100">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
