package com.capnong.mapper;

import com.capnong.dto.response.ProductResponse;
import com.capnong.model.Product;
import com.capnong.model.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "shopSlug", source = "shop.slug")
    @Mapping(target = "shopName", source = "shop.name")
    @Mapping(target = "category", expression = "java(product.getCategory().name())")
    @Mapping(target = "status", expression = "java(product.getStatus().name())")
    @Mapping(target = "farmingMethod", expression = "java(product.getFarmingMethod().name())")
    @Mapping(target = "unitCode", source = "unit.code")
    @Mapping(target = "unitName", source = "unit.displayName")
    @Mapping(target = "images", source = "images", qualifiedByName = "mapImages")
    ProductResponse toProductResponse(Product product);

    @Named("mapImages")
    default List<ProductResponse.ProductImageResponse> mapImages(List<ProductImage> images) {
        if (images == null) return List.of();
        return images.stream()
                .map(img -> ProductResponse.ProductImageResponse.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .sortOrder(img.getSortOrder())
                        .build())
                .collect(Collectors.toList());
    }
}
