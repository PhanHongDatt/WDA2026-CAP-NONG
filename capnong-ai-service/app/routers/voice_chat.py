import logging
import json
import re
from fastapi import APIRouter, HTTPException, status
from app.schemas.voice_chat_schema import VoiceChatRequest, VoiceChatResponse
import google.generativeai as genai
from app.config import get_settings
from app.prompts.voice_chat_prompt import build_voice_chat_prompt, VOICE_CHAT_SYSTEM_PROMPT

router = APIRouter(prefix="/ai", tags=["AI Features"])
logger = logging.getLogger(__name__)
settings = get_settings()

GENERATION_CONFIG = genai.types.GenerationConfig(
    temperature=0.55,
    top_p=0.85,
    top_k=10,
    max_output_tokens=4096,
    response_mime_type="application/json",
)


def _repair_truncated_json(text: str) -> dict | None:
    """Attempt to repair a truncated JSON by closing open strings/objects/arrays."""
    # Strip markdown fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)

    # If it doesn't start with {, extract the first {
    idx = cleaned.find("{")
    if idx < 0:
        return None
    cleaned = cleaned[idx:]

    # Try as-is first
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Attempt repair: close any open string, then close brackets/braces
    repaired = cleaned.rstrip()

    # If we're inside a string value (odd number of unescaped quotes after last key)
    # Simple heuristic: if last non-whitespace char is not } ] , or a digit, close the string
    last_char = repaired.rstrip()[-1] if repaired.rstrip() else ""
    if last_char not in "{}[],0123456789.truefalsnul\"":
        repaired += '"'
    elif last_char == "\\":
        repaired += '""'

    # Count open braces/brackets
    open_braces = repaired.count("{") - repaired.count("}")
    open_brackets = repaired.count("[") - repaired.count("]")

    # Close any unclosed structures
    repaired += "]" * max(0, open_brackets)
    repaired += "}" * max(0, open_braces)

    try:
        return json.loads(repaired)
    except json.JSONDecodeError:
        pass

    # More aggressive: find the last complete key-value pair and truncate there
    # Look for the last complete "key": value pattern
    last_comma = repaired.rfind(",")
    if last_comma > 0:
        truncated = repaired[:last_comma]
        open_braces = truncated.count("{") - truncated.count("}")
        open_brackets = truncated.count("[") - truncated.count("]")
        truncated += "]" * max(0, open_brackets)
        truncated += "}" * max(0, open_braces)
        try:
            return json.loads(truncated)
        except json.JSONDecodeError:
            pass

    return None


def _extract_json(text: str) -> dict:
    # 1. Direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. Extract from markdown fences
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # 3. Extract any {...} block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    # 4. Try to repair truncated JSON
    repaired = _repair_truncated_json(text)
    if repaired is not None:
        logger.warning(f"Repaired truncated JSON successfully. Keys: {list(repaired.keys())}")
        return repaired

    raise ValueError(f"Không thể parse JSON từ response: {text[:200]}")


# Default fallback response when AI fails completely
_FALLBACK_RESPONSE = {
    "extracted_value": None,
    "raw_value": "",
    "confidence": 0.0,
    "intent": "unclear",
    "correction_target": None,
    "correction_value": None,
    "next_question": "Dạ con chưa nghe rõ, bác nói lại giúp con nghen.",
    "confirmation_text": "",
    "advice": None,
    "market_price_range": None,
    "extra_fields": [],
}


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

    # Use gemini-3-flash-preview for voice-chat for frontier-class performance
    # Voice conversation needs <5s response time
    VOICE_CHAT_MODEL = "gemini-3-flash-preview"

    model = genai.GenerativeModel(
        model_name=VOICE_CHAT_MODEL,
        generation_config=GENERATION_CONFIG,
        system_instruction=VOICE_CHAT_SYSTEM_PROMPT,
    )
    
    SAFETY_SETTINGS = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
    ]

    last_error = None
    for attempt in range(3):
        try:
            response = await model.generate_content_async(prompt, safety_settings=SAFETY_SETTINGS)
            result = _extract_json(response.text)
            
            # Đảm bảo extra_fields là list
            if "extra_fields" in result and result["extra_fields"] is None:
                result["extra_fields"] = []
            
            # Fill missing required fields with defaults
            for key, val in _FALLBACK_RESPONSE.items():
                if key not in result:
                    result[key] = val
                    
            return VoiceChatResponse(**result)
        except Exception as e:
            last_error = e
            logger.error(f"Voice chat API error attempt {attempt+1}: {e}")

    # All 3 attempts failed — return a graceful fallback instead of 503
    logger.error(f"All voice chat attempts failed, returning fallback. Last error: {last_error}")
    return VoiceChatResponse(**_FALLBACK_RESPONSE)
