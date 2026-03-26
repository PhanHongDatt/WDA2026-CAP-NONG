// src/main/java/com/capnong/service/ShopService.java
package com.capnong.service;

import com.capnong.dto.request.ShopCreateRequest;
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

    @Transactional
    public Shop createShop(ShopCreateRequest request, String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (shopRepository.existsByOwnerId(owner.getId())) {
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
                .build();
        return shopRepository.save(shop);
    }

    @Transactional(readOnly = true)
    public Shop getShopBySlug(String slug) {
        return shopRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "slug", slug));
    }

    @Transactional
    public Shop updateShop(String slug, ShopCreateRequest request, String username) {
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

        return shopRepository.save(shop);
    }
}