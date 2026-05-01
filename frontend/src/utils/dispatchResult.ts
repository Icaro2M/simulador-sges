import type { DispatchResultItem } from "../types/dispatch";

export interface NormalizedDispatchResult {
  hour: number;
  price: number;
  action: string;
  charged_energy_kwh: number;
  discharged_energy_kwh: number;
  soc_kwh: number;
  revenue: number;
  cost: number;
  net_cashflow: number;
}

function getValue(item: DispatchResultItem, keys: string[]) {
  for (const key of keys) {
    if (key in item) {
      return item[key];
    }
  }

  return undefined;
}

function getNumberValue(item: DispatchResultItem, keys: string[]) {
  const value = getValue(item, keys);

  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  return 0;
}

function getStringValue(item: DispatchResultItem, keys: string[]) {
  const value = getValue(item, keys);

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return value.toString();
  }

  return "-";
}

export function normalizeDispatchResult(
  item: DispatchResultItem,
  fallbackIndex = 0
): NormalizedDispatchResult {
  return {
    hour:
      getNumberValue(item, ["hour", "time_step"]) ||
      fallbackIndex,

    price: getNumberValue(item, [
      "price",
      "price_per_mwh",
    ]),

    action: getStringValue(item, [
      "action",
      "operation",
    ]),

    charged_energy_kwh: getNumberValue(item, [
      "charged_energy_kwh",
      "energy_charged_kwh",
      "charge_energy_kwh",
      "charge_kwh",
    ]),

    discharged_energy_kwh: getNumberValue(item, [
      "discharged_energy_kwh",
      "energy_discharged_kwh",
      "discharge_energy_kwh",
      "discharge_kwh",
    ]),

    soc_kwh: getNumberValue(item, [
      "soc_kwh",
      "stored_energy_kwh",
      "state_of_charge_kwh",
    ]),

    revenue: getNumberValue(item, [
      "revenue",
      "revenue_value",
    ]),

    cost: getNumberValue(item, [
      "cost",
      "cost_value",
    ]),

    net_cashflow: getNumberValue(item, [
      "net_cashflow",
      "cashflow",
      "net_profit",
      "profit",
    ]),
  };
}

export function normalizeDispatchResults(data: DispatchResultItem[]) {
  return data.map((item, index) =>
    normalizeDispatchResult(item, index)
  );
}