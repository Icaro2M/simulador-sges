import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  ComparisonChart,
  type ComparisonMetric,
} from "../components/charts/ComparisonChart";
import {
  ComparisonScenarioForm,
  type ComparisonFormValues,
} from "../components/forms/ComparisonScenarioForm";
import { ComparisonTable } from "../components/results/ComparisonTable";
import { PageContainer } from "../components/ui/PageContainer";
import { useComparison } from "../hooks/useComparison";
import type { SimulationRequest } from "../types/simulation";
import { createDefaultComparisonScenarios, createDefaultScenario } from "../utils/defaultScenarios";
import { saveDashboardResult } from "../utils/localResults";
import { simulationSchema } from "../utils/validators";

const comparisonSchema = z.object({
  scenarios: z
    .array(simulationSchema)
    .min(2, "Informe pelo menos dois cenários para comparação."),
});

export function ComparisonPage() {
  const { results, runComparison, isLoading, errorMessage } = useComparison();

  const [metric, setMetric] = useState<ComparisonMetric>("lcos_per_mwh");

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ComparisonFormValues>({
    defaultValues: {
      scenarios: createDefaultComparisonScenarios(),
    },
    resolver: zodResolver(comparisonSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "scenarios",
  });

  async function handleComparison(data: ComparisonFormValues) {
    const scenarios: SimulationRequest[] = data.scenarios;

    const comparisonResults = await runComparison(scenarios);

    if (!comparisonResults || comparisonResults.length === 0) {
      return;
    }

    const bestLcosResult = comparisonResults.reduce((best, current) =>
      current.lcos_per_mwh < best.lcos_per_mwh ? current : best
    );

    const bestEnergyResult = comparisonResults.reduce((best, current) =>
      current.delivered_energy_kwh > best.delivered_energy_kwh ? current : best
    );

    const bestEfficiencyResult = comparisonResults.reduce((best, current) =>
      current.round_trip_efficiency > best.round_trip_efficiency
        ? current
        : best
    );

    saveDashboardResult({
      id: crypto.randomUUID(),
      type: "comparison",
      title: `Comparação: ${comparisonResults.length} cenários`,
      createdAt: new Date().toISOString(),
      lcos_per_mwh: bestLcosResult.lcos_per_mwh,
      delivered_energy_kwh: bestEnergyResult.delivered_energy_kwh,
      rte: bestEfficiencyResult.round_trip_efficiency,
      capex: bestLcosResult.initial_capex,
    });
  }

  function handleAddScenario() {
    append(
      createDefaultScenario({
        name: `Cenário ${fields.length + 1}`,
        technology_type: fields.length % 2 === 0 ? "tower" : "shaft",
      })
    );
  }

  return (
    <PageContainer
      title="Comparação de cenários"
      subtitle="Compare múltiplos cenários SGES lado a lado."
    >
      <form onSubmit={handleSubmit(handleComparison)} className="simulation-form">
        <div className="form-grid">
          <label>
            Métrica do gráfico
            <select
              value={metric}
              onChange={(event) =>
                setMetric(event.target.value as ComparisonMetric)
              }
            >
              <option value="lcos_per_mwh">LCOS</option>
              <option value="delivered_energy_kwh">Energia entregue</option>
              <option value="round_trip_efficiency">
                Eficiência round-trip
              </option>
              <option value="initial_capex">CAPEX inicial</option>
            </select>
          </label>
        </div>

        {errors.scenarios?.root?.message && (
          <div className="error-alert">{errors.scenarios.root.message}</div>
        )}

        <div className="comparison-scenarios-list">
          {fields.map((field, index) => (
            <ComparisonScenarioForm
              key={field.id}
              index={index}
              register={register}
              errors={errors.scenarios?.[index]}
              canRemove={fields.length > 2}
              onRemove={() => remove(index)}
            />
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleAddScenario}
            disabled={isLoading}
          >
            Adicionar cenário
          </button>

          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? "Comparando..." : "Executar comparação"}
          </button>
        </div>
      </form>

      {errorMessage && <div className="error-alert">{errorMessage}</div>}

      {results.length > 0 && (
        <>
          <ComparisonChart data={results} metric={metric} />
          <ComparisonTable data={results} />
        </>
      )}
    </PageContainer>
  );
}