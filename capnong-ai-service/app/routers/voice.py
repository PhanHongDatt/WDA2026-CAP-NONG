import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.voice_schema import VoiceTranscriptRequest, ProductExtraction
from app.services.gemini_service import extract_product_from_transcript
from app.services.unit_converter import convert_to_kg, convert_price_unit, is_weight_unit
from app.services.confidence_scorer import build_field_with_confidence

router = APIRouter(prefix="/ai", tags=["AI Features"])
logger = logging.getLogger(__name__)


@router.post(
    "/voice-to-product",
    response_model=ProductExtraction,
    summary="Trích xuất thông tin sản phẩm từ transcript giọng nói",
    description="Nhận text transcript từ Web Speech API, gọi Gemini để trích xuất thông tin sản phẩm nông sản."
)
async def voice_to_product(request: VoiceTranscriptRequest) -> ProductExtraction:
    transcript = request.transcript.strip()
    logger.info(f"Processing transcript: '{transcript[:80]}...'")

    # 1. Gọi Gemini
    try:
        gemini_result = await extract_product_from_transcript(transcript)
    except Exception as e:
        logger.error(f"Gemini extraction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service tạm thời không khả dụng: {str(e)}"
        )

    # 2. Build fields với confidence levels
    fields = {
        key: build_field_with_confidence(gemini_result.get(key, {"value": None, "confidence": 0.0, "raw_value": None}))
        for key in [
            "product_name", "description", "price_per_unit", "price_unit",
            "quantity", "quantity_unit", "harvest_date", "farming_method", "location"
        ]
    }

    processing_notes = []

    # 3. Quy đổi đơn vị QUANTITY nếu là trọng lượng
    qty_field = fields["quantity"]
    unit_field = fields["quantity_unit"]

    if qty_field["value"] is not None and unit_field["value"] is not None:
        qty_val = float(qty_field["value"])
        unit_val = str(unit_field["value"])

        if is_weight_unit(unit_val):
            result = convert_to_kg(qty_val, unit_val)
            if result and result.note:
                # Cập nhật giá trị đã quy đổi
                fields["quantity"] = {
                    **fields["quantity"],
                    "value": result.converted_value,
                    "raw_value": f"{qty_val} {unit_val}",
                }
                fields["quantity_unit"] = {
                    **fields["quantity_unit"],
                    "value": "kg",
                    "raw_value": unit_val,
                }
                processing_notes.append(result.note)

    # 4. Quy đổi đơn giá nếu price_unit không phải kg
    price_field = fields["price_per_unit"]
    price_unit_field = fields["price_unit"]

    if (
        price_field["value"] is not None
        and price_unit_field["value"] is not None
        and str(price_unit_field["value"]).lower() not in ("kg", "ký", "ky", "kilo")
    ):
        price_val = float(price_field["value"])
        price_unit_val = str(price_unit_field["value"])

        if is_weight_unit(price_unit_val):
            converted_price = convert_price_unit(price_val, price_unit_val, "kg")
            if converted_price:
                fields["price_per_unit"] = {
                    **fields["price_per_unit"],
                    "value": converted_price,
                    "raw_value": f"{price_val}/{price_unit_val}",
                }
                fields["price_unit"] = {
                    **fields["price_unit"],
                    "value": "kg",
                    "raw_value": price_unit_val,
                }
                processing_notes.append(
                    f"Đã quy đổi giá {price_val:,.0f}/{price_unit_val} → {converted_price:,.0f}/kg"
                )

    return ProductExtraction(
        **fields,
        original_transcript=transcript,
        processing_notes=processing_notes,
    )