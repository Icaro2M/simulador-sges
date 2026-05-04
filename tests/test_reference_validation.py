from dataclasses import replace

import pytest

from sges.physics.efficiency_model import EfficiencyChain, calculate_round_trip_efficiency
from sges.physics.energy_model import PotentialEnergyInput, calculate_potential_energy
from sges.physics.loss_model import LossModel
from sges.simulation.dispatcher import DispatchConfig, run_price_arbitrage_dispatch
from sges.simulation.simulator import SGESSimulator
from sges.validation import (
    build_discounted_economics_reference_scenario,
    build_dispatch_reference_price_profile,
    build_known_efficiency_reference_scenario,
    build_no_loss_reference_scenario,
    build_simple_economics_reference_scenario,
    build_standby_reference_scenario,
    validate_dispatch_result,
    validate_simulation_result,
)


def test_potential_energy_matches_mgh_with_known_inputs():
    result = calculate_potential_energy(
        PotentialEnergyInput(mass_kg=1000, height_m=100, gravity_m_s2=10)
    )

    assert result.energy_j == pytest.approx(1_000_000)
    assert result.energy_kwh == pytest.approx(1_000_000 / 3_600_000)


def test_round_trip_efficiency_is_charge_times_discharge():
    assert calculate_round_trip_efficiency(
        EfficiencyChain(charge_efficiency=0.9, discharge_efficiency=0.8)
    ) == pytest.approx(0.72)


def test_cycle_losses_reduce_energy_and_never_go_negative():
    loss_model = LossModel(cycle_loss_fraction=0.10, fixed_cycle_loss_kwh=5.0)

    assert loss_model.apply_cycle_losses(100.0) == pytest.approx(85.0)
    assert loss_model.apply_cycle_losses(2.0) == pytest.approx(0.0)


def test_reference_no_loss_scenario_matches_physics_and_economics():
    scenario = build_no_loss_reference_scenario()
    result = SGESSimulator().run(scenario)
    report = validate_simulation_result(scenario, result)

    assert report.ok, report.failures
    assert result.effective_round_trip_efficiency == pytest.approx(1.0)
    assert result.effective_delivered_energy_kwh == pytest.approx(
        result.technology_result.max_potential_energy_kwh
    )


def test_reference_known_efficiency_scenario_matches_90_charge_80_discharge():
    scenario = build_known_efficiency_reference_scenario()
    result = SGESSimulator().run(scenario)
    report = validate_simulation_result(scenario, result)

    assert report.ok, report.failures
    assert result.technology_result.charge_efficiency == pytest.approx(0.9)
    assert result.technology_result.discharge_efficiency == pytest.approx(0.8)
    assert result.technology_result.round_trip_efficiency == pytest.approx(0.72)


def test_reference_standby_scenario_uses_one_kwh_per_hour_for_ten_hours():
    scenario = build_standby_reference_scenario()
    zero_standby_scenario = replace(
        scenario,
        losses=replace(scenario.losses, standby_loss_kwh_per_hour=0),
    )

    result = SGESSimulator().run(scenario)
    zero_standby_result = SGESSimulator().run(zero_standby_scenario)
    report = validate_simulation_result(scenario, result)

    assert report.ok, report.failures
    assert result.standby_hours_per_cycle == pytest.approx(10.0)
    assert result.standby_loss_per_cycle_kwh == pytest.approx(10.0)
    assert result.annual_discharged_energy_mwh < (
        zero_standby_result.annual_discharged_energy_mwh
    )


def test_reference_economics_zero_discount_has_manual_lcos():
    scenario = build_simple_economics_reference_scenario()
    result = SGESSimulator().run(scenario)
    report = validate_simulation_result(scenario, result)

    assert report.ok, report.failures
    assert result.lcos_result is not None
    assert result.lcos_result.discounted_cost == pytest.approx(
        result.initial_capex
        + (result.annual_opex + result.annual_charging_energy_cost) * 2
    )
    assert result.lcos_result.discounted_energy_mwh == pytest.approx(
        result.annual_discharged_energy_mwh * 2
    )


def test_reference_economics_positive_discount_and_lifecycle_costs():
    scenario = build_discounted_economics_reference_scenario()
    base_scenario = replace(
        scenario,
        economics=replace(
            scenario.economics,
            replacement_cost=0,
            replacement_year=None,
            end_of_life_cost=0,
        ),
    )

    result = SGESSimulator().run(scenario)
    base_result = SGESSimulator().run(base_scenario)
    report = validate_simulation_result(scenario, result)

    assert report.ok, report.failures
    assert result.lcos_result is not None
    assert base_result.lcos_result is not None
    assert result.lcos_result.discounted_replacement_cost > 0
    assert result.lcos_result.discounted_end_of_life_cost > 0
    assert result.lcos_result.discounted_cost > base_result.lcos_result.discounted_cost
    assert result.lcos_result.lcos_per_mwh > base_result.lcos_result.lcos_per_mwh


def test_reference_dispatch_validates_soc_energy_cost_revenue_and_profit():
    scenario = build_known_efficiency_reference_scenario()
    simulation_result = SGESSimulator().run(scenario)
    dispatch_result = run_price_arbitrage_dispatch(
        simulation_result=simulation_result,
        price_profile=build_dispatch_reference_price_profile(),
        config=DispatchConfig(
            low_price_threshold=20,
            high_price_threshold=80,
            loss_model=LossModel(standby_loss_kwh_per_hour=1.0),
        ),
    )

    report = validate_dispatch_result(simulation_result, dispatch_result)
    summary = dispatch_result.attrs["summary"]

    assert report.ok, report.failures
    assert dispatch_result["soc_final_kwh"].between(
        0,
        simulation_result.technology_result.max_potential_energy_kwh,
    ).all()
    assert summary["total_energy_charged_from_grid_kwh"] > 0
    assert summary["total_energy_discharged_to_grid_kwh"] > 0
    assert summary["total_charge_cost"] == pytest.approx(
        dispatch_result["charge_cost"].sum()
    )
    assert summary["total_revenue"] == pytest.approx(dispatch_result["revenue"].sum())
    assert summary["net_profit"] == pytest.approx(
        summary["total_revenue"] - summary["total_charge_cost"]
    )
