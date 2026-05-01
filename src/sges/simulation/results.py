from dataclasses import dataclass

from sges.technologies.base import TechnologyResult
from sges.economics.lcos import LcosResult


@dataclass(frozen=True)
class SimulationResult:
    scenario_name: str
    technology_result: TechnologyResult
    effective_delivered_energy_kwh: float
    standby_hours_per_cycle: float
    standby_loss_per_cycle_kwh: float
    annual_standby_loss_kwh: float
    status: str
    warnings: list[str]
    initial_capex: float
    annual_opex: float
    annual_discharged_energy_mwh: float
    lcos_result: LcosResult | None
