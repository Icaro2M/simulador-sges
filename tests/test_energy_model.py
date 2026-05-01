import pytest

from sges.physics.energy_model import (
    PotentialEnergyInput,
    calculate_potential_energy,
)


def test_potential_energy_basic():
    data = PotentialEnergyInput(
        mass_kg=1000,
        height_m=10,
    )

    result = calculate_potential_energy(data)

    assert result.energy_j > 0
    assert result.energy_kwh > 0


def test_potential_energy_scaling():
    data1 = PotentialEnergyInput(mass_kg=1000, height_m=10)
    data2 = PotentialEnergyInput(mass_kg=2000, height_m=10)

    result1 = calculate_potential_energy(data1)
    result2 = calculate_potential_energy(data2)

    assert result2.energy_kwh == pytest.approx(result1.energy_kwh * 2)


def test_invalid_mass():
    with pytest.raises(Exception):
        calculate_potential_energy(
            PotentialEnergyInput(mass_kg=0, height_m=10)
        )