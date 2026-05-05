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
    block_count: int | None = None
    mass_per_block_kg: float | None = None
    usable_height_fraction: float = 1.0
    structure_cost_per_meter: float = 0.0
    usable_depth_fraction: float = 1.0
    shaft_rehabilitation_cost: float = 0.0
    material_density_kg_m3: float | None = None
    container_volume_m3: float | None = None


@dataclass(frozen=True, init=False)
class LossScenario:
    additional_cycle_loss_fraction: float = 0.0
    fixed_cycle_loss_kwh: float = 0.0
    standby_loss_stored_kwh_per_hour: float = 0.0

    def __init__(
        self,
        additional_cycle_loss_fraction: float = 0.0,
        fixed_cycle_loss_kwh: float = 0.0,
        standby_loss_stored_kwh_per_hour: float = 0.0,
        *,
        cycle_loss_fraction: float | None = None,
        standby_loss_kwh_per_hour: float | None = None,
    ):
        if cycle_loss_fraction is not None:
            additional_cycle_loss_fraction = cycle_loss_fraction

        if standby_loss_kwh_per_hour is not None:
            standby_loss_stored_kwh_per_hour = standby_loss_kwh_per_hour

        object.__setattr__(
            self,
            "additional_cycle_loss_fraction",
            additional_cycle_loss_fraction,
        )
        object.__setattr__(self, "fixed_cycle_loss_kwh", fixed_cycle_loss_kwh)
        object.__setattr__(
            self,
            "standby_loss_stored_kwh_per_hour",
            standby_loss_stored_kwh_per_hour,
        )

    @property
    def cycle_loss_fraction(self) -> float:
        return self.additional_cycle_loss_fraction

    @property
    def standby_loss_kwh_per_hour(self) -> float:
        return self.standby_loss_stored_kwh_per_hour


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
