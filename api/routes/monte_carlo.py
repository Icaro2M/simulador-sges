from fastapi import APIRouter, HTTPException

from api.schemas.analysis import MonteCarloRequest, MonteCarloResponse
from api.services.analysis_service import AnalysisService


router = APIRouter(
    prefix="/monte-carlo",
    tags=["Monte Carlo"]
)

analysis_service = AnalysisService()


@router.post("", response_model=MonteCarloResponse)
def monte_carlo(request: MonteCarloRequest):
    try:
        results = analysis_service.run_monte_carlo_analysis(
            base_scenario_request=request.base_scenario,
            parameter_ranges=request.parameter_ranges,
            iterations=request.iterations,
            seed=request.seed,
        )

        return MonteCarloResponse(
            success=True,
            iterations=request.iterations,
            results=results,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )