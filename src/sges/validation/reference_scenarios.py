from dataclasses import replace

import pandas as pd

from sges.core.constants import STANDARD_GRAVITY
from sges.simulation.scenario import (
    EconomicScenario,
    LossScenario,
    Scenario,
    TechnologyScenario,
)


def build_no_loss_reference_scenario() -> Scenario:
    return Scenario(
        name="reference_no_losses_100_percent_efficiency",
        technology=TechnologyScenario(
            type="tower",
            mass_kg=360_000,
            height_m=100,
            nominal_power_kw=100,
            charge_efficiency=1.0,
            discharge_efficiency=1.0,
        ),
        losses=LossScenario(),
        economics=EconomicScenario(
            cost_per_kw=10,
            cost_per_kwh=20,
            fixed_capex=1000,
            fixed_annual_opex=100,
            variable_opex_per_mwh=0,
            project_lifetime_years=2,
            discount_rate=0.0,
            cycles_per_year=10,
        ),
    )


def build_known_efficiency_reference_scenario() -> Scenario:
    scenario = build_no_loss_reference_scenario()

    return replace(
        scenario,
        name="reference_charge_90_discharge_80",
        technology=replace(
            scenario.technology,
            charge_efficiency=0.9,
            discharge_efficiency=0.8,
        ),
    )


def build_standby_reference_scenario() -> Scenario:
    scenario = build_no_loss_reference_scenario()
    cycle_period_h = 8760 / 800
    stored_energy_kwh = (
        scenario.technology.mass_kg
        * STANDARD_GRAVITY
        * scenario.technology.height_m
        / 3_600_000
    )
    active_cycle_time_h = cycle_period_h - 10.0
    nominal_power_kw = 2 * stored_energy_kwh / active_cycle_time_h

    return replace(
        scenario,
        name="reference_standby_1_kwh_per_hour_for_10_hours",
        technology=replace(
            scenario.technology,
            nominal_power_kw=nominal_power_kw,
        ),
        losses=LossScenario(standby_loss_kwh_per_hour=1.0),
        economics=replace(
            scenario.economics,
            cycles_per_year=800,
        ),
    )


def build_simple_economics_reference_scenario() -> Scenario:
    scenario = build_no_loss_reference_scenario()

    return replace(
        scenario,
        name="reference_simple_economics_zero_discount",
        economics=replace(
            scenario.economics,
            cost_per_kw=100,
            cost_per_kwh=10,
            fixed_capex=500,
            fixed_annual_opex=50,
            variable_opex_per_mwh=5,
            charging_energy_cost_per_mwh=10,
            project_lifetime_years=2,
            discount_rate=0.0,
        ),
    )


def build_discounted_economics_reference_scenario() -> Scenario:
    scenario = build_simple_economics_reference_scenario()

    return replace(
        scenario,
        name="reference_positive_discount",
        economics=replace(
            scenario.economics,
            discount_rate=0.10,
            replacement_cost=100,
            replacement_year=1,
            end_of_life_cost=50,
        ),
    )


def build_dispatch_reference_price_profile() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"hour": 0, "price": 10.0},
            {"hour": 1, "price": 10.0},
            {"hour": 2, "price": 50.0},
            {"hour": 3, "price": 100.0},
            {"hour": 4, "price": 100.0},
            {"hour": 5, "price": 50.0},
        ]
    )
