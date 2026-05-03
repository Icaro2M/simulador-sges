import pandas as pd
import pytest

from sges.physics.loss_model import LossModel
from sges.simulation.dispatcher import DispatchConfig, run_price_arbitrage_dispatch
from sges.simulation.results import SimulationResult
from sges.technologies.base import TechnologyResult


def make_simulation_result() -> SimulationResult:
    technology_result = TechnologyResult(
        technology_name="Test SGES",
        max_potential_energy_kwh=100.0,
        input_energy_kwh=125.0,
        stored_energy_kwh=100.0,
        required_charge_energy_kwh=125.0,
        technical_delivered_energy_kwh=90.0,
        delivered_energy_kwh=90.0,
        charge_efficiency=0.8,
        discharge_efficiency=0.9,
        round_trip_efficiency=0.72,
        nominal_power_kw=50.0,
        charge_power_kw=50.0,
        discharge_power_kw=50.0,
        charge_time_h=2.5,
        discharge_time_h=1.8,
    )

    return SimulationResult(
        scenario_name="test",
        technology_result=technology_result,
        available_energy_kwh=100.0,
        gross_delivered_energy_kwh=90.0,
        effective_delivered_energy_kwh=90.0,
        standby_output_loss_per_cycle_kwh=0.0,
        fractional_cycle_loss_per_cycle_kwh=0.0,
        fixed_cycle_loss_per_cycle_kwh=0.0,
        cycle_loss_per_cycle_kwh=0.0,
        total_loss_per_cycle_kwh=0.0,
        effective_round_trip_efficiency=0.72,
        standby_hours_per_cycle=0.0,
        standby_loss_per_cycle_kwh=0.0,
        annual_standby_loss_kwh=0.0,
        status="ok",
        warnings=[],
        initial_capex=0.0,
        availability_factor=1.0,
        annual_discharged_energy_before_availability_mwh=0.0,
        replacement_cost=0.0,
        replacement_year=None,
        end_of_life_cost=0.0,
        annual_opex=0.0,
        annual_discharged_energy_mwh=0.0,
        annual_charging_energy_mwh=0.0,
        annual_charging_energy_cost=0.0,
        annual_lcos_cost=0.0,
        lcos_result=None,
    )


def test_dispatch_tracks_soc_efficiency_losses_and_summary():
    price_profile = pd.DataFrame(
        [
            {"hour": 0, "price": 10.0},
            {"hour": 1, "price": 10.0},
            {"hour": 2, "price": 50.0},
            {"hour": 3, "price": 100.0},
            {"hour": 4, "price": 100.0},
            {"hour": 5, "price": 50.0},
        ]
    )

    result = run_price_arbitrage_dispatch(
        simulation_result=make_simulation_result(),
        price_profile=price_profile,
        config=DispatchConfig(
            low_price_threshold=20.0,
            high_price_threshold=80.0,
            loss_model=LossModel(standby_loss_kwh_per_hour=5.0),
        ),
    )

    assert result["action"].tolist() == [
        "charge",
        "charge",
        "standby",
        "discharge",
        "discharge",
        "standby",
    ]
    assert result.loc[0, "energy_charged_from_grid_kwh"] == pytest.approx(50.0)
    assert result.loc[0, "energy_stored_kwh"] == pytest.approx(40.0)
    assert result.loc[1, "soc_final_kwh"] == pytest.approx(80.0)
    assert result.loc[2, "standby_loss_kwh"] == pytest.approx(5.0)
    assert result.loc[3, "energy_discharged_to_grid_kwh"] == pytest.approx(50.0)
    assert result.loc[3, "soc_final_kwh"] == pytest.approx(75.0 - (50.0 / 0.9))
    assert result.loc[4, "energy_discharged_to_grid_kwh"] == pytest.approx(17.5)
    assert result.loc[4, "soc_final_kwh"] == pytest.approx(0.0)

    summary = result.attrs["summary"]

    assert summary["total_energy_charged_from_grid_kwh"] == pytest.approx(100.0)
    assert summary["total_energy_stored_kwh"] == pytest.approx(80.0)
    assert summary["total_energy_discharged_to_grid_kwh"] == pytest.approx(67.5)
    assert summary["total_standby_loss_kwh"] == pytest.approx(5.0)
    assert summary["total_charge_cost"] == pytest.approx(1.0)
    assert summary["total_revenue"] == pytest.approx(6.75)
    assert summary["net_profit"] == pytest.approx(5.75)
    assert summary["final_soc_kwh"] == pytest.approx(0.0)
    assert summary["charge_hours"] == 2
    assert summary["discharge_hours"] == 2
    assert summary["standby_hours"] == 2


def test_dispatch_clamps_initial_soc_to_physical_capacity():
    price_profile = pd.DataFrame([{"hour": 0, "price": 100.0}])

    result = run_price_arbitrage_dispatch(
        simulation_result=make_simulation_result(),
        price_profile=price_profile,
        config=DispatchConfig(
            low_price_threshold=20.0,
            high_price_threshold=80.0,
            initial_soc_kwh=500.0,
        ),
    )

    assert result.loc[0, "soc_initial_kwh"] == pytest.approx(100.0)
    assert result.loc[0, "energy_discharged_to_grid_kwh"] == pytest.approx(50.0)
