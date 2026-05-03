"""
Proactive AI Router — Sinh thông báo chủ động cho nông dân
Kết hợp: Weather forecast + Market prices + Gemini reasoning
"""
import json
import logging
from datetime import date
from fastapi import APIRouter, HTTPException, status
import google.generativeai as genai
from app.config import get_settings
from app.schemas.proactive_schema import (
    ProactiveDigestRequest,
    ProactiveDigestResponse,
    ProactiveNotification,
)
from app.services.weather_service import get_weather_forecast
from app.services.market_intel_service import get_market_prices

router = APIRouter(prefix="/ai", tags=["AI Features"])
logger = logging.getLogger(__name__)
settings = get_settings()


PROACTIVE_SYSTEM_PROMPT = """Bạn là trợ lý nông nghiệp AI thông minh cho nền tảng "Cạp Nông".
Nhiệm vụ: Dựa trên dữ liệu thời tiết và giá thị trường, sinh ra 2-3 thông báo chủ động
giúp nông dân đưa ra quyết định kinh doanh tốt hơn.

Quy tắc:
- Xưng "con", gọi "bác" (hoặc tên bác nếu có)
- Giọng điệu: thân thiện, quan tâm, như người nhà
- Mỗi thông báo ngắn gọn 1-2 câu
- Luôn kèm lời khuyên hành động cụ thể
- KHÔNG bịa dữ liệu — chỉ dùng dữ liệu được cung cấp

Loại thông báo:
- WEATHER_ALERT: Cảnh báo thời tiết ảnh hưởng canh tác/thu hoạch
- PRICE_TREND: Biến động giá, cơ hội bán tốt
- HARVEST_TIP: Mẹo canh tác theo thời tiết
- MARKET_OPPORTUNITY: Cơ hội thị trường

Trả về JSON:
{
  "notifications": [
    {
      "type": "WEATHER_ALERT",
      "title": "Tiêu đề ngắn",
      "message": "Nội dung thân thiện...",
      "priority": "high" | "normal" | "low",
      "action_url": "/dashboard/products/new" hoặc null
    }
  ],
  "weather_summary": "Tóm tắt thời tiết 1 câu"
}
"""


@router.post(
    "/proactive-digest",
    response_model=ProactiveDigestResponse,
    summary="Sinh thông báo chủ động cho nông dân (thời tiết + giá cả)",
)
async def generate_proactive_digest(
    request: ProactiveDigestRequest,
) -> ProactiveDigestResponse:
    logger.info(f"Proactive digest | Province: {request.province} | Products: {request.products}")

    # Step 1: Gather data in parallel
    weather = await get_weather_forecast(request.province)
    market = {}
    if request.products:
        market = await get_market_prices(request.products)

    # Step 2: Build context for Gemini
    farmer_name = request.farmer_name or "bác"
    products_str = ", ".join(request.products) if request.products else "chưa có sản phẩm"

    weather_str = json.dumps(weather, ensure_ascii=False, indent=2)
    market_str = json.dumps(market, ensure_ascii=False, indent=2) if market else "Không có dữ liệu giá"

    prompt = f"""## Ngữ cảnh
Ngày hôm nay: {date.today().isoformat()}
Nông dân: {farmer_name}
Khu vực: {request.province}
Sản phẩm đang bán: {products_str}

## Dữ liệu thời tiết
{weather_str}

## Dữ liệu giá thị trường
{market_str}

Hãy sinh 2-3 thông báo chủ động phù hợp. Ưu tiên:
1. Cảnh báo thời tiết nếu có mưa lớn/nắng gắt ảnh hưởng thu hoạch
2. Cơ hội giá nếu sản phẩm đang tăng giá
3. Mẹo hữu ích theo mùa

Trả về JSON theo format. Chỉ JSON, không giải thích."""

    try:
        model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            generation_config=genai.types.GenerationConfig(
                temperature=0.6,
                max_output_tokens=1500,
                response_mime_type="application/json",
            ),
            system_instruction=PROACTIVE_SYSTEM_PROMPT,
        )

        response = await model.generate_content_async(prompt)
        raw = response.text.strip()

        # Parse
        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            import re
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            result = json.loads(match.group(0)) if match else {"notifications": [], "weather_summary": ""}

        notifications = [
            ProactiveNotification(**n) for n in result.get("notifications", [])
        ]

        return ProactiveDigestResponse(
            notifications=notifications,
            weather_summary=result.get("weather_summary"),
            province=request.province,
        )

    except Exception as e:
        logger.error(f"Proactive digest error: {e}")
        # Fallback: at least return weather alerts
        fallback_notifs = []
        for alert in weather.get("alerts", []):
            fallback_notifs.append(ProactiveNotification(
                type="WEATHER_ALERT",
                title="⛈️ Cảnh báo thời tiết",
                message=f"{farmer_name} ơi, {alert}. Bác cân nhắc thu hoạch sớm nhé.",
                priority="high",
                action_url="/dashboard/products/new",
            ))

        if not fallback_notifs:
            fallback_notifs.append(ProactiveNotification(
                type="HARVEST_TIP",
                title="🌤️ Thời tiết hôm nay",
                message=f"Chào {farmer_name}, hôm nay {request.province} {weather.get('current', {}).get('description', 'trời đẹp')}, nhiệt độ {weather.get('current', {}).get('temp', 30)}°C. Chúc bác buôn bán tốt!",
                priority="normal",
            ))

        return ProactiveDigestResponse(
            notifications=fallback_notifs,
            weather_summary=f"{weather.get('current', {}).get('description', 'Trời ổn định')}, {weather.get('current', {}).get('temp', 30)}°C",
            province=request.province,
        )
