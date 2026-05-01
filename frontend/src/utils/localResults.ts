import type { DashboardStoredResult } from "../types/dashboard";

const STORAGE_KEY = "sges_dashboard_results";

export function getStoredDashboardResults(): DashboardStoredResult[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

export function saveDashboardResult(result: DashboardStoredResult): void {
  const currentResults = getStoredDashboardResults();

  const updatedResults = [result, ...currentResults];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
}

export function clearDashboardResults(): void {
  localStorage.removeItem(STORAGE_KEY);
}