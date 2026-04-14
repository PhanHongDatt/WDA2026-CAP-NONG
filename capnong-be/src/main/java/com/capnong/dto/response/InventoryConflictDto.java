package com.capnong.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class InventoryConflictDto {
    private UUID productId;
    private String productName;
    private BigDecimal requestedQuantity;
    private BigDecimal availableQuantity;
}
