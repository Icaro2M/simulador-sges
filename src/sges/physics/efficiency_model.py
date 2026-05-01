from dataclasses import dataclass

from sges.core.exceptions import InvalidParameterError


@dataclass(frozen=True)
class EfficiencyChain:
    motor_efficiency: float
    generator_efficiency: float
    mechanical_efficiency: float
    auxiliary_efficiency: float = 1.0


def calculate_round_trip_efficiency(chain: EfficiencyChain) -> float:
    values = [
        chain.motor_efficiency,
        chain.generator_efficiency,
        chain.mechanical_efficiency,
        chain.auxiliary_efficiency,
    ]

    for value in values:
        if value <= 0 or value > 1:
            raise InvalidParameterError("efficiency values must be in the interval (0, 1]")

    return (
        chain.motor_efficiency
        * chain.generator_efficiency
        * chain.mechanical_efficiency
        * chain.auxiliary_efficiency
    )