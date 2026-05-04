from dataclasses import dataclass
from math import isclose

import pandas as pd

from sges.core.constants import STANDARD_GRAVITY
from sges.economics.finance import present_value
from sges.simulation.results import SimulationResult
from sges.simulation.scenario import Scenario


@dataclass(frozen=True)
class ValidationCheck:
    name: str
    passed: bool
    expected: float | str | None
    actual: float | str | None
    message: str = ""


@dataclass(frozen=True)
class ValidationReport:
    checks: tuple[ValidationCheck, ...]

    @property
    def ok(self) -> bool:
        return all(check.passed for check in self.checks)

    @property
    def failures(self) -> tuple[ValidationCheck, ...]:
        return tuple(check for check in self.checks if not check.passed)


def validate_simulation_result(
    scenario: Scenario,
    result: SimulationResult,
    *,
    rel_tol: float = 1e-9,
    abs_tol: float = 1e-9,
) -> ValidationReport:
    technology = result.technology_result
    checks: list[ValidationCheck] = []

    expected_height_m = (
        technology.usable_depth_m
        if technology.usable_depth_m is not None
        else technology.usable_height_m
    )
    expected_energy_kwh = (
        technology.effective_mass_kg * STANDARD_GRAVITY * expected_height_m / 3_600_000
        if technology.effective_mass_kg is not None and expected_height_m is not None
        else None
    )

    _add_check(
        checks,
        "potential_energy_mgh",
        expected_energy_kwh,
        technology.max_potential_energy_kwh,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "round_trip_efficiency",
        technology.charge_efficiency * technology.discharge_efficiency,
        technology.round_trip_efficiency,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "input_energy_charge_efficiency",
        technology.stored_energy_kwh / technology.charge_efficiency,
        technology.input_energy_kwh,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "technical_delivery_discharge_efficiency",
        technology.stored_energy_kwh * technology.discharge_efficiency,
        technology.technical_delivered_energy_kwh,
        rel_tol,
        abs_tol,
    )

    standby_loss_before_clamp = (
        scenario.losses.standby_loss_kwh_per_hour * result.standby_hours_per_cycle
    )
    _add_check(
        checks,
        "standby_loss",
        min(standby_loss_before_clamp, technology.stored_energy_kwh),
        result.standby_loss_per_cycle_kwh,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "available_energy_after_standby",
        max(technology.stored_energy_kwh - result.standby_loss_per_cycle_kwh, 0.0),
        result.available_energy_kwh,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "gross_delivery_after_standby",
        result.available_energy_kwh * technology.discharge_efficiency,
        result.gross_delivered_energy_kwh,
        rel_tol,
        abs_tol,
    )

    expected_after_fraction = result.gross_delivered_energy_kwh * (
        1 - scenario.losses.cycle_loss_fraction
    )
    expected_effective_delivery = max(
        expected_after_fraction - scenario.losses.fixed_cycle_loss_kwh,
        0.0,
    )
    _add_check(
        checks,
        "cycle_losses_never_negative",
        expected_effective_delivery,
        result.effective_delivered_energy_kwh,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "annual_energy",
        (
            result.effective_delivered_energy_kwh
            * scenario.economics.cycles_per_year
            * scenario.economics.availability_factor
            / 1000
        ),
        result.annual_discharged_energy_mwh,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "capex",
        (
            scenario.economics.fixed_capex
            + scenario.economics.cost_per_kw * technology.nominal_power_kw
            + scenario.economics.cost_per_kwh * technology.stored_energy_kwh
            + technology.technology_specific_capex
        ),
        result.initial_capex,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "opex",
        (
            scenario.economics.fixed_annual_opex
            + scenario.economics.variable_opex_per_mwh
            * result.annual_discharged_energy_mwh
        ),
        result.annual_opex,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "annual_charging_energy",
        (
            result.annual_discharged_energy_mwh
            / result.effective_round_trip_efficiency
            if result.annual_discharged_energy_mwh > 0
            and result.effective_round_trip_efficiency > 0
            else 0.0
        ),
        result.annual_charging_energy_mwh,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "annual_charging_cost",
        (
            result.annual_charging_energy_mwh
            * scenario.economics.charging_energy_cost_per_mwh
        ),
        result.annual_charging_energy_cost,
        rel_tol,
        abs_tol,
    )

    if result.lcos_result is not None:
        _validate_lcos(scenario, result, checks, rel_tol, abs_tol)

    return ValidationReport(tuple(checks))


