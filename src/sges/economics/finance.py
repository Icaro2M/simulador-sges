from dataclasses import dataclass

from sges.core.exceptions import InvalidParameterError


@dataclass(frozen=True)
class FinancialParameters:
    project_lifetime_years: int
    discount_rate: float

    def validate(self) -> None:
        if self.project_lifetime_years <= 0:
            raise InvalidParameterError("project_lifetime_years must be greater than zero")

        if self.discount_rate < 0:
            raise InvalidParameterError("discount_rate must be greater than or equal to zero")


def discount_factor(year: int, discount_rate: float) -> float:
    if year < 0:
        raise InvalidParameterError("year must be greater than or equal to zero")

    if discount_rate < 0:
        raise InvalidParameterError("discount_rate must be greater than or equal to zero")

    return 1 / ((1 + discount_rate) ** year)


def present_value(value: float, year: int, discount_rate: float) -> float:
    return value * discount_factor(year, discount_rate)


def capital_recovery_factor(discount_rate: float, lifetime_years: int) -> float:
    if lifetime_years <= 0:
        raise InvalidParameterError("lifetime_years must be greater than zero")

    if discount_rate < 0:
        raise InvalidParameterError("discount_rate must be greater than or equal to zero")

    if discount_rate == 0:
        return 1 / lifetime_years

    numerator = discount_rate * ((1 + discount_rate) ** lifetime_years)
    denominator = ((1 + discount_rate) ** lifetime_years) - 1

    return numerator / denominator