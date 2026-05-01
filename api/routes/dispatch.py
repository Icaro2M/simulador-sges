from fastapi import APIRouter, HTTPException

from api.schemas.dispatch import DispatchRequest, DispatchResponse
from api.services.dispatch_service import DispatchService
from sges.core.exceptions import InvalidParameterError


router = APIRouter(
    prefix="/dispatch",
    tags=["Dispatch"]
)

dispatch_service = DispatchService()


@router.post("", response_model=DispatchResponse)
def dispatch(request: DispatchRequest):
    try:
        results = dispatch_service.run_dispatch(request)

        return DispatchResponse(
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
