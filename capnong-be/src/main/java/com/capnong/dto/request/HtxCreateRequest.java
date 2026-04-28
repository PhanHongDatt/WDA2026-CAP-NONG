package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class HtxCreateRequest {

    @NotBlank(message = "Tên HTX không được để trống")
    @Size(max = 255)
    private String name;

    @NotBlank(message = "Mã HTX không được để trống")
    @Pattern(regexp = "^\\d{8,12}$", message = "Mã HTX phải gồm 8–12 chữ số")
    private String officialCode;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    @Size(max = 100)
    private String province;

    @NotBlank(message = "Quận/Huyện không được để trống")
    @Size(max = 100)
    private String ward;

    private String description;

    /** URL ảnh quyết định thành lập (optional) */
    private String documentUrl;
}
