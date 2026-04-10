import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

MOCK_GEMINI_RESPONSE = {
    "product_name": {"value": "Xoài cát Chu", "confidence": 0.95, "raw_value": "xoài cát chu"},
    "description": {"value": None, "confidence": 0.0, "raw_value": None},
    "price_per_unit": {"value": 25000, "confidence": 0.95, "raw_value": "hai mươi lăm ngàn"},
    "price_unit": {"value": "kg", "confidence": 0.95, "raw_value": "một ký"},
    "quantity": {"value": 5, "confidence": 0.95, "raw_value": "năm"},
    "quantity_unit": {"value": "tạ", "confidence": 0.95, "raw_value": "tạ"},
    "harvest_date": {"value": "tuần sau", "confidence": 0.90, "raw_value": "tuần sau"},
    "farming_method": {"value": None, "confidence": 0.0, "raw_value": None},
    "location": {"value": None, "confidence": 0.0, "raw_value": None},
}


@patch("app.routers.voice.extract_product_from_transcript", new_callable=AsyncMock)
def test_voice_to_product_basic(mock_extract):
    mock_extract.return_value = MOCK_GEMINI_RESPONSE

    response = client.post("/ai/voice-to-product", json={
        "transcript": "tôi có năm tạ xoài cát chu giá hai mươi lăm ngàn một ký thu hoạch tuần sau"
    })
    assert response.status_code == 200
    data = response.json()

    # Kiểm tra quy đổi đơn vị tạ → kg
    assert data["quantity"]["value"] == 500.0
    assert data["quantity_unit"]["value"] == "kg"
    assert "Đã quy đổi 5 tạ → 500 kg" in data["processing_notes"]

    # Kiểm tra confidence level
    assert data["product_name"]["confidence_level"] == "high"


@patch("app.routers.voice.extract_product_from_transcript", new_callable=AsyncMock)
def test_empty_transcript_rejected(mock_extract):
    response = client.post("/ai/voice-to-product", json={"transcript": "ab"})
    assert response.status_code == 422  # Validation error