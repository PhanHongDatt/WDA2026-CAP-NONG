from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# ═══════════════════════════════════════════════════
#  CAPTION
# ═══════════════════════════════════════════════════

class CaptionStyle(str, Enum):
    FUNNY = "FUNNY"
    RUSTIC = "RUSTIC"
    PROFESSIONAL = "PROFESSIONAL"


class CaptionRequest(BaseModel):
    product_name: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=1000)
    province: Optional[str] = None
    style: Optional[CaptionStyle] = None  # None = generate all 3 styles

    model_config = {
        "json_schema_extra": {
            "example": {
                "product_name": "Xoài cát Hòa Lộc",
                "description": "Xoài ngọt lịm, VietGAP, vừa thu hoạch",
                "province": "Đồng Tháp",
                "style": "FUNNY"
            }
        }
    }


class CaptionItem(BaseModel):
    style: str
    text: str


class CaptionResponse(BaseModel):
    captions: list[CaptionItem]
    hashtags: list[str]


# ═══════════════════════════════════════════════════
#  POSTER
# ═══════════════════════════════════════════════════

class PosterTemplate(str, Enum):
    FRESH_GREEN = "FRESH_GREEN"
    WARM_HARVEST = "WARM_HARVEST"
    MINIMAL_WHITE = "MINIMAL_WHITE"


class PosterContentRequest(BaseModel):
    product_name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    province: Optional[str] = None
    price_display: Optional[str] = None       # "25.000đ/kg"
    shop_name: Optional[str] = None
    template: PosterTemplate = PosterTemplate.FRESH_GREEN

    model_config = {
        "json_schema_extra": {
            "example": {
                "product_name": "Xoài Cát Hòa Lộc",
                "description": "Xoài VietGAP, trái to đều, ngọt thanh",
                "province": "Đồng Tháp",
                "price_display": "65.000đ/kg",
                "shop_name": "Vườn Trần Nông",
                "template": "FRESH_GREEN"
            }
        }
    }


class ColorScheme(BaseModel):
    primary: str = "#2d6a4f"
    accent: str = "#95d5b2"
    text_on_primary: str = "#ffffff"
    background: str = "#f0f7f4"


class PosterContentResponse(BaseModel):
    template: str
    headline: str
    tagline: str
    price_display: str
    badge_texts: list[str]
    shop_display: str
    cta_text: str
    color_scheme: ColorScheme


class RemoveBgRequest(BaseModel):
    image_url: str = Field(description="URL ảnh sản phẩm cần xóa nền")


class RemoveBgResponse(BaseModel):
    original_url: str
    no_bg_url: Optional[str] = None  # None nếu Clipdrop không khả dụng
    fallback: bool = False            # True nếu dùng ảnh gốc (skip remove bg)


class PosterImageRequest(BaseModel):
    """Request tạo poster bằng AI generative image."""
    product_name: str
    description: Optional[str] = None
    province: Optional[str] = None
    price_display: Optional[str] = None
    shop_name: Optional[str] = None
    image_url: Optional[str] = None  # ảnh sản phẩm (optional)

    model_config = {
        "json_schema_extra": {
            "example": {
                "product_name": "Xoài Cát Hòa Lộc",
                "price_display": "65.000đ/kg",
                "shop_name": "Vườn Trần Nông"
            }
        }
    }


class PosterImageResponse(BaseModel):
    image_base64: Optional[str] = None
    mime_type: str = "image/png"
    prompt_used: str
    fallback: bool = False
    error: Optional[str] = None
