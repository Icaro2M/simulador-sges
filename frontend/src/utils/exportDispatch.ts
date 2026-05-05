import type { DispatchResultItem } from "../types/dispatch";
import { normalizeDispatchResults } from "./dispatchResult";

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function exportDispatchToJson(data: DispatchResultItem[]) {
  const normalizedData = normalizeDispatchResults(data);

  downloadFile(
    "dispatch_results.json",
    JSON.stringify(normalizedData, null, 2),
    "application/json"
  );
}

export function exportDispatchToCsv(data: DispatchResultItem[]) {
  const normalizedData = normalizeDispatchResults(data);

  const headers = [
    "hour",
    "price",
    "action",
    "soc_initial_kwh",
    "soc_final_kwh",
    "charged_energy_kwh",
    "stored_energy_kwh",
    "discharged_energy_kwh",
    "standby_loss_kwh",
    "revenue",
    "cost",
    "net_cashflow",
  ];

  const rows = normalizedData.map((item) =>
    headers
      .map((header) => {
        const value = item[header as keyof typeof item];

        if (typeof value === "string") {
          return `"${value.replaceAll('"', '""')}"`;
        }

        return String(value ?? "");
      })
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  downloadFile("dispatch_results.csv", csv, "text/csv;charset=utf-8");
}
