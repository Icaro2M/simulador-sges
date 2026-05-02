from typing import Dict, List

from pydantic import BaseModel, Field

from api.schemas.scenario import SimulationRequest


class ComparisonRequest(BaseModel):
    scenarios: List[SimulationRequest] = Field(min_length=2)


class ComparisonResultItem(BaseModel):
    scenario_name: str
    technology_name: str
    stored_energy_kwh: float
    required_charge_energy_kwh: float
    delivered_energy_kwh: float
    charge_efficiency: float
    discharge_efficiency: float
    round_trip_efficiency: float
    nominal_power_kw: float
    initial_capex: float
    annual_opex: float
    annual_discharged_energy_mwh: float
    lcos_per_mwh: float | None


class ComparisonResponse(BaseModel):
    success: bool
    results: List[ComparisonResultItem]


class SensitivityRequest(BaseModel):
    base_scenario: SimulationRequest
    parameter_path: str
    min_val: float
    max_val: float
    steps: int = Field(gt=0)


class SensitivityResultItem(BaseModel):
    parameter: str
    value: float
    lcos: float | None
    capex: float
    annual_energy_mwh: float


class SensitivityResponse(BaseModel):
    success: bool
    parameter: str
    results: List[SensitivityResultItem]


class MonteCarloRequest(BaseModel):
    base_scenario: SimulationRequest
    parameter_ranges: Dict[str, tuple[float, float]]
    iterations: int = Field(gt=0)
    seed: int | None = None


class MonteCarloResultItem(BaseModel):
    iteration: int
    sampled_values: Dict[str, float]
    lcos: float | None
    capex: float
    annual_energy_mwh: float
    round_trip_efficiency: float


class MonteCarloResponse(BaseModel):
    success: bool
    iterations: int
    results: List[MonteCarloResultItem]
