from fastapi import APIRouter, HTTPException
from app.schemas.voice_schema import CaptionRequest, CaptionResponse
from app.services.gemini_service import generate_captions

router = APIRouter(prefix="/ai", tags=["AI Features"])


@router.post("/generate-caption", response_model=CaptionResponse)
async def gen_caption(request: CaptionRequest) -> CaptionResponse:
    try:
        result = await generate_captions(request.product_name, request.description)
        return CaptionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))