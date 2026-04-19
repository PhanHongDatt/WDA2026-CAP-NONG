package com.capnong.service.impl;

import com.capnong.dto.request.SeasonalConfigRequest;
import com.capnong.dto.response.SeasonalConfigResponse;
import com.capnong.exception.AppException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.model.Product;
import com.capnong.model.SeasonalConfig;
import com.capnong.model.User;
import com.capnong.model.enums.ConfiguredBy;
import com.capnong.model.enums.ProductCategory;
import com.capnong.model.enums.ProductStatus;
import com.capnong.repository.ProductRepository;
import com.capnong.repository.SeasonalConfigRepository;
import com.capnong.repository.UserRepository;
import com.capnong.service.SeasonalConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeasonalConfigServiceImpl implements SeasonalConfigService {

    private final SeasonalConfigRepository seasonalConfigRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    @CacheEvict(value = "seasonal_configs", allEntries = true)
    public SeasonalConfigResponse createConfig(SeasonalConfigRequest request, String username, boolean isAdmin) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        ProductCategory category = parseCategory(request.getProductCategory());
        ConfiguredBy configBy = isAdmin ? ConfiguredBy.ADMIN : ConfiguredBy.HTX_MANAGER;

        SeasonalConfig config = SeasonalConfig.builder()
                .province(request.getProvince())
                .productCategory(category)
                .startMonth(request.getStartMonth())
                .endMonth(request.getEndMonth())
                .configuredBy(configBy)
                .configuredByUser(user)
                .note(request.getNote())
                .build();

        return mapToResponse(seasonalConfigRepository.save(config));
    }

    @Override
    @Transactional
    @CacheEvict(value = "seasonal_configs", allEntries = true)
    public SeasonalConfigResponse updateConfig(UUID id, SeasonalConfigRequest request, String username) {
        SeasonalConfig config = seasonalConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SeasonalConfig", "id", id));

        config.setProvince(request.getProvince());
        config.setProductCategory(parseCategory(request.getProductCategory()));
        config.setStartMonth(request.getStartMonth());
        config.setEndMonth(request.getEndMonth());
        config.setNote(request.getNote());

        return mapToResponse(seasonalConfigRepository.save(config));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable("seasonal_configs")
    public List<SeasonalConfigResponse> getAllConfigs() {
        return seasonalConfigRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "seasonal_configs", key = "#province")
    public List<SeasonalConfigResponse> getConfigsByProvince(String province) {
        return seasonalConfigRepository.findByProvince(province).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "seasonal_configs", allEntries = true)
    public void deleteConfig(UUID id, String username) {
        SeasonalConfig config = seasonalConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SeasonalConfig", "id", id));
        config.softDelete(username);
        seasonalConfigRepository.save(config);
    }

    /**
     * Tính ProductStatus dựa trên cấu hình mùa vụ.
     * Priority: OUT_OF_STOCK > IN_SEASON > UPCOMING > OFF_SEASON
     */
    @Override
    public ProductStatus calculateProductStatus(String province, String categoryStr,
                                                 LocalDate harvestDate, LocalDate availableFrom,
                                                 BigDecimal quantity, LocalDate checkDate) {
        // OUT_OF_STOCK nếu hết hàng
        if (quantity != null && quantity.compareTo(BigDecimal.ZERO) <= 0) {
            return ProductStatus.OUT_OF_STOCK;
        }

        // UPCOMING nếu availableFrom trong tương lai (≤ 30 ngày)
        if (availableFrom != null && availableFrom.isAfter(checkDate) &&
            availableFrom.isBefore(checkDate.plusDays(30))) {
            return ProductStatus.UPCOMING;
        }

        // Check seasonal config
        ProductCategory category;
        try {
            category = ProductCategory.valueOf(categoryStr);
        } catch (Exception e) {
            return ProductStatus.UPCOMING; // fallback if category doesn't match
        }

        List<SeasonalConfig> configs = seasonalConfigRepository
                .findByProvinceAndProductCategory(province, category);

        if (configs.isEmpty()) {
            // Không có config → mặc định dựa trên harvestDate
            if (harvestDate != null && harvestDate.isAfter(checkDate)) {
                return ProductStatus.UPCOMING;
            }
            return ProductStatus.IN_SEASON; // Default nếu không có config
        }

        // Check trong khoảng mùa vụ (hỗ trợ cross-year: vd start=10, end=2)
        int currentMonth = checkDate.getMonthValue();
        for (SeasonalConfig config : configs) {
            if (isInSeason(currentMonth, config.getStartMonth(), config.getEndMonth())) {
                return ProductStatus.IN_SEASON;
            }
        }

        return ProductStatus.OFF_SEASON;
    }

    /**
     * Batch update trạng thái sản phẩm dựa trên seasonal config.
     * Được gọi bởi Cron Job hoặc thủ công.
     */
    @Override
    @Transactional
    public void runSeasonalStatusUpdate() {
        LocalDate today = LocalDate.now();
        List<Product> activeProducts = productRepository.findAllActive();

        List<Product> toUpdate = new ArrayList<>();
        for (Product product : activeProducts) {
            // Không dynamic update cho HIDDEN products
            if (product.getStatus() == ProductStatus.HIDDEN) continue;

            // Lấy province từ shop (đã JOIN FETCH, không N+1)
            String province = product.getShop().getProvince();

            ProductStatus newStatus = calculateProductStatus(
                    province,
                    product.getCategory().name(),
                    product.getHarvestDate(),
                    product.getAvailableFrom(),
                    product.getAvailableQuantity(),
                    today
            );

            if (product.getStatus() != newStatus) {
                log.info("Product {} status: {} → {}", product.getId(), product.getStatus(), newStatus);
                product.setStatus(newStatus);
                toUpdate.add(product);
            }
        }

        if (!toUpdate.isEmpty()) {
            productRepository.saveAll(toUpdate);
        }

        log.info("Seasonal status update completed: {}/{} products updated", toUpdate.size(), activeProducts.size());
    }

    // ─── Helpers ────────────────────────────────────────

    private boolean isInSeason(int currentMonth, int startMonth, int endMonth) {
        if (startMonth <= endMonth) {
            // Normal range: e.g. start=3, end=8 (Mar-Aug)
            return currentMonth >= startMonth && currentMonth <= endMonth;
        } else {
            // Cross-year range: e.g. start=10, end=2 (Oct-Feb)
            return currentMonth >= startMonth || currentMonth <= endMonth;
        }
    }

    private ProductCategory parseCategory(String category) {
        try {
            return ProductCategory.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new AppException("Danh mục không hợp lệ: " + category, HttpStatus.BAD_REQUEST);
        }
    }

    private SeasonalConfigResponse mapToResponse(SeasonalConfig config) {
        return SeasonalConfigResponse.builder()
                .id(config.getId())
                .province(config.getProvince())
                .productCategory(config.getProductCategory().name())
                .startMonth(config.getStartMonth())
                .endMonth(config.getEndMonth())
                .configuredBy(config.getConfiguredBy().name())
                .configuredByUserId(config.getConfiguredByUser().getId())
                .configuredByUsername(config.getConfiguredByUser().getUsername())
                .note(config.getNote())
                .updatedAt(config.getUpdatedAt())
                .build();
    }
}
