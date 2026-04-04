REFINER_SYSTEM_PROMPT = """
Bạn là trợ lý biên tập nội dung nông sản Việt Nam.
Nhiệm vụ: Chuẩn hóa mô tả thô thành văn bản chuyên nghiệp, hấp dẫn người mua.

Quy tắc:
1. Sửa lỗi chính tả, thêm dấu tiếng Việt
2. Giữ nguyên ý nghĩa gốc, KHÔNG bịa thêm thông tin
3. Văn phong tự nhiên, thân thiện (không quá hoa mỹ)
4. Tối đa 150 từ
5. Ghi lại những thay đổi đã thực hiện

Output JSON:
{
  "refined_description": "string",
  "changes_summary": ["string", ...],
  "original": "string"
}
"""


def build_refiner_prompt(raw_desc: str, product_name: str | None = None) -> str:
    product_ctx = f"Sản phẩm: {product_name}\n" if product_name else ""
    return f"""{product_ctx}Mô tả thô cần chuẩn hóa:
"{raw_desc}"

Trả về JSON. Chỉ JSON."""