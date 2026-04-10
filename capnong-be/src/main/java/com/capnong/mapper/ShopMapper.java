package com.capnong.mapper;

import com.capnong.dto.response.ShopResponse;
import com.capnong.model.Shop;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ShopMapper {

    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "ownerUsername", source = "owner.username")
    @Mapping(target = "ownerFullName", source = "owner.fullName")
    @Mapping(target = "ownerAvatarUrl", source = "owner.avatarUrl")
    ShopResponse toShopResponse(Shop shop);
}
