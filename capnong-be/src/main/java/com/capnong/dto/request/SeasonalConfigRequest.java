package com.capnong.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SeasonalConfigRequest {
    @NotBlank(message = "Tỉnh/thành không được để trống")
    private String province;

    @NotBlank(message = "Danh mục sản phẩm không được để trống")
    private String productCategory;

    @NotNull(message = "Tháng bắt đầu không được để trống")
    @Min(value = 1, message = "Tháng bắt đầu phải từ 1-12")
    @Max(value = 12, message = "Tháng bắt đầu phải từ 1-12")
    private Short startMonth;

    @NotNull(message = "Tháng kết thúc không được để trống")
    @Min(value = 1, message = "Tháng kết thúc phải từ 1-12")
    @Max(value = 12, message = "Tháng kết thúc phải từ 1-12")
    private Short endMonth;

    private String note;
}
