from fastapi import APIRouter, HTTPException
from app.schemas.marketing_schema import CaptionRequest, CaptionResponse, CaptionItem
from app.services.gemini_service import generate_captions

router = APIRouter(prefix="/ai", tags=["AI Marketing"])


@router.post("/generate-caption", response_model=CaptionResponse)
async def gen_caption(request: CaptionRequest) -> CaptionResponse:
    """
    Tạo 3 caption theo 3 phong cách (FUNNY, RUSTIC, PROFESSIONAL).
    Hỗ trợ tỉnh/thành để caption mang tính địa phương.
    """
    try:
        result = await generate_captions(
            product_name=request.product_name,
            description=request.description,
            province=request.province,
            style=request.style.value if request.style else None,
        )

        # Normalize response format
        captions = []
        if "captions" in result:
            for c in result["captions"]:
                captions.append(CaptionItem(style=c.get("style", ""), text=c.get("text", "")))
        else:
            # Legacy format: {funny, authentic, professional}
            for style_key in ["funny", "authentic", "professional", "FUNNY", "RUSTIC", "PROFESSIONAL"]:
                if style_key in result:
                    captions.append(CaptionItem(
                        style=style_key.upper().replace("AUTHENTIC", "RUSTIC"),
                        text=result[style_key]
                    ))

        hashtags = result.get("hashtags", [])

        return CaptionResponse(captions=captions, hashtags=hashtags)

    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))