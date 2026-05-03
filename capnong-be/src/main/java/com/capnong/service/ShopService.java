package com.capnong.service;

import com.capnong.dto.request.ShopCreateRequest;
import com.capnong.dto.response.ShopResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface ShopService {
    ShopResponse createShop(ShopCreateRequest request, String username);
    ShopResponse getShopBySlug(String slug);
    ShopResponse updateShop(String slug, ShopCreateRequest request, String username);
    ShopResponse getMyShop(String username);
    java.util.List<ShopResponse> getAllMyShops(String username);
    void softDeleteShop(String slug, String username);
    String getShopSlugByUsername(String username);
    Page<ShopResponse> getAllShops(Boolean featured, Pageable pageable);
    ShopResponse uploadShopImage(String slug, String type, MultipartFile file, String username);
}