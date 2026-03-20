import type { Product } from "@/types/product";
import type { Shop } from "@/types/shop";
import type { Bundle } from "@/types/order";
import type { UnitResponse } from "@/types/unit";
import type { UserSummary } from "@/types/user";

// ============================================
// MOCK DATA — sẽ thay bằng API thật khi Backend sẵn sàng
// Khớp với API Contract v1.1 + Nghiệp vụ Baseline
// ============================================

// ─── Mock Units ───

const UNIT_KG: UnitResponse = {
  code: "KG", display_name: "Kilogram", symbol: "kg",
  base_unit: null, conversion_factor: 1, category: "WEIGHT", aliases: ["ky", "ki", "kilogam"],
};
const UNIT_TRAI: UnitResponse = {
  code: "TRAI", display_name: "Trái", symbol: "trái",
  base_unit: null, conversion_factor: 1, category: "COUNT", aliases: ["trai", "quả"],
};
const UNIT_HOP: UnitResponse = {
  code: "HOP", display_name: "Hộp", symbol: "hộp",
  base_unit: null, conversion_factor: 1, category: "PACKAGING", aliases: ["hop", "khay"],
};

// ─── Mock Users (Summary) ───

const FARMER_BACBA: UserSummary = {
  id: "a1b2c3d4-2222-4aaa-bbbb-000000000002",
  full_name: "Bác Ba Nhà Vườn", phone: "0902222222", role: "FARMER",
  shop_slug: "vuon-bac-ba",
};

const FARMER_CHUTU: UserSummary = {
  id: "a1b2c3d4-3333-4aaa-bbbb-000000000003",
  full_name: "Chú Tư Bến Tre", phone: "0903333333", role: "HTX_MEMBER",
  shop_slug: "hop-tac-xa-ben-tre",
};

const FARMER_CANTHO: UserSummary = {
  id: "a1b2c3d4-5555-4aaa-bbbb-000000000005",
  full_name: "Cô Sáu Cần Thơ", phone: "0905555555", role: "FARMER",
  shop_slug: "vuon-cay-an-trai-can-tho",
};

// ─── Seasonal Products ───

