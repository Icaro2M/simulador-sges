from dataclasses import dataclass

from sges.core.exceptions import InvalidParameterError


@dataclass(frozen=True)
class EfficiencyChain:
    charge_efficiency: float
    discharge_efficiency: float


def calculate_round_trip_efficiency(chain: EfficiencyChain) -> float:
    values = [
        chain.charge_efficiency,
        chain.discharge_efficiency,
    ]

    for value in values:
        if value <= 0 or value > 1:
            raise InvalidParameterError("efficiency values must be in the interval (0, 1]")

    return chain.charge_efficiency * chain.discharge_efficiency
