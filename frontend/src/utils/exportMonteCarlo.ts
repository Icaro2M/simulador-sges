import type { MonteCarloResultItem } from "../types/analysis";

function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

export function exportMonteCarloAsJson(results: MonteCarloResultItem[]) {
  downloadFile(
    JSON.stringify(results, null, 2),
    "monte_carlo_results.json",
    "application/json"
  );
}

export function exportMonteCarloAsCsv(results: MonteCarloResultItem[]) {
  if (results.length === 0) return;

  const headers = [
    "iteration",
    "lcos",
    "capex",
    "annual_energy_mwh",
    "round_trip_efficiency",
    "sampled_values",
  ];

  const rows = results.map((row) => [
    row.iteration,
    row.lcos,
    row.capex,
    row.annual_energy_mwh,
    row.round_trip_efficiency,
    JSON.stringify(row.sampled_values),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    ),
  ].join("\n");

  downloadFile(csv, "monte_carlo_results.csv", "text/csv");
}