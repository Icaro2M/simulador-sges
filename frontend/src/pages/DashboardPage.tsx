import { useState } from "react";
import { Link } from "react-router-dom";

import { DashboardEvolutionChart } from "../components/charts/DashboardEvolutionChart";
import { DashboardModuleChart } from "../components/charts/DashboardModuleChart";
import { PageContainer } from "../components/ui/PageContainer";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  formatCurrency,
  formatEnergy,
  formatPercentage,
} from "../utils/formatters";

type DashboardMetric = "lcos" | "energy" | "efficiency";

function getResultTypeLabel(type: string) {
  switch (type) {
    case "simulation":
      return "Simulação";
    case "comparison":
      return "Comparação";
    case "sensitivity":
      return "Sensibilidade";
    case "monte_carlo":
      return "Monte Carlo";
    case "dispatch":
      return "Dispatch";
    default:
      return type;
  }
}

function getEffectiveEnergy(result: {
  delivered_energy_kwh?: number;
  effective_delivered_energy_kwh?: number;
}) {
  return result.effective_delivered_energy_kwh ?? result.delivered_energy_kwh ?? 0;
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
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

function DashboardMetricCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <span className="text-sm font-medium text-slate-500">{title}</span>
      <strong className="mt-2 block text-2xl font-semibold text-slate-950">
        {value}
      </strong>
    </article>
  );
}

const resultBadgeClasses: Record<string, string> = {
  simulation: "bg-blue-50 text-blue-700 ring-blue-200",
  comparison: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  sensitivity: "bg-amber-50 text-amber-700 ring-amber-200",
  monte_carlo: "bg-violet-50 text-violet-700 ring-violet-200",
  dispatch: "bg-red-50 text-red-700 ring-red-200",
};

export function DashboardPage() {
  const {
    summary,
    latestResults,
    chartData,
    moduleDistribution,
    clearHistory,
  } = useDashboardData();

  const [selectedMetric, setSelectedMetric] =
    useState<DashboardMetric>("lcos");

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Visão geral dos resultados e módulos do SGES Simulator"
    >
      <div className="space-y-8">

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardMetricCard
            title="Execuções locais"
            value={summary.totalRuns.toString()}
          />

          <DashboardMetricCard
            title="Melhor LCOS"
            value={
              summary.bestLcos !== null
                ? formatCurrency(summary.bestLcos)
                : "Sem dados"
            }
          />

          <DashboardMetricCard
            title="Maior energia efetiva"
            value={
              summary.bestEnergy !== null
                ? formatEnergy(summary.bestEnergy)
                : "Sem dados"
            }
          />

          <DashboardMetricCard
            title="Melhor eficiência"
            value={
              summary.bestRte !== null
                ? formatPercentage(summary.bestRte)
                : "Sem dados"
            }
          />
        </section>

        <Panel
          title="Evolução dos resultados"
          description="Acompanhe como os principais indicadores variam entre as execuções salvas localmente."
        >
          {chartData.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Execute algumas simulações para visualizar a evolução dos resultados.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">
                  Selecione a métrica para visualizar a tendência histórica.
                </p>

                <select
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 md:w-56"
                  value={selectedMetric}
                  onChange={(event) =>
                    setSelectedMetric(event.target.value as DashboardMetric)
                  }
                >
                  <option value="lcos">LCOS</option>
                  <option value="energy">Energia efetiva</option>
                  <option value="efficiency">Eficiência</option>
                </select>
              </div>

              <DashboardEvolutionChart data={chartData} metric={selectedMetric} />
            </div>
          )}
        </Panel>

        <Panel
          title="Distribuição por módulo"
          description="Veja quais módulos do sistema foram mais utilizados nas execuções salvas localmente."
        >
          {moduleDistribution.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Ainda não há execuções suficientes para exibir a distribuição por
              módulo.
            </p>
          ) : (
            <DashboardModuleChart data={moduleDistribution} />
          )}
        </Panel>

        <Panel title="Melhor resultado encontrado">
          {!summary.bestLcosResult ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Ainda não há resultados suficientes para destacar um melhor cenário.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_repeat(3,1fr)]">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Cenário
                </span>
                <strong className="mt-2 block text-base text-slate-950">
                  {summary.bestLcosResult.title}
                </strong>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  LCOS
                </span>
                <strong className="mt-2 block text-base text-slate-950">
                  {formatCurrency(summary.bestLcosResult.lcos_per_mwh ?? 0)}
                </strong>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Energia efetiva
                </span>
                <strong className="mt-2 block text-base text-slate-950">
                  {formatEnergy(getEffectiveEnergy(summary.bestLcosResult))}
                </strong>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Eficiência
                </span>
                <strong className="mt-2 block text-base text-slate-950">
                  {formatPercentage(summary.bestLcosResult.rte ?? 0)}
                </strong>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Atalhos de análise">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Link
              to="/simulation"
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-950 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Nova simulação
            </Link>

            <Link
              to="/comparison"
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-950 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Comparar cenários
            </Link>

            <Link
              to="/sensitivity"
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-950 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Análise de sensibilidade
            </Link>

            <Link
              to="/monte-carlo"
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-950 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Monte Carlo
            </Link>

            <Link
              to="/dispatch"
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-950 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Dispatch
            </Link>
          </div>
        </Panel>

        <Panel title="Últimos resultados">
          {latestResults.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Nenhum resultado local salvo ainda. Execute uma simulação ou análise
              para preencher o Dashboard.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3">
                {latestResults.map((result) => (
                  <article
                    key={result.id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <strong className="block text-sm font-semibold text-slate-950">
                        {result.title}
                      </strong>

                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                          resultBadgeClasses[result.type] ??
                          "bg-slate-100 text-slate-700 ring-slate-200"
                        }`}
                      >
                        {getResultTypeLabel(result.type)}
                      </span>
                    </div>

                    <time className="text-sm text-slate-500">
                      {new Date(result.createdAt).toLocaleString("pt-BR")}
                    </time>
                  </article>
                ))}
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-4">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                  onClick={clearHistory}
                >
                  Limpar histórico local
                </button>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </PageContainer>
  );
}
