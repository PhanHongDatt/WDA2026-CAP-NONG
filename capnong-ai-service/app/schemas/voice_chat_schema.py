from pydantic import BaseModel, Field
from typing import Optional


class VoiceChatRequest(BaseModel):
    current_field: str = Field(
        description="Field đang hỏi: name, description, price, quantity, location, harvest_date, farming_method, confirm"
    )
    transcript: str = Field(min_length=1, max_length=2000, description="Câu trả lời nông dân")
    collected_fields: dict = Field(default_factory=dict, description="Các field đã thu thập")
    conversation_history: list[dict] = Field(
        default_factory=list,
        description="Lịch sử hội thoại [{role: 'ai'|'user', text: '...'}]"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "current_field": "name",
                "transcript": "Xoài cát chu",
                "collected_fields": {},
                "conversation_history": [
                    {"role": "ai", "text": "Bác đang bán loại nông sản gì ạ?"}
                ],
            }
        }
    }


class ExtraField(BaseModel):
    field: str
    value: Optional[str | float | int] = None
    raw_value: Optional[str] = None


class VoiceChatResponse(BaseModel):
    extracted_value: Optional[str | float | int] = None
    raw_value: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0, default=0.0)
    intent: str = Field(
        default="answer",
        description="answer | correct | skip | go_back | unclear"
    )
    correction_target: Optional[str] = None
    correction_value: Optional[str | float | int] = None
    next_question: Optional[str] = None
    confirmation_text: Optional[str] = None
    advice: Optional[str] = Field(default=None, description="Lời tư vấn nghiệp vụ chủ động (1-2 câu)")
    market_price_range: Optional[str] = Field(default=None, description="Giá thị trường tham khảo, VD: '40,000 - 55,000 đ/kg'")
    extra_fields: list[ExtraField] = Field(default_factory=list)
