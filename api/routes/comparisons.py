from fastapi import APIRouter, HTTPException

from api.schemas.analysis import ComparisonRequest, ComparisonResponse
from api.services.simulation_service import SimulationService
from sges.core.exceptions import InvalidParameterError


router = APIRouter(
    prefix="/compare",
    tags=["Comparison"]
)

simulation_service = SimulationService()


@router.post("", response_model=ComparisonResponse)
def compare(request: ComparisonRequest):
    try:
        results = simulation_service.run_comparison(request.scenarios)

        return ComparisonResponse(
            success=True,
            results=results,
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