export const MOCK_SEASONAL_PRODUCTS: Product[] = [
  {
    id: "prod-0001-aaaa-bbbb-ccccddddeeee",
    name: "Cam Sành Hà Giang Loại 1",
    slug: "cam-sanh-ha-giang-loai-1",
    description: "Cam sành Hà Giang tươi ngon, vị ngọt thanh tự nhiên.",
    price_per_unit: 45000, unit: UNIT_KG, available_quantity: 500,
    category: "FRUIT", farming_method: "ORGANIC", pesticide_free: true,
    location_detail: "Bắc Quang, Hà Giang",
    harvest_date: "2026-04-15", available_from: "2026-04-10",
    status: "IN_SEASON",
    images: ["/images/products/cam-sanh.png"],
    average_rating: 4.8, total_reviews: 45, sold_count: 245,
    shop: {
      id: "shop-0001", slug: "nong-trai-xanh-da-lat", name: "Nông trại Xanh Đà Lạt",
      province: "Lâm Đồng", district: "Đà Lạt", avatar_url: "/images/farms/dalat.png",
      owner: FARMER_BACBA, average_rating: 4.8, total_reviews: 120,
    },
    created_at: "2026-03-01T00:00:00Z", updated_at: "2026-03-14T00:00:00Z",
  },
  {
    id: "prod-0002-aaaa-bbbb-ccccddddeeee",
    name: "Sầu Riêng Ri6 Đắk Lắk",
    slug: "sau-rieng-ri6-dak-lak",
    description: "Sầu riêng Ri6 chính gốc Đắk Lắk, cơm vàng, hạt lép.",
    price_per_unit: 125000, unit: UNIT_KG, available_quantity: 200,
    category: "FRUIT", farming_method: "ORGANIC", pesticide_free: true,
    location_detail: "Krông Năng, Đắk Lắk",
    harvest_date: "2026-04-10", available_from: "2026-04-05",
    status: "IN_SEASON",
    images: ["/images/products/sau-rieng.png"],
    average_rating: 4.9, total_reviews: 30, sold_count: 180,
    shop: {
      id: "shop-0002", slug: "hop-tac-xa-ben-tre", name: "Hợp tác xã Bến Tre",
      province: "Bến Tre", district: "TP. Bến Tre", avatar_url: "/images/farms/bentre.png",
      owner: FARMER_CHUTU, average_rating: 4.9, total_reviews: 85,
    },
    created_at: "2026-03-05T00:00:00Z", updated_at: "2026-03-14T00:00:00Z",
  },
  {
    id: "prod-0003-aaaa-bbbb-ccccddddeeee",
    name: "Bưởi Da Xanh Bến Tre",
    slug: "buoi-da-xanh-ben-tre",
    description: "Bưởi da xanh vỏ mỏng ruột hồng, vị ngọt thanh.",
    price_per_unit: 68000, unit: UNIT_TRAI, available_quantity: 350,
    category: "FRUIT", farming_method: "ORGANIC", pesticide_free: true,
    location_detail: "Châu Thành, Bến Tre",
    harvest_date: "2026-04-12",
    status: "IN_SEASON",
    images: ["/images/products/buoi-da-xanh.png"],
    average_rating: 4.7, total_reviews: 22, sold_count: 320,
    shop: {
      id: "shop-0002", slug: "hop-tac-xa-ben-tre", name: "HTX Trái cây Bến Tre",
      province: "Bến Tre", district: "Châu Thành", avatar_url: "/images/farms/bentre.png",
      owner: FARMER_CHUTU, average_rating: 4.9, total_reviews: 85,
    },
    created_at: "2026-03-02T00:00:00Z", updated_at: "2026-03-14T00:00:00Z",
  },
  {
    id: "prod-0004-aaaa-bbbb-ccccddddeeee",
    name: "Xoài Cát Hòa Lộc Tiền Giang",
    slug: "xoai-cat-hoa-loc-tien-giang",
    description: "Xoài cát Hòa Lộc, thịt vàng đậm, thơm nồng, vị ngọt thanh.",
    price_per_unit: 95000, unit: UNIT_KG, available_quantity: 150,
    category: "FRUIT", farming_method: "VIETGAP", pesticide_free: true,
    location_detail: "Cái Bè, Tiền Giang",
    harvest_date: "2026-04-20",
    status: "IN_SEASON",
    images: ["/images/products/xoai-cat.png"],
    average_rating: 4.9, total_reviews: 58, sold_count: 420,
    shop: {
      id: "shop-0003", slug: "vuon-cay-an-trai-can-tho", name: "Nhà Vườn Bác Ba",
      province: "Tiền Giang", district: "Cái Bè",
      owner: FARMER_BACBA, average_rating: 4.7, total_reviews: 200,
    },
    created_at: "2026-03-01T00:00:00Z", updated_at: "2026-03-14T00:00:00Z",
  },
];

// ─── New Products ───

