import { useState } from "react";

import { MonteCarloChart } from "../components/charts/MonteCarloChart";
import { MonteCarloParametersForm } from "../components/forms/MonteCarloParametersForm";
import { MonteCarloSummary } from "../components/results/MonteCarloSummary";
import { MonteCarloTable } from "../components/results/MonteCarloTable";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionCard } from "../components/ui/SectionCard";
import { useMonteCarlo } from "../hooks/useMonteCarlo";
import { validateMonteCarloInput } from "../utils/monteCarloValidation";
import {
  exportMonteCarloAsCsv,
  exportMonteCarloAsJson,
} from "../utils/exportMonteCarlo";
import { saveDashboardResult } from "../utils/localResults";
import { createDefaultScenario } from "../utils/defaultScenarios";

import type { SimulationRequest } from "../types/simulation";

type MonteCarloMetric =
  | "lcos"
  | "capex"
  | "annual_energy_mwh"
  | "round_trip_efficiency";

export function MonteCarloPage() {
  const { data, loading, error, executeMonteCarlo } = useMonteCarlo();

  const [iterations, setIterations] = useState(100);
  const [seed, setSeed] = useState<number | "">("");
  const [metric, setMetric] = useState<MonteCarloMetric>("lcos");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [baseScenario, setBaseScenario] = useState<SimulationRequest>(
    createDefaultScenario({
      name: "Monte Carlo SGES Tower",
      technology_type: "tower",
    })
  );

  const [parameterRanges, setParameterRanges] = useState<
    Record<string, [number, number]>
  >({
    "technology.height_m": [50, 200],
    "technology.mass_kg": [5000, 20000],
    "economics.cost_per_kw": [500, 1200],
    "economics.discount_rate": [0.04, 0.12],
  });

  function updateBaseScenario<K extends keyof SimulationRequest>(
    field: K,
    value: SimulationRequest[K]
  ) {
    setBaseScenario((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleRunMonteCarlo() {
    const inputError = validateMonteCarloInput({
      iterations,
      parameterRanges,
    });

    if (inputError) {
      setValidationError(inputError);
      return;
    }

    setValidationError(null);

    const response = await executeMonteCarlo({
      base_scenario: baseScenario,
      parameter_ranges: parameterRanges,
      iterations,
      seed: seed === "" ? null : seed,
    });

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

    const bestEfficiencyResult = response.results.reduce((best, current) =>
      current.round_trip_efficiency > best.round_trip_efficiency
        ? current
        : best
    );

    saveDashboardResult({
      id: crypto.randomUUID(),
      type: "monte_carlo",
      title: `Monte Carlo: ${response.iterations} iterações`,
      createdAt: new Date().toISOString(),
      lcos_per_mwh: bestLcosResult.lcos,
      delivered_energy_kwh: bestEnergyResult.annual_energy_mwh * 1000,
      rte: bestEfficiencyResult.round_trip_efficiency,
      capex: bestCapexResult.capex,
    });
  }

  return (
    <PageContainer
      title="Monte Carlo"
      subtitle="Análise probabilística de incertezas técnicas e econômicas."
    >
      <SectionCard title="Configuração da Análise">
        <div className="form-grid">
          <label>
            Iterações
            <input
              type="number"
              min={1}
              value={iterations}
              onChange={(event) => setIterations(Number(event.target.value))}
            />
          </label>

          <label>
            Seed
            <input
              type="number"
              value={seed}
              onChange={(event) =>
                setSeed(
                  event.target.value === "" ? "" : Number(event.target.value)
                )
              }
            />
          </label>

          <label>
            Métrica do histograma
            <select
              value={metric}
              onChange={(event) =>
                setMetric(event.target.value as MonteCarloMetric)
              }
            >
              <option value="lcos">LCOS</option>
              <option value="capex">CAPEX</option>
              <option value="annual_energy_mwh">Energia anual</option>
              <option value="round_trip_efficiency">
                Eficiência round-trip
              </option>
            </select>
          </label>
        </div>
      </SectionCard>

      <SectionCard
        title="Cenário base"
        description="Cenário usado como referência antes da amostragem dos parâmetros."
      >
        <div className="form-grid">
          <label>
            Nome do cenário
            <input
              value={baseScenario.name}
              onChange={(event) =>
                updateBaseScenario("name", event.target.value)
              }
            />
          </label>

          <label>
            Tecnologia
            <select
              value={baseScenario.technology_type}
              onChange={(event) =>
                updateBaseScenario(
                  "technology_type",
                  event.target.value as SimulationRequest["technology_type"]
                )
              }
            >
              <option value="tower">Tower</option>
              <option value="shaft">Shaft</option>
            </select>
          </label>

          <label>
            Massa (kg)
            <input
              type="number"
              step="any"
              value={baseScenario.mass_kg}
              onChange={(event) =>
                updateBaseScenario("mass_kg", Number(event.target.value))
              }
            />
          </label>

          <label>
            Altura (m)
            <input
              type="number"
              step="any"
              value={baseScenario.height_m}
              onChange={(event) =>
                updateBaseScenario("height_m", Number(event.target.value))
              }
            />
          </label>

          <label>
            Potência nominal (kW)
            <input
              type="number"
              step="any"
              value={baseScenario.nominal_power_kw}
              onChange={(event) =>
                updateBaseScenario(
                  "nominal_power_kw",
                  Number(event.target.value)
                )
              }
            />
          </label>

          <label>
            Custo por kW
            <input
              type="number"
              step="any"
              value={baseScenario.cost_per_kw}
              onChange={(event) =>
                updateBaseScenario("cost_per_kw", Number(event.target.value))
              }
            />
          </label>

          <label>
            Custo por kWh
            <input
              type="number"
              step="any"
              value={baseScenario.cost_per_kwh}
              onChange={(event) =>
                updateBaseScenario("cost_per_kwh", Number(event.target.value))
              }
            />
          </label>

          <label>
            Taxa de desconto
            <input
              type="number"
              step="any"
              value={baseScenario.discount_rate}
              onChange={(event) =>
                updateBaseScenario("discount_rate", Number(event.target.value))
              }
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard
        title="Parâmetros probabilísticos"
        description="Intervalos usados para amostragem no Monte Carlo."
      >
        <MonteCarloParametersForm
          parameterRanges={parameterRanges}
          onChange={setParameterRanges}
        />

        <div className="form-actions">
          <button
            className="primary-button"
            onClick={handleRunMonteCarlo}
            disabled={loading}
          >
            {loading ? "Executando..." : "Executar Monte Carlo"}
          </button>
        </div>

        {validationError && <p className="error-message">{validationError}</p>}
        {error && <p className="error-message">{error}</p>}
      </SectionCard>

      {data && (
        <>
          <SectionCard title="Exportação">
            <div className="form-actions">
              <button
                className="secondary-button"
                onClick={() => exportMonteCarloAsCsv(data.results)}
              >
                Exportar CSV
              </button>

              <button
                className="secondary-button"
                onClick={() => exportMonteCarloAsJson(data.results)}
              >
                Exportar JSON
              </button>
            </div>
          </SectionCard>

          <MonteCarloSummary results={data.results} metric={metric} />
          <MonteCarloChart results={data.results} metric={metric} />
          <MonteCarloTable results={data.results} />
        </>
      )}
    </PageContainer>
  );
}