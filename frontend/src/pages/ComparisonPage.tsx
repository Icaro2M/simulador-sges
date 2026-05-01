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
import {
  createDefaultComparisonScenarios,
  createDefaultScenario,
} from "../utils/defaultScenarios";
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
      <div className="space-y-8">
        <form onSubmit={handleSubmit(handleComparison)} className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[minmax(240px,360px)_1fr] md:items-end">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Métrica do gráfico
                <select
                  className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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

              <p className="text-sm text-slate-500">
                Escolha o indicador que será usado no gráfico comparativo após a
                execução.
              </p>
            </div>
          </section>

          {errors.scenarios?.root?.message && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errors.scenarios.root.message}
            </div>
          )}

          <div className="grid gap-8">
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

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleAddScenario}
              disabled={isLoading}
            >
              Adicionar cenário
            </button>

            <button
              className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-400"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Comparando..." : "Executar comparação"}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            <ComparisonChart data={results} metric={metric} />
            <ComparisonTable data={results} />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
