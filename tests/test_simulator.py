from dataclasses import replace

import pytest
from fastapi.testclient import TestClient

from api.main import app
from api.schemas.scenario import SimulationRequest
from sges.core.exceptions import InvalidParameterError
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


def test_tower_uses_blocks_and_usable_height_when_provided():
    simulator = SGESSimulator()
    scenario = create_test_scenario()
    tower_scenario = replace(
        scenario,
        technology=replace(
            scenario.technology,
            block_count=4,
            mass_per_block_kg=25000,
            usable_height_fraction=0.8,
            structure_cost_per_meter=1000,
        ),
    )

    result = simulator.run(tower_scenario)
    technology = result.technology_result

    assert technology.effective_mass_kg == pytest.approx(100000)
    assert technology.usable_height_m == pytest.approx(40)
    assert technology.max_potential_energy_kwh == pytest.approx(
        (100000 * 9.80665 * 40) / 3_600_000
    )
    assert technology.tower_structure_cost == pytest.approx(50000)
    assert result.technology_specific_capex == pytest.approx(50000)
    assert result.initial_capex == pytest.approx(result.base_capex + 50000)


def test_shaft_uses_density_volume_and_usable_depth_when_provided():
    simulator = SGESSimulator()
    scenario = create_test_scenario()
    shaft_scenario = replace(
        scenario,
        technology=replace(
            scenario.technology,
            type="shaft",
            material_density_kg_m3=2500,
            container_volume_m3=40,
            usable_depth_fraction=0.5,
            shaft_rehabilitation_cost=75000,
        ),
    )

    result = simulator.run(shaft_scenario)
    technology = result.technology_result

    assert technology.effective_mass_kg == pytest.approx(100000)
    assert technology.usable_depth_m == pytest.approx(25)
    assert technology.max_potential_energy_kwh == pytest.approx(
        (100000 * 9.80665 * 25) / 3_600_000
    )
    assert technology.shaft_rehabilitation_cost == pytest.approx(75000)
    assert result.technology_specific_capex == pytest.approx(75000)
    assert result.initial_capex == pytest.approx(result.base_capex + 75000)


def test_tower_legacy_mass_and_height_are_preserved_without_new_fields():
    simulator = SGESSimulator()
    scenario = create_test_scenario()

    result = simulator.run(scenario)
    technology = result.technology_result

    assert technology.effective_mass_kg == pytest.approx(scenario.technology.mass_kg)
    assert technology.usable_height_m == pytest.approx(scenario.technology.height_m)
    assert technology.max_potential_energy_kwh == pytest.approx(
        (scenario.technology.mass_kg * 9.80665 * scenario.technology.height_m)
        / 3_600_000
    )
    assert result.technology_specific_capex == 0
    assert result.initial_capex == pytest.approx(result.base_capex)


def test_technology_specific_inputs_are_validated():
    simulator = SGESSimulator()
    scenario = create_test_scenario()

    with pytest.raises(InvalidParameterError, match="usable_height_fraction"):
        simulator.run(
            replace(
                scenario,
                technology=replace(scenario.technology, usable_height_fraction=0),
            )
        )

    with pytest.raises(InvalidParameterError, match="provided together"):
        simulator.run(
            replace(
                scenario,
                technology=replace(scenario.technology, block_count=2),
            )
        )

    with pytest.raises(InvalidParameterError, match="material_density"):
        simulator.run(
            replace(
                scenario,
                technology=replace(
                    scenario.technology,
                    type="shaft",
                    material_density_kg_m3=-2500,
                    container_volume_m3=40,
                ),
            )
        )


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


def test_replacement_and_end_of_life_costs_are_included_in_lcos_inputs():
    simulator = SGESSimulator()
    scenario = create_test_scenario()
    lifecycle_cost_scenario = replace(
        scenario,
        economics=replace(
            scenario.economics,
            replacement_cost=20000,
            replacement_year=5,
            end_of_life_cost=10000,
        ),
    )

    base_result = simulator.run(scenario)
    lifecycle_cost_result = simulator.run(lifecycle_cost_scenario)

    assert lifecycle_cost_result.replacement_cost == 20000
    assert lifecycle_cost_result.replacement_year == 5
    assert lifecycle_cost_result.end_of_life_cost == 10000
    assert lifecycle_cost_result.lcos_result is not None
    assert base_result.lcos_result is not None
    assert lifecycle_cost_result.lcos_result.discounted_replacement_cost > 0
    assert lifecycle_cost_result.lcos_result.discounted_end_of_life_cost > 0
    assert lifecycle_cost_result.lcos_result.discounted_cost == pytest.approx(
        base_result.lcos_result.discounted_cost
        + lifecycle_cost_result.lcos_result.discounted_replacement_cost
        + lifecycle_cost_result.lcos_result.discounted_end_of_life_cost
    )
    assert lifecycle_cost_result.lcos_result.lcos_per_mwh > (
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


def test_availability_reduces_annual_energy_and_lcos_denominator_only():
    simulator = SGESSimulator()
    scenario = create_test_scenario()
    availability_scenario = replace(
        scenario,
        economics=replace(scenario.economics, availability_factor=0.8),
    )

    base_result = simulator.run(scenario)
    availability_result = simulator.run(availability_scenario)

    assert availability_result.availability_factor == pytest.approx(0.8)
    assert (
        availability_result.annual_discharged_energy_before_availability_mwh
    ) == pytest.approx(base_result.annual_discharged_energy_mwh)
    assert availability_result.annual_discharged_energy_mwh == pytest.approx(
        base_result.annual_discharged_energy_mwh * 0.8
    )
    assert availability_result.technology_result.max_potential_energy_kwh == (
        base_result.technology_result.max_potential_energy_kwh
    )
    assert availability_result.technology_result.delivered_energy_kwh == (
        base_result.technology_result.delivered_energy_kwh
    )
    assert availability_result.annual_opex == pytest.approx(
        scenario.economics.fixed_annual_opex
        + (
            scenario.economics.variable_opex_per_mwh
            * availability_result.annual_discharged_energy_mwh
        )
    )
    assert availability_result.lcos_result is not None
    assert base_result.lcos_result is not None
    assert availability_result.lcos_result.lcos_per_mwh > (
        base_result.lcos_result.lcos_per_mwh
    )


def test_zero_availability_returns_no_deliverable_energy_without_changing_cycle_energy():
    simulator = SGESSimulator()
    scenario = create_test_scenario()
    zero_availability_scenario = replace(
        scenario,
        economics=replace(scenario.economics, availability_factor=0.0),
    )

    base_result = simulator.run(scenario)
    result = simulator.run(zero_availability_scenario)

    assert result.status == "no_deliverable_energy"
    assert result.lcos_result is None
    assert result.availability_factor == 0
    assert result.annual_discharged_energy_before_availability_mwh == pytest.approx(
        base_result.annual_discharged_energy_mwh
    )
    assert result.annual_discharged_energy_mwh == 0
    assert result.technology_result.delivered_energy_kwh == pytest.approx(
        base_result.technology_result.delivered_energy_kwh
    )


def test_availability_factor_must_be_between_zero_and_one():
    scenario = create_test_scenario()

    with pytest.raises(InvalidParameterError, match="availability_factor"):
        replace(scenario.economics, availability_factor=1.1)


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
