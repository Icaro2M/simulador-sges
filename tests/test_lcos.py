from sges.economics.lcos import LcosInput, calculate_lcos
from sges.core.exceptions import InvalidParameterError
import pytest


def test_lcos_basic():
    data = LcosInput(
        initial_capex=100000,
        annual_opex=10000,
        annual_discharged_energy_mwh=100,
        project_lifetime_years=10,
        discount_rate=0.08,
    )

    result = calculate_lcos(data)

    assert result.lcos_per_mwh > 0
    assert result.discounted_cost > 0
    assert result.discounted_energy_mwh > 0


def test_lcos_increases_with_cost():
    base = LcosInput(
        initial_capex=100000,
        annual_opex=10000,
        annual_discharged_energy_mwh=100,
        project_lifetime_years=10,
        discount_rate=0.08,
    )

    higher_cost = LcosInput(
        initial_capex=200000,
        annual_opex=10000,
        annual_discharged_energy_mwh=100,
        project_lifetime_years=10,
        discount_rate=0.08,
    )

    result1 = calculate_lcos(base)
    result2 = calculate_lcos(higher_cost)

    assert result2.lcos_per_mwh > result1.lcos_per_mwh


def test_lcos_includes_annual_charging_energy_cost():
    data = LcosInput(
        initial_capex=100000,
        annual_opex=10000,
        annual_charging_energy_cost=2500,
        annual_discharged_energy_mwh=100,
        project_lifetime_years=2,
        discount_rate=0.0,
    )

    result = calculate_lcos(data)

    assert result.discounted_charging_energy_cost == 5000
    assert result.discounted_cost == 125000
    assert result.discounted_energy_mwh == 200
    assert result.lcos_per_mwh == 625


def test_lcos_zero_charging_cost_matches_simplified_case():
    simplified = LcosInput(
        initial_capex=100000,
        annual_opex=10000,
        annual_discharged_energy_mwh=100,
        project_lifetime_years=10,
        discount_rate=0.08,
    )
    explicit_zero = LcosInput(
        initial_capex=100000,
        annual_opex=10000,
        annual_charging_energy_cost=0.0,
        annual_discharged_energy_mwh=100,
        project_lifetime_years=10,
        discount_rate=0.08,
    )

    assert calculate_lcos(explicit_zero) == calculate_lcos(simplified)


def test_lcos_includes_replacement_and_end_of_life_costs():
    data = LcosInput(
        initial_capex=100000,
        annual_opex=10000,
        annual_charging_energy_cost=2500,
        annual_discharged_energy_mwh=100,
        project_lifetime_years=2,
        discount_rate=0.0,
        replacement_cost=20000,
        replacement_year=1,
        end_of_life_cost=5000,
    )

    result = calculate_lcos(data)

    assert result.discounted_replacement_cost == 20000
    assert result.discounted_end_of_life_cost == 5000
    assert result.discounted_cost == 150000
    assert result.discounted_energy_mwh == 200
    assert result.lcos_per_mwh == 750


def test_lcos_ignores_replacement_cost_without_replacement_year():
    data = LcosInput(
        initial_capex=100000,
        annual_opex=10000,
        annual_discharged_energy_mwh=100,
        project_lifetime_years=2,
        discount_rate=0.0,
        replacement_cost=20000,
        replacement_year=None,
    )

    result = calculate_lcos(data)

    assert result.discounted_replacement_cost == 0
    assert result.discounted_cost == 120000


def test_lcos_replacement_year_must_be_within_project_lifetime():
    data = LcosInput(
        initial_capex=100000,
        annual_opex=10000,
        annual_discharged_energy_mwh=100,
        project_lifetime_years=2,
        discount_rate=0.0,
        replacement_cost=20000,
        replacement_year=3,
    )

    with pytest.raises(InvalidParameterError, match="replacement_year"):
        calculate_lcos(data)
