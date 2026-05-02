from dataclasses import replace

import pytest
from fastapi.testclient import TestClient

from api.main import app
from api.schemas.scenario import SimulationRequest
from sges.simulation.scenario import (
    Scenario,
    TechnologyScenario,
    EconomicScenario,
    LossScenario,
)
from sges.simulation.simulator import SGESSimulator


def create_test_scenario():
    return Scenario(
        name="test",
        technology=TechnologyScenario(
            type="tower",
            mass_kg=100000,
            height_m=50,
            nominal_power_kw=100,
            charge_efficiency=0.9,
            discharge_efficiency=0.9,
        ),
        losses=LossScenario(
            cycle_loss_fraction=0.01,
            fixed_cycle_loss_kwh=0.1,
            standby_loss_kwh_per_hour=0.01,
        ),
        economics=EconomicScenario(
            cost_per_kw=1000,
            cost_per_kwh=50,
            fixed_capex=10000,
            fixed_annual_opex=2000,
            variable_opex_per_mwh=2,
            project_lifetime_years=20,
            discount_rate=0.08,
            cycles_per_year=300,
        ),
    )


def test_simulator_runs():
    simulator = SGESSimulator()
    scenario = create_test_scenario()

    result = simulator.run(scenario)

    assert result.initial_capex > 0
    assert result.annual_opex > 0
    assert result.lcos_result is not None
    assert result.lcos_result.lcos_per_mwh > 0


def test_simulator_energy_positive():
    simulator = SGESSimulator()
    scenario = create_test_scenario()

    result = simulator.run(scenario)

    assert result.technology_result.delivered_energy_kwh > 0


def test_nominal_power_is_used_as_legacy_power_limit():
    simulator = SGESSimulator()
    scenario = create_test_scenario()

    result = simulator.run(scenario)

    assert result.technology_result.nominal_power_kw == 100
    assert result.technology_result.charge_power_kw == 100
    assert result.technology_result.discharge_power_kw == 100


def test_charge_and_discharge_power_limits_affect_only_their_cycle_times():
    simulator = SGESSimulator()
    scenario = create_test_scenario()
    split_power_scenario = replace(
        scenario,
        technology=replace(
            scenario.technology,
            charge_power_kw=200,
            discharge_power_kw=50,
        ),
    )

    result = simulator.run(scenario)
    split_power_result = simulator.run(split_power_scenario)

    assert split_power_result.technology_result.charge_time_h == pytest.approx(
        result.technology_result.charge_time_h / 2
    )
    assert split_power_result.technology_result.discharge_time_h == pytest.approx(
        result.technology_result.discharge_time_h * 2
    )
    assert split_power_result.technology_result.stored_energy_kwh == pytest.approx(
        result.technology_result.stored_energy_kwh
    )
    assert split_power_result.technology_result.delivered_energy_kwh == pytest.approx(
        result.technology_result.delivered_energy_kwh
    )


def test_charging_energy_cost_is_included_in_lcos_inputs():
    simulator = SGESSimulator()
    scenario = create_test_scenario()
    charging_cost_scenario = replace(
        scenario,
        economics=replace(
            scenario.economics,
            charging_energy_cost_per_mwh=50.0,
        ),
    )

    base_result = simulator.run(scenario)
    charging_cost_result = simulator.run(charging_cost_scenario)

    assert charging_cost_result.annual_charging_energy_mwh == pytest.approx(
        charging_cost_result.annual_discharged_energy_mwh
        / charging_cost_result.effective_round_trip_efficiency
    )
    assert charging_cost_result.annual_charging_energy_cost == pytest.approx(
        charging_cost_result.annual_charging_energy_mwh * 50.0
    )
    assert charging_cost_result.annual_lcos_cost == pytest.approx(
        charging_cost_result.annual_opex
        + charging_cost_result.annual_charging_energy_cost
    )
    assert base_result.lcos_result is not None
    assert charging_cost_result.lcos_result is not None
    assert charging_cost_result.lcos_result.lcos_per_mwh > (
        base_result.lcos_result.lcos_per_mwh
    )


def test_energy_flow_is_explicit_and_consistent():
    simulator = SGESSimulator()
    scenario = create_test_scenario()

    result = simulator.run(scenario)
    technology = result.technology_result

    assert technology.max_potential_energy_kwh == pytest.approx(
        technology.stored_energy_kwh
    )
    assert technology.input_energy_kwh == pytest.approx(
        technology.max_potential_energy_kwh / technology.charge_efficiency
    )
    assert result.available_energy_kwh == pytest.approx(
        max(technology.stored_energy_kwh - result.standby_loss_per_cycle_kwh, 0)
    )
    assert result.gross_delivered_energy_kwh == pytest.approx(
        result.available_energy_kwh * technology.discharge_efficiency
    )
    assert result.cycle_loss_per_cycle_kwh == pytest.approx(
        result.gross_delivered_energy_kwh - result.effective_delivered_energy_kwh
    )
    assert result.standby_output_loss_per_cycle_kwh == pytest.approx(
        technology.technical_delivered_energy_kwh - result.gross_delivered_energy_kwh
    )
    assert result.total_loss_per_cycle_kwh == pytest.approx(
        result.standby_output_loss_per_cycle_kwh + result.cycle_loss_per_cycle_kwh
    )
    assert result.total_loss_per_cycle_kwh == pytest.approx(
        technology.technical_delivered_energy_kwh - result.effective_delivered_energy_kwh
    )
    assert result.effective_round_trip_efficiency == pytest.approx(
        result.effective_delivered_energy_kwh / technology.input_energy_kwh
    )


