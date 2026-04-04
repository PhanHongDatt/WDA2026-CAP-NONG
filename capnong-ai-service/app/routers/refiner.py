from fastapi import APIRouter, HTTPException
from app.schemas.voice_schema import RefineRequest, RefineResponse
from app.services.gemini_service import refine_description

router = APIRouter(prefix="/ai", tags=["AI Features"])


@router.post("/refine-description", response_model=RefineResponse)
async def refine_desc(request: RefineRequest) -> RefineResponse:
    try:
        result = await refine_description(request.raw_description, request.product_name)
        return RefineResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))