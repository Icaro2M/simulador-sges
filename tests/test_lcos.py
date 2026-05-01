from sges.economics.lcos import LcosInput, calculate_lcos


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