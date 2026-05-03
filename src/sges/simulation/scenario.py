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

    def __post_init__(self):
        if not 0 <= self.availability_factor <= 1:
            raise InvalidParameterError("availability_factor must be between 0 and 1")


@dataclass(frozen=True)
class Scenario:
    name: str
    technology: TechnologyScenario
    economics: EconomicScenario
    losses: LossScenario = LossScenario()
