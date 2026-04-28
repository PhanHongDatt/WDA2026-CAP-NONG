package com.capnong.service.impl;

import com.capnong.dto.request.ShopCreateRequest;
import com.capnong.dto.response.ShopResponse;
import com.capnong.exception.AppException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.mapper.ShopMapper;
import com.capnong.model.Shop;
import com.capnong.model.User;
import com.capnong.repository.ShopRepository;
import com.capnong.repository.UserRepository;
import com.capnong.service.CloudinaryService;
import com.capnong.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShopServiceImpl implements ShopService {

    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final ShopMapper shopMapper;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public ShopResponse createShop(ShopCreateRequest request, String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (shopRepository.existsByOwner_IdAndIsHtxShop(owner.getId(), false)) {
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
                .ward(request.getWard())
                .bio(request.getBio())
                .yearsExperience(request.getYearsExperience())
                .farmAreaM2(request.getFarmAreaM2())
                .avatarUrl(request.getAvatarUrl())
                .coverUrl(request.getCoverUrl())
                .build();

        return shopMapper.toShopResponse(shopRepository.save(shop));
    }

    @Override
    @Transactional(readOnly = true)
    public ShopResponse getShopBySlug(String slug) {
        Shop shop = shopRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "slug", slug));
        try {
            return shopMapper.toShopResponse(shop);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            // Owner bị xóa hoặc không tồn tại → trả về response an toàn
            return ShopResponse.builder()
                    .id(shop.getId())
                    .name(shop.getName())
                    .slug(shop.getSlug())
                    .province(shop.getProvince())
                    .ward(shop.getWard())
                    .bio(shop.getBio())
                    .yearsExperience(shop.getYearsExperience())
                    .farmAreaM2(shop.getFarmAreaM2())
                    .avatarUrl(shop.getAvatarUrl())
                    .coverUrl(shop.getCoverUrl())
                    .ownerId(null)
                    .ownerUsername(null)
                    .ownerFullName(null)
                    .ownerAvatarUrl(null)
                    .build();
        }
    }

    @Override
    @Transactional
    public ShopResponse updateShop(String slug, ShopCreateRequest request, String username) {
        Shop shop = shopRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "slug", slug));

        if (!shop.getOwner().getUsername().equals(username)) {
            throw new AppException("Bạn không có quyền chỉnh sửa gian hàng này", HttpStatus.FORBIDDEN);
        }

        if (!shop.getSlug().equals(request.getSlug()) && shopRepository.existsBySlug(request.getSlug())) {
            throw new AppException("Slug (đường dẫn) mới đã tồn tại", HttpStatus.CONFLICT);
        }

        shop.setName(request.getName());
        shop.setSlug(request.getSlug());
        shop.setProvince(request.getProvince());
        shop.setWard(request.getWard());
        shop.setBio(request.getBio());
        shop.setYearsExperience(request.getYearsExperience());
        shop.setFarmAreaM2(request.getFarmAreaM2());
        shop.setAvatarUrl(request.getAvatarUrl());
        shop.setCoverUrl(request.getCoverUrl());

        return shopMapper.toShopResponse(shopRepository.save(shop));
    }

    @Override
    @Transactional(readOnly = true)
    public ShopResponse getMyShop(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
                
        Shop shop = shopRepository.findFirstByOwner_IdAndIsHtxShop(user.getId(), false)
                .orElseThrow(() -> new AppException("Bạn chưa có gian hàng cá nhân", HttpStatus.NOT_FOUND));
        return shopMapper.toShopResponse(shop);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShopResponse> getAllMyShops(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
                
        return shopRepository.findAllByOwner_Id(user.getId()).stream()
                .map(shopMapper::toShopResponse)
                .collect(Collectors.toList());
    }

    @Override
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

    @Override
    @Transactional(readOnly = true)
    public String getShopSlugByUsername(String username) {
        return shopRepository.findFirstByOwnerUsername(username)
                .map(Shop::getSlug)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ShopResponse> getAllShops(Boolean featured, Pageable pageable) {
        Page<Shop> shops;
        if (Boolean.TRUE.equals(featured)) {
            Pageable featuredPageable = PageRequest.of(
                    pageable.getPageNumber(), 
                    pageable.getPageSize(), 
                    Sort.by(Sort.Direction.DESC, "averageRating", "totalReviews")
            );
            shops = shopRepository.findAll(featuredPageable);
        } else {
            shops = shopRepository.findAll(pageable);
        }
        return shops.map(shopMapper::toShopResponse);
    }

    @Override
    @Transactional
    public ShopResponse uploadShopImage(String slug, String type, MultipartFile file, String username) {
        Shop shop = shopRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "slug", slug));

        if (!shop.getOwner().getUsername().equals(username)) {
            throw new AppException("Bạn không có quyền chỉnh sửa gian hàng này", HttpStatus.FORBIDDEN);
        }

        String folder = "capnong/shops/" + slug;
        String url = cloudinaryService.uploadImage(file, folder);

        if ("avatar".equalsIgnoreCase(type)) {
            shop.setAvatarUrl(url);
        } else if ("cover".equalsIgnoreCase(type)) {
            shop.setCoverUrl(url);
        } else {
            throw new AppException("Loại ảnh không hợp lệ. Chỉ chấp nhận: avatar, cover", HttpStatus.BAD_REQUEST);
        }

        return shopMapper.toShopResponse(shopRepository.save(shop));
    }
}
