package com.capnong.mapper;

import com.capnong.dto.response.ProductResponse;
import com.capnong.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "shopSlug", source = "shop.slug")
    @Mapping(target = "shopName", source = "shop.name")
    ProductResponse toProductResponse(Product product);
}
