import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { MonteCarloChart } from "../components/charts/MonteCarloChart";
import { MonteCarloParametersForm } from "../components/forms/MonteCarloParametersForm";
import { MonteCarloSummary } from "../components/results/MonteCarloSummary";
import { MonteCarloTable } from "../components/results/MonteCarloTable";
import { PageContainer } from "../components/ui/PageContainer";
import { useMonteCarlo } from "../hooks/useMonteCarlo";
import { createDefaultScenario } from "../utils/defaultScenarios";
import {
  exportMonteCarloAsCsv,
  exportMonteCarloAsJson,
} from "../utils/exportMonteCarlo";
import { saveDashboardResult } from "../utils/localResults";
import { validateMonteCarloInput } from "../utils/monteCarloValidation";

import type { SimulationRequest } from "../types/simulation";

type MonteCarloMetric =
  | "lcos"
  | "capex"
  | "annual_energy_mwh"
  | "round_trip_efficiency";

const controlClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60";

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>

      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      {children}
    </label>
  );
}

export function MonteCarloPage() {
  const resultsRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (data) {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [data]);

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

    const resultsWithLcos = response.results.filter(
      (item) => typeof item.lcos === "number"
    );
    const bestLcosResult =
      resultsWithLcos.length > 0
        ? resultsWithLcos.reduce((best, current) =>
            current.lcos! < best.lcos! ? current : best
          )
        : null;

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
      lcos_per_mwh: bestLcosResult?.lcos ?? undefined,
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
      <div className="space-y-8">
        <Panel title="Configuração da análise">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Iterações">
              <input
                className={controlClass}
                type="number"
                min={1}
                value={iterations}
                onChange={(event) => setIterations(Number(event.target.value))}
              />
            </Field>

            <Field label="Seed">
              <input
                className={controlClass}
                type="number"
                value={seed}
                onChange={(event) =>
                  setSeed(
                    event.target.value === "" ? "" : Number(event.target.value)
                  )
                }
              />
            </Field>
          </div>
        </Panel>

        <Panel
          title="Cenário base"
          description="Cenário usado como referência antes da amostragem dos parâmetros."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Nome do cenário">
              <input
                className={controlClass}
                value={baseScenario.name}
                onChange={(event) =>
                  updateBaseScenario("name", event.target.value)
                }
              />
            </Field>

            <Field label="Tecnologia">
              <select
                className={controlClass}
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
            </Field>

            <Field label="Massa (kg)">
              <input
                className={controlClass}
                type="number"
                step="any"
                value={baseScenario.mass_kg}
                onChange={(event) =>
                  updateBaseScenario("mass_kg", Number(event.target.value))
                }
              />
            </Field>

            <Field label="Altura (m)">
              <input
                className={controlClass}
                type="number"
                step="any"
                value={baseScenario.height_m}
                onChange={(event) =>
                  updateBaseScenario("height_m", Number(event.target.value))
                }
              />
            </Field>

            <Field label="Potência nominal (kW)">
              <input
                className={controlClass}
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
            </Field>

            <Field label="Custo por kW">
              <input
                className={controlClass}
                type="number"
                step="any"
                value={baseScenario.cost_per_kw}
                onChange={(event) =>
                  updateBaseScenario("cost_per_kw", Number(event.target.value))
                }
              />
            </Field>

            <Field label="Custo por kWh">
              <input
                className={controlClass}
                type="number"
                step="any"
                value={baseScenario.cost_per_kwh}
                onChange={(event) =>
                  updateBaseScenario("cost_per_kwh", Number(event.target.value))
                }
              />
            </Field>

            <Field label="Taxa de desconto">
              <input
                className={controlClass}
                type="number"
                step="any"
                value={baseScenario.discount_rate}
                onChange={(event) =>
                  updateBaseScenario("discount_rate", Number(event.target.value))
                }
              />
            </Field>
          </div>
        </Panel>

        <Panel
          title="Parâmetros probabilísticos"
          description="Intervalos usados para amostragem no Monte Carlo."
        >
          <div className="space-y-6">
            <MonteCarloParametersForm
              parameterRanges={parameterRanges}
              onChange={setParameterRanges}
            />

            <div className="flex justify-end border-t border-slate-200 pt-6">
              <button
                className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-400"
                onClick={handleRunMonteCarlo}
                disabled={loading}
              >
                {loading ? "Executando..." : "Executar Monte Carlo"}
              </button>
            </div>

            {validationError && (
              <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {validationError}
              </p>
            )}

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
          </div>
        </Panel>

        {data && (
          <div className="space-y-6 scroll-mt-6" ref={resultsRef}>
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Exportação
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Baixe os resultados da simulação em CSV ou JSON.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className={secondaryButtonClass}
                    onClick={() => exportMonteCarloAsCsv(data.results)}
                  >
                    Exportar CSV
                  </button>

                  <button
                    className={secondaryButtonClass}
                    onClick={() => exportMonteCarloAsJson(data.results)}
                  >
                    Exportar JSON
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-[minmax(240px,360px)_1fr] md:items-end">
                <Field label="Métrica do histograma">
                  <select
                    className={controlClass}
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
                </Field>

                <p className="text-sm text-slate-500">
                  Escolha a métrica exibida no resumo, histograma e tabela.
                </p>
              </div>
            </section>

            <MonteCarloSummary results={data.results} metric={metric} />
            <MonteCarloChart results={data.results} metric={metric} />
            <MonteCarloTable results={data.results} />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
