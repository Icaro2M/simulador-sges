import { useMemo, useState } from "react";
import {
  clearDashboardResults,
  getStoredDashboardResults,
} from "../utils/localResults";

const resultTypeLabels = {
  simulation: "Simulação",
  comparison: "Comparação",
  sensitivity: "Sensibilidade",
  monte_carlo: "Monte Carlo",
  dispatch: "Dispatch",
};

export function useDashboardData() {
  const [results, setResults] = useState(() => getStoredDashboardResults());

  const chronologicalResults = useMemo(() => {
    return [...results].reverse();
  }, [results]);

  const chartData = useMemo(() => {
    return chronologicalResults.map((item, index) => ({
      execution: index + 1,
      title: item.title,
      type: item.type,
      typeLabel: resultTypeLabels[item.type],
      lcos: item.lcos_per_mwh ?? null,
      energy: item.delivered_energy_kwh ?? null,
      efficiency:
        typeof item.rte === "number"
          ? item.rte * 100
          : null,
      capex: item.capex ?? null,
      createdAt: item.createdAt,
    }));
  }, [chronologicalResults]);

  const moduleDistribution = useMemo(() => {
    const counts = results.reduce<Record<string, number>>((acc, item) => {
      const label = resultTypeLabels[item.type];
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([module, count]) => ({
      module,
      count,
    }));
  }, [results]);

  const summary = useMemo(() => {
    const resultsWithLcos = results.filter(
      (item) => typeof item.lcos_per_mwh === "number"
    );

    const resultsWithEnergy = results.filter(
      (item) => typeof item.delivered_energy_kwh === "number"
    );

    const resultsWithRte = results.filter(
      (item) => typeof item.rte === "number"
    );

    const bestLcos =
      resultsWithLcos.length > 0
        ? Math.min(...resultsWithLcos.map((item) => item.lcos_per_mwh!))
        : null;

    const bestEnergy =
      resultsWithEnergy.length > 0
        ? Math.max(
            ...resultsWithEnergy.map((item) => item.delivered_energy_kwh!)
          )
        : null;

    const bestRte =
      resultsWithRte.length > 0
        ? Math.max(...resultsWithRte.map((item) => item.rte!))
        : null;

    const bestLcosResult =
      resultsWithLcos.length > 0
        ? resultsWithLcos.reduce((best, current) =>
            current.lcos_per_mwh! < best.lcos_per_mwh! ? current : best
          )
        : null;

    return {
      totalRuns: results.length,
      bestLcos,
      bestEnergy,
      bestRte,
      bestLcosResult,
    };
  }, [results]);

  function clearHistory() {
    clearDashboardResults();
    setResults([]);
  }

  return {
    results,
    latestResults: results.slice(0, 5),
    chartData,
    moduleDistribution,
    summary,
    clearHistory,
  };
}