package com.capnong.mapper;

import com.capnong.dto.response.CartItemResponse;
import com.capnong.dto.response.CartResponse;
import com.capnong.model.Cart;
import com.capnong.model.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "userId", source = "user.id")
    CartResponse toCartResponse(Cart cart);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "pricePerUnit", source = "product.pricePerUnit")
    @Mapping(target = "shopName", source = "product.shop.name")
    @Mapping(target = "imageUrl", expression = "java(cartItem.getProduct().getImages() != null && !cartItem.getProduct().getImages().isEmpty() ? cartItem.getProduct().getImages().get(0).getUrl() : null)")
    CartItemResponse toCartItemResponse(CartItem cartItem);
}
