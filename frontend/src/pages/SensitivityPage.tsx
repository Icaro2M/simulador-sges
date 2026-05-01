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
      <form
        onSubmit={handleSubmit(handleRunSensitivity)}
        className="simulation-form"
      >
        <div className="form-grid">
          <label>
            Métrica do gráfico
            <select
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
        </div>

        <SensitivityForm register={register} errors={errors} />

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? "Executando..." : "Executar sensibilidade"}
          </button>
        </div>
      </form>

      {errorMessage && <div className="error-alert">{errorMessage}</div>}

      {result && (
        <>
          <SensitivityChart
            data={result.results}
            parameter={result.parameter}
            metric={metric}
          />

          <ResultTable title="Resultados da sensibilidade" rows={rows} />

          <details className="raw-result">
            <summary>Ver resposta completa da API</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </>
      )}
    </PageContainer>
  );
}