package com.capnong.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PledgeRequest {
    @NotNull @Positive private Double quantity;
    private String note;
}