def validate_dispatch_result(
    simulation_result: SimulationResult,
    dispatch_result: pd.DataFrame,
    *,
    rel_tol: float = 1e-9,
    abs_tol: float = 1e-9,
) -> ValidationReport:
    capacity_kwh = simulation_result.technology_result.max_potential_energy_kwh
    charge_efficiency = simulation_result.technology_result.charge_efficiency
    discharge_efficiency = simulation_result.technology_result.discharge_efficiency
    checks: list[ValidationCheck] = []

    for index, row in dispatch_result.iterrows():
        prefix = f"dispatch_row_{index}"
        soc_initial = float(row["soc_initial_kwh"])
        soc_final = float(row["soc_final_kwh"])
        charged = float(row["energy_charged_from_grid_kwh"])
        stored = float(row["energy_stored_kwh"])
        discharged = float(row["energy_discharged_to_grid_kwh"])
        standby_loss = float(row["standby_loss_kwh"])
        price = float(row["price"])

        _add_bool_check(
            checks,
            f"{prefix}_soc_bounds",
            0 <= soc_initial <= capacity_kwh and 0 <= soc_final <= capacity_kwh,
            "0 <= SOC <= E_max",
            f"{soc_initial} -> {soc_final}",
        )
        _add_check(
            checks,
            f"{prefix}_stored_energy",
            charged * charge_efficiency,
            stored,
            rel_tol,
            abs_tol,
        )

        if row["action"] == "charge":
            expected_soc = min(soc_initial + stored, capacity_kwh)
        elif row["action"] == "discharge":
            expected_soc = max(soc_initial - discharged / discharge_efficiency, 0.0)
        else:
            expected_soc = max(soc_initial - standby_loss, 0.0)

        _add_check(
            checks,
            f"{prefix}_soc_transition",
            expected_soc,
            soc_final,
            rel_tol,
            abs_tol,
        )
        _add_check(
            checks,
            f"{prefix}_charge_cost",
            charged / 1000 * price,
            float(row["charge_cost"]),
            rel_tol,
            abs_tol,
        )
        _add_check(
            checks,
            f"{prefix}_revenue",
            discharged / 1000 * price,
            float(row["revenue"]),
            rel_tol,
            abs_tol,
        )
        _add_check(
            checks,
            f"{prefix}_net_profit",
            float(row["revenue"]) - float(row["charge_cost"]),
            float(row["net_profit"]),
            rel_tol,
            abs_tol,
        )

    summary = dispatch_result.attrs.get("summary", {})
    summary_columns = {
        "total_energy_charged_from_grid_kwh": "energy_charged_from_grid_kwh",
        "total_energy_stored_kwh": "energy_stored_kwh",
        "total_energy_discharged_to_grid_kwh": "energy_discharged_to_grid_kwh",
        "total_standby_loss_kwh": "standby_loss_kwh",
        "total_charge_cost": "charge_cost",
        "total_revenue": "revenue",
        "net_profit": "net_profit",
    }

    for summary_key, column in summary_columns.items():
        _add_check(
            checks,
            f"summary_{summary_key}",
            float(dispatch_result[column].sum()),
            float(summary.get(summary_key, 0.0)),
            rel_tol,
            abs_tol,
        )

    return ValidationReport(tuple(checks))


def _validate_lcos(
    scenario: Scenario,
    result: SimulationResult,
    checks: list[ValidationCheck],
    rel_tol: float,
    abs_tol: float,
) -> None:
    lcos = result.lcos_result
    if lcos is None:
        return

    discounted_opex = 0.0
    discounted_charging_cost = 0.0
    discounted_replacement_cost = 0.0
    discounted_energy = 0.0

    for year in range(1, scenario.economics.project_lifetime_years + 1):
        discounted_opex += present_value(
            result.annual_opex,
            year,
            scenario.economics.discount_rate,
        )
        discounted_charging_cost += present_value(
            result.annual_charging_energy_cost,
            year,
            scenario.economics.discount_rate,
        )
        discounted_energy += present_value(
            result.annual_discharged_energy_mwh,
            year,
            scenario.economics.discount_rate,
        )

        if scenario.economics.replacement_year == year:
            discounted_replacement_cost += present_value(
                scenario.economics.replacement_cost,
                year,
                scenario.economics.discount_rate,
            )

    discounted_end_of_life_cost = present_value(
        scenario.economics.end_of_life_cost,
        scenario.economics.project_lifetime_years,
        scenario.economics.discount_rate,
    )
    discounted_cost = (
        result.initial_capex
        + discounted_opex
        + discounted_charging_cost
        + discounted_replacement_cost
        + discounted_end_of_life_cost
    )

    _add_check(
        checks,
        "discounted_opex",
        discounted_opex,
        lcos.discounted_opex,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "discounted_charging_cost",
        discounted_charging_cost,
        lcos.discounted_charging_energy_cost,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "discounted_replacement_cost",
        discounted_replacement_cost,
        lcos.discounted_replacement_cost,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "discounted_end_of_life_cost",
        discounted_end_of_life_cost,
        lcos.discounted_end_of_life_cost,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "discounted_energy",
        discounted_energy,
        lcos.discounted_energy_mwh,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "discounted_cost",
        discounted_cost,
        lcos.discounted_cost,
        rel_tol,
        abs_tol,
    )
    _add_check(
        checks,
        "lcos",
        discounted_cost / discounted_energy,
        lcos.lcos_per_mwh,
        rel_tol,
        abs_tol,
    )


def _add_check(
    checks: list[ValidationCheck],
    name: str,
    expected: float | None,
    actual: float | None,
    rel_tol: float,
    abs_tol: float,
) -> None:
    passed = (
        expected is not None
        and actual is not None
        and isclose(actual, expected, rel_tol=rel_tol, abs_tol=abs_tol)
    )
    checks.append(
        ValidationCheck(
            name=name,
            passed=passed,
            expected=expected,
            actual=actual,
        )
    )


def _add_bool_check(
    checks: list[ValidationCheck],
    name: str,
    passed: bool,
    expected: str,
    actual: str,
) -> None:
    checks.append(
        ValidationCheck(
            name=name,
            passed=passed,
            expected=expected,
            actual=actual,
        )
    )
