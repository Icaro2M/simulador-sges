from dataclasses import dataclass

from sges.technologies.base import TechnologyResult
from sges.economics.lcos import LcosResult


@dataclass(frozen=True)
class SimulationResult:
    scenario_name: str
    technology_result: TechnologyResult
    available_energy_kwh: float
    gross_delivered_energy_kwh: float
    effective_delivered_energy_kwh: float
    standby_output_loss_per_cycle_kwh: float
    fractional_cycle_loss_per_cycle_kwh: float
    fixed_cycle_loss_per_cycle_kwh: float
    cycle_loss_per_cycle_kwh: float
    total_loss_per_cycle_kwh: float
    effective_round_trip_efficiency: float
    standby_hours_per_cycle: float
    standby_loss_per_cycle_kwh: float
    annual_standby_loss_kwh: float
    status: str
    warnings: list[str]
    initial_capex: float
    availability_factor: float
    annual_discharged_energy_before_availability_mwh: float
    replacement_cost: float
    replacement_year: int | None
    end_of_life_cost: float
    annual_opex: float
    annual_discharged_energy_mwh: float
    annual_charging_energy_mwh: float
    annual_charging_energy_cost: float
    annual_lcos_cost: float
    lcos_result: LcosResult | None
    base_capex: float = 0.0
    technology_specific_capex: float = 0.0
    tower_structure_cost: float = 0.0
    shaft_rehabilitation_cost: float = 0.0