export const MOCK_NEW_PRODUCTS: Product[] = [
  {
    id: "prod-0005-aaaa-bbbb-ccccddddeeee",
    name: "Cá Tầm Sapa Tươi Sống",
    slug: "ca-tam-sapa-tuoi-song",
    description: "Cá tầm Sapa được nuôi trong nước lạnh tự nhiên.",
    price_per_unit: 280000, unit: UNIT_KG, available_quantity: 50,
    category: "OTHER", farming_method: "TRADITIONAL", pesticide_free: false,
    location_detail: "Sa Pa, Lào Cai",
    status: "IN_SEASON",
    images: ["/images/products/ca-tam.png"],
    average_rating: 4.6, total_reviews: 12, sold_count: 78,
    shop: {
      id: "shop-0005", slug: "trang-trai-sapa", name: "Trang trại Sapa",
      province: "Lào Cai", district: "Sa Pa",
      owner: FARMER_CANTHO, average_rating: 4.6, total_reviews: 45,
    },
    created_at: "2026-03-10T00:00:00Z", updated_at: "2026-03-14T00:00:00Z",
  },
  {
    id: "prod-0006-aaaa-bbbb-ccccddddeeee",
    name: "Nấm Mối Đen Hữu Cơ",
    slug: "nam-moi-den-huu-co",
    description: "Nấm mối đen hữu cơ, giàu dinh dưỡng.",
    price_per_unit: 55000, unit: UNIT_HOP, available_quantity: 120,
    category: "VEGETABLE", farming_method: "ORGANIC", pesticide_free: true,
    location_detail: "Đà Lạt, Lâm Đồng",
    status: "IN_SEASON",
    images: ["/images/products/nam-moi.png"],
    average_rating: 4.8, total_reviews: 18, sold_count: 95,
    shop: {
      id: "shop-0001", slug: "nong-trai-xanh-da-lat", name: "Nông trại Xanh Đà Lạt",
      province: "Lâm Đồng", district: "Đà Lạt", avatar_url: "/images/farms/dalat.png",
      owner: FARMER_BACBA, average_rating: 4.8, total_reviews: 120,
    },
    created_at: "2026-03-08T00:00:00Z", updated_at: "2026-03-14T00:00:00Z",
  },
  {
    id: "prod-0007-aaaa-bbbb-ccccddddeeee",
    name: "Khoai Lang Mật Đà Lạt",
    slug: "khoai-lang-mat-da-lat",
    description: "Khoai lang mật Đà Lạt, vỏ tím ruột vàng, vị ngọt tự nhiên.",
    price_per_unit: 35000, unit: UNIT_KG, available_quantity: 300,
    category: "TUBER", farming_method: "TRADITIONAL", pesticide_free: false,
    location_detail: "Đức Trọng, Lâm Đồng",
    status: "IN_SEASON",
    images: ["/images/products/rau-mam.png"],
    average_rating: 4.5, total_reviews: 25, sold_count: 150,
    shop: {
      id: "shop-0001", slug: "nong-trai-xanh-da-lat", name: "Nông trại Xanh Đà Lạt",
      province: "Lâm Đồng", district: "Đức Trọng", avatar_url: "/images/farms/dalat.png",
      owner: FARMER_BACBA, average_rating: 4.8, total_reviews: 120,
    },
    created_at: "2026-03-12T00:00:00Z", updated_at: "2026-03-14T00:00:00Z",
  },
  {
    id: "prod-0008-aaaa-bbbb-ccccddddeeee",
    name: "Rau Mầm Đá Hà Giang",
    slug: "rau-mam-da-ha-giang",
    description: "Rau mầm đá đặc sản Hà Giang, giàu khoáng chất.",
    price_per_unit: 35000, unit: UNIT_KG, available_quantity: 200,
    category: "HERB", farming_method: "ORGANIC", pesticide_free: true,
    location_detail: "Đồng Văn, Hà Giang",
    status: "IN_SEASON",
    images: ["/images/products/rau-mam.png"],
    average_rating: 4.7, total_reviews: 10, sold_count: 60,
    shop: {
      id: "shop-0007", slug: "htx-ha-giang", name: "Hợp tác xã Hà Giang",
      province: "Hà Giang", district: "Đồng Văn",
      owner: FARMER_CANTHO, average_rating: 4.5, total_reviews: 30,
    },
    created_at: "2026-03-11T00:00:00Z", updated_at: "2026-03-14T00:00:00Z",
  },
];

// ─── Mock Shops ───

export const MOCK_SHOPS: Shop[] = [
  {
    id: "shop-0001", slug: "nong-trai-xanh-da-lat", name: "Nông trại Xanh Đà Lạt",
    province: "Lâm Đồng", district: "Đà Lạt",
    bio: "Nông trại chuyên cung cấp rau củ quả sạch Đà Lạt từ năm 2011.",
    avatar_url: "/images/farms/dalat.png", cover_url: "",
    years_experience: 15, farm_area_m2: 50000,
    owner: FARMER_BACBA,
    average_rating: 4.8, total_reviews: 120,
    created_at: "2020-01-01T00:00:00Z",
  },
  {
    id: "shop-0002", slug: "hop-tac-xa-ben-tre", name: "Hợp tác xã Bến Tre",
    province: "Bến Tre", district: "TP. Bến Tre",
    bio: "HTX Trái cây Bến Tre chuyên dừa, bưởi, sầu riêng chất lượng cao.",
    avatar_url: "/images/farms/bentre.png", cover_url: "",
    years_experience: 8, farm_area_m2: 30000,
    owner: FARMER_CHUTU,
    htx: { id: "htx-001", name: "HTX Trái Cây Bến Tre", province: "Bến Tre", status: "ACTIVE", total_members: 25 },
    average_rating: 4.9, total_reviews: 85,
    created_at: "2018-06-15T00:00:00Z",
  },
  {
    id: "shop-0003", slug: "vuon-cay-an-trai-can-tho", name: "Vườn Cây Ăn Trái Cần Thơ",
    province: "Cần Thơ", district: "Phong Điền",
    bio: "Vườn trái cây Phong Điền với hơn 20 năm kinh nghiệm.",
    avatar_url: "/images/farms/cantho.png", cover_url: "",
    years_experience: 20, farm_area_m2: 80000,
    owner: FARMER_CANTHO,
    average_rating: 4.7, total_reviews: 200,
    created_at: "2006-03-01T00:00:00Z",
  },
];

