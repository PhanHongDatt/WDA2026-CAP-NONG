package com.capnong.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorDto {
    private String code;
    private String message;
    private LocalDateTime timestamp;
    private Object details;

    public static ApiErrorDto of(String code, String message) {
        return ApiErrorDto.builder()
                .code(code)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
