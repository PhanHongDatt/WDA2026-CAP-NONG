import logging
import httpx
import base64
import asyncio

logger = logging.getLogger(__name__)

async def remove_background(image_url: str) -> dict:
    """
    Xóa background ảnh sản phẩm bằng thư viện rembg (chạy hoàn toàn local, miễn phí).

    Fallback: nếu request tải ảnh thất bại, hoặc quá trình xử lý lỗi,
    trả về ảnh gốc và đánh dấu fallback=True.
    """
    try:
        # Download image
        async with httpx.AsyncClient(timeout=30.0) as client:
            img_response = await client.get(image_url)
            img_response.raise_for_status()
            image_bytes = img_response.content

        # Import trễ rembg vì khởi tạo U2Net model mất thời gian
        from rembg import remove
        
        # rembg.remove block thread nên chạy trong threadpool để không block async event loop
        no_bg_bytes = await asyncio.to_thread(remove, image_bytes)

        # Convert to base64
        no_bg_base64 = base64.b64encode(no_bg_bytes).decode("utf-8")

        logger.info("Background removed successfully using rembg for %s", image_url)
        return {
            "original_url": image_url,
            "no_bg_base64": no_bg_base64,
            "no_bg_url": None,  # FE will upload base64 to Cloudinary
            "fallback": False,
        }

    except Exception as e:
        logger.warning("Rembg remove-bg failed: %s — using fallback", e)
        return {
            "original_url": image_url,
            "no_bg_url": None,
            "fallback": True,
            "error": str(e),
        }