// ─── Mock Bundle (thay CoopPool) ───

export const MOCK_BUNDLE: Bundle = {
  id: "bundle-0001-aaaa-bbbb-cccc",
  htx_shop: {
    id: "htx-shop-001", slug: "htx-01234567", name: "HTX Trái Cây Bến Tre - Gom sỉ",
    htx: { id: "htx-001", name: "HTX Trái Cây Bến Tre", province: "Bến Tre", status: "ACTIVE", total_members: 25 },
    province: "Bến Tre", district: "TP. Bến Tre",
    active_bundles_count: 2, created_at: "2026-01-01T00:00:00Z",
  },
  product_category: "FRUIT",
  product_name: "Cam sành Vĩnh Long - Bến Tre",
  unit: UNIT_KG,
  target_quantity: 1000,
  current_pledged_quantity: 650,
  current_sold_quantity: 200,
  progress_percent: 65,
  price_per_unit: 35000,
  deadline: "2026-04-01",
  status: "OPEN",
  description: "Gom cam sành loại 1 cho đơn sỉ siêu thị.",
  min_pledge_quantity: 50,
  pledges: [
    {
      id: "pledge-001", farmer: FARMER_CHUTU, quantity: 300, unit: UNIT_KG,
      contribution_percent: 46.15, status: "ACTIVE", created_at: "2026-03-10T00:00:00Z",
    },
    {
      id: "pledge-002", farmer: FARMER_BACBA, quantity: 350, unit: UNIT_KG,
      contribution_percent: 53.85, status: "ACTIVE", created_at: "2026-03-11T00:00:00Z",
    },
  ],
  created_at: "2026-03-09T00:00:00Z",
};

// ─── Flash Deals ───

