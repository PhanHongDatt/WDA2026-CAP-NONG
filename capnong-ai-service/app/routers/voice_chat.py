import logging
import json
from fastapi import APIRouter, HTTPException, status
from app.schemas.voice_chat_schema import VoiceChatRequest, VoiceChatResponse
import google.generativeai as genai
from app.config import get_settings
from app.prompts.voice_chat_prompt import build_voice_chat_prompt

router = APIRouter(prefix="/ai", tags=["AI Features"])
logger = logging.getLogger(__name__)
settings = get_settings()

GENERATION_CONFIG = genai.types.GenerationConfig(
    temperature=0.4,
    top_p=0.8,
    top_k=10,
    max_output_tokens=1024,
    response_mime_type="application/json",
)

def _extract_json(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    import re
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    raise ValueError(f"Không thể parse JSON từ response: {text[:200]}")


@router.post(
    "/voice-chat",
    response_model=VoiceChatResponse,
    summary="Hội thoại giọng nói thông minh (từng field)",
)
async def voice_chat(request: VoiceChatRequest) -> VoiceChatResponse:
    logger.info(f"Voice Chat Request | Field: {request.current_field} | Transcript: '{request.transcript[:50]}'")

    prompt = build_voice_chat_prompt(
        current_field=request.current_field,
        transcript=request.transcript,
        collected_fields=request.collected_fields,
        conversation_history=request.conversation_history,
    )

    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config=GENERATION_CONFIG,
    )

    for attempt in range(3):
        try:
            response = await model.generate_content_async(prompt)
            result = _extract_json(response.text)
            
            # Đảm bảo extra_fields là list
            if "extra_fields" in result and result["extra_fields"] is None:
                result["extra_fields"] = []
                
            return VoiceChatResponse(**result)
        except Exception as e:
            logger.error(f"Voice chat API error attempt {attempt+1}: {e}")
            if attempt == 2:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"AI service tạm thời không khả dụng: {str(e)}"
                )
