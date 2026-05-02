from dataclasses import dataclass

import pandas as pd

from sges.core.exceptions import InvalidParameterError
from sges.physics.loss_model import LossModel
from sges.simulation.results import SimulationResult


@dataclass(frozen=True)
class DispatchConfig:
    low_price_threshold: float
    high_price_threshold: float
    initial_soc_kwh: float = 0.0
    time_step_hours: float = 1.0
    loss_model: LossModel = LossModel()


def run_price_arbitrage_dispatch(
    simulation_result: SimulationResult,
    price_profile: pd.DataFrame,
    config: DispatchConfig,
) -> pd.DataFrame:
    if config.time_step_hours <= 0:
        raise InvalidParameterError("time_step_hours must be greater than zero")

    capacity_kwh = simulation_result.technology_result.max_potential_energy_kwh
    charge_power_kw = simulation_result.technology_result.charge_power_kw
    discharge_power_kw = simulation_result.technology_result.discharge_power_kw
    charge_efficiency = simulation_result.technology_result.charge_efficiency
    discharge_efficiency = simulation_result.technology_result.discharge_efficiency

    soc_kwh = min(max(config.initial_soc_kwh, 0.0), capacity_kwh)

    rows = []

    for _, row in price_profile.iterrows():
        hour = int(row["hour"])
        price = float(row["price"])

        action = "standby"
        soc_initial_kwh = soc_kwh
        energy_charged_from_grid_kwh = 0.0
        energy_stored_kwh = 0.0
        energy_discharged_to_grid_kwh = 0.0
        standby_loss_kwh = 0.0
        revenue = 0.0
        cost = 0.0

        if price <= config.low_price_threshold and soc_kwh < capacity_kwh:
            action = "charge"
            max_grid_charge_kwh = charge_power_kw * config.time_step_hours
            capacity_room_kwh = capacity_kwh - soc_kwh
            energy_charged_from_grid_kwh = min(
                max_grid_charge_kwh,
                capacity_room_kwh / charge_efficiency,
            )
            energy_stored_kwh = energy_charged_from_grid_kwh * charge_efficiency
            soc_kwh = min(soc_kwh + energy_stored_kwh, capacity_kwh)
            cost = (energy_charged_from_grid_kwh / 1000) * price

        elif price >= config.high_price_threshold and soc_kwh > 0:
            action = "discharge"
            energy_discharged_to_grid_kwh = min(
                discharge_power_kw * config.time_step_hours,
                soc_kwh * discharge_efficiency,
            )
            soc_kwh = max(
                soc_kwh - (energy_discharged_to_grid_kwh / discharge_efficiency),
                0.0,
            )
            revenue = (energy_discharged_to_grid_kwh / 1000) * price

        else:
            standby_loss_kwh = min(
                config.loss_model.calculate_standby_loss(
                    hours=config.time_step_hours
                ),
                soc_kwh,
            )
            soc_kwh = max(soc_kwh - standby_loss_kwh, 0.0)

        rows.append(
            {
                "hour": hour,
                "price": price,
                "action": action,
                "time_step_hours": config.time_step_hours,
                "soc_initial_kwh": soc_initial_kwh,
                "soc_final_kwh": soc_kwh,
                "soc_kwh": soc_kwh,
                "energy_charged_from_grid_kwh": energy_charged_from_grid_kwh,
                "energy_stored_kwh": energy_stored_kwh,
                "energy_discharged_to_grid_kwh": energy_discharged_to_grid_kwh,
                "charged_kwh": energy_charged_from_grid_kwh,
                "discharged_kwh": energy_discharged_to_grid_kwh,
                "standby_loss_kwh": standby_loss_kwh,
                "charge_cost": cost,
                "cost": cost,
                "revenue": revenue,
                "net_profit": revenue - cost,
                "net_revenue": revenue - cost,
            }
        )

    dispatch_result = pd.DataFrame(rows)
    dispatch_result.attrs["summary"] = _build_dispatch_summary(dispatch_result, soc_kwh)

    return dispatch_result


def _build_dispatch_summary(dispatch_result: pd.DataFrame, final_soc_kwh: float) -> dict:
    return {
        "total_energy_charged_from_grid_kwh": float(
            dispatch_result["energy_charged_from_grid_kwh"].sum()
        ),
        "total_energy_stored_kwh": float(dispatch_result["energy_stored_kwh"].sum()),
        "total_energy_discharged_to_grid_kwh": float(
            dispatch_result["energy_discharged_to_grid_kwh"].sum()
        ),
        "total_standby_loss_kwh": float(dispatch_result["standby_loss_kwh"].sum()),
        "total_charge_cost": float(dispatch_result["charge_cost"].sum()),
        "total_revenue": float(dispatch_result["revenue"].sum()),
        "net_profit": float(dispatch_result["net_profit"].sum()),
        "final_soc_kwh": float(final_soc_kwh),
        "charge_hours": int((dispatch_result["action"] == "charge").sum()),
        "discharge_hours": int((dispatch_result["action"] == "discharge").sum()),
        "standby_hours": int((dispatch_result["action"] == "standby").sum()),
    }
