from typing import Any, Dict

from pydantic import BaseModel


class SimulationResponse(BaseModel):
    success: bool
    scenario_name: str
    result: Dict[str, Any]