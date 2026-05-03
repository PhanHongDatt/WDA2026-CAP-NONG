"""
Market Intel Service — Dùng Gemini + Google Search grounding để tra giá nông sản thực tế.
Không cần crawler riêng — Gemini tự tìm kiếm Google lấy giá từ nhiều nguồn.
"""
import json
import logging
import google.generativeai as genai
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def get_market_prices(product_names: list[str]) -> dict:
    """
    Tra giá thị trường nông sản qua Gemini Google Search grounding.
    Trả về dict dạng:
    {
        "prices": {
            "Xoài Cát Chu": {"low": 35000, "avg": 45000, "high": 60000, "trend": "tăng nhẹ"},
            ...
        },
        "source": "Google Search grounding",
        "timestamp": "2026-04-29"
    }
    """
    from datetime import date

    products_str = ", ".join(product_names)

    prompt = f"""Tra giá thị trường hôm nay ({date.today().isoformat()}) của các nông sản sau tại Việt Nam:
{products_str}

Tìm giá từ các nguồn: chợ đầu mối Bình Điền, chợ Thủ Đức, báo Nông nghiệp Việt Nam, giá nông sản ĐBSCL.

Trả về CHÍNH XÁC JSON (không markdown):
{{
  "prices": {{
    "<tên sản phẩm>": {{
      "low": <giá thấp nhất (VNĐ/kg)>,
      "avg": <giá trung bình>,
      "high": <giá cao nhất>,
      "trend": "tăng" | "giảm" | "ổn định",
      "note": "<ghi chú ngắn nếu có>"
    }}
  }}
}}
"""

    try:
        model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=2048,
                response_mime_type="application/json",
            ),
            tools=[genai.Tool(google_search=genai.GoogleSearch())],
        )

        response = await model.generate_content_async(prompt)
        raw = response.text.strip()

        # Parse JSON
        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            import re
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            result = json.loads(match.group(0)) if match else {}

        return {
            "prices": result.get("prices", {}),
            "source": "Google Search grounding (Gemini)",
            "timestamp": date.today().isoformat(),
        }

    except Exception as e:
        logger.error(f"Market intel error: {e}")
        # Fallback to static prices
        return {
            "prices": {name: {"low": 0, "avg": 0, "high": 0, "trend": "không rõ", "note": "Không thể tra giá lúc này"} for name in product_names},
            "source": "fallback",
            "timestamp": date.today().isoformat(),
        }
