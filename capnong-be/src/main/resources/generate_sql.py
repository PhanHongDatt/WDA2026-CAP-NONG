import uuid

def u(seed):
    # Generates a pseudo-random UUID based on a seed string/number
    gen = str(seed).zfill(32)
    return f"{gen[:8]}-{gen[8:12]}-{gen[12:16]}-{gen[16:20]}-{gen[20:]}"

sqls = []

sqls.append("""-- ==============================
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
""")

PW_HASH = "'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'" # admin123

# HTX
htx1 = u("htx001")
htx2 = u("htx002")
sqls.append(f"""
INSERT INTO htx (id, name, official_code, province, district, description, status, created_at) VALUES
('{htx1}', 'HTX Nông nghiệp sạch Đà Lạt', 'HTX-DL-001', 'Lâm Đồng', 'Đà Lạt', 'HTX chuyên cung cấp rau củ quả chuẩn VietGAP và Hữu cơ.', 'ACTIVE', NOW()),
('{htx2}', 'HTX Trái cây Long An', 'HTX-LA-001', 'Long An', 'Châu Thành', 'Liên minh các nhà vườn Miền Tây.', 'ACTIVE', NOW());
""")

# USERS
users = [
    (u("user000"), "Admin Tổng", "0900000000", "admin@capnong.shop", "ADMIN", "NULL", "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"),
    (u("htxm01"), "Trần Văn Quản (HTX 1)", "0900000001", "quanly1@htx.com", "HTX_MANAGER", htx1, "https://api.dicebear.com/7.x/avataaars/svg?seed=Manager1"),
    (u("htxm02"), "Lê Thị Quản (HTX 2)", "0900000002", "quanly2@htx.com", "HTX_MANAGER", htx2, "https://api.dicebear.com/7.x/avataaars/svg?seed=Manager2"),
]
# Add 3 HTX Members
for i in range(1, 4):
    users.append((u(f"htxmem0{i}"), f"Nông dân HTX {i}", f"091000000{i}", f"tv{i}@htx.com", "HTX_MEMBER", htx1 if i<3 else htx2, f"https://api.dicebear.com/7.x/avataaars/svg?seed=Mem{i}"))

# Add 3 Independent Farmers
for i in range(1, 4):
    users.append((u(f"farmer0{i}"), f"Nhà vườn Tự do {i}", f"092000000{i}", f"farmer{i}@gmail.com", "FARMER", "NULL", f"https://api.dicebear.com/7.x/avataaars/svg?seed=Farm{i}"))

# Add 12 Buyers
for i in range(1, 13):
    users.append((u(f"buyer0{i}"), f"Người mua số {i}", f"09300000{i:02d}", f"buyer{i}@gmail.com", "BUYER", "NULL", f"https://api.dicebear.com/7.x/avataaars/svg?seed=Buy{i}"))


u_sql = "INSERT INTO users (id, full_name, phone, email, password_hash, role, htx_id, avatar_url, is_banned, created_at, updated_at) VALUES\n"
u_vals = []
for us in users:
    htx_id = f"'{us[5]}'" if us[5] != "NULL" else "NULL"
    u_vals.append(f"('{us[0]}', '{us[1]}', '{us[2]}', '{us[3]}', {PW_HASH}, '{us[4]}', {htx_id}, '{us[6]}', false, NOW(), NOW())")
sqls.append(u_sql + ",\n".join(u_vals) + " ON CONFLICT (id) DO NOTHING;\n")

# SHOPS for Farmers & HTX Members
shops = [
    (u("shop1"), users[1][0], "htx-dalat", "Vựa rau Đà Lạt HTX", "Lâm Đồng", "Đà Lạt", "Cam kết 100% tươi ngon hái tại vườn.", 5, 2000, "https://images.unsplash.com/photo-1595856467232-c651ee2bc394?q=80&w=200&auto=format&fit=crop", 4.8, 120),
    (u("shop2"), users[3][0], "vuon-ong-ba", "Vườn Rau Ông Ba", "Lâm Đồng", "Đức Trọng", "Trồng theo chuẩn VietGAP", 10, 5000, "https://images.unsplash.com/photo-1615486511484-92e172a2c11f?q=80&w=200&auto=format&fit=crop", 4.9, 56),
    (u("shop3"), users[6][0], "trai-cay-sach", "Vườn Trái Cây Chú Tư", "Long An", "Châu Thành", "Thanh long, cam, quýt hữu cơ.", 8, 3000, "https://images.unsplash.com/photo-1501523460185-2aa5d2a0f981?q=80&w=200&auto=format&fit=crop", 4.5, 34),
    (u("shop4"), users[7][0], "hai-san-phan-thiet", "Hải Sản Tươi Sống PT", "Bình Thuận", "Phan Thiết", "Đánh bắt trong ngày, uy tín chất lượng.", 3, 0, "https://images.unsplash.com/photo-1615147342761-9258e151fc2e?q=80&w=200&auto=format&fit=crop", 5.0, 10),
    (u("shop5"), users[8][0], "thit-heo-dong-nai", "Trại Heo Năm Phát", "Đồng Nai", "Trảng Bom", "Thịt sạch an toàn.", 15, 10000, "https://images.unsplash.com/photo-1607532941433-304659e8198a?q=80&w=200&auto=format&fit=crop", 4.2, 89),
]
s_sql = "INSERT INTO shops (id, owner_id, slug, name, province, district, bio, years_experience, farm_area_m2, avatar_url, average_rating, total_reviews, created_at) VALUES\n"
s_vals = []
for s in shops:
    s_vals.append(f"('{s[0]}', '{s[1]}', '{s[2]}', '{s[3]}', '{s[4]}', '{s[5]}', '{s[6]}', {s[7]}, {s[8]}, '{s[9]}', {s[10]}, {s[11]}, NOW())")
