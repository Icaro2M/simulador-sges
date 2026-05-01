from fastapi import APIRouter, HTTPException

from api.schemas.scenario import SimulationRequest
from api.schemas.simulation import SimulationResponse
from api.services.simulation_service import SimulationService
from sges.core.exceptions import InvalidParameterError


router = APIRouter(
    prefix="/simulate",
    tags=["Simulation"]
)

simulation_service = SimulationService()


@router.post("", response_model=SimulationResponse)
def simulate(request: SimulationRequest):
    try:
        result = simulation_service.run_simulation(request)

        return SimulationResponse(
            success=True,
            scenario_name=request.name,
            result=result,
        )

    except InvalidParameterError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )
