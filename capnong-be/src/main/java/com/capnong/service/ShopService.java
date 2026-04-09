package com.capnong.service;

import com.capnong.dto.request.ShopCreateRequest;
import com.capnong.dto.response.ShopResponse;
import com.capnong.exception.AppException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.model.Shop;
import com.capnong.model.User;
import com.capnong.repository.ShopRepository;
import com.capnong.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShopService {
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

    public ShopService(ShopRepository shopRepository, UserRepository userRepository) {
        this.shopRepository = shopRepository;
        this.userRepository = userRepository;
    }

    @SuppressWarnings("null")
    @Transactional
    public ShopResponse createShop(ShopCreateRequest request, String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (shopRepository.existsByOwner_Id(owner.getId())) {
            throw new AppException("Người dùng này đã có gian hàng", HttpStatus.CONFLICT);
        }
        if (shopRepository.existsBySlug(request.getSlug())) {
            throw new AppException("Slug (đường dẫn) này đã tồn tại", HttpStatus.CONFLICT);
        }

        Shop shop = Shop.builder()
                .owner(owner)
                .name(request.getName())
                .slug(request.getSlug())
                .province(request.getProvince())
                .district(request.getDistrict())
                .bio(request.getBio())
                .yearsExperience(request.getYearsExperience())
                .farmAreaM2(request.getFarmAreaM2())
                .avatarUrl(request.getAvatarUrl())
                .coverUrl(request.getCoverUrl())
                .build();

        Shop saved = shopRepository.save(shop);
        return mapToShopResponse(saved);
    }

    @Transactional(readOnly = true)
    public ShopResponse getShopBySlug(String slug) {
        Shop shop = shopRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "slug", slug));
        return mapToShopResponse(shop);
    }

    @Transactional
    public ShopResponse updateShop(String slug, ShopCreateRequest request, String username) {
        Shop shop = shopRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "slug", slug));

        // RBAC Check: Chỉ chủ sở hữu mới được sửa
        if (!shop.getOwner().getUsername().equals(username)) {
            throw new AppException("Bạn không có quyền chỉnh sửa gian hàng này", HttpStatus.FORBIDDEN);
        }

        // Nếu đổi slug, kiểm tra trùng lặp
        if (!shop.getSlug().equals(request.getSlug()) && shopRepository.existsBySlug(request.getSlug())) {
            throw new AppException("Slug (đường dẫn) mới đã tồn tại", HttpStatus.CONFLICT);
        }

        shop.setName(request.getName());
        shop.setSlug(request.getSlug());
        shop.setProvince(request.getProvince());
        shop.setDistrict(request.getDistrict());
        shop.setBio(request.getBio());
        shop.setYearsExperience(request.getYearsExperience());
        shop.setFarmAreaM2(request.getFarmAreaM2());
        shop.setAvatarUrl(request.getAvatarUrl());
        shop.setCoverUrl(request.getCoverUrl());

        Shop saved = shopRepository.save(shop);
        return mapToShopResponse(saved);
    }

    @Transactional(readOnly = true)
    public ShopResponse getMyShop(String username) {
        Shop shop = shopRepository.findByOwnerUsername(username)
                .orElseThrow(() -> new AppException("Bạn chưa có gian hàng", HttpStatus.NOT_FOUND));
        return mapToShopResponse(shop);
    }

    @Transactional
    public void softDeleteShop(String slug, String username) {
        Shop shop = shopRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "slug", slug));

        if (!shop.getOwner().getUsername().equals(username)) {
            throw new AppException("Bạn không có quyền xóa gian hàng này", HttpStatus.FORBIDDEN);
        }

        shop.softDelete(username);
        shopRepository.save(shop);
    }

    /**
     * Lấy shop_slug theo username (dùng cho JWT claim).
     * Trả về null nếu user chưa có shop.
     */
    @Transactional(readOnly = true)
    public String getShopSlugByUsername(String username) {
        return shopRepository.findByOwnerUsername(username)
                .map(Shop::getSlug)
                .orElse(null);
    }

    private ShopResponse mapToShopResponse(Shop shop) {
        User owner = shop.getOwner();
        return ShopResponse.builder()
                .id(shop.getId())
                .slug(shop.getSlug())
                .name(shop.getName())
                .province(shop.getProvince())
                .district(shop.getDistrict())
                .bio(shop.getBio())
                .yearsExperience(shop.getYearsExperience())
                .farmAreaM2(shop.getFarmAreaM2())
                .avatarUrl(shop.getAvatarUrl())
                .coverUrl(shop.getCoverUrl())
                .averageRating(shop.getAverageRating())
                .totalReviews(shop.getTotalReviews())
                .createdAt(shop.getCreatedAt())
                .ownerId(owner.getId())
                .ownerUsername(owner.getUsername())
                .ownerFullName(owner.getFullName())
                .ownerAvatarUrl(owner.getAvatarUrl())
                .build();
    }
}