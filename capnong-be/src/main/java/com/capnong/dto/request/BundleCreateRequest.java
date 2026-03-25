package com.capnong.dto.request;

import com.capnong.model.enums.ProductCategory;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BundleCreateRequest {
    @NotNull private ProductCategory productCategory;
    @NotBlank private String productName;
    @NotBlank private String unitCode;
    @NotNull @Positive private Double targetQuantity;
    @NotNull @Positive private Double pricePerUnit;
    @NotNull @Future private LocalDate deadline;
    private String description;
    private Double minPledgeQuantity;
}
