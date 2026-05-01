from typing import Any, Dict, List

from pydantic import BaseModel, Field

from api.schemas.scenario import SimulationRequest


class PricePoint(BaseModel):
    hour: int
    price: float


class DispatchRequest(BaseModel):
    scenario: SimulationRequest
    price_profile: List[PricePoint]

    low_price_threshold: float
    high_price_threshold: float
    initial_soc_kwh: float = Field(default=0.0, ge=0)


class DispatchResponse(BaseModel):
    success: bool
    results: List[Dict[str, Any]]