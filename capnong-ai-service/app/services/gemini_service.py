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
#  Step 1: Re-prompt — enhance user input to pro prompt
#  Step 2: Generate image with enhanced prompt
# ═══════════════════════════════════════════════════

RE_PROMPT_SYSTEM = """You are an expert prompt engineer for AI image generation.
You work EXCLUSIVELY for "Cạp Nông" — a Vietnamese agricultural e-commerce platform.

Your ONLY job: Transform a basic Vietnamese farm product name into a DETAILED image generation prompt.

═══ ABSOLUTE RULES (VIOLATION = FAILURE) ═══
1. The image MUST show the ACTUAL agricultural product (fruit, vegetable, rice, spice, etc.)
   - "Cam Sành" → must show fresh oranges (Citrus reticulata), NOT juice, NOT cosmetics
   - "Xoài Cát" → must show fresh mangoes on a surface, NOT mango smoothie
   - "Gạo ST25" → must show raw rice grains or rice bag
2. NEVER generate: cosmetics, skincare, beverages, processed food, houses, cars, people, animals
3. The product must be the HERO of the image — center frame, occupying 40-60% of the poster
4. Vietnamese text on the poster must be wrapped in double quotes for correct diacritics rendering
5. Background: clean studio setup OR Vietnamese farm/garden setting (lush green, tropical)
6. Photography style: commercial food photography, appetizing, high-key lighting
7. Aspect ratio: MUST be 1:1 SQUARE format (equal width and height)

═══ OUTPUT FORMAT ═══
- Output ONLY the enhanced prompt text, no JSON, no markdown, no explanation
- Write in ENGLISH (image models work best with English)
- When referencing Vietnamese product names, always wrap them in double quotes. Example: The text "Cam Sành Vĩnh Long" should appear on the poster.
- Max 150 words
- ALWAYS start with: "Square 1:1 commercial food photography poster of [exact product]"
"""


async def enhance_prompt_for_image(
    product_name: str,
    description: str | None = None,
    province: str | None = None,
    price_display: str | None = None,
    shop_name: str | None = None,
) -> str:
    """Step 1: Use Gemini text model to re-prompt user's basic input into a pro-grade image gen prompt."""
    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config=genai.types.GenerationConfig(
            temperature=0.4,
            max_output_tokens=400,
        ),
        system_instruction=RE_PROMPT_SYSTEM,
    )

    user_input = f"""Vietnamese agricultural product: "{product_name}"
Category: Fresh fruit / vegetable / farm produce (NOT processed, NOT beverage, NOT cosmetics)
Origin province: {province or 'Vietnam'}
Price: {price_display or 'Market price'}
Shop: {shop_name or 'Cạp Nông'}

Create an image generation prompt for a SQUARE 1:1 MARKETING POSTER that:
- Shows REAL fresh "{product_name}" as the main subject (the actual fruit/vegetable, NOT a drink or processed product)
- Has Vietnamese text "{product_name}" in double quotes on the poster for correct diacritics rendering
- Square 1:1 aspect ratio (equal width and height)
- Clean poster layout suitable for social media advertising
- Vietnamese tropical farm aesthetic"""

    response = model.generate_content(user_input)
    enhanced = response.text.strip()
    logger.info(f"Enhanced prompt ({len(enhanced)} chars): {enhanced[:200]}...")
    return enhanced



# Supported models catalog
SUPPORTED_IMAGE_MODELS = {
    # Gemini models (generateContent API)
    "gemini-2.5-flash-image": {"type": "gemini", "name": "Gemini 2.5 Flash Image"},
    "gemini-3.1-flash-image-preview": {"type": "gemini", "name": "Nano Banana 2 (3.1 Flash)"},
    "gemini-3-pro-image-preview": {"type": "gemini", "name": "Nano Banana Pro"},
    # Imagen models (predict API)
    "imagen-4.0-generate-001": {"type": "imagen", "name": "Imagen 4"},
    "imagen-4.0-ultra-generate-001": {"type": "imagen", "name": "Imagen 4 Ultra"},
    "imagen-4.0-fast-generate-001": {"type": "imagen", "name": "Imagen 4 Fast"},
    # Grok models (xAI OpenAI-compatible API)
    "grok-imagine-image-pro": {"type": "grok", "name": "Grok Image Pro"},
    "grok-imagine-image": {"type": "grok", "name": "Grok Image"},
}


