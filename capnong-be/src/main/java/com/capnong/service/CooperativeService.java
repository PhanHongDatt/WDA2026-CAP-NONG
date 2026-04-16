package com.capnong.service;

import com.capnong.dto.request.BundleCreateRequest;
import com.capnong.dto.request.PledgeRequest;
import com.capnong.dto.response.BundleResponseDto;
import com.capnong.dto.response.PledgeResponseDto;
import com.capnong.exception.AppException;
import com.capnong.mapper.BundleMapper;
import com.capnong.model.*;
import com.capnong.model.enums.*;
import com.capnong.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Core business logic cho Digital Cooperative — Gom đơn (Bundle Aggregation).
 *
 * Flow:
 *  1. HTX_MANAGER tạo Bundle trong HTX_SHOP
 *  2. HTX_MEMBER (farmer) pledge sản lượng
 *  3. Manager confirm bundle → tính doanh thu + tạo virtual Product
 *  4. Buyer sỉ mua product qua cart/checkout bình thường
 *  5. Scheduler auto-expire bundles quá deadline
 */
@Service
public class CooperativeService implements ICooperativeService {

    private static final Logger logger = LoggerFactory.getLogger(CooperativeService.class);

    private final CooperativeBundleRepository bundleRepository;
    private final BundlePledgeRepository pledgeRepository;
    private final HtxShopRepository htxShopRepository;
    private final HtxRepository htxRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final UnitRepository unitRepository;
    private final TelegramNotificationService telegramNotificationService;
    private final BundleMapper bundleMapper;

    public CooperativeService(CooperativeBundleRepository bundleRepository,
                              BundlePledgeRepository pledgeRepository,
                              HtxShopRepository htxShopRepository,
                              HtxRepository htxRepository,
                              UserRepository userRepository,
                              ProductRepository productRepository,
                              ShopRepository shopRepository,
                              UnitRepository unitRepository,
                              TelegramNotificationService telegramNotificationService,
                              BundleMapper bundleMapper) {
        this.bundleRepository = bundleRepository;
        this.pledgeRepository = pledgeRepository;
        this.htxShopRepository = htxShopRepository;
        this.htxRepository = htxRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.shopRepository = shopRepository;
        this.unitRepository = unitRepository;
        this.telegramNotificationService = telegramNotificationService;
        this.bundleMapper = bundleMapper;
    }

