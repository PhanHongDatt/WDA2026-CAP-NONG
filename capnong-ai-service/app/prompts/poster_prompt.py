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
Square 1:1 commercial food photography poster of fresh Vietnamese agricultural product "{product_name}".
{description_line}
{price_line}
{shop_line}
{province_line}

CRITICAL REQUIREMENTS:
- Aspect ratio: MUST be 1:1 SQUARE (equal width and height)
- The HERO subject is REAL fresh "{product_name}" (the actual fruit/vegetable/grain), photographed in appetizing commercial food photography style
- NEVER show: cosmetics, skincare, juice, beverages, processed food, houses, cars, people, or any non-agricultural items
- The fresh produce must occupy 40-60% of the poster, center-frame
- Include Vietnamese text "{product_name}" prominently on the poster, wrapped in double quotes for correct diacritics
- Background: clean white studio OR Vietnamese tropical farm/garden (lush green leaves, wooden crates)
- Color palette: natural greens, warm earth tones, vibrant fruit colors
- Lighting: high-key, appetizing, with soft shadows
- Layout: modern square social media marketing poster for farm-to-table e-commerce
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
