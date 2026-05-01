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
            motor_efficiency=0.9,
            generator_efficiency=0.9,
            mechanical_efficiency=0.9,
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
    assert result.lcos_result.lcos_per_mwh > 0


def test_simulator_energy_positive():
    simulator = SGESSimulator()
    scenario = create_test_scenario()

    result = simulator.run(scenario)

    assert result.technology_result.delivered_energy_kwh > 0