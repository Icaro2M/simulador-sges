from dataclasses import dataclass

from sges.technologies.base import TechnologyResult
from sges.economics.lcos import LcosResult


@dataclass(frozen=True)
class SimulationResult:
    scenario_name: str
    technology_result: TechnologyResult
    initial_capex: float
    annual_opex: float
    annual_discharged_energy_mwh: float
    lcos_result: LcosResult