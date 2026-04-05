from app.schemas.voice_schema import ConfidenceLevel


def get_confidence_level(confidence: float) -> ConfidenceLevel:
    if confidence >= 0.85:
        return ConfidenceLevel.HIGH
    elif confidence >= 0.70:
        return ConfidenceLevel.MEDIUM
    else:
        return ConfidenceLevel.LOW


def build_field_with_confidence(raw_field: dict) -> dict:
    """
    Nhận field từ Gemini output, bổ sung confidence_level.
    raw_field: {"value": ..., "confidence": 0.95, "raw_value": ...}
    """
    confidence = float(raw_field.get("confidence", 0.0))
    return {
        "value": raw_field.get("value"),
        "confidence": confidence,
        "confidence_level": get_confidence_level(confidence),
        "raw_value": raw_field.get("raw_value"),
    }