package com.capnong.dto.request;

import com.capnong.model.enums.FarmingMethod;
import com.capnong.model.enums.ProductCategory;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductCreateRequest {
    @NotBlank private String name;
    private String description;
    @NotNull private ProductCategory category;
    @NotBlank private String unitCode;
    @NotNull @Positive private Double pricePerUnit;
    @NotNull @Positive private Double availableQuantity;
    private LocalDate harvestDate;
    private LocalDate availableFrom;
    private FarmingMethod farmingMethod;
    private Boolean pesticideFree;
    private String locationDetail;
    @Size(max = 10) private List<String> images;
}
