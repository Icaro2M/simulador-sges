import type { DispatchResultItem } from "../types/dispatch";

export interface NormalizedDispatchResult {
  hour: number;
  price: number;
  action: string;
  time_step_hours: number;
  soc_initial_kwh: number;
  soc_final_kwh: number;
  charged_energy_kwh: number;
  stored_energy_kwh: number;
  discharged_energy_kwh: number;
  standby_loss_kwh: number;
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

    time_step_hours: getNumberValue(item, [
      "time_step_hours",
      "delta_t_hours",
    ]),

    soc_initial_kwh: getNumberValue(item, [
      "soc_initial_kwh",
      "initial_soc_kwh",
      "soc_start_kwh",
    ]),

    soc_final_kwh: getNumberValue(item, [
      "soc_final_kwh",
      "final_soc_kwh",
      "soc_end_kwh",
      "soc_kwh",
    ]),

    charged_energy_kwh: getNumberValue(item, [
      "energy_charged_from_grid_kwh",
      "charged_energy_kwh",
      "energy_charged_kwh",
      "charge_energy_kwh",
      "charge_kwh",
      "charged_kwh",
    ]),

    stored_energy_kwh: getNumberValue(item, [
      "energy_stored_kwh",
      "stored_after_charge_efficiency_kwh",
      "energy_stored_after_efficiency_kwh",
    ]),

    discharged_energy_kwh: getNumberValue(item, [
      "energy_discharged_to_grid_kwh",
      "discharged_energy_kwh",
      "energy_discharged_kwh",
      "discharge_energy_kwh",
      "discharge_kwh",
      "discharged_kwh",
    ]),

    standby_loss_kwh: getNumberValue(item, [
      "standby_loss_kwh",
      "loss_standby_kwh",
    ]),

    soc_kwh: getNumberValue(item, [
      "soc_final_kwh",
      "soc_kwh",
      "stored_energy_kwh",
      "state_of_charge_kwh",
    ]),

    revenue: getNumberValue(item, [
      "revenue",
      "revenue_value",
    ]),

    cost: getNumberValue(item, [
      "charge_cost",
      "cost",
      "cost_value",
    ]),

    net_cashflow: getNumberValue(item, [
      "net_profit",
      "net_revenue",
      "net_cashflow",
      "cashflow",
      "profit",
    ]),
  };
}

export function normalizeDispatchResults(data: DispatchResultItem[]) {
  return data.map((item, index) =>
    normalizeDispatchResult(item, index)
  );
}
