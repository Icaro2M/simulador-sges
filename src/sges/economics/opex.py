from dataclasses import dataclass

from sges.core.exceptions import InvalidParameterError


@dataclass(frozen=True)
class OpexModel:
    fixed_annual_cost: float
    variable_cost_per_mwh: float = 0.0

    def calculate_annual(self, discharged_energy_mwh_per_year: float) -> float:
        if self.fixed_annual_cost < 0:
            raise InvalidParameterError("fixed_annual_cost must be greater than or equal to zero")

        if self.variable_cost_per_mwh < 0:
            raise InvalidParameterError("variable_cost_per_mwh must be greater than or equal to zero")

        if discharged_energy_mwh_per_year < 0:
            raise InvalidParameterError("discharged_energy_mwh_per_year must be greater than or equal to zero")

        return self.fixed_annual_cost + (
            self.variable_cost_per_mwh * discharged_energy_mwh_per_year
        )