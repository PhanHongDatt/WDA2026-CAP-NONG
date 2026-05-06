from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import httpx
import logging
import io
import tempfile
import os
from pydub import AudioSegment
from app.config import get_settings, Settings

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/ai",
    tags=["STT"]
)


def convert_to_wav(audio_bytes: bytes, source_format: str = "webm") -> bytes:
    """
    Convert audio from webm/opus (MediaRecorder default) to WAV 16kHz mono.
    FPT.AI ASR performs best with WAV format, 16kHz sample rate, mono channel.
    """
    try:
        # Write input to temp file (pydub needs file-like input for some codecs)
        with tempfile.NamedTemporaryFile(suffix=f".{source_format}", delete=False) as tmp_in:
            tmp_in.write(audio_bytes)
            tmp_in_path = tmp_in.name

        # Load and convert
        audio = AudioSegment.from_file(tmp_in_path, format=source_format)

        # Normalize: 16kHz, mono, 16-bit PCM WAV — optimal for FPT.AI
        audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)

        # Export to WAV bytes
        wav_buffer = io.BytesIO()
        audio.export(wav_buffer, format="wav")
        wav_bytes = wav_buffer.getvalue()

        # Cleanup temp file
        os.unlink(tmp_in_path)

        logger.info(f"Audio converted: {len(audio_bytes)} bytes {source_format} → {len(wav_bytes)} bytes WAV "
                     f"(duration={len(audio)/1000:.1f}s, rate=16kHz, mono)")
        return wav_bytes

    except Exception as e:
        # Cleanup on error
        if 'tmp_in_path' in locals():
            try:
                os.unlink(tmp_in_path)
            except OSError:
                pass
        logger.warning(f"Audio conversion failed ({e}), sending raw bytes to FPT.AI")
        return audio_bytes


def detect_audio_format(filename: str, content_type: str | None) -> str:
    """Detect audio format from filename or content type."""
    if filename:
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext in ("webm", "ogg", "opus", "mp3", "wav", "m4a", "flac"):
            return ext
    if content_type:
        if "webm" in content_type:
            return "webm"
        if "ogg" in content_type or "opus" in content_type:
            return "ogg"
        if "wav" in content_type:
            return "wav"
        if "mp3" in content_type or "mpeg" in content_type:
            return "mp3"
    return "webm"  # Default — MediaRecorder usually outputs webm


@router.post("/stt")
async def speech_to_text(
    audio: UploadFile = File(...),
    settings: Settings = Depends(get_settings)
):
    """
    Nhận file âm thanh từ client (thường là webm/opus từ MediaRecorder),
    convert sang WAV 16kHz mono, rồi gọi Google Cloud Speech-to-Text để chuyển thành văn bản.
    """
    if not settings.google_stt_api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_STT_API_KEY is not configured")

    # Read audio bytes
    audio_bytes = await audio.read()
    if len(audio_bytes) < 500:
        logger.warning(f"Audio too short ({len(audio_bytes)} bytes), skipping STT")
        return {"text": ""}

    # Detect format and convert to WAV
    source_format = detect_audio_format(audio.filename or "", audio.content_type)
    if source_format != "wav":
        audio_bytes = convert_to_wav(audio_bytes, source_format)

    import base64
    audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')

    # Call Google Cloud Speech API
    url = f"https://speech.googleapis.com/v1/speech:recognize?key={settings.google_stt_api_key}"
    
    payload = {
        "config": {
            "encoding": "LINEAR16",
            "sampleRateHertz": 16000,
            "languageCode": "vi-VN"
        },
        "audio": {
            "content": audio_b64
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"Google STT response: {list(result.keys())}")
            
            # Extract transcript
            results = result.get("results", [])
            if results and len(results) > 0:
                alternatives = results[0].get("alternatives", [])
                if alternatives and len(alternatives) > 0:
                    text = alternatives[0].get("transcript", "")
                    logger.info(f"STT result: '{text}'")
                    return {"text": text}
            
            return {"text": ""}
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP Error calling Google STT: {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail="Error calling Google Cloud STT API")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Exception calling Google STT: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error calling STT service")
