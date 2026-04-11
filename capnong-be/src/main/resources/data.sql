-- ==============================
-- Seed Data cho Cạp Nông
-- Data bao gồm 20+ records để test giao diện
-- password chung: admin123
-- ==============================

TRUNCATE TABLE product_images, products, shops, users, htx, units CASCADE;

INSERT INTO units (code, display_name, symbol, base_unit, conversion_factor, category) VALUES
('KG', 'Kilogram', 'kg', NULL, 1.000000, 'WEIGHT'),
('G', 'Gram', 'g', 'KG', 0.001000, 'WEIGHT'),
('TAN', 'Tấn', 't', 'KG', 1000.000000, 'WEIGHT'),
('YEN', 'Yến', 'yến', 'KG', 10.000000, 'WEIGHT'),
('TA', 'Tạ', 'tạ', 'KG', 100.000000, 'WEIGHT'),
('LIT', 'Lít', 'L', NULL, 1.000000, 'VOLUME'),
('ML', 'Mililít', 'mL', 'LIT', 0.001000, 'VOLUME'),
('TRAI', 'Trái', 'trái', NULL, 1.000000, 'COUNT'),
('CU', 'Củ', 'củ', NULL, 1.000000, 'COUNT'),
('BO', 'Bó', 'bó', NULL, 1.000000, 'COUNT'),
('THUNG', 'Thùng', 'thùng', NULL, 1.000000, 'PACKAGING'),
('BAO', 'Bao', 'bao', NULL, 1.000000, 'PACKAGING'),
('HOP', 'Hộp', 'hộp', NULL, 1.000000, 'PACKAGING'),
('GIO', 'Giỏ', 'giỏ', NULL, 1.000000, 'PACKAGING')
ON CONFLICT (code) DO NOTHING;


INSERT INTO htx (id, name, official_code, province, district, description, status, created_at) VALUES
('00000000-0000-0000-0000-000000htx001', 'HTX Nông nghiệp sạch Đà Lạt', 'HTX-DL-001', 'Lâm Đồng', 'Đà Lạt', 'HTX chuyên cung cấp rau củ quả chuẩn VietGAP và Hữu cơ.', 'ACTIVE', NOW()),
('00000000-0000-0000-0000-000000htx002', 'HTX Trái cây Long An', 'HTX-LA-001', 'Long An', 'Châu Thành', 'Liên minh các nhà vườn Miền Tây.', 'ACTIVE', NOW());

