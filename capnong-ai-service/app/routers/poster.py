from fastapi import APIRouter, HTTPException
from app.schemas.marketing_schema import (
    PosterContentRequest, PosterContentResponse, ColorScheme,
    RemoveBgRequest, RemoveBgResponse,
    PosterImageRequest, PosterImageResponse,
)
from app.services.gemini_service import generate_poster_content, generate_poster_image
from app.services.rembg_service import remove_background

router = APIRouter(prefix="/ai", tags=["AI Marketing"])


@router.post("/poster-content", response_model=PosterContentResponse)
async def gen_poster_content(request: PosterContentRequest) -> PosterContentResponse:
    """
    Sinh NỘI DUNG TEXT cho poster (FE sẽ render HTML template).
    Gemini tạo headline, tagline, price, badges, CTA, color scheme.
    """
    try:
        result = await generate_poster_content(
            product_name=request.product_name,
            description=request.description,
            province=request.province,
            price_display=request.price_display,
            shop_name=request.shop_name,
            template=request.template.value,
        )

        # Parse color scheme
        cs = result.get("color_scheme", {})
        color_scheme = ColorScheme(
            primary=cs.get("primary", "#2d6a4f"),
            accent=cs.get("accent", "#95d5b2"),
            text_on_primary=cs.get("text_on_primary", "#ffffff"),
            background=cs.get("background", "#f0f7f4"),
        )

        return PosterContentResponse(
            template=result.get("template", request.template.value),
            headline=result.get("headline", request.product_name),
            tagline=result.get("tagline", ""),
            price_display=result.get("price_display", request.price_display or ""),
            badge_texts=result.get("badge_texts", []),
            shop_display=result.get("shop_display", request.shop_name or ""),
            cta_text=result.get("cta_text", "Đặt hàng ngay!"),
            color_scheme=color_scheme,
        )

    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/remove-bg", response_model=RemoveBgResponse)
async def remove_bg(request: RemoveBgRequest) -> RemoveBgResponse:
    """
    Xóa background ảnh sản phẩm (Clipdrop API).
    Fallback: trả về ảnh gốc nếu Clipdrop không khả dụng.
    """
    try:
        result = await remove_background(request.image_url)
        return RemoveBgResponse(
            original_url=result["original_url"],
            no_bg_url=result.get("no_bg_url"),
            fallback=result.get("fallback", False),
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/poster-image", response_model=PosterImageResponse)
async def gen_poster_image(request: PosterImageRequest) -> PosterImageResponse:
    """
    Tạo poster bằng AI generative image (Gemini 2.0 Flash).
    Trả về base64 image hoặc fallback error nếu model không hỗ trợ.
    """
    try:
        result = await generate_poster_image(
            product_name=request.product_name,
            description=request.description,
            province=request.province,
            price_display=request.price_display,
            shop_name=request.shop_name,
            image_model=request.image_model,
        )
        return PosterImageResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
