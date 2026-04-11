POSTER_SYSTEM_PROMPT = """
Bạn là designer poster bán hàng nông sản Việt Nam cho mạng xã hội.
Tạo NỘI DUNG TEXT cho poster (KHÔNG tạo ảnh). Frontend sẽ render poster từ dữ liệu bạn tạo.

3 TEMPLATE có sẵn:
1. FRESH_GREEN: Tươi mát, xanh lá, phù hợp rau xanh & trái cây tươi
2. WARM_HARVEST: Ấm áp, tông vàng cam, phù hợp ngũ cốc & đặc sản
3. MINIMAL_WHITE: Tối giản, trắng sạch, phù hợp sản phẩm hữu cơ cao cấp

RÀNG BUỘC:
- headline: TỐI ĐA 8 từ, hấp dẫn, gợi cảm xúc
- tagline: TỐI ĐA 15 từ, nhấn mạnh USP (nguồn gốc, chất lượng, độ tươi)
- price_display: Giữ nguyên giá từ input hoặc format lại cho đẹp
- badge_texts: 2-3 badge ngắn (VD: "VietGAP", "Hữu cơ", "Tươi sáng nay")
- cta_text: Call-to-action ngắn gọn (VD: "Đặt ngay!", "Inbox giá sỉ")
- color_scheme: HEX colors phù hợp template + loại sản phẩm

Trả về JSON hợp lệ, KHÔNG markdown:
{
  "template": "FRESH_GREEN|WARM_HARVEST|MINIMAL_WHITE",
  "headline": "string",
  "tagline": "string",
  "price_display": "string",
  "badge_texts": ["string", "string"],
  "shop_display": "string",
  "cta_text": "string",
  "color_scheme": {
    "primary": "#hex",
    "accent": "#hex",
    "text_on_primary": "#hex",
    "background": "#hex"
  }
}
"""

POSTER_IMAGE_PROMPT_TEMPLATE = """
Create a Vietnamese agricultural product advertising poster.
Product: {product_name}
{description_line}
{price_line}
{shop_line}
{province_line}

Style: Clean, modern Vietnamese farm produce poster. Vibrant colors.
Show fresh produce prominently. Include product name in Vietnamese.
The poster should look professional and suitable for social media marketing.
Do NOT include any English text. All text must be in Vietnamese.
"""


def build_poster_prompt(product_name: str, description: str | None = None,
                        province: str | None = None, price_display: str | None = None,
                        shop_name: str | None = None, template: str = "FRESH_GREEN") -> str:
    parts = [
        f"Tên sản phẩm: {product_name}",
        f"Template: {template}",
    ]
    if description:
        parts.append(f"Mô tả: {description}")
    if province:
        parts.append(f"Tỉnh: {province}")
    if price_display:
        parts.append(f"Giá: {price_display}")
    if shop_name:
        parts.append(f"Tên shop: {shop_name}")

    parts.append("\nTạo nội dung text cho poster. Trả về JSON. Chỉ JSON.")
    return "\n".join(parts)


def build_poster_image_prompt(product_name: str, description: str | None = None,
                              province: str | None = None, price_display: str | None = None,
                              shop_name: str | None = None) -> str:
    return POSTER_IMAGE_PROMPT_TEMPLATE.format(
        product_name=product_name,
        description_line=f"Description: {description}" if description else "",
        price_line=f"Price: {price_display}" if price_display else "",
        shop_line=f"Shop: {shop_name}" if shop_name else "",
        province_line=f"Origin: {province}" if province else "",
    ).strip()
