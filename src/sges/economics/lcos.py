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
    annual_charging_energy_cost: float = 0.0
    replacement_cost: float = 0.0
    replacement_year: int | None = None
    end_of_life_cost: float = 0.0


@dataclass(frozen=True)
class LcosResult:
    lcos_per_mwh: float
    discounted_cost: float
    discounted_energy_mwh: float
    discounted_opex: float = 0.0
    discounted_charging_energy_cost: float = 0.0
    discounted_replacement_cost: float = 0.0
    discounted_end_of_life_cost: float = 0.0


def calculate_lcos(data: LcosInput) -> LcosResult:
    if data.initial_capex < 0:
        raise InvalidParameterError("initial_capex must be greater than or equal to zero")

    if data.annual_opex < 0:
        raise InvalidParameterError("annual_opex must be greater than or equal to zero")

    if data.annual_charging_energy_cost < 0:
        raise InvalidParameterError(
            "annual_charging_energy_cost must be greater than or equal to zero"
        )

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

    if data.replacement_year is not None and not (
        1 <= data.replacement_year <= data.project_lifetime_years
    ):
        raise InvalidParameterError(
            "replacement_year must be between 1 and project_lifetime_years"
        )

    discounted_cost = data.initial_capex
    discounted_opex = 0.0
    discounted_charging_energy_cost = 0.0
    discounted_replacement_cost = 0.0
    discounted_energy_mwh = 0.0

    for year in range(1, data.project_lifetime_years + 1):
        annual_opex_pv = present_value(
            data.annual_opex,
            year,
            data.discount_rate,
        )
        annual_charging_cost_pv = present_value(
            data.annual_charging_energy_cost,
            year,
            data.discount_rate,
        )

        discounted_opex += annual_opex_pv
        discounted_charging_energy_cost += annual_charging_cost_pv
        discounted_cost += annual_opex_pv + annual_charging_cost_pv

        discounted_energy_mwh += present_value(
            data.annual_discharged_energy_mwh,
            year,
            data.discount_rate,
        )

        if data.replacement_year == year:
            replacement_cost_pv = present_value(
                data.replacement_cost,
                year,
                data.discount_rate,
            )
            discounted_replacement_cost += replacement_cost_pv
            discounted_cost += replacement_cost_pv

    discounted_end_of_life_cost = present_value(
        data.end_of_life_cost,
        data.project_lifetime_years,
        data.discount_rate,
    )
    discounted_cost += discounted_end_of_life_cost

    return LcosResult(
        lcos_per_mwh=discounted_cost / discounted_energy_mwh,
        discounted_cost=discounted_cost,
        discounted_energy_mwh=discounted_energy_mwh,
        discounted_opex=discounted_opex,
        discounted_charging_energy_cost=discounted_charging_energy_cost,
        discounted_replacement_cost=discounted_replacement_cost,
        discounted_end_of_life_cost=discounted_end_of_life_cost,
    )
