import logging
import httpx
import asyncio
import unicodedata
from fastapi import APIRouter, HTTPException, status, Response
from app.schemas.tts_schema import TTSRequest
from app.config import get_settings

router = APIRouter(prefix="/ai", tags=["AI Features"])
logger = logging.getLogger(__name__)
settings = get_settings()


def _strip_accents(s: str) -> str:
    """Remove Vietnamese diacritics for fuzzy province matching."""
    nfkd = unicodedata.normalize("NFD", s)
    return "".join(c for c in nfkd if unicodedata.category(c) != "Mn").lower().replace("đ", "d").replace("Đ", "D")


# ── Region-to-voice mapping ──
# FPT.AI voices:
#   banmai   - female, northern
#   lannhi   - female, southern
#   leminh   - male, northern
#   myan     - female, central
#   thuminh  - female, northern
#   giahuy   - male, central
#   linhsan  - female, southern

# Southern provinces (Nam Bộ)
SOUTHERN_PROVINCES = [
    "tiền giang", "bến tre", "vĩnh long", "trà vinh", "hậu giang",
    "sóc trăng", "bạc liêu", "cà mau", "đồng tháp", "an giang",
    "kiên giang", "long an", "cần thơ",  # Mekong Delta
    "bình dương", "bình phước", "tây ninh", "đồng nai", "bà rịa",
    "vũng tàu", "hồ chí minh", "tp.hcm", "sài gòn",  # Southeast
]

# Central provinces (Trung Bộ)
CENTRAL_PROVINCES = [
    "đà nẵng", "huế", "thừa thiên", "quảng nam", "quảng ngãi",
    "bình định", "phú yên", "khánh hòa", "nha trang",
    "ninh thuận", "bình thuận", "phan thiết",
    "quảng bình", "quảng trị", "hà tĩnh", "nghệ an", "thanh hóa",
    # Tây Nguyên
    "gia lai", "kon tum", "đắk lắk", "đắk nông", "lâm đồng", "đà lạt",
]

# Pre-compute accent-stripped versions for fast matching
_SOUTHERN_STRIPPED = [_strip_accents(p) for p in SOUTHERN_PROVINCES]
_CENTRAL_STRIPPED = [_strip_accents(p) for p in CENTRAL_PROVINCES]

# Northern = everything else (Bắc Bộ)

# Default voices per region (prefer male voices as user requested)
REGION_VOICE_MAP = {
    "south": "lannhi",    # female southern — no male southern voice in FPT.AI
    "central": "giahuy",  # male central
    "north": "leminh",    # male northern
}

DEFAULT_VOICE = "leminh"  # Default fallback: male northern


def detect_voice_from_location(location: str | None) -> str:
    """Pick FPT.AI voice based on farmer's location (province/city)."""
    if not location:
        return DEFAULT_VOICE

    loc = _strip_accents(location)

    for province in _SOUTHERN_STRIPPED:
        if province in loc:
            return REGION_VOICE_MAP["south"]

    for province in _CENTRAL_STRIPPED:
        if province in loc:
            return REGION_VOICE_MAP["central"]

    # Default to northern
    return REGION_VOICE_MAP["north"]


@router.post(
    "/tts",
    summary="Text to Speech (FPT.AI TTS v5 with region-based voice)",
)
async def synthesize_speech(request: TTSRequest):
    if not settings.fpt_ai_api_key:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="FPT AI API key not configured."
        )

    # Determine voice: explicit > auto from location > default
    voice = request.voice or detect_voice_from_location(request.location)

    logger.info(f"TTS Request: '{request.text[:80]}...' | Voice: {voice} | Location: {request.location} | Speed: {request.speed}")

    # ── Step 1: Call FPT.AI TTS v5 ──
    fpt_url = "https://api.fpt.ai/hmi/tts/v5"
    headers = {
        "api-key": settings.fpt_ai_api_key,
        "voice": voice,
        "speed": str(request.speed),
        "format": "mp3",
        "Cache-Control": "no-cache",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(
                fpt_url,
                headers=headers,
                content=request.text.encode("utf-8"),
            )
            resp.raise_for_status()
            result = resp.json()

            error_code = result.get("error")
            if error_code != 0:
                logger.error(f"FPT.AI TTS error: {result}")
                raise HTTPException(
                    status_code=500,
                    detail=f"FPT.AI TTS error: {result.get('message', 'Unknown error')}"
                )

            audio_url = result.get("async")
            if not audio_url:
                raise HTTPException(status_code=500, detail="FPT.AI TTS did not return an audio URL")

            logger.info(f"FPT.AI TTS async URL: {audio_url}")

        except httpx.HTTPStatusError as e:
            logger.error(f"FPT.AI TTS HTTP error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=500, detail=f"FPT.AI TTS service error: {e.response.status_code}")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to call FPT.AI TTS: {e}")
            raise HTTPException(status_code=500, detail="Failed to synthesize speech")

    # ── Step 2: Poll the async URL until audio is ready ──
    # FPT.AI says audio may take 5s to 2 minutes depending on text length.
    # We poll up to 25 times (max ~50 seconds).
    async with httpx.AsyncClient(timeout=30.0) as dl_client:
        for attempt in range(25):
            try:
                audio_resp = await dl_client.get(audio_url)
                if audio_resp.status_code == 200 and len(audio_resp.content) > 100:
                    logger.info(f"TTS audio ready on attempt {attempt + 1} ({len(audio_resp.content)} bytes)")
                    return Response(
                        content=audio_resp.content,
                        media_type="audio/mpeg",
                    )
            except Exception as e:
                logger.warning(f"TTS download attempt {attempt + 1} failed: {e}")

            # Progressive backoff: 1s, 1.5s, 2s, 2s...
            wait = min(1.0 + attempt * 0.5, 2.0)
            await asyncio.sleep(wait)

        raise HTTPException(status_code=500, detail="FPT.AI TTS audio not ready after retries")
