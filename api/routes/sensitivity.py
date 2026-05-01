from fastapi import APIRouter, HTTPException

from api.schemas.analysis import SensitivityRequest, SensitivityResponse
from api.services.analysis_service import AnalysisService


router = APIRouter(
    prefix="/sensitivity",
    tags=["Sensitivity"]
)

analysis_service = AnalysisService()


@router.post("", response_model=SensitivityResponse)
def sensitivity(request: SensitivityRequest):
    try:
        results = analysis_service.run_sensitivity_analysis(
            base_scenario_request=request.base_scenario,
            parameter_path=request.parameter_path,
            min_val=request.min_val,
            max_val=request.max_val,
            steps=request.steps,
        )

        return SensitivityResponse(
            success=True,
            parameter=request.parameter_path,
            results=results,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )