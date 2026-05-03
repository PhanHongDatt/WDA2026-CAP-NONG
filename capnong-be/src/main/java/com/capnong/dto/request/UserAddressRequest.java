package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UserAddressRequest {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 150)
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 20)
    private String phone;

    @NotBlank(message = "Địa chỉ đường không được để trống")
    private String street;

    @NotBlank(message = "Quận/Huyện không được để trống")
    @Size(max = 100)
    private String ward;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    @Size(max = 100)
    private String province;

    @Builder.Default
    private Boolean isDefault = false;
}
