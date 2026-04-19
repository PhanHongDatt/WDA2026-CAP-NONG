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
('b0000000-0000-0000-0000-000000000001', 'admin', 'Admin Hệ Thống', '0900000000', 'admin@capnong.vn',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', true, true, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════
-- 3. HTX
-- BaseEntity + own: name, official_code, province, district, description,
--                   document_url, status, manager_id, admin_note, created_by_user_id
-- ═══════════════════════════════════════════════
INSERT INTO htx (id, name, official_code, province, district, description, status, created_by_user_id, deleted, created_at, updated_at) VALUES
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
('b0000000-0000-0000-0000-000000000002', 'htx_manager_1', 'Trần Văn Quản', '0900000001', 'quanly1@capnong.vn',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HTX_MANAGER', 'a0000000-0000-0000-0000-000000000001',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager1', true, true, false, NOW(), NOW()),
('b0000000-0000-0000-0000-000000000003', 'htx_manager_2', 'Lê Thị Hoa', '0900000002', 'quanly2@capnong.vn',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HTX_MANAGER', 'a0000000-0000-0000-0000-000000000002',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager2', true, true, false, NOW(), NOW()),
-- Farmers
('b0000000-0000-0000-0000-000000000004', 'farmer_lehoa', 'Lê Văn Hoa', '0910000001', 'lehoa@capnong.vn',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'FARMER', 'a0000000-0000-0000-0000-000000000001',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeHoa', true, true, false, NOW(), NOW()),
('b0000000-0000-0000-0000-000000000005', 'farmer_trannong', 'Trần Văn Nông', '0910000002', 'trannong@capnong.vn',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'FARMER', 'a0000000-0000-0000-0000-000000000002',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranNong', true, true, false, NOW(), NOW()),
('b0000000-0000-0000-0000-000000000006', 'farmer_nguyenxuan', 'Nguyễn Xuân', '0910000003', 'nguyenxuan@capnong.vn',
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
-- BaseEntity + own: owner_id, slug, name, province, district, bio,
--                   years_experience, farm_area_m2, avatar_url, cover_url,
--                   average_rating, total_reviews
-- ═══════════════════════════════════════════════
INSERT INTO shops (id, owner_id, slug, name, province, district, bio, years_experience, farm_area_m2, avatar_url, average_rating, total_reviews, deleted, created_at, updated_at) VALUES
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
 'VEGETABLE', 'KG', 15000, 500, 'TRADITIONAL', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.00, 12, 90, false, NOW(), NOW())
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
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1506917728037-b6af01a7d403?w=800', 0, false, NOW(), NOW());

-- ═══════════════════════════════════════════════
-- DONE — units/users/htx/shops/products/images seeded
-- Orders & Reviews skipped (schema may differ from Java entity due to DB migrations)
-- ═══════════════════════════════════════════════