package com.capnong.dto.response;

import java.util.UUID;

import com.capnong.model.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class OrderResponse {

    private UUID id;
    private String orderNumber;
    private UUID userId;
    private String guestEmail;
    private String guestPhone;
    private String guestName;
    private String streetAddress;
    private String wardCode;
    private String wardName;
    private String provinceCode;
    private String provinceName;
    private String orderNotes;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private Boolean isMerged;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
