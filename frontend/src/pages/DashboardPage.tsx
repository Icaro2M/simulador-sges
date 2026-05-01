import { useState } from "react";
import { Link } from "react-router-dom";

import { DashboardEvolutionChart } from "../components/charts/DashboardEvolutionChart";
import { DashboardModuleChart } from "../components/charts/DashboardModuleChart";
import { MetricCard } from "../components/results/MetricCard";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionCard } from "../components/ui/SectionCard";
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
      <SectionCard title="Status do sistema">
        <div className="status-grid">
          <div className="status-item">
            <strong>Backend</strong>
            <span>API configurada</span>
          </div>

          <div className="status-item">
            <strong>Módulos disponíveis</strong>
            <span>Simulação, Comparação, Sensibilidade, Monte Carlo</span>
          </div>

          <div className="status-item">
            <strong>Próximo módulo</strong>
            <span>Dispatch energético</span>
          </div>
        </div>
      </SectionCard>

      <section className="metrics-grid">
        <MetricCard
          title="Execuções locais"
          value={summary.totalRuns.toString()}
        />

        <MetricCard
          title="Melhor LCOS"
          value={
            summary.bestLcos !== null
              ? formatCurrency(summary.bestLcos)
              : "Sem dados"
          }
        />

        <MetricCard
          title="Maior energia entregue"
          value={
            summary.bestEnergy !== null
              ? formatEnergy(summary.bestEnergy)
              : "Sem dados"
          }
        />

        <MetricCard
          title="Melhor eficiência"
          value={
            summary.bestRte !== null
              ? formatPercentage(summary.bestRte)
              : "Sem dados"
          }
        />
      </section>

      <SectionCard title="Evolução dos resultados">
        {chartData.length === 0 ? (
          <p className="empty-message">
            Execute algumas simulações para visualizar a evolução dos resultados.
          </p>
        ) : (
          <>
            <div className="dashboard-chart-header">
              <p>
                Acompanhe como os principais indicadores variam entre as
                execuções salvas localmente.
              </p>

              <select
                value={selectedMetric}
                onChange={(event) =>
                  setSelectedMetric(event.target.value as DashboardMetric)
                }
              >
                <option value="lcos">LCOS</option>
                <option value="energy">Energia entregue</option>
                <option value="efficiency">Eficiência</option>
              </select>
            </div>

            <DashboardEvolutionChart
              data={chartData}
              metric={selectedMetric}
            />
          </>
        )}
      </SectionCard>

      <SectionCard title="Distribuição por módulo">
        {moduleDistribution.length === 0 ? (
          <p className="empty-message">
            Ainda não há execuções suficientes para exibir a distribuição por
            módulo.
          </p>
        ) : (
          <>
            <div className="dashboard-chart-header">
              <p>
                Veja quais módulos do sistema foram mais utilizados nas
                execuções salvas localmente.
              </p>
            </div>

            <DashboardModuleChart data={moduleDistribution} />
          </>
        )}
      </SectionCard>

      <SectionCard title="Melhor resultado encontrado">
        {!summary.bestLcosResult ? (
          <p className="empty-message">
            Ainda não há resultados suficientes para destacar um melhor cenário.
          </p>
        ) : (
          <div className="best-result-card">
            <div>
              <span className="best-result-label">Cenário</span>
              <strong>{summary.bestLcosResult.title}</strong>
            </div>

            <div>
              <span className="best-result-label">LCOS</span>
              <strong>
                {formatCurrency(summary.bestLcosResult.lcos_per_mwh ?? 0)}
              </strong>
            </div>

            <div>
              <span className="best-result-label">Energia entregue</span>
              <strong>
                {formatEnergy(
                  summary.bestLcosResult.delivered_energy_kwh ?? 0
                )}
              </strong>
            </div>

            <div>
              <span className="best-result-label">Eficiência</span>
              <strong>
                {formatPercentage(summary.bestLcosResult.rte ?? 0)}
              </strong>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Atalhos de análise">
        <div className="dashboard-actions">
          <Link to="/simulation" className="dashboard-action-card">
            Nova simulação
          </Link>

          <Link to="/comparison" className="dashboard-action-card">
            Comparar cenários
          </Link>

          <Link to="/sensitivity" className="dashboard-action-card">
            Análise de sensibilidade
          </Link>

          <Link to="/monte-carlo" className="dashboard-action-card">
            Monte Carlo
          </Link>

          <Link to="/dispatch" className="dashboard-action-card">
            Dispatch
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Últimos resultados">
        {latestResults.length === 0 ? (
          <p className="empty-message">
            Nenhum resultado local salvo ainda. Execute uma simulação ou análise
            para preencher o Dashboard.
          </p>
        ) : (
          <>
            <div className="latest-results-list">
              {latestResults.map((result) => (
                <article key={result.id} className="latest-result-item">
                  <div>
                    <strong>{result.title}</strong>

                    <span
                      className={`result-type-badge result-type-${result.type}`}
                    >
                      {getResultTypeLabel(result.type)}
                    </span>
                  </div>

                  <time>
                    {new Date(result.createdAt).toLocaleString("pt-BR")}
                  </time>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={clearHistory}
            >
              Limpar histórico local
            </button>
          </>
        )}
      </SectionCard>
    </PageContainer>
  );
}