async def generate_poster_image(
    product_name: str,
    description: str | None = None,
    province: str | None = None,
    price_display: str | None = None,
    shop_name: str | None = None,
    image_model: str | None = None,
) -> dict[str, Any]:
    """
    Multi-model poster image generation:
    1. Re-prompt: Enhance user's basic input → pro image gen prompt
    2. Generate: Call selected model (Gemini or Imagen) with enhanced prompt
    """
    import httpx

    # Resolve model
    model_id = image_model or settings.gemini_image_model
    model_info = SUPPORTED_IMAGE_MODELS.get(model_id, {"type": "gemini", "name": model_id})
    model_type = model_info["type"]
    logger.info(f"Image gen model: {model_id} ({model_info['name']}, type={model_type})")

    # Step 1: Re-prompt
    try:
        enhanced_prompt = await enhance_prompt_for_image(
            product_name, description, province, price_display, shop_name
        )
    except Exception as e:
        logger.warning(f"Re-prompt failed, using fallback: {e}")
        enhanced_prompt = build_poster_image_prompt(
            product_name, description, province, price_display, shop_name
        )

    original_prompt = build_poster_image_prompt(
        product_name, description, province, price_display, shop_name
    )

    # Step 2: Generate image
    try:
        if model_type == "imagen":
            return await _generate_with_imagen(
                model_id, enhanced_prompt, original_prompt
            )
        elif model_type == "grok":
            return await _generate_with_grok(
                model_id, enhanced_prompt, original_prompt
            )
        else:
            return await _generate_with_gemini(
                model_id, enhanced_prompt, original_prompt
            )

    except httpx.HTTPStatusError as e:
        error_body = e.response.text[:500] if e.response else str(e)
        logger.error(f"Image API HTTP error ({model_id}): {error_body}")
        return {
            "image_base64": None, "mime_type": "image/png",
            "prompt_used": enhanced_prompt, "original_prompt": original_prompt,
            "model_used": model_id, "fallback": True,
            "error": f"API error ({model_id}): {error_body}",
        }
    except Exception as e:
        logger.error(f"Image generation failed ({model_id}): {e}")
        return {
            "image_base64": None, "mime_type": "image/png",
            "prompt_used": enhanced_prompt, "original_prompt": original_prompt,
            "model_used": model_id, "fallback": True,
            "error": str(e),
        }


async def _generate_with_gemini(
    model_id: str, prompt: str, original_prompt: str
) -> dict[str, Any]:
    """Generate image using Gemini generateContent API (supports responseModalities)."""
    import httpx

    api_url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model_id}:generateContent?key={settings.gemini_api_key}"
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"],
            "temperature": 0.8,
            "maxOutputTokens": 8192,
        },
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(api_url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    candidates = data.get("candidates", [])
    if candidates:
        parts = candidates[0].get("content", {}).get("parts", [])
        for part in parts:
            inline_data = part.get("inlineData")
            if inline_data and inline_data.get("data"):
                return {
                    "image_base64": inline_data["data"],
                    "mime_type": inline_data.get("mimeType", "image/png"),
                    "prompt_used": prompt,
                    "original_prompt": original_prompt,
                    "model_used": model_id,
                    "fallback": False,
                }

    # No image returned
    text_parts = []
    if candidates:
        for part in candidates[0].get("content", {}).get("parts", []):
            if "text" in part:
                text_parts.append(part["text"])

    return {
        "image_base64": None, "mime_type": "image/png",
        "prompt_used": prompt, "original_prompt": original_prompt,
        "model_used": model_id, "fallback": True,
        "error": "Model không trả về ảnh. " + (" ".join(text_parts) if text_parts else ""),
    }


async def _generate_with_imagen(
    model_id: str, prompt: str, original_prompt: str
) -> dict[str, Any]:
    """Generate image using Imagen predict API."""
    import httpx

    api_url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model_id}:predict?key={settings.gemini_api_key}"
    )

    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "1:1",
            "outputOptions": {"mimeType": "image/png"},
        },
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(api_url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    predictions = data.get("predictions", [])
    if predictions:
        b64 = predictions[0].get("bytesBase64Encoded")
        mime = predictions[0].get("mimeType", "image/png")
        if b64:
            return {
                "image_base64": b64,
                "mime_type": mime,
                "prompt_used": prompt,
                "original_prompt": original_prompt,
                "model_used": model_id,
                "fallback": False,
            }

    return {
        "image_base64": None, "mime_type": "image/png",
        "prompt_used": prompt, "original_prompt": original_prompt,
        "model_used": model_id, "fallback": True,
        "error": f"Imagen model ({model_id}) không trả về ảnh.",
    }


async def _generate_with_grok(
    model_id: str, prompt: str, original_prompt: str
) -> dict[str, Any]:
    """Generate image using xAI Grok API (OpenAI-compatible)."""
    import httpx

    xai_key = settings.xai_api_key
    if not xai_key:
        return {
            "image_base64": None, "mime_type": "image/png",
            "prompt_used": prompt, "original_prompt": original_prompt,
            "model_used": model_id, "fallback": True,
            "error": "XAI_API_KEY chưa được cấu hình.",
        }

    api_url = "https://api.x.ai/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {xai_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model_id,
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024",
        "response_format": "b64_json",
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(api_url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()

    images = data.get("data", [])
    if images:
        b64 = images[0].get("b64_json")
        revised = images[0].get("revised_prompt", prompt)
        if b64:
            return {
                "image_base64": b64,
                "mime_type": "image/png",
                "prompt_used": revised,
                "original_prompt": original_prompt,
                "model_used": model_id,
                "fallback": False,
            }

    return {
        "image_base64": None, "mime_type": "image/png",
        "prompt_used": prompt, "original_prompt": original_prompt,
        "model_used": model_id, "fallback": True,
        "error": f"Grok model ({model_id}) không trả về ảnh.",
    }