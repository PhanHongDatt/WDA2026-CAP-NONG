package com.capnong.dto.request;

import com.capnong.model.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UpdateSubOrderStatusRequest {
    @NotNull private OrderStatus status;
    private String cancelReason;
}