sqls.append(s_sql + ",\n".join(s_vals) + " ON CONFLICT (id) DO NOTHING;\n")

# PRODUCTS
prods = [
    # shop 1 (Rau củ)
    (u("prod01"), shops[0][0], "Bắp Cải Sapa", "Bắp cải giòn rụm, ngọt lịm.", "VEGETABLE", "KG", 25000, 100, "ORGANIC", 'true', "Đà Lạt, Lâm Đồng"),
    (u("prod02"), shops[0][0], "Cà Rốt Đà Lạt", "Cà rốt trồng nhà lưới.", "VEGETABLE", "KG", 18000, 50, "VIETGAP", 'true', "Đà Lạt, Lâm Đồng"),
    (u("prod03"), shops[0][0], "Cà Chua Beef", "Trái to, thịt dày, ăn sống được.", "VEGETABLE", "KG", 35000, 20, "GLOBALGAP", 'true', "Đà Lạt, Lâm Đồng"),
    (u("prod04"), shops[0][0], "Hành Tây", "Hành tây xào bao ngon.", "VEGETABLE", "KG", 15000, 200, "TRADITIONAL", 'false', "Đà Lạt, Lâm Đồng"),
    
    # shop 2 (Cũng rau)
    (u("prod05"), shops[1][0], "Rau Muống Nước", "Sạch, xanh mướt.", "VEGETABLE", "BO", 8000, 150, "VIETGAP", 'true', "Củ Chi, HCM"),
    (u("prod06"), shops[1][0], "Xà Lách Lô Lô Xanh", "Phù hợp làm salad.", "VEGETABLE", "KG", 40000, 30, "ORGANIC", 'true', "Đà Lạt, Lâm Đồng"),
    (u("prod07"), shops[1][0], "Cải Thảo", "Làm kim chi tuyệt vời.", "VEGETABLE", "KG", 12000, 80, "TRADITIONAL", 'false', "Lâm Đồng"),

    # shop 3 (Trái cây)
    (u("prod08"), shops[2][0], "Thanh Long Ruột Đỏ", "Ngọt lịm, bao ăn.", "FRUIT", "KG", 22000, 300, "TRADITIONAL", 'false', "Châu Thành, Long An"),
    (u("prod09"), shops[2][0], "Cam Sành", "Cam sành xoàn nước nhiều.", "FRUIT", "KG", 18000, 500, "VIETGAP", 'true', "Tiền Giang"),
    (u("prod10"), shops[2][0], "Xoài Cát Hòa Lộc", "Xoài chuẩn loại 1, thơm nức mũi.", "FRUIT", "KG", 85000, 50, "GLOBALGAP", 'true', "Cao Lãnh, Đồng Tháp"),
    (u("prod11"), shops[2][0], "Sầu Riêng Ri6", "Bao nghèo, cơm vàng.", "FRUIT", "KG", 110000, 40, "VIETGAP", 'false', "Cần Thơ"),
    (u("prod12"), shops[2][0], "Dừa Sáp", "Đặc sản Trà Vinh.", "FRUIT", "TRAI", 90000, 20, "TRADITIONAL", 'false', "Trà Vinh"),

    # shop 4 (Hải sản)
    (u("prod13"), shops[3][0], "Mực Ống Tươi", "Đánh bắt ngoài khơi Phan Thiết.", "SEAFOOD", "KG", 280000, 20, "TRADITIONAL", 'true', "Phan Thiết"),
    (u("prod14"), shops[3][0], "Cá Thu Cắt Lát", "Đông lạnh sâu chuẩn xuất khẩu.", "SEAFOOD", "KG", 320000, 15, "GLOBALGAP", 'true', "Vũng Tàu"),
    (u("prod15"), shops[3][0], "Tôm Hú Sống", "Giao sống tận nhà.", "SEAFOOD", "KG", 800000, 5, "VIETGAP", 'true', "Nha Trang"),

    # shop 5 (Thịt)
    (u("prod16"), shops[4][0], "Thịt Ba Chỉ Heo Sạch", "Lợn chuẩn VietGAP.", "MEAT", "KG", 140000, 100, "VIETGAP", 'true', "Đồng Nai"),
    (u("prod17"), shops[4][0], "Cốt Lết Heo", "Thịt dày, mềm.", "MEAT", "KG", 120000, 80, "VIETGAP", 'true', "Đồng Nai"),
    (u("prod18"), shops[4][0], "Gà Ta Thả Vườn", "Thịt dai, da vàng.", "MEAT", "KG", 150000, 30, "ORGANIC", 'true', "Long Khánh"),
    (u("prod19"), shops[4][0], "Sườn Non", "Ninh canh cực ngọt.", "MEAT", "KG", 180000, 40, "VIETGAP", 'true', "Đồng Nai"),
    (u("prod20"), shops[4][0], "Bò Thăn Ngoại", "Bò tơ.", "MEAT", "KG", 280000, 20, "TRADITIONAL", 'false', "Tây Ninh"),
]