INSERT INTO users (id, full_name, phone, email, password_hash, role, htx_id, avatar_url, is_banned, created_at, updated_at) VALUES
('00000000-0000-0000-0000-00000user000', 'Admin Tổng', '0900000000', 'admin@capnong.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', false, NOW(), NOW()),
('00000000-0000-0000-0000-000000htxm01', 'Trần Văn Quản (HTX 1)', '0900000001', 'quanly1@htx.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HTX_MANAGER', '00000000-0000-0000-0000-000000htx001', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager1', false, NOW(), NOW()),
('00000000-0000-0000-0000-000000htxm02', 'Lê Thị Quản (HTX 2)', '0900000002', 'quanly2@htx.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HTX_MANAGER', '00000000-0000-0000-0000-000000htx002', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager2', false, NOW(), NOW()),
('00000000-0000-0000-0000-0000htxmem01', 'Nông dân HTX 1', '0910000001', 'tv1@htx.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HTX_MEMBER', '00000000-0000-0000-0000-000000htx001', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mem1', false, NOW(), NOW()),
('00000000-0000-0000-0000-0000htxmem02', 'Nông dân HTX 2', '0910000002', 'tv2@htx.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HTX_MEMBER', '00000000-0000-0000-0000-000000htx001', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mem2', false, NOW(), NOW()),
('00000000-0000-0000-0000-0000htxmem03', 'Nông dân HTX 3', '0910000003', 'tv3@htx.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HTX_MEMBER', '00000000-0000-0000-0000-000000htx002', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mem3', false, NOW(), NOW()),
('00000000-0000-0000-0000-0000farmer01', 'Nhà vườn Tự do 1', '0920000001', 'farmer1@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'FARMER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Farm1', false, NOW(), NOW()),
('00000000-0000-0000-0000-0000farmer02', 'Nhà vườn Tự do 2', '0920000002', 'farmer2@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'FARMER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Farm2', false, NOW(), NOW()),
('00000000-0000-0000-0000-0000farmer03', 'Nhà vườn Tự do 3', '0920000003', 'farmer3@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'FARMER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Farm3', false, NOW(), NOW()),
('00000000-0000-0000-0000-00000buyer01', 'Người mua số 1', '0930000001', 'buyer1@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buy1', false, NOW(), NOW()),
('00000000-0000-0000-0000-00000buyer02', 'Người mua số 2', '0930000002', 'buyer2@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buy2', false, NOW(), NOW()),
('00000000-0000-0000-0000-00000buyer03', 'Người mua số 3', '0930000003', 'buyer3@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buy3', false, NOW(), NOW()),
('00000000-0000-0000-0000-00000buyer04', 'Người mua số 4', '0930000004', 'buyer4@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buy4', false, NOW(), NOW()),
('00000000-0000-0000-0000-00000buyer05', 'Người mua số 5', '0930000005', 'buyer5@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buy5', false, NOW(), NOW()),
('00000000-0000-0000-0000-00000buyer06', 'Người mua số 6', '0930000006', 'buyer6@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buy6', false, NOW(), NOW()),
('00000000-0000-0000-0000-00000buyer07', 'Người mua số 7', '0930000007', 'buyer7@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buy7', false, NOW(), NOW()),
('00000000-0000-0000-0000-00000buyer08', 'Người mua số 8', '0930000008', 'buyer8@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buy8', false, NOW(), NOW()),
('00000000-0000-0000-0000-00000buyer09', 'Người mua số 9', '0930000009', 'buyer9@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buy9', false, NOW(), NOW()),
('00000000-0000-0000-0000-0000buyer010', 'Người mua số 10', '0930000010', 'buyer10@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buy10', false, NOW(), NOW()),
('00000000-0000-0000-0000-0000buyer011', 'Người mua số 11', '0930000011', 'buyer11@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buy11', false, NOW(), NOW()),
('00000000-0000-0000-0000-0000buyer012', 'Người mua số 12', '0930000012', 'buyer12@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BUYER', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buy12', false, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;

INSERT INTO shops (id, owner_id, slug, name, province, district, bio, years_experience, farm_area_m2, avatar_url, average_rating, total_reviews, created_at) VALUES
('00000000-0000-0000-0000-0000000shop1', '00000000-0000-0000-0000-000000htxm01', 'htx-dalat', 'Vựa rau Đà Lạt HTX', 'Lâm Đồng', 'Đà Lạt', 'Cam kết 100% tươi ngon hái tại vườn.', 5, 2000, 'https://images.unsplash.com/photo-1595856467232-c651ee2bc394?q=80&w=200&auto=format&fit=crop', 4.8, 120, NOW()),
('00000000-0000-0000-0000-0000000shop2', '00000000-0000-0000-0000-0000htxmem01', 'vuon-ong-ba', 'Vườn Rau Ông Ba', 'Lâm Đồng', 'Đức Trọng', 'Trồng theo chuẩn VietGAP', 10, 5000, 'https://images.unsplash.com/photo-1615486511484-92e172a2c11f?q=80&w=200&auto=format&fit=crop', 4.9, 56, NOW()),
('00000000-0000-0000-0000-0000000shop3', '00000000-0000-0000-0000-0000farmer01', 'trai-cay-sach', 'Vườn Trái Cây Chú Tư', 'Long An', 'Châu Thành', 'Thanh long, cam, quýt hữu cơ.', 8, 3000, 'https://images.unsplash.com/photo-1501523460185-2aa5d2a0f981?q=80&w=200&auto=format&fit=crop', 4.5, 34, NOW()),
('00000000-0000-0000-0000-0000000shop4', '00000000-0000-0000-0000-0000farmer02', 'hai-san-phan-thiet', 'Hải Sản Tươi Sống PT', 'Bình Thuận', 'Phan Thiết', 'Đánh bắt trong ngày, uy tín chất lượng.', 3, 0, 'https://images.unsplash.com/photo-1615147342761-9258e151fc2e?q=80&w=200&auto=format&fit=crop', 5.0, 10, NOW()),
('00000000-0000-0000-0000-0000000shop5', '00000000-0000-0000-0000-0000farmer03', 'thit-heo-dong-nai', 'Trại Heo Năm Phát', 'Đồng Nai', 'Trảng Bom', 'Thịt sạch an toàn.', 15, 10000, 'https://images.unsplash.com/photo-1607532941433-304659e8198a?q=80&w=200&auto=format&fit=crop', 4.2, 89, NOW()) ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, shop_id, name, description, category, unit_code, price_per_unit, available_quantity, farming_method, pesticide_free, location_detail, status, average_rating, total_reviews, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000prod01', '00000000-0000-0000-0000-0000000shop1', 'Bắp Cải Sapa', 'Bắp cải giòn rụm, ngọt lịm.', 'VEGETABLE', 'KG', 25000, 100, 'ORGANIC', true, 'Đà Lạt, Lâm Đồng', 'ACTIVE', 4.75, 29, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod02', '00000000-0000-0000-0000-0000000shop1', 'Cà Rốt Đà Lạt', 'Cà rốt trồng nhà lưới.', 'VEGETABLE', 'KG', 18000, 50, 'VIETGAP', true, 'Đà Lạt, Lâm Đồng', 'ACTIVE', 4.12, 113, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod03', '00000000-0000-0000-0000-0000000shop1', 'Cà Chua Beef', 'Trái to, thịt dày, ăn sống được.', 'VEGETABLE', 'KG', 35000, 20, 'GLOBALGAP', true, 'Đà Lạt, Lâm Đồng', 'ACTIVE', 4.00, 243, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod04', '00000000-0000-0000-0000-0000000shop1', 'Hành Tây', 'Hành tây xào bao ngon.', 'VEGETABLE', 'KG', 15000, 200, 'TRADITIONAL', false, 'Đà Lạt, Lâm Đồng', 'ACTIVE', 4.75, 19, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod05', '00000000-0000-0000-0000-0000000shop2', 'Rau Muống Nước', 'Sạch, xanh mướt.', 'VEGETABLE', 'BO', 8000, 150, 'VIETGAP', true, 'Củ Chi, HCM', 'ACTIVE', 4.56, 188, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod06', '00000000-0000-0000-0000-0000000shop2', 'Xà Lách Lô Lô Xanh', 'Phù hợp làm salad.', 'VEGETABLE', 'KG', 40000, 30, 'ORGANIC', true, 'Đà Lạt, Lâm Đồng', 'ACTIVE', 4.56, 158, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod07', '00000000-0000-0000-0000-0000000shop2', 'Cải Thảo', 'Làm kim chi tuyệt vời.', 'VEGETABLE', 'KG', 12000, 80, 'TRADITIONAL', false, 'Lâm Đồng', 'ACTIVE', 4.81, 32, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod08', '00000000-0000-0000-0000-0000000shop3', 'Thanh Long Ruột Đỏ', 'Ngọt lịm, bao ăn.', 'FRUIT', 'KG', 22000, 300, 'TRADITIONAL', false, 'Châu Thành, Long An', 'ACTIVE', 4.38, 24, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod09', '00000000-0000-0000-0000-0000000shop3', 'Cam Sành', 'Cam sành xoàn nước nhiều.', 'FRUIT', 'KG', 18000, 500, 'VIETGAP', true, 'Tiền Giang', 'ACTIVE', 4.56, 107, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod10', '00000000-0000-0000-0000-0000000shop3', 'Xoài Cát Hòa Lộc', 'Xoài chuẩn loại 1, thơm nức mũi.', 'FRUIT', 'KG', 85000, 50, 'GLOBALGAP', true, 'Cao Lãnh, Đồng Tháp', 'ACTIVE', 4.19, 24, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod11', '00000000-0000-0000-0000-0000000shop3', 'Sầu Riêng Ri6', 'Bao nghèo, cơm vàng.', 'FRUIT', 'KG', 110000, 40, 'VIETGAP', false, 'Cần Thơ', 'ACTIVE', 4.81, 2, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod12', '00000000-0000-0000-0000-0000000shop3', 'Dừa Sáp', 'Đặc sản Trà Vinh.', 'FRUIT', 'TRAI', 90000, 20, 'TRADITIONAL', false, 'Trà Vinh', 'ACTIVE', 4.06, 68, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod13', '00000000-0000-0000-0000-0000000shop4', 'Mực Ống Tươi', 'Đánh bắt ngoài khơi Phan Thiết.', 'SEAFOOD', 'KG', 280000, 20, 'TRADITIONAL', true, 'Phan Thiết', 'ACTIVE', 4.19, 186, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod14', '00000000-0000-0000-0000-0000000shop4', 'Cá Thu Cắt Lát', 'Đông lạnh sâu chuẩn xuất khẩu.', 'SEAFOOD', 'KG', 320000, 15, 'GLOBALGAP', true, 'Vũng Tàu', 'ACTIVE', 4.81, 18, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod15', '00000000-0000-0000-0000-0000000shop4', 'Tôm Hú Sống', 'Giao sống tận nhà.', 'SEAFOOD', 'KG', 800000, 5, 'VIETGAP', true, 'Nha Trang', 'ACTIVE', 4.06, 230, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod16', '00000000-0000-0000-0000-0000000shop5', 'Thịt Ba Chỉ Heo Sạch', 'Lợn chuẩn VietGAP.', 'MEAT', 'KG', 140000, 100, 'VIETGAP', true, 'Đồng Nai', 'ACTIVE', 4.06, 9, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod17', '00000000-0000-0000-0000-0000000shop5', 'Cốt Lết Heo', 'Thịt dày, mềm.', 'MEAT', 'KG', 120000, 80, 'VIETGAP', true, 'Đồng Nai', 'ACTIVE', 4.88, 227, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod18', '00000000-0000-0000-0000-0000000shop5', 'Gà Ta Thả Vườn', 'Thịt dai, da vàng.', 'MEAT', 'KG', 150000, 30, 'ORGANIC', true, 'Long Khánh', 'ACTIVE', 4.44, 51, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod19', '00000000-0000-0000-0000-0000000shop5', 'Sườn Non', 'Ninh canh cực ngọt.', 'MEAT', 'KG', 180000, 40, 'VIETGAP', true, 'Đồng Nai', 'ACTIVE', 4.19, 56, NOW(), NOW()),
('00000000-0000-0000-0000-000000prod20', '00000000-0000-0000-0000-0000000shop5', 'Bò Thăn Ngoại', 'Bò tơ.', 'MEAT', 'KG', 280000, 20, 'TRADITIONAL', false, 'Tây Ninh', 'ACTIVE', 4.50, 228, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, url, sort_order, created_at) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod01', 'https://images.unsplash.com/photo-1596707314271-87c2fb283db8?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod01', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop', 1, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod02', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod03', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod04', 'https://plus.unsplash.com/premium_photo-1675237625695-9005928d15a5?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod04', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop', 1, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod05', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod06', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod07', 'https://plus.unsplash.com/premium_photo-1664303358079-5e2a2ba7ca67?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod07', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop', 1, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod08', 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod09', 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod10', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod10', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop', 1, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod11', 'https://images.unsplash.com/photo-1662909477651-eb471e98d8ee?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod12', 'https://images.unsplash.com/photo-1601002570768-60c7f2874136?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod13', 'https://images.unsplash.com/photo-1524388837130-b38992ad3205?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod13', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop', 1, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod14', 'https://images.unsplash.com/photo-1534948216015-843149f72be3?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod15', 'https://images.unsplash.com/photo-1615147342761-9258e151fc2e?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod16', 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod16', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop', 1, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod17', 'https://plus.unsplash.com/premium_photo-1661330368142-6ee16035ec87?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod18', 'https://images.unsplash.com/photo-1602078652392-7ec24a64fc9b?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod19', 'https://images.unsplash.com/photo-1551028150-64b9e398f678?w=800&auto=format&fit=crop', 0, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod19', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop', 1, NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000prod20', 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800&auto=format&fit=crop', 0, NOW()) ON CONFLICT (id) DO NOTHING;

UPDATE htx SET manager_id = '00000000-0000-0000-0000-000000htxm01' WHERE id = '00000000-0000-0000-0000-000000htx001';
UPDATE htx SET manager_id = '00000000-0000-0000-0000-000000htxm02' WHERE id = '00000000-0000-0000-0000-000000htx002';