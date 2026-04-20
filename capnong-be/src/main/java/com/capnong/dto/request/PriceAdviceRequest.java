package com.capnong.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PriceAdviceRequest {
    @JsonProperty("productName")
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;

    @JsonProperty("category")
    private String category;

    @JsonProperty("province")
    private String province;

    @JsonProperty("currentPrice")
    private Double currentPrice;
}
