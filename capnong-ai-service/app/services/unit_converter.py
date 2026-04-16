"""
Quy đổi đơn vị đo lường địa phương Việt Nam về đơn vị chuẩn.

Bảng quy đổi chuẩn:
  Trọng lượng:
    1 tạ  = 100 kg
    1 yến =  10 kg
    1 lạng = 0.1 kg (100g) — lạng thuốc bắc = 37.5g, dùng 100g cho nông sản
    1 cân  =   1 kg (= 1 kg theo dân gian Nam Bộ)
    1 gram = 0.001 kg
    1 tấn  = 1000 kg

  Số lượng (không quy đổi, giữ nguyên):
    trái, cái, quả, bó, bắp, cây, chùm, thùng, túi, rổ, kg, gram
"""

from dataclasses import dataclass
from typing import Optional
import re


@dataclass
class ConversionResult:
    converted_value: float
    converted_unit: str
    original_value: float
    original_unit: str
    note: str


# Bảng quy đổi về KG
WEIGHT_TO_KG: dict[str, float] = {
    # Tiêu chuẩn
    "kg": 1.0,
    "kilo": 1.0,
    "kilogram": 1.0,
    "g": 0.001,
    "gram": 0.001,
    "tấn": 1000.0,
    "tan": 1000.0,
    # Địa phương
    "tạ": 100.0,
    "ta": 100.0,
    "yến": 10.0,
    "yen": 10.0,
    "lạng": 0.1,
    "lang": 0.1,
    "cân": 1.0,
    "can": 1.0,
    # Miền Nam hay dùng
    "ký": 1.0,
    "ky": 1.0,
}

# Đơn vị số lượng — giữ nguyên, không quy đổi về kg
COUNT_UNITS: set[str] = {
    "trái", "trai", "cái", "cai", "quả", "qua",
    "bó", "bo", "bắp", "bap", "cây", "cay",
    "chùm", "chum", "thùng", "thung",
    "túi", "tui", "rổ", "ro", "hộp", "hop",
    "buồng", "buong", "nải", "nai",
}

# Số chữ → số
VIETNAMESE_NUMBERS: dict[str, int] = {
    "không": 0, "một": 1, "hai": 2, "ba": 3, "bốn": 4, "bon": 4,
    "năm": 5, "nam": 5, "sáu": 6, "sau": 6, "bảy": 7, "bay": 7,
    "tám": 8, "tam": 8, "chín": 9, "chin": 9, "mười": 10, "muoi": 10,
    "mươi": 10, "muoi": 10, "hai mươi": 20, "ba mươi": 30,
    "bốn mươi": 40, "năm mươi": 50, "trăm": 100,
    "nghìn": 1000, "ngàn": 1000, "triệu": 1_000_000,
}


def normalize_unit(raw: str) -> str:
    """Chuẩn hoá tên đơn vị về dạng lowercase không dấu một phần."""
    return raw.lower().strip()


def is_weight_unit(unit: str) -> bool:
    return normalize_unit(unit) in WEIGHT_TO_KG


def is_count_unit(unit: str) -> bool:
    return normalize_unit(unit) in COUNT_UNITS


def convert_to_kg(value: float, unit: str) -> Optional[ConversionResult]:
    """
    Quy đổi giá trị + đơn vị về kg.
    Trả về None nếu đơn vị không phải trọng lượng.
    """
    norm = normalize_unit(unit)
    if norm not in WEIGHT_TO_KG:
        return None

    factor = WEIGHT_TO_KG[norm]
    converted = value * factor

    note = ""
    if norm not in ("kg", "ky", "ký", "kilo"):
        note = f"Đã quy đổi {value:g} {unit} → {converted:g} kg"

    return ConversionResult(
        converted_value=converted,
        converted_unit="kg",
        original_value=value,
        original_unit=unit,
        note=note,
    )


def convert_price_unit(price: float, from_unit: str, to_unit: str = "kg") -> Optional[float]:
    """
    Chuyển đổi đơn giá về giá/kg.
    Ví dụ: 250_000 VND/tạ → 2_500 VND/kg
    """
    norm_from = normalize_unit(from_unit)
    norm_to = normalize_unit(to_unit)

    if norm_from not in WEIGHT_TO_KG or norm_to not in WEIGHT_TO_KG:
        return None

    factor_from = WEIGHT_TO_KG[norm_from]
    factor_to = WEIGHT_TO_KG[norm_to]

    # price/from_unit → price/to_unit
    return price * factor_to / factor_from