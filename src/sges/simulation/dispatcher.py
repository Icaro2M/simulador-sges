from dataclasses import dataclass

import pandas as pd

from sges.physics.loss_model import LossModel
from sges.simulation.results import SimulationResult


@dataclass(frozen=True)
class DispatchConfig:
    low_price_threshold: float
    high_price_threshold: float
    initial_soc_kwh: float = 0.0
    loss_model: LossModel = LossModel()


def run_price_arbitrage_dispatch(
    simulation_result: SimulationResult,
    price_profile: pd.DataFrame,
    config: DispatchConfig,
) -> pd.DataFrame:
    capacity_kwh = simulation_result.technology_result.stored_energy_kwh
    delivered_capacity_kwh = simulation_result.technology_result.delivered_energy_kwh
    power_kw = simulation_result.technology_result.nominal_power_kw
    charge_efficiency = simulation_result.technology_result.charge_efficiency
    discharge_efficiency = simulation_result.technology_result.discharge_efficiency

    soc_kwh = min(max(config.initial_soc_kwh, 0.0), capacity_kwh)

    rows = []

    for _, row in price_profile.iterrows():
        hour = int(row["hour"])
        price = float(row["price"])

        action = "idle"
        charged_kwh = 0.0
        discharged_kwh = 0.0
        standby_loss_kwh = 0.0
        revenue = 0.0
        cost = 0.0

        if soc_kwh > 0:
            standby_loss_kwh = min(
                config.loss_model.calculate_standby_loss(hours=1),
                soc_kwh,
            )
            soc_kwh -= standby_loss_kwh

        if price <= config.low_price_threshold and soc_kwh < capacity_kwh:
            action = "charge"
            charged_kwh = min(power_kw, (capacity_kwh - soc_kwh) / charge_efficiency)
            soc_kwh += charged_kwh * charge_efficiency
            cost = (charged_kwh / 1000) * price

        elif price >= config.high_price_threshold and soc_kwh > 0:
            action = "discharge"
            raw_delivered_kwh = min(
                power_kw,
                soc_kwh * discharge_efficiency,
            )
            discharged_kwh = min(
                config.loss_model.apply_cycle_losses(raw_delivered_kwh),
                delivered_capacity_kwh,
            )
            soc_kwh -= raw_delivered_kwh / discharge_efficiency
            revenue = (discharged_kwh / 1000) * price

        rows.append(
            {
                "hour": hour,
                "price": price,
                "action": action,
                "charged_kwh": charged_kwh,
                "discharged_kwh": discharged_kwh,
                "standby_loss_kwh": standby_loss_kwh,
                "soc_kwh": soc_kwh,
                "cost": cost,
                "revenue": revenue,
                "net_revenue": revenue - cost,
            }
        )

    return pd.DataFrame(rows)
