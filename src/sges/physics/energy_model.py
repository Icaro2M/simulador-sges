from dataclasses import dataclass

from sges.core.constants import STANDARD_GRAVITY
from sges.core.units import joules_to_kwh
from sges.core.exceptions import InvalidParameterError


@dataclass(frozen=True)
class PotentialEnergyInput:
    mass_kg: float
    height_m: float
    gravity_m_s2: float = STANDARD_GRAVITY


@dataclass(frozen=True)
class PotentialEnergyResult:
    energy_j: float
    energy_kwh: float


def calculate_potential_energy(data: PotentialEnergyInput) -> PotentialEnergyResult:
    if data.mass_kg <= 0:
        raise InvalidParameterError("mass_kg must be greater than zero")

    if data.height_m <= 0:
        raise InvalidParameterError("height_m must be greater than zero")

    if data.gravity_m_s2 <= 0:
        raise InvalidParameterError("gravity_m_s2 must be greater than zero")

    energy_j = data.mass_kg * data.gravity_m_s2 * data.height_m

    return PotentialEnergyResult(
        energy_j=energy_j,
        energy_kwh=joules_to_kwh(energy_j),
    )