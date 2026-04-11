import json
import re
import base64
import logging
from typing import Any
import google.generativeai as genai
from app.config import get_settings
from app.prompts.voice_prompt import VOICE_TO_PRODUCT_SYSTEM_PROMPT, build_voice_prompt
from app.prompts.refiner_prompt import REFINER_SYSTEM_PROMPT, build_refiner_prompt
from app.prompts.caption_prompt import CAPTION_SYSTEM_PROMPT, build_caption_prompt
from app.prompts.poster_prompt import (
    POSTER_SYSTEM_PROMPT, build_poster_prompt, build_poster_image_prompt,
)

logger = logging.getLogger(__name__)
settings = get_settings()

# Khởi tạo Gemini một lần
genai.configure(api_key=settings.gemini_api_key)

# Cấu hình generation — quan trọng cho JSON output
GENERATION_CONFIG = genai.types.GenerationConfig(
    temperature=0.3,        # Thấp = ít sáng tạo, cao = output ổn định, nhất quán
    top_p=0.8,
    top_k=10,
    max_output_tokens=2048,
    response_mime_type="application/json",  # Buộc Gemini trả về JSON (Gemini 1.5+)
)

SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]


def _get_model() -> genai.GenerativeModel:
    return genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config=GENERATION_CONFIG,
        safety_settings=SAFETY_SETTINGS,
        system_instruction=VOICE_TO_PRODUCT_SYSTEM_PROMPT,
    )


def _extract_json(text: str) -> dict:
    """
    Robust JSON extraction — xử lý khi Gemini có thể bọc trong ```json ... ```
    """
    # Thử parse trực tiếp trước
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Thử extract từ markdown code block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Thử tìm JSON object trong text
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Không thể parse JSON từ response: {text[:200]}")


# ═══════════════════════════════════════════════════
#  Voice-to-Product
# ═══════════════════════════════════════════════════

async def extract_product_from_transcript(transcript: str) -> dict[str, Any]:
    """
    Gọi Gemini để trích xuất thông tin sản phẩm từ transcript.
    Retry tối đa 2 lần nếu JSON parse thất bại.
    """
    model = _get_model()
    prompt = build_voice_prompt(transcript)

    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            raw_text = response.text
            logger.debug(f"Gemini raw response (attempt {attempt+1}): {raw_text[:300]}")
            result = _extract_json(raw_text)
            return result
        except ValueError as e:
            logger.warning(f"JSON parse failed attempt {attempt+1}: {e}")
            if attempt == 2:
                raise
        except Exception as e:
            logger.error(f"Gemini API error attempt {attempt+1}: {e}")
            if attempt == 2:
                raise

    raise RuntimeError("Tất cả attempts thất bại")


# ═══════════════════════════════════════════════════
#  AI Refiner
# ═══════════════════════════════════════════════════

async def refine_description(raw_desc: str, product_name: str | None = None) -> dict[str, Any]:
    """Gọi Gemini để chuẩn hoá mô tả sản phẩm."""
    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config=GENERATION_CONFIG,
        system_instruction=REFINER_SYSTEM_PROMPT,
    )
    prompt = build_refiner_prompt(raw_desc, product_name)
    response = model.generate_content(prompt)
    return _extract_json(response.text)


# ═══════════════════════════════════════════════════
#  Caption Generator v2
# ═══════════════════════════════════════════════════

async def generate_captions(product_name: str, description: str,
                            province: str | None = None,
                            style: str | None = None) -> dict[str, Any]:
    """Gọi Gemini để tạo 3 caption theo phong cách khác nhau."""
    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config=genai.types.GenerationConfig(
            temperature=0.8,   # Cao hơn để caption creative hơn
            top_p=0.9,
            max_output_tokens=4096,
            response_mime_type="application/json",
        ),
        system_instruction=CAPTION_SYSTEM_PROMPT,
    )
    prompt = build_caption_prompt(product_name, description, province, style)
    response = model.generate_content(prompt)
    return _extract_json(response.text)


# ═══════════════════════════════════════════════════
#  Poster Content Generator
# ═══════════════════════════════════════════════════

async def generate_poster_content(
    product_name: str,
    description: str | None = None,
    province: str | None = None,
    price_display: str | None = None,
    shop_name: str | None = None,
    template: str = "FRESH_GREEN",
) -> dict[str, Any]:
    """Gọi Gemini để tạo nội dung text cho poster (FE sẽ render HTML)."""
    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config=genai.types.GenerationConfig(
            temperature=0.7,
            max_output_tokens=2048,
            response_mime_type="application/json",
        ),
        system_instruction=POSTER_SYSTEM_PROMPT,
    )
    prompt = build_poster_prompt(product_name, description, province,
                                price_display, shop_name, template)
    response = model.generate_content(prompt)
    return _extract_json(response.text)


# ═══════════════════════════════════════════════════
#  Poster AI Image Generator (Gemini Imagen)
# ═══════════════════════════════════════════════════

async def generate_poster_image(
    product_name: str,
    description: str | None = None,
    province: str | None = None,
    price_display: str | None = None,
    shop_name: str | None = None,
) -> dict[str, Any]:
    """
    Dùng Gemini image generation để tạo poster hoàn chỉnh.
    Trả về base64 image nếu thành công.
    Fallback: trả về lỗi nếu model không hỗ trợ image generation.
    """
    prompt = build_poster_image_prompt(product_name, description, province,
                                       price_display, shop_name)
    try:
        # Gemini 2.0 Flash supports image generation
        model = genai.GenerativeModel(model_name="gemini-2.0-flash-exp")

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )

        # Extract image from response parts
        for part in response.candidates[0].content.parts:
            if hasattr(part, "inline_data") and part.inline_data is not None:
                image_data = part.inline_data.data
                mime_type = part.inline_data.mime_type or "image/png"
                return {
                    "image_base64": base64.b64encode(image_data).decode("utf-8"),
                    "mime_type": mime_type,
                    "prompt_used": prompt,
                    "fallback": False,
                }

        # No image in response — fallback
        logger.warning("Gemini did not return image data, falling back")
        return {
            "image_base64": None,
            "mime_type": "image/png",
            "prompt_used": prompt,
            "fallback": True,
            "error": "Model không trả về ảnh. Hãy dùng chế độ HTML template.",
        }

    except Exception as e:
        logger.error(f"Poster image generation failed: {e}")
        return {
            "image_base64": None,
            "mime_type": "image/png",
            "prompt_used": prompt,
            "fallback": True,
            "error": str(e),
        }