def test_cycle_loss_breakdown_separates_fractional_and_fixed_losses():
    simulator = SGESSimulator()
    scenario = create_test_scenario()
    loss_scenario = replace(
        scenario,
        losses=replace(
            scenario.losses,
            cycle_loss_fraction=0.10,
            fixed_cycle_loss_kwh=0.25,
            standby_loss_kwh_per_hour=0.0,
        ),
    )

    result = simulator.run(loss_scenario)

    assert result.fractional_cycle_loss_per_cycle_kwh == pytest.approx(
        result.gross_delivered_energy_kwh * 0.10
    )
    assert result.fixed_cycle_loss_per_cycle_kwh == pytest.approx(0.25)
    assert result.cycle_loss_per_cycle_kwh == pytest.approx(
        result.fractional_cycle_loss_per_cycle_kwh
        + result.fixed_cycle_loss_per_cycle_kwh
    )


def test_standby_loss_reduces_annual_energy_but_not_technical_energy():
    simulator = SGESSimulator()
    standby_scenario = create_test_scenario()
    zero_standby_scenario = replace(
        standby_scenario,
        losses=replace(standby_scenario.losses, standby_loss_kwh_per_hour=0.0),
    )

    standby_result = simulator.run(standby_scenario)
    zero_standby_result = simulator.run(zero_standby_scenario)

    assert standby_result.standby_hours_per_cycle > 0
    assert standby_result.standby_loss_per_cycle_kwh > 0
    assert standby_result.annual_standby_loss_kwh > 0
    assert standby_result.technology_result.delivered_energy_kwh == (
        zero_standby_result.technology_result.delivered_energy_kwh
    )
    assert standby_result.effective_delivered_energy_kwh < (
        zero_standby_result.effective_delivered_energy_kwh
    )
    assert standby_result.annual_discharged_energy_mwh < (
        zero_standby_result.annual_discharged_energy_mwh
    )
    assert standby_result.lcos_result is not None
    assert zero_standby_result.lcos_result is not None
    assert standby_result.lcos_result.lcos_per_mwh > (
        zero_standby_result.lcos_result.lcos_per_mwh
    )


def test_simulator_returns_result_when_losses_leave_no_deliverable_energy():
    simulator = SGESSimulator()
    scenario = create_test_scenario()
    high_loss_scenario = replace(
        scenario,
        losses=replace(
            scenario.losses,
            fixed_cycle_loss_kwh=100.0,
            standby_loss_kwh_per_hour=100.0,
        ),
    )

    result = simulator.run(high_loss_scenario)

    assert result.status == "no_deliverable_energy"
    assert result.lcos_result is None
    assert result.effective_delivered_energy_kwh == 0
    assert result.annual_discharged_energy_mwh == 0
    assert result.warnings


def test_simulation_route_returns_success_for_impossible_lcos():
    scenario = create_test_scenario()
    request = SimulationRequest(
        name=scenario.name,
        technology_type=scenario.technology.type,
        mass_kg=scenario.technology.mass_kg,
        height_m=scenario.technology.height_m,
        nominal_power_kw=scenario.technology.nominal_power_kw,
        charge_efficiency=scenario.technology.charge_efficiency,
        discharge_efficiency=scenario.technology.discharge_efficiency,
        cycle_loss_fraction=scenario.losses.cycle_loss_fraction,
        fixed_cycle_loss_kwh=100.0,
        standby_loss_kwh_per_hour=100.0,
        cost_per_kw=scenario.economics.cost_per_kw,
        cost_per_kwh=scenario.economics.cost_per_kwh,
        fixed_capex=scenario.economics.fixed_capex,
        fixed_annual_opex=scenario.economics.fixed_annual_opex,
        variable_opex_per_mwh=scenario.economics.variable_opex_per_mwh,
        project_lifetime_years=scenario.economics.project_lifetime_years,
        discount_rate=scenario.economics.discount_rate,
        cycles_per_year=scenario.economics.cycles_per_year,
    )

    client = TestClient(app)
    response = client.post("/simulate", json=request.model_dump())

    assert response.status_code == 200
    body = response.json()
    assert body["result"]["status"] == "no_deliverable_energy"
    assert body["result"]["lcos_result"] is None
    assert body["result"]["warnings"]
