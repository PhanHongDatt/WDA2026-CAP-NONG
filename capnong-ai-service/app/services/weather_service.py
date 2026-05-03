"""
Weather Service — Lấy dự báo thời tiết từ OpenWeatherMap
Free tier: 1000 calls/day — quá đủ cho demo.
"""
import logging
import httpx
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Tọa độ các vùng nông nghiệp trọng điểm
PROVINCE_COORDS: dict[str, tuple[float, float]] = {
    "Tiền Giang": (10.35, 106.36),
    "Bến Tre": (10.24, 106.37),
    "Cần Thơ": (10.03, 105.78),
    "Đồng Tháp": (10.46, 105.63),
    "Vĩnh Long": (10.25, 105.97),
    "An Giang": (10.39, 105.43),
    "Đắk Lắk": (12.68, 108.05),
    "Gia Lai": (13.98, 108.00),
    "Lâm Đồng": (11.94, 108.44),
    "Long An": (10.54, 106.41),
    "Hậu Giang": (9.78, 105.47),
    "Sóc Trăng": (9.60, 105.97),
}

# Fallback: Cần Thơ (trung tâm ĐBSCL)
DEFAULT_COORDS = (10.03, 105.78)


async def get_weather_forecast(province: str | None = None) -> dict:
    """
    Lấy dự báo thời tiết 3 ngày cho tỉnh/thành.
    Trả về dict có dạng:
    {
        "province": "Tiền Giang",
        "current": {"temp": 32, "description": "Mây rải rác", "humidity": 75},
        "alerts": ["Mưa lớn ngày mai (80mm)", ...],
        "forecast_3d": [
            {"date": "2026-04-30", "temp_min": 25, "temp_max": 34, "rain_mm": 80, "description": "Mưa lớn"},
            ...
        ]
    }
    """
    api_key = settings.openweathermap_api_key
    if not api_key:
        logger.warning("OpenWeatherMap API key not configured — returning mock data")
        return _mock_weather(province)

    coords = PROVINCE_COORDS.get(province or "", DEFAULT_COORDS)
    lat, lon = coords

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={
                    "lat": lat, "lon": lon,
                    "appid": api_key,
                    "units": "metric",
                    "lang": "vi",
                    "cnt": 24,  # 24 data points = 3 days (3h intervals)
                },
            )
            resp.raise_for_status()
            data = resp.json()

        # Parse forecast
        from collections import defaultdict
        daily: dict[str, dict] = defaultdict(lambda: {"temps": [], "rain": 0, "descriptions": []})

        for item in data.get("list", []):
            dt_txt = item["dt_txt"]
            day = dt_txt.split(" ")[0]
            daily[day]["temps"].append(item["main"]["temp"])
            daily[day]["rain"] += item.get("rain", {}).get("3h", 0)
            daily[day]["descriptions"].append(item["weather"][0]["description"])

        forecast_3d = []
        alerts = []
        for day_str, info in sorted(daily.items())[:3]:
            temp_min = round(min(info["temps"]))
            temp_max = round(max(info["temps"]))
            rain_mm = round(info["rain"], 1)
            desc = max(set(info["descriptions"]), key=info["descriptions"].count)

            forecast_3d.append({
                "date": day_str,
                "temp_min": temp_min,
                "temp_max": temp_max,
                "rain_mm": rain_mm,
                "description": desc,
            })

            # Auto-generate alerts
            if rain_mm > 50:
                alerts.append(f"Mưa lớn ngày {day_str} ({rain_mm}mm) — có thể ảnh hưởng thu hoạch")
            if temp_max > 38:
                alerts.append(f"Nắng gắt ngày {day_str} ({temp_max}°C) — cần tưới nước đủ")

        current = data["list"][0] if data.get("list") else {}
        return {
            "province": province or "Cần Thơ",
            "current": {
                "temp": round(current.get("main", {}).get("temp", 30)),
                "description": current.get("weather", [{}])[0].get("description", ""),
                "humidity": current.get("main", {}).get("humidity", 70),
            },
            "alerts": alerts,
            "forecast_3d": forecast_3d,
        }

    except Exception as e:
        logger.error(f"Weather API error: {e}")
        return _mock_weather(province)


def _mock_weather(province: str | None = None) -> dict:
    """Mock data khi không có API key — vẫn demo được."""
    from datetime import date, timedelta
    today = date.today()
    return {
        "province": province or "Tiền Giang",
        "current": {"temp": 33, "description": "Mây rải rác", "humidity": 72},
        "alerts": [
            f"Mưa lớn ngày {(today + timedelta(days=1)).isoformat()} (75mm) — có thể ảnh hưởng thu hoạch",
        ],
        "forecast_3d": [
            {"date": today.isoformat(), "temp_min": 26, "temp_max": 34, "rain_mm": 5, "description": "Mây rải rác"},
            {"date": (today + timedelta(days=1)).isoformat(), "temp_min": 24, "temp_max": 31, "rain_mm": 75, "description": "Mưa lớn"},
            {"date": (today + timedelta(days=2)).isoformat(), "temp_min": 25, "temp_max": 33, "rain_mm": 10, "description": "Mưa nhỏ"},
        ],
    }
