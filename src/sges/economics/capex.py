from dataclasses import dataclass

from sges.core.exceptions import InvalidParameterError


@dataclass(frozen=True)
class CapexModel:
    cost_per_kw: float
    cost_per_kwh: float
    fixed_cost: float = 0.0

    def calculate(self, nominal_power_kw: float, storage_capacity_kwh: float) -> float:
        if self.cost_per_kw < 0:
            raise InvalidParameterError("cost_per_kw must be greater than or equal to zero")

        if self.cost_per_kwh < 0:
            raise InvalidParameterError("cost_per_kwh must be greater than or equal to zero")

        if self.fixed_cost < 0:
            raise InvalidParameterError("fixed_cost must be greater than or equal to zero")

        if nominal_power_kw <= 0:
            raise InvalidParameterError("nominal_power_kw must be greater than zero")

        if storage_capacity_kwh <= 0:
            raise InvalidParameterError("storage_capacity_kwh must be greater than zero")

        return (
            self.fixed_cost
            + self.cost_per_kw * nominal_power_kw
            + self.cost_per_kwh * storage_capacity_kwh
        )