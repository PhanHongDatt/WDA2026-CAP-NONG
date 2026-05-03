package com.capnong.dto.request;

import com.capnong.model.enums.ProductCategory;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BundleCreateRequest {
    @NotNull(message = "Loại sản phẩm không được để trống")
    private ProductCategory productCategory;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;

    @NotBlank(message = "Đơn vị tính không được để trống")
    private String unitCode;

    @NotNull(message = "Mục tiêu sản lượng không được để trống")
    @Positive(message = "Mục tiêu sản lượng phải lớn hơn 0")
    private Double targetQuantity;

    @NotNull(message = "Giá không được để trống")
    @Positive(message = "Giá phải lớn hơn 0")
    private Double pricePerUnit;

    @NotNull(message = "Hạn chót không được để trống")
    @FutureOrPresent(message = "Hạn chót phải từ hôm nay trở đi, không được chọn ngày trong quá khứ")
    private LocalDate deadline;

    private String description;
    private Double minPledgeQuantity;
}
