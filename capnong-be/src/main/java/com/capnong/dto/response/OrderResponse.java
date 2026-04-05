package com.capnong.dto.response;

import com.capnong.model.enums.OrderStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class OrderResponse {
    private UUID id;
    private String orderNumber;
    private Long userId;
    private String guestEmail;
    private String guestPhone;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private Boolean isMerged;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
