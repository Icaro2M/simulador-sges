from dataclasses import dataclass

from sges.core.exceptions import InvalidParameterError


@dataclass(frozen=True)
class TechnologyScenario:
    type: str
    mass_kg: float
    height_m: float
    charge_efficiency: float
    discharge_efficiency: float
    nominal_power_kw: float | None = None
    charge_power_kw: float | None = None
    discharge_power_kw: float | None = None


@dataclass(frozen=True)
class LossScenario:
    cycle_loss_fraction: float = 0.0
    fixed_cycle_loss_kwh: float = 0.0
    standby_loss_kwh_per_hour: float = 0.0


@dataclass(frozen=True)
class EconomicScenario:
    cost_per_kw: float
    cost_per_kwh: float
    fixed_capex: float
    fixed_annual_opex: float
    variable_opex_per_mwh: float
    project_lifetime_years: int
    discount_rate: float
    cycles_per_year: int
    charging_energy_cost_per_mwh: float = 0.0
    availability_factor: float = 1.0
    replacement_cost: float = 0.0
    replacement_year: int | None = None
    end_of_life_cost: float = 0.0

    def __post_init__(self):
        if not 0 <= self.availability_factor <= 1:
            raise InvalidParameterError("availability_factor must be between 0 and 1")

        if self.replacement_cost < 0:
            raise InvalidParameterError(
                "replacement_cost must be greater than or equal to zero"
            )

        if self.end_of_life_cost < 0:
            raise InvalidParameterError(
                "end_of_life_cost must be greater than or equal to zero"
            )

        if self.replacement_year is not None and not (
            1 <= self.replacement_year <= self.project_lifetime_years
        ):
            raise InvalidParameterError(
                "replacement_year must be between 1 and project_lifetime_years"
            )


@dataclass(frozen=True)
class Scenario:
    name: str
    technology: TechnologyScenario
    economics: EconomicScenario
    losses: LossScenario = LossScenario()
