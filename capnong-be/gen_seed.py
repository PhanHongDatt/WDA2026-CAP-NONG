# -*- coding: utf-8 -*-
import json
import random
import urllib.parse

shops = {
    'd0000000-0000-0000-0000-000000000001': {
        'loc': 'TP Đà Lạt, Lâm Đồng',
        'items': [
            ("Cải ngọt", "Cải ngọt giòn sạch, canh tác thủy canh.", "VEGETABLE", "KG", 20000, 500, "ORGANIC"),
            ("Khoai tây", "Khoai tây ruột vàng, củ to đều.", "TUBER", "KG", 30000, 1000, "VIETGAP"),
            ("Cà rốt", "Cà rốt tươi rói, giòn ngọt.", "TUBER", "KG", 25000, 800, "VIETGAP"),
            ("Rau mồng tơi", "Rau mồng tơi non, lá to, nấu canh rất ngọt.", "VEGETABLE", "KG", 15000, 300, "TRADITIONAL"),
            ("Súp lơ xanh", "Súp lơ xanh nguyên bắp, sạch sâu bệnh.", "VEGETABLE", "KG", 40000, 200, "ORGANIC"),
            ("Súp lơ trắng", "Súp lơ trắng, bắp cuộn chặt, màu trắng đục.", "VEGETABLE", "KG", 35000, 200, "VIETGAP"),
            ("Bầu", "Bầu sao, bầu hồ lô trái thon dài.", "VEGETABLE", "KG", 12000, 150, "TRADITIONAL"),
            ("Bí xanh", "Bí đao chanh, bí đao sao giải nhiệt.", "VEGETABLE", "KG", 15000, 300, "TRADITIONAL"),
            ("Mướp hương", "Mướp hương thơm phức, trái nõn nà.", "VEGETABLE", "KG", 18000, 400, "ORGANIC"),
            ("Cải bó xôi", "Rau chân vịt, dinh dưỡng cao.", "VEGETABLE", "KG", 35000, 150, "ORGANIC"),
            ("Cà chua Cherry", "Cà chua bi chua ngọt hài hòa, giòn rụm.", "VEGETABLE", "KG", 60000, 100, "GLOBALGAP"),
            ("Nấm đùi gà", "Nấm đùi gà baby, vị dai ngọt nhạt.", "OTHER", "KG", 70000, 50, "ORGANIC"),
            ("Nấm kim châm", "Nấm kim châm tươi gói 200g.", "OTHER", "BAO", 12000, 500, "VIETGAP"),
            ("Xà lách xoong", "Xà lách xoong đà lạt, lá nhỏ, cay nồng.", "VEGETABLE", "KG", 25000, 200, "TRADITIONAL"),
            ("Cần tây", "Cần tây thân to, ép nước uống rất ngon.", "VEGETABLE", "KG", 30000, 300, "ORGANIC"),
            ("Rau dền đỏ", "Dền đỏ, cung cấp sắt, nấu canh mát mẻ.", "VEGETABLE", "KG", 15000, 300, "TRADITIONAL"),
            ("Củ cải trắng", "Củ cải trắng to, mọng nước.", "TUBER", "KG", 18000, 800, "VIETGAP")
        ]
    },
    'd0000000-0000-0000-0000-000000000002': {
        'loc': 'Cao Lãnh, Đồng Tháp',
        'items': [
            ("Cam Xoàn", "Cam xoàn Đồng Tháp, vắt nước hay ăn múi đều ngon, ngọt.", "FRUIT", "KG", 35000, 400, "VIETGAP"),
            ("Quýt Hồng Lai Vung", "Đặc sản Lai Vung, trái no vỏ căng mỏng, chín đỏ cam.", "FRUIT", "KG", 55000, 200, "TRADITIONAL"),
            ("Mận An Phước", "Mận chín đỏ đô, giòn xốp và mọng nước.", "FRUIT", "KG", 30000, 350, "VIETGAP"),
            ("Nhãn Ido", "Nhãn Ido hạt nhỏ xíu, cơm ráo và thơm.", "FRUIT", "KG", 40000, 500, "GLOBALGAP"),
            ("Sầu riêng Ri6", "Sầu riêng Ri6 rụng gốc, cơm vàng hạt lép.", "FRUIT", "KG", 120000, 100, "ORGANIC"),
            ("Chôm chôm Thái", "Chôm chôm Thái róc hạt, nhai giòn sần sật.", "FRUIT", "KG", 35000, 300, "VIETGAP"),
            ("Chôm chôm nhãn", "Nhỏ hơn chôm chôm Thái nhưng ngọt ngát và thơm mùi nhãn.", "FRUIT", "KG", 45000, 150, "TRADITIONAL"),
            ("Thanh long ruột đỏ", "Thanh long ruột đỏ ngọt mát.", "FRUIT", "KG", 35000, 250, "VIETGAP"),
            ("Thanh long ruột trắng", "Thanh long bình thuận, trái to hơn, chua chua ngọt ngọt.", "FRUIT", "KG", 25000, 200, "TRADITIONAL"),
            ("Bưởi Năm Roi", "Bưởi Năm Roi Bình Minh, chua mặn nhẹ, rất thanh.", "FRUIT", "TRAI", 30000, 400, "VIETGAP"),
            ("Ổi Lê Đài Loan", "Ổi lê xốp giòn, ngọt tự nhiên, to oạch.", "FRUIT", "KG", 20000, 1000, "TRADITIONAL"),
            ("Ổi Nữ Hoàng", "Ổi ruột đặc, chua ngọt dầm dề.", "FRUIT", "KG", 25000, 500, "VIETGAP"),
            ("Dưa hấu Mỹ dẹt", "Dưa hấu ngọt lịm mùa hè.", "FRUIT", "KG", 15000, 800, "TRADITIONAL"),
            ("Vú sữa Lò Rèn", "Vú sữa căng bóng, ruột sữa trắng phau dẻo mát.", "FRUIT", "KG", 60000, 150, "GLOBALGAP"),
            ("Sơ ri chua", "Sơ ri chua, hái mộc từ vườn nhà Đồng Tháp.", "FRUIT", "KG", 20000, 50, "TRADITIONAL"),
            ("Gạo Nàng Hoa", "Gạo Nàng Hoa chín dẻo, thổi cơm cực ngon.", "GRAIN", "KG", 22000, 2000, "VIETGAP")
        ]
    },
    'd0000000-0000-0000-0000-000000000003': {
        'loc': 'Châu Thành, Bến Tre',
        'items': [
            ("Dừa sáp", "Dừa sáp Cầu Kè thượng hạng, dẻo sệt.", "FRUIT", "TRAI", 150000, 20, "ORGANIC"),
            ("Dừa dứa", "Nước dừa thơm thoang thoảng mùi lá nếp (lá dứa).", "FRUIT", "TRAI", 25000, 300, "VIETGAP"),
            ("Bưởi da xanh nhụy hồng", "Bưởi da xanh ruột đào, ngọt thanh tự nhiên.", "FRUIT", "KG", 55000, 150, "GLOBALGAP"),
            ("Măng cụt Bến Tre", "Măng cụt vào mùa, chua ngọt dập dìu.", "FRUIT", "KG", 65000, 200, "VIETGAP"),
            ("Bòn bon Thái", "Bòn bon Thái róc hạt, ngọt như đường phèn.", "FRUIT", "KG", 70000, 120, "TRADITIONAL"),
            ("Cacao trái", "Ca cao tươi dành cho ai thích tự lên men hạt.", "FRUIT", "KG", 45000, 50, "ORGANIC"),
            ("Sầu riêng Monthong", "Sầu riêng sấy lạnh Monthong hạt hẹp.", "FRUIT", "KG", 140000, 100, "GLOBALGAP"),
            ("Quýt đường", "Quýt đường vắt nước siro ngon nhức nách.", "FRUIT", "KG", 35000, 400, "VIETGAP"),
            ("Chuối sáp", "Chuối sáp Bến Tre, luộc lên ăn dẻo qụeo.", "FRUIT", "KG", 25000, 300, "TRADITIONAL"),
            ("Chuối sứ", "Chuối sứ to bự, để nấu chè chuối.", "FRUIT", "KG", 15000, 200, "TRADITIONAL"),
            ("Mướp đắng (Khổ qua)", "Khổ qua gai, nhồi thịt thanh mát.", "VEGETABLE", "KG", 20000, 150, "VIETGAP"),
            ("Chanh dây", "Chanh dây ruột vàng ươm, vắt nước uống tuyệt.", "FRUIT", "KG", 35000, 100, "ORGANIC"),
            ("Chanh không hạt", "Chanh đào không hạt mọng nước, to như trứng.", "FRUIT", "KG", 20000, 400, "VIETGAP"),
            ("Đu đủ ruột đỏ", "Đu đủ miệt vườn, cắt ra đỏ au ngòn ngọt.", "FRUIT", "KG", 18000, 350, "TRADITIONAL"),
            ("Măng tươi tây nguyên", "Măng le tươi luộc sẵn nguyên nón.", "VEGETABLE", "KG", 40000, 250, "ORGANIC"),
            ("Dứa mật", "Khóm tây nam bộ ngọt như ướp mật.", "FRUIT", "TRAI", 15000, 500, "VIETGAP"),
            ("Trái Lòng Bong", "Lòng bong nội địa, chua chua dôn dốt vui miệng.", "FRUIT", "KG", 40000, 80, "TRADITIONAL")
        ]
    }
}

