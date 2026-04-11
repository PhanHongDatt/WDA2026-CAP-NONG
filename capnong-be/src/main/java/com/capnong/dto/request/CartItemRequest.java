package com.capnong.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CartItemRequest {
    @NotNull private UUID productId;
    @NotNull @Positive private Double quantity;
}