p_sql = "INSERT INTO products (id, shop_id, name, description, category, unit_code, price_per_unit, available_quantity, farming_method, pesticide_free, location_detail, status, average_rating, total_reviews, created_at, updated_at) VALUES\n"
p_vals = []
for p in prods:
    # Set high ratings initially
    rating = 4.0 + (int(str(uuid.uuid4())[-1], 16) / 16.0)
    reviews = int(str(uuid.uuid4())[-2:], 16)
    p_vals.append(f"('{p[0]}', '{p[1]}', '{p[2]}', '{p[3]}', '{p[4]}', '{p[5]}', {p[6]}, {p[7]}, '{p[8]}', {str(p[9]).lower()}, '{p[10]}', 'ACTIVE', {rating:.2f}, {reviews}, NOW(), NOW())")
sqls.append(p_sql + ",\n".join(p_vals) + " ON CONFLICT (id) DO NOTHING;\n")

# IMAGES
imgs = [
    (prods[0][0], "https://images.unsplash.com/photo-1596707314271-87c2fb283db8?w=800&auto=format&fit=crop"),
    (prods[1][0], "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop"),
    (prods[2][0], "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop"),
    (prods[3][0], "https://plus.unsplash.com/premium_photo-1675237625695-9005928d15a5?w=800&auto=format&fit=crop"),
    (prods[4][0], "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop"),
    (prods[5][0], "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&auto=format&fit=crop"),
    (prods[6][0], "https://plus.unsplash.com/premium_photo-1664303358079-5e2a2ba7ca67?w=800&auto=format&fit=crop"),
    (prods[7][0], "https://images.unsplash.com/photo-1527325678964-54921661f888?w=800&auto=format&fit=crop"),
    (prods[8][0], "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&auto=format&fit=crop"),
    (prods[9][0], "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop"),
    (prods[10][0], "https://images.unsplash.com/photo-1662909477651-eb471e98d8ee?w=800&auto=format&fit=crop"),
    (prods[11][0], "https://images.unsplash.com/photo-1601002570768-60c7f2874136?w=800&auto=format&fit=crop"),
    (prods[12][0], "https://images.unsplash.com/photo-1524388837130-b38992ad3205?w=800&auto=format&fit=crop"),
    (prods[13][0], "https://images.unsplash.com/photo-1534948216015-843149f72be3?w=800&auto=format&fit=crop"),
    (prods[14][0], "https://images.unsplash.com/photo-1615147342761-9258e151fc2e?w=800&auto=format&fit=crop"),
    (prods[15][0], "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800&auto=format&fit=crop"),
    (prods[16][0], "https://plus.unsplash.com/premium_photo-1661330368142-6ee16035ec87?w=800&auto=format&fit=crop"),
    (prods[17][0], "https://images.unsplash.com/photo-1602078652392-7ec24a64fc9b?w=800&auto=format&fit=crop"),
    (prods[18][0], "https://images.unsplash.com/photo-1551028150-64b9e398f678?w=800&auto=format&fit=crop"),
    (prods[19][0], "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800&auto=format&fit=crop"),
]

img_sql = "INSERT INTO product_images (id, product_id, url, sort_order, created_at) VALUES\n"
img_vals = []
for i, img in enumerate(imgs):
    img_vals.append(f"(gen_random_uuid(), '{img[0]}', '{img[1]}', 0, NOW())")
    # Add a second image sometimes
    if i % 3 == 0:
        img_vals.append(f"(gen_random_uuid(), '{img[0]}', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop', 1, NOW())")

sqls.append(img_sql + ",\n".join(img_vals) + " ON CONFLICT (id) DO NOTHING;\n")

# Update manager for HTX
sqls.append(f"UPDATE htx SET manager_id = '{users[1][0]}' WHERE id = '{htx1}';")
sqls.append(f"UPDATE htx SET manager_id = '{users[2][0]}' WHERE id = '{htx2}';")

with open(r"c:\\Users\\Nguyen Trong Khoi\\Downloads\\CapNong\\WDA2026-CAP-NONG\\capnong-be\\src\\main\\resources\\data.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sqls))
    
print("SQL Generated in data.sql!")
