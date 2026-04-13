import logging
import httpx
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

CLIPDROP_REMOVE_BG_URL = "https://clipdrop-api.co/remove-background/v1"


async def remove_background(image_url: str) -> dict:
    """
    Xóa background ảnh sản phẩm bằng Clipdrop API.

    Fallback: nếu chưa có API key hoặc request thất bại,
    trả về ảnh gốc và đánh dấu fallback=True.
    """
    if not settings.has_clipdrop:
        logger.info("Clipdrop API key not configured — returning original image")
        return {
            "original_url": image_url,
            "no_bg_url": None,
            "fallback": True,
        }

    try:
        # Download image
        async with httpx.AsyncClient(timeout=30.0) as client:
            img_response = await client.get(image_url)
            img_response.raise_for_status()
            image_bytes = img_response.content

        # Call Clipdrop
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                CLIPDROP_REMOVE_BG_URL,
                headers={"x-api-key": settings.clipdrop_api_key},
                files={"image_file": ("product.jpg", image_bytes, "image/jpeg")},
            )
            response.raise_for_status()

        # Clipdrop returns image bytes directly
        import base64
        no_bg_base64 = base64.b64encode(response.content).decode("utf-8")

        logger.info("Background removed successfully for %s", image_url)
        return {
            "original_url": image_url,
            "no_bg_base64": no_bg_base64,
            "no_bg_url": None,  # FE will upload base64 to Cloudinary
            "fallback": False,
        }

    except Exception as e:
        logger.warning("Clipdrop remove-bg failed: %s — using fallback", e)
        return {
            "original_url": image_url,
            "no_bg_url": None,
            "fallback": True,
            "error": str(e),
        }
