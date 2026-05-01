from dataclasses import dataclass

from sges.core.exceptions import InvalidParameterError
from sges.economics.finance import present_value


@dataclass(frozen=True)
class LcosInput:
    initial_capex: float
    annual_opex: float
    annual_discharged_energy_mwh: float
    project_lifetime_years: int
    discount_rate: float
    replacement_cost: float = 0.0
    replacement_year: int | None = None
    end_of_life_cost: float = 0.0


@dataclass(frozen=True)
class LcosResult:
    lcos_per_mwh: float
    discounted_cost: float
    discounted_energy_mwh: float


def calculate_lcos(data: LcosInput) -> LcosResult:
    if data.initial_capex < 0:
        raise InvalidParameterError("initial_capex must be greater than or equal to zero")

    if data.annual_opex < 0:
        raise InvalidParameterError("annual_opex must be greater than or equal to zero")

    if data.annual_discharged_energy_mwh <= 0:
        raise InvalidParameterError("annual_discharged_energy_mwh must be greater than zero")

    if data.project_lifetime_years <= 0:
        raise InvalidParameterError("project_lifetime_years must be greater than zero")

    if data.discount_rate < 0:
        raise InvalidParameterError("discount_rate must be greater than or equal to zero")

    if data.replacement_cost < 0:
        raise InvalidParameterError("replacement_cost must be greater than or equal to zero")

    if data.end_of_life_cost < 0:
        raise InvalidParameterError("end_of_life_cost must be greater than or equal to zero")

    discounted_cost = data.initial_capex
    discounted_energy_mwh = 0.0

    for year in range(1, data.project_lifetime_years + 1):
        discounted_cost += present_value(
            data.annual_opex,
            year,
            data.discount_rate,
        )

        discounted_energy_mwh += present_value(
            data.annual_discharged_energy_mwh,
            year,
            data.discount_rate,
        )

        if data.replacement_year == year:
            discounted_cost += present_value(
                data.replacement_cost,
                year,
                data.discount_rate,
            )

    discounted_cost += present_value(
        data.end_of_life_cost,
        data.project_lifetime_years,
        data.discount_rate,
    )

    return LcosResult(
        lcos_per_mwh=discounted_cost / discounted_energy_mwh,
        discounted_cost=discounted_cost,
        discounted_energy_mwh=discounted_energy_mwh,
    )