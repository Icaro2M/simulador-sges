from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class TechnologyResult:
    technology_name: str
    max_potential_energy_kwh: float
    input_energy_kwh: float
    stored_energy_kwh: float
    required_charge_energy_kwh: float
    technical_delivered_energy_kwh: float
    delivered_energy_kwh: float
    charge_efficiency: float
    discharge_efficiency: float
    round_trip_efficiency: float
    nominal_power_kw: float
    charge_power_kw: float
    discharge_power_kw: float
    charge_time_h: float
    discharge_time_h: float


class GravityStorageTechnology(ABC):
    @abstractmethod
    def simulate(self) -> TechnologyResult:
        pass
