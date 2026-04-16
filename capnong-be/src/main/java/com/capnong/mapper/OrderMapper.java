package com.capnong.mapper;

import com.capnong.dto.response.OrderItemResponse;
import com.capnong.dto.response.OrderResponse;
import com.capnong.model.Order;
import com.capnong.model.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "items", ignore = true)
    OrderResponse toOrderResponse(Order order);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    OrderItemResponse toOrderItemResponse(OrderItem orderItem);
}
