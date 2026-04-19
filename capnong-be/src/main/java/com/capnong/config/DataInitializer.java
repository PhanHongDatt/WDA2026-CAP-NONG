package com.capnong.config;

import com.capnong.model.*;
import com.capnong.model.enums.*;
import com.capnong.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Tạo dữ liệu mẫu khi khởi động ứng dụng (chỉ chạy ở profile "dev").
 *
 * Seed data bao gồm:
 *   • 5 tài khoản test (mỗi role 1 tài khoản + thêm farmers phụ)
 *   • Đơn vị đo lường cơ bản (KG, G, TAN, TA, YEN, BAO, THUNG, TRAI, BO, LIT)
 *   • 1 HTX + HtxShop + Shop (cho HTX_MANAGER)
 *   • 2 Shop cá nhân (cho farmer1, farmer2)
 *   • 15+ sản phẩm nông sản đa dạng
 *
 * Mật khẩu mặc định: Password123!
 */
@Component
@Profile("seed")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final String DEFAULT_PASSWORD = "Password123!";

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final UnitRepository unitRepository;
    private final HtxRepository htxRepository;
    private final HtxShopRepository htxShopRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("═══════════════════════════════════════════");
        log.info("🌱  Kiểm tra & tạo dữ liệu test...");
        log.info("═══════════════════════════════════════════");

        String encodedPassword = passwordEncoder.encode(DEFAULT_PASSWORD);

        // ─── 1. Tài khoản ──────────────────────────────────────
        User admin     = ensureUser("admin",       "admin@capnong.vn",      "0900000001", "Quản Trị Viên",          Role.ADMIN,       encodedPassword);
        User buyer     = ensureUser("buyer",       "buyer@capnong.vn",      "0900000002", "Nguyễn Văn Mua",         Role.BUYER,       encodedPassword);
        User farmer1   = ensureUser("farmer",      "farmer@capnong.vn",     "0900000003", "Trần Văn Nông",          Role.FARMER,      encodedPassword);
        User farmer2   = ensureUser("farmer2",     "farmer2@capnong.vn",    "0900000006", "Lê Thị Hoa",             Role.FARMER,      encodedPassword);
        User htxMember = ensureUser("htx_member",  "htxmember@capnong.vn",  "0900000004", "Phạm Minh Đức",          Role.HTX_MEMBER,  encodedPassword);
        User htxMgr    = ensureUser("htx_manager", "htxmanager@capnong.vn", "0900000005", "Võ Thanh Hùng",          Role.HTX_MANAGER, encodedPassword);

        // ─── 2. Đơn vị đo lường ────────────────────────────────
        seedUnits();

        // ─── 3. Shop cá nhân (farmer) ──────────────────────────
        Shop shopFarmer1 = ensureShop(farmer1, "vuon-tran-nong", "Vườn Trần Nông",
                "Đồng Tháp", "Cao Lãnh",
                "Chuyên cung cấp xoài cát Hòa Lộc, bưởi da xanh tươi ngon từ vườn",
                (short) 10, 15000);

        Shop shopFarmer2 = ensureShop(farmer2, "trang-trai-le-hoa", "Trang Trại Lê Hoa",
                "Lâm Đồng", "Đà Lạt",
                "Rau sạch Đà Lạt, trồng theo phương pháp VietGAP, giao hàng tận nơi",
                (short) 5, 8000);

        // ─── 4. HTX + HtxShop ──────────────────────────────────
        seedHtx(htxMgr, htxMember);

        // ─── 5. Sản phẩm ───────────────────────────────────────
        if (productRepository.count() == 0) {
            seedProducts(shopFarmer1, shopFarmer2);
        } else {
            log.info("   ⏩ Sản phẩm đã tồn tại ({} sp), bỏ qua.", productRepository.count());
        }

        log.info("═══════════════════════════════════════════");
        log.info("✅  Seed data hoàn tất!");
        log.info("   Mật khẩu chung: {}", DEFAULT_PASSWORD);
        log.info("   Tài khoản: admin, buyer, farmer, farmer2, htx_member, htx_manager");
        log.info("═══════════════════════════════════════════");
    }

    // ═══════════════════════════════════════════════════════════════
    //  USERS
    // ═══════════════════════════════════════════════════════════════

    private User ensureUser(String username, String email, String phone,
                            String fullName, Role role, String encodedPassword) {
        
        // Find existing user by any of the unique keys
        var existingUserOpt = userRepository.findFirstByUsernameOrPhoneOrEmail(username, phone, email);
        if (existingUserOpt.isPresent()) {
            User existing = existingUserOpt.get();
            log.info("   ⏩ {} ({}) — đã tồn tại (Username: {}, Phone: {})", fullName, role, existing.getUsername(), existing.getPhone());
            
            // Ensure the existing user has the correct role for testing (in case it was created via UI with different role)
            if (existing.getRole() != role) {
                existing.setRole(role);
                userRepository.save(existing);
                log.info("   🔄 Đã cập nhật role của {} thành {}", existing.getUsername(), role);
            }
            return existing;
        }

        try {
            User user = User.builder()
                    .username(username)
                    .email(email)
                    .phone(phone)
                    .fullName(fullName)
                    .password(encodedPassword)
                    .role(role)
                    .active(true)
                    .build();
            userRepository.save(user);
            log.info("   ✅ Tạo tài khoản: {} | {} | {}", username, role, phone);
            return user;
        } catch (Exception e) {
            log.warn("   ⚠️ Không thể tạo {}: {} (Có thể SĐT hoặc Email đã tồn tại ở User khác)", username, e.getMessage());
            return null;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  UNITS
    // ═══════════════════════════════════════════════════════════════

    private void seedUnits() {
        if (unitRepository.count() > 0) {
            log.info("   ⏩ Đơn vị đo đã tồn tại ({} đơn vị), bỏ qua.", unitRepository.count());
            return;
        }

        // Base units
        Unit kg = createUnit("KG", "Kilôgam", "kg", null, BigDecimal.ONE, UnitCategory.WEIGHT);
        createUnit("G",    "Gam",      "g",     kg,   new BigDecimal("0.001"),    UnitCategory.WEIGHT);
        createUnit("TAN",  "Tấn",      "tấn",   kg,   new BigDecimal("1000"),     UnitCategory.WEIGHT);
        createUnit("TA",   "Tạ",       "tạ",    kg,   new BigDecimal("100"),      UnitCategory.WEIGHT);
        createUnit("YEN",  "Yến",      "yến",   kg,   new BigDecimal("10"),       UnitCategory.WEIGHT);

        Unit lit = createUnit("LIT", "Lít", "lít", null, BigDecimal.ONE, UnitCategory.VOLUME);
        createUnit("ML", "Mililít", "ml", lit, new BigDecimal("0.001"), UnitCategory.VOLUME);

        createUnit("TRAI",  "Trái",       "trái",  null, BigDecimal.ONE, UnitCategory.COUNT);
        createUnit("BO",    "Bó",         "bó",    null, BigDecimal.ONE, UnitCategory.COUNT);
        createUnit("BAO",   "Bao",        "bao",   null, BigDecimal.ONE, UnitCategory.PACKAGING);
        createUnit("THUNG", "Thùng",      "thùng", null, BigDecimal.ONE, UnitCategory.PACKAGING);

        log.info("   ✅ Tạo 11 đơn vị đo lường");
    }

    private Unit createUnit(String code, String displayName, String symbol,
                            Unit baseUnit, BigDecimal conversionFactor, UnitCategory category) {
        Unit unit = Unit.builder()
                .code(code)
                .displayName(displayName)
                .symbol(symbol)
                .baseUnit(baseUnit)
                .conversionFactor(conversionFactor)
                .category(category)
                .build();
        return unitRepository.save(unit);
    }

    // ═══════════════════════════════════════════════════════════════
    //  SHOPS
    // ═══════════════════════════════════════════════════════════════

    private Shop ensureShop(User owner, String slug, String name, String province,
                            String district, String bio, short yearsExp, int farmAreaM2) {
        if (owner == null) {
            log.warn("   ⚠️ Owner is null, skipping shop creation for slug: {}", slug);
            return null;
        }

        var existingBySlug = shopRepository.findBySlug(slug);
        if (existingBySlug.isPresent()) {
            log.info("   ⏩ Shop {} — đã tồn tại theo slug", slug);
            Shop shop = existingBySlug.get();
            // Cập nhật lại owner nếu khác (để fix lỡ có dirty data)
            if (!shop.getOwner().getId().equals(owner.getId())) {
                shop.setOwner(owner);
                shopRepository.save(shop);
                log.info("   🔄 Đã gắn lại Owner của shop {} cho user {}", slug, owner.getUsername());
            }
            return shop;
        }

        if (shopRepository.existsByOwner_Id(owner.getId())) {
            log.info("   ⏩ Shop của {} — đã tồn tại", owner.getUsername());
            return shopRepository.findByOwner_Id(owner.getId()).orElse(null);
        }

        try {
            Shop shop = Shop.builder()
                    .owner(owner)
                    .slug(slug)
                    .name(name)
                    .province(province)
                    .district(district)
                    .bio(bio)
                    .yearsExperience(yearsExp)
                    .farmAreaM2(farmAreaM2)
                    .build();
            shopRepository.save(shop);
            log.info("   ✅ Tạo shop: {} — {}, {}", name, province, district);
            return shop;
        } catch (Exception e) {
            log.warn("   ⚠️ Lỗi tạo shop {}: {}", slug, e.getMessage());
            return null;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  HTX
    // ═══════════════════════════════════════════════════════════════

    private void seedHtx(User manager, User member) {
        if (htxRepository.count() > 0) {
            log.info("   ⏩ HTX đã tồn tại, bỏ qua.");
            return;
        }

        Htx htx = Htx.builder()
                .name("HTX Nông Nghiệp An Giang")
                .officialCode("HTX-AG-2026")
                .province("An Giang")
                .district("Châu Đốc")
                .description("Hợp tác xã nông nghiệp chuyên canh lúa gạo, cây ăn trái vùng Đồng bằng sông Cửu Long")
                .status(HtxStatus.ACTIVE)
                .manager(manager)
                .createdByUser(manager)
                .build();
        htxRepository.save(htx);

        // Link user → HTX
        manager.setHtx(htx);
        userRepository.save(manager);
        member.setHtx(htx);
        userRepository.save(member);

        // HtxShop
        if (!htxShopRepository.existsByHtx_Id(htx.getId())) {
            Shop htxShopEntity = Shop.builder()
                    .owner(manager)
                    .slug("htx-ag-2026")
                    .name("Gian hàng HTX An Giang")
                    .province("An Giang")
                    .district("Châu Đốc")
                    .bio("Gian hàng sỉ của HTX Nông Nghiệp An Giang — gom đơn nông sản chất lượng cao")
                    .build();
            shopRepository.save(htxShopEntity);

            HtxShop htxShop = HtxShop.builder()
                    .htx(htx)
                    .slug("htx-ag-2026")
                    .name("HTX An Giang")
                    .description("Gian hàng sỉ — gom đơn lúa gạo, trái cây cho buyer sỉ")
                    .shop(htxShopEntity)
                    .build();
            htxShopRepository.save(htxShop);
            log.info("   ✅ Tạo HTX: {} + HtxShop", htx.getName());
        }

        log.info("   ✅ HTX An Giang — Manager: {}, Member: {}", manager.getUsername(), member.getUsername());
    }

    // ═══════════════════════════════════════════════════════════════
    //  PRODUCTS
    // ═══════════════════════════════════════════════════════════════

    private void seedProducts(Shop shopFarmer1, Shop shopFarmer2) {
        log.info("   🌾 Bắt đầu seed sản phẩm...");

        // ─── Shop Farmer1 (Đồng Tháp): Trái cây, Lúa gạo ────
        createProduct(shopFarmer1, "Xoài Cát Hòa Lộc", ProductCategory.FRUIT,
                "Xoài cát Hòa Lộc đặc sản Đồng Tháp, trái to đều, thịt dày vàng ươm, vị ngọt thanh tự nhiên. Thu hoạch tại vườn, đảm bảo tươi ngon.",
                "KG", new BigDecimal("65000"), new BigDecimal("500"),
                FarmingMethod.VIETGAP, true, "Cao Lãnh, Đồng Tháp",
                ProductStatus.IN_SEASON, LocalDate.now().minusDays(5),
                "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800");

        createProduct(shopFarmer1, "Bưởi Da Xanh", ProductCategory.FRUIT,
                "Bưởi da xanh Bến Tre, vỏ mỏng, tép bưởi hồng đào, ngọt thanh không hạt. Lý tưởng để biếu tặng hoặc dùng hàng ngày.",
                "KG", new BigDecimal("45000"), new BigDecimal("300"),
                FarmingMethod.ORGANIC, true, "Cao Lãnh, Đồng Tháp",
                ProductStatus.IN_SEASON, LocalDate.now().minusDays(3),
                "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800");

        createProduct(shopFarmer1, "Nhãn Xuồng Cơm Vàng", ProductCategory.FRUIT,
                "Nhãn xuồng cơm vàng, trái to cơm dày, vị ngọt đậm đà. Sản phẩm đạt chứng nhận VietGAP.",
                "KG", new BigDecimal("55000"), new BigDecimal("200"),
                FarmingMethod.VIETGAP, true, "Cao Lãnh, Đồng Tháp",
                ProductStatus.IN_SEASON, LocalDate.now().minusDays(2),
                "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800");

        createProduct(shopFarmer1, "Gạo ST25", ProductCategory.GRAIN,
                "Gạo ST25 — giống gạo ngon nhất thế giới. Hạt dài, dẻo, thơm tự nhiên. Trồng tại Đồng Tháp, xay xát tại chỗ.",
                "KG", new BigDecimal("28000"), new BigDecimal("2000"),
                FarmingMethod.TRADITIONAL, false, "Cao Lãnh, Đồng Tháp",
                ProductStatus.IN_SEASON, LocalDate.now().minusDays(30),
                "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800");

        createProduct(shopFarmer1, "Gạo Jasmine", ProductCategory.GRAIN,
                "Gạo Jasmine thơm, hạt trắng trong, cơm mềm dẻo. Thích hợp cho bữa cơm gia đình hàng ngày.",
                "KG", new BigDecimal("18000"), new BigDecimal("3000"),
                FarmingMethod.TRADITIONAL, false, "Cao Lãnh, Đồng Tháp",
                ProductStatus.IN_SEASON, LocalDate.now().minusDays(20),
                "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800");

        createProduct(shopFarmer1, "Mít Thái Siêu Sớm", ProductCategory.FRUIT,
                "Mít Thái siêu sớm, múi to vàng ươm, giòn ngọt. Trái từ 8-12kg, thu hoạch trực tiếp từ vườn.",
                "KG", new BigDecimal("25000"), new BigDecimal("400"),
                FarmingMethod.TRADITIONAL, false, "Cao Lãnh, Đồng Tháp",
                ProductStatus.UPCOMING, LocalDate.now().plusDays(15),
                "https://images.unsplash.com/photo-1528825871115-3581a5e0791d?w=800");

        createProduct(shopFarmer1, "Khoai Lang Tím Nhật", ProductCategory.TUBER,
                "Khoai lang tím Nhật Bến Tre, ruột tím đậm, vị ngọt bùi. Giàu chất chống oxy hóa, tốt cho sức khỏe.",
                "KG", new BigDecimal("22000"), new BigDecimal("600"),
                FarmingMethod.ORGANIC, true, "Cao Lãnh, Đồng Tháp",
                ProductStatus.IN_SEASON, LocalDate.now().minusDays(7),
                "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=800");

        // ─── Shop Farmer2 (Đà Lạt): Rau sạch, Gia vị ─────────
        createProduct(shopFarmer2, "Cà Chua Beef Đà Lạt", ProductCategory.VEGETABLE,
                "Cà chua Beef Đà Lạt, trái to bóng mọng, thịt dày ít hạt. Trồng trong nhà kính VietGAP, không thuốc trừ sâu.",
                "KG", new BigDecimal("35000"), new BigDecimal("200"),
                FarmingMethod.VIETGAP, true, "TP Đà Lạt, Lâm Đồng",
                ProductStatus.IN_SEASON, LocalDate.now().minusDays(1),
                "https://images.unsplash.com/photo-1546470427-e26264be0b11?w=800");

        createProduct(shopFarmer2, "Xà Lách Lolo Rosa", ProductCategory.VEGETABLE,
                "Xà lách Lolo Rosa Đà Lạt, lá xoăn tím đẹp mắt, giòn ngọt. Trồng thủy canh trong nhà kính sạch.",
                "KG", new BigDecimal("40000"), new BigDecimal("100"),
                FarmingMethod.GLOBALGAP, true, "TP Đà Lạt, Lâm Đồng",
                ProductStatus.IN_SEASON, LocalDate.now(),
                "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800");

        createProduct(shopFarmer2, "Ớt Chuông Đỏ", ProductCategory.VEGETABLE,
                "Ớt chuông đỏ Đà Lạt, trái to giòn, vị ngọt tự nhiên. Phù hợp salad, xào, nấu súp.",
                "KG", new BigDecimal("50000"), new BigDecimal("150"),
                FarmingMethod.VIETGAP, true, "TP Đà Lạt, Lâm Đồng",
                ProductStatus.IN_SEASON, LocalDate.now().minusDays(2),
                "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800");

        createProduct(shopFarmer2, "Bắp Cải Tím", ProductCategory.VEGETABLE,
                "Bắp cải tím Đà Lạt, cuộn chặt, màu tím đậm tự nhiên. Giàu vitamin C, lý tưởng cho salad và nộm.",
                "KG", new BigDecimal("25000"), new BigDecimal("300"),
                FarmingMethod.ORGANIC, true, "TP Đà Lạt, Lâm Đồng",
                ProductStatus.IN_SEASON, LocalDate.now().minusDays(4),
                "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800");

        createProduct(shopFarmer2, "Dâu Tây Đà Lạt", ProductCategory.FRUIT,
                "Dâu tây Đà Lạt tươi, trái đỏ mọng, vị chua ngọt hài hòa. Thu hoạch mỗi sáng, đóng hộp cẩn thận.",
                "KG", new BigDecimal("120000"), new BigDecimal("80"),
                FarmingMethod.ORGANIC, true, "TP Đà Lạt, Lâm Đồng",
                ProductStatus.IN_SEASON, LocalDate.now(),
                "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800");

        createProduct(shopFarmer2, "Atiso Đà Lạt", ProductCategory.HERB,
                "Atiso tươi Đà Lạt, bông to lá dày. Dùng nấu canh, hãm trà thanh nhiệt giải độc gan.",
                "KG", new BigDecimal("60000"), new BigDecimal("120"),
                FarmingMethod.TRADITIONAL, false, "TP Đà Lạt, Lâm Đồng",
                ProductStatus.IN_SEASON, LocalDate.now().minusDays(3),
                "https://images.unsplash.com/photo-1580910365203-91ea9115a319?w=800");

        createProduct(shopFarmer2, "Bí Đỏ Hạt Đen", ProductCategory.VEGETABLE,
                "Bí đỏ Đà Lạt, ruột vàng cam, bở ngọt. Nấu cháo, súp, hấp đều ngon. Giàu vitamin A.",
                "KG", new BigDecimal("15000"), new BigDecimal("500"),
                FarmingMethod.TRADITIONAL, false, "TP Đà Lạt, Lâm Đồng",
                ProductStatus.IN_SEASON, LocalDate.now().minusDays(10),
                "https://images.unsplash.com/photo-1506917728037-b6af01a7d403?w=800");

        createProduct(shopFarmer2, "Hành Tây Đà Lạt", ProductCategory.VEGETABLE,
                "Hành tây Đà Lạt, củ to đều, vị ngọt nhẹ khi nấu chín. Sản phẩm đạt chuẩn VietGAP.",
                "KG", new BigDecimal("18000"), new BigDecimal("400"),
                FarmingMethod.VIETGAP, false, "TP Đà Lạt, Lâm Đồng",
                ProductStatus.IN_SEASON, LocalDate.now().minusDays(6),
                "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800");

        log.info("   ✅ Tạo 16 sản phẩm mẫu");
    }

    private void createProduct(Shop shop, String name, ProductCategory category,
                               String description, String unitCode,
                               BigDecimal pricePerUnit, BigDecimal availableQuantity,
                               FarmingMethod farmingMethod, boolean pesticideFree,
                               String locationDetail, ProductStatus status,
                               LocalDate harvestDate, String imageUrl) {
        Unit unit = unitRepository.findByCode(unitCode)
                .orElseThrow(() -> new RuntimeException("Unit not found: " + unitCode));

        Product product = Product.builder()
                .shop(shop)
                .name(name)
                .category(category)
                .description(description)
                .unit(unit)
                .pricePerUnit(pricePerUnit)
                .availableQuantity(availableQuantity)
                .farmingMethod(farmingMethod)
                .pesticideFree(pesticideFree)
                .locationDetail(locationDetail)
                .origin(name + " - " + locationDetail)
                .minOrderQuantity(BigDecimal.valueOf(2)) // Default 2 units
                .weight(BigDecimal.ONE)
                .shelfLife("7 ngày")
                .status(status)
                .harvestDate(harvestDate)
                .build();
        product = productRepository.save(product);

        // Thêm ảnh sản phẩm
        if (imageUrl != null) {
            ProductImage image = ProductImage.builder()
                    .product(product)
                    .url(imageUrl)
                    .sortOrder((short) 0)
                    .build();
            product.getImages().add(image);
            productRepository.save(product);
        }
    }
}

