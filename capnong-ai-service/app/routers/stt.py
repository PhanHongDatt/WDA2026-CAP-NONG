from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import httpx
import logging
from app.config import get_settings, Settings

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/ai",
    tags=["STT"]
)

@router.post("/stt")
async def speech_to_text(
    audio: UploadFile = File(...),
    settings: Settings = Depends(get_settings)
):
    """
    Nhận file âm thanh từ client và gọi API FPT.AI Speech to Text để chuyển thành văn bản.
    """
    if not settings.fpt_ai_api_key:
        raise HTTPException(status_code=500, detail="FPT_AI_API_KEY is not configured")

    # Read audio bytes
    audio_bytes = await audio.read()

    # Call FPT.AI API
    url = "https://api.fpt.ai/hmi/asr/general"
    headers = {
        "api_key": settings.fpt_ai_api_key
    }
    
    # Send binary data directly in request body
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, headers=headers, content=audio_bytes)
            response.raise_for_status()
            result = response.json()
            
            if result.get("status") == 0:
                hypotheses = result.get("hypotheses", [])
                if hypotheses and len(hypotheses) > 0:
                    text = hypotheses[0].get("utterance", "")
                    return {"text": text}
                else:
                    return {"text": ""}
            else:
                error_msg = result.get("message", "Unknown error from FPT.AI")
                logger.error(f"FPT.AI STT Error: {error_msg}")
                raise HTTPException(status_code=500, detail=f"FPT.AI STT Error: {error_msg}")
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP Error calling FPT.AI: {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail="Error calling FPT.AI STT API")
        except Exception as e:
            logger.error(f"Exception calling FPT.AI: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error calling STT service")