product_inserts = []
image_inserts = []

pid = 16

for shop_id, shop in shops.items():
    for item in shop['items']:
        name, desc, cat, unit, price, qty, farm = item
        uid = f"e0000000-0000-0000-0000-{pid:012d}"
        pf = "true" if farm in ["ORGANIC", "GLOBALGAP"] else "false"
        ar = round(random.uniform(4.0, 5.0), 2)
        tr = random.randint(5, 200)
        ts = random.randint(10, 1000)
        
        sql = f"('{uid}', '{shop_id}', '{name}', '{desc}', '{cat}', '{unit}', {price}, {qty}, '{farm}', {pf}, '{shop['loc']}', 'IN_SEASON', {ar:.2f}, {tr}, {ts}, false, NOW(), NOW())"
        product_inserts.append(sql)
        
        # generate 1 realistic image by using unsplash source with name keyword
        img_url = f"https://source.unsplash.com/random/800x800/?{urllib.parse.quote('farm,fruit,vegetable')}"
        image_inserts.append(f"(gen_random_uuid(), '{uid}', '{img_url}', 0, false, NOW(), NOW())")
        
        pid += 1

with open('./src/main/resources/data.sql', 'r', encoding='utf-8') as f:
    orig = f.read()

# find first block
old_p = " 'VEGETABLE', 'KG', 15000, 500, 'TRADITIONAL', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.00, 12, 90, false, NOW(), NOW())\nON CONFLICT (id) DO NOTHING;"
new_p = " 'VEGETABLE', 'KG', 15000, 500, 'TRADITIONAL', false, 'Châu Thành, Bến Tre', 'IN_SEASON', 4.00, 12, 90, false, NOW(), NOW()),\n" + ",\n".join(product_inserts) + "\nON CONFLICT (id) DO NOTHING;"
orig = orig.replace(old_p, new_p)

# find second block
old_i = "(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1506917728037-b6af01a7d403?w=800', 0, false, NOW(), NOW());"
new_i = "(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1506917728037-b6af01a7d403?w=800', 0, false, NOW(), NOW()),\n" + ",\n".join(image_inserts) + ";"
orig = orig.replace(old_i, new_i)

with open('./src/main/resources/data.sql', 'w', encoding='utf-8') as f:
    f.write(orig)

print("done")