export const MOCK_FLASH_DEALS: Product[] = [
  {
    id: "flash-001", name: "Cam Sành Hà Giang", slug: "cam-sanh-flash",
    description: "Deal sốc hôm nay", price_per_unit: 29000, unit: UNIT_KG,
    available_quantity: 30, category: "FRUIT", farming_method: "ORGANIC",
    pesticide_free: true, location_detail: "Hà Giang",
    status: "IN_SEASON", images: ["/images/products/cam-sanh.png"],
    average_rating: 4.8, total_reviews: 45, sold_count: 180,
    shop: {
      id: "shop-0001", slug: "nong-trai-xanh-da-lat", name: "Nông trại Xanh",
      province: "Hà Giang", district: "Bắc Quang", avatar_url: "/images/farms/dalat.png",
      owner: FARMER_BACBA, average_rating: 4.8, total_reviews: 120,
    },
    created_at: "2026-03-15T00:00:00Z", updated_at: "2026-03-15T00:00:00Z",
  },
  {
    id: "flash-002", name: "Sầu Riêng Ri6", slug: "sau-rieng-flash",
    description: "Deal sốc hôm nay", price_per_unit: 89000, unit: UNIT_KG,
    available_quantity: 20, category: "FRUIT", farming_method: "ORGANIC",
    pesticide_free: true, location_detail: "Đắk Lắk",
    status: "IN_SEASON", images: ["/images/products/sau-rieng.png"],
    average_rating: 4.9, total_reviews: 30, sold_count: 320,
    shop: {
      id: "shop-0002", slug: "hop-tac-xa-ben-tre", name: "Vườn Bến Tre",
      province: "Bến Tre", district: "TP. Bến Tre", avatar_url: "/images/farms/bentre.png",
      owner: FARMER_CHUTU, average_rating: 4.9, total_reviews: 85,
    },
    created_at: "2026-03-15T00:00:00Z", updated_at: "2026-03-15T00:00:00Z",
  },
  {
    id: "flash-003", name: "Bưởi Da Xanh Bến Tre", slug: "buoi-flash",
    description: "Deal sốc hôm nay", price_per_unit: 35000, unit: UNIT_TRAI,
    available_quantity: 50, category: "FRUIT", farming_method: "ORGANIC",
    pesticide_free: true, location_detail: "Bến Tre",
    status: "IN_SEASON", images: ["/images/products/buoi-da-xanh.png"],
    average_rating: 4.7, total_reviews: 22, sold_count: 450,
    shop: {
      id: "shop-0002", slug: "hop-tac-xa-ben-tre", name: "Vườn Bến Tre",
      province: "Bến Tre", district: "TP. Bến Tre", avatar_url: "/images/farms/bentre.png",
      owner: FARMER_CHUTU, average_rating: 4.9, total_reviews: 85,
    },
    created_at: "2026-03-15T00:00:00Z", updated_at: "2026-03-15T00:00:00Z",
  },
  {
    id: "flash-004", name: "Xoài Cát Hòa Lộc", slug: "xoai-flash",
    description: "Deal sốc hôm nay", price_per_unit: 55000, unit: UNIT_KG,
    available_quantity: 40, category: "FRUIT", farming_method: "VIETGAP",
    pesticide_free: true, location_detail: "Tiền Giang",
    status: "IN_SEASON", images: ["/images/products/xoai-cat.png"],
    average_rating: 4.6, total_reviews: 15, sold_count: 210,
    shop: {
      id: "shop-0003", slug: "vuon-cay-an-trai-can-tho", name: "Vườn Cần Thơ",
      province: "Cần Thơ", district: "Phong Điền", avatar_url: "/images/farms/cantho.png",
      owner: FARMER_CANTHO, average_rating: 4.7, total_reviews: 200,
    },
    created_at: "2026-03-15T00:00:00Z", updated_at: "2026-03-15T00:00:00Z",
  },
  {
    id: "flash-005", name: "Nấm Mối Tây Ninh", slug: "nam-flash",
    description: "Deal sốc hôm nay", price_per_unit: 65000, unit: UNIT_KG,
    available_quantity: 15, category: "VEGETABLE", farming_method: "ORGANIC",
    pesticide_free: true, location_detail: "Tây Ninh",
    status: "IN_SEASON", images: ["/images/products/nam-moi.png"],
    average_rating: 4.5, total_reviews: 8, sold_count: 95,
    shop: {
      id: "shop-0001", slug: "nong-trai-xanh-da-lat", name: "Nông trại Xanh",
      province: "Tây Ninh", district: "Tân Biên", avatar_url: "/images/farms/dalat.png",
      owner: FARMER_BACBA, average_rating: 4.8, total_reviews: 120,
    },
    created_at: "2026-03-15T00:00:00Z", updated_at: "2026-03-15T00:00:00Z",
  },
  {
    id: "flash-006", name: "Rau Mầm Đà Lạt", slug: "rau-mam-flash",
    description: "Deal sốc hôm nay", price_per_unit: 18000, unit: UNIT_HOP,
    available_quantity: 60, category: "VEGETABLE", farming_method: "ORGANIC",
    pesticide_free: true, location_detail: "Đà Lạt",
    status: "IN_SEASON", images: ["/images/products/rau-mam.png"],
    average_rating: 4.8, total_reviews: 33, sold_count: 530,
    shop: {
      id: "shop-0001", slug: "nong-trai-xanh-da-lat", name: "Nông trại Xanh",
      province: "Lâm Đồng", district: "Đà Lạt", avatar_url: "/images/farms/dalat.png",
      owner: FARMER_BACBA, average_rating: 4.8, total_reviews: 120,
    },
    created_at: "2026-03-15T00:00:00Z", updated_at: "2026-03-15T00:00:00Z",
  },
];

// ─── Legacy export (backward compat) ───
/** @deprecated Dùng MOCK_BUNDLE thay thế */
export const MOCK_COOP_POOL = MOCK_BUNDLE;