    // ═══════════════════════════════════════════════════════════════
    //  QUERY
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public List<BundleResponseDto> getOpenBundles() {
        return bundleRepository.findByStatus(BundleStatus.OPEN).stream()
                .map(b -> bundleMapper.toBundleDto(b, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BundleResponseDto getBundleById(UUID bundleId) {
        CooperativeBundle bundle = findBundleOrThrow(bundleId);
        return bundleMapper.toBundleDto(bundle, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BundleResponseDto> getShopBundles(UUID htxShopId) {
        return bundleRepository.findByHtxShop_IdOrderByCreatedAtDesc(htxShopId).stream()
                .map(b -> bundleMapper.toBundleDto(b, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PledgeResponseDto> getMyPledges(UUID farmerId) {
        return pledgeRepository.findByFarmer_IdAndStatus(farmerId, PledgeStatus.ACTIVE).stream()
                .map(bundleMapper::toPledgeDto)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════
    //  BUNDLE LIFECYCLE (HTX_MANAGER)
    // ═══════════════════════════════════════════════════════════════

    /**
     * 1. Tạo Bundle mới trong HTX_SHOP.
     */
    @Override
    @Transactional
    public BundleResponseDto createBundle(BundleCreateRequest request, UUID managerId) {
        // Verify manager owns an HTX
        User manager = findUserOrThrow(managerId);
        Htx htx = htxRepository.findByManager_Id(managerId)
                .orElseThrow(() -> new AppException("Bạn chưa quản lý HTX nào", HttpStatus.FORBIDDEN));

        // Find or create HTX_SHOP
        HtxShop htxShop = htxShopRepository.findByHtx_Id(htx.getId())
                .orElseGet(() -> createHtxShop(htx, manager));

        CooperativeBundle bundle = CooperativeBundle.builder()
                .htxShop(htxShop)
                .productCategory(request.getProductCategory())
                .productName(request.getProductName())
                .unitCode(request.getUnitCode())
                .targetQuantity(BigDecimal.valueOf(request.getTargetQuantity()))
                .pricePerUnit(BigDecimal.valueOf(request.getPricePerUnit()))
                .deadline(request.getDeadline())
                .description(request.getDescription())
                .minPledgeQuantity(request.getMinPledgeQuantity() != null
                        ? BigDecimal.valueOf(request.getMinPledgeQuantity()) : null)
                .status(BundleStatus.OPEN)
                .currentPledgedQuantity(BigDecimal.ZERO)
                .build();

        CooperativeBundle saved = bundleRepository.save(bundle);

        // Notify tất cả HTX_MEMBER trong cùng HTX
        List<User> members = userRepository.findByHtx_Id(htx.getId());
        for (User member : members) {
            if (!member.getId().equals(managerId)) {
                telegramNotificationService.notify(
                        member.getId(),
                        NotificationType.SYSTEM,
                        "📦 Bundle mới từ HTX",
                        "HTX **" + htx.getName() + "** vừa tạo gói gom đơn **" + request.getProductName()
                                + "** — mục tiêu **" + request.getTargetQuantity() + " " + request.getUnitCode()
                                + "**, giá **" + request.getPricePerUnit() + "đ/" + request.getUnitCode()
                                + "**. Hạn chót: " + request.getDeadline()
                );
            }
        }

        logger.info("Bundle created: {} in HTX_SHOP {} by manager {}", saved.getId(), htxShop.getId(), managerId);
        return bundleMapper.toBundleDto(saved);
    }

    /**
     * 2. Cancel Bundle (chỉ OPEN/FULL → CANCELLED).
     */
    @Override
    @Transactional
    public BundleResponseDto cancelBundle(UUID bundleId, UUID managerId) {
        CooperativeBundle bundle = findBundleOrThrow(bundleId);
        verifyBundleManager(bundle, managerId);

        if (bundle.getStatus() != BundleStatus.OPEN && bundle.getStatus() != BundleStatus.FULL) {
            throw new AppException("Chỉ có thể hủy Bundle đang OPEN hoặc FULL", HttpStatus.BAD_REQUEST);
        }

        bundle.setStatus(BundleStatus.CANCELLED);

        // Release tất cả ACTIVE pledges
        List<BundlePledge> activePledges = pledgeRepository.findByBundle_IdAndStatus(bundleId, PledgeStatus.ACTIVE);
        for (BundlePledge pledge : activePledges) {
            pledge.setStatus(PledgeStatus.EXPIRED);

            telegramNotificationService.notify(
                    pledge.getFarmer().getId(),
                    NotificationType.BUNDLE_EXPIRED,
                    "❌ Bundle đã bị hủy",
                    "Bundle **" + bundle.getProductName() + "** đã bị hủy bởi quản lý HTX. "
                            + "Cam kết **" + pledge.getQuantity() + " " + bundle.getUnitCode() + "** của bạn đã được giải phóng."
            );
        }
        pledgeRepository.saveAll(activePledges);

        bundleRepository.save(bundle);
        logger.info("Bundle {} cancelled by manager {}", bundleId, managerId);
        return bundleMapper.toBundleDto(bundle);
    }

    /**
     * 3. ⭐ Confirm Bundle — Core business logic.
     *    Tính contribution_percent, estimated_revenue, tạo virtual Product.
     */
    @Override
    @Transactional
    public BundleResponseDto confirmBundle(UUID bundleId, UUID managerId) {
        CooperativeBundle bundle = findBundleOrThrow(bundleId);
        verifyBundleManager(bundle, managerId);

        if (bundle.getStatus() != BundleStatus.OPEN && bundle.getStatus() != BundleStatus.FULL) {
            throw new AppException("Chỉ có thể xác nhận Bundle đang OPEN hoặc FULL", HttpStatus.BAD_REQUEST);
        }

        if (bundle.getCurrentPledgedQuantity().compareTo(BigDecimal.ZERO) == 0) {
            throw new AppException("Bundle chưa có ai cam kết, không thể xác nhận", HttpStatus.BAD_REQUEST);
        }

        // ─── Tính toán doanh thu ───
        BigDecimal totalRevenue = bundle.getPricePerUnit().multiply(bundle.getCurrentPledgedQuantity());
        List<BundlePledge> activePledges = pledgeRepository.findByBundle_IdAndStatus(bundleId, PledgeStatus.ACTIVE);

        for (BundlePledge pledge : activePledges) {
            BigDecimal percent = pledge.getQuantity()
                    .divide(bundle.getCurrentPledgedQuantity(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            BigDecimal revenue = totalRevenue.multiply(pledge.getQuantity())
                    .divide(bundle.getCurrentPledgedQuantity(), 2, RoundingMode.HALF_UP);

            pledge.setContributionPercent(percent);
            pledge.setEstimatedRevenue(revenue);
            pledgeRepository.save(pledge);

            // Notify farmer
            telegramNotificationService.notify(
                    pledge.getFarmer().getId(),
                    NotificationType.BUNDLE_CONFIRMED,
                    "✅ Bundle đã xác nhận",
                    "Bundle **" + bundle.getProductName() + "** đã gom đủ **"
                            + bundle.getCurrentPledgedQuantity() + " " + bundle.getUnitCode()
                            + "**.\n\nĐóng góp của bạn: **" + pledge.getQuantity() + " " + bundle.getUnitCode()
                            + "** (**" + percent.setScale(2, RoundingMode.HALF_UP) + "%**).\n"
                            + "Doanh thu dự kiến: **" + formatVnd(revenue) + "**"
            );
        }

        bundle.setStatus(BundleStatus.CONFIRMED);
        bundleRepository.save(bundle);

        // ─── Tạo virtual Product cho buyer browse/checkout ───
        createBundleProduct(bundle);

        logger.info("Bundle {} confirmed. Total pledged: {}, revenue: {}", bundleId,
                bundle.getCurrentPledgedQuantity(), totalRevenue);
        return bundleMapper.toBundleDto(bundle);
    }

    // ═══════════════════════════════════════════════════════════════
    //  PLEDGE LIFECYCLE (FARMER / HTX_MEMBER)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Farmer đăng ký pledge vào Bundle.
     */
    @Override
    @Transactional
    public PledgeResponseDto createPledge(UUID bundleId, PledgeRequest request, UUID farmerId) {
        CooperativeBundle bundle = findBundleOrThrow(bundleId);
        User farmer = findUserOrThrow(farmerId);

        if (bundle.getStatus() != BundleStatus.OPEN) {
            throw new AppException("Gói gom đơn không còn nhận đăng ký", HttpStatus.BAD_REQUEST);
        }

        if (pledgeRepository.existsByBundle_IdAndFarmer_Id(bundleId, farmerId)) {
            throw new AppException("Bạn đã cam kết tham gia gói này rồi", HttpStatus.CONFLICT);
        }

        BigDecimal quantity = BigDecimal.valueOf(request.getQuantity());

        // Check min pledge
        if (bundle.getMinPledgeQuantity() != null && quantity.compareTo(bundle.getMinPledgeQuantity()) < 0) {
            throw new AppException("Số lượng tối thiểu là " + bundle.getMinPledgeQuantity()
                    + " " + bundle.getUnitCode(), HttpStatus.BAD_REQUEST);
        }

        // Check remaining capacity
        BigDecimal remaining = bundle.getTargetQuantity().subtract(bundle.getCurrentPledgedQuantity());
        if (quantity.compareTo(remaining) > 0) {
            throw new AppException("Số lượng vượt quá dung lượng còn lại: " + remaining
                    + " " + bundle.getUnitCode(), HttpStatus.BAD_REQUEST);
        }

        BundlePledge pledge = BundlePledge.builder()
                .bundle(bundle)
                .farmer(farmer)
                .quantity(quantity)
                .note(request.getNote())
                .status(PledgeStatus.ACTIVE)
                .build();
        pledgeRepository.save(pledge);

        // Update bundle progress
        BigDecimal newTotal = bundle.getCurrentPledgedQuantity().add(quantity);
        bundle.setCurrentPledgedQuantity(newTotal);

        if (newTotal.compareTo(bundle.getTargetQuantity()) >= 0) {
            bundle.setStatus(BundleStatus.FULL);

            // Notify manager that bundle is full
            Htx htx = bundle.getHtxShop().getHtx();
            if (htx.getManager() != null) {
                telegramNotificationService.notify(
                        htx.getManager().getId(),
                        NotificationType.BUNDLE_FULL,
                        "🎉 Bundle đã đầy",
                        "Bundle **" + bundle.getProductName() + "** đã gom đủ **"
                                + bundle.getTargetQuantity() + " " + bundle.getUnitCode()
                                + "**. Bạn có thể xác nhận ngay!"
                );
            }
        }
        bundleRepository.save(bundle);

        logger.info("Pledge created: farmer {} → bundle {} with {} {}", farmerId, bundleId, quantity, bundle.getUnitCode());
        return bundleMapper.toPledgeDto(pledge);
    }

    /**
     * Farmer rút pledge (chỉ khi Bundle còn OPEN).
     */
    @Override
    @Transactional
    public void withdrawPledge(UUID pledgeId, UUID farmerId) {
        BundlePledge pledge = pledgeRepository.findById(pledgeId)
                .orElseThrow(() -> new AppException("Không tìm thấy cam kết", HttpStatus.NOT_FOUND));

        if (!pledge.getFarmer().getId().equals(farmerId)) {
            throw new AppException("Bạn không có quyền rút cam kết này", HttpStatus.FORBIDDEN);
        }

        if (pledge.getStatus() != PledgeStatus.ACTIVE) {
            throw new AppException("Cam kết không còn hiệu lực", HttpStatus.BAD_REQUEST);
        }

        CooperativeBundle bundle = pledge.getBundle();
        if (bundle.getStatus() != BundleStatus.OPEN && bundle.getStatus() != BundleStatus.FULL) {
            throw new AppException("Chỉ có thể rút khi gói đang OPEN hoặc FULL", HttpStatus.BAD_REQUEST);
        }

        pledge.setStatus(PledgeStatus.WITHDRAWN);
        pledgeRepository.save(pledge);

        // Update bundle total
        bundle.setCurrentPledgedQuantity(bundle.getCurrentPledgedQuantity().subtract(pledge.getQuantity()));
        if (bundle.getStatus() == BundleStatus.FULL) {
            bundle.setStatus(BundleStatus.OPEN);
        }
        bundleRepository.save(bundle);

        logger.info("Pledge {} withdrawn by farmer {}", pledgeId, farmerId);
    }

    // ═══════════════════════════════════════════════════════════════
    //  SCHEDULER — Auto-expire
    // ═══════════════════════════════════════════════════════════════

    /**
     * Chuyển OPEN/FULL bundles quá deadline → EXPIRED.
     * Gọi bởi BundleScheduler mỗi ngày lúc 00:00.
     */
    @Override
    @Transactional
    public int expireOpenBundles() {
        List<BundleStatus> expirable = List.of(BundleStatus.OPEN, BundleStatus.FULL);
        List<CooperativeBundle> expired = bundleRepository.findByStatusInAndDeadlineBefore(expirable, LocalDate.now());

        List<BundlePledge> allPledgesToExpire = new java.util.ArrayList<>();

        for (CooperativeBundle bundle : expired) {
            bundle.setStatus(BundleStatus.EXPIRED);

            // Expire all active pledges
            List<BundlePledge> activePledges = pledgeRepository.findByBundle_IdAndStatus(bundle.getId(), PledgeStatus.ACTIVE);
            for (BundlePledge pledge : activePledges) {
                pledge.setStatus(PledgeStatus.EXPIRED);

                telegramNotificationService.notify(
                        pledge.getFarmer().getId(),
                        NotificationType.BUNDLE_EXPIRED,
                        "⏰ Bundle hết hạn",
                        "Bundle **" + bundle.getProductName() + "** đã hết hạn gom đơn. "
                                + "Cam kết **" + pledge.getQuantity() + " " + bundle.getUnitCode()
                                + "** của bạn đã được giải phóng."
                );
            }
            allPledgesToExpire.addAll(activePledges);

            logger.info("Bundle {} expired (deadline: {})", bundle.getId(), bundle.getDeadline());
        }

        if (!expired.isEmpty()) bundleRepository.saveAll(expired);
        if (!allPledgesToExpire.isEmpty()) pledgeRepository.saveAll(allPledgesToExpire);

        return expired.size();
    }

    // ═══════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Tạo "virtual Product" trong Shop của HTX_SHOP từ Bundle đã CONFIRMED.
     * Buyer sẽ browse & checkout product này qua flow bình thường.
     */
    private void createBundleProduct(CooperativeBundle bundle) {
        HtxShop htxShop = bundle.getHtxShop();

        // Ensure HTX_SHOP has a Shop entity
        Shop shop = htxShop.getShop();
        if (shop == null) {
            shop = createShopForHtxShop(htxShop);
        }

        // Resolve unit
        Unit unit = unitRepository.findByCode(bundle.getUnitCode())
                .orElseThrow(() -> new AppException(
                        "Đơn vị tính không hợp lệ: " + bundle.getUnitCode(), HttpStatus.BAD_REQUEST));

        // Tạo virtual product
        Product product = Product.builder()
                .shop(shop)
                .name(bundle.getProductName())
                .description(bundle.getDescription() != null ? bundle.getDescription()
                        : "Sản phẩm gom đơn từ HTX " + htxShop.getName())
                .category(bundle.getProductCategory())
                .unit(unit)
                .pricePerUnit(bundle.getPricePerUnit())
                .availableQuantity(bundle.getCurrentPledgedQuantity())
                .locationDetail(htxShop.getHtx().getProvince() + ", " + htxShop.getHtx().getDistrict())
                .status(ProductStatus.IN_SEASON)
                .bundleId(bundle.getId())
                .build();

        Product saved = productRepository.save(product);
        bundle.setProduct(saved);
        bundleRepository.save(bundle);

        logger.info("Virtual product {} created for bundle {}", saved.getId(), bundle.getId());
    }

    /**
     * Tạo HtxShop khi chưa có (auto-create khi tạo Bundle đầu tiên).
     */
    private HtxShop createHtxShop(Htx htx, User manager) {
        // Tạo Shop entity cho HTX
        Shop shop = Shop.builder()
                .owner(manager)
                .slug("htx-" + htx.getOfficialCode())
                .name("Gian hàng " + htx.getName())
                .province(htx.getProvince())
                .district(htx.getDistrict())
                .bio("Gian hàng sỉ của " + htx.getName())
                .build();
        shop = shopRepository.save(shop);

        HtxShop htxShop = HtxShop.builder()
                .htx(htx)
                .slug("htx-" + htx.getOfficialCode())
                .name("HTX " + htx.getName())
                .description("Gian hàng sỉ của " + htx.getName())
                .shop(shop)
                .build();

        HtxShop saved = htxShopRepository.save(htxShop);
        logger.info("HtxShop {} auto-created for HTX {}", saved.getId(), htx.getId());
        return saved;
    }

    /**
     * Tạo Shop entity cho HtxShop khi HtxShop đã tồn tại nhưng chưa có Shop.
     */
    private Shop createShopForHtxShop(HtxShop htxShop) {
        Htx htx = htxShop.getHtx();
        Shop shop = Shop.builder()
                .owner(htx.getManager())
                .slug(htxShop.getSlug())
                .name(htxShop.getName())
                .province(htx.getProvince())
                .district(htx.getDistrict())
                .bio(htxShop.getDescription())
                .build();
        shop = shopRepository.save(shop);

        htxShop.setShop(shop);
        htxShopRepository.save(htxShop);

        logger.info("Shop entity created for existing HtxShop {}", htxShop.getId());
        return shop;
    }

    private CooperativeBundle findBundleOrThrow(UUID bundleId) {
        return bundleRepository.findById(bundleId)
                .orElseThrow(() -> new AppException("Không tìm thấy gói gom đơn", HttpStatus.NOT_FOUND));
    }

    private User findUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
    }

    private void verifyBundleManager(CooperativeBundle bundle, UUID managerId) {
        Htx htx = bundle.getHtxShop().getHtx();
        if (htx.getManager() == null || !htx.getManager().getId().equals(managerId)) {
            throw new AppException("Bạn không phải quản lý HTX sở hữu Bundle này", HttpStatus.FORBIDDEN);
        }
    }

    private String formatVnd(BigDecimal amount) {
        if (amount == null) return "0 VNĐ";
        return String.format("%,.0f VNĐ", amount);
    }
}
