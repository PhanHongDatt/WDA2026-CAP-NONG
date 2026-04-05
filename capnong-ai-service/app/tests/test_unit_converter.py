import pytest
from app.services.unit_converter import convert_to_kg, convert_price_unit, is_weight_unit


def test_convert_ta_to_kg():
    result = convert_to_kg(5, "tạ")
    assert result is not None
    assert result.converted_value == 500.0
    assert result.converted_unit == "kg"


def test_convert_yen_to_kg():
    result = convert_to_kg(3, "yến")
    assert result.converted_value == 30.0


def test_convert_lang_to_kg():
    result = convert_to_kg(2, "lạng")
    assert result.converted_value == 0.2


def test_convert_kg_unchanged():
    result = convert_to_kg(10, "kg")
    assert result.converted_value == 10.0
    assert result.note == ""  # Không cần ghi chú khi đã là kg


def test_count_unit_not_converted():
    result = convert_to_kg(5, "trái")
    assert result is None


def test_convert_price_per_ta_to_per_kg():
    # 300.000đ/tạ → 3.000đ/kg
    price_per_kg = convert_price_unit(300_000, "tạ", "kg")
    assert price_per_kg == 3_000.0


def test_is_weight_unit():
    assert is_weight_unit("tạ") is True
    assert is_weight_unit("yến") is True
    assert is_weight_unit("trái") is False
    assert is_weight_unit("bó") is False