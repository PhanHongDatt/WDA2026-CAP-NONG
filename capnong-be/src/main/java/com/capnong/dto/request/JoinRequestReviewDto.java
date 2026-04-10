package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinRequestReviewDto {

    @NotBlank(message = "Hành động không được để trống (APPROVE / REJECT)")
    private String action; // "APPROVE" or "REJECT"

    private String note;
}
