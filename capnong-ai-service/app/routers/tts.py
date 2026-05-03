import logging
import httpx
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from app.schemas.tts_schema import TTSRequest
from app.config import get_settings

router = APIRouter(prefix="/ai", tags=["AI Features"])
logger = logging.getLogger(__name__)
settings = get_settings()


@router.post(
    "/tts",
    summary="Text to Speech (Proxy to Zalo AI TTS)",
)
async def synthesize_speech(request: TTSRequest):
    if not settings.zalo_api_key:
        # Fallback error if no Zalo API key
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Zalo AI API key not configured."
        )

    logger.info(f"TTS Request: '{request.text[:50]}...' | Speaker: {request.speaker_id}")

    # Step 1: Call Zalo AI to get audio URL
    zalo_url = "https://api.zalo.ai/v1/tts/synthesize"
    headers = {
        "apikey": settings.zalo_api_key
    }
    
    # We use data-urlencode format as per Zalo docs
    data = {
        "input": request.text,
        "speaker_id": request.speaker_id,
        "speed": request.speed,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(zalo_url, headers=headers, data=data)
            resp.raise_for_status()
            result = resp.json()
            
            if result.get("error_code") != 0:
                logger.error(f"Zalo TTS error: {result}")
                raise HTTPException(status_code=500, detail=f"Zalo AI error: {result.get('error_message')}")
                
            audio_url = result.get("data", {}).get("url")
            if not audio_url:
                raise HTTPException(status_code=500, detail="Zalo AI did not return an audio URL")
                
        except Exception as e:
            logger.error(f"Failed to call Zalo AI TTS: {e}")
            raise HTTPException(status_code=500, detail="Failed to synthesize speech")


    # Step 2: Download fully with retry mechanism because Zalo CDN might take a moment to prepare the file.
    import asyncio
    async with httpx.AsyncClient(timeout=30.0) as stream_client:
        for attempt in range(5):
            try:
                audio_resp = await stream_client.get(audio_url)
                if audio_resp.status_code == 200 and len(audio_resp.content) > 100:
                    from fastapi import Response
                    return Response(content=audio_resp.content, media_type="audio/mpeg")
            except Exception:
                pass
            await asyncio.sleep(1.0)
            
        raise HTTPException(status_code=500, detail="Zalo TTS audio not ready after retries")

