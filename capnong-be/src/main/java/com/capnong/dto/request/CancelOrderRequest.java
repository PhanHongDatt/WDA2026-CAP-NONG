package com.capnong.dto.request;

import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CancelOrderRequest {
    private String reason;
}
