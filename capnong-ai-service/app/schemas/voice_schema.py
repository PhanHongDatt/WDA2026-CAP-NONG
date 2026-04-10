from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class UnitEnum(str, Enum):
    KG = "kg"
    GR = "g"
    TAO = "trái"
    BUNCH = "bó"
    BOX = "thùng"
    BAG = "túi"


class ConfidenceLevel(str, Enum):
    HIGH = "high"       # >= 0.85 — hiển thị bình thường
    MEDIUM = "medium"   # 0.70–0.84 — hiển thị với gạch chân vàng
    LOW = "low"         # < 0.70  — highlight đỏ, cần người dùng xác nhận


class FieldWithConfidence(BaseModel):
    value: Optional[str | float | int] = None
    confidence: float = Field(ge=0.0, le=1.0)
    confidence_level: ConfidenceLevel
    raw_value: Optional[str] = None  # Giá trị gốc trước khi quy đổi


class ProductExtraction(BaseModel):
    """Response trả về FE sau khi xử lý transcript."""
    product_name: FieldWithConfidence
    description: FieldWithConfidence
    price_per_unit: FieldWithConfidence          # VND
    price_unit: FieldWithConfidence              # kg / trái / bó ...
    quantity: FieldWithConfidence                # Đã quy đổi về kg nếu là trọng lượng
    quantity_unit: FieldWithConfidence           # Đơn vị sau quy đổi (luôn là "kg" nếu trọng lượng)
    harvest_date: FieldWithConfidence            # ISO date string hoặc mô tả
    farming_method: FieldWithConfidence          # hữu cơ / thông thường / VietGAP
    location: FieldWithConfidence                # Tỉnh/huyện nếu có
    original_transcript: str
    processing_notes: list[str] = []            # Ghi chú xử lý (vd: "Đã quy đổi 5 tạ → 500 kg")


class VoiceTranscriptRequest(BaseModel):
    transcript: str = Field(
        min_length=5,
        max_length=2000,
        description="Văn bản từ Web Speech API"
    )
    language: str = Field(default="vi-VN")

    model_config = {
        "json_schema_extra": {
            "example": {
                "transcript": "tôi có năm tạ xoài cát chu giá hai mươi lăm ngàn một ký thu hoạch tuần sau",
                "language": "vi-VN"
            }
        }
    }


class RefineRequest(BaseModel):
    raw_description: str = Field(min_length=5, max_length=1000)
    product_name: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "raw_description": "xoai cat chu ngot lam chin cay ko dung thuoc",
                "product_name": "Xoài cát Chu"
            }
        }
    }


class RefineResponse(BaseModel):
    refined_description: str
    changes_summary: list[str]
    original: str


class CaptionRequest(BaseModel):
    product_name: str
    description: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "product_name": "Xoài cát Chu Đồng Tháp",
                "description": "Xoài ngọt lịm, không dùng thuốc, hàng tươi mới vừa thu hoạch hôm nay"
            }
        }
    }


class CaptionResponse(BaseModel):
    funny: str
    authentic: str
    professional: str
    hashtags: list[str]