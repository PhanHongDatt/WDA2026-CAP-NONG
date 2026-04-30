from pydantic import BaseModel, Field
from typing import Optional


class ProactiveDigestRequest(BaseModel):
    """Request để sinh thông báo chủ động cho nông dân."""
    province: str = Field(default="Tiền Giang", description="Tỉnh/thành canh tác")
    farmer_name: Optional[str] = Field(default=None, description="Tên nông dân (để xưng hô)")
    products: list[str] = Field(default_factory=list, description="Danh sách sản phẩm đang bán, VD: ['Bưởi Da Xanh', 'Xoài Cát Chu']")

    model_config = {
        "json_schema_extra": {
            "example": {
                "province": "Tiền Giang",
                "farmer_name": "Bác Tám",
                "products": ["Bưởi Da Xanh", "Xoài Cát Chu"],
            }
        }
    }


class ProactiveNotification(BaseModel):
    """Một thông báo chủ động AI sinh ra."""
    type: str = Field(description="WEATHER_ALERT | PRICE_TREND | HARVEST_TIP | MARKET_OPPORTUNITY")
    title: str = Field(description="Tiêu đề ngắn gọn")
    message: str = Field(description="Nội dung thông báo, giọng thân thiện xưng con/bác")
    priority: str = Field(default="normal", description="high | normal | low")
    action_url: Optional[str] = Field(default=None, description="URL hành động, VD: /dashboard/products/new")


class ProactiveDigestResponse(BaseModel):
    """Response chứa danh sách thông báo chủ động."""
    notifications: list[ProactiveNotification] = Field(default_factory=list)
    weather_summary: Optional[str] = Field(default=None, description="Tóm tắt thời tiết hôm nay")
    province: str = ""
