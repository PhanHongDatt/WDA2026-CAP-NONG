package com.capnong.service;

import com.capnong.exception.AppException;
import com.capnong.model.Shop;
import com.capnong.repository.ShopRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ShopService {

    private final ShopRepository shopRepository;

    public ShopService(ShopRepository shopRepository) {
        this.shopRepository = shopRepository;
    }

    public Shop getBySlug(String slug) {
        return shopRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException("Không tìm thấy gian hàng", HttpStatus.NOT_FOUND));
    }

    public Shop getByOwnerId(UUID ownerId) {
        return shopRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new AppException("Bạn chưa có gian hàng", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Shop createShop(UUID ownerId, Shop shop) {
        if (shopRepository.existsByOwnerId(ownerId)) {
            throw new AppException("Bạn đã có gian hàng rồi", HttpStatus.CONFLICT);
        }
        if (shopRepository.existsBySlug(shop.getSlug())) {
            throw new AppException("Slug đã tồn tại", HttpStatus.CONFLICT);
        }
        shop.setOwnerId(ownerId);
        return shopRepository.save(shop);
    }

    @Transactional
    public Shop updateShop(UUID ownerId, Shop updates) {
        Shop shop = shopRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new AppException("Bạn chưa có gian hàng", HttpStatus.NOT_FOUND));

        if (updates.getName() != null) shop.setName(updates.getName());
        if (updates.getBio() != null) shop.setBio(updates.getBio());
        if (updates.getProvince() != null) shop.setProvince(updates.getProvince());
        if (updates.getDistrict() != null) shop.setDistrict(updates.getDistrict());
        if (updates.getYearsExperience() != null) shop.setYearsExperience(updates.getYearsExperience());
        if (updates.getFarmAreaM2() != null) shop.setFarmAreaM2(updates.getFarmAreaM2());
        if (updates.getAvatarUrl() != null) shop.setAvatarUrl(updates.getAvatarUrl());
        if (updates.getCoverUrl() != null) shop.setCoverUrl(updates.getCoverUrl());

        return shopRepository.save(shop);
    }
}
