-- ==============================
-- Seed Data cho Cạp Nông
-- Chỉ seed dữ liệu cốt lõi để test FE: units, users, htx, shops, products, images
-- Bỏ orders/reviews vì schema DB có thể khác entity do migration
-- ==============================

-- Xóa sạch dữ liệu cũ
TRUNCATE TABLE reviews, order_items, sub_orders, orders, cart_items, carts,
               product_images, products, shops, user_addresses,
               htx_join_requests, users, htx, units CASCADE;

-- ═══════════════════════════════════════════════
-- 1. UNITS
-- BaseEntity columns: id, deleted, created_at, updated_at
-- Own columns: code, display_name, symbol, base_unit_id, conversion_factor, category
-- ═══════════════════════════════════════════════
INSERT INTO units (id, code, display_name, symbol, base_unit_id, conversion_factor, category, deleted, created_at, updated_at) VALUES
('cbc00000-0000-0000-0000-000000000001', 'KG',    'Kilogram',  'kg',    NULL,                                    1.000000,    'WEIGHT',    false, NOW(), NOW()),
('cbc00000-0000-0000-0000-000000000002', 'G',     'Gram',      'g',     'cbc00000-0000-0000-0000-000000000001',   0.001000,    'WEIGHT',    false, NOW(), NOW()),
('cbc00000-0000-0000-0000-000000000003', 'TAN',   'Tấn',       't',     'cbc00000-0000-0000-0000-000000000001',   1000.000000, 'WEIGHT',    false, NOW(), NOW()),
('cbc00000-0000-0000-0000-000000000004', 'YEN',   'Yến',       'yến',   'cbc00000-0000-0000-0000-000000000001',   10.000000,   'WEIGHT',    false, NOW(), NOW()),
('cbc00000-0000-0000-0000-000000000005', 'TA',    'Tạ',        'tạ',    'cbc00000-0000-0000-0000-000000000001',   100.000000,  'WEIGHT',    false, NOW(), NOW()),
('cbc00000-0000-0000-0000-000000000006', 'LIT',   'Lít',       'L',     NULL,                                    1.000000,    'VOLUME',    false, NOW(), NOW()),
('cbc00000-0000-0000-0000-000000000007', 'ML',    'Mililít',   'mL',    'cbc00000-0000-0000-0000-000000000006',   0.001000,    'VOLUME',    false, NOW(), NOW()),
('cbc00000-0000-0000-0000-000000000008', 'TRAI',  'Trái',      'trái',  NULL,                                    1.000000,    'COUNT',     false, NOW(), NOW()),
('cbc00000-0000-0000-0000-000000000009', 'CU',    'Củ',        'củ',    NULL,                                    1.000000,    'COUNT',     false, NOW(), NOW()),
('cbc00000-0000-0000-0000-000000000010', 'BO',    'Bó',        'bó',    NULL,                                    1.000000,    'COUNT',     false, NOW(), NOW()),
('cbc00000-0000-0000-0000-000000000011', 'THUNG', 'Thùng',     'thùng', NULL,                                    1.000000,    'PACKAGING', false, NOW(), NOW()),
('cbc00000-0000-0000-0000-000000000012', 'BAO',   'Bao',       'bao',   NULL,                                    1.000000,    'PACKAGING', false, NOW(), NOW()),
('cbc00000-0000-0000-0000-000000000013', 'HOP',   'Hộp',       'hộp',   NULL,                                    1.000000,    'PACKAGING', false, NOW(), NOW()),
('cbc00000-0000-0000-0000-000000000014', 'GIO',   'Giỏ',       'giỏ',   NULL,                                    1.000000,    'PACKAGING', false, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ═══════════════════════════════════════════════
-- 2. ADMIN USER (insert trước HTX vì HTX cần created_by_user_id)
-- User columns: id, username, full_name, phone, email, password, role, avatar_url,
--               htx_id, is_active, is_email_verified, is_deleted, created_at, updated_at
-- ═══════════════════════════════════════════════
INSERT INTO users (id, username, full_name, phone, email, password, role, avatar_url, is_active, is_email_verified, is_deleted, created_at, updated_at) VALUES
('b0000000-0000-0000-0000-000000000001', 'admin', 'Admin Hệ Thống', '0900000000', 'admin@capnong.shop',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', true, true, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════
-- 3. HTX
-- BaseEntity + own: name, official_code, province, ward, description,
--                   document_url, status, manager_id, admin_note, created_by_user_id
-- ═══════════════════════════════════════════════
INSERT INTO htx (id, name, official_code, province, ward, description, status, created_by_user_id, deleted, created_at, updated_at) VALUES
('a0000000-0000-0000-0000-000000000001', 'HTX Nông nghiệp sạch Đà Lạt', 'HTX-DL-001', 'Lâm Đồng', 'Đà Lạt',
 'HTX chuyên cung cấp rau củ quả chuẩn VietGAP.', 'ACTIVE', 'b0000000-0000-0000-0000-000000000001', false, NOW(), NOW()),
('a0000000-0000-0000-0000-000000000002', 'HTX Trái cây Đồng Tháp', 'HTX-DT-001', 'Đồng Tháp', 'Cao Lãnh',
 'Liên minh vườn cây ăn trái ĐBSCL.', 'ACTIVE', 'b0000000-0000-0000-0000-000000000001', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════
-- 4. REMAINING USERS (now HTX exists, can reference htx_id)
-- ═══════════════════════════════════════════════
INSERT INTO users (id, username, full_name, phone, email, password, role, htx_id, avatar_url, is_active, is_email_verified, is_deleted, created_at, updated_at) VALUES
-- HTX Managers
('b0000000-0000-0000-0000-000000000002', 'htx_manager_1', 'Trần Văn Quản', '0900000001', 'quanly1@capnong.shop',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HTX_MANAGER', 'a0000000-0000-0000-0000-000000000001',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager1', true, true, false, NOW(), NOW()),
('b0000000-0000-0000-0000-000000000003', 'htx_manager_2', 'Lê Thị Hoa', '0900000002', 'quanly2@capnong.shop',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HTX_MANAGER', 'a0000000-0000-0000-0000-000000000002',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager2', true, true, false, NOW(), NOW()),
-- Farmers
('b0000000-0000-0000-0000-000000000004', 'farmer_lehoa', 'Lê Văn Hoa', '0910000001', 'lehoa@capnong.shop',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'FARMER', 'a0000000-0000-0000-0000-000000000001',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeHoa', true, true, false, NOW(), NOW()),
('b0000000-0000-0000-0000-000000000005', 'farmer_trannong', 'Trần Văn Nông', '0910000002', 'trannong@capnong.shop',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'FARMER', 'a0000000-0000-0000-0000-000000000002',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranNong', true, true, false, NOW(), NOW()),
('b0000000-0000-0000-0000-000000000006', 'farmer_nguyenxuan', 'Nguyễn Xuân', '0910000003', 'nguyenxuan@capnong.shop',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'FARMER', NULL,
 'https://api.dicebear.com/7.x/avataaars/svg?seed=NXuan', true, true, false, NOW(), NOW()),
-- Buyers
('b0000000-0000-0000-0000-000000000007', 'buyer_minh', 'Nguyễn Văn Minh', '0930000001', 'minh@gmail.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL,
 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minh', true, true, false, NOW(), NOW()),
('b0000000-0000-0000-0000-000000000008', 'buyer_lan', 'Trần Thị Lan', '0930000002', 'lan@gmail.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL,
 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan', true, true, false, NOW(), NOW()),
('b0000000-0000-0000-0000-000000000009', 'buyer_tuan', 'Phạm Minh Tuấn', '0930000003', 'tuan@gmail.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL,
 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tuan', true, true, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Set HTX managers
UPDATE htx SET manager_id = 'b0000000-0000-0000-0000-000000000002' WHERE id = 'a0000000-0000-0000-0000-000000000001';
UPDATE htx SET manager_id = 'b0000000-0000-0000-0000-000000000003' WHERE id = 'a0000000-0000-0000-0000-000000000002';

-- ═══════════════════════════════════════════════
-- 5. SHOPS
-- BaseEntity + own: owner_id, slug, name, province, ward, bio,
--                   years_experience, farm_area_m2, avatar_url, cover_url,
--                   average_rating, total_reviews
-- ═══════════════════════════════════════════════
INSERT INTO shops (id, owner_id, slug, name, province, ward, bio, years_experience, farm_area_m2, avatar_url, average_rating, total_reviews, deleted, created_at, updated_at) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004',
 'trang-trai-le-hoa', 'Trang Trại Lê Hoa', 'Lâm Đồng', 'Đà Lạt',
 'Chuyên rau củ Đà Lạt, trồng trong nhà kính VietGAP. Cam kết tươi sạch mỗi ngày!',
 8, 5000, 'https://images.unsplash.com/photo-1595856467232-c651ee2bc394?w=200&auto=format',
 4.80, 120, false, NOW(), NOW()),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005',
 'vuon-tran-nong', 'Vườn Trần Nông', 'Đồng Tháp', 'Cao Lãnh',
 'Vườn cây ăn trái ĐBSCL — Xoài, Bưởi, Nhãn, Gạo ST25. Đạt chuẩn VietGAP.',
 12, 8000, 'https://images.unsplash.com/photo-1501523460185-2aa5d2a0f981?w=200&auto=format',
 4.60, 85, false, NOW(), NOW()),
('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000006',
 'nha-vuon-nguyen-xuan', 'Nhà Vườn Nguyễn Xuân', 'Bến Tre', 'Châu Thành',
 'Đặc sản dừa Bến Tre & trái cây nhiệt đới. Canh tác hữu cơ 100%.',
 5, 3000, 'https://images.unsplash.com/photo-1615486511484-92e172a2c11f?w=200&auto=format',
 4.90, 45, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════
-- 6. PRODUCTS (15 sản phẩm, 5/shop)
-- BaseEntity + own: shop_id, name, description, category, unit_code,
--   price_per_unit, available_quantity, harvest_date, available_from,
--   farming_method, pesticide_free, location_detail, origin,
--   min_order_quantity, weight_per_unit, shelf_life,
--   status, average_rating, total_reviews, total_sold, bundle_id
-- ═══════════════════════════════════════════════
INSERT INTO products (id, shop_id, name, description, category, unit_code,
  price_per_unit, available_quantity, farming_method, pesticide_free,
  location_detail, status, average_rating, total_reviews, total_sold,
  deleted, created_at, updated_at) VALUES
-- Shop 1: Trang Trại Lê Hoa (Rau Đà Lạt)
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001',
 'Cà Chua Beef Đà Lạt', 'Cà chua Beef Đà Lạt, trái to bóng mọng, thịt dày ít hạt. Trồng trong nhà kính VietGAP.',
 'VEGETABLE', 'KG', 35000, 200, 'VIETGAP', true, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.50, 28, 156, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001',
 'Xà Lách Lolo Rosa', 'Xà lách Lolo Rosa Đà Lạt, lá xoăn tím đẹp mắt, giòn ngọt. Trồng thủy canh sạch.',
 'VEGETABLE', 'KG', 40000, 100, 'GLOBALGAP', true, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.70, 15, 89, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001',
 'Ớt Chuông Đỏ', 'Ớt chuông đỏ Đà Lạt, trái to giòn, vị ngọt tự nhiên.',
 'VEGETABLE', 'KG', 50000, 150, 'VIETGAP', true, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.30, 42, 210, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001',
 'Hành Tây Đà Lạt', 'Hành tây Đà Lạt, củ to đều, vị ngọt nhẹ khi nấu chín. Đạt chuẩn VietGAP.',
 'VEGETABLE', 'KG', 18000, 400, 'VIETGAP', false, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.10, 35, 320, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001',
 'Atiso Đà Lạt', 'Atiso tươi Đà Lạt, bông to lá dày. Dùng nấu canh, hãm trà thanh nhiệt.',
 'HERB', 'KG', 60000, 120, 'TRADITIONAL', false, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.60, 18, 95, false, NOW(), NOW()),

-- Shop 2: Vườn Trần Nông (Trái cây Đồng Tháp)
('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000002',
 'Xoài Cát Hòa Lộc', 'Xoài cát Hòa Lộc đặc sản, trái to đều, thịt dày vàng ươm, vị ngọt thanh.',
 'FRUIT', 'KG', 65000, 500, 'VIETGAP', true, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.80, 67, 450, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000002',
 'Bưởi Da Xanh', 'Bưởi da xanh, vỏ mỏng, tép bưởi hồng đào, ngọt thanh không hạt.',
 'FRUIT', 'KG', 45000, 300, 'ORGANIC', true, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.50, 33, 280, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000002',
 'Nhãn Xuồng Cơm Vàng', 'Nhãn xuồng cơm vàng, trái to cơm dày, vị ngọt đậm đà.',
 'FRUIT', 'KG', 55000, 200, 'VIETGAP', true, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.40, 22, 180, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000002',
 'Gạo ST25', 'Gạo ST25 — giống gạo ngon nhất thế giới. Hạt dài, dẻo, thơm tự nhiên.',
 'GRAIN', 'KG', 28000, 2000, 'TRADITIONAL', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.90, 88, 1200, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000002',
 'Mít Thái Siêu Sớm', 'Mít Thái siêu sớm, múi to vàng ươm, giòn ngọt. Trái từ 8-12kg.',
 'FRUIT', 'KG', 25000, 400, 'TRADITIONAL', false, 'Cao Lãnh, Đồng Tháp', 'UPCOMING', 4.20, 14, 100, false, NOW(), NOW()),

-- Shop 3: Nhà Vườn Nguyễn Xuân (Bến Tre)
('e0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000003',
 'Dừa Xiêm Xanh', 'Dừa xiêm xanh Bến Tre, nước ngọt mát tự nhiên. Trái tươi hái tại vườn.',
 'FRUIT', 'TRAI', 15000, 1000, 'ORGANIC', true, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.70, 55, 800, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000003',
 'Khoai Lang Tím Nhật', 'Khoai lang tím Nhật, ruột tím đậm, vị ngọt bùi. Giàu chất chống oxy hóa.',
 'TUBER', 'KG', 22000, 600, 'ORGANIC', true, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.50, 30, 400, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000003',
 'Dâu Tây Đà Lạt', 'Dâu tây tươi, trái đỏ mọng, vị chua ngọt hài hòa. Thu hoạch mỗi sáng.',
 'FRUIT', 'KG', 120000, 80, 'ORGANIC', true, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.90, 40, 250, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000003',
 'Bắp Cải Tím', 'Bắp cải tím, cuộn chặt, màu tím đậm tự nhiên. Giàu vitamin C.',
 'VEGETABLE', 'KG', 25000, 300, 'ORGANIC', true, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.30, 19, 150, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000003',
 'Bí Đỏ Hạt Đen', 'Bí đỏ ruột vàng cam, bở ngọt. Nấu cháo, súp, hấp đều ngon.',
 'VEGETABLE', 'KG', 15000, 500, 'TRADITIONAL', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.00, 12, 90, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000001', 'Cải ngọt', 'Cải ngọt giòn sạch, canh tác thủy canh.', 'VEGETABLE', 'KG', 20000, 500, 'ORGANIC', true, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.93, 25, 822, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000001', 'Khoai tây', 'Khoai tây ruột vàng, củ to đều.', 'TUBER', 'KG', 30000, 1000, 'VIETGAP', false, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.28, 45, 446, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000001', 'Cà rốt', 'Cà rốt tươi rói, giòn ngọt.', 'TUBER', 'KG', 25000, 800, 'VIETGAP', false, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.90, 176, 121, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000001', 'Rau mồng tơi', 'Rau mồng tơi non, lá to, nấu canh rất ngọt.', 'VEGETABLE', 'KG', 15000, 300, 'TRADITIONAL', false, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.42, 100, 356, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000001', 'Súp lơ xanh', 'Súp lơ xanh nguyên bắp, sạch sâu bệnh.', 'VEGETABLE', 'KG', 40000, 200, 'ORGANIC', true, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.74, 42, 318, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000021', 'd0000000-0000-0000-0000-000000000001', 'Súp lơ trắng', 'Súp lơ trắng, bắp cuộn chặt, màu trắng đục.', 'VEGETABLE', 'KG', 35000, 200, 'VIETGAP', false, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.13, 80, 982, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000022', 'd0000000-0000-0000-0000-000000000001', 'Bầu', 'Bầu sao, bầu hồ lô trái thon dài.', 'VEGETABLE', 'KG', 12000, 150, 'TRADITIONAL', false, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.11, 43, 758, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000023', 'd0000000-0000-0000-0000-000000000001', 'Bí xanh', 'Bí đao chanh, bí đao sao giải nhiệt.', 'VEGETABLE', 'KG', 15000, 300, 'TRADITIONAL', false, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.03, 78, 326, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000024', 'd0000000-0000-0000-0000-000000000001', 'Mướp hương', 'Mướp hương thơm phức, trái nõn nà.', 'VEGETABLE', 'KG', 18000, 400, 'ORGANIC', true, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.73, 58, 668, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000025', 'd0000000-0000-0000-0000-000000000001', 'Cải bó xôi', 'Rau chân vịt, dinh dưỡng cao.', 'VEGETABLE', 'KG', 35000, 150, 'ORGANIC', true, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.54, 39, 557, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000026', 'd0000000-0000-0000-0000-000000000001', 'Cà chua Cherry', 'Cà chua bi chua ngọt hài hòa, giòn rụm.', 'VEGETABLE', 'KG', 60000, 100, 'GLOBALGAP', true, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.05, 69, 793, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000027', 'd0000000-0000-0000-0000-000000000001', 'Nấm đùi gà', 'Nấm đùi gà baby, vị dai ngọt nhạt.', 'OTHER', 'KG', 70000, 50, 'ORGANIC', true, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.61, 186, 161, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000028', 'd0000000-0000-0000-0000-000000000001', 'Nấm kim châm', 'Nấm kim châm tươi gói 200g.', 'OTHER', 'BAO', 12000, 500, 'VIETGAP', false, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.71, 168, 836, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000029', 'd0000000-0000-0000-0000-000000000001', 'Xà lách xoong', 'Xà lách xoong đà lạt, lá nhỏ, cay nồng.', 'VEGETABLE', 'KG', 25000, 200, 'TRADITIONAL', false, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.02, 141, 877, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000030', 'd0000000-0000-0000-0000-000000000001', 'Cần tây', 'Cần tây thân to, ép nước uống rất ngon.', 'VEGETABLE', 'KG', 30000, 300, 'ORGANIC', true, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.88, 152, 367, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000031', 'd0000000-0000-0000-0000-000000000001', 'Rau dền đỏ', 'Dền đỏ, cung cấp sắt, nấu canh mát mẻ.', 'VEGETABLE', 'KG', 15000, 300, 'TRADITIONAL', false, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.07, 186, 697, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000032', 'd0000000-0000-0000-0000-000000000001', 'Củ cải trắng', 'Củ cải trắng to, mọng nước.', 'TUBER', 'KG', 18000, 800, 'VIETGAP', false, 'TP Đà Lạt, Lâm Đồng', 'IN_SEASON', 4.59, 53, 364, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000033', 'd0000000-0000-0000-0000-000000000002', 'Cam Xoàn', 'Cam xoàn Đồng Tháp, vắt nước hay ăn múi đều ngon, ngọt.', 'FRUIT', 'KG', 35000, 400, 'VIETGAP', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.09, 141, 515, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000034', 'd0000000-0000-0000-0000-000000000002', 'Quýt Hồng Lai Vung', 'Đặc sản Lai Vung, trái no vỏ căng mỏng, chín đỏ cam.', 'FRUIT', 'KG', 55000, 200, 'TRADITIONAL', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.41, 124, 976, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000035', 'd0000000-0000-0000-0000-000000000002', 'Mận An Phước', 'Mận chín đỏ đô, giòn xốp và mọng nước.', 'FRUIT', 'KG', 30000, 350, 'VIETGAP', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.71, 154, 877, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000036', 'd0000000-0000-0000-0000-000000000002', 'Nhãn Ido', 'Nhãn Ido hạt nhỏ xíu, cơm ráo và thơm.', 'FRUIT', 'KG', 40000, 500, 'GLOBALGAP', true, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.06, 108, 179, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000037', 'd0000000-0000-0000-0000-000000000002', 'Sầu riêng Ri6', 'Sầu riêng Ri6 rụng gốc, cơm vàng hạt lép.', 'FRUIT', 'KG', 120000, 100, 'ORGANIC', true, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.73, 99, 745, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000038', 'd0000000-0000-0000-0000-000000000002', 'Chôm chôm Thái', 'Chôm chôm Thái róc hạt, nhai giòn sần sật.', 'FRUIT', 'KG', 35000, 300, 'VIETGAP', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.86, 32, 332, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000039', 'd0000000-0000-0000-0000-000000000002', 'Chôm chôm nhãn', 'Nhỏ hơn chôm chôm Thái nhưng ngọt ngát và thơm mùi nhãn.', 'FRUIT', 'KG', 45000, 150, 'TRADITIONAL', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.46, 33, 161, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000040', 'd0000000-0000-0000-0000-000000000002', 'Thanh long ruột đỏ', 'Thanh long ruột đỏ ngọt mát.', 'FRUIT', 'KG', 35000, 250, 'VIETGAP', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.56, 42, 649, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000041', 'd0000000-0000-0000-0000-000000000002', 'Thanh long ruột trắng', 'Thanh long bình thuận, trái to hơn, chua chua ngọt ngọt.', 'FRUIT', 'KG', 25000, 200, 'TRADITIONAL', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.77, 112, 149, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000042', 'd0000000-0000-0000-0000-000000000002', 'Bưởi Năm Roi', 'Bưởi Năm Roi Bình Minh, chua mặn nhẹ, rất thanh.', 'FRUIT', 'TRAI', 30000, 400, 'VIETGAP', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.93, 159, 93, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000043', 'd0000000-0000-0000-0000-000000000002', 'Ổi Lê Đài Loan', 'Ổi lê xốp giòn, ngọt tự nhiên, to oạch.', 'FRUIT', 'KG', 20000, 1000, 'TRADITIONAL', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.39, 130, 587, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000044', 'd0000000-0000-0000-0000-000000000002', 'Ổi Nữ Hoàng', 'Ổi ruột đặc, chua ngọt dầm dề.', 'FRUIT', 'KG', 25000, 500, 'VIETGAP', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.04, 58, 342, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000045', 'd0000000-0000-0000-0000-000000000002', 'Dưa hấu Mỹ dẹt', 'Dưa hấu ngọt lịm mùa hè.', 'FRUIT', 'KG', 15000, 800, 'TRADITIONAL', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.94, 89, 672, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000046', 'd0000000-0000-0000-0000-000000000002', 'Vú sữa Lò Rèn', 'Vú sữa căng bóng, ruột sữa trắng phau dẻo mát.', 'FRUIT', 'KG', 60000, 150, 'GLOBALGAP', true, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.26, 88, 256, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000047', 'd0000000-0000-0000-0000-000000000002', 'Sơ ri chua', 'Sơ ri chua, hái mộc từ vườn nhà Đồng Tháp.', 'FRUIT', 'KG', 20000, 50, 'TRADITIONAL', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.26, 78, 703, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000048', 'd0000000-0000-0000-0000-000000000002', 'Gạo Nàng Hoa', 'Gạo Nàng Hoa chín dẻo, thổi cơm cực ngon.', 'GRAIN', 'KG', 22000, 2000, 'VIETGAP', false, 'Cao Lãnh, Đồng Tháp', 'IN_SEASON', 4.60, 102, 352, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000049', 'd0000000-0000-0000-0000-000000000003', 'Dừa sáp', 'Dừa sáp Cầu Kè thượng hạng, dẻo sệt.', 'FRUIT', 'TRAI', 150000, 20, 'ORGANIC', true, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.01, 30, 675, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000050', 'd0000000-0000-0000-0000-000000000003', 'Dừa dứa', 'Nước dừa thơm thoang thoảng mùi lá nếp (lá dứa).', 'FRUIT', 'TRAI', 25000, 300, 'VIETGAP', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.91, 139, 662, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000051', 'd0000000-0000-0000-0000-000000000003', 'Bưởi da xanh nhụy hồng', 'Bưởi da xanh ruột đào, ngọt thanh tự nhiên.', 'FRUIT', 'KG', 55000, 150, 'GLOBALGAP', true, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.10, 199, 650, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000052', 'd0000000-0000-0000-0000-000000000003', 'Măng cụt Bến Tre', 'Măng cụt vào mùa, chua ngọt dập dìu.', 'FRUIT', 'KG', 65000, 200, 'VIETGAP', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.19, 99, 369, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000053', 'd0000000-0000-0000-0000-000000000003', 'Bòn bon Thái', 'Bòn bon Thái róc hạt, ngọt như đường phèn.', 'FRUIT', 'KG', 70000, 120, 'TRADITIONAL', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.50, 94, 105, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000054', 'd0000000-0000-0000-0000-000000000003', 'Cacao trái', 'Ca cao tươi dành cho ai thích tự lên men hạt.', 'FRUIT', 'KG', 45000, 50, 'ORGANIC', true, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.12, 160, 90, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000055', 'd0000000-0000-0000-0000-000000000003', 'Sầu riêng Monthong', 'Sầu riêng sấy lạnh Monthong hạt hẹp.', 'FRUIT', 'KG', 140000, 100, 'GLOBALGAP', true, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.50, 164, 787, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000056', 'd0000000-0000-0000-0000-000000000003', 'Quýt đường', 'Quýt đường vắt nước siro ngon nhức nách.', 'FRUIT', 'KG', 35000, 400, 'VIETGAP', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.38, 47, 80, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000057', 'd0000000-0000-0000-0000-000000000003', 'Chuối sáp', 'Chuối sáp Bến Tre, luộc lên ăn dẻo qụeo.', 'FRUIT', 'KG', 25000, 300, 'TRADITIONAL', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.71, 143, 948, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000058', 'd0000000-0000-0000-0000-000000000003', 'Chuối sứ', 'Chuối sứ to bự, để nấu chè chuối.', 'FRUIT', 'KG', 15000, 200, 'TRADITIONAL', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.81, 108, 458, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000059', 'd0000000-0000-0000-0000-000000000003', 'Mướp đắng (Khổ qua)', 'Khổ qua gai, nhồi thịt thanh mát.', 'VEGETABLE', 'KG', 20000, 150, 'VIETGAP', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.68, 120, 444, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000060', 'd0000000-0000-0000-0000-000000000003', 'Chanh dây', 'Chanh dây ruột vàng ươm, vắt nước uống tuyệt.', 'FRUIT', 'KG', 35000, 100, 'ORGANIC', true, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.84, 50, 567, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000061', 'd0000000-0000-0000-0000-000000000003', 'Chanh không hạt', 'Chanh đào không hạt mọng nước, to như trứng.', 'FRUIT', 'KG', 20000, 400, 'VIETGAP', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.96, 78, 343, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000062', 'd0000000-0000-0000-0000-000000000003', 'Đu đủ ruột đỏ', 'Đu đủ miệt vườn, cắt ra đỏ au ngòn ngọt.', 'FRUIT', 'KG', 18000, 350, 'TRADITIONAL', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.19, 15, 129, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000063', 'd0000000-0000-0000-0000-000000000003', 'Măng tươi tây nguyên', 'Măng le tươi luộc sẵn nguyên nón.', 'VEGETABLE', 'KG', 40000, 250, 'ORGANIC', true, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.97, 130, 224, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000064', 'd0000000-0000-0000-0000-000000000003', 'Dứa mật', 'Khóm tây nam bộ ngọt như ướp mật.', 'FRUIT', 'TRAI', 15000, 500, 'VIETGAP', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.51, 137, 702, false, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000065', 'd0000000-0000-0000-0000-000000000003', 'Trái Lòng Bong', 'Lòng bong nội địa, chua chua dôn dốt vui miệng.', 'FRUIT', 'KG', 40000, 80, 'TRADITIONAL', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.25, 146, 252, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════
-- 7. PRODUCT IMAGES  (extends BaseEntity → needs deleted)
-- ═══════════════════════════════════════════════
INSERT INTO product_images (id, product_id, url, sort_order, deleted, created_at, updated_at) VALUES
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800', 1, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1580910365203-91ea9115a319?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800', 1, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1528825871115-3581a5e0791d?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1506917728037-b6af01a7d403?w=800', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000016', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000017', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000018', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000019', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000020', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000021', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000022', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000023', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000024', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000025', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000026', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000027', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000028', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000029', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000030', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000031', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000032', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000033', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000034', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000035', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000036', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000037', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000038', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000039', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000040', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000041', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000042', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000043', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000044', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000045', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000046', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000047', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000048', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000049', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000050', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000051', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000052', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000053', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000054', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000055', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000056', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000057', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000058', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000059', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000060', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000061', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000062', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000063', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000064', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000065', 'https://source.unsplash.com/random/800x800/?farm%2Cfruit%2Cvegetable', 0, false, NOW(), NOW());

-- ═══════════════════════════════════════════════
-- 8. ORDERS (6 đơn hàng đã giao thành công)
-- ═══════════════════════════════════════════════
INSERT INTO orders (id, user_id, order_number, total_amount, payment_method, payment_status, status, is_merged, deleted, created_at, updated_at) VALUES
('f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'ORD-260401-001', 850000, 'COD', 'PAID', 'DELIVERED', false, false, NOW()-interval '30 days', NOW()-interval '30 days'),
('f0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'ORD-260405-002', 920000, 'VIET_QR', 'PAID', 'DELIVERED', false, false, NOW()-interval '20 days', NOW()-interval '20 days'),
('f0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000009', 'ORD-260408-003', 780000, 'VIET_QR', 'PAID', 'DELIVERED', false, false, NOW()-interval '15 days', NOW()-interval '15 days'),
('f0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000008', 'ORD-260412-004', 200000, 'COD', 'PAID', 'DELIVERED', false, false, NOW()-interval '10 days', NOW()-interval '10 days'),
('f0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000009', 'ORD-260415-005', 620000, 'VIET_QR', 'PAID', 'DELIVERED', false, false, NOW()-interval '7 days', NOW()-interval '7 days'),
('f0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000007', 'ORD-260419-006', 250000, 'COD', 'PAID', 'DELIVERED', false, false, NOW()-interval '3 days', NOW()-interval '3 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_orders (id, order_id, shop_id, subtotal, shipping_fee, status, created_at, updated_at) VALUES
('f1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 820000, 30000, 'DELIVERED', NOW()-interval '30 days', NOW()-interval '28 days'),
('f1000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 890000, 30000, 'DELIVERED', NOW()-interval '20 days', NOW()-interval '18 days'),
('f1000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 750000, 30000, 'DELIVERED', NOW()-interval '15 days', NOW()-interval '13 days'),
('f1000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 170000, 30000, 'DELIVERED', NOW()-interval '10 days', NOW()-interval '8 days'),
('f1000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000002', 590000, 30000, 'DELIVERED', NOW()-interval '7 days', NOW()-interval '5 days'),
('f1000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 220000, 30000, 'DELIVERED', NOW()-interval '3 days', NOW()-interval '1 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, sub_order_id, product_id, quantity, price_per_unit, deleted, created_at, updated_at) VALUES
('f2000000-0000-0000-0000-000000000001','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001',2,35000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000002','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002',1,40000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000003','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000003',1,50000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000004','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000004',3,18000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000005','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000005',1,60000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000006','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000016',2,20000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000007','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000017',2,30000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000008','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000018',1,25000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000009','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000019',1,15000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000010','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000020',1,40000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000011','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000021',1,35000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000012','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000022',2,12000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000013','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000023',1,15000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000014','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000024',1,18000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000015','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000025',1,35000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000016','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000026',1,60000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000017','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000027',1,70000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000018','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000028',3,12000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000019','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000029',1,25000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000020','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000030',1,30000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000021','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000031',2,15000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000022','f1000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000032',1,18000,false,NOW()-interval '30 days',NOW()-interval '30 days'),
('f2000000-0000-0000-0000-000000000023','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000006',2,65000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000024','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000007',1,45000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000025','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000008',1,55000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000026','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000009',5,28000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000027','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000010',1,25000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000028','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000033',2,35000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000029','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000034',1,55000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000030','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000035',2,30000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000031','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000036',1,40000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000032','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000037',1,120000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000033','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000038',1,35000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000034','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000039',1,45000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000035','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000040',2,35000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000036','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000041',1,25000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000037','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000042',1,30000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000038','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000043',2,20000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000039','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000044',1,25000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000040','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000045',3,15000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000041','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000046',1,60000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000042','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000047',2,20000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000043','f1000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000048',3,22000,false,NOW()-interval '20 days',NOW()-interval '20 days'),
('f2000000-0000-0000-0000-000000000044','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000011',3,15000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000045','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000012',2,22000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000046','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000013',1,120000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000047','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000014',1,25000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000048','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000015',2,15000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000049','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000049',1,150000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000050','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000050',2,25000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000051','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000051',1,55000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000052','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000052',1,65000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000053','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000053',1,70000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000054','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000054',1,45000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000055','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000055',1,140000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000056','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000056',2,35000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000057','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000057',1,25000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000058','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000058',2,15000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000059','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000059',1,20000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000060','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000060',1,35000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000061','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000061',2,20000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000062','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000062',1,18000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000063','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000063',1,40000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000064','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000064',3,15000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000065','f1000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000065',1,40000,false,NOW()-interval '15 days',NOW()-interval '15 days'),
('f2000000-0000-0000-0000-000000000066','f1000000-0000-0000-0000-000000000004','e0000000-0000-0000-0000-000000000001',3,35000,false,NOW()-interval '10 days',NOW()-interval '10 days'),
('f2000000-0000-0000-0000-000000000067','f1000000-0000-0000-0000-000000000004','e0000000-0000-0000-0000-000000000002',2,40000,false,NOW()-interval '10 days',NOW()-interval '10 days'),
('f2000000-0000-0000-0000-000000000068','f1000000-0000-0000-0000-000000000004','e0000000-0000-0000-0000-000000000003',1,50000,false,NOW()-interval '10 days',NOW()-interval '10 days'),
('f2000000-0000-0000-0000-000000000069','f1000000-0000-0000-0000-000000000004','e0000000-0000-0000-0000-000000000004',2,18000,false,NOW()-interval '10 days',NOW()-interval '10 days'),
('f2000000-0000-0000-0000-000000000070','f1000000-0000-0000-0000-000000000004','e0000000-0000-0000-0000-000000000005',1,60000,false,NOW()-interval '10 days',NOW()-interval '10 days'),
('f2000000-0000-0000-0000-000000000071','f1000000-0000-0000-0000-000000000005','e0000000-0000-0000-0000-000000000006',3,65000,false,NOW()-interval '7 days',NOW()-interval '7 days'),
('f2000000-0000-0000-0000-000000000072','f1000000-0000-0000-0000-000000000005','e0000000-0000-0000-0000-000000000007',2,45000,false,NOW()-interval '7 days',NOW()-interval '7 days'),
('f2000000-0000-0000-0000-000000000073','f1000000-0000-0000-0000-000000000005','e0000000-0000-0000-0000-000000000008',1,55000,false,NOW()-interval '7 days',NOW()-interval '7 days'),
('f2000000-0000-0000-0000-000000000074','f1000000-0000-0000-0000-000000000005','e0000000-0000-0000-0000-000000000009',3,28000,false,NOW()-interval '7 days',NOW()-interval '7 days'),
('f2000000-0000-0000-0000-000000000075','f1000000-0000-0000-0000-000000000005','e0000000-0000-0000-0000-000000000010',2,25000,false,NOW()-interval '7 days',NOW()-interval '7 days'),
('f2000000-0000-0000-0000-000000000076','f1000000-0000-0000-0000-000000000006','e0000000-0000-0000-0000-000000000011',5,15000,false,NOW()-interval '3 days',NOW()-interval '3 days'),
('f2000000-0000-0000-0000-000000000077','f1000000-0000-0000-0000-000000000006','e0000000-0000-0000-0000-000000000012',1,22000,false,NOW()-interval '3 days',NOW()-interval '3 days'),
('f2000000-0000-0000-0000-000000000078','f1000000-0000-0000-0000-000000000006','e0000000-0000-0000-0000-000000000013',1,120000,false,NOW()-interval '3 days',NOW()-interval '3 days'),
('f2000000-0000-0000-0000-000000000079','f1000000-0000-0000-0000-000000000006','e0000000-0000-0000-0000-000000000014',2,25000,false,NOW()-interval '3 days',NOW()-interval '3 days'),
('f2000000-0000-0000-0000-000000000080','f1000000-0000-0000-0000-000000000006','e0000000-0000-0000-0000-000000000015',3,15000,false,NOW()-interval '3 days',NOW()-interval '3 days')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════
-- 9. REVIEWS (80 đánh giá — mỗi sản phẩm ít nhất 1, products 01-15 có 2)
-- ═══════════════════════════════════════════════
INSERT INTO reviews (id, order_item_id, product_id, author_id, rating, comment, seller_reply, created_at) VALUES
('f3000000-0000-0000-0000-000000000001','f2000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000007',5,'Cà chua Beef to mọng, thịt dày rất ngon! Cả nhà ai cũng khen.','Cảm ơn anh Minh đã ủng hộ ạ!',NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000002','f2000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000007',5,'Xà lách giòn rụm, cuộn thịt nướng ăn rất đã!',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000003','f2000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000007',4,'Ớt chuông giòn ngọt, nhưng trái hơi nhỏ hơn ảnh.','Dạ shop ghi nhận, đợt sau chọn trái to hơn ạ!',NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000004','f2000000-0000-0000-0000-000000000004','e0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000007',4,'Hành tây Đà Lạt ngọt, xào lên thơm phức.',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000005','f2000000-0000-0000-0000-000000000005','e0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000007',5,'Atiso tươi xanh, hãm trà uống thanh nhiệt cực tốt!','Cảm ơn bạn, atiso vườn nhà organic 100% ạ!',NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000006','f2000000-0000-0000-0000-000000000006','e0000000-0000-0000-0000-000000000016','b0000000-0000-0000-0000-000000000007',5,'Cải ngọt giòn sạch, nấu canh ngọt nước.',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000007','f2000000-0000-0000-0000-000000000007','e0000000-0000-0000-0000-000000000017','b0000000-0000-0000-0000-000000000007',4,'Khoai tây ruột vàng, chiên lên giòn tan.',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000008','f2000000-0000-0000-0000-000000000008','e0000000-0000-0000-0000-000000000018','b0000000-0000-0000-0000-000000000007',5,'Cà rốt tươi roi rói, ép nước uống rất bổ!','Cảm ơn anh, cà rốt VietGAP ạ!',NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000009','f2000000-0000-0000-0000-000000000009','e0000000-0000-0000-0000-000000000019','b0000000-0000-0000-0000-000000000007',4,'Rau mồng tơi non, nấu canh cua rất ngọt.',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000010','f2000000-0000-0000-0000-000000000010','e0000000-0000-0000-0000-000000000020','b0000000-0000-0000-0000-000000000007',5,'Súp lơ xanh nguyên bắp, luộc chấm mắm ngon!',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000011','f2000000-0000-0000-0000-000000000011','e0000000-0000-0000-0000-000000000021','b0000000-0000-0000-0000-000000000007',4,'Súp lơ trắng bắp cuộn chặt, nấu soup ngon.',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000012','f2000000-0000-0000-0000-000000000012','e0000000-0000-0000-0000-000000000022','b0000000-0000-0000-0000-000000000007',4,'Bầu tươi, nấu canh tôm mát lành.',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000013','f2000000-0000-0000-0000-000000000013','e0000000-0000-0000-0000-000000000023','b0000000-0000-0000-0000-000000000007',4,'Bí xanh giải nhiệt, nấu canh sườn ngon.','Cảm ơn bạn đã ủng hộ shop ạ!',NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000014','f2000000-0000-0000-0000-000000000014','e0000000-0000-0000-0000-000000000024','b0000000-0000-0000-0000-000000000007',5,'Mướp hương thơm phức, xào tỏi ăn cực ngon!',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000015','f2000000-0000-0000-0000-000000000015','e0000000-0000-0000-0000-000000000025','b0000000-0000-0000-0000-000000000007',5,'Cải bó xôi tươi xanh, xào bơ tỏi tuyệt vời!',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000016','f2000000-0000-0000-0000-000000000016','e0000000-0000-0000-0000-000000000026','b0000000-0000-0000-0000-000000000007',4,'Cherry chua ngọt hài hòa, ăn vặt rất ghiền.',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000017','f2000000-0000-0000-0000-000000000017','e0000000-0000-0000-0000-000000000027','b0000000-0000-0000-0000-000000000007',5,'Nấm đùi gà baby dai ngon, xào bơ tuyệt cú!','Cảm ơn anh, nấm organic 100% ạ!',NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000018','f2000000-0000-0000-0000-000000000018','e0000000-0000-0000-0000-000000000028','b0000000-0000-0000-0000-000000000007',5,'Nấm kim châm tươi, nấu lẩu ngon xuất sắc!',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000019','f2000000-0000-0000-0000-000000000019','e0000000-0000-0000-0000-000000000029','b0000000-0000-0000-0000-000000000007',4,'Xà lách xoong cay nhẹ, trộn salad rất ngon.',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000020','f2000000-0000-0000-0000-000000000020','e0000000-0000-0000-0000-000000000030','b0000000-0000-0000-0000-000000000007',5,'Cần tây thân to, ép juice uống mỗi sáng!',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000021','f2000000-0000-0000-0000-000000000021','e0000000-0000-0000-0000-000000000031','b0000000-0000-0000-0000-000000000007',4,'Rau dền đỏ nấu canh mát, bổ sung sắt tốt.',NULL,NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000022','f2000000-0000-0000-0000-000000000022','e0000000-0000-0000-0000-000000000032','b0000000-0000-0000-0000-000000000007',5,'Củ cải trắng to mọng nước, kho thịt ngon!','Cảm ơn anh Minh, hẹn gặp lại ạ!',NOW()-interval '28 days'),
('f3000000-0000-0000-0000-000000000023','f2000000-0000-0000-0000-000000000023','e0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000008',5,'Xoài Hòa Lộc ngọt thanh, thịt vàng ươm tuyệt vời!','Cảm ơn chị Lan ủng hộ vườn ạ!',NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000024','f2000000-0000-0000-0000-000000000024','e0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000008',5,'Bưởi da xanh tép hồng, ngọt thanh không hạt!',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000025','f2000000-0000-0000-0000-000000000025','e0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000008',4,'Nhãn xuồng cơm dày, ngọt đậm. Hơi ít trái.',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000026','f2000000-0000-0000-0000-000000000026','e0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000008',5,'Gạo ST25 nấu cơm dẻo thơm, ngon nhất từng ăn!','Dạ gạo nhà trồng chính vụ, cảm ơn chị!',NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000027','f2000000-0000-0000-0000-000000000027','e0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000008',4,'Mít Thái giòn ngọt, múi to vàng ươm.',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000028','f2000000-0000-0000-0000-000000000028','e0000000-0000-0000-0000-000000000033','b0000000-0000-0000-0000-000000000008',4,'Cam xoàn ngọt, vắt nước uống mát lành.',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000029','f2000000-0000-0000-0000-000000000029','e0000000-0000-0000-0000-000000000034','b0000000-0000-0000-0000-000000000008',4,'Quýt hồng Lai Vung vỏ mỏng, ngọt thanh.',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000030','f2000000-0000-0000-0000-000000000030','e0000000-0000-0000-0000-000000000035','b0000000-0000-0000-0000-000000000008',5,'Mận An Phước chín đỏ, giòn xốp ngọt lịm!','Cảm ơn chị, mận đang mùa ngon nhất ạ!',NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000031','f2000000-0000-0000-0000-000000000031','e0000000-0000-0000-0000-000000000036','b0000000-0000-0000-0000-000000000008',4,'Nhãn Ido hạt nhỏ cơm ráo, ăn hoài không ngán.',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000032','f2000000-0000-0000-0000-000000000032','e0000000-0000-0000-0000-000000000037','b0000000-0000-0000-0000-000000000008',5,'Sầu riêng Ri6 cơm vàng hạt lép, béo ngậy!',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000033','f2000000-0000-0000-0000-000000000033','e0000000-0000-0000-0000-000000000038','b0000000-0000-0000-0000-000000000008',5,'Chôm chôm Thái róc vỏ, giòn ngọt sần sật!',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000034','f2000000-0000-0000-0000-000000000034','e0000000-0000-0000-0000-000000000039','b0000000-0000-0000-0000-000000000008',4,'Chôm chôm nhãn thơm mùi nhãn, ngọt dịu.','Cảm ơn chị Lan, hẹn gặp lại ạ!',NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000035','f2000000-0000-0000-0000-000000000035','e0000000-0000-0000-0000-000000000040','b0000000-0000-0000-0000-000000000008',5,'Thanh long ruột đỏ ngọt mát, ăn giải nhiệt!',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000036','f2000000-0000-0000-0000-000000000036','e0000000-0000-0000-0000-000000000041','b0000000-0000-0000-0000-000000000008',5,'Thanh long trắng chua ngọt, xay sinh tố ngon!',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000037','f2000000-0000-0000-0000-000000000037','e0000000-0000-0000-0000-000000000042','b0000000-0000-0000-0000-000000000008',5,'Bưởi Năm Roi tép to, ăn thanh mát cực kì!',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000038','f2000000-0000-0000-0000-000000000038','e0000000-0000-0000-0000-000000000043','b0000000-0000-0000-0000-000000000008',4,'Ổi lê giòn xốp, ngọt tự nhiên. OK!',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000039','f2000000-0000-0000-0000-000000000039','e0000000-0000-0000-0000-000000000044','b0000000-0000-0000-0000-000000000008',4,'Ổi nữ hoàng ruột đặc, chua ngọt vừa miệng.',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000040','f2000000-0000-0000-0000-000000000040','e0000000-0000-0000-0000-000000000045','b0000000-0000-0000-0000-000000000008',5,'Dưa hấu ngọt lịm, mùa hè ăn mát lành!','Cảm ơn chị, dưa hấu mùa này ngon lắm ạ!',NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000041','f2000000-0000-0000-0000-000000000041','e0000000-0000-0000-0000-000000000046','b0000000-0000-0000-0000-000000000008',4,'Vú sữa Lò Rèn dẻo mát, vị sữa đặc trưng.',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000042','f2000000-0000-0000-0000-000000000042','e0000000-0000-0000-0000-000000000047','b0000000-0000-0000-0000-000000000008',4,'Sơ ri chua thanh, ăn vui miệng.',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000043','f2000000-0000-0000-0000-000000000043','e0000000-0000-0000-0000-000000000048','b0000000-0000-0000-0000-000000000008',5,'Gạo Nàng Hoa nấu cơm dẻo, thơm nhẹ. Ngon!',NULL,NOW()-interval '18 days'),
('f3000000-0000-0000-0000-000000000044','f2000000-0000-0000-0000-000000000044','e0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000009',5,'Dừa xiêm nước ngọt mát, uống cực đã mùa hè!','Cảm ơn anh Tuấn, dừa hái tươi mỗi ngày ạ!',NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000045','f2000000-0000-0000-0000-000000000045','e0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000009',5,'Khoai lang tím ngọt bùi, hấp ăn rất ngon!',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000046','f2000000-0000-0000-0000-000000000046','e0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000009',5,'Dâu tây tươi đỏ mọng, ngọt tự nhiên. Tuyệt!',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000047','f2000000-0000-0000-0000-000000000047','e0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000009',4,'Bắp cải tím cuộn chặt, trộn salad đẹp mắt.',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000048','f2000000-0000-0000-0000-000000000048','e0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000009',4,'Bí đỏ bở ngọt, nấu cháo cho bé rất tốt.','Dạ cảm ơn anh, bí đỏ organic nhà trồng ạ!',NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000049','f2000000-0000-0000-0000-000000000049','e0000000-0000-0000-0000-000000000049','b0000000-0000-0000-0000-000000000009',4,'Dừa sáp dẻo sệt, ăn lạ miệng. Giá hơi cao.',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000050','f2000000-0000-0000-0000-000000000050','e0000000-0000-0000-0000-000000000050','b0000000-0000-0000-0000-000000000009',5,'Dừa dứa thơm lá nếp, nước ngọt thanh mát!',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000051','f2000000-0000-0000-0000-000000000051','e0000000-0000-0000-0000-000000000051','b0000000-0000-0000-0000-000000000009',4,'Bưởi nhụy hồng ngọt, tép to mọng nước.',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000052','f2000000-0000-0000-0000-000000000052','e0000000-0000-0000-0000-000000000052','b0000000-0000-0000-0000-000000000009',4,'Măng cụt chua ngọt dập dìu, đúng mùa ngon!','Cảm ơn anh, măng cụt chính vụ ạ!',NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000053','f2000000-0000-0000-0000-000000000053','e0000000-0000-0000-0000-000000000053','b0000000-0000-0000-0000-000000000009',5,'Bòn bon Thái ngọt như đường phèn, ghiền!',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000054','f2000000-0000-0000-0000-000000000054','e0000000-0000-0000-0000-000000000054','b0000000-0000-0000-0000-000000000009',4,'Cacao trái tươi, lên men thử rất thú vị.',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000055','f2000000-0000-0000-0000-000000000055','e0000000-0000-0000-0000-000000000055','b0000000-0000-0000-0000-000000000009',5,'Sầu riêng Monthong cơm vàng, béo ngậy cực!',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000056','f2000000-0000-0000-0000-000000000056','e0000000-0000-0000-0000-000000000056','b0000000-0000-0000-0000-000000000009',4,'Quýt đường ngọt, vắt nước siro rất ngon.',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000057','f2000000-0000-0000-0000-000000000057','e0000000-0000-0000-0000-000000000057','b0000000-0000-0000-0000-000000000009',5,'Chuối sáp luộc dẻo qụeo, ăn với nước cốt dừa!','Cảm ơn anh, chuối sáp đặc sản Bến Tre ạ!',NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000058','f2000000-0000-0000-0000-000000000058','e0000000-0000-0000-0000-000000000058','b0000000-0000-0000-0000-000000000009',5,'Chuối sứ to bự, nấu chè chuối ngon tuyệt!',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000059','f2000000-0000-0000-0000-000000000059','e0000000-0000-0000-0000-000000000059','b0000000-0000-0000-0000-000000000009',4,'Khổ qua gai nhồi thịt, canh mát thanh nhiệt.',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000060','f2000000-0000-0000-0000-000000000060','e0000000-0000-0000-0000-000000000060','b0000000-0000-0000-0000-000000000009',5,'Chanh dây ruột vàng ươm, vắt nước chua ngọt!',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000061','f2000000-0000-0000-0000-000000000061','e0000000-0000-0000-0000-000000000061','b0000000-0000-0000-0000-000000000009',5,'Chanh không hạt mọng nước, vắt ra rất nhiều!',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000062','f2000000-0000-0000-0000-000000000062','e0000000-0000-0000-0000-000000000062','b0000000-0000-0000-0000-000000000009',4,'Đu đủ ruột đỏ ngọt, ăn tráng miệng ngon.',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000063','f2000000-0000-0000-0000-000000000063','e0000000-0000-0000-0000-000000000063','b0000000-0000-0000-0000-000000000009',5,'Măng tươi luộc sẵn, xào thịt bò rất ngon!','Cảm ơn anh Tuấn đã review ạ!',NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000064','f2000000-0000-0000-0000-000000000064','e0000000-0000-0000-0000-000000000064','b0000000-0000-0000-0000-000000000009',5,'Dứa mật ngọt lịm, ăn tươi hay nấu canh đều ok!',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000065','f2000000-0000-0000-0000-000000000065','e0000000-0000-0000-0000-000000000065','b0000000-0000-0000-0000-000000000009',4,'Lòng bong chua chua dôn dốt, ăn vui miệng.',NULL,NOW()-interval '13 days'),
('f3000000-0000-0000-0000-000000000066','f2000000-0000-0000-0000-000000000066','e0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000008',5,'Mua lần 2, cà chua vẫn tươi ngon như lần đầu!',NULL,NOW()-interval '8 days'),
('f3000000-0000-0000-0000-000000000067','f2000000-0000-0000-0000-000000000067','e0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000008',5,'Xà lách Lolo Rosa lá tím đẹp, giòn sạch sẽ!','Cảm ơn chị Lan quay lại ạ!',NOW()-interval '8 days'),
('f3000000-0000-0000-0000-000000000068','f2000000-0000-0000-0000-000000000068','e0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000008',5,'Ớt chuông lần này trái to hơn, rất hài lòng!',NULL,NOW()-interval '8 days'),
('f3000000-0000-0000-0000-000000000069','f2000000-0000-0000-0000-000000000069','e0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000008',4,'Hành tây ngọt, xào với bò rất thơm ngon.',NULL,NOW()-interval '8 days'),
('f3000000-0000-0000-0000-000000000070','f2000000-0000-0000-0000-000000000070','e0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000008',5,'Atiso hãm trà uống thanh mát, giải độc gan.',NULL,NOW()-interval '8 days'),
('f3000000-0000-0000-0000-000000000071','f2000000-0000-0000-0000-000000000071','e0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000009',5,'Xoài Hòa Lộc lần này ngọt hơn nữa, xuất sắc!',NULL,NOW()-interval '5 days'),
('f3000000-0000-0000-0000-000000000072','f2000000-0000-0000-0000-000000000072','e0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000009',4,'Bưởi ngọt thanh, trái to đều. Sẽ mua tiếp.',NULL,NOW()-interval '5 days'),
('f3000000-0000-0000-0000-000000000073','f2000000-0000-0000-0000-000000000073','e0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000009',5,'Nhãn xuồng cơm vàng dày, ngọt đậm đà!','Cảm ơn anh, nhãn đang mùa ngon nhất ạ!',NOW()-interval '5 days'),
('f3000000-0000-0000-0000-000000000074','f2000000-0000-0000-0000-000000000074','e0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000009',5,'Gạo ST25 thơm dẻo, nấu cơm ngon mỗi ngày!',NULL,NOW()-interval '5 days'),
('f3000000-0000-0000-0000-000000000075','f2000000-0000-0000-0000-000000000075','e0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000009',4,'Mít Thái múi to giòn, ngọt vừa phải.',NULL,NOW()-interval '5 days'),
('f3000000-0000-0000-0000-000000000076','f2000000-0000-0000-0000-000000000076','e0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000007',5,'Mua 5 trái dừa xiêm, trái nào cũng ngọt mát!',NULL,NOW()-interval '1 days'),
('f3000000-0000-0000-0000-000000000077','f2000000-0000-0000-0000-000000000077','e0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000007',5,'Khoai lang tím hấp bùi ngọt, con nhỏ rất thích!','Cảm ơn anh Minh, khoai organic 100% ạ!',NOW()-interval '1 days'),
('f3000000-0000-0000-0000-000000000078','f2000000-0000-0000-0000-000000000078','e0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000007',5,'Dâu tây mọng đỏ, chua ngọt hài hòa. Xuất sắc!',NULL,NOW()-interval '1 days'),
('f3000000-0000-0000-0000-000000000079','f2000000-0000-0000-0000-000000000079','e0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000007',4,'Bắp cải tím tươi, trộn salad rất bắt mắt.',NULL,NOW()-interval '1 days'),
('f3000000-0000-0000-0000-000000000080','f2000000-0000-0000-0000-000000000080','e0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000007',4,'Bí đỏ bở ngọt, hấp ăn hoặc nấu soup đều ngon.','Dạ cảm ơn anh, chúc gia đình sức khỏe ạ!',NOW()-interval '1 days')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════
-- DONE — units/users/htx/shops/products/images/orders/reviews seeded
-- ═══════════════════════════════════════